/**
 * Timeline Step Component
 *
 * Handles buying timeline selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface TimelineStepProps {
  onNext: () => void
}

export function TimelineStep({ onNext }: TimelineStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    timeline: wizardData.timeline || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(2, {
      timeline: formData.timeline || undefined
    })
  }, [formData, updateStepData])

  const handleTimelineChange = (timeline: string) => {
    setFormData(prev => ({
      ...prev,
      timeline
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(2, formData, locale)

      if (validation.valid) {
        markStepCompleted(2)
        onNext()
      } else {
        setErrors({ general: validation.errors })
      }
    } catch (_error) {
      setErrors({ general: [t('wizard.validation.generalError')] })
    } finally {
      setIsValidating(false)
    }
  }

  const timelineOptions = [
    {
      value: '0-3',
      label: t('wizard.steps.timeline.options.0-3.label'),
      description: t('wizard.steps.timeline.options.0-3.description'),
      icon: '🔥',
      urgency: 'high'
    },
    {
      value: '3-6',
      label: t('wizard.steps.timeline.options.3-6.label'),
      description: t('wizard.steps.timeline.options.3-6.description'),
      icon: '⏰',
      urgency: 'medium'
    },
    {
      value: '6-12',
      label: t('wizard.steps.timeline.options.6-12.label'),
      description: t('wizard.steps.timeline.options.6-12.description'),
      icon: '📅',
      urgency: 'medium'
    },
    {
      value: '12+',
      label: t('wizard.steps.timeline.options.12+.label'),
      description: t('wizard.steps.timeline.options.12+.description'),
      icon: '🎯',
      urgency: 'low'
    }
  ]

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('wizard.shared.errorTitle')}
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.general.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">⏱️</span>
          {t('wizard.steps.timeline.sectionTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timelineOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                formData.timeline === option.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="timeline"
                value={option.value}
                checked={formData.timeline === option.value}
                onChange={(e) => handleTimelineChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{option.icon}</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {option.label}
                    </span>
                    {option.urgency === 'high' && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {t('wizard.steps.timeline.urgentBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
                {formData.timeline === option.value && (
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
          ))}
        </div>
      </div>

      {/* Timeline-specific Tips */}
      {formData.timeline && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-400">💡</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t('wizard.steps.timeline.tipTitle')}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                {formData.timeline === '0-3' && (
                  <p>{t('wizard.steps.timeline.tips.0-3')}</p>
                )}
                {formData.timeline === '3-6' && (
                  <p>{t('wizard.steps.timeline.tips.3-6')}</p>
                )}
                {formData.timeline === '6-12' && (
                  <p>{t('wizard.steps.timeline.tips.6-12')}</p>
                )}
                {formData.timeline === '12+' && (
                  <p>{t('wizard.steps.timeline.tips.12+')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNext}
          disabled={!formData.timeline || isValidating}
          className="bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating
            ? t('wizard.shared.validating')
            : t('common.next')
          }
        </button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        💡 {t('wizard.steps.timeline.helpText')}
      </div>
    </div>
  )
}
