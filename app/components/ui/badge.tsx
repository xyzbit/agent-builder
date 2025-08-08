import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md hover:bg-primary/80 hover:shadow-lg hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:shadow-lg hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/80 hover:shadow-lg hover:scale-105",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-105",
        gradient: "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:from-primary/90 hover:to-primary/70 hover:shadow-xl hover:scale-105",
        glass: "border-white/20 bg-white/10 backdrop-blur-md text-foreground shadow-glass hover:bg-white/20 hover:shadow-xl hover:scale-105",
        glow: "border-transparent bg-primary text-primary-foreground shadow-glow-sm hover:shadow-glow hover:scale-105",
        success: "border-transparent bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg hover:scale-105",
        warning: "border-transparent bg-yellow-500 text-white shadow-md hover:bg-yellow-600 hover:shadow-lg hover:scale-105",
        info: "border-transparent bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
