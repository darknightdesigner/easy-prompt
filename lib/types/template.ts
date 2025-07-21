/**
 * Type definitions for template creation and management
 */

export interface TemplateData {
  id?: string
  author_id?: string
  description: string // Renamed from title - this is the user description
  template: string // Renamed from content - this is the prompt template
  slug?: string
  variables: string[]
  status: 'draft' | 'published'
  visibility: 'public' | 'unlisted' | 'private'
  published_at?: string
  deleted_at?: string
  created_at?: string
  updated_at?: string
}

export interface CreateTemplateFormData {
  description: string // What the template does (maps to description field)
  template: string // The actual prompt template (maps to template field)
}

export interface CreateTemplateOptions {
  saveAsDraft?: boolean // true = draft, false = published
  visibility?: 'public' | 'unlisted' | 'private'
}

export interface CreateTemplateState {
  currentStep: number
  isOpen: boolean
  isLoading: boolean
  data: CreateTemplateFormData
  errors: Record<string, string>
  variables: string[]
  showErrors: boolean // Only show errors when user tries to proceed
}

export interface CreateTemplateContextType {
  // State
  state: CreateTemplateState
  
  // Actions
  openDialog: () => void
  closeDialog: () => void
  nextStep: () => void
  prevStep: () => void
  setCurrentStep: (step: number) => void
  
  // Form data
  updateDescription: (description: string) => void
  updateTemplate: (template: string) => void
  addVariableToTemplate: (variableName: string) => void
  renameVariableInTemplate: (oldName: string, newName: string) => void
  
  // Validation
  validateCurrentStep: () => boolean
  canProceedToNextStep: () => boolean
  
  // Submission
  createTemplate: (options?: CreateTemplateOptions) => Promise<void>
  saveDraft: () => Promise<void>
  
  // Reset
  resetForm: () => void
}

export const TEMPLATE_STEPS = {
  DESCRIPTION: 0,
  TEMPLATE: 1,
  PREVIEW: 2,
} as const

export const TOTAL_STEPS = Object.keys(TEMPLATE_STEPS).length
