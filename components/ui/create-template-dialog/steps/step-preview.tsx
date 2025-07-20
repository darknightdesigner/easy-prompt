/**
 * Step 3: Preview
 * Shows how the template will look when published
 */

"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { useCreateTemplate } from "../create-template-context"
import { PreviewIcons } from "../components/preview-icons"
import { useSessionContext } from "@supabase/auth-helpers-react"

export function StepPreview() {
  const { state } = useCreateTemplate()
  const { session } = useSessionContext()

  // Get user info for preview
  const userEmail = session?.user?.email || ""
  const userName = session?.user?.user_metadata?.display_name || 
                   session?.user?.user_metadata?.username || 
                   userEmail.split('@')[0] || 
                   "User"
  const userAvatar = session?.user?.user_metadata?.avatar_url

  return (
    <div className="flex flex-col h-full p-4">
      {/* Preview card */}
      <div className="flex-1 space-y-4">
        {/* Header with user info */}
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} />
            ) : (
              <AvatarFallback>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">
                {userName}
              </h3>
              <Icon name="verified" className="size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              @{userName.toLowerCase().replace(/\s+/g, '')}
            </p>
          </div>
        </div>

        {/* Template description */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            {state.data.description}
          </p>
          
          {/* Template content preview */}
          <div className="bg-background rounded-2xl p-4 border">
            <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {state.data.template}
            </div>
          </div>
          
          {/* Variables preview */}
          {state.variables.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {state.variables.map((variable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono"
                >
                  {`{${variable}}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions row (like in PromptTemplate) */}
        <div className="flex items-center justify-between pt-2 border-t">
          {/* Left side - social stats (placeholder) */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="heart" className="size-3" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="chat" className="size-3" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="arrowcounterclockwise" className="size-3" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="bookmark" className="size-3" />
              <span>0</span>
            </div>
          </div>

          {/* Right side - preview icons */}
          <PreviewIcons />
        </div>
      </div>

      {/* Template info summary */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium">Ready to publish</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Variables:</span>
          <span className="font-medium">
            {state.variables.length} variable{state.variables.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Visibility:</span>
          <span className="font-medium">Public</span>
        </div>
      </div>

      {/* Final instructions */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          <strong>Ready to create your template?</strong> Choose "Save Draft" to keep it private 
          and continue editing later, or "Create Template" to publish it publicly for others to use.
        </p>
      </div>
    </div>
  )
}
