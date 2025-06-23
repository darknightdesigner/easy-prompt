import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  Variants                                  */
/* -------------------------------------------------------------------------- */

const tileVariants = cva(
  "group relative flex flex-col gap-4 rounded-3xl border border-foreground/10 p-6 transition-colors transition-transform transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
  {
    variants: {
      variant: {
        solid: "bg-card border-foreground/10 hover:border-foreground hover:shadow-md",
        outline: "bg-card/75 hover:bg-card/80 backdrop-blur-[1px] border-foreground/10 hover:border-primary hover:shadow-md",
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


export interface TileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  /** Render a custom element (e.g. Next.js `Link`) instead of a `<div>` */
  asChild?: boolean;
}


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

const TileIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>( (
  { className, children, ...props }, ref ) => {
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Apply default weight="regular" if none is specified
        return React.cloneElement(child as React.ReactElement<any>, {
          weight: (child as any).props?.weight ?? "regular",
          size: (child as any).props?.size ?? 32,
          className: cn((child as any).props?.className, "shrink-0"),
        });
      }
      return child;
    });

    return (
      <span
        ref={ref}
        className={cn(
          "flex h-9 w-9 items-center justify-center text-foreground",
          className
        )}
        {...props}
      >
        {enhancedChildren}
      </span>
    );
  }
);
TileIcon.displayName = "Tile.Icon";

/* Secondary icon (e.g., arrow) */
const TileIconSecondary = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>( (
  { className, children, ...props }, ref ) => {
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          weight: (child as any).props?.weight ?? "regular",
        });
      }
      return child;
    });

    return (
      <span
        ref={ref}
        className={cn(
          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center text-foreground",
          className
        )}
        {...props}
      >
        {enhancedChildren}
      </span>
    );
  }
);
TileIconSecondary.displayName = "Tile.IconSecondary";

const TileTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold opacity-100", className)} {...props} />
);
TileTitle.displayName = "Tile.Title";

const TileDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground opacity-100", className)} {...props} />
);
TileDescription.displayName = "Tile.Description";

/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */

export { Tile, TileHeader, TileIcon, TileIconSecondary, TileTitle, TileDescription };
