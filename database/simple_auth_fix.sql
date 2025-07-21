-- Simple, direct fix for authentication issues
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create a simple profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1)
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Step 4: Create profile for your existing user
INSERT INTO public.profiles (id, display_name, username)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as display_name,
  split_part(au.email, '@', 1) as username
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.email = 'laagonzalez95@gmail.com';

-- Step 5: Verify everything is working
SELECT 'Trigger created:' as status, COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Profile exists for your user:' as status, COUNT(*) as count
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'laagonzalez95@gmail.com';
