/**
 * Step 3: Preview
 * Shows how the template will look when published
 */

"use client"

import React, { useRef, useLayoutEffect, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTemplate } from "../create-template-context"
import { PreviewIcons } from "../components/preview-icons"
import { useSessionContext } from "@supabase/auth-helpers-react"
import { cn } from "@/lib/utils"

export function StepPreview() {
  const { state } = useCreateTemplate()
  const { session } = useSessionContext()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const maxHeight = 240 // Same as PromptTemplate default

  // Get user info for preview
  const userEmail = session?.user?.email || ""
  const userName = session?.user?.user_metadata?.display_name || 
                   session?.user?.user_metadata?.username || 
                   userEmail.split('@')[0] || 
                   "User"
  const userAvatar = session?.user?.user_metadata?.avatar_url

  // Dynamic height measurement function
  const measure = useCallback(() => {
    if (!textareaRef.current) return

    const el = textareaRef.current
    el.style.height = "auto"
    
    // If content exceeds maxHeight, set to maxHeight and enable scrolling
    if (el.scrollHeight > maxHeight) {
      el.style.height = `${maxHeight}px`
      el.style.overflowY = "auto"
    } else {
      el.style.height = `${el.scrollHeight}px`
      el.style.overflowY = "hidden"
    }
  }, [maxHeight])

  // Initial measurement and re-measure when content changes
  useLayoutEffect(() => {
    measure()
  }, [measure, state.data.template])

  // Re-measure when the element resizes or fonts load
  useEffect(() => {
    if (!textareaRef.current) return

    const ro = new ResizeObserver(measure)
    ro.observe(textareaRef.current)

    // Re-measure when custom fonts finish loading
    const fonts = (document as any).fonts as FontFaceSet | undefined
    fonts?.addEventListener?.("loadingdone", measure)

    return () => {
      ro.disconnect()
      fonts?.removeEventListener?.("loadingdone", measure)
    }
  }, [measure])

  return (
    <div className="flex flex-col h-full">
      {/* Preview card */}
      <div className="flex-1">
        {/* Template content preview */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={state.data.template}
            readOnly
            className={cn(
              "text-base md:text-base text-card-foreground/80 min-h-[240px] w-full p-4 resize-none border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "cursor-default" // Make it clear it's read-only
            )}
            rows={1}
          />
        </div>
      </div>
      

    </div>
  )
}
