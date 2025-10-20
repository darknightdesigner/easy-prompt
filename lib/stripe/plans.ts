/**
 * Stripe plan configuration
 * This file is safe to import on both client and server
 */

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      maxSavedTemplates: 10,
      maxVariablesPerTemplate: 5,
      maxTemplateLength: 5000,
    },
    features: [
      'Create unlimited templates',
      'Up to 10 saved templates',
      'Up to 5 variables per template',
      'Basic analytics',
      'Community access',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 500, // in cents
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    limits: {
      maxSavedTemplates: Infinity,
      maxVariablesPerTemplate: Infinity,
      maxTemplateLength: Infinity,
    },
    features: [
      'Everything in Free',
      'Unlimited saved templates',
      'Unlimited variables',
      'Advanced analytics',
      'Priority support',
      'Custom profile badge',
      'Export templates',
    ],
  },
} as const;

export type PlanType = 'free' | 'premium';


