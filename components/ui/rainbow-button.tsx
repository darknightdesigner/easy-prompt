import React from "react";

import { cn } from "@/lib/utils";
interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center gap-2 h-9 animate-rainbow text-primary-foreground cursor-pointer items-center justify-center rounded-full border-0 bg-size-[200%] px-4 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] bg-origin-border [border:calc(0.095*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 has-[>svg]:px-3",

        // before styles
        "before:absolute before:bottom-[-10%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-size-[200%] before:filter-[blur(calc(0.8*1rem))]",

        // light mode colors
        "bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_50%,rgba(0,0,0,0.06)_80%,transparent),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // dark mode colors
        "dark:bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_50%,rgba(255,255,255,0.12)_80%,transparent),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
