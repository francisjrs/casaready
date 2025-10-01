'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// WCAG AA compliant color classes with proper contrast ratios
export const accessibleColors = {
  // Text colors with proper contrast ratios (4.5:1 minimum for normal text, 3:1 for large text)
  text: {
    primary: 'text-gray-900', // #111827 - Contrast ratio 16.65:1 on white
    secondary: 'text-gray-700', // #374151 - Contrast ratio 8.59:1 on white
    muted: 'text-gray-600', // #4B5563 - Contrast ratio 6.23:1 on white
    light: 'text-gray-500', // #6B7280 - Contrast ratio 4.69:1 on white (minimum AA)
    inverse: 'text-white', // White text for dark backgrounds
    brand: 'text-brand-700', // Enhanced brand color with better contrast
    success: 'text-green-700', // #047857 - Good contrast for success states
    warning: 'text-amber-700', // #B45309 - Good contrast for warning states
    error: 'text-red-700', // #B91C1C - Good contrast for error states
    info: 'text-blue-700' // #1D4ED8 - Good contrast for info states
  },

  // Background colors designed for optimal contrast
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50', // #F9FAFB
    muted: 'bg-gray-100', // #F3F4F6
    brand: 'bg-brand-600', // Primary brand background
    brandLight: 'bg-brand-50', // Light brand background
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  },

  // Interactive element colors with proper focus states
  interactive: {
    primary: 'bg-brand-600 hover:bg-brand-700 focus:bg-brand-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-900',
    outline: 'border-2 border-brand-600 text-brand-700 hover:bg-brand-50 focus:bg-brand-50',
    success: 'bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:bg-amber-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white'
  },

  // Border colors with sufficient contrast
  border: {
    primary: 'border-gray-300', // #D1D5DB
    muted: 'border-gray-200', // #E5E7EB
    brand: 'border-brand-300',
    success: 'border-green-300',
    warning: 'border-amber-300',
    error: 'border-red-300',
    focus: 'border-brand-500 ring-2 ring-brand-500 ring-offset-2'
  },

  // Focus states with enhanced visibility
  focus: {
    ring: 'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:outline-none',
    visible: 'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none',
    error: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none',
    success: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none'
  }
} as const

// High contrast text component for improved readability
interface AccessibleTextProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'muted' | 'light' | 'brand' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function AccessibleText({
  children,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className = '',
  as: Component = 'span'
}: AccessibleTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  return (
    <Component
      className={cn(
        accessibleColors.text[variant],
        sizeClasses[size],
        weightClasses[weight],
        'leading-relaxed', // Improved line height for readability
        className
      )}
    >
      {children}
    </Component>
  )
}

// High contrast button component
interface AccessibleButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'base' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}: AccessibleButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    base: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        // Base styles for accessibility
        'font-semibold rounded-xl transition-all duration-200 touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed',

        // Size classes
        sizeClasses[size],

        // Variant-specific colors with high contrast
        {
          [accessibleColors.interactive.primary]: variant === 'primary',
          [accessibleColors.interactive.secondary]: variant === 'secondary',
          [accessibleColors.interactive.outline]: variant === 'outline',
          [accessibleColors.interactive.success]: variant === 'success',
          [accessibleColors.interactive.warning]: variant === 'warning',
          [accessibleColors.interactive.error]: variant === 'error'
        },

        // Focus ring colors
        {
          'focus:ring-brand-500': variant === 'primary' || variant === 'outline',
          'focus:ring-gray-500': variant === 'secondary',
          'focus:ring-green-500': variant === 'success',
          'focus:ring-amber-500': variant === 'warning',
          'focus:ring-red-500': variant === 'error'
        },

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

// Enhanced form input with high contrast focus states
interface AccessibleInputProps {
  id?: string
  name?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
  error?: boolean
  className?: string
}

export function AccessibleInput({
  error = false,
  disabled = false,
  className = '',
  ...props
}: AccessibleInputProps) {
  return (
    <input
      className={cn(
        // Base styles with high contrast
        'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200',
        'text-gray-900 placeholder-gray-500',
        'bg-white border-gray-300',

        // Focus states with enhanced contrast
        'focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:outline-none',
        'hover:border-brand-400',

        // Error states
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',

        // Disabled states
        disabled && 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60',

        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}

// High contrast alert/notification component
interface AccessibleAlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function AccessibleAlert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = ''
}: AccessibleAlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-300 border-2',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-800'
    },
    success: {
      container: 'bg-green-50 border-green-300 border-2',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800'
    },
    warning: {
      container: 'bg-amber-50 border-amber-300 border-2',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      text: 'text-amber-800'
    },
    error: {
      container: 'bg-red-50 border-red-300 border-2',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800'
    }
  }

  const styles = variantStyles[variant]
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }

  return (
    <div
      className={cn(
        styles.container,
        'rounded-xl p-4 shadow-sm',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <span className={cn(styles.icon, 'text-xl flex-shrink-0 mt-0.5')} aria-hidden="true">
          {icons[variant]}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(styles.title, 'font-semibold text-base mb-2')}>
              {title}
            </h3>
          )}
          <div className={cn(styles.text, 'text-sm font-medium leading-relaxed')}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              styles.icon,
              'hover:opacity-70 focus:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2',
              'rounded transition-all duration-200 p-1'
            )}
            aria-label="Dismiss alert"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}