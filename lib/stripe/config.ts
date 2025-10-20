import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  appInfo: {
    name: 'EasyPrompt',
    version: '1.0.0',
    url: 'https://easyprompt.co',
  },
});

// Re-export plans for server-side use
export { PLANS, type PlanType } from './plans';

