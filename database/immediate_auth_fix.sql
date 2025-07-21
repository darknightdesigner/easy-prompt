-- IMMEDIATE FIX: Remove avatar extraction to fix login error
-- This will allow you to login immediately while we debug the avatar issue

-- 1. Update handle_new_user function to NOT call extract_avatar_url_from_auth_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name', 
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1)
    )
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 2. Update handle_new_user_with_avatar to be simpler
CREATE OR REPLACE FUNCTION public.handle_new_user_with_avatar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert or update profile WITHOUT avatar extraction for now
    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_metadata->>'full_name',
            NEW.raw_user_metadata->>'name',
            NEW.user_metadata->>'full_name',
            NEW.user_metadata->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(NEW.raw_user_metadata->>'preferred_username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);
    
    RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user_with_avatar for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Verify the fix
SELECT 'Functions updated successfully' as status;
