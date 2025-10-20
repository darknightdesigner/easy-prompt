# Stripe Payment Integration Plan for EasyPrompt

**Document Version:** 1.0  
**Date:** October 20, 2025  
**Project:** EasyPrompt - Prompt Template Management Platform

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Project Status & Readiness Assessment](#current-project-status--readiness-assessment)
3. [Pricing Model Definition](#pricing-model-definition)
4. [Stripe Documentation & Resources](#stripe-documentation--resources)
5. [Database Schema Changes Required](#database-schema-changes-required)
6. [Implementation Plan](#implementation-plan)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

---

## Project Overview

EasyPrompt is a Next.js 15-based platform for creating, sharing, and managing AI prompt templates. The application uses:

- **Frontend Framework:** Next.js 15.3.3 (App Router)
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **UI Framework:** React 19 with Radix UI components
- **Styling:** Tailwind CSS
- **Deployment Target:** Vercel (implied from project structure)

### Current Features
- User authentication and profiles
- Prompt template creation and management
- Template variables and customization
- Social features (likes, saves, shares, follows)
- User engagement tracking
- Template discovery feed

---

## Current Project Status & Readiness Assessment

### ✅ Ready Components

1. **Authentication System**
   - Supabase Auth is fully configured (`lib/supabaseServer.ts`, `lib/supabaseBrowser.ts`)
   - User profiles table exists with proper foreign key relationships
   - Server-side and client-side auth helpers are in place

2. **Database Infrastructure**
   - PostgreSQL via Supabase with comprehensive schema
   - Existing tables: `profiles`, `prompt_templates`, `user_interactions`, `bookmarks`, etc.
   - Row Level Security (RLS) likely configured in Supabase

3. **User Management**
   - User profile system with usernames and display names
   - User-specific data storage capabilities

4. **API Route Structure**
   - Next.js App Router with proper server/client separation
   - Existing API patterns in `utils/supabase.ts`

### ⚠️ Missing Components for Stripe Integration

1. **Payment Infrastructure**
   - No Stripe SDK installed
   - No payment-related database tables
   - No subscription status tracking
   - No usage limit enforcement

2. **Environment Variables**
   - Need to add Stripe API keys
   - Need to configure Stripe webhook secrets

3. **Middleware/Guards**
   - No subscription-based access control
   - No usage limit enforcement logic

### 📋 Prerequisites Checklist

- [x] HTTPS enabled (Vercel provides this automatically)
- [x] User authentication system
- [x] Database for storing subscription data
- [x] Server-side API capabilities
- [ ] Stripe account created
- [ ] Stripe API keys obtained
- [ ] PCI compliance considerations (handled by Stripe Checkout)
- [ ] Webhook endpoint infrastructure

---

## Pricing Model Definition

### Freemium Model Structure

#### **Free Plan (Default)**

**Price:** $0/month

**Features:**
- ✅ Create and publish unlimited templates
- ✅ Basic template variables (limited to 5 per template)
- ✅ Save up to 10 templates to bookmarks
- ✅ View and use community templates
- ✅ Basic profile customization
- ✅ Follow other users
- ❌ No priority support
- ❌ No advanced analytics

**Limits Enforcement:**
```javascript
FREE_PLAN_LIMITS = {
  maxSavedTemplates: 10,
  maxVariablesPerTemplate: 5,
  maxTemplateLength: 5000, // characters
}
```

#### **Premium Plan**

**Price:** $5.00/month (billed monthly)

**Stripe Price ID:** `price_xxxxxxxxxxxxx` (to be created)

**Features:**
- ✅ Unlimited saved templates (bookmarks)
- ✅ Unlimited variables per template
- ✅ Unlimited template length
- ✅ Advanced template analytics
- ✅ Priority customer support
- ✅ Export templates
- ✅ Custom profile badge
- ✅ Early access to new features
- ✅ Remove EasyPrompt branding (optional)

**Value Proposition:**
- Power users who create complex prompts with many variables
- Users building template libraries
- Professional prompt engineers

### Upgrade Path

**Trigger Points for Conversion:**
1. When user hits 8/10 saved templates → Show upgrade prompt
2. When user tries to add 6th variable → Upgrade modal
3. After 30 days of free usage → Special offer
4. When viewing analytics → "Unlock with Premium"

---

## Stripe Documentation & Resources

### Official Stripe Documentation

#### Core Integration Guides
1. **Getting Started with Stripe**  
   https://docs.stripe.com/get-started  
   *Complete setup guide for new integrations*

2. **Stripe Subscriptions Overview**  
   https://docs.stripe.com/billing/subscriptions/overview  
   *Understanding subscription billing concepts*

3. **Designing a Subscriptions Integration**  
   https://docs.stripe.com/billing/subscriptions/designing-integration  
   *Best practices for subscription architecture*

4. **Checkout Session for Subscriptions**  
   https://docs.stripe.com/checkout/quickstart  
   *Pre-built checkout page for collecting payments*

5. **Customer Portal**  
   https://docs.stripe.com/customer-management/customer-portal  
   *Self-service portal for subscription management*

#### Webhook Implementation
6. **Webhooks Overview**  
   https://docs.stripe.com/webhooks  
   *Event-driven architecture for Stripe events*

7. **Webhook Event Types**  
   https://docs.stripe.com/api/events/types  
   *Complete reference of all webhook events*

8. **Testing Webhooks Locally**  
   https://docs.stripe.com/webhooks/test  
   *Using Stripe CLI for local development*

#### Security & Best Practices
9. **Integration Security Guide**  
   https://docs.stripe.com/security/guide  
   *Security best practices and compliance*

10. **API Keys**  
    https://docs.stripe.com/keys  
    *Understanding and managing API keys*

#### Testing
11. **Testing Guide**  
    https://docs.stripe.com/testing  
    *Test cards and scenarios*

#### Next.js Specific
12. **Next.js Integration Examples**  
    https://github.com/stripe/stripe-samples  
    *Official code examples and templates*

### Relevant API References

- **Subscription API:** https://docs.stripe.com/api/subscriptions
- **Customer API:** https://docs.stripe.com/api/customers
- **Checkout Session API:** https://docs.stripe.com/api/checkout/sessions
- **Price API:** https://docs.stripe.com/api/prices
- **Product API:** https://docs.stripe.com/api/products

### Recommended Reading

- **Freemium Pricing Strategy**  
  https://stripe.com/resources/more/freemium-pricing-explained
  
- **Subscription Lifecycle Management**  
  https://docs.stripe.com/billing/subscriptions/lifecycle

---

## Database Schema Changes Required

### New Tables to Create

#### 1. `subscriptions` Table

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Stripe identifiers
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  
  -- Subscription status
  status TEXT NOT NULL CHECK (status IN (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
  )),
  
  -- Plan information
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  
  -- Billing dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do anything (for webhook handlers)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  USING (auth.jwt() ->> 'role' = 'service_role');
```

#### 2. `subscription_events` Table (Audit Log)

```sql
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE NOT NULL,
  
  -- Event data
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT subscription_events_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own events
CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events
  FOR SELECT
  USING (auth.uid() = user_id);
```

#### 3. `usage_tracking` Table (Optional - for monitoring limits)

```sql
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Usage metrics
  saved_templates_count INTEGER DEFAULT 0,
  templates_created_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT usage_tracking_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Modify Existing Tables

#### Add Premium Badge to Profiles

```sql
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN premium_since TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_profiles_is_premium ON public.profiles(is_premium);
```

### Database Functions

#### Function: Get User Subscription Status

```sql
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT plan_type 
       FROM public.subscriptions 
       WHERE user_id = p_user_id 
       AND status IN ('active', 'trialing')
       LIMIT 1),
      'free'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Function: Check Usage Limits

```sql
CREATE OR REPLACE FUNCTION public.check_can_save_template(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_saved_count INTEGER;
BEGIN
  -- Get user's plan type
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  -- Premium users have unlimited saves
  IF v_plan_type = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Check free user's limit
  SELECT COUNT(*) INTO v_saved_count
  FROM public.bookmarks
  WHERE user_id = p_user_id;
  
  RETURN v_saved_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Implementation Plan

### Phase 1: Foundation Setup (Week 1)

#### Step 1.1: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

#### Step 1.2: Environment Variables

Add to `.env.local`:

```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs (will be set after creating products)
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add to Vercel environment variables (Production):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://easyprompt.co
```

#### Step 1.3: Create Stripe Configuration File

Create `lib/stripe/config.ts`:

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  appInfo: {
    name: 'EasyPrompt',
    version: '1.0.0',
    url: 'https://easyprompt.com',
  },
});

// Plan configuration
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      maxSavedTemplates: 10,
      maxVariablesPerTemplate: 5,
      maxTemplateLength: 5000,
    },
    features: [
      'Create unlimited templates',
      'Up to 10 saved templates',
      'Up to 5 variables per template',
      'Basic analytics',
      'Community access',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 500, // in cents
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    limits: {
      maxSavedTemplates: Infinity,
      maxVariablesPerTemplate: Infinity,
      maxTemplateLength: Infinity,
    },
    features: [
      'Everything in Free',
      'Unlimited saved templates',
      'Unlimited variables',
      'Advanced analytics',
      'Priority support',
      'Custom profile badge',
      'Export templates',
    ],
  },
} as const;

export type PlanType = 'free' | 'premium';
```

#### Step 1.4: Create Database Migration

Create `migrations/pending/2025-10-20-add-subscriptions/01_create_subscriptions_tables.sql`:

```sql
-- Add all the SQL from the "Database Schema Changes Required" section above
```

### Phase 2: Stripe Product Setup (Week 1)

#### Step 2.1: Create Products in Stripe Dashboard

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Products** → **Add Product**
3. Create Premium Product:
   - **Name:** EasyPrompt Premium
   - **Description:** Unlock unlimited templates, variables, and advanced features
   - **Pricing:**
     - Model: Standard pricing
     - Price: $5.00 USD
     - Billing period: Monthly
     - Payment type: Recurring
   - **Save** and copy the Price ID (`price_xxxxx`)
4. Update environment variables with the Price ID

#### Step 2.2: Configure Checkout Settings

1. In Stripe Dashboard → **Settings** → **Checkout**
2. Enable **Customer Portal**
3. Configure allowed actions:
   - ✅ Update payment method
   - ✅ Cancel subscription
   - ✅ View billing history
   - ❌ Update subscription (prevent self-downgrades for now)

### Phase 3: Backend Implementation (Week 1-2)

#### Step 3.1: Create Subscription Helper Functions

Create `lib/stripe/subscriptions.ts`:

```typescript
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
```

#### Step 3.2: Create API Routes

Create `app/api/stripe/create-checkout-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createCheckoutSession } from '@/lib/stripe/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get origin for redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    
    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      `${origin}/dashboard?checkout=success`,
      `${origin}/pricing?checkout=canceled`
    );
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

Create `app/api/stripe/create-portal-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createPortalSession } from '@/lib/stripe/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    const returnUrl = `${origin}/dashboard`;
    
    // Create portal session
    const portalUrl = await createPortalSession(user.id, returnUrl);
    
    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

Create `app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for webhook handler
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
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
  const userId = invoice.subscription_details?.metadata?.supabase_user_id;
  if (!userId) return;
  
  // Could send notification to user about failed payment
  console.log(`Payment failed for user: ${userId}`);
}
```

**Important:** Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Phase 4: Frontend Implementation (Week 2)

#### Step 4.1: Create Pricing Page

Create `app/pricing/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PLANS } from '@/lib/stripe/config';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const { url, error } = await response.json();
      
      if (error) {
        alert('Failed to start checkout. Please try again.');
        return;
      }
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <PageContainer.Content>
        <div className="max-w-6xl mx-auto py-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more power
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{PLANS.FREE.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${PLANS.FREE.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {PLANS.FREE.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                Current Plan
              </Button>
            </Card>
            
            {/* Premium Plan */}
            <Card className="p-8 relative border-primary shadow-lg">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{PLANS.PREMIUM.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${PLANS.PREMIUM.price / 100}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {PLANS.PREMIUM.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Upgrade to Premium'}
              </Button>
            </Card>
          </div>
        </div>
      </PageContainer.Content>
    </PageContainer>
  );
}
```

#### Step 4.2: Create Subscription Management Component

Create `components/subscription/subscription-manager.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SubscriptionManagerProps {
  subscription: {
    plan_type: 'free' | 'premium';
    status: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
  } | null;
}

export function SubscriptionManager({ subscription }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  
  const isPremium = subscription?.plan_type === 'premium' && 
                    subscription?.status === 'active';
  
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Subscription</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isPremium ? 'default' : 'secondary'}>
              {isPremium ? 'Premium' : 'Free'}
            </Badge>
            {subscription?.cancel_at_period_end && (
              <Badge variant="destructive">Canceling</Badge>
            )}
          </div>
        </div>
      </div>
      
      {isPremium && subscription?.current_period_end && (
        <p className="text-sm text-muted-foreground mb-4">
          {subscription.cancel_at_period_end 
            ? 'Your subscription will end on '
            : 'Next billing date: '}
          {new Date(subscription.current_period_end).toLocaleDateString()}
        </p>
      )}
      
      {isPremium ? (
        <Button
          variant="outline"
          onClick={handleManageSubscription}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </Button>
      ) : (
        <Button
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Upgrade to Premium'}
        </Button>
      )}
    </Card>
  );
}
```

#### Step 4.3: Add Usage Limits Enforcement

Create `lib/hooks/use-subscription.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export interface Subscription {
  plan_type: 'free' | 'premium';
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSubscription();
  }, []);
  
  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isPremium = subscription?.plan_type === 'premium' && 
                    subscription?.status === 'active';
  
  return {
    subscription,
    loading,
    isPremium,
    refresh: fetchSubscription,
  };
}
```

Create `app/api/subscription/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getUserSubscription } from '@/lib/stripe/subscriptions';

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ subscription: null });
    }
    
    const subscription = await getUserSubscription(user.id);
    
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
```

#### Step 4.4: Create Upgrade Prompts

Create `components/subscription/upgrade-prompt.tsx`:

```typescript
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function UpgradePrompt({
  open,
  onOpenChange,
  title = 'Upgrade to Premium',
  description = 'This feature is only available for Premium members. Upgrade now to unlock unlimited access.',
}: UpgradePromptProps) {
  const router = useRouter();
  
  const handleUpgrade = () => {
    router.push('/pricing');
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            View Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Phase 5: Webhook Setup (Week 2)

#### Step 5.1: Configure Stripe Webhook

1. **For Local Development:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to local endpoint
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   
   # Copy the webhook signing secret (whsec_...) to .env.local
   ```

2. **For Production (Vercel):**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook signing secret to Vercel environment variables

#### Step 5.2: Test Webhook Handling

```bash
# Send test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

### Phase 6: Testing & Quality Assurance (Week 3)

#### Test Scenarios

1. **Subscription Creation**
   - [ ] Free user can upgrade to Premium
   - [ ] Checkout session redirects properly
   - [ ] Subscription status updates in database
   - [ ] User profile shows premium badge
   - [ ] Email confirmation sent (if configured)

2. **Subscription Management**
   - [ ] Premium user can access billing portal
   - [ ] User can update payment method
   - [ ] User can cancel subscription
   - [ ] Cancellation persists until period end
   - [ ] User downgrades to free after period end

3. **Usage Limits**
   - [ ] Free users hit save limit at 10 templates
   - [ ] Premium users have unlimited saves
   - [ ] Upgrade prompt shows at limit
   - [ ] Variables limited to 5 for free users

4. **Edge Cases**
   - [ ] Payment failure handling
   - [ ] Subscription renewal
   - [ ] Trial period (if enabled)
   - [ ] Promo codes work correctly
   - [ ] Multiple tab/device scenarios

5. **Webhook Handling**
   - [ ] All webhook events logged
   - [ ] Failed webhooks retry properly
   - [ ] Database stays in sync with Stripe
   - [ ] Idempotency prevents duplicates

### Phase 7: Deployment (Week 3)

#### Pre-deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Stripe products created in live mode
- [ ] Webhook endpoint configured in Stripe
- [ ] Test all user flows in staging
- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Prepare customer support documentation

#### Deployment Steps

1. Apply database migrations to production Supabase
2. Deploy to Vercel
3. Configure production Stripe webhook
4. Test checkout flow with real card
5. Monitor logs for first 24 hours
6. Announce to beta users

---

## Security Considerations

### API Key Management
- ✅ Never commit API keys to git
- ✅ Use environment variables for all secrets
- ✅ Different keys for development and production
- ✅ Rotate keys if compromised

### Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement idempotency for webhook handlers
- ✅ Log failed webhook attempts

### Database Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Service role only used in webhook handlers
- ✅ User can only access their own subscription data
- ✅ Audit logs for subscription changes

### Payment Security
- ✅ Never store card details (Stripe handles this)
- ✅ Use Stripe Checkout (PCI compliant)
- ✅ SSL/TLS for all traffic
- ✅ Rate limiting on API endpoints

### User Privacy
- ✅ GDPR compliant data handling
- ✅ Clear refund policy
- ✅ Transparent pricing
- ✅ Easy cancellation process

---

## Testing Strategy

### Unit Tests

Create `__tests__/lib/stripe/subscriptions.test.ts`:

```typescript
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getUserLimits, hasActivePremium } from '@/lib/stripe/subscriptions';

describe('Subscription Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getUserLimits', () => {
    it('returns free limits for free users', async () => {
      const limits = await getUserLimits('free-user-id');
      expect(limits.maxSavedTemplates).toBe(10);
    });
    
    it('returns premium limits for premium users', async () => {
      const limits = await getUserLimits('premium-user-id');
      expect(limits.maxSavedTemplates).toBe(Infinity);
    });
  });
  
  describe('hasActivePremium', () => {
    it('returns true for active premium subscription', async () => {
      const result = await hasActivePremium('premium-user-id');
      expect(result).toBe(true);
    });
    
    it('returns false for canceled subscription', async () => {
      const result = await hasActivePremium('canceled-user-id');
      expect(result).toBe(false);
    });
  });
});
```

### Integration Tests

Test actual Stripe API calls in test mode:

```bash
# In __tests__/integration/stripe.test.ts
import { stripe } from '@/lib/stripe/config';

test('can create checkout session', async () => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_test_xxxxx', quantity: 1 }],
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  });
  
  expect(session).toBeDefined();
  expect(session.url).toContain('checkout.stripe.com');
});
```

### E2E Tests

Using Playwright or Cypress:

```typescript
// In e2e/subscription.spec.ts
test('complete subscription flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Go to pricing
  await page.goto('/pricing');
  
  // Click upgrade
  await page.click('text=Upgrade to Premium');
  
  // Should redirect to Stripe Checkout
  await expect(page).toHaveURL(/checkout.stripe.com/);
  
  // Fill test card
  await page.fill('[name="cardnumber"]', '4242424242424242');
  // ... rest of card details
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Should redirect back with success
  await expect(page).toHaveURL(/checkout=success/);
});
```

---

## Deployment Checklist

### Pre-Launch

- [ ] **Code Review**
  - [ ] All API routes have error handling
  - [ ] Webhook handler is idempotent
  - [ ] Database queries are optimized
  - [ ] RLS policies are correct

- [ ] **Environment Setup**
  - [ ] Production environment variables set
  - [ ] Stripe live mode keys configured
  - [ ] Webhook endpoint registered
  - [ ] Database migrations applied

- [ ] **Testing**
  - [ ] All unit tests passing
  - [ ] Integration tests with Stripe test mode
  - [ ] E2E tests for critical flows
  - [ ] Manual QA completed

- [ ] **Documentation**
  - [ ] API documentation updated
  - [ ] User help articles created
  - [ ] Internal runbook for support team
  - [ ] Refund policy published

### Launch Day

- [ ] Deploy to production
- [ ] Verify webhook connectivity
- [ ] Test checkout with real card ($0.50 test)
- [ ] Monitor error logs
- [ ] Check Stripe dashboard for events
- [ ] Announce to users

### Post-Launch Monitoring

- [ ] Set up alerts for:
  - [ ] Failed payments
  - [ ] Webhook failures
  - [ ] API errors
  - [ ] Subscription cancellations
- [ ] Daily metrics review:
  - [ ] New subscriptions
  - [ ] Churn rate
  - [ ] Failed payments
  - [ ] Revenue

---

## Next Steps After Implementation

### Phase 8: Analytics & Optimization

1. **Implement Analytics**
   - Track conversion funnel
   - A/B test pricing page
   - Monitor upgrade triggers
   - Analyze churn reasons

2. **User Feedback**
   - Survey premium users
   - Monitor support tickets
   - Track feature requests
   - Adjust pricing/features

### Phase 9: Feature Expansion

1. **Annual Billing**
   - Add yearly plan ($48/year = 20% discount)
   - Update Stripe products
   - Modify checkout flow

2. **Team Plans**
   - Multi-user subscriptions
   - Shared template libraries
   - Admin management

3. **Usage-Based Features**
   - API access metering
   - Template export limits
   - Advanced analytics

---

## Support & Resources

### Internal Resources
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Dashboard:** [Your Supabase URL]
- **Error Monitoring:** [Setup Sentry/LogRocket]
- **Analytics:** [Setup PostHog/Amplitude]

### External Resources
- **Stripe Support:** https://support.stripe.com
- **Stripe Status:** https://status.stripe.com
- **Stripe API Changelog:** https://stripe.com/docs/upgrades

### Emergency Contacts
- **Stripe Support:** support@stripe.com
- **On-Call Engineer:** [Your contact]
- **PagerDuty:** [If configured]

---

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating Stripe payments into EasyPrompt. The freemium model with a $5/month premium tier is well-suited for your prompt template platform, offering clear value differentiation while maintaining accessibility.

**Estimated Timeline:** 3 weeks for full implementation
**Estimated Cost:** $0 Stripe fees until revenue starts (2.9% + $0.30 per transaction)

**Key Success Metrics:**
- Free to Premium conversion rate > 5%
- Monthly churn rate < 10%
- Customer lifetime value > $60 (12 months)
- Payment success rate > 95%

Once implemented, continuously monitor user behavior and iterate on both features and pricing to maximize value for users and revenue for the platform.

---

**Document Status:** Ready for Implementation ✅  
**Last Updated:** October 20, 2025  
**Next Review:** After Phase 4 completion

