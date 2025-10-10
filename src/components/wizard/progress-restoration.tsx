'use client'

import { useState, useEffect } from 'react'
import { AccessibleAlert, AccessibleText } from '@/components/ui/accessible-colors'
import { EnhancedButton } from '@/components/ui/enhanced-button-states'
import { FadeTransition } from '@/components/ui/transition-animations'
import { useLanguage } from '@/contexts/language-context'
import {
  hasSavedProgress,
  loadWizardProgress,
  getProgressSummary,
  clearWizardProgress,
  type WizardProgress
} from '@/lib/services/wizard-storage'

interface ProgressRestorationProps {
  onRestore: (progress: WizardProgress) => void
  onStartFresh: () => void
  className?: string
}

export function ProgressRestoration({
  onRestore,
  onStartFresh,
  className = ''
}: ProgressRestorationProps) {
  const { t } = useLanguage()
  const [progressSummary, setProgressSummary] = useState<ReturnType<typeof getProgressSummary>>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get progress summary on component mount
    const summary = getProgressSummary()
    setProgressSummary(summary)
  }, [])

  const handleRestore = async () => {
    setIsLoading(true)
    try {
      const savedProgress = loadWizardProgress()
      if (savedProgress) {
        onRestore(savedProgress)
      } else {
        // Progress no longer available, start fresh
        onStartFresh()
      }
    } catch (error) {
      console.error('Failed to restore progress:', error)
      onStartFresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartFresh = () => {
    clearWizardProgress()
    onStartFresh()
  }

  const handleDismiss = () => {
    onStartFresh()
  }

  if (!progressSummary) {
    return null
  }

  return (
    <FadeTransition
      isVisible={true}
      duration="normal"
      className={className}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AccessibleAlert
            variant="info"
            className="p-6 bg-white rounded-2xl shadow-2xl border border-white/50"
          >
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-12 h-12 bg-info-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <AccessibleText as="h2" variant="primary" size="lg" weight="bold">
                  {t('wizard.progressRestoration.title')}
                </AccessibleText>
                <AccessibleText variant="secondary" size="sm">
                  {t('wizard.progressRestoration.description')}
                </AccessibleText>
              </div>

              {/* Progress Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <AccessibleText variant="secondary" size="sm" weight="medium">
                    {t('wizard.progressRestoration.progress')}
                  </AccessibleText>
                  <AccessibleText variant="primary" size="sm" weight="bold">
                    {t('wizard.progressRestoration.stepOf')
                      .replace('{{current}}', progressSummary.step.toString())
                      .replace('{{total}}', progressSummary.totalSteps.toString())}
                  </AccessibleText>
                </div>

                <div className="flex justify-between items-center">
                  <AccessibleText variant="secondary" size="sm" weight="medium">
                    {t('wizard.progressRestoration.completed')}
                  </AccessibleText>
                  <AccessibleText variant="primary" size="sm" weight="bold">
                    {progressSummary.completedCount} {t('wizard.progressRestoration.steps')}
                  </AccessibleText>
                </div>

                <div className="flex justify-between items-center">
                  <AccessibleText variant="secondary" size="sm" weight="medium">
                    {t('wizard.progressRestoration.lastSaved')}
                  </AccessibleText>
                  <AccessibleText variant="muted" size="sm">
                    {progressSummary.age}
                  </AccessibleText>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.round((progressSummary.completedCount / progressSummary.totalSteps) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <EnhancedButton
                  onClick={handleRestore}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                  size="base"
                  className="w-full"
                >
                  {t('wizard.progressRestoration.continueProgress')}
                </EnhancedButton>

                <EnhancedButton
                  onClick={handleStartFresh}
                  disabled={isLoading}
                  variant="secondary"
                  size="base"
                  className="w-full"
                >
                  {t('wizard.progressRestoration.startFresh')}
                </EnhancedButton>

                <button
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
                >
                  {t('wizard.progressRestoration.dismiss')}
                </button>
              </div>

              {/* Info Note */}
              <AccessibleText variant="muted" size="xs" className="text-center">
                {t('wizard.progressRestoration.autoSaveNote')}
              </AccessibleText>
            </div>
          </AccessibleAlert>
        </div>
      </div>
    </FadeTransition>
  )
}

// Progress save indicator component
interface ProgressSaveIndicatorProps {
  isVisible: boolean
  className?: string
}

export function ProgressSaveIndicator({
  isVisible,
  className = ''
}: ProgressSaveIndicatorProps) {
  const { t } = useLanguage()
  return (
    <FadeTransition
      isVisible={isVisible}
      duration="fast"
      className={className}
    >
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-green-100 border border-green-200 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <AccessibleText variant="success" size="sm" weight="medium">
              {t('wizard.progressRestoration.progressSaved')}
            </AccessibleText>
          </div>
        </div>
      </div>
    </FadeTransition>
  )
}

// Progress auto-save hook
export function useProgressAutoSave() {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  const triggerSaveIndicator = () => {
    setShowSaveIndicator(true)
    setTimeout(() => {
      setShowSaveIndicator(false)
    }, 2000)
  }

  return {
    showSaveIndicator,
    triggerSaveIndicator
  }
}