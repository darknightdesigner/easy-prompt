# Database Schema Analysis & Migration Compatibility

## Overview
This document analyzes the existing EasyPrompt database schema and identifies considerations for the Stripe payment integration.

---

## Existing Schema Review

### ✅ Compatible Tables
These existing tables work perfectly with our payment integration:

1. **profiles** - Core user data
   - Has: `id`, `username`, `display_name`, `bio`, `avatar_url`
   - **Action**: Will add `is_premium` and `premium_since` columns ✅

2. **bookmarks** - Saved templates
   - Tracks: `user_id`, `template_id`, `created_at`
   - **Usage**: Free plan limit of 10 bookmarks enforced here ✅

3. **prompt_templates** - User templates
   - Has: `template` field with CHECK constraint
   - Has: `variables` ARRAY field
   - **Usage**: Used for variable count limits ✅

4. **template_variables** - Template variable details
   - Links variables to templates
   - **Usage**: Can be counted for per-template limits ✅

---

## Critical Considerations

### 🚨 1. Template Length Constraint

**Current Constraint:**
```sql
template text CHECK (length(template) >= 10 AND length(template) <= 5000)
```

**Our Plan Configuration:**
```typescript
FREE: {
  limits: {
    maxTemplateLength: 5000,  // Matches current constraint ✅
  }
},
PREMIUM: {
  limits: {
    maxTemplateLength: Infinity,  // ⚠️ Blocked by DB constraint
  }
}
```

**Issue:** Premium users can't exceed 5000 characters due to database constraint.

**Solutions:**

#### Option A: Remove Length Constraint (Recommended)
```sql
-- Run this after applying our migrations
ALTER TABLE public.prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_template_check;

-- Add back minimum length only
ALTER TABLE public.prompt_templates
ADD CONSTRAINT prompt_templates_template_min_length_check 
CHECK (length(template) >= 10);
```

**Pros:**
- Premium users get true unlimited length
- Application code handles max limits per plan
- More flexible for future plan adjustments

**Cons:**
- Need to enforce max length in application code for free users
- No database-level protection against extremely long templates

#### Option B: Increase Constraint for Premium Users
```sql
-- Increase to a very high limit (e.g., 100K characters)
ALTER TABLE public.prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_template_check;

ALTER TABLE public.prompt_templates
ADD CONSTRAINT prompt_templates_template_length_check 
CHECK (length(template) >= 10 AND length(template) <= 100000);
```

**Pros:**
- Still have database-level protection
- Premium users get effectively unlimited (100K is huge)

**Cons:**
- Not truly unlimited
- Arbitrary upper limit

#### Option C: Keep As-Is (Not Recommended)
- Free: 5000 chars
- Premium: 5000 chars (same as free)

**Pros:**
- No changes needed

**Cons:**
- Premium plan feature is misleading
- Less value for premium users

**Recommendation:** Use **Option A** and enforce limits in application code.

---

### 📊 2. Variable Counting Strategy

**Existing Schema:**
- `prompt_templates.variables` - ARRAY of variable names
- `template_variables` - Detailed variable information (name, question, default)

**Our Limits:**
- Free: 5 variables per template
- Premium: Unlimited variables

**Implementation Strategy:**

We can count variables from either:
1. **Array length**: `array_length(variables, 1)` on `prompt_templates`
2. **Row count**: COUNT(*) from `template_variables` WHERE template_id = ?

**Recommended:** Use the `variables` array for quick checks:

```sql
-- Add to helper functions
CREATE OR REPLACE FUNCTION public.check_template_variable_count(
  p_user_id UUID,
  p_template_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_variable_count INTEGER;
BEGIN
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  IF v_plan_type = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Count variables for this template
  SELECT array_length(variables, 1) 
  INTO v_variable_count
  FROM public.prompt_templates
  WHERE id = p_template_id;
  
  -- Free limit: 5 variables
  RETURN COALESCE(v_variable_count, 0) < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 📝 3. Description Field Constraint

**Current Constraint:**
```sql
description text NOT NULL CHECK (length(description) >= 10 AND length(description) <= 500)
```

**Consideration:**
- Currently limits descriptions to 500 characters
- This is reasonable for both free and premium
- **Recommendation:** Keep as-is (no changes needed)

---

## Migration Adjustments Needed

### Updated Migration File

Create: `migrations/pending/2025-10-20-add-subscriptions/06_adjust_template_constraints.sql`

```sql
-- Remove the template length upper limit to allow premium unlimited
ALTER TABLE public.prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_template_check;

-- Add back minimum length constraint only
ALTER TABLE public.prompt_templates
ADD CONSTRAINT prompt_templates_template_min_length_check 
CHECK (length(template) >= 10);

-- Add helper function for template variable count checking
CREATE OR REPLACE FUNCTION public.check_template_variable_count(
  p_user_id UUID,
  p_template_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_variable_count INTEGER;
BEGIN
  v_plan_type := public.get_user_subscription_status(p_user_id);
  
  -- Premium users: unlimited
  IF v_plan_type = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Count variables for this template
  SELECT array_length(variables, 1) 
  INTO v_variable_count
  FROM public.prompt_templates
  WHERE id = p_template_id;
  
  -- Free users: max 5 variables per template
  RETURN COALESCE(v_variable_count, 0) < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_template_variable_count IS 
'Checks if user can add more variables to a template based on their plan';
```

---

## Application-Level Validation Required

Since we're removing the database constraint on template length, we need to enforce it in the application code.

### TypeScript Validation Helper

Create: `lib/subscription/limits.ts`

```typescript
import { PLANS } from '@/lib/stripe/config';
import { hasActivePremium } from '@/lib/stripe/subscriptions';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
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
  
  if (templateLength < 10) {
    return {
      allowed: false,
      reason: 'Template must be at least 10 characters',
    };
  }
  
  // Premium has no upper limit
  if (isPremium) {
    return { allowed: true };
  }
  
  // Free users: 5000 char limit
  if (templateLength > limit) {
    return {
      allowed: false,
      reason: `Free plan templates are limited to ${limit.toLocaleString()} characters. Upgrade to Premium for unlimited length.`,
      limit,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can add more variables
 */
export async function validateVariableCount(
  userId: string,
  currentCount: number
): Promise<ValidationResult> {
  const isPremium = await hasActivePremium(userId);
  const limit = isPremium 
    ? PLANS.PREMIUM.limits.maxVariablesPerTemplate 
    : PLANS.FREE.limits.maxVariablesPerTemplate;
  
  if (isPremium || currentCount < limit) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    reason: `Free plan templates are limited to ${limit} variables. Upgrade to Premium for unlimited variables.`,
    limit,
  };
}

/**
 * Check if user can save more templates
 */
export async function validateSavedTemplateCount(
  userId: string,
  currentCount: number
): Promise<ValidationResult> {
  const isPremium = await hasActivePremium(userId);
  const limit = isPremium 
    ? PLANS.PREMIUM.limits.maxSavedTemplates 
    : PLANS.FREE.limits.maxSavedTemplates;
  
  if (isPremium || currentCount < limit) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    reason: `Free plan allows ${limit} saved templates. Upgrade to Premium for unlimited saves.`,
    limit,
  };
}
```

---

## Updated Migration Order

Execute in this order:

1. ✅ `01_create_subscriptions_table.sql`
2. ✅ `02_create_subscription_events_table.sql`
3. ✅ `03_create_usage_tracking_table.sql`
4. ✅ `04_add_premium_fields_to_profiles.sql`
5. ✅ `05_create_helper_functions.sql`
6. **NEW** `06_adjust_template_constraints.sql` (create this)

---

## Summary of Changes Needed

### ✅ No Changes Required
- Bookmarks tracking (already works)
- User profiles (just adding fields)
- Variable counting (can use existing array field)

### ⚠️ Changes Required
1. **Create migration 06** - Adjust template length constraint
2. **Add application validation** - Create `lib/subscription/limits.ts`
3. **Update API routes** - Add validation before saving templates

### 📋 Validation Points to Add

In your template creation/update API routes:

```typescript
import { validateTemplateLength, validateVariableCount } from '@/lib/subscription/limits';

// Before saving template
const lengthCheck = await validateTemplateLength(userId, template.length);
if (!lengthCheck.allowed) {
  return NextResponse.json(
    { error: lengthCheck.reason },
    { status: 403 }
  );
}

// Before adding variables
const variableCheck = await validateVariableCount(userId, variables.length);
if (!variableCheck.allowed) {
  return NextResponse.json(
    { error: variableCheck.reason },
    { status: 403 }
  );
}
```

---

## Recommendations

1. **Apply migrations 01-05 first** - These are safe and don't modify existing constraints
2. **Create and apply migration 06** - Removes the 5000 char limit for premium users
3. **Add application validation** - Create the validation helper file
4. **Update template routes** - Add validation checks before database operations
5. **Test with both free and premium users** - Verify limits work correctly

The existing schema is well-designed and compatible with our payment integration. The main adjustment is handling template length limits at the application level instead of purely in the database.

---

**Next Steps:**
1. Should I create migration 06 and the validation helper file?
2. Or would you like to review the schema more before proceeding?


