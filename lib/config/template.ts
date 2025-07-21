/**
 * Configuration constants for template creation
 */

export const TEMPLATE_CONFIG = {
  // Validation limits
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TEMPLATE_LENGTH: 5000,
  MAX_VARIABLES: 20,
  MIN_DESCRIPTION_LENGTH: 10,
  MIN_TEMPLATE_LENGTH: 10,
  
  // UI constants
  DESCRIPTION_PLACEHOLDER: "Describe your prompt template",
  TEMPLATE_PLACEHOLDER: "Enter your template here using {{ variable }} syntax",
  
  // Variable syntax examples
  VARIABLE_EXAMPLE: "{{ user_name }}",
  VARIABLE_SYNTAX_HELP: "Use {{ variable }} syntax. Examples: {{ name }}, {{ first_name }}, {{ userId }}",
  
  // Button labels
  SAVE_DRAFT_LABEL: "Save Draft",
  CREATE_TEMPLATE_LABEL: "Create Template",
  NEXT_LABEL: "Next",
  BACK_LABEL: "Back",
  CANCEL_LABEL: "Cancel",
  
  // Animation durations
  STEP_TRANSITION_DURATION: 300,
  LOADING_DEBOUNCE_MS: 500,
  
  // Validation messages
  VALIDATION_MESSAGES: {
    DESCRIPTION_REQUIRED: "Description is required",
    DESCRIPTION_TOO_SHORT: `Description must be at least 10 characters`,
    DESCRIPTION_TOO_LONG: `Description cannot exceed 500 characters`,
    TEMPLATE_REQUIRED: "Template is required", 
    TEMPLATE_TOO_SHORT: `Template must be at least 10 characters`,
    TEMPLATE_TOO_LONG: `Template cannot exceed 5000 characters`,
    TOO_MANY_VARIABLES: `Template cannot have more than 20 variables`,
    INVALID_VARIABLE_SYNTAX: "Variables must use {{ variable }} syntax",
    INVALID_VARIABLE_NAME: "Variable names must use snake_case or camelCase (no spaces or special characters)",
    PROFILE_NOT_FOUND: "User profile not found. Please refresh and try again.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    TEMPLATE_CREATED: "Template created successfully!",
    DRAFT_SAVED: "Draft saved successfully!",
  },
  
  // Icon button tooltips for preview step
  PREVIEW_TOOLTIPS: {
    ImageSquare: "Add media",
    Tag: "Add tags", 
    Robot: "AI assistance",
    CurrencyDollar: "Pricing",
    GlobeSimple: "Make public",
  },
} as const

export type TemplateConfigKey = keyof typeof TEMPLATE_CONFIG.VALIDATION_MESSAGES
