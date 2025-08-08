import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const checkboxVariants = cva(
  "peer shrink-0 rounded-lg border shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:scale-105",
  {
    variants: {
      variant: {
        default: "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:border-primary/80",
        gradient: "border-primary data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-accent data-[state=checked]:text-white hover:border-primary/80",
        glass: "border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:backdrop-blur-md data-[state=checked]:text-foreground hover:border-white/50 shadow-glass",
        glow: "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-glow hover:border-primary/80",
      },
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-5 w-5",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const checkboxIndicatorVariants = cva(
  "flex items-center justify-center text-current transition-all duration-200",
  {
    variants: {
      size: {
        sm: "[&>svg]:h-2 [&>svg]:w-2",
        default: "[&>svg]:h-3 [&>svg]:w-3",
        lg: "[&>svg]:h-4 [&>svg]:w-4",
      }
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(checkboxIndicatorVariants({ size }))}
    >
      <Check className="transition-all duration-200" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
