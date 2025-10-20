import { stripe, PLANS } from './config';
import { supabaseServer } from '../supabaseServer';
import Stripe from 'stripe';

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const supabase = await supabaseServer();
  
  // Check if customer already exists
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();
  
  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }
  
  // Get user profile for customer data
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  // Create new Stripe customer
  const customer = await stripe.customers.create({
    metadata: {
      supabase_user_id: userId,
      username: profile.username,
    },
    name: profile.display_name,
  });
  
  // Store customer ID
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customer.id,
      status: 'incomplete',
      plan_type: 'free',
    });
  
  return customer.id;
}

/**
 * Create a checkout session for premium subscription
 */
export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const customerId = await getOrCreateStripeCustomer(userId);
  
  if (!PLANS.PREMIUM.priceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID is not configured');
  }
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS.PREMIUM.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        supabase_user_id: userId,
      },
    },
    allow_promotion_codes: true,
  });
  
  return session;
}

/**
 * Create a customer portal session for subscription management
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session.url;
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {
  const supabase = await supabaseServer();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return subscription;
}

/**
 * Check if user has premium access
 */
export async function hasActivePremium(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return false;
  
  return subscription.plan_type === 'premium' && 
         subscription.status === 'active';
}

/**
 * Get user's plan limits
 */
export async function getUserLimits(userId: string) {
  const isPremium = await hasActivePremium(userId);
  return isPremium ? PLANS.PREMIUM.limits : PLANS.FREE.limits;
}

/**
 * Check if user can save another template
 */
export async function canSaveTemplate(userId: string): Promise<boolean> {
  const supabase = await supabaseServer();
  const isPremium = await hasActivePremium(userId);
  
  // Premium users have unlimited saves
  if (isPremium) {
    return true;
  }
  
  // Check free user's limit
  const { count } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  return (count || 0) < PLANS.FREE.limits.maxSavedTemplates;
}

/**
 * Check if user can add more variables to a template
 */
export async function canAddVariable(
  userId: string,
  currentVariableCount: number
): Promise<boolean> {
  const isPremium = await hasActivePremium(userId);
  
  if (isPremium) {
    return true;
  }
  
  return currentVariableCount < PLANS.FREE.limits.maxVariablesPerTemplate;
}


