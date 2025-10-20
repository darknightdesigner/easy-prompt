-- Create usage_tracking table for monitoring user limits
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
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


