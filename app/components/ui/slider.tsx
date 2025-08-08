import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      size: {
        sm: "",
        default: "",
        lg: "",
      }
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const sliderTrackVariants = cva(
  "relative w-full grow overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        gradient: "bg-gradient-to-r from-primary/20 to-accent/20",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-glass",
        glow: "bg-primary/20 shadow-glow-sm",
      },
      size: {
        sm: "h-1",
        default: "h-1.5",
        lg: "h-2",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const sliderRangeVariants = cva(
  "absolute h-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary",
        gradient: "bg-gradient-to-r from-primary to-accent",
        glass: "bg-white/30 backdrop-blur-sm",
        glow: "bg-primary shadow-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const sliderThumbVariants = cva(
  "block rounded-full border border-primary/50 bg-background shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "border-primary/50 bg-background hover:border-primary",
        gradient: "border-transparent bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90",
        glass: "border-white/20 bg-white/20 backdrop-blur-md hover:bg-white/30",
        glow: "border-primary bg-background shadow-glow-sm hover:shadow-glow",
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

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  variant?: "default" | "gradient" | "glass" | "glow"
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderVariants({ size }), className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn(sliderTrackVariants({ variant, size }))}>
      <SliderPrimitive.Range className={cn(sliderRangeVariants({ variant }))} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(sliderThumbVariants({ variant, size }))} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider, sliderVariants }
