'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Enhanced button interaction states
export const buttonInteractionClasses = {
  // Base interactive styles
  base: [
    'transition-all duration-200 ease-out',
    'transform-gpu', // Hardware acceleration for smoother animations
    'touch-manipulation', // Optimized for touch devices
    'select-none', // Prevent text selection
    'focus:outline-none'
  ].join(' '),

  // Hover effects
  hover: {
    lift: 'hover:scale-[1.02] hover:shadow-lg',
    glow: 'hover:shadow-lg hover:shadow-brand-500/25',
    brighten: 'hover:brightness-110',
    subtle: 'hover:bg-opacity-90'
  },

  // Active/pressed states
  active: {
    press: 'active:scale-[0.98] active:shadow-sm',
    sink: 'active:translate-y-[1px]',
    darken: 'active:brightness-95'
  },

  // Focus states (enhanced for accessibility)
  focus: {
    ring: 'focus:ring-2 focus:ring-offset-2',
    brand: 'focus:ring-brand-500',
    error: 'focus:ring-red-500',
    success: 'focus:ring-green-500',
    warning: 'focus:ring-amber-500',
    visible: 'focus-visible:ring-2 focus-visible:ring-offset-2'
  },

  // Loading/disabled states
  state: {
    loading: 'cursor-wait',
    disabled: 'opacity-60 cursor-not-allowed pointer-events-none'
  }
}

interface EnhancedButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'base' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
  'aria-describedby'?: string
  interactive?: boolean // Disable interactions for display-only buttons
}

export function EnhancedButton({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  interactive = true,
  ...props
}: EnhancedButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px] rounded-lg',
    base: 'px-4 py-3 text-base min-h-[48px] rounded-xl',
    lg: 'px-6 py-4 text-lg min-h-[56px] rounded-xl',
    xl: 'px-8 py-5 text-xl min-h-[64px] rounded-2xl'
  }

  const variantClasses = {
    primary: [
      'bg-brand-600 text-white font-semibold',
      'border-2 border-brand-600',
      'hover:bg-brand-700 hover:border-brand-700',
      'active:bg-brand-800 active:border-brand-800',
      buttonInteractionClasses.focus.brand
    ].join(' '),
    secondary: [
      'bg-gray-100 text-gray-900 font-semibold',
      'border-2 border-gray-300',
      'hover:bg-gray-200 hover:border-gray-400',
      'active:bg-gray-300 active:border-gray-500',
      'focus:ring-gray-500'
    ].join(' '),
    outline: [
      'bg-transparent text-brand-700 font-semibold',
      'border-2 border-brand-600',
      'hover:bg-brand-50 hover:border-brand-700',
      'active:bg-brand-100 active:border-brand-800',
      buttonInteractionClasses.focus.brand
    ].join(' '),
    ghost: [
      'bg-transparent text-gray-700 font-medium',
      'border-2 border-transparent',
      'hover:bg-gray-100 hover:text-gray-900',
      'active:bg-gray-200',
      'focus:ring-gray-500'
    ].join(' '),
    success: [
      'bg-green-600 text-white font-semibold',
      'border-2 border-green-600',
      'hover:bg-green-700 hover:border-green-700',
      'active:bg-green-800 active:border-green-800',
      buttonInteractionClasses.focus.success
    ].join(' '),
    warning: [
      'bg-amber-600 text-white font-semibold',
      'border-2 border-amber-600',
      'hover:bg-amber-700 hover:border-amber-700',
      'active:bg-amber-800 active:border-amber-800',
      buttonInteractionClasses.focus.warning
    ].join(' '),
    error: [
      'bg-red-600 text-white font-semibold',
      'border-2 border-red-600',
      'hover:bg-red-700 hover:border-red-700',
      'active:bg-red-800 active:border-red-800',
      buttonInteractionClasses.focus.error
    ].join(' ')
  }

  const interactiveClasses = interactive ? [
    buttonInteractionClasses.hover.lift,
    buttonInteractionClasses.active.press,
    'hover:shadow-lg'
  ].join(' ') : ''

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn(
        // Base styles
        buttonInteractionClasses.base,
        sizeClasses[size],
        variantClasses[variant],

        // Interactive states
        !isDisabled && interactiveClasses,

        // State-specific styles
        loading && buttonInteractionClasses.state.loading,
        isDisabled && buttonInteractionClasses.state.disabled,

        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

// Enhanced step indicator button with sophisticated interactions
interface StepButtonProps {
  stepNumber: number
  title: string
  status: 'upcoming' | 'current' | 'completed' | 'available'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function StepButton({
  stepNumber,
  title,
  status,
  onClick,
  disabled = false,
  className = ''
}: StepButtonProps) {
  const statusClasses = {
    upcoming: [
      'bg-gray-200 text-gray-400 border-2 border-gray-200',
      'cursor-not-allowed opacity-60'
    ].join(' '),
    available: [
      'bg-gray-300 text-gray-700 border-2 border-gray-300',
      'hover:bg-gray-400 hover:border-gray-400 hover:text-gray-800',
      'active:bg-gray-500 active:border-gray-500',
      'focus:ring-gray-500',
      buttonInteractionClasses.hover.lift,
      buttonInteractionClasses.active.press
    ].join(' '),
    current: [
      'bg-brand-600 text-white border-2 border-brand-600',
      'shadow-lg scale-110 ring-2 ring-brand-300 ring-offset-2',
      'hover:bg-brand-700 hover:border-brand-700',
      'active:bg-brand-800 active:border-brand-800',
      buttonInteractionClasses.focus.brand,
      'hover:scale-[1.12] hover:shadow-xl'
    ].join(' '),
    completed: [
      'bg-green-500 text-white border-2 border-green-500',
      'hover:bg-green-600 hover:border-green-600',
      'active:bg-green-700 active:border-green-700',
      buttonInteractionClasses.focus.success,
      buttonInteractionClasses.hover.lift,
      buttonInteractionClasses.active.press,
      'hover:shadow-green-500/25'
    ].join(' ')
  }

  const isInteractive = !disabled && (status === 'available' || status === 'completed' || status === 'current')

  return (
    <button
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      className={cn(
        // Base styles
        'w-10 h-10 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full',
        'flex items-center justify-center text-xs sm:text-sm font-medium',
        'landscape:w-7 landscape:h-7 landscape:sm:w-8 landscape:sm:h-8 landscape:text-2xs landscape:sm:text-xs',
        buttonInteractionClasses.base,

        // Status-specific styles
        statusClasses[status],

        className
      )}
      aria-label={`${title}, step ${stepNumber}, ${status}`}
      title={`${title} - ${status}`}
    >
      <span aria-hidden="true">
        {status === 'completed' ? '✓' : stepNumber}
      </span>
    </button>
  )
}

// Enhanced radio/checkbox button with better interactions
interface RadioButtonProps {
  checked: boolean
  onChange: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
  description?: string
}

export function RadioButton({
  checked,
  onChange,
  children,
  disabled = false,
  className = '',
  description
}: RadioButtonProps) {
  return (
    <label
      className={cn(
        // Base styles
        'relative flex p-4 border-2 rounded-xl cursor-pointer',
        buttonInteractionClasses.base,

        // State-dependent styles
        checked ? [
          'border-brand-500 bg-brand-50',
          'shadow-md shadow-brand-500/10'
        ].join(' ') : [
          'border-gray-200 bg-white',
          'hover:border-brand-300 hover:bg-brand-25',
          'active:border-brand-400 active:bg-brand-50'
        ].join(' '),

        // Interactive effects
        !disabled && [
          buttonInteractionClasses.hover.lift,
          buttonInteractionClasses.active.press,
          'hover:shadow-lg'
        ].join(' '),

        // Focus styles
        'focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2',

        // Disabled state
        disabled && buttonInteractionClasses.state.disabled,

        className
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      <div className="flex items-start w-full">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{children}</div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {/* Visual indicator */}
        {checked && (
          <div className="absolute top-3 right-3">
            <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </label>
  )
}

// Enhanced link button with better feedback
interface LinkButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function LinkButton({
  children,
  onClick,
  href,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: LinkButtonProps) {
  const Component = href ? 'a' : 'button'

  return (
    <Component
      {...(href && { href })}
      {...(!href && { type: 'button' })}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Base styles
        'inline-flex items-center font-medium text-brand-700',
        'underline underline-offset-2 decoration-2 decoration-brand-300',
        buttonInteractionClasses.base,

        // Interactive states
        !disabled && [
          'hover:text-brand-800 hover:decoration-brand-500',
          'active:text-brand-900 active:decoration-brand-600',
          'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:rounded-sm'
        ].join(' '),

        // Disabled state
        disabled && 'opacity-60 cursor-not-allowed pointer-events-none',

        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}