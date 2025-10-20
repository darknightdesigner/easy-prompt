-- Create subscription_events table for audit logging
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


