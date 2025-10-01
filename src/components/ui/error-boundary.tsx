'use client'

import React, { Component, ReactNode } from 'react'
import { AccessibleAlert, AccessibleText } from '@/components/ui/accessible-colors'
import { EnhancedButton } from '@/components/ui/enhanced-button-states'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  locale?: 'en' | 'es'
  showDetails?: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { locale = 'en', showDetails = false } = this.props
      const { error, errorInfo } = this.state

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff9f3] to-[#f8cfa2] p-4">
          <div className="max-w-2xl w-full">
            <AccessibleAlert
              variant="error"
              className="p-6 sm:p-8"
            >
              <div className="text-center space-y-6">
                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>

                {/* Error Message */}
                <div className="space-y-2">
                  <AccessibleText as="h1" variant="error" size="xl" weight="bold">
                    {locale === 'en' ? 'Something went wrong' : 'Algo salió mal'}
                  </AccessibleText>
                  <AccessibleText variant="secondary" size="base">
                    {locale === 'en'
                      ? 'We encountered an unexpected error. Please try again or reload the page.'
                      : 'Encontramos un error inesperado. Por favor intenta de nuevo o recarga la página.'
                    }
                  </AccessibleText>
                </div>

                {/* Error Details (if enabled) */}
                {showDetails && error && (
                  <details className="text-left bg-gray-50 p-4 rounded-lg border">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      {locale === 'en' ? 'Technical Details' : 'Detalles Técnicos'}
                    </summary>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <strong>{locale === 'en' ? 'Error:' : 'Error:'}</strong>
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border">
                          {error.message}
                        </pre>
                      </div>
                      {error.stack && (
                        <div>
                          <strong>{locale === 'en' ? 'Stack Trace:' : 'Seguimiento de Pila:'}</strong>
                          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <EnhancedButton
                    onClick={this.handleRetry}
                    variant="primary"
                    size="base"
                    className="w-full sm:w-auto"
                  >
                    {locale === 'en' ? 'Try Again' : 'Intentar de Nuevo'}
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={this.handleReload}
                    variant="secondary"
                    size="base"
                    className="w-full sm:w-auto"
                  >
                    {locale === 'en' ? 'Reload Page' : 'Recargar Página'}
                  </EnhancedButton>
                </div>

                {/* Help Text */}
                <AccessibleText variant="muted" size="sm" className="max-w-md mx-auto">
                  {locale === 'en'
                    ? 'If the problem persists, please contact support or try again later.'
                    : 'Si el problema persiste, por favor contacta soporte o intenta más tarde.'
                  }
                </AccessibleText>
              </div>
            </AccessibleAlert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Component-specific error boundary for wizard steps
interface WizardStepErrorBoundaryProps {
  children: ReactNode
  stepName: string
  locale?: 'en' | 'es'
  onRetry?: () => void
}

export function WizardStepErrorBoundary({
  children,
  stepName,
  locale = 'en',
  onRetry
}: WizardStepErrorBoundaryProps) {
  const fallback = (
    <div className="py-8 text-center">
      <AccessibleAlert variant="error" className="p-6">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <AccessibleText as="h3" variant="error" size="lg" weight="semibold">
              {locale === 'en' ? 'Step Loading Error' : 'Error al Cargar Paso'}
            </AccessibleText>
            <AccessibleText variant="secondary" size="sm">
              {locale === 'en'
                ? `There was a problem loading the "${stepName}" step. Please try again.`
                : `Hubo un problema cargando el paso "${stepName}". Por favor intenta de nuevo.`
              }
            </AccessibleText>
          </div>

          <EnhancedButton
            onClick={onRetry || (() => window.location.reload())}
            variant="primary"
            size="base"
            className="w-full sm:w-auto"
          >
            {locale === 'en' ? 'Retry Step' : 'Reintentar Paso'}
          </EnhancedButton>
        </div>
      </AccessibleAlert>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback}
      locale={locale}
      onError={(error, errorInfo) => {
        console.error(`Error in wizard step "${stepName}":`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Async component error boundary for lazy-loaded components
interface AsyncErrorBoundaryProps {
  children: ReactNode
  locale?: 'en' | 'es'
  componentName?: string
}

export function AsyncErrorBoundary({
  children,
  locale = 'en',
  componentName = 'Component'
}: AsyncErrorBoundaryProps) {
  const fallback = (
    <div className="py-12 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div className="space-y-1">
          <AccessibleText variant="secondary" size="base" weight="medium">
            {locale === 'en' ? 'Loading Error' : 'Error de Carga'}
          </AccessibleText>
          <AccessibleText variant="muted" size="sm">
            {locale === 'en'
              ? `Failed to load ${componentName}. Please refresh the page.`
              : `Error al cargar ${componentName}. Por favor recarga la página.`
            }
          </AccessibleText>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback}
      locale={locale}
      onError={(error, errorInfo) => {
        console.error(`Error loading async component "${componentName}":`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}