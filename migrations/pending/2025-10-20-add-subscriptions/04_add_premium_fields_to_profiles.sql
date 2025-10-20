-- Add premium-related fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP WITH TIME ZONE;

-- Create index for premium status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);


