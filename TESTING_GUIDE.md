# Stripe Integration Testing Guide

## 🎯 Goal
Test the complete payment flow from checkout to subscription tracking.

---

## ✅ Prerequisites Checklist

Before testing, make sure:
- [x] Database migrations applied
- [x] Stripe product created ($5/month Premium)
- [x] Environment variables configured in `.env.local`
- [x] Dev server running on port 3002
- [x] Stripe CLI listening on port 3002
- [x] You're logged into your EasyPrompt account

---

## 🧪 Test #1: Checkout Session Creation

### Step 1: Navigate to Test Page

Open your browser and go to:
```
http://localhost:3002/test-stripe
```

### Step 2: Click "Test Checkout"

Click the **"Test Checkout (Premium $5/mo)"** button

### Expected Behavior:

✅ **Success:** You're redirected to Stripe Checkout page
- Shows "EasyPrompt Premium" product
- Shows $5.00/month price
- Has fields for card info

❌ **Error:** "Unauthorized"
- **Solution:** Make sure you're logged in first
- Go to http://localhost:3002/login
- Sign in, then try again

❌ **Error:** "Missing STRIPE_WEBHOOK_SECRET"
- **Solution:** Add webhook secret to `.env.local`
- Restart dev server

### Step 3: Complete Test Checkout

Use these test card details:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** `12/34` (any future date)
- **CVC:** `123` (any 3 digits)
- **ZIP:** `12345` (any 5 digits)
- **Email:** Use your account email or test email

Click **"Subscribe"**

### Expected Behavior:

✅ **Success:**
- Checkout completes
- You're redirected back to your app
- URL includes `?checkout=success`

❌ **Error:** Payment declined
- Make sure you used the correct test card
- Try again with `4242 4242 4242 4242`

---

## 🧪 Test #2: Webhook Event Processing

### Check Stripe Listener Terminal

In the terminal running `stripe listen`, you should see:

```
2025-10-20 12:34:56   --> checkout.session.completed [evt_xxxxx]
2025-10-20 12:34:56   <--  [200] POST http://localhost:3002/api/stripe/webhook [evt_xxxxx]
2025-10-20 12:34:57   --> customer.subscription.created [evt_xxxxx]
2025-10-20 12:34:57   <--  [200] POST http://localhost:3002/api/stripe/webhook [evt_xxxxx]
```

### Expected Behavior:

✅ **Success:**
- Events show `[200]` response (success)
- You see `checkout.session.completed`
- You see `customer.subscription.created` or `customer.subscription.updated`

❌ **Error:** `[400]` or `[500]` responses
- Check your dev server logs for errors
- Webhook signature verification might be failing
- Make sure `STRIPE_WEBHOOK_SECRET` matches

---

## 🧪 Test #3: Database Verification

### Check Subscription Status via Test Page

1. Go back to http://localhost:3002/test-stripe
2. Click **"Get Subscription Status"** button

### Expected Result:

```json
{
  "subscription": {
    "id": "uuid-here",
    "user_id": "your-user-id",
    "stripe_customer_id": "cus_xxxxx",
    "stripe_subscription_id": "sub_xxxxx",
    "status": "active",
    "plan_type": "premium",
    "current_period_end": "2025-11-20T...",
    ...
  }
}
```

✅ **Success indicators:**
- `status: "active"`
- `plan_type: "premium"`
- `stripe_subscription_id` is present
- `current_period_end` is in the future

---

## 🧪 Test #4: Database Direct Check

### Check Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Table Editor**
4. Open **subscriptions** table

### Expected Data:

You should see a row with:
- `user_id`: Your user UUID
- `stripe_customer_id`: Starts with `cus_`
- `stripe_subscription_id`: Starts with `sub_`
- `status`: `active`
- `plan_type`: `premium`
- `stripe_price_id`: Your price ID
- Dates filled in: `current_period_start`, `current_period_end`

### Check profiles Table

1. Open **profiles** table
2. Find your user row
3. Check these columns:
   - `is_premium`: Should be `true` ✅
   - `premium_since`: Should have a timestamp ✅

---

## 🧪 Test #5: Customer Portal

### Step 1: Open Portal

1. Go to http://localhost:3002/test-stripe
2. Click **"Open Customer Portal"** button

### Expected Behavior:

✅ **Success:**
- Redirects to Stripe Customer Portal
- Shows your subscription details
- Shows "EasyPrompt Premium - $5.00/month"
- Can see payment method
- Can see invoice history
- Can cancel subscription

### Step 2: Test Portal Features

**Update Payment Method:**
- Click "Update payment method"
- Add new card (use `4242 4242 4242 4242`)
- Should save successfully

**View Invoices:**
- Should see your subscription invoice
- Shows $5.00 charge

**Cancel Subscription (Optional):**
- Click "Cancel subscription"
- Confirms cancellation
- Check database - `cancel_at_period_end` should be `true`

---

## 🧪 Test #6: Webhook Event Logging

### Check subscription_events Table

1. In Supabase, open **subscription_events** table
2. You should see rows for each event:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`

Each row should have:
- `user_id`: Your user UUID
- `event_type`: The event name
- `stripe_event_id`: Starts with `evt_`
- `data`: JSON with full event details

---

## 🎉 Success Criteria

All tests pass if:

- ✅ Checkout session creates and redirects to Stripe
- ✅ Test payment completes successfully
- ✅ Webhook events show `[200]` responses
- ✅ `subscriptions` table has active subscription
- ✅ `profiles.is_premium` is `true`
- ✅ Subscription status API returns correct data
- ✅ Customer Portal opens and shows subscription
- ✅ `subscription_events` table logs all events

---

## 🚨 Common Issues & Solutions

### "Unauthorized" Error
**Problem:** Not logged in
**Solution:** Log in at http://localhost:3002/login first

### Webhook Returns [400]
**Problem:** Signature verification failed
**Solution:** 
- Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Make sure it matches the secret from `stripe listen`
- Restart dev server after updating

### No Database Updates
**Problem:** Webhooks not reaching app
**Solution:**
- Verify Stripe listener is running on correct port (3002)
- Check webhook handler for errors
- Look at dev server logs

### "Customer portal not activated"
**Problem:** Portal not configured in Stripe
**Solution:**
- Go to Stripe Dashboard → Settings → Customer portal
- Click "Activate test link"

### Subscription Shows as "incomplete"
**Problem:** Payment didn't complete
**Solution:**
- Make sure you used valid test card
- Check Stripe Dashboard → Payments for details
- Retry checkout with `4242 4242 4242 4242`

---

## 📊 What to Test Next

Once basic flow works:

1. **Cancellation Flow**
   - Cancel subscription in portal
   - Verify `cancel_at_period_end` is true
   - Check subscription still active until period end

2. **Payment Failure**
   - Use declined card: `4000 0000 0000 0002`
   - Verify webhook handles failure
   - Check subscription status updates

3. **Multiple Users**
   - Create another test account
   - Verify each user has separate subscription
   - Check RLS policies work correctly

4. **Limit Enforcement** (Future)
   - Test free user can't exceed limits
   - Test premium user has unlimited access

---

## 🎯 Ready for Production?

Before going live, you'll need to:
- [ ] Create products in Stripe **Live Mode**
- [ ] Update environment variables with live keys
- [ ] Configure production webhook endpoint in Stripe
- [ ] Test with real card (then refund)
- [ ] Set up error monitoring
- [ ] Document support procedures

---

**Questions or issues?** Check the troubleshooting section or review the implementation plan!


