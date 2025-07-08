-- Create followers table to implement user following/follower relationships
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  -- Prevent users from following themselves
  CONSTRAINT prevent_self_follow CHECK (follower_id != following_id)
);

-- Add RLS policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own follow relationships
CREATE POLICY followers_insert_policy ON followers
  FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Allow users to delete only their own follow relationships
CREATE POLICY followers_delete_policy ON followers
  FOR DELETE
  USING (follower_id = auth.uid());

-- Allow all authenticated users to read follow relationships
CREATE POLICY followers_select_policy ON followers
  FOR SELECT
  USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS followers_follower_id_idx ON followers(follower_id);
CREATE INDEX IF NOT EXISTS followers_following_id_idx ON followers(following_id);

COMMENT ON TABLE followers IS 'Implements user following/follower relationships for social features';
