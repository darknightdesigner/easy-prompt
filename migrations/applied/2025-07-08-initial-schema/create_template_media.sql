-- Create template_media table for future media attachments
CREATE TABLE IF NOT EXISTS template_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Path in Supabase storage
  media_type TEXT NOT NULL, -- 'image', 'video', etc.
  display_order INTEGER NOT NULL DEFAULT 0, -- For ordering multiple media items
  alt_text TEXT, -- For accessibility
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE template_media ENABLE ROW LEVEL SECURITY;

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
    EXECUTE format('CREATE POLICY template_media_owner_policy ON template_media
      USING (template_id IN (SELECT id FROM prompt_templates WHERE %I = auth.uid()))
      WITH CHECK (template_id IN (SELECT id FROM prompt_templates WHERE %I = auth.uid()))', 
      user_column, user_column);
  ELSE
    -- If we couldn't determine the user column, create a basic policy
    -- This will need to be updated later when the correct column is known
    CREATE POLICY template_media_owner_policy ON template_media
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
    EXECUTE 'CREATE POLICY template_media_read_policy ON template_media
      FOR SELECT
      USING (template_id IN (SELECT id FROM prompt_templates WHERE visibility = ''public''));';
  ELSE
    -- If no visibility column, create a basic read policy
    CREATE POLICY template_media_read_policy ON template_media
      FOR SELECT
      USING (true);
      
    RAISE NOTICE 'Could not find visibility column in prompt_templates table. Created a permissive read policy.';
  END IF;
END
$$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS template_media_template_id_idx ON template_media(template_id);

-- Add the display_order index with a check to ensure the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'template_media' AND column_name = 'display_order'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS template_media_display_order_idx ON template_media(template_id, display_order)';
  ELSE
    RAISE NOTICE 'Column display_order not found in template_media table. Skipping index creation.';
  END IF;
END
$$;

COMMENT ON TABLE template_media IS 'Stores media attachments (images/videos) linked to templates';
