-- ============================================
-- EASYPROMPT STRIPE INTEGRATION - COMBINED MIGRATION
-- ============================================
-- This file combines all 6 migrations for easier execution
-- Execute this entire file in Supabase SQL Editor
-- Date: 2025-10-20
-- ============================================

-- ============================================
-- MIGRATION 01: Create Subscriptions Table
-- ============================================

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

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

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION 02: Create Subscription Events Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE NOT NULL,
  
  -- Event data
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON public.subscription_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event_id ON public.subscription_events(stripe_event_id);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Service role can manage subscription events" ON public.subscription_events;

-- Policy: Users can view their own events
CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all events
CREATE POLICY "Service role can manage subscription events"
  ON public.subscription_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- MIGRATION 03: Create Usage Tracking Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_tracking (
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Service role can manage usage" ON public.usage_tracking;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage usage
CREATE POLICY "Service role can manage usage"
  ON public.usage_tracking
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION 04: Add Premium Fields to Profiles
-- ============================================

-- Add premium-related fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP WITH TIME ZONE;

-- Create index for premium status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- ============================================
-- MIGRATION 05: Create Helper Functions
-- ============================================

-- Function: Get user subscription status
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

-- Function: Check if user can save more templates
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
  
  -- Check free user's limit (10 templates)
  SELECT COUNT(*) INTO v_saved_count
  FROM public.bookmarks
  WHERE user_id = p_user_id;
  
  RETURN v_saved_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can add more variables
CREATE OR REPLACE FUNCTION public.check_can_add_variable(
  p_user_id UUID,
  p_current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
BEGIN
  -- Get user's plan type
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  -- Premium users have unlimited variables
  IF v_plan_type = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Free users limited to 5 variables per template
  RETURN p_current_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's plan limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_type TEXT;
BEGIN
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  IF v_plan_type = 'premium' THEN
    RETURN jsonb_build_object(
      'maxSavedTemplates', -1, -- -1 represents unlimited
      'maxVariablesPerTemplate', -1,
      'maxTemplateLength', -1
    );
  ELSE
    RETURN jsonb_build_object(
      'maxSavedTemplates', 10,
      'maxVariablesPerTemplate', 5,
      'maxTemplateLength', 5000
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION 06: Adjust Template Constraints
-- ============================================

-- Remove the template length upper limit to allow premium users unlimited length
DO $$ 
BEGIN
  -- Drop the existing check constraint on template field
  IF EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_name = 'prompt_templates' 
    AND column_name = 'template'
  ) THEN
    ALTER TABLE public.prompt_templates 
    DROP CONSTRAINT IF EXISTS prompt_templates_template_check;
  END IF;
END $$;

-- Add back minimum length constraint only (10 characters minimum)
ALTER TABLE public.prompt_templates
DROP CONSTRAINT IF EXISTS prompt_templates_template_min_length_check;

ALTER TABLE public.prompt_templates
ADD CONSTRAINT prompt_templates_template_min_length_check 
CHECK (template IS NULL OR length(template) >= 10);

COMMENT ON CONSTRAINT prompt_templates_template_min_length_check 
ON public.prompt_templates IS 
'Enforces minimum 10 characters for templates. Maximum length enforced at application level based on subscription plan.';

-- Add helper function for checking template variable limits by template
CREATE OR REPLACE FUNCTION public.check_template_variable_count(
  p_user_id UUID,
  p_template_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_variable_count INTEGER;
BEGIN
  -- Get user's plan type
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  -- Premium users: unlimited variables
  IF v_plan_type = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Count variables for this specific template using the variables array
  SELECT array_length(variables, 1) 
  INTO v_variable_count
  FROM public.prompt_templates
  WHERE id = p_template_id;
  
  -- Free users: max 5 variables per template
  RETURN COALESCE(v_variable_count, 0) < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_template_variable_count IS 
'Checks if a user can add more variables to a specific template based on their subscription plan. Returns TRUE if allowed, FALSE if limit reached.';

-- Add helper function to get current usage stats for a user
CREATE OR REPLACE FUNCTION public.get_user_usage_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_type TEXT;
  v_saved_count INTEGER;
  v_templates_created INTEGER;
BEGIN
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  -- Count saved templates (bookmarks)
  SELECT COUNT(*) INTO v_saved_count
  FROM public.bookmarks
  WHERE user_id = p_user_id;
  
  -- Count created templates
  SELECT COUNT(*) INTO v_templates_created
  FROM public.prompt_templates
  WHERE author_id = p_user_id
  AND deleted_at IS NULL;
  
  RETURN jsonb_build_object(
    'planType', v_plan_type,
    'savedTemplates', COALESCE(v_saved_count, 0),
    'templatesCreated', COALESCE(v_templates_created, 0),
    'savedTemplatesLimit', CASE WHEN v_plan_type = 'premium' THEN -1 ELSE 10 END,
    'variablesPerTemplateLimit', CASE WHEN v_plan_type = 'premium' THEN -1 ELSE 5 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_usage_stats IS 
'Returns current usage statistics and limits for a user. Used for displaying progress bars and limit warnings. -1 indicates unlimited.';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify all tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('subscriptions', 'subscription_events', 'usage_tracking');
  
  IF table_count = 3 THEN
    RAISE NOTICE '✅ SUCCESS: All 3 new tables created successfully';
  ELSE
    RAISE WARNING '⚠️  WARNING: Expected 3 tables, found %', table_count;
  END IF;
END $$;

-- Verify premium fields added to profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('is_premium', 'premium_since')
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Premium fields added to profiles table';
  ELSE
    RAISE WARNING '⚠️  WARNING: Premium fields not found on profiles table';
  END IF;
END $$;

-- Verify functions created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname IN (
      'get_user_subscription_status',
      'check_can_save_template',
      'check_can_add_variable',
      'get_user_plan_limits',
      'check_template_variable_count',
      'get_user_usage_stats'
    )
  ) THEN
    RAISE NOTICE '✅ SUCCESS: All helper functions created';
  ELSE
    RAISE WARNING '⚠️  WARNING: Some helper functions may be missing';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE 'Tables created: subscriptions, subscription_events, usage_tracking';
  RAISE NOTICE 'Profile fields added: is_premium, premium_since';
  RAISE NOTICE 'Helper functions: 6 total';
  RAISE NOTICE '========================================';
END $$;

