# Webhook Setup - Final Step!

## 🎯 What We're Doing

Setting up Stripe webhooks so your app can receive real-time notifications when:
- A customer completes checkout
- A subscription is created/updated/canceled
- A payment succeeds or fails

---

## ✅ Current Status

- ✅ Dev server is running at http://localhost:3000
- ✅ Stripe CLI is installed and authenticated
- ⏳ Need to get webhook secret

---

## 🔧 Get Your Webhook Secret

### Open a NEW Terminal Window

**Important:** Keep your current terminal/dev server running. Open a **new terminal window**.

### Run This Command:

```bash
cd /Users/andresgonzalez/Documents/Cursor/Projects/EasyPromppt/Easyprompt
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### You'll See Output Like This:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Copy the Webhook Secret

The secret will start with `whsec_` followed by random characters.

---

## 📝 Add Webhook Secret to .env.local

1. Open your `.env.local` file
2. Find this line:
   ```
   STRIPE_WEBHOOK_SECRET=
   ```
3. Paste your webhook secret after the `=`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
4. **Save the file**

---

## 🔄 Restart Your Dev Server

After adding the webhook secret:

1. **Stop your dev server** (go to terminal running `npm run dev`, press Ctrl+C)
2. **Restart it:**
   ```bash
   npm run dev
   ```

---

## ✅ Keep Stripe Listener Running

**Important:** While developing, you need **TWO terminal windows open**:

**Terminal 1:** Running `npm run dev` (your Next.js app)
**Terminal 2:** Running `stripe listen --forward-to ...` (webhook forwarding)

This forwards Stripe events to your local server during development.

---

## 🎉 You're Done When:

- ✅ Webhook secret added to `.env.local`
- ✅ Dev server restarted
- ✅ Stripe listener running (you'll see "Ready!" message)
- ✅ Both terminals stay open

---

## 🧪 Test It Works

In the Stripe listener terminal, you should see events as they happen:

```
2025-10-20 12:34:56   --> customer.created [evt_xxxxx]
2025-10-20 12:34:57   <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_xxxxx]
```

---

## 🚨 Troubleshooting

**"webhook signing secret is not set"**
→ Make sure you added `STRIPE_WEBHOOK_SECRET` to `.env.local` and restarted dev server

**"Connection refused"**
→ Make sure dev server is running on port 3000

**"No webhook events appearing"**
→ Events only appear when something happens (checkout, subscription change, etc.)

---

**Ready to test?** Once your webhook is set up, let me know and we can test the full checkout flow! 🚀


