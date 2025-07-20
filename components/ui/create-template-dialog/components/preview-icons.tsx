/**
 * Preview icons component for Step 3
 * Shows the 5 icon buttons as specified: ImageSquare, Tag, Robot, CurrencyDollar, GlobeSimple
 */

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TEMPLATE_CONFIG } from "@/lib/config/template"

export function PreviewIcons() {
  const iconButtons = [
    {
      name: "book" as const,
      tooltip: TEMPLATE_CONFIG.PREVIEW_TOOLTIPS.ImageSquare,
    },
    {
      name: "bookmark" as const,
      tooltip: TEMPLATE_CONFIG.PREVIEW_TOOLTIPS.Tag,
    },
    {
      name: "users" as const,
      tooltip: TEMPLATE_CONFIG.PREVIEW_TOOLTIPS.Robot,
    },
    {
      name: "plus" as const,
      tooltip: TEMPLATE_CONFIG.PREVIEW_TOOLTIPS.CurrencyDollar,
    },
    {
      name: "share" as const,
      tooltip: TEMPLATE_CONFIG.PREVIEW_TOOLTIPS.GlobeSimple,
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {iconButtons.map((button) => (
          <Tooltip key={button.name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 hover:bg-muted"
                onClick={() => {
                  // No action needed for now - just visual
                }}
              >
                <Icon name={button.name} className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{button.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
