/**
 * Employment Step Component
 *
 * Handles employment type selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface EmploymentStepProps {
  onNext: () => void
}

export function EmploymentStep({ onNext }: EmploymentStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    employmentType: wizardData.employmentType || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(7, {
      employmentType: formData.employmentType || undefined
    })
  }, [formData, updateStepData])

  const handleEmploymentTypeChange = (employmentType: string) => {
    setFormData(prev => ({
      ...prev,
      employmentType
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(7, formData, locale)

      if (validation.valid) {
        markStepCompleted(7)
        onNext()
      } else {
        setErrors({ general: validation.errors })
      }
    } catch (_error) {
      setErrors({ general: [t('wizard.shared.errorTitle')] })
    } finally {
      setIsValidating(false)
    }
  }

  const employmentOptions = [
    {
      value: 'w2',
      label: t('wizard.steps.employment.types.w2.label'),
      description: t('wizard.steps.employment.types.w2.description'),
      icon: '💼',
      considerations: t('wizard.steps.employment.types.w2.considerations')
    },
    {
      value: 'itin',
      label: t('wizard.steps.employment.types.itin.label'),
      description: t('wizard.steps.employment.types.itin.description'),
      icon: '🪪',
      considerations: t('wizard.steps.employment.types.itin.considerations')
    },
    {
      value: '1099',
      label: t('wizard.steps.employment.types.1099.label'),
      description: t('wizard.steps.employment.types.1099.description'),
      icon: '💻',
      considerations: t('wizard.steps.employment.types.1099.considerations')
    },
    {
      value: 'self-employed',
      label: t('wizard.steps.employment.types.selfEmployed.label'),
      description: t('wizard.steps.employment.types.selfEmployed.description'),
      icon: '🏢',
      considerations: t('wizard.steps.employment.types.selfEmployed.considerations')
    },
    {
      value: 'mixed',
      label: t('wizard.steps.employment.types.mixed.label'),
      description: t('wizard.steps.employment.types.mixed.description'),
      icon: '📊',
      considerations: t('wizard.steps.employment.types.mixed.considerations')
    },
    {
      value: 'retired',
      label: t('wizard.steps.employment.types.retired.label'),
      description: t('wizard.steps.employment.types.retired.description'),
      icon: '🏖️',
      considerations: t('wizard.steps.employment.types.retired.considerations')
    },
    {
      value: 'other',
      label: t('wizard.steps.employment.types.other.label'),
      description: t('wizard.steps.employment.types.other.description'),
      icon: '❓',
      considerations: t('wizard.steps.employment.types.other.considerations')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.steps.employment.header')}
        </h2>
        <p className="text-gray-600">
          {t('wizard.steps.employment.subtitle')}
        </p>
      </div>

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

      {/* Employment Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💼</span>
          {t('wizard.steps.employment.sectionTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employmentOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                formData.employmentType === option.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="employmentType"
                value={option.value}
                checked={formData.employmentType === option.value}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start w-full">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{option.icon}</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {option.considerations}
                  </p>
                </div>
                {formData.employmentType === option.value && (
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

      {/* Employment-specific Information */}
      {formData.employmentType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-400">💡</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t('wizard.steps.employment.expectationsTitle')}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                {formData.employmentType === 'w2' && (
                  <p>
                    {t('wizard.steps.employment.advice.w2')}
                  </p>
                )}
                {formData.employmentType === 'itin' && (
                  <p>
                    {t('wizard.steps.employment.advice.itin')}
                  </p>
                )}
                {formData.employmentType === '1099' && (
                  <p>
                    {t('wizard.steps.employment.advice.1099')}
                  </p>
                )}
                {formData.employmentType === 'self-employed' && (
                  <p>
                    {t('wizard.steps.employment.advice.selfEmployed')}
                  </p>
                )}
                {formData.employmentType === 'mixed' && (
                  <p>
                    {t('wizard.steps.employment.advice.mixed')}
                  </p>
                )}
                {formData.employmentType === 'retired' && (
                  <p>
                    {t('wizard.steps.employment.advice.retired')}
                  </p>
                )}
                {formData.employmentType === 'other' && (
                  <p>
                    {t('wizard.steps.employment.advice.other')}
                  </p>
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
          disabled={!formData.employmentType || isValidating}
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
        💡 {t('wizard.steps.employment.helpText')}
      </div>
    </div>
  )
}
