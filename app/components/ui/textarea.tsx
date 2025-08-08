import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-lg border text-base shadow-md transition-all duration-300 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
  {
    variants: {
      variant: {
        default: "border-input bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:shadow-lg hover:shadow-lg hover:border-primary/50",
        glass: "border-white/20 bg-white/10 backdrop-blur-md px-3 py-2 shadow-glass focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:border-white/40 focus-visible:bg-white/20 hover:bg-white/15",
        floating: "border-2 border-input bg-background px-3 py-2 shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:shadow-premium-lg focus-visible:-translate-y-1 hover:shadow-premium-sm hover:-translate-y-0.5",
        glow: "border-primary/30 bg-background px-3 py-2 shadow-glow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-glow focus-visible:border-primary hover:shadow-glow-sm",
      },
      size: {
        sm: "min-h-[50px] px-2 py-1.5 text-xs",
        default: "min-h-[60px] px-3 py-2 text-sm",
        lg: "min-h-[80px] px-4 py-3 text-base",
        xl: "min-h-[120px] px-4 py-3 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean
  maxHeight?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, autoResize = false, maxHeight = 200, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return

      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
    }, [autoResize, maxHeight])

    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight, props.value])

    return (
      <textarea
        className={cn(textareaVariants({ variant, size }), className)}
        ref={textareaRef}
        onChange={(e) => {
          adjustHeight()
          props.onChange?.(e)
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
