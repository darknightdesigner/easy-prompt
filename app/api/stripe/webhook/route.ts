import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for webhook handler
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  console.log(`Processing event: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  // Log event
  if (event.data.object && 'metadata' in event.data.object) {
    const metadata = event.data.object.metadata as any;
    if (metadata?.supabase_user_id) {
      await supabaseAdmin.from('subscription_events').insert({
        user_id: metadata.supabase_user_id,
        event_type: event.type,
        stripe_event_id: event.id,
        data: event.data.object,
      });
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.subscription_data?.metadata?.supabase_user_id;
  if (!userId) return;
  
  // Subscription will be created/updated via subscription.created event
  console.log(`Checkout completed for user: ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;
  
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id,
    stripe_product_id: subscription.items.data[0]?.price.product as string,
    status: subscription.status,
    plan_type: subscription.status === 'active' ? 'premium' : 'free',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at 
      ? new Date(subscription.canceled_at * 1000).toISOString() 
      : null,
    trial_start: subscription.trial_start 
      ? new Date(subscription.trial_start * 1000).toISOString() 
      : null,
    trial_end: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString() 
      : null,
    updated_at: new Date().toISOString(),
  };
  
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id',
    });
  
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  // Update profile premium status
  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: subscription.status === 'active',
      premium_since: subscription.status === 'active' 
        ? new Date().toISOString() 
        : null,
    })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;
  
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_type: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  // Update profile
  await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: false,
    })
    .eq('id', userId);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Subscription status is already updated via subscription events
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string | null;
  if (!subscription) return;
  
  // Could send notification to user about failed payment
  console.log(`Payment failed for subscription: ${subscription}`);
}


