# EasyPrompt Stripe Integration Setup Instructions

This guide will walk you through setting up the Stripe payment integration for EasyPrompt.

## Prerequisites

- [x] Stripe dependencies installed (`npm install` already done)
- [ ] Stripe account created
- [ ] Supabase project with admin access
- [ ] Environment variables configured

---

## Step 1: Database Setup

### Apply Migrations to Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Execute the following migration files in order:

#### 1.1 Create Subscriptions Table
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/01_create_subscriptions_table.sql
```
Copy and paste the contents, then click **Run**.

#### 1.2 Create Subscription Events Table
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/02_create_subscription_events_table.sql
```

#### 1.3 Create Usage Tracking Table
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/03_create_usage_tracking_table.sql
```

#### 1.4 Add Premium Fields to Profiles
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/04_add_premium_fields_to_profiles.sql
```

#### 1.5 Create Helper Functions
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/05_create_helper_functions.sql
```

#### 1.6 Adjust Template Constraints
```bash
# File: migrations/pending/2025-10-20-add-subscriptions/06_adjust_template_constraints.sql
```

**Important:** This migration removes the 5000 character limit on templates to allow premium users unlimited length. Free users will still be limited to 5000 characters through application validation.

### Verify Tables Created

Run this query to verify all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'subscription_events', 'usage_tracking');
```

You should see all three tables listed.

---

## Step 2: Stripe Account Setup

### 2.1 Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or log in

### 2.2 Get API Keys (Test Mode)

1. Navigate to **Developers** → **API keys**
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2.3 Create Premium Product

1. Navigate to **Products** in Stripe Dashboard
2. Click **Add product**
3. Fill in details:
   - **Name:** EasyPrompt Premium
   - **Description:** Unlock unlimited templates, variables, and advanced features
   - **Pricing model:** Standard pricing
   - **Price:** $5.00 USD
   - **Billing period:** Monthly
   - **Recurring payment:** Yes
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)

### 2.4 Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (or configure if already active)
3. Enable these features:
   - ✅ Update payment method
   - ✅ View invoice history
   - ✅ Cancel subscription
   - ❌ Update subscription (optional, can enable later)
4. Save settings

---

## Step 3: Environment Variables

### 3.1 Create .env.local File

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXX (we'll add this in step 4)
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_XXXXXXXXXXXXXXXX

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace the placeholder values** with your actual keys from Supabase and Stripe.

### 3.2 Where to Find Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" to see)

---

## Step 4: Webhook Setup (Local Development)

### 4.1 Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases)

**Linux:**
```bash
# Debian/Ubuntu
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 4.2 Login to Stripe

```bash
stripe login
```

This will open a browser window to authorize the CLI.

### 4.3 Forward Webhooks to Local Server

In a **new terminal window**, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the `whsec_xxxxx` value** and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Keep this terminal window open** while developing. Webhooks will only work while `stripe listen` is running.

---

## Step 5: Test the Integration

### 5.1 Start Development Server

```bash
npm run dev
```

Your app should be running at http://localhost:3000

### 5.2 Test Subscription Flow

1. **Create an account** or log in
2. **Navigate to pricing page**: http://localhost:3000/pricing (you'll need to create this page)
3. Click **Upgrade to Premium**
4. You should be redirected to Stripe Checkout
5. Use a test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `12345`)
6. Complete the checkout
7. You should be redirected back to your app

### 5.3 Verify Database Updates

1. Go to Supabase Dashboard → **Table Editor**
2. Open the `subscriptions` table
3. You should see a new row with:
   - Your user_id
   - stripe_customer_id
   - stripe_subscription_id
   - status: 'active'
   - plan_type: 'premium'

4. Check the `subscription_events` table for logged webhook events

### 5.4 Check Webhook Events

In the terminal running `stripe listen`, you should see:
```
[200] POST /api/stripe/webhook [evt_xxxxx]
```

If you see `[400]` or `[500]`, check your server logs for errors.

---

## Step 6: Test Additional Scenarios

### Cancel Subscription

1. Create a portal session by calling `/api/stripe/create-portal-session`
2. Click through to cancel subscription
3. Verify status updates in database

### Payment Failure

```bash
stripe trigger invoice.payment_failed
```

Check logs to ensure webhook handler processes the event correctly.

### Multiple Webhooks

Test that webhooks are idempotent (can be safely retried):
```bash
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.updated
```

Only one database update should occur.

---

## Step 7: Production Setup (When Ready)

### 7.1 Create Production Stripe Product

1. Switch to **Live mode** in Stripe Dashboard
2. Create the same product and price as in test mode
3. Copy the **live** Price ID

### 7.2 Set Up Production Webhook

1. In Stripe Dashboard (Live mode) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://easyprompt.co/api/stripe/webhook`
4. **Events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 7.3 Configure Vercel Environment Variables

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following (use **Production** scope):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX (from production webhook)
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_XXXXXXXX (live price ID)
NEXT_PUBLIC_APP_URL=https://easyprompt.co
```

### 7.4 Deploy

```bash
git add .
git commit -m "Add Stripe payment integration"
git push
```

Vercel will automatically deploy your changes.

### 7.5 Test Production Webhook

After deployment, test the webhook:

```bash
# Using Stripe CLI in live mode
stripe trigger checkout.session.completed --live
```

Or make a real test purchase with your own card (Stripe will refund test purchases).

---

## Troubleshooting

### Webhook Signature Verification Failed

**Error:** `Webhook signature verification failed`

**Solutions:**
1. Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen` output
2. Restart your dev server after adding the webhook secret
3. Make sure you're not modifying the request body before verifying the signature

### Database Insert Failed

**Error:** `violates foreign key constraint`

**Solutions:**
1. Ensure user profile exists before creating subscription
2. Check that user_id in webhook matches authenticated user
3. Verify RLS policies allow service role to insert

### Checkout Session Creation Failed

**Error:** `No such price: 'undefined'`

**Solutions:**
1. Verify `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` is set in `.env.local`
2. Restart dev server after adding environment variables
3. Check that the price ID exists in Stripe Dashboard

### Customer Portal Not Working

**Error:** `Customer portal is not activated`

**Solutions:**
1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Click "Activate" for your portal
3. Ensure test mode is activated if you're in development

---

## Next Steps

Once the basic integration is working:

1. **Create Pricing Page** - Build the UI for plan selection
2. **Add Upgrade Prompts** - Show modals when users hit limits
3. **Implement Usage Limits** - Enforce template/variable limits
4. **Add Subscription Manager** - Let users view/manage subscription
5. **Build Premium Badge** - Show premium status in UI
6. **Add Analytics** - Track conversion rates and churn

Refer to the **STRIPE_IMPLEMENTATION_PLAN.md** for detailed implementation guides for each component.

---

## Support Resources

- **Stripe Documentation:** https://docs.stripe.com
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Supabase Docs:** https://supabase.com/docs
- **This Project's Implementation Plan:** `STRIPE_IMPLEMENTATION_PLAN.md`

## Questions?

If you encounter issues not covered here, check:
1. Server logs (`npm run dev` output)
2. Supabase logs (Dashboard → Logs)
3. Stripe webhook events (Dashboard → Developers → Events)
4. Network tab in browser DevTools

Happy integrating! 🎉

