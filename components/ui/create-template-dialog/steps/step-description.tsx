/**
 * Step 1: Description Input
 * User describes what their template does
 */

"use client"

import React, { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTemplate } from "../create-template-context"
import { TEMPLATE_CONFIG } from "@/lib/config/template"

export function StepDescription() {
  const { state, updateDescription } = useCreateTemplate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when step becomes active
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])



  const characterCount = state.data.description.length
  const maxLength = TEMPLATE_CONFIG.MAX_DESCRIPTION_LENGTH
  const isNearLimit = characterCount > maxLength * 0.8

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={state.data.description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder={TEMPLATE_CONFIG.DESCRIPTION_PLACEHOLDER}
          className="text-base md:text-base text-card-foreground/80 min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
          maxLength={maxLength}
        />
        
        {/* Character count overlay */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-sm">
          {state.showErrors && state.errors.description && (
            <span className="text-destructive text-xs">
              {state.errors.description}
            </span>
          )}
          <span className={`text-muted-foreground text-xs ${isNearLimit ? 'text-warning' : ''}`}>
            {characterCount}/{maxLength}
          </span>
        </div>
      </div>
      
      {/* Next step hint */}
      {state.data.description.length > 20 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground/70">
            🚀 Next: Create your template using {"{{ variable }}"} syntax for dynamic content
          </div>
        </div>
      )}
    </div>
  )
}
