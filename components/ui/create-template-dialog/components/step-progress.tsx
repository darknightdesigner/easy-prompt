/**
 * Progress bar component for Create Template Dialog steps
 */

"use client"

import React from "react"
import { PromptProgressBar } from "@/components/ui/prompt-progress-bar"
import { useCreateTemplate } from "../create-template-context"
import { TOTAL_STEPS } from "@/lib/types/template"

export function StepProgress() {
  const { state } = useCreateTemplate()
  
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <PromptProgressBar
        totalSteps={TOTAL_STEPS}
        completedSteps={state.currentStep}
        className="mb-2"
      />
      
      {/* Step indicators */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div className={`flex items-center gap-1 ${state.currentStep >= 0 ? 'text-primary font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${state.currentStep >= 0 ? 'bg-primary' : 'bg-muted'}`} />
          <span>Description</span>
        </div>
        
        <div className={`flex items-center gap-1 ${state.currentStep >= 1 ? 'text-primary font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${state.currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <span>Template</span>
        </div>
        
        <div className={`flex items-center gap-1 ${state.currentStep >= 2 ? 'text-primary font-medium' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${state.currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <span>Preview</span>
        </div>
      </div>
      
      {/* Variable count display */}
      {state.variables.length > 0 && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            {state.variables.length} variable{state.variables.length !== 1 ? 's' : ''} detected
          </span>
        </div>
      )}
    </div>
  )
}
