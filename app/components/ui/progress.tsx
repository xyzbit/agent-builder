"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        gradient: "bg-gradient-to-r from-primary/20 to-accent/20",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-glass",
        glow: "bg-primary/20 shadow-glow-sm",
        striped: "bg-primary/20",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        gradient: "bg-gradient-to-r from-primary to-accent",
        glass: "bg-white/30 backdrop-blur-sm",
        glow: "bg-primary shadow-glow animate-pulse-slow",
        striped: "bg-gradient-to-r from-primary to-primary/80 bg-[length:1rem_1rem] animate-shimmer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, size, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ variant, size }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        progressIndicatorVariants({ variant }),
        variant === "striped" && "bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-[length:20px_20px] animate-shimmer"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, progressVariants }
