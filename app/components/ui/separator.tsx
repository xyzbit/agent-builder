import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const separatorVariants = cva(
  "shrink-0 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-border",
        gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
        glow: "bg-primary shadow-glow-sm",
        dashed: "border-t border-dashed border-border bg-transparent",
        dotted: "border-t border-dotted border-border bg-transparent",
      },
      thickness: {
        thin: "",
        default: "",
        thick: "",
      }
    },
    compoundVariants: [
      // Horizontal variants
      {
        variant: "default",
        thickness: "thin",
        className: "h-px"
      },
      {
        variant: "default", 
        thickness: "default",
        className: "h-[1px]"
      },
      {
        variant: "default",
        thickness: "thick", 
        className: "h-0.5"
      },
      // Gradient, glow, dashed, dotted use same thickness as default
      {
        variant: ["gradient", "glow"],
        thickness: "thin",
        className: "h-px"
      },
      {
        variant: ["gradient", "glow"],
        thickness: "default", 
        className: "h-[1px]"
      },
      {
        variant: ["gradient", "glow"],
        thickness: "thick",
        className: "h-0.5"
      },
      {
        variant: ["dashed", "dotted"],
        thickness: "thin",
        className: "h-0 border-t"
      },
      {
        variant: ["dashed", "dotted"], 
        thickness: "default",
        className: "h-0 border-t"
      },
      {
        variant: ["dashed", "dotted"],
        thickness: "thick",
        className: "h-0 border-t-2"
      }
    ],
    defaultVariants: {
      variant: "default",
      thickness: "default",
    },
  }
)

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, variant, thickness, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant, thickness }),
        orientation === "horizontal" ? "w-full" : "h-full w-[1px]",
        orientation === "vertical" && variant === "dashed" && "border-l border-dashed border-border bg-transparent h-full w-0",
        orientation === "vertical" && variant === "dotted" && "border-l border-dotted border-border bg-transparent h-full w-0",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator, separatorVariants }
