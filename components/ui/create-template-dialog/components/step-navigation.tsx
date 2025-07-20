/**
 * Navigation component for Create Template Dialog steps
 */

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useCreateTemplate } from "../create-template-context"
import { TEMPLATE_STEPS, TOTAL_STEPS } from "@/lib/types/template"
import { TEMPLATE_CONFIG } from "@/lib/config/template"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function StepNavigation() {
  const { 
    state, 
    nextStep, 
    prevStep, 
    canProceedToNextStep, 
    validateCurrentStep,
    createTemplate, 
    saveDraft,
    closeDialog 
  } = useCreateTemplate()

  const isFirstStep = state.currentStep === TEMPLATE_STEPS.DESCRIPTION
  const isLastStep = state.currentStep === TEMPLATE_STEPS.PREVIEW
  const canProceed = canProceedToNextStep()

  const handleNext = () => {
    if (isLastStep) {
      // This shouldn't happen as final step has different buttons
      return
    }
    
    // Validate current step before proceeding
    if (canProceed) {
      nextStep()
    } else {
      // Show validation errors by triggering validation
      validateCurrentStep()
    }
  }

  const handleBack = () => {
    if (isFirstStep) {
      closeDialog()
    } else {
      prevStep()
    }
  }

  const handleCreateTemplate = async () => {
    try {
      await createTemplate({ saveAsDraft: false, visibility: 'public' })
    } catch (error) {
      // Error is handled in context
      console.error('Failed to create template:', error)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft()
    } catch (error) {
      // Error is handled in context
      console.error('Failed to save draft:', error)
    }
  }

  // Helper component for tooltip actions
  const TemplateAction = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="flex items-center justify-between px-2 py-2 border-t bg-background/50">
      {/* Left side - Icon toolbar */}
      <div className="flex items-center gap-0">
        {/* Back button (only show when not on first step) */}
        {!isFirstStep && (
          <TemplateAction tooltip="Previous step">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleBack}
              disabled={state.isLoading}
            >
              <Icon name="arrow-left" className="size-4.5" />
            </Button>
          </TemplateAction>
        )}
        
        {/* Template creation toolbar icons - hide on template and preview steps */}
        {state.currentStep !== TEMPLATE_STEPS.TEMPLATE && state.currentStep !== TEMPLATE_STEPS.PREVIEW && (
          <>
            <TemplateAction tooltip="Add media">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={state.isLoading}
              >
                <Icon name="imageSquare" className="size-4.5" />
              </Button>
            </TemplateAction>
            
            <TemplateAction tooltip="Add tags">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={state.isLoading}
              >
                <Icon name="Tag" className="size-4.5" />
              </Button>
            </TemplateAction>
            
            <TemplateAction tooltip="Any Model">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={state.isLoading}
              >
                <Icon name="Robot" className="size-4.5" />
              </Button>
            </TemplateAction>
            
            <TemplateAction tooltip="Free">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={state.isLoading}
              >
                <Icon name="CurrencyDollar" className="size-4.5" />
              </Button>
            </TemplateAction>
            
            <TemplateAction tooltip="Public">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={state.isLoading}
              >
                <Icon name="GlobeSimple" className="size-4.5" />
              </Button>
            </TemplateAction>
          </>
        )}
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-1">
        {isLastStep ? (
          // Final step: Save Draft + Create Template buttons
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={state.isLoading || !canProceed}
              className="gap-1.5 shadow-none"
            >
              {state.isLoading && <Icon name="arrowcounterclockwise" className="size-4 animate-spin" />}
              {TEMPLATE_CONFIG.SAVE_DRAFT_LABEL}
            </Button>
            
            <Button
              size="sm"
              onClick={handleCreateTemplate}
              disabled={state.isLoading || !canProceed}
              className="gap-1.5"
            >
              {state.isLoading && <Icon name="arrowcounterclockwise" className="size-4 animate-spin" />}
              {TEMPLATE_CONFIG.CREATE_TEMPLATE_LABEL}
            </Button>
          </>
        ) : (
          // Regular next button with enter hint
          <>
            {/* Show outline buttons on template step (step 2) */}
            {state.currentStep === TEMPLATE_STEPS.TEMPLATE && (
              <>
                {/* Only show variable counter when there are variables */}
                {state.variables.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add your custom action here
                      console.log('Variable counter clicked:', state.variables.length)
                    }}
                    disabled={state.isLoading}
                    className="gap-1.5 shadow-none"
                  >
                    {state.variables.length}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add your custom action here
                    console.log('Add Variable button clicked on template step')
                  }}
                  disabled={state.isLoading}
                  className="gap-1.5 shadow-none"
                >
                  <Icon name="plus" className="size-4" />
                  Add Variable
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              onClick={handleNext}
              disabled={state.isLoading || !canProceed}
              className="gap-1.5"
            >
              {TEMPLATE_CONFIG.NEXT_LABEL}
              <Icon name="arrow-right" className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
