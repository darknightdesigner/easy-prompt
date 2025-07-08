-- Create engagements table to track aggregate engagement metrics per template
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  copies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id)
);

-- Add RLS policies
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

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
    EXECUTE 'CREATE POLICY engagements_read_policy ON engagements
      FOR SELECT
      USING (template_id IN (SELECT id FROM prompt_templates WHERE visibility = ''public''));';
  ELSE
    -- If no visibility column, create a basic read policy
    CREATE POLICY engagements_read_policy ON engagements
      FOR SELECT
      USING (true);
      
    RAISE NOTICE 'Could not find visibility column in prompt_templates table. Created a permissive read policy.';
  END IF;
END
$$;

-- Create functions to increment engagement counts
CREATE OR REPLACE FUNCTION increment_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO engagements (template_id, likes_count)
  VALUES (template_id, 1)
  ON CONFLICT (template_id)
  DO UPDATE SET 
    likes_count = engagements.likes_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_saves(template_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO engagements (template_id, saves_count)
  VALUES (template_id, 1)
  ON CONFLICT (template_id)
  DO UPDATE SET 
    saves_count = engagements.saves_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_shares(template_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO engagements (template_id, shares_count)
  VALUES (template_id, 1)
  ON CONFLICT (template_id)
  DO UPDATE SET 
    shares_count = engagements.shares_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_views(template_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO engagements (template_id, views_count)
  VALUES (template_id, 1)
  ON CONFLICT (template_id)
  DO UPDATE SET 
    views_count = engagements.views_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_copies(template_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO engagements (template_id, copies_count)
  VALUES (template_id, 1)
  ON CONFLICT (template_id)
  DO UPDATE SET 
    copies_count = engagements.copies_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS engagements_template_id_idx ON engagements(template_id);

COMMENT ON TABLE engagements IS 'Tracks aggregate engagement metrics (likes, saves, shares, views, copies) per template';
