import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const animatedIconVariants = cva(
  "transition-all duration-300 ease-in-out",
  {
    variants: {
      animation: {
        none: "",
        bounce: "hover:animate-bounce",
        pulse: "animate-pulse",
        spin: "animate-spin",
        ping: "animate-ping",
        float: "animate-float",
        glow: "animate-glow",
        wobble: "hover:animate-pulse hover:scale-110",
        shake: "hover:animate-pulse",
        flip: "hover:rotate-180",
        scale: "hover:scale-110",
        rotate: "hover:rotate-12",
      },
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        "2xl": "h-10 w-10",
        "3xl": "h-12 w-12",
      },
      variant: {
        default: "text-current",
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
        success: "text-green-500",
        warning: "text-yellow-500",
        info: "text-blue-500",
      },
      effect: {
        none: "",
        glow: "drop-shadow-glow",
        shadow: "drop-shadow-lg",
        outline: "filter drop-shadow-outline",
      },
      state: {
        default: "",
        loading: "animate-spin opacity-70",
        success: "text-green-500 animate-bounce",
        error: "text-red-500 animate-pulse",
        warning: "text-yellow-500 animate-pulse",
      }
    },
    defaultVariants: {
      animation: "none",
      size: "default",
      variant: "default",
      effect: "none",
      state: "default",
    },
  }
)

export interface AnimatedIconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof animatedIconVariants> {
  icon: React.ReactNode
  loading?: boolean
  disabled?: boolean
}

const AnimatedIcon = React.forwardRef<HTMLSpanElement, AnimatedIconProps>(
  ({ className, animation, size, variant, effect, state, icon, loading, disabled, ...props }, ref) => {
    const finalState = loading ? "loading" : state
    const finalAnimation = loading ? "spin" : animation

    return (
      <span
        className={cn(
          animatedIconVariants({ 
            animation: finalAnimation, 
            size, 
            variant, 
            effect, 
            state: finalState 
          }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
        {...props}
      >
        {icon}
      </span>
    )
  }
)
AnimatedIcon.displayName = "AnimatedIcon"

// Preset animated icons for common use cases
const AnimatedIcons = {
  Loading: ({ size = "default", ...props }: Partial<AnimatedIconProps> & { icon: React.ReactNode }) => (
    <AnimatedIcon animation="spin" size={size} variant="muted" {...props} />
  ),
  Success: ({ size = "default", ...props }: Partial<AnimatedIconProps> & { icon: React.ReactNode }) => (
    <AnimatedIcon animation="bounce" size={size} variant="success" {...props} />
  ),
  Error: ({ size = "default", ...props }: Partial<AnimatedIconProps> & { icon: React.ReactNode }) => (
    <AnimatedIcon animation="pulse" size={size} variant="destructive" {...props} />
  ),
  Interactive: ({ size = "default", ...props }: Partial<AnimatedIconProps> & { icon: React.ReactNode }) => (
    <AnimatedIcon animation="scale" size={size} effect="glow" {...props} />
  ),
  Floating: ({ size = "default", ...props }: Partial<AnimatedIconProps> & { icon: React.ReactNode }) => (
    <AnimatedIcon animation="float" size={size} effect="shadow" {...props} />
  ),
}

export { AnimatedIcon, AnimatedIcons, animatedIconVariants }