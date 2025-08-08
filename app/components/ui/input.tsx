import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const inputVariants = cva(
  "flex w-full transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 rounded-lg border border-input bg-background px-4 py-2 shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:shadow-lg hover:shadow-lg hover:border-primary/50",
        glass: "h-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 shadow-glass focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:border-white/40 focus-visible:bg-white/20 hover:bg-white/15",
        floating: "h-12 rounded-xl border-2 border-input bg-background px-4 py-2 shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:shadow-premium-lg focus-visible:-translate-y-1 hover:shadow-premium-sm hover:-translate-y-0.5",
        glow: "h-10 rounded-lg border border-primary/30 bg-background px-4 py-2 shadow-glow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-glow focus-visible:border-primary hover:shadow-glow-sm",
      },
      size: {
        default: "text-sm md:text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  label?: string
  description?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, label, description, error, ...inputProps }, ref) => {
    const inputId = React.useId()
    
    if (label || description || error) {
      return (
        <div className="space-y-2">
          {label && (
            <label 
              htmlFor={inputId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(inputVariants({ variant, size, className }))}
            ref={ref}
            {...inputProps}
          />
          {description && !error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}
        </div>
      )
    }
    
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...inputProps}
      />
    )
  }
)
Input.displayName = "Input"

// Floating Label Input Component
const FloatingLabelInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, placeholder, variant, size, ...inputProps }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const inputId = React.useId()

    return (
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "peer h-12 w-full rounded-lg border border-input bg-background px-4 pt-6 pb-2 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary placeholder:text-transparent",
            className
          )}
          placeholder={placeholder}
          onFocus={(e) => {
            setIsFocused(true)
            inputProps.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(e.target.value !== "")
            inputProps.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(e.target.value !== "")
            inputProps.onChange?.(e)
          }}
          ref={ref}
          {...inputProps}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-4 text-sm text-muted-foreground transition-all duration-300 pointer-events-none",
              (isFocused || hasValue) && "top-2 text-xs text-primary"
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { Input, FloatingLabelInput, inputVariants }
