'use client'

import React from 'react'
import { useWizard } from '@/lib/services'
import { cn } from '@/lib/utils'

interface SkipLinksProps {
  className?: string
}

export function SkipLinks({ className = '' }: SkipLinksProps) {
  const { locale } = useWizard()

  const skipLinks = [
    {
      href: '#main-content',
      label: locale === 'en' ? 'Skip to main content' : 'Saltar al contenido principal'
    },
    {
      href: '#wizard-navigation',
      label: locale === 'en' ? 'Skip to navigation' : 'Saltar a la navegación'
    },
    {
      href: '#wizard-progress',
      label: locale === 'en' ? 'Skip to progress' : 'Saltar al progreso'
    },
    {
      href: '#next-step-button',
      label: locale === 'en' ? 'Skip to next step' : 'Saltar al siguiente paso'
    }
  ]

  return (
    <nav
      className={cn('sr-only focus-within:not-sr-only', className)}
      aria-label={locale === 'en' ? 'Skip links' : 'Enlaces de salto'}
    >
      <ul className="fixed top-0 left-0 z-[9999] bg-white border border-gray-300 rounded-br-lg shadow-lg p-2 space-y-1">
        {skipLinks.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className="block px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 rounded-md hover:bg-brand-100 focus:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                const target = document.querySelector(link.href)
                if (target instanceof HTMLElement) {
                  target.focus({ preventScroll: false })
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className = '' }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  )
}

interface LiveRegionProps {
  children: React.ReactNode
  type?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  className?: string
}

export function LiveRegion({
  children,
  type = 'polite',
  atomic = true,
  className = ''
}: LiveRegionProps) {
  return (
    <div
      aria-live={type}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  )
}

interface WizardLandmarkProps {
  children: React.ReactNode
  className?: string
}

export function WizardLandmarks({ children, className = '' }: WizardLandmarkProps) {
  const { locale } = useWizard()

  return (
    <div className={className}>
      {/* Skip Links */}
      <SkipLinks />

      {/* Main landmark wrapper */}
      <main
        id="main-content"
        role="main"
        aria-label={locale === 'en' ? 'Home buying wizard' : 'Asistente de compra de casa'}
        tabIndex={-1}
        className="focus:outline-none"
      >
        {children}
      </main>
    </div>
  )
}

interface ProgressAnnouncementProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  completionPercentage: number
  className?: string
}

export function ProgressAnnouncement({
  currentStep,
  totalSteps,
  stepTitle,
  completionPercentage,
  className = ''
}: ProgressAnnouncementProps) {
  const { locale } = useWizard()

  const announcement = locale === 'en'
    ? `Step ${currentStep} of ${totalSteps}: ${stepTitle}. ${completionPercentage}% complete.`
    : `Paso ${currentStep} de ${totalSteps}: ${stepTitle}. ${completionPercentage}% completado.`

  return (
    <LiveRegion className={className}>
      {announcement}
    </LiveRegion>
  )
}

interface StepNavigationLandmarkProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  className?: string
}

export function StepNavigationLandmark({
  children,
  currentStep,
  totalSteps,
  className = ''
}: StepNavigationLandmarkProps) {
  const { locale } = useWizard()

  return (
    <nav
      id="wizard-navigation"
      role="navigation"
      aria-label={locale === 'en' ? 'Wizard step navigation' : 'Navegación de pasos del asistente'}
      aria-describedby="nav-description"
      tabIndex={-1}
      className={cn('focus:outline-none', className)}
    >
      <ScreenReaderOnly>
        <p id="nav-description">
          {locale === 'en'
            ? `Navigation for multi-step wizard. Current step: ${currentStep} of ${totalSteps}.`
            : `Navegación para asistente de múltiples pasos. Paso actual: ${currentStep} de ${totalSteps}.`}
        </p>
      </ScreenReaderOnly>
      {children}
    </nav>
  )
}

interface FormLandmarkProps {
  children: React.ReactNode
  stepTitle: string
  stepDescription?: string
  hasErrors?: boolean
  className?: string
}

export function FormLandmark({
  children,
  stepTitle,
  stepDescription,
  hasErrors = false,
  className = ''
}: FormLandmarkProps) {
  const { locale } = useWizard()

  return (
    <section
      role="form"
      aria-label={stepTitle}
      aria-describedby={stepDescription ? 'step-description' : undefined}
      aria-invalid={hasErrors}
      className={cn('focus:outline-none', className)}
    >
      {stepDescription && (
        <ScreenReaderOnly>
          <p id="step-description">{stepDescription}</p>
        </ScreenReaderOnly>
      )}

      {hasErrors && (
        <ScreenReaderOnly>
          <p role="alert" aria-live="assertive">
            {locale === 'en'
              ? 'This form contains errors. Please review and correct the highlighted fields.'
              : 'Este formulario contiene errores. Por favor revisa y corrige los campos resaltados.'}
          </p>
        </ScreenReaderOnly>
      )}

      {children}
    </section>
  )
}

interface ButtonGroupLandmarkProps {
  children: React.ReactNode
  className?: string
}

export function ButtonGroupLandmark({ children, className = '' }: ButtonGroupLandmarkProps) {
  const { locale } = useWizard()

  return (
    <div
      role="group"
      aria-label={locale === 'en' ? 'Step navigation buttons' : 'Botones de navegación de pasos'}
      className={className}
    >
      {children}
    </div>
  )
}

interface KeyboardShortcutsHelpProps {
  className?: string
}

export function KeyboardShortcutsHelp({ className = '' }: KeyboardShortcutsHelpProps) {
  const { locale } = useWizard()

  const shortcuts = [
    {
      keys: locale === 'en' ? 'Ctrl/Cmd + Left Arrow' : 'Ctrl/Cmd + Flecha Izquierda',
      action: locale === 'en' ? 'Previous step' : 'Paso anterior'
    },
    {
      keys: locale === 'en' ? 'Ctrl/Cmd + Right Arrow' : 'Ctrl/Cmd + Flecha Derecha',
      action: locale === 'en' ? 'Next step' : 'Siguiente paso'
    },
    {
      keys: locale === 'en' ? 'Alt + N' : 'Alt + N',
      action: locale === 'en' ? 'Focus next button' : 'Enfocar botón siguiente'
    },
    {
      keys: locale === 'en' ? 'Alt + M' : 'Alt + M',
      action: locale === 'en' ? 'Focus main content' : 'Enfocar contenido principal'
    }
  ]

  return (
    <div className={cn('sr-only', className)}>
      <h3>{locale === 'en' ? 'Keyboard Shortcuts' : 'Atajos de Teclado'}</h3>
      <dl>
        {shortcuts.map((shortcut, index) => (
          <div key={index}>
            <dt>{shortcut.keys}:</dt>
            <dd>{shortcut.action}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// Hook for managing focus announcements
export function useFocusAnnouncements() {
  const { locale } = useWizard()

  const announceStepChange = (stepTitle: string, stepNumber: number, totalSteps: number) => {
    const message = locale === 'en'
      ? `Navigated to ${stepTitle}, step ${stepNumber} of ${totalSteps}`
      : `Navegado a ${stepTitle}, paso ${stepNumber} de ${totalSteps}`

    // Create temporary announcement element
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const announceValidationError = (fieldName: string, error: string) => {
    const message = locale === 'en'
      ? `Validation error in ${fieldName}: ${error}`
      : `Error de validación en ${fieldName}: ${error}`

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 3000)
  }

  const announceSuccess = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 2000)
  }

  return {
    announceStepChange,
    announceValidationError,
    announceSuccess
  }
}