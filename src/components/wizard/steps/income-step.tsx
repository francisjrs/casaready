/**
 * Income Step Component
 *
 * Handles annual household income input
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, formatCurrency, parseNumericInput } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface IncomeStepProps {
  onNext: () => void
}

export function IncomeStep({ onNext }: IncomeStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    annualIncome: wizardData.annualIncome || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(4, {
      annualIncome: parseNumericInput(formData.annualIncome)
    })
  }, [formData, updateStepData])

  const handleInputChange = (value: string) => {
    // Remove non-numeric characters except decimals
    const cleanedValue = value.replace(/[^0-9.]/g, '')

    setFormData(prev => ({
      ...prev,
      annualIncome: cleanedValue
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(4, formData, locale)

      if (validation.valid) {
        markStepCompleted(4)
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

  const incomeRanges = [
    {
      range: '$30,000 - $50,000',
      value: '40000',
      description: t('wizard.steps.income.ranges.30k50k.description')
    },
    {
      range: '$50,000 - $75,000',
      value: '62500',
      description: t('wizard.steps.income.ranges.50k75k.description')
    },
    {
      range: '$75,000 - $100,000',
      value: '87500',
      description: t('wizard.steps.income.ranges.75k100k.description')
    },
    {
      range: '$100,000 - $150,000',
      value: '125000',
      description: t('wizard.steps.income.ranges.100k150k.description')
    },
    {
      range: '$150,000+',
      value: '175000',
      description: t('wizard.steps.income.ranges.150kPlus.description')
    }
  ]

  const parsedIncome = parseNumericInput(formData.annualIncome)
  const monthlyIncome = parsedIncome ? Math.round(parsedIncome / 12) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.steps.income.header')}
        </h2>
        <p className="text-gray-600">
          {t('wizard.steps.income.description')}
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

      {/* Income Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💵</span>
          {t('wizard.steps.income.sections.enterIncome')}
        </h3>

        <div className="max-w-md">
          <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-2">
            {t('wizard.steps.income.fields.annualIncome')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="annualIncome"
              value={formData.annualIncome}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t('wizard.steps.income.fields.annualIncomePlaceholder')}
              className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
            />
          </div>
          {parsedIncome && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <strong>{t('wizard.steps.income.breakdown.annual')}</strong> {formatCurrency(parsedIncome)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('wizard.steps.income.breakdown.monthly')}</strong> {formatCurrency(monthlyIncome)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Income Ranges */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {t('wizard.steps.income.sections.selectRange')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => handleInputChange(range.value)}
              className={`p-3 text-left border-2 rounded-lg transition-all hover:bg-gray-50 ${
                formData.annualIncome === range.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900">{range.range}</div>
              <div className="text-sm text-gray-600">{range.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Income Sources Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-blue-400">💡</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {t('wizard.steps.income.sourcesInfo.title')}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                {t('wizard.steps.income.sourcesInfo.intro')}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('wizard.steps.income.sourcesInfo.salary')}</li>
                <li>{t('wizard.steps.income.sourcesInfo.bonus')}</li>
                <li>{t('wizard.steps.income.sourcesInfo.selfEmployed')}</li>
                <li>{t('wizard.steps.income.sourcesInfo.rental')}</li>
                <li>{t('wizard.steps.income.sourcesInfo.investment')}</li>
                <li>{t('wizard.steps.income.sourcesInfo.other')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Affordability Preview */}
      {parsedIncome && parsedIncome > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-green-400">📊</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {t('wizard.steps.income.affordabilityPreview.title')}
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  {t('wizard.steps.income.affordabilityPreview.rule').replace('{{amount}}', formatCurrency(Math.round(monthlyIncome * 0.28)))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNext}
          disabled={!parsedIncome || parsedIncome <= 0 || isValidating}
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
        💡 {t('wizard.steps.income.tipText')}
      </div>
    </div>
  )
}
