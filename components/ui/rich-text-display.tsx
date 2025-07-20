/**
 * Rich Text Display Component
 * Renders text with line breaks, clickable URLs, and hashtags
 */

"use client"

import React from "react"
import Link from "next/link"
import { parseRichText, type RichTextSegment } from "@/lib/utils/rich-text"
import { cn } from "@/lib/utils"

interface RichTextDisplayProps {
  content: string
  className?: string
  onHashtagClick?: (hashtag: string) => void
  linkClassName?: string
  hashtagClassName?: string
}

export function RichTextDisplay({
  content,
  className,
  onHashtagClick,
  linkClassName = "text-primary hover:underline",
  hashtagClassName = "text-primary hover:underline cursor-pointer"
}: RichTextDisplayProps) {
  if (!content) return null

  const segments = parseRichText(content)

  const renderSegment = (segment: RichTextSegment, index: number) => {
    switch (segment.type) {
      case 'url':
        return (
          <Link
            key={index}
            href={segment.href!}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClassName)}
            onClick={(e) => e.stopPropagation()} // Prevent parent click handlers
          >
            {segment.content}
          </Link>
        )
      
      case 'hashtag':
        return (
          <span
            key={index}
            className={cn(hashtagClassName)}
            onClick={(e) => {
              e.stopPropagation()
              onHashtagClick?.(segment.content.slice(1)) // Remove # symbol
            }}
          >
            {segment.content}
          </span>
        )
      
      case 'text':
      default:
        return (
          <span key={index}>
            {segment.content}
          </span>
        )
    }
  }

  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {segments.map(renderSegment)}
    </div>
  )
}

// Export for use in other components
export type { RichTextDisplayProps }
