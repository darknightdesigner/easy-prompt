"use client"

import type React from "react"

import type { Transition } from "motion/react"
import { motion, useAnimation } from "motion/react"
import type { HTMLAttributes } from "react"
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react"
import { cn } from "@/lib/utils"

export interface CopyIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface CopyIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
}

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
}

const CopyIcon = forwardRef<CopyIconHandle, CopyIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation()
    const isControlledRef = useRef(false)

    useImperativeHandle(ref, () => {
      isControlledRef.current = true

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      }
    })

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate")
        } else {
          onMouseEnter?.(e)
        }
      },
      [controls, onMouseEnter],
    )

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal")
        } else {
          onMouseLeave?.(e)
        }
      },
      [controls, onMouseLeave],
    )
    return (
      <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          overflow="visible"
        >
          <motion.path
            d="M20.6235 6.49031L10.6661 5.56923C9.56618 5.46749 8.59208 6.27663 8.49034 7.37651L7.56926 17.334C7.46752 18.4339 8.27667 19.408 9.37655 19.5097L19.334 20.4308C20.4339 20.5325 21.408 19.7234 21.5097 18.6235L22.4308 8.66602C22.5326 7.56615 21.7234 6.59205 20.6235 6.49031Z"
            variants={{
              normal: { y: 0, x: 0 },
              animate: { y: 1, x: 1 },
            }}
            animate={controls}
            transition={defaultTransition}
          />
          <motion.path
            d="M4.83439 16.5264C3.74162 16.6524 2.74449 15.8614 2.61854 14.7686L1.47351 4.83438C1.34756 3.74161 2.13859 2.74448 3.23135 2.61853L13.1656 1.4735C14.2583 1.34755 15.2555 2.13858 15.3814 3.23134"
            variants={{
              normal: { x: 0, y: 0 },
              animate: { x: -1, y: -1 },
            }}
            transition={defaultTransition}
            animate={controls}
          />
          <motion.path
            d="M11.8285 14.7152C11.8285 14.7152 12.7321 15.8031 14.7236 15.9873C16.7151 16.1715 17.803 15.2679 17.803 15.2679"
            variants={{
              normal: { y: 0, x: 0 },
              animate: { y: 1, x: 1 },
            }}
            transition={defaultTransition}
            animate={controls}
          />
        </svg>
      </div>
    )
  },
)

CopyIcon.displayName = "CopyIcon"

export { CopyIcon }
