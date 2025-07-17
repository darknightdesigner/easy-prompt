"use client"

import { cn } from "@/lib/utils"
import React from "react"
import { motion, type TargetAndTransition, type VariantLabels } from "framer-motion"
import dynamic from "next/dynamic"

// Dynamically import WavyCanvas to avoid SSR issues
const WavyCanvas = dynamic(() => import("@/components/graphics/WavyCanvas"), {
  ssr: false,
  loading: () => null
})

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Background configuration */
  background?: {
    /** Enable the animated wavy background */
    wavy?: boolean
    /** Custom background element */
    custom?: React.ReactNode
    /** Background positioning - 'fixed' stays in viewport, 'absolute' scrolls with content */
    positioning?: 'fixed' | 'absolute'
    /** Background animation settings */
    animation?: {
      initial?: TargetAndTransition
      animate?: TargetAndTransition
      transition?: any
    }
  }
}

interface PageHeaderProps {
  children: React.ReactNode
  className?: string
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Main page container with responsive layout and card styling
 * Provides consistent layout structure across all pages
 */
function PageContainer({ children, className, background }: PageContainerProps) {
  const defaultAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 3, delay: 1 }
  }

  // Default to fixed positioning for backgrounds
  const positioning = background?.positioning || 'fixed'
  const positionClass = positioning === 'fixed' ? 'fixed' : 'absolute'

  return (
    <div className={cn("bg-background pt-0 px-0 sm:px-6 sm:pt-32 relative", className)}>
      {/* Background Elements */}
      {background && (
        <>
          {/* Wavy Canvas Background */}
          {background.wavy && (
            <div className={`${positionClass} top-0 left-0 w-screen h-svh flex items-center justify-center pointer-events-none z-0`}>
              <motion.div
                className="w-full sm:mb-0"
                initial={background.animation?.initial || defaultAnimation.initial}
                animate={background.animation?.animate || defaultAnimation.animate}
                transition={background.animation?.transition || defaultAnimation.transition}
              >
                <WavyCanvas />
              </motion.div>
            </div>
          )}
          
          {/* Custom Background */}
          {background.custom && (
            <div className={`${positionClass} top-0 left-0 w-screen h-svh flex items-center justify-center pointer-events-none z-0`}>
              {background.custom}
            </div>
          )}
        </>
      )}
      
      {/* Main Content */}
      <div className="w-full sm:container sm:mx-auto sm:max-w-160 relative z-10">
        <div className="flex flex-col gap-0 sm:border-l sm:border-r sm:border-t border-0 sm:border-primary/8 rounded-none sm:rounded-t-4xl bg-card shadow-none sm:shadow-xl/5 min-h-svh">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Page header section with consistent padding and layout
 * Typically contains navigation, search, or action buttons
 */
function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex justify-between items-center pt-16 pb-2 px-2 sm:px-2 sm:py-2", className)}>
      {children}
    </div>
  )
}

/**
 * Main content area of the page
 * Flexible container for page-specific content
 */
function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

// Compound component pattern - attach sub-components to main component
PageContainer.Header = PageHeader
PageContainer.Content = PageContent

export { PageContainer }
export type { PageContainerProps, PageHeaderProps, PageContentProps }
