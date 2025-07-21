/**
 * Context provider for Create Template Dialog
 * Following the pattern established by AuthRequiredDialogProvider
 */

"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { extractVariables } from "@/lib/prompt-variables"
import { TemplateAPI } from "@/lib/api/templates"
import { useTemplateValidation, useStepValidation } from "@/lib/hooks/use-template-validation"
import type { 
  CreateTemplateContextType, 
  CreateTemplateState, 
  CreateTemplateFormData,
  CreateTemplateOptions
} from "@/lib/types/template"
import { TEMPLATE_STEPS, TOTAL_STEPS } from "@/lib/types/template"

// Initial state
const initialFormData: CreateTemplateFormData = {
  description: "",
  template: "",
}

const initialState: CreateTemplateState = {
  currentStep: TEMPLATE_STEPS.DESCRIPTION,
  isOpen: false,
  isLoading: false,
  data: initialFormData,
  errors: {},
  variables: [],
  showErrors: false,
}

// Create context with undefined default (will throw error if used outside provider)
const CreateTemplateContext = createContext<CreateTemplateContextType | undefined>(undefined)

// Hook to use the context
export function useCreateTemplate() {
  const context = useContext(CreateTemplateContext)
  if (!context) {
    throw new Error("useCreateTemplate must be used within a CreateTemplateDialogProvider")
  }
  return context
}

// Provider component
interface CreateTemplateDialogProviderProps {
  children: ReactNode
}

export function CreateTemplateDialogProvider({ children }: CreateTemplateDialogProviderProps) {
  const [state, setState] = useState<CreateTemplateState>(initialState)
  
  // Get validation results
  const fullValidation = useTemplateValidation(state.data)
  const stepValidation = useStepValidation(state.data, state.currentStep)

  // Actions
  const openDialog = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }))
  }, [])

  const closeDialog = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const resetForm = useCallback(() => {
    setState(initialState)
  }, [])

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextStep = Math.min(prev.currentStep + 1, TOTAL_STEPS - 1)
      return { ...prev, currentStep: nextStep }
    })
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => {
      const prevStep = Math.max(prev.currentStep - 1, 0)
      return { ...prev, currentStep: prevStep }
    })
  }, [])

  // Form data updates
  const updateDescription = useCallback((description: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, description },
      errors: { ...prev.errors, description: "" }, // Clear error when user types
      showErrors: false, // Hide errors when user starts typing
    }))
  }, [])

  const updateTemplate = useCallback((template: string) => {
    const variables = extractVariables(template)
    setState(prev => ({
      ...prev,
      data: { ...prev.data, template },
      variables,
      errors: { ...prev.errors, template: "" }, // Clear error when user types
      showErrors: false, // Hide errors when user starts typing
    }))
  }, [])

  const addVariableToTemplate = useCallback((variableName: string) => {
    const variableText = `{{ ${variableName} }}`
    const currentTemplate = state.data.template
    
    // Add variable at the end of the template with a space if needed
    const newTemplate = currentTemplate + (currentTemplate && !currentTemplate.endsWith(' ') ? ' ' : '') + variableText
    updateTemplate(newTemplate)
  }, [state.data.template, updateTemplate])

  const renameVariableInTemplate = useCallback((oldName: string, newName: string) => {
    const currentTemplate = state.data.template
    
    // Create regex to match the old variable with whitespace tolerance
    const oldVariableRegex = new RegExp(`\\{\\{\\s*${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g')
    
    // Replace all instances of the old variable with the new one
    const newTemplate = currentTemplate.replace(oldVariableRegex, `{{ ${newName} }}`)
    
    // Update the template
    updateTemplate(newTemplate)
  }, [state.data.template, updateTemplate])

  // Validation
  const validateCurrentStep = useCallback(() => {
    const validation = useStepValidation(state.data, state.currentStep)
    setState(prev => ({ ...prev, errors: validation.errors, showErrors: true }))
    return validation.isValid
  }, [state.data, state.currentStep])

  const canProceedToNextStep = useCallback(() => {
    return stepValidation.isValid
  }, [stepValidation.isValid])

  // Submission
  const createTemplate = useCallback(async (options?: CreateTemplateOptions) => {
    // Final validation
    if (!fullValidation.isValid) {
      setState(prev => ({ ...prev, errors: fullValidation.errors }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, errors: {} }))

    try {
      await TemplateAPI.create(state.data, options)
      
      // Success - close dialog and reset form
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isOpen: false 
      }))
      
      // Reset form after a brief delay to allow dialog to close smoothly
      setTimeout(() => {
        setState(initialState)
      }, 300)
      
    } catch (error) {
      console.error("Failed to create template:", error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        errors: { 
          submit: error instanceof Error ? error.message : "Failed to create template" 
        }
      }))
    }
  }, [state.data, fullValidation])

  const saveDraft = useCallback(async () => {
    return createTemplate({ saveAsDraft: true, visibility: 'private' })
  }, [createTemplate])

  // Keyboard shortcut to open dialog (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !state.isOpen) {
        e.preventDefault()
        openDialog()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.isOpen, openDialog])

  // Context value
  const contextValue: CreateTemplateContextType = {
    // State
    state: {
      ...state,
      errors: { ...state.errors, ...stepValidation.errors }, // Merge step validation errors
    },
    
    // Actions
    openDialog,
    closeDialog,
    nextStep,
    prevStep,
    setCurrentStep,
    
    // Form data
    updateDescription,
    updateTemplate,
    addVariableToTemplate,
    renameVariableInTemplate,
    
    // Validation
    validateCurrentStep,
    canProceedToNextStep,
    
    // Submission
    createTemplate,
    saveDraft,
    
    // Reset
    resetForm,
  }

  return (
    <CreateTemplateContext.Provider value={contextValue}>
      {children}
    </CreateTemplateContext.Provider>
  )
}
