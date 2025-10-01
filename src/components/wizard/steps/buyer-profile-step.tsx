/**
 * Buyer Profile Step Component
 *
 * Handles buyer type selection and household size
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, parseNumericInput } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface BuyerProfileStepProps {
  onNext: () => void
}

export function BuyerProfileStep({ onNext }: BuyerProfileStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    buyerType: wizardData.buyerType || [],
    householdSize: wizardData.householdSize || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(8, {
      buyerType: formData.buyerType.length > 0 ? formData.buyerType : undefined,
      householdSize: parseNumericInput(formData.householdSize)
    })
  }, [formData, updateStepData])

  const handleBuyerTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      buyerType: checked
        ? [...prev.buyerType, type]
        : prev.buyerType.filter(t => t !== type)
    }))
  }

  const handleHouseholdSizeChange = (value: string) => {
    // Only allow numbers 1-10
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) {
      setFormData(prev => ({
        ...prev,
        householdSize: value
      }))
    }
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(8, formData, locale)

      if (validation.valid) {
        markStepCompleted(8)
        onNext()
      } else {
        setErrors({ general: validation.errors })
      }
    } catch (_error) {
      setErrors({ general: ['Validation error occurred'] })
    } finally {
      setIsValidating(false)
    }
  }

  const buyerTypeOptions = [
    {
      value: 'first-time',
      label: t('wizard.steps.buyerProfile.types.firstTime.label'),
      description: t('wizard.steps.buyerProfile.types.firstTime.description'),
      icon: '🏠'
    },
    {
      value: 'veteran',
      label: t('wizard.steps.buyerProfile.types.veteran.label'),
      description: t('wizard.steps.buyerProfile.types.veteran.description'),
      icon: '🇺🇸'
    },
    {
      value: 'repeat',
      label: t('wizard.steps.buyerProfile.types.moveUp.label'),
      description: t('wizard.steps.buyerProfile.types.moveUp.description'),
      icon: '🔄'
    },
    {
      value: 'investor',
      label: t('wizard.steps.buyerProfile.types.investment.label'),
      description: t('wizard.steps.buyerProfile.types.investment.description'),
      icon: '💰'
    },
    {
      value: 'relocating',
      label: t('wizard.steps.buyerProfile.types.relocating.label'),
      description: t('wizard.steps.buyerProfile.types.relocating.description'),
      icon: '🚛'
    },
    {
      value: 'downsizing',
      label: t('wizard.steps.buyerProfile.types.downsizing.label'),
      description: t('wizard.steps.buyerProfile.types.downsizing.description'),
      icon: '🏡'
    },
    {
      value: 'upsizing',
      label: t('wizard.steps.buyerProfile.types.upsizing.label'),
      description: t('wizard.steps.buyerProfile.types.upsizing.description'),
      icon: '👨‍👩‍👧‍👦'
    }
  ]

  const isFormValid = formData.buyerType.length > 0 && (formData.householdSize === '' || parseNumericInput(formData.householdSize))

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('wizard.steps.buyerProfile.errorTitle')}
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

      {/* Buyer Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">👤</span>
          {t('wizard.steps.buyerProfile.sectionTitle')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('wizard.steps.buyerProfile.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyerTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                formData.buyerType.includes(option.value)
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                name="buyerType"
                value={option.value}
                checked={formData.buyerType.includes(option.value)}
                onChange={(e) => handleBuyerTypeChange(option.value, e.target.checked)}
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
                </div>
                {formData.buyerType.includes(option.value) && (
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

      {/* Household Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">👥</span>
          {t('wizard.steps.buyerProfile.householdSize.title')}
        </h3>

        <div className="max-w-sm">
          <label htmlFor="householdSize" className="block text-sm font-medium text-gray-700 mb-2">
            {t('wizard.steps.buyerProfile.householdSize.description')}
          </label>
          <input
            type="text"
            id="householdSize"
            value={formData.householdSize}
            onChange={(e) => handleHouseholdSizeChange(e.target.value)}
            placeholder="3"
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
          />
          <div className="mt-2 text-sm text-gray-500">
            {t('wizard.steps.buyerProfile.householdSize.helpText')}
          </div>
        </div>
      </div>

      {/* Special Programs Info */}
      {formData.buyerType.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-green-400">🎉</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {t('wizard.steps.buyerProfile.benefitsTitle')}
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  {formData.buyerType.includes('first-time') && (
                    <li>{t('wizard.steps.buyerProfile.benefits.firstTime')}</li>
                  )}
                  {formData.buyerType.includes('veteran') && (
                    <li>{t('wizard.steps.buyerProfile.benefits.veteran')}</li>
                  )}
                  {formData.buyerType.includes('investor') && (
                    <li>{t('wizard.steps.buyerProfile.benefits.investment')}</li>
                  )}
                  {formData.buyerType.includes('relocating') && (
                    <li>{t('wizard.steps.buyerProfile.benefits.relocating')}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNext}
          disabled={!isFormValid || isValidating}
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
        💡 {t('wizard.steps.buyerProfile.helpText')}
      </div>
    </div>
  )
}
