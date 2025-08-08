import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const skeletonVariants = cva(
  "rounded-lg",
  {
    variants: {
      variant: {
        default: "animate-pulse bg-primary/10",
        gradient: "animate-pulse bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 bg-[length:200%_100%] animate-shimmer",
        wave: "bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 bg-[length:200%_100%] animate-shimmer",
        glow: "animate-pulse bg-primary/10 shadow-glow-sm",
        pulse: "animate-pulse-slow bg-primary/15",
      },
      shape: {
        default: "",
        circle: "rounded-full aspect-square",
        text: "h-4 w-full rounded-md",
        avatar: "h-10 w-10 rounded-full",
        button: "h-9 w-20 rounded-lg",
        card: "h-32 w-full rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, shape, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, shape }), className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Preset skeleton components for common use cases
interface SkeletonPresetProps {
  className?: string
  variant?: SkeletonProps['variant']
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonPresetProps>(
  ({ className, variant }, ref) => (
    <Skeleton
      ref={ref}
      shape="text"
      variant={variant}
      className={cn("mb-2 last:mb-0", className)}
    />
  )
)
SkeletonText.displayName = "SkeletonText"

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonPresetProps>(
  ({ className, variant }, ref) => (
    <Skeleton
      ref={ref}
      shape="avatar"
      variant={variant}
      className={className}
    />
  )
)
SkeletonAvatar.displayName = "SkeletonAvatar"

const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonPresetProps>(
  ({ className, variant }, ref) => (
    <Skeleton
      ref={ref}
      shape="button"
      variant={variant}
      className={className}
    />
  )
)
SkeletonButton.displayName = "SkeletonButton"

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonPresetProps>(
  ({ className, variant }, ref) => (
    <Skeleton
      ref={ref}
      shape="card"
      variant={variant}
      className={className}
    />
  )
)
SkeletonCard.displayName = "SkeletonCard"

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard,
  skeletonVariants 
}
