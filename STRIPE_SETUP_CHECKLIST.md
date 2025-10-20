# Stripe Setup Checklist

## Phase 2: Stripe Configuration

### ✅ Prerequisites Complete
- [x] Database migrations applied
- [x] Tables verified (subscriptions, subscription_events, usage_tracking)
- [x] Profile fields added (is_premium, premium_since)

---

## 🎯 Step 1: Create/Access Stripe Account (5 minutes)

### Action Items:

1. Go to https://dashboard.stripe.com
2. **Sign up** (if you don't have an account) OR **Log in** (if you do)
3. Complete account setup if prompted
4. Make sure you're in **TEST MODE** (toggle in the top right corner)

**✅ Checkpoint:** You should see "Test Mode" badge in the top right

---

## 🔑 Step 2: Get Your API Keys (2 minutes)

### Action Items:

1. In Stripe Dashboard, click **Developers** in the top menu
2. Click **API keys** in the left sidebar
3. Ensure you're in **TEST MODE** (toggle should show "Test mode")
4. You'll see two keys:

   **A. Publishable key** (starts with `pk_test_`)
   - Click "Reveal test key" if hidden
   - Copy this key
   - Save it somewhere temporarily (we'll add to .env.local soon)

   **B. Secret key** (starts with `sk_test_`)
   - Click "Reveal test key"
   - Copy this key
   - Save it somewhere temporarily

**⚠️ Important:** Never share your secret key or commit it to git!

**✅ Checkpoint:** You have both keys copied and saved

---

## 💳 Step 3: Create Premium Product (5 minutes)

### Action Items:

1. In Stripe Dashboard, click **Products** in the left sidebar (under "Product catalog")
2. Click **Add product** button
3. Fill in the product details:

   **Product Information:**
   - Name: `EasyPrompt Premium`
   - Description: `Unlock unlimited templates, variables, and advanced features`
   
   **Pricing:**
   - Click **Add pricing** (if not already showing)
   - Pricing model: `Standard pricing`
   - Price: `5.00`
   - Currency: `USD`
   - Billing period: `Monthly` 
   - Payment type: `Recurring`

4. Click **Save product**

5. **Copy the Price ID:**
   - After saving, you'll see the product page
   - Look for **Pricing** section
   - You'll see your price with an ID like `price_xxxxxxxxxxxxx`
   - Click the copy icon next to it
   - Save this Price ID temporarily

**✅ Checkpoint:** You have the Price ID (starts with `price_`)

---

## 🎫 Step 4: Configure Customer Portal (3 minutes)

The Customer Portal lets users manage their subscriptions (update payment, cancel, etc.)

### Action Items:

1. In Stripe Dashboard, click **Settings** (gear icon in top right)
2. In the left sidebar, scroll down to **BILLING** section
3. Click **Customer portal**
4. Click **Activate test link** (or "Configure" if already active)

5. **Configure Portal Settings:**
   
   **Business information:**
   - Business name: `EasyPrompt`
   - (Optional) Add your logo
   - (Optional) Primary color: Your brand color
   
   **Functionality:**
   - ✅ **Enable invoice history** (checked)
   - ✅ **Enable payment method updates** (checked)
   - ✅ **Enable subscription cancellation** (checked)
   - ❌ **Pause subscriptions** (unchecked - keep it simple)
   - ❌ **Switch plans** (unchecked for now - we only have one plan)

6. Scroll down and click **Save changes**

**✅ Checkpoint:** Customer portal is activated

---

## 📝 Step 5: Collect Your Keys

You should now have **3 important values**:

```
1. Publishable Key: pk_test_xxxxxxxxxxxxx
2. Secret Key:      sk_test_xxxxxxxxxxxxx
3. Price ID:        price_xxxxxxxxxxxxx
```

**Keep these handy** - we'll add them to your `.env.local` in the next step!

---

## 🎉 Stripe Setup Complete!

Once you have all three values, we'll move to Phase 3: Environment Variables.

---

## 📋 Summary of What We Created in Stripe:

✅ **Test Mode Account** - Safe environment for development
✅ **API Keys** - Connect your app to Stripe
✅ **Premium Product** - $5/month subscription
✅ **Customer Portal** - Self-service subscription management

---

## 🚀 Ready for Next Steps?

Let me know when you have:
- ✅ Publishable key (pk_test_...)
- ✅ Secret key (sk_test_...)
- ✅ Price ID (price_...)

Then we'll set up your environment variables!


