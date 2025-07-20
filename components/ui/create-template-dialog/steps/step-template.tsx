/**
 * Step 2: Template Input
 * User enters their prompt template with variables
 */

"use client"

import React, { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTemplate } from "../create-template-context"
import { TEMPLATE_CONFIG } from "@/lib/config/template"

export function StepTemplate() {
  const { state, updateTemplate } = useCreateTemplate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when step becomes active
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])



  const characterCount = state.data.template.length
  const maxLength = TEMPLATE_CONFIG.MAX_TEMPLATE_LENGTH
  const isNearLimit = characterCount > maxLength * 0.8

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={state.data.template}
          onChange={(e) => updateTemplate(e.target.value)}
          placeholder={TEMPLATE_CONFIG.TEMPLATE_PLACEHOLDER}
          className="text-base md:text-base text-card-foreground/80 min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
          maxLength={maxLength}
        />
        
        {/* Status indicators overlay */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-sm">
          {state.showErrors && state.errors.template && (
            <span className="text-destructive text-xs">
              {state.errors.template}
            </span>
          )}
          
          {/* Variable count */}
          {state.variables.length > 0 && !(state.showErrors && state.errors.template) && (
            <span className="text-primary font-medium text-xs">
              {state.variables.length} variable{state.variables.length !== 1 ? 's' : ''}
            </span>
          )}
          
          {/* Character count */}
          <span className={`text-muted-foreground text-xs ${isNearLimit ? 'text-warning' : ''}`}>
            {characterCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Variables list at bottom */}
      {state.variables.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            {state.variables.map((variable, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono"
              >
                {`{${variable}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
