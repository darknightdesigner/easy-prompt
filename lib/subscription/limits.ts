import { PLANS } from '@/lib/stripe/config';
import { hasActivePremium } from '@/lib/stripe/subscriptions';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

/**
 * Check if template length is within user's plan limits
 */
export async function validateTemplateLength(
  userId: string,
  templateLength: number
): Promise<ValidationResult> {
  const isPremium = await hasActivePremium(userId);
  const limit = isPremium 
    ? PLANS.PREMIUM.limits.maxTemplateLength 
    : PLANS.FREE.limits.maxTemplateLength;
  
  // Minimum length validation (applies to all users)
  if (templateLength < 10) {
    return {
      allowed: false,
      reason: 'Template must be at least 10 characters',
    };
  }
  
  // Premium users have no upper limit
  if (isPremium) {
    return { allowed: true };
  }
  
  // Free users: enforce 5000 character limit
  if (templateLength > limit) {
    return {
      allowed: false,
      reason: `Free plan templates are limited to ${limit.toLocaleString()} characters. Upgrade to Premium for unlimited length.`,
      limit,
      current: templateLength,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can add more variables to a template
 */
export async function validateVariableCount(
  userId: string,
  currentCount: number
): Promise<ValidationResult> {
  const isPremium = await hasActivePremium(userId);
  const limit = isPremium 
    ? PLANS.PREMIUM.limits.maxVariablesPerTemplate 
    : PLANS.FREE.limits.maxVariablesPerTemplate;
  
  // Premium users have unlimited variables
  if (isPremium) {
    return { allowed: true };
  }
  
  // Free users: enforce 5 variable limit
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan templates are limited to ${limit} variables. Upgrade to Premium for unlimited variables.`,
      limit,
      current: currentCount,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can save more templates (bookmarks)
 */
export async function validateSavedTemplateCount(
  userId: string,
  currentCount: number
): Promise<ValidationResult> {
  const isPremium = await hasActivePremium(userId);
  const limit = isPremium 
    ? PLANS.PREMIUM.limits.maxSavedTemplates 
    : PLANS.FREE.limits.maxSavedTemplates;
  
  // Premium users have unlimited saves
  if (isPremium) {
    return { allowed: true };
  }
  
  // Free users: enforce 10 saved templates limit
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows ${limit} saved templates. Upgrade to Premium for unlimited saves.`,
      limit,
      current: currentCount,
    };
  }
  
  return { allowed: true };
}

/**
 * Get user's current limits based on their plan
 */
export async function getUserLimitsDisplay(userId: string) {
  const isPremium = await hasActivePremium(userId);
  const plan = isPremium ? PLANS.PREMIUM : PLANS.FREE;
  
  return {
    plan: plan.name,
    isPremium,
    limits: {
      maxSavedTemplates: plan.limits.maxSavedTemplates === Infinity 
        ? 'Unlimited' 
        : plan.limits.maxSavedTemplates,
      maxVariablesPerTemplate: plan.limits.maxVariablesPerTemplate === Infinity 
        ? 'Unlimited' 
        : plan.limits.maxVariablesPerTemplate,
      maxTemplateLength: plan.limits.maxTemplateLength === Infinity 
        ? 'Unlimited' 
        : plan.limits.maxTemplateLength,
    },
    features: plan.features,
  };
}

/**
 * Check if user is approaching their limit (at 80% or more)
 */
export function isApproachingLimit(current: number, limit: number): boolean {
  if (limit === Infinity) return false;
  return current >= limit * 0.8;
}

/**
 * Get a friendly message about limit usage
 */
export function getLimitMessage(
  current: number, 
  limit: number, 
  itemType: string
): string | null {
  if (limit === Infinity) return null;
  
  const remaining = limit - current;
  const percentage = Math.round((current / limit) * 100);
  
  if (current >= limit) {
    return `You've reached your limit of ${limit} ${itemType}. Upgrade to Premium for unlimited access.`;
  }
  
  if (isApproachingLimit(current, limit)) {
    return `You have ${remaining} ${itemType} remaining (${percentage}% used). Consider upgrading to Premium.`;
  }
  
  return `${remaining} of ${limit} ${itemType} remaining`;
}


