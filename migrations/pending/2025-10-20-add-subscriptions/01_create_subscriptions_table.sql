-- Create subscriptions table for tracking Stripe subscription data
CREATE TABLE IF NOT EXISTS public.subscriptions (
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON public.subscriptions(plan_type);

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
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


