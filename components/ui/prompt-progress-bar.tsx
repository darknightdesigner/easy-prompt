"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PromptProgressBarProps {
  /** Total number of steps (variables) in the template */
  totalSteps: number;
  /** Steps the user has already completed */
  completedSteps: number;
  /** Optional additional class names */
  className?: string;
}

/**
 * A thin horizontal bar that fills from left-to-right based on completion
 * percentage. This is a purely presentational component – it receives numeric
 * props and renders width accordingly. Logic for detecting variables &
 * updating progress lives in the parent component.
 */
export function PromptProgressBar({
  totalSteps,
  completedSteps,
  className,
}: PromptProgressBarProps) {
  // Avoid divide-by-zero and clamp the value between 0-100.
  const percentage = totalSteps > 0 ? Math.min(100, (completedSteps / totalSteps) * 100) : 0;

  return (
    <div className={cn("relative h-px w-full bg-border/50 dark:bg-border/40", className)}>
      {/* Filled portion */}
      <div
        className="absolute left-0 top-0 h-full rounded-r-full bg-linear-to-r from-violet-400 via-blue-500 to-blue-600 transition-[width] duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
