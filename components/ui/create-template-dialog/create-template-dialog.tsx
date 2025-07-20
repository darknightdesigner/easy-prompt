/**
 * Main Create Template Dialog Component
 * Following the pattern established by existing dialog components
 */

"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Icon } from "@/components/ui/icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import { useCreateTemplate } from "./create-template-context"
import { TEMPLATE_STEPS } from "@/lib/types/template"
import { useSessionContext } from "@supabase/auth-helpers-react"

import { StepDescription } from "./steps/step-description"
import { StepTemplate } from "./steps/step-template" 
import { StepPreview } from "./steps/step-preview"
import { StepNavigation } from "./components/step-navigation"

export function CreateTemplateDialog() {
  const { state, closeDialog, resetForm } = useCreateTemplate()
  const { session } = useSessionContext()
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
      // Reset form when dialog is closed
      setTimeout(() => {
        resetForm()
      }, 300) // Allow dialog close animation to complete
    }
  }

  const getStepTitle = () => {
    switch (state.currentStep) {
      case TEMPLATE_STEPS.DESCRIPTION:
        return "What does your template do?"
      case TEMPLATE_STEPS.TEMPLATE:
        return "Enter Template"
      case TEMPLATE_STEPS.PREVIEW:
        // Use user's display name or fallback to "Display Name"
        return session?.user?.user_metadata?.display_name || 
               session?.user?.user_metadata?.username || 
               (session?.user?.email ? session.user.email.split('@')[0] : null) || 
               "Display Name"
      default:
        return "Create Template"
    }
  }

  const getStepDescription = () => {
    switch (state.currentStep) {
      case TEMPLATE_STEPS.DESCRIPTION:
        return "Describe your prompt template"
      case TEMPLATE_STEPS.TEMPLATE:
        return "Use curly braces like {variable_name} to create fillable variables"
      case TEMPLATE_STEPS.PREVIEW:
        return state.data.description || "Review your template before creating"
      default:
        return ""
    }
  }

  return (
    <Dialog open={state.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-1 rounded-[28px] bg-secondary gap-2"
        showCloseButton={true}
      >
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </VisuallyHidden>
        
        {/* Header with step badge and title */}
      <div className="flex items-start gap-2 pt-2 pl-2 pr-2">
        {/* Step number badge */}
        <div className="shrink-0 w-[40px] h-[40px] mt-1 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
          {state.currentStep === TEMPLATE_STEPS.PREVIEW ? (
            <Avatar className="size-[40px]">
              {session?.user?.user_metadata?.avatar_url ? (
                <AvatarImage 
                  src={session.user.user_metadata.avatar_url} 
                  alt={session?.user?.user_metadata?.display_name || 'User'} 
                />
              ) : (
                <AvatarFallback className="bg-primary/05 text-primary">
                  <Icon name="profile" className="size-5" />
                </AvatarFallback>
              )}
            </Avatar>
          ) : (
            state.currentStep + 1
          )}
        </div>
        
        {/* Step title and description */}
        <div className="flex flex-col pr-3 sm:pr-4">
          <div className="flex items-center gap-0 font-semibold text-foreground">
            {getStepTitle()}
          </div>
          <div className={`mt-0.5 ${
            state.currentStep === TEMPLATE_STEPS.PREVIEW 
              ? "text-base text-foreground" 
              : "text-sm text-muted-foreground"
          }`}>
            {state.currentStep === TEMPLATE_STEPS.PREVIEW ? (
              <RichTextDisplay 
                content={getStepDescription()}
                linkClassName="text-primary hover:underline"
              />
            ) : (
              getStepDescription()
            )}
          </div>
        </div>
      </div>
        <div className="flex flex-col w-full min-w-full shrink-0 gap-0 border bg-card rounded-[24px] overflow-hidden">

          {/* Step content */}
          <div className="flex-1 min-h-0">
            {state.currentStep === TEMPLATE_STEPS.DESCRIPTION && (
              <StepDescription />
            )}

            {state.currentStep === TEMPLATE_STEPS.TEMPLATE && (
              <StepTemplate />
            )}

            {state.currentStep === TEMPLATE_STEPS.PREVIEW && (
              <StepPreview />
            )}
          </div>

          {/* Navigation */}
          <StepNavigation />
        </div>
      </DialogContent>
    </Dialog>
  )
}
