import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const gradientBackgroundVariants = cva(
  "transition-all duration-500",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-background to-background/50",
        primary: "bg-gradient-to-br from-primary/20 to-primary/5",
        secondary: "bg-gradient-to-br from-secondary/20 to-secondary/5",
        accent: "bg-gradient-to-br from-accent/20 to-accent/5",
        warm: "bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20",
        cool: "bg-gradient-to-br from-blue-500/20 via-teal-500/20 to-green-500/20",
        sunset: "bg-gradient-to-br from-orange-400/30 via-red-500/30 to-pink-600/30",
        ocean: "bg-gradient-to-br from-blue-400/30 via-blue-600/30 to-indigo-800/30",
        forest: "bg-gradient-to-br from-green-400/30 via-emerald-500/30 to-teal-600/30",
        aurora: "bg-gradient-to-br from-purple-400/30 via-pink-500/30 to-red-500/30",
        cosmic: "bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40",
        mesh: "bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-red-400/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
      },
      direction: {
        "to-r": "bg-gradient-to-r",
        "to-l": "bg-gradient-to-l",
        "to-t": "bg-gradient-to-t",
        "to-b": "bg-gradient-to-b",
        "to-br": "bg-gradient-to-br",
        "to-bl": "bg-gradient-to-bl",
        "to-tr": "bg-gradient-to-tr",
        "to-tl": "bg-gradient-to-tl",
        radial: "bg-radial-gradient",
      },
      animation: {
        none: "",
        slow: "animate-pulse-slow",
        pulse: "animate-pulse",
        gradient: "animate-gradient-x",
      },
      overlay: {
        none: "",
        light: "relative after:absolute after:inset-0 after:bg-white/5",
        dark: "relative after:absolute after:inset-0 after:bg-black/10",
        pattern: "relative after:absolute after:inset-0 after:bg-grid-pattern after:opacity-10",
      }
    },
    defaultVariants: {
      variant: "default",
      direction: "to-br",
      animation: "none",
      overlay: "none",
    },
  }
)

export interface GradientBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientBackgroundVariants> {
  fixed?: boolean
}

const GradientBackground = React.forwardRef<HTMLDivElement, GradientBackgroundProps>(
  ({ className, variant, direction, animation, overlay, fixed = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          gradientBackgroundVariants({ variant, direction, animation, overlay }),
          fixed && "fixed inset-0 -z-10",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientBackground.displayName = "GradientBackground"

// Preset gradient backgrounds
const GradientBackgrounds = {
  Hero: (props: Partial<GradientBackgroundProps>) => (
    <GradientBackground variant="mesh" animation="slow" fixed {...props} />
  ),
  Card: (props: Partial<GradientBackgroundProps>) => (
    <GradientBackground variant="primary" overlay="light" {...props} />
  ),
  Section: (props: Partial<GradientBackgroundProps>) => (
    <GradientBackground variant="warm" direction="to-r" {...props} />
  ),
  Page: (props: Partial<GradientBackgroundProps>) => (
    <GradientBackground variant="cosmic" fixed overlay="pattern" {...props} />
  ),
}

export { GradientBackground, GradientBackgrounds, gradientBackgroundVariants }