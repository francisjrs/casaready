'use client'

import { useWizard } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'
import { ButtonGroupLandmark } from '@/components/ui/accessibility-enhancements'
import { EnhancedButton } from '@/components/ui/enhanced-button-states'
import { FadeTransition } from '@/components/ui/transition-animations'

interface WizardNavigationProps {
  onNext: () => void
  isLoading?: boolean
  loadingText?: string
  nextText?: string
  showBack?: boolean
  disabled?: boolean
  className?: string
}

export function WizardNavigation({
  onNext,
  isLoading = false,
  loadingText,
  nextText,
  showBack = true,
  disabled = false,
  className = ''
}: WizardNavigationProps) {
  const { t } = useLanguage()
  const { locale, isTransitioning, currentStep } = useWizard()

  const defaultLoadingText = loadingText || t('wizard.navigation.processing')
  const defaultNextText = nextText || t('wizard.navigation.nextStep')

  const handleBack = () => {
    window.history.back()
  }

  const isButtonDisabled = disabled || isLoading || isTransitioning

  return (
    <FadeTransition
      isVisible={true}
      delay={400}
      duration="normal"
    >
      <ButtonGroupLandmark className={`pt-8 sm:pt-6 landscape:pt-4 landscape:sm:pt-5 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center landscape:space-y-3 ${className}`}>
        {/* Back Button */}
        {showBack && currentStep > 1 && (
          <FadeTransition
            isVisible={!isTransitioning}
            delay={0}
            duration="fast"
          >
            <EnhancedButton
              onClick={handleBack}
              disabled={isTransitioning}
              variant="secondary"
              size="base"
              className="w-full sm:w-auto flex items-center justify-center landscape:min-h-[44px]"
              aria-label={t('wizard.navigation.ariaLabels.goBackToPrevious')}
            >
              <span className="mr-2" aria-hidden="true">←</span>
              {t('wizard.navigation.back')}
            </EnhancedButton>
          </FadeTransition>
        )}

        {/* Spacer when no back button */}
        {(!showBack || currentStep === 1) && (
          <div className="hidden sm:block" aria-hidden="true"></div>
        )}

        {/* Next Button */}
        <FadeTransition
          isVisible={true}
          delay={100}
          duration="fast"
        >
          <EnhancedButton
            onClick={onNext}
            disabled={isButtonDisabled}
            variant="primary"
            size="base"
            loading={isLoading || isTransitioning}
            className="w-full sm:w-auto flex items-center justify-center landscape:min-h-[44px]"
            aria-label={
              isLoading || isTransitioning
                ? t('wizard.navigation.ariaLabels.processingWait')
                : t('wizard.navigation.ariaLabels.continueToNext')
            }
          >
            <div id="next-step-button" data-wizard-next className="contents">
              {!(isLoading || isTransitioning) && (
                <>
                  {defaultNextText}
                  <span className="ml-2" aria-hidden="true">→</span>
                </>
              )}
              {isTransitioning && t('wizard.navigation.transitioning')}
              {isLoading && !isTransitioning && defaultLoadingText}
            </div>
          </EnhancedButton>
        </FadeTransition>
      </ButtonGroupLandmark>
    </FadeTransition>
  )
}