# Database Setup Guide - Step by Step

## 🎯 Goal
Apply all subscription-related migrations to your Supabase database.

## ⏱️ Estimated Time: 5-10 minutes

---

## Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Easyprompt** project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** button

---

## Step 2: Execute Combined Migration

1. Open the file: `migrations/pending/2025-10-20-add-subscriptions/00_COMBINED_MIGRATION.sql`

2. **Copy the entire contents** of that file

3. **Paste** into the Supabase SQL Editor

4. Click **Run** (or press Cmd/Ctrl + Enter)

5. **Wait** for execution to complete (should take 5-10 seconds)

### ✅ What to Look For

After running, you should see messages like:
```
NOTICE: ✅ SUCCESS: All 3 new tables created successfully
NOTICE: ✅ SUCCESS: Premium fields added to profiles table
NOTICE: ✅ SUCCESS: All helper functions created
NOTICE: 🎉 MIGRATION COMPLETE!
```

### ⚠️ If You See Errors

**Common Error #1:** `function uuid_generate_v4() does not exist`
```sql
-- Run this first, then try the migration again
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Common Error #2:** `relation "auth.users" does not exist`
- Your Supabase project might not have auth enabled
- Check: Settings → Authentication → Ensure it's enabled

**Common Error #3:** `constraint already exists`
- This means you ran parts of the migration before
- Safe to ignore if tables were created successfully

---

## Step 3: Verify Migration Success

1. In SQL Editor, click **New Query**

2. Open the file: `migrations/pending/2025-10-20-add-subscriptions/VERIFY_MIGRATION.sql`

3. **Copy and paste** the entire contents

4. Click **Run**

### ✅ Expected Results

You should see:

**New Tables:** 3 (subscriptions, subscription_events, usage_tracking)
**Profile Fields Added:** 2 (is_premium, premium_since)
**Helper Functions:** 6

---

## Step 4: Visual Verification in Table Editor

1. Click **Table Editor** in the left sidebar

2. You should now see these new tables:
   - ✅ `subscriptions`
   - ✅ `subscription_events`
   - ✅ `usage_tracking`

3. Click on `subscriptions` table
   - Should have columns: id, user_id, stripe_customer_id, status, plan_type, etc.
   - Should be empty (no rows yet)

4. Click on `profiles` table
   - Scroll right to see new columns: `is_premium`, `premium_since`

---

## Step 5: Test a Helper Function

Let's test that the functions work! 

**If you have a test user**, get their UUID from the profiles table, then:

```sql
-- Replace 'YOUR-USER-UUID-HERE' with an actual user ID
SELECT public.get_user_subscription_status('YOUR-USER-UUID-HERE');
-- Should return: 'free'

SELECT public.check_can_save_template('YOUR-USER-UUID-HERE');
-- Should return: true (if they have < 10 bookmarks)

SELECT public.get_user_usage_stats('YOUR-USER-UUID-HERE');
-- Should return JSON with their current usage
```

**Don't have a user yet?** No problem! This test is optional. The functions will work when needed.

---

## 🎉 Success Checklist

- [ ] Combined migration ran without errors
- [ ] Verification script shows 3 tables, 2 fields, 6 functions
- [ ] Can see new tables in Table Editor
- [ ] Can see `is_premium` and `premium_since` columns on profiles
- [ ] (Optional) Helper function test returned expected results

---

## 📋 What We Just Created

### Tables
- **subscriptions** - Stores Stripe subscription data for each user
- **subscription_events** - Audit log of all subscription changes
- **usage_tracking** - Tracks user's usage metrics

### Database Functions
- `get_user_subscription_status()` - Returns 'free' or 'premium'
- `check_can_save_template()` - Enforces 10 saved template limit for free users
- `check_can_add_variable()` - Enforces 5 variable limit for free users
- `get_user_plan_limits()` - Returns limits as JSON
- `check_template_variable_count()` - Checks specific template's variable count
- `get_user_usage_stats()` - Returns complete usage stats for dashboard

### Profile Updates
- Added `is_premium` boolean field (default: false)
- Added `premium_since` timestamp field

---

## ❌ Troubleshooting

### "Cannot add foreign key constraint"
**Problem:** The referenced table or column doesn't exist
**Solution:** Check that `profiles` table and `auth.users` exist

### "Permission denied"
**Problem:** Using wrong Supabase account or wrong project
**Solution:** Verify you're in the correct project

### "Constraint already exists"
**Problem:** Migration was partially applied before
**Solution:** Check the verification script - if tables exist, you're good to go

### "Syntax error at or near..."
**Problem:** SQL wasn't copied completely
**Solution:** Make sure you copied the ENTIRE file contents

---

## 🚀 Next Steps

Once the database is set up successfully, move on to:

1. **Stripe Account Setup** - Create products and get API keys
2. **Environment Variables** - Configure .env.local
3. **Webhook Testing** - Install Stripe CLI and test locally

See `SETUP_INSTRUCTIONS.md` for the complete guide.

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the verification query results** - What's missing?
2. **Look at error messages** - Often they tell you exactly what's wrong
3. **Check Supabase logs** - Database → Logs in the dashboard
4. **Share the error** - Copy the exact error message for debugging

---

**Ready to continue?** Let me know once the migrations are applied and verified! 🎯


