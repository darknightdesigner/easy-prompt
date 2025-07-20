/**
 * Custom hook for template validation logic
 */

import { useMemo } from "react"
import { extractVariables } from "@/lib/prompt-variables"
import { TEMPLATE_CONFIG } from "@/lib/config/template"
import type { CreateTemplateFormData } from "@/lib/types/template"

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useTemplateValidation(data: CreateTemplateFormData) {
  const validation = useMemo((): ValidationResult => {
    const errors: Record<string, string> = {}

    // Validate description
    if (!data.description.trim()) {
      errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_REQUIRED
    } else if (data.description.length < TEMPLATE_CONFIG.MIN_DESCRIPTION_LENGTH) {
      errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_TOO_SHORT
    } else if (data.description.length > TEMPLATE_CONFIG.MAX_DESCRIPTION_LENGTH) {
      errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG
    }

    // Validate template
    if (!data.template.trim()) {
      errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_REQUIRED
    } else if (data.template.length < TEMPLATE_CONFIG.MIN_TEMPLATE_LENGTH) {
      errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_TOO_SHORT
    } else if (data.template.length > TEMPLATE_CONFIG.MAX_TEMPLATE_LENGTH) {
      errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_TOO_LONG
    } else {
      // Validate variables (if any exist)
      const variables = extractVariables(data.template)
      if (variables.length > TEMPLATE_CONFIG.MAX_VARIABLES) {
        errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TOO_MANY_VARIABLES
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [data.description, data.template])

  return validation
}

/**
 * Validate individual steps
 */
export function useStepValidation(data: CreateTemplateFormData, step: number) {
  const stepValidation = useMemo(() => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 0: // Description step
        if (!data.description.trim()) {
          errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_REQUIRED
        } else if (data.description.length < TEMPLATE_CONFIG.MIN_DESCRIPTION_LENGTH) {
          errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_TOO_SHORT
        } else if (data.description.length > TEMPLATE_CONFIG.MAX_DESCRIPTION_LENGTH) {
          errors.description = TEMPLATE_CONFIG.VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG
        }
        break

      case 1: // Template step
        if (!data.template.trim()) {
          errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_REQUIRED
        } else if (data.template.length < TEMPLATE_CONFIG.MIN_TEMPLATE_LENGTH) {
          errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_TOO_SHORT
        } else if (data.template.length > TEMPLATE_CONFIG.MAX_TEMPLATE_LENGTH) {
          errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TEMPLATE_TOO_LONG
        } else {
          const variables = extractVariables(data.template)
          if (variables.length > TEMPLATE_CONFIG.MAX_VARIABLES) {
            errors.template = TEMPLATE_CONFIG.VALIDATION_MESSAGES.TOO_MANY_VARIABLES
          }
        }
        break

      case 2: // Preview step - no additional validation needed
        break
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [data.description, data.template, step])

  return stepValidation
}
