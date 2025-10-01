/**
 * Budget Step Component
 *
 * Handles budget preferences (target price vs monthly payment)
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, formatCurrency, parseNumericInput } from '@/lib/services'
import { EnhancedErrorBox } from '@/components/ui/enhanced-error-display'
import { useLanguage } from '@/contexts/language-context'

interface BudgetStepProps {
  onNext: () => void
}

export function BudgetStep({ onNext }: BudgetStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    budgetType: wizardData.budgetType || '',
    targetPrice: wizardData.targetPrice || '',
    monthlyBudget: wizardData.monthlyBudget || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(3, {
      budgetType: formData.budgetType || undefined,
      targetPrice: parseNumericInput(formData.targetPrice),
      monthlyBudget: parseNumericInput(formData.monthlyBudget)
    })
  }, [formData, updateStepData])

  const handleBudgetTypeChange = (budgetType: string) => {
    setFormData(prev => ({
      ...prev,
      budgetType,
      // Clear the other field when switching types
      targetPrice: budgetType === 'price' ? prev.targetPrice : '',
      monthlyBudget: budgetType === 'monthly' ? prev.monthlyBudget : ''
    }))
  }

  const handleInputChange = (field: 'targetPrice' | 'monthlyBudget', value: string) => {
    // Remove non-numeric characters except decimals
    const cleanedValue = value.replace(/[^0-9.]/g, '')

    setFormData(prev => ({
      ...prev,
      [field]: cleanedValue
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(3, formData, locale)

      if (validation.valid) {
        markStepCompleted(3)
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

  const budgetTypeOptions = [
    {
      value: 'price',
      label: t('wizard.steps.budget.types.price.label'),
      description: t('wizard.steps.budget.types.price.description'),
      icon: '🏠',
      example: 'e.g., $350,000'
    },
    {
      value: 'monthly',
      label: t('wizard.steps.budget.types.monthly.label'),
      description: t('wizard.steps.budget.types.monthly.description'),
      icon: '💳',
      example: 'e.g., $2,500/month'
    }
  ]

  const isFormValid = formData.budgetType && (
    (formData.budgetType === 'price' && formData.targetPrice) ||
    (formData.budgetType === 'monthly' && formData.monthlyBudget)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.steps.budget.header')}
        </h2>
        <p className="text-gray-600">
          {t('wizard.steps.budget.subtitle')}
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

      {/* Budget Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💰</span>
          {t('wizard.steps.budget.helpText')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                formData.budgetType === option.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="budgetType"
                value={option.value}
                checked={formData.budgetType === option.value}
                onChange={(e) => handleBudgetTypeChange(e.target.value)}
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
                  <p className="text-xs text-gray-500 mt-1">
                    {option.example}
                  </p>
                </div>
                {formData.budgetType === option.value && (
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

      {/* Budget Input */}
      {formData.budgetType && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📊</span>
            {formData.budgetType === 'price'
              ? t('wizard.steps.budget.fields.targetPrice')
              : t('wizard.steps.budget.fields.monthlyPayment')
            }
          </h3>

          <div className="max-w-md">
            {formData.budgetType === 'price' ? (
              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wizard.steps.budget.fields.targetPrice')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="targetPrice"
                    value={formData.targetPrice}
                    onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                    placeholder={t('wizard.steps.budget.fields.targetPricePlaceholder')}
                    className="w-full pl-7 pr-3 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg transition-all duration-200 touch-manipulation"
                  />
                </div>
                {parseNumericInput(formData.targetPrice) && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formatCurrency(parseNumericInput(formData.targetPrice))}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wizard.steps.budget.fields.monthlyPayment')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="monthlyBudget"
                    value={formData.monthlyBudget}
                    onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                    placeholder={t('wizard.steps.budget.fields.monthlyPaymentPlaceholder')}
                    className="w-full pl-7 pr-16 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg transition-all duration-200 touch-manipulation"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      /month
                    </span>
                  </div>
                </div>
                {parseNumericInput(formData.monthlyBudget) && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formatCurrency(parseNumericInput(formData.monthlyBudget))}/month
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget Tips */}
      {formData.budgetType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-400">💡</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t('wizard.shared.tip')}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                {formData.budgetType === 'price' ? (
                  <p>
                    {t('wizard.steps.budget.tips.price')}
                  </p>
                ) : (
                  <p>
                    {t('wizard.steps.budget.tips.monthly')}
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
        💡 {t('wizard.steps.budget.helpText')}
      </div>
    </div>
  )
}
