'use client'

import { AccessibleText } from '@/components/ui/accessible-colors'
import { useLanguage } from '@/contexts/language-context'

interface LoadingFallbackProps {
  message?: string
  size?: 'sm' | 'base' | 'lg'
  showSpinner?: boolean
  className?: string
}

export function LoadingFallback({
  message,
  size = 'base',
  showSpinner = true,
  className = ''
}: LoadingFallbackProps) {
  const { t } = useLanguage()
  const defaultMessage = message || t('wizard.loading.default')
  const displayMessage = defaultMessage

  const sizeClasses = {
    sm: {
      container: 'py-6',
      spinner: 'h-6 w-6',
      text: 'text-sm'
    },
    base: {
      container: 'py-12',
      spinner: 'h-8 w-8',
      text: 'text-base'
    },
    lg: {
      container: 'py-16',
      spinner: 'h-12 w-12',
      text: 'text-lg'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div
      className={`flex flex-col items-center justify-center ${classes.container} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      {showSpinner && (
        <div className="relative mb-4">
          <div className={`animate-spin rounded-full ${classes.spinner} border-4 border-brand-200`}></div>
          <div className={`animate-spin rounded-full ${classes.spinner} border-t-4 border-brand-600 absolute top-0 left-0`}></div>
        </div>
      )}

      <AccessibleText variant="secondary" size="base" weight="medium" className={classes.text}>
        {displayMessage}
      </AccessibleText>
    </div>
  )
}

// Skeleton loading component for better perceived performance
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  const animateClasses = animate ? 'animate-pulse' : ''

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animateClasses} ${className}`}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  )
}

// Form skeleton for wizard steps
interface FormSkeletonProps {
  fields?: number
  showButtons?: boolean
  className?: string
}

export function FormSkeleton({
  fields = 3,
  showButtons = true,
  className = ''
}: FormSkeletonProps) {
  const { t } = useLanguage()
  return (
    <div className={`space-y-6 ${className}`} role="presentation" aria-hidden="true">
      {/* Step Header Skeleton */}
      <div className="text-center space-y-3">
        <Skeleton variant="rectangular" className="h-6 w-24 mx-auto" />
        <Skeleton variant="text" className="h-8 w-64 mx-auto" />
        <Skeleton variant="text" className="h-4 w-80 mx-auto" />
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="rectangular" className="h-12 w-full" />
          </div>
        ))}
      </div>

      {/* Buttons Skeleton */}
      {showButtons && (
        <div className="flex justify-between pt-6">
          <Skeleton variant="rectangular" className="h-12 w-24" />
          <Skeleton variant="rectangular" className="h-12 w-32" />
        </div>
      )}

      {/* Loading announcement for screen readers */}
      <div className="sr-only" aria-live="polite">
        {t('wizard.loading.form')}
      </div>
    </div>
  )
}

// Step content skeleton
interface StepSkeletonProps {
  variant?: 'form' | 'cards' | 'list'
  className?: string
}

export function StepSkeleton({
  variant = 'form',
  className = ''
}: StepSkeletonProps) {
  const { t } = useLanguage()

  if (variant === 'form') {
    return <FormSkeleton className={className} />
  }

  if (variant === 'cards') {
    return (
      <div className={`space-y-6 ${className}`} role="presentation" aria-hidden="true">
        <div className="text-center space-y-3">
          <Skeleton variant="rectangular" className="h-6 w-24 mx-auto" />
          <Skeleton variant="text" className="h-8 w-64 mx-auto" />
          <Skeleton variant="text" className="h-4 w-80 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-xl space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" className="h-8 w-8" />
                <Skeleton variant="text" className="h-5 w-32" />
              </div>
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <Skeleton variant="rectangular" className="h-12 w-24" />
          <Skeleton variant="rectangular" className="h-12 w-32" />
        </div>

        <div className="sr-only" aria-live="polite">
          {t('wizard.loading.options')}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-6 ${className}`} role="presentation" aria-hidden="true">
        <div className="text-center space-y-3">
          <Skeleton variant="rectangular" className="h-6 w-24 mx-auto" />
          <Skeleton variant="text" className="h-8 w-64 mx-auto" />
          <Skeleton variant="text" className="h-4 w-80 mx-auto" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
              <Skeleton variant="rectangular" className="h-5 w-5" />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" className="h-4 w-48" />
                <Skeleton variant="text" className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <Skeleton variant="rectangular" className="h-12 w-24" />
          <Skeleton variant="rectangular" className="h-12 w-32" />
        </div>

        <div className="sr-only" aria-live="polite">
          {t('wizard.loading.list')}
        </div>
      </div>
    )
  }

  return null
}