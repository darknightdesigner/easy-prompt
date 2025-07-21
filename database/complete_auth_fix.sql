-- Complete fix for authentication issues
-- This addresses both profile creation and avatar extraction

-- 1. Ensure the profile creation function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, avatar_url)
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
    ),
    public.extract_avatar_url_from_auth_user(new.id)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.extract_avatar_url_from_auth_user(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- 4. Fix any existing users without profiles
INSERT INTO public.profiles (id, display_name, username, avatar_url)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'display_name', 
    au.raw_user_meta_data->>'full_name', 
    split_part(au.email, '@', 1)
  ) as display_name,
  COALESCE(
    au.raw_user_meta_data->>'username', 
    split_part(au.email, '@', 1)
  ) as username,
  public.extract_avatar_url_from_auth_user(au.id) as avatar_url
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Verify the setup
SELECT 'Setup verification:' as status;
SELECT 
  'Trigger exists:' as check_name,
  CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as result
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'Users without profiles:' as check_name,
  COUNT(*)::text as result
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
