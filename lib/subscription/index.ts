/**
 * Subscription and limits module
 * 
 * This module exports all subscription-related functionality including:
 * - Subscription management (from stripe/subscriptions.ts)
 * - Plan limits and validation (from limits.ts)
 */

// Re-export subscription functions
export {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createPortalSession,
  getUserSubscription,
  hasActivePremium,
  getUserLimits,
  canSaveTemplate,
  canAddVariable,
} from '@/lib/stripe/subscriptions';

// Re-export limit validation functions
export {
  validateTemplateLength,
  validateVariableCount,
  validateSavedTemplateCount,
  getUserLimitsDisplay,
  isApproachingLimit,
  getLimitMessage,
} from './limits';

export type { ValidationResult } from './limits';


