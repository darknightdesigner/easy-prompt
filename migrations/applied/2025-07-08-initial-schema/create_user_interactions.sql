-- Create user_interactions table to track individual user interactions with templates
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  liked BOOLEAN DEFAULT false,
  saved BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  last_viewed_at TIMESTAMPTZ,
  last_copied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Add RLS policies
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own interactions
CREATE POLICY user_interactions_crud_policy ON user_interactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS user_interactions_user_id_idx ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_template_id_idx ON user_interactions(template_id);
CREATE INDEX IF NOT EXISTS user_interactions_liked_idx ON user_interactions(liked) WHERE liked = true;
CREATE INDEX IF NOT EXISTS user_interactions_saved_idx ON user_interactions(saved) WHERE saved = true;

COMMENT ON TABLE user_interactions IS 'Tracks individual user interactions (liked, saved, shared, last viewed/copied timestamps) with templates';
