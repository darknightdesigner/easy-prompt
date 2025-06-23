import React, { CSSProperties, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

const shimmerButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button">, VariantProps<typeof shimmerButtonVariants> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "var(--primary-foreground)",
      shimmerSize = "0.1em",
      shimmerDuration = "1.5s",
      borderRadius = "100px",
      background = "var(--primary)",
      size = "default",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
            "--shadow-base": "color-mix(in oklch, var(--primary-foreground) 20%, transparent)",
            "--shadow-hover": "color-mix(in oklch, var(--primary-foreground) 40%, transparent)",
          } as CSSProperties
        }
        className={cn(
          shimmerButtonVariants({ size }),
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap text-primary-foreground [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px shadow-[0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[6px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute size-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_var(--shadow-base)]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_var(--shadow-hover)]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_var(--shadow-hover)]",
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
