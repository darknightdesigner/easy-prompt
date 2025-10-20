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


