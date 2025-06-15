import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  Variants                                  */
/* -------------------------------------------------------------------------- */

const tileVariants = cva(
  "group relative flex flex-col rounded-xl border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
  {
    variants: {
      variant: {
        solid: "bg-background hover:border-foreground",
        outline: "border-dashed bg-background/50 hover:border-foreground",
      },
      align: {
        start: "items-start text-left",
        center: "items-center text-center",
      },
    },
    defaultVariants: {
      variant: "solid",
      align: "start",
    },
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface TileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  /** Render a custom element (e.g. Next.js `Link`) instead of a `<div>` */
  asChild?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, variant, align, asChild, ...props }, ref) => {
    const Comp: any = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(tileVariants({ variant, align }), className)}
        {...props}
      />
    );
  }
);
Tile.displayName = "Tile";

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

const TileHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between gap-4", className)} {...props} />
);
TileHeader.displayName = "Tile.Header";

const TileIcon = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "flex h-5 w-5 items-center justify-center text-foreground/80 group-hover:text-foreground",
      className
    )}
    {...props}
  />
);
TileIcon.displayName = "Tile.Icon";

const TileTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-semibold", className)} {...props} />
);
TileTitle.displayName = "Tile.Title";

const TileDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
TileDescription.displayName = "Tile.Description";

/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */

export { Tile, TileHeader, TileIcon, TileTitle, TileDescription };
