-- Migration: Update existing prompt_templates table for create template dialog
-- Run this in your Supabase SQL editor or via CLI

-- 1. Update existing prompt_templates table structure
-- Rename columns one by one (PostgreSQL doesn't support multiple renames in one statement)
ALTER TABLE prompt_templates RENAME COLUMN content TO template;
ALTER TABLE prompt_templates RENAME COLUMN title TO description;

-- Drop unused columns
ALTER TABLE prompt_templates DROP COLUMN IF EXISTS body_md;
ALTER TABLE prompt_templates DROP COLUMN IF EXISTS summary;

-- 2. Add variables array column for simple variable storage (you already ran this)
-- ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS variables TEXT[] DEFAULT '{}';
-- ↑ Commented out since you already ran this successfully

-- 3. Update constraints for new field names
-- Drop old constraint if it exists
ALTER TABLE prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_title_check;

-- Add new constraints for renamed fields
ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_description_check 
  CHECK (length(description) >= 10 AND length(description) <= 500);

ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_template_check 
  CHECK (length(template) >= 10 AND length(template) <= 5000);

-- 4. Create auto-profile creation for new users
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate profile creation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-profile creation (only if it doesn't exist)
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- 5. Create function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(base_text TEXT, table_name TEXT DEFAULT 'prompt_templates')
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Create base slug from text (lowercase, replace spaces/special chars with hyphens)
  base_slug := lower(regexp_replace(trim(base_text), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Limit length to 50 characters
  base_slug := left(base_slug, 50);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name) 
    USING final_slug INTO slug_exists;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 6. Update RLS policies to work with profiles relationship
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON prompt_templates;

-- Create new policies that work with profiles
CREATE POLICY "Users can view their own templates" ON prompt_templates
  FOR SELECT USING (
    author_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own templates" ON prompt_templates
  FOR INSERT WITH CHECK (
    author_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own templates" ON prompt_templates
  FOR UPDATE USING (
    author_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own templates" ON prompt_templates
  FOR DELETE USING (
    author_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- 7. Create index on variables array for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_variables ON prompt_templates USING GIN (variables);

-- 8. Add helpful comments
COMMENT ON COLUMN prompt_templates.description IS 'User-entered description of what the template does';
COMMENT ON COLUMN prompt_templates.template IS 'The actual prompt template with {variables}';
COMMENT ON COLUMN prompt_templates.variables IS 'Array of variable names extracted from template';
COMMENT ON COLUMN prompt_templates.status IS 'draft or published - controlled by save draft vs create template buttons';
COMMENT ON COLUMN prompt_templates.visibility IS 'public, unlisted, or private - defaults to public for published templates';
