'use client'

import React from 'react'
import { useWizard } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import { StepButton } from '@/components/ui/enhanced-button-states'

interface AccessibleStepIndicatorProps {
  steps: Array<{
    id: number
    title: { en: string; es: string }
    description: { en: string; es: string }
  }>
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (stepId: number) => void
  className?: string
}

export function AccessibleStepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className = ''
}: AccessibleStepIndicatorProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.has(stepNumber)) return 'completed'
    if (stepNumber === currentStep) return 'current'
    if (stepNumber < currentStep) return 'available'
    return 'upcoming'
  }

  const getAriaLabel = (step: any, stepNumber: number, status: string) => {
    const baseLabel = step.title[locale]
    const statusLabels = {
      completed: t('wizard.stepIndicator.statusLabels.completed'),
      current: t('wizard.stepIndicator.statusLabels.current'),
      available: t('wizard.stepIndicator.statusLabels.available'),
      upcoming: t('wizard.stepIndicator.statusLabels.upcoming')
    }

    const positionLabel = t('wizard.stepIndicator.stepOf')
      .replace('{{current}}', stepNumber.toString())
      .replace('{{total}}', steps.length.toString())

    return `${baseLabel}, ${positionLabel}, ${statusLabels[status as keyof typeof statusLabels]}`
  }

  const getStepDescription = (step: any, stepNumber: number, status: string) => {
    const baseDescription = step.description[locale]
    const actionText = status === 'available' || status === 'completed'
      ? t('wizard.stepIndicator.actionDescriptions.clickToNavigate')
      : status === 'current'
        ? t('wizard.stepIndicator.actionDescriptions.currentStep')
        : t('wizard.stepIndicator.actionDescriptions.futureStep')

    return `${baseDescription}. ${actionText}`
  }

  return (
    <nav
      role="navigation"
      aria-label={t('wizard.stepIndicator.navLabel')}
      className={cn('overflow-x-auto', className)}
    >
      <ol
        role="list"
        aria-label={t('wizard.stepIndicator.totalStepsLabel').replace('{{count}}', steps.length.toString())}
        className="flex items-center space-x-1 sm:space-x-2 pb-2 scrollbar-hide min-w-max landscape:pb-1 landscape:space-x-0.5 landscape:sm:space-x-1"
      >
        {steps.map((step, index) => {
          const stepNumber = step.id
          const status = getStepStatus(stepNumber)
          const isInteractive = status === 'available' || status === 'completed' || status === 'current'
          const isCurrent = status === 'current'
          const isCompleted = status === 'completed'

          return (
            <li
              key={step.id}
              className="flex items-center flex-shrink-0"
              role="listitem"
            >
              {/* Enhanced Step Button/Indicator */}
              <StepButton
                stepNumber={stepNumber}
                title={step.title[locale]}
                status={status}
                onClick={isInteractive ? () => onStepClick(stepNumber) : undefined}
                disabled={!isInteractive}
                aria-describedby={`step-${stepNumber}-description`}
              />

              {/* Hidden description for screen readers */}
              <div
                id={`step-${stepNumber}-description`}
                className="sr-only"
                aria-live="polite"
              >
                {getStepDescription(step, stepNumber, status)}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-4 sm:w-6 h-1 mx-0.5 sm:mx-1 rounded-full transition-colors duration-300 landscape:w-2 landscape:sm:w-4 landscape:mx-0.25 landscape:sm:mx-0.5',
                    {
                      'bg-green-500': isCompleted,
                      'bg-brand-300': isCurrent,
                      'bg-gray-200': status === 'upcoming'
                    }
                  )}
                  aria-hidden="true"
                  role="presentation"
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Current step announcement for screen readers */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {t('wizard.stepIndicator.currentStepAnnouncement')
          .replace('{{current}}', currentStep.toString())
          .replace('{{title}}', steps.find(s => s.id === currentStep)?.title[locale] || '')}
      </div>
    </nav>
  )
}

interface StepProgressSummaryProps {
  currentStep: number
  totalSteps: number
  completedSteps: Set<number>
  className?: string
}

export function StepProgressSummary({
  currentStep,
  totalSteps,
  completedSteps,
  className = ''
}: StepProgressSummaryProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()
  const completedCount = completedSteps.size
  const progressPercentage = Math.round((completedCount / totalSteps) * 100)

  return (
    <div
      className={cn('text-sm text-gray-600', className)}
      role="status"
      aria-live="polite"
      aria-label={t('wizard.stepIndicator.progressSummaryLabel')}
    >
      <div className="flex items-center justify-between">
        <span>
          {t('wizard.stepIndicator.progressSummary.stepOf')
            .replace('{{current}}', currentStep.toString())
            .replace('{{total}}', totalSteps.toString())}
        </span>
        <span>
          {t('wizard.stepIndicator.progressSummary.completedProgress')
            .replace('{{completed}}', completedCount.toString())
            .replace('{{percentage}}', progressPercentage.toString())}
        </span>
      </div>

      {/* Detailed progress for screen readers */}
      <div className="sr-only">
        {t('wizard.stepIndicator.progressSummary.detailedProgress')
          .replace('{{completed}}', completedCount.toString())
          .replace('{{total}}', totalSteps.toString())
          .replace('{{current}}', currentStep.toString())
          .replace('{{percentage}}', progressPercentage.toString())}
      </div>
    </div>
  )
}

interface WizardBreadcrumbProps {
  steps: Array<{
    id: number
    title: { en: string; es: string }
  }>
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (stepId: number) => void
  className?: string
}

export function WizardBreadcrumb({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className = ''
}: WizardBreadcrumbProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()

  return (
    <nav
      aria-label={t('wizard.stepIndicator.breadcrumbLabel')}
      className={cn('text-sm', className)}
    >
      <ol role="list" className="flex items-center space-x-2">
        {steps.slice(0, currentStep).map((step, index) => {
          const stepNumber = step.id
          const isCompleted = completedSteps.has(stepNumber)
          const isCurrent = stepNumber === currentStep
          const isClickable = isCompleted || stepNumber <= currentStep

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 && (
                <span className="mr-2 text-gray-400" aria-hidden="true">
                  /
                </span>
              )}
              {isClickable ? (
                <button
                  onClick={() => onStepClick(stepNumber)}
                  className={cn(
                    'hover:text-brand-600 focus:text-brand-600 focus:outline-none focus:underline transition-colors',
                    {
                      'text-brand-600 font-medium': isCurrent,
                      'text-gray-600': !isCurrent
                    }
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                  type="button"
                >
                  {step.title[locale]}
                </button>
              ) : (
                <span className="text-gray-400">
                  {step.title[locale]}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}