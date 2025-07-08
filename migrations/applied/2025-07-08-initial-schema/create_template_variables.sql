-- Create template_variables table to store variables extracted from templates
CREATE TABLE IF NOT EXISTS template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  question TEXT NOT NULL,
  default_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, variable_name)
);

-- Add RLS policies
ALTER TABLE template_variables ENABLE ROW LEVEL SECURITY;

-- First, check if prompt_templates table exists and what column it uses for user identification
DO $$
DECLARE
  user_column TEXT;
BEGIN
  -- Check if the table exists and what column it uses for user identification
  SELECT column_name INTO user_column
  FROM information_schema.columns 
  WHERE table_name = 'prompt_templates' 
  AND (column_name = 'user_id' OR column_name = 'author_id' OR column_name = 'creator_id')
  LIMIT 1;
  
  -- If we found a user column, create the policy with the correct column name
  IF user_column IS NOT NULL THEN
    EXECUTE format('CREATE POLICY template_variables_owner_policy ON template_variables
      USING (template_id IN (SELECT id FROM prompt_templates WHERE %I = auth.uid()))
      WITH CHECK (template_id IN (SELECT id FROM prompt_templates WHERE %I = auth.uid()))', 
      user_column, user_column);
  ELSE
    -- If we couldn't determine the user column, create a basic policy
    -- This will need to be updated later when the correct column is known
    CREATE POLICY template_variables_owner_policy ON template_variables
      USING (true)
      WITH CHECK (true);
    
    RAISE NOTICE 'Could not determine user identification column in prompt_templates table. Created a temporary permissive policy.';
  END IF;
END
$$;

-- Add read policy that checks for visibility column
DO $$
DECLARE
  has_visibility BOOLEAN;
BEGIN
  -- Check if the prompt_templates table has a visibility column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' AND column_name = 'visibility'
  ) INTO has_visibility;
  
  -- If visibility column exists, create policy based on it
  IF has_visibility THEN
    EXECUTE 'CREATE POLICY template_variables_read_policy ON template_variables
      FOR SELECT
      USING (template_id IN (SELECT id FROM prompt_templates WHERE visibility = ''public''));';
  ELSE
    -- If no visibility column, create a basic read policy
    CREATE POLICY template_variables_read_policy ON template_variables
      FOR SELECT
      USING (true);
      
    RAISE NOTICE 'Could not find visibility column in prompt_templates table. Created a permissive read policy.';
  END IF;
END
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS template_variables_template_id_idx ON template_variables(template_id);

COMMENT ON TABLE template_variables IS 'Stores variables extracted from prompt templates with associated questions and default values';
