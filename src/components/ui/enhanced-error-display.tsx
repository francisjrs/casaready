'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useWizard } from '@/lib/services'
import { AccessibleAlert, AccessibleText } from '@/components/ui/accessible-colors'
import { useLanguage } from '@/contexts/language-context'

interface EnhancedErrorBoxProps {
  errors: string[]
  className?: string
  variant?: 'default' | 'field' | 'form' | 'critical'
  dismissible?: boolean
  onDismiss?: () => void
  title?: string
}

export function EnhancedErrorBox({
  errors,
  className = '',
  variant = 'default',
  dismissible = false,
  onDismiss,
  title
}: EnhancedErrorBoxProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()

  if (!errors || errors.length === 0) return null

  const defaultTitle = t('wizard.shared.errorTitle')

  // Map variants to AccessibleAlert variants
  const alertVariant = variant === 'critical' ? 'error' : 'error'

  return (
    <AccessibleAlert
      variant={alertVariant}
      title={title || (variant !== 'field' ? defaultTitle : undefined)}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={cn('animate-in fade-in-0 duration-200', className)}
    >
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div key={index} className="leading-relaxed">
            {variant === 'field' ? (
              <span>• {error}</span>
            ) : (
              <div className="flex items-start">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </AccessibleAlert>
  )
}

interface FieldErrorProps {
  error?: string
  fieldName?: string
  className?: string
  show?: boolean
}

export function FieldError({ error, fieldName, className = '', show = true }: FieldErrorProps) {
  if (!error || !show) return null

  return (
    <div
      className={cn(
        'mt-2 animate-in fade-in-0 duration-200',
        className
      )}
      role="alert"
      aria-live="polite"
      id={fieldName ? `${fieldName}-error` : undefined}
    >
      <div className="flex items-start space-x-2">
        <span className="text-red-600 text-sm flex-shrink-0 mt-0.5">⚠</span>
        <AccessibleText variant="error" size="sm" weight="medium" className="leading-relaxed">
          {error}
        </AccessibleText>
      </div>
    </div>
  )
}

interface InlineValidationProps {
  isValid?: boolean
  isValidating?: boolean
  error?: string
  successMessage?: string
  className?: string
}

export function InlineValidation({
  isValid,
  isValidating = false,
  error,
  successMessage,
  className = ''
}: InlineValidationProps) {
  const { t } = useLanguage()

  if (isValidating) {
    return (
      <div className={cn('mt-2 flex items-center space-x-2', className)}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
        <span className="text-sm text-blue-600">{t('wizard.shared.validating')}</span>
      </div>
    )
  }

  if (error) {
    return <FieldError error={error} className={className} />
  }

  if (isValid && successMessage) {
    return (
      <div className={cn('mt-2 animate-in fade-in-0 duration-200', className)} role="status">
        <div className="flex items-start space-x-2">
          <span className="text-green-500 text-sm flex-shrink-0 mt-0.5">✓</span>
          <span className="text-sm font-medium text-green-700 leading-relaxed">
            {successMessage}
          </span>
        </div>
      </div>
    )
  }

  return null
}

interface FormErrorSummaryProps {
  errors: Record<string, string[]>
  className?: string
  scrollToFirst?: boolean
}

export function FormErrorSummary({ errors, className = '', scrollToFirst = true }: FormErrorSummaryProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()
  const errorEntries = Object.entries(errors).filter(([_, errs]) => errs && errs.length > 0)

  if (errorEntries.length === 0) return null

  const allErrors = errorEntries.flatMap(([field, errs]) =>
    errs.map(err => ({ field, message: err }))
  )

  const handleErrorClick = (field: string) => {
    if (scrollToFirst) {
      const element = document.getElementById(field) || document.querySelector(`[name="${field}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          if (element instanceof HTMLElement) {
            element.focus()
          }
        }, 300)
      }
    }
  }

  return (
    <EnhancedErrorBox
      errors={allErrors.map(({ field, message }) => message)}
      variant="form"
      className={className}
      title={t('wizard.shared.formValidationErrors')}
    />
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <EnhancedErrorBox
          errors={[t('wizard.shared.unexpectedError')]}
          variant="critical"
          title={t('wizard.shared.somethingWrong')}
        />

        <div className="mt-6 space-y-4">
          <button
            onClick={resetError}
            className="w-full bg-brand-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors touch-manipulation"
          >
            {t('wizard.shared.tryAgain')}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation"
          >
            {t('wizard.shared.reloadPage')}
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="text-sm text-gray-600 cursor-pointer">
              {t('wizard.shared.errorDetails')}
            </summary>
            <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}