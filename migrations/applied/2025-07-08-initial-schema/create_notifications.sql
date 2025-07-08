-- Create notifications table to store user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'follow', 'share', etc.
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who triggered the notification
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL, -- Related template if applicable
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to update (mark as read) only their own notifications
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_actor_id UUID,
  p_template_id UUID,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't create self-notifications
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, actor_id, template_id, message)
  VALUES (p_user_id, p_type, p_actor_id, p_template_id, p_message)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically create notifications

-- Like notification trigger
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_template_owner_id UUID;
  v_template_title TEXT;
  v_actor_username TEXT;
BEGIN
  -- Only create notification if this is a new like
  IF (TG_OP = 'INSERT' AND NEW.liked = true) OR 
     (TG_OP = 'UPDATE' AND OLD.liked = false AND NEW.liked = true) THEN
    
    -- Get template owner and title
    SELECT pt.user_id, pt.title INTO v_template_owner_id, v_template_title
    FROM prompt_templates pt
    WHERE pt.id = NEW.template_id;
    
    -- Get actor username
    SELECT username INTO v_actor_username
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
      v_template_owner_id,
      'like',
      NEW.user_id,
      NEW.template_id,
      v_actor_username || ' liked your template "' || v_template_title || '"'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_interaction_like_trigger
AFTER INSERT OR UPDATE ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

-- Follow notification trigger
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_username TEXT;
BEGIN
  -- Get actor username
  SELECT username INTO v_actor_username
  FROM auth.users
  WHERE id = NEW.follower_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    NEW.follower_id,
    NULL,
    v_actor_username || ' started following you'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_notification_trigger
AFTER INSERT ON followers
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- Add the is_read index with a check to ensure the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read) WHERE is_read = false';
  ELSE
    RAISE NOTICE 'Column is_read not found in notifications table. Skipping index creation.';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

COMMENT ON TABLE notifications IS 'Stores notifications for users related to social interactions (likes, follows, shares, etc.)';
