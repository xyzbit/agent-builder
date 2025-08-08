"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground hover:shadow-md",
        outline: "border border-input bg-transparent shadow-md hover:bg-accent hover:text-accent-foreground hover:shadow-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary",
        gradient: "bg-transparent hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:to-accent data-[state=on]:text-white shadow-md hover:shadow-lg",
        glass: "bg-transparent hover:bg-white/10 hover:backdrop-blur-md data-[state=on]:bg-white/20 data-[state=on]:backdrop-blur-md data-[state=on]:border-white/30 shadow-glass hover:shadow-xl",
        glow: "bg-transparent hover:bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-glow hover:shadow-md",
      },
      size: {
        sm: "h-8 px-2 min-w-8 text-xs",
        default: "h-9 px-3 min-w-9 text-sm",
        lg: "h-10 px-4 min-w-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
