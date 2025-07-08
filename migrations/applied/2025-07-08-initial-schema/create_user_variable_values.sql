-- Create user_variable_values table to store user-specific default values for variables
CREATE TABLE IF NOT EXISTS user_variable_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, variable_name)
);

-- Add RLS policies
ALTER TABLE user_variable_values ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own variable values
CREATE POLICY user_variable_values_crud_policy ON user_variable_values
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_variable_values_user_id_idx ON user_variable_values(user_id);
CREATE INDEX IF NOT EXISTS user_variable_values_variable_name_idx ON user_variable_values(variable_name);

COMMENT ON TABLE user_variable_values IS 'Stores user-specific default values for variables to support personalized autofill';
