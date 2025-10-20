-- Remove the template length upper limit to allow premium users unlimited length
-- This allows application-level enforcement based on subscription plan

-- First, check if the constraint exists and drop it
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


