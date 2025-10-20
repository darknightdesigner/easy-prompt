-- ============================================
-- VERIFICATION SCRIPT
-- ============================================
-- Run this after applying the migration to verify everything worked
-- ============================================

-- 1. Check all new tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('subscriptions', 'subscription_events', 'usage_tracking') 
    THEN '✅ Found'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'subscription_events', 'usage_tracking')
ORDER BY table_name;

-- 2. Check subscriptions table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 3. Check premium fields on profiles
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_premium', 'premium_since');

-- 4. List all helper functions
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_user_subscription_status',
  'check_can_save_template',
  'check_can_add_variable',
  'get_user_plan_limits',
  'check_template_variable_count',
  'get_user_usage_stats'
)
ORDER BY routine_name;

-- 5. Check RLS policies on subscriptions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'subscriptions';

-- 6. Verify template constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.prompt_templates'::regclass
AND conname LIKE '%template%';

-- 7. Count indexes created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  tablename IN ('subscriptions', 'subscription_events', 'usage_tracking')
  OR indexname LIKE 'idx_profiles_is_premium%'
)
ORDER BY tablename, indexname;

-- ============================================
-- QUICK SUMMARY
-- ============================================
SELECT 
  '📊 MIGRATION SUMMARY' as title,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('subscriptions', 'subscription_events', 'usage_tracking')) as new_tables,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name IN ('is_premium', 'premium_since')) as profile_fields_added,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN (
     'get_user_subscription_status',
     'check_can_save_template', 
     'check_can_add_variable',
     'get_user_plan_limits',
     'check_template_variable_count',
     'get_user_usage_stats'
   )) as helper_functions;


