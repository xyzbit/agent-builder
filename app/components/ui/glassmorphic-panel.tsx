import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const glassmorphicPanelVariants = cva(
  "backdrop-blur-md border rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20 shadow-glass",
        dark: "bg-black/10 border-black/20 shadow-glass",
        primary: "bg-primary/10 border-primary/20 shadow-glow-sm",
        accent: "bg-accent/10 border-accent/20 shadow-premium-sm",
      },
      intensity: {
        light: "backdrop-blur-sm bg-opacity-5",
        default: "backdrop-blur-md bg-opacity-10",
        strong: "backdrop-blur-lg bg-opacity-20",
        heavy: "backdrop-blur-xl bg-opacity-30",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-12",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-xl",
        glow: "hover:shadow-glow hover:border-primary/40",
        scale: "hover:scale-105",
      }
    },
    defaultVariants: {
      variant: "default",
      intensity: "default",
      size: "default",
      hover: "none",
    },
  }
)

export interface GlassmorphicPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassmorphicPanelVariants> {}

const GlassmorphicPanel = React.forwardRef<HTMLDivElement, GlassmorphicPanelProps>(
  ({ className, variant, intensity, size, hover, ...props }, ref) => {
    return (
      <div
        className={cn(glassmorphicPanelVariants({ variant, intensity, size, hover }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassmorphicPanel.displayName = "GlassmorphicPanel"

export { GlassmorphicPanel, glassmorphicPanelVariants }