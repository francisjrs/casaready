'use client'

import { useMemo, Suspense, lazy, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { WizardProvider, useWizard } from '@/lib/services'
import { WIZARD_STEPS, STEP_COMPONENTS_MAP, getStepById, getStepProgress, isLastStep, type StepConfig } from './steps'
import { useKeyboardNavigation, useStepFocus } from '@/hooks/use-focus-management'
import {
  WizardLandmarks,
  ProgressAnnouncement,
  StepNavigationLandmark,
  FormLandmark,
  KeyboardShortcutsHelp,
  useFocusAnnouncements
} from '@/components/ui/accessibility-enhancements'
import {
  AccessibleStepIndicator,
  StepProgressSummary,
  WizardBreadcrumb
} from '@/components/ui/accessible-step-indicator'
import { AccessibleText } from '@/components/ui/accessible-colors'
import { ErrorBoundary, WizardStepErrorBoundary } from '@/components/ui/error-boundary'
import { StepSkeleton } from '@/components/ui/loading-fallback'
import { StepTransition, PageTransition, FadeTransition, ProgressTransition } from '@/components/ui/transition-animations'
import { ProgressRestoration, ProgressSaveIndicator, useProgressAutoSave } from '@/components/wizard/progress-restoration'
import { hasSavedProgress } from '@/lib/services/wizard-storage'

export function InteractiveHomebuyerWizard() {
  const { locale } = useLanguage()

  const memoizedSteps = useMemo(() => WIZARD_STEPS, [])

  return (
    <ErrorBoundary
      locale={locale}
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log error for analytics/monitoring
        console.error('Wizard Error:', error, errorInfo)
        // Could send to error tracking service here
      }}
    >
      <WizardProvider totalSteps={memoizedSteps.length} locale={locale}>
        <WizardLayout steps={memoizedSteps} />
      </WizardProvider>
    </ErrorBoundary>
  )
}

interface WizardLayoutProps {
  steps: StepConfig[]
}

function WizardLayout({ steps }: WizardLayoutProps) {
  const { t } = useLanguage()
  const { currentStep, goToNextStep, goToPreviousStep, completedSteps, locale, isTransitioning, isValidating, restoreProgress } = useWizard()
  const [StepComponent, setStepComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProgressRestoration, setShowProgressRestoration] = useState(false)
  const { showSaveIndicator, triggerSaveIndicator } = useProgressAutoSave()

  // Focus management
  const { containerRef, announceStepCompletion } = useStepFocus()
  const { announceStepChange } = useFocusAnnouncements()

  // Global keyboard navigation
  useKeyboardNavigation()

  const currentStepConfig = getStepById(currentStep)

  // Check for saved progress on component mount
  useEffect(() => {
    if (hasSavedProgress()) {
      setShowProgressRestoration(true)
    }
  }, [])

  // Load step component dynamically
  useEffect(() => {
    setIsLoading(true)
    setStepComponent(null)

    const loadComponent = async () => {
      try {
        const componentLoader = STEP_COMPONENTS_MAP[currentStep as keyof typeof STEP_COMPONENTS_MAP]
        if (componentLoader) {
          const component = await componentLoader()
          setStepComponent(() => component)
        }
      } catch (error) {
        console.error('Failed to load step component:', error)
        // Set component to null so error boundary can handle it
        setStepComponent(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadComponent()
  }, [currentStep])

  const handleNext = () => {
    if (!isLastStep(currentStep)) {
      const currentStepName = currentStepConfig?.title[locale] || `Step ${currentStep}`
      announceStepCompletion(currentStepName)
      triggerSaveIndicator() // Show save indicator
      goToNextStep()

      // Announce step change for screen readers
      setTimeout(() => {
        const nextStepConfig = getStepById(currentStep + 1)
        const nextStepName = nextStepConfig?.title[locale] || `Step ${currentStep + 1}`
        announceStepChange(nextStepName, currentStep + 1, steps.length)
      }, 100)
    }
  }

  const handleProgressRestore = (progress: any) => {
    restoreProgress(progress)
    setShowProgressRestoration(false)
  }

  const handleStartFresh = () => {
    setShowProgressRestoration(false)
  }

  // Handle keyboard navigation events
  useEffect(() => {
    const handleWizardKeyboard = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.type === 'wizard:next-step') {
        handleNext()
      } else if (customEvent.type === 'wizard:previous-step') {
        if (currentStep > 1) {
          goToPreviousStep()
        }
      }
    }

    window.addEventListener('wizard:next-step', handleWizardKeyboard)
    window.addEventListener('wizard:previous-step', handleWizardKeyboard)

    return () => {
      window.removeEventListener('wizard:next-step', handleWizardKeyboard)
      window.removeEventListener('wizard:previous-step', handleWizardKeyboard)
    }
  }, [currentStep, goToPreviousStep, handleNext, announceStepCompletion])

  if (!currentStepConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('wizard.progress.stepNotFound')}
          </h2>
          <p className="text-gray-600">
            {t('wizard.progress.stepLoadError')}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading || !StepComponent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fff9f3] to-[#f8cfa2]">
        <WizardProgress steps={steps} />

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 landscape:py-4 landscape:sm:py-6 flex-1 w-full">
          <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8 lg:p-10 xl:p-12 landscape:p-4 landscape:sm:p-6">
              <StepSkeleton
                locale={locale}
                variant="form"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WizardLandmarks className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#fff9f3] to-[#f8cfa2]">
      {/* Progress announcements for screen readers */}
      <ProgressAnnouncement
        currentStep={currentStep}
        totalSteps={steps.length}
        stepTitle={currentStepConfig.title[locale]}
        completionPercentage={getStepProgress(currentStep)}
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp />

      <WizardProgress steps={steps} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 landscape:py-4 landscape:sm:py-6 flex-1 w-full">
        <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-4xl mx-auto">
          <FormLandmark
            stepTitle={currentStepConfig.title[locale]}
            stepDescription={currentStepConfig.description[locale]}
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8 lg:p-10 xl:p-12 landscape:p-4 landscape:sm:p-6"
          >
            <div
              ref={containerRef}
              tabIndex={-1}
              className="focus:outline-none"
            >
              {/* Step Header */}
              <StepTransition
                isVisible={!isTransitioning}
                direction="forward"
              >
                <header className="mb-8 sm:mb-6 lg:mb-10 xl:mb-12 landscape:mb-4 landscape:sm:mb-3 text-center space-y-4 sm:space-y-2 lg:space-y-6 landscape:space-y-2 landscape:sm:space-y-1">
                  <FadeTransition
                    isVisible={!isTransitioning}
                    delay={100}
                  >
                    <div className="inline-flex items-center px-4 py-2 sm:px-3 sm:py-1 landscape:px-3 landscape:py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
                      <span aria-label={t('wizard.progress.stepCounter', { current: currentStep, total: steps.length })}>
                        {t('wizard.progress.stepCounter', { current: currentStep, total: steps.length })}
                      </span>
                    </div>
                  </FadeTransition>
                  <FadeTransition
                    isVisible={!isTransitioning}
                    delay={200}
                  >
                    <AccessibleText as="h1" id="step-title" variant="primary" size="2xl" weight="bold" className="leading-tight lg:text-4xl xl:text-5xl landscape:text-xl landscape:sm:text-2xl">
                      {currentStepConfig.title[locale]}
                    </AccessibleText>
                  </FadeTransition>
                  <FadeTransition
                    isVisible={!isTransitioning}
                    delay={300}
                  >
                    <AccessibleText as="p" id="step-description" variant="secondary" size="base" className="leading-relaxed max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto lg:text-lg xl:text-xl landscape:text-sm landscape:sm:text-base">
                      {currentStepConfig.description[locale]}
                    </AccessibleText>
                  </FadeTransition>
                </header>
              </StepTransition>

              {/* Step Component */}
              <div className="space-y-8 sm:space-y-6 lg:space-y-10 xl:space-y-12 landscape:space-y-4 landscape:sm:space-y-4 relative">
                {/* Transition Loading Overlay */}
                {isTransitioning && (
                  <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-50 flex items-center justify-center"
                    role="status"
                    aria-live="polite"
                    aria-label={t('wizard.progress.loadingNextStep')}
                  >
                    <div className="text-center space-y-3">
                      <div className="relative" aria-hidden="true">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-200"></div>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-brand-600 absolute top-0 left-0"></div>
                      </div>
                      <AccessibleText variant="secondary" size="sm" weight="medium">
                        {t('wizard.progress.transitioning')}
                      </AccessibleText>
                    </div>
                  </div>
                )}

                <StepTransition
                  isVisible={!isTransitioning}
                  direction="forward"
                >
                  <WizardStepErrorBoundary
                    stepName={currentStepConfig.title[locale]}
                    locale={locale}
                    onRetry={() => window.location.reload()}
                  >
                    <StepComponent onNext={handleNext} />
                  </WizardStepErrorBoundary>
                </StepTransition>
              </div>
            </div>
          </FormLandmark>
        </div>
      </div>

      {/* Progress Restoration Modal */}
      {showProgressRestoration && (
        <ProgressRestoration
          locale={locale}
          onRestore={handleProgressRestore}
          onStartFresh={handleStartFresh}
        />
      )}

      {/* Progress Save Indicator */}
      <ProgressSaveIndicator
        isVisible={showSaveIndicator}
        locale={locale}
      />
    </WizardLandmarks>
  )
}

interface WizardProgressProps {
  steps: StepConfig[]
}

function WizardProgress({ steps }: WizardProgressProps) {
  const { t } = useLanguage()
  const { currentStep, completedSteps, locale, goToStep } = useWizard()
  const progressPercentage = getStepProgress(currentStep)

  const handleStepClick = (stepId: number) => {
    // Only allow navigation to completed steps or the current step
    if (stepId <= currentStep || completedSteps.has(stepId)) {
      goToStep(stepId)
    }
  }

  return (
    <header
      id="wizard-progress"
      className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      role="banner"
      aria-label={t('wizard.progress.title')}
    >
      <div className="container mx-auto px-4 py-4 landscape:py-2 landscape:sm:py-3">
        <div className="flex items-center justify-between mb-4 landscape:mb-2 landscape:sm:mb-3">
          <AccessibleText as="h1" variant="primary" size="xl" weight="bold" className="landscape:text-lg landscape:sm:text-xl">
            <span aria-hidden="true">🏠</span>
            <span className="hidden sm:inline">{t('wizard.progress.title')}</span>
            <span className="sm:hidden">{t('wizard.progress.titleMobile')}</span>
          </AccessibleText>
          <div aria-live="polite">
            <span className="sr-only">
              {t('wizard.progress.progressLabel')}
            </span>
            <AccessibleText variant="muted" size="sm" className="landscape:text-xs landscape:sm:text-sm">
              {t('wizard.progress.stepCounter', { current: currentStep, total: steps.length })} • {t('wizard.progress.percentComplete', { percent: progressPercentage })}
            </AccessibleText>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full bg-gray-200 rounded-full h-2 mb-4 landscape:mb-2 landscape:sm:mb-3 landscape:h-1.5"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('wizard.progress.percentComplete', { percent: progressPercentage })}
        >
          <ProgressTransition
            progress={progressPercentage}
            className="h-2 landscape:h-1.5"
            animated={true}
          />
        </div>

        {/* Enhanced Step Indicators */}
        <AccessibleStepIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Progress Summary */}
        <StepProgressSummary
          currentStep={currentStep}
          totalSteps={steps.length}
          completedSteps={completedSteps}
          className="mt-2 hidden sm:block landscape:hidden"
        />

        {/* Breadcrumb Navigation for mobile */}
        <WizardBreadcrumb
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          className="mt-2 block sm:hidden landscape:block landscape:sm:block landscape:text-xs"
        />

      </div>
    </header>
  )
}
