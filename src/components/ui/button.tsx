/**
 * Button Component
 *
 * A reusable button component with variants and sizes
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const buttonVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  },
  size: {
    default: 'min-h-[44px] px-4 py-2',
    sm: 'min-h-[44px] rounded-md px-3',
    lg: 'min-h-[48px] rounded-md px-8',
    icon: 'min-h-[44px] min-w-[44px]'
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation'

    const variantClasses = buttonVariants.variant[variant]
    const sizeClasses = buttonVariants.size[size]

    if (asChild) {
      // This would require Slot from @radix-ui/react-slot in a full implementation
      return (
        <span
          className={cn(baseClasses, variantClasses, sizeClasses, className)}
          ref={ref as React.Ref<HTMLSpanElement>}
          {...props}
        />
      )
    }

    return (
      <button
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }