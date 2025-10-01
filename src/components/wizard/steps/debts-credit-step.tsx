/**
 * Debts & Credit Step Component
 *
 * Handles monthly debts and credit score input
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, formatCurrency, parseNumericInput } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface DebtsCreditStepProps {
  onNext: () => void
}

export function DebtsCreditStep({ onNext }: DebtsCreditStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    monthlyDebts: wizardData.monthlyDebts || '',
    creditScore: wizardData.creditScore || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(5, {
      monthlyDebts: parseNumericInput(formData.monthlyDebts),
      creditScore: formData.creditScore || undefined
    })
  }, [formData, updateStepData])

  const handleDebtsChange = (value: string) => {
    // Remove non-numeric characters except decimals
    const cleanedValue = value.replace(/[^0-9.]/g, '')

    setFormData(prev => ({
      ...prev,
      monthlyDebts: cleanedValue
    }))
  }

  const handleCreditScoreChange = (creditScore: string) => {
    setFormData(prev => ({
      ...prev,
      creditScore
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(5, formData, locale)

      if (validation.valid) {
        markStepCompleted(5)
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

  const creditScoreOptions = [
    {
      value: '800-850',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.800-850.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.800-850.description'),
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: '740-799',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.740-799.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.740-799.description'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: '670-739',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.670-739.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.670-739.description'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: '580-669',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.580-669.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.580-669.description'),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      value: '300-579',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.300-579.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.300-579.description'),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      value: 'unknown',
      label: t('wizard.steps.debtsCredit.creditScoreOptions.unknown.label'),
      description: t('wizard.steps.debtsCredit.creditScoreOptions.unknown.description'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ]

  const parsedDebts = parseNumericInput(formData.monthlyDebts)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.steps.debtsCredit.header')}
        </h2>
        <p className="text-gray-600">
          {t('wizard.steps.debtsCredit.description')}
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

      {/* Monthly Debts Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💳</span>
          {t('wizard.steps.debtsCredit.sections.monthlyDebts')}
        </h3>

        <div className="max-w-md">
          <label htmlFor="monthlyDebts" className="block text-sm font-medium text-gray-700 mb-2">
            {t('wizard.steps.debtsCredit.fields.monthlyDebts')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="monthlyDebts"
              value={formData.monthlyDebts}
              onChange={(e) => handleDebtsChange(e.target.value)}
              placeholder={t('wizard.steps.debtsCredit.fields.monthlyDebtsPlaceholder')}
              className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
            />
          </div>
          {parsedDebts !== undefined && (
            <p className="mt-2 text-sm text-gray-600">
              {formatCurrency(parsedDebts)}{t('wizard.shared.perMonth')}
            </p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            {t('wizard.steps.debtsCredit.includes')}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {t('wizard.steps.debtsCredit.excludes')}
          </div>
        </div>
      </div>

      {/* Credit Score Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📊</span>
          {t('wizard.steps.debtsCredit.sections.creditScore')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {creditScoreOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                formData.creditScore === option.value
                  ? `border-brand-500 ${option.bgColor}`
                  : option.borderColor
              }`}
            >
              <input
                type="radio"
                name="creditScore"
                value={option.value}
                checked={formData.creditScore === option.value}
                onChange={(e) => handleCreditScoreChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start w-full">
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className={`text-lg font-semibold ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
                {formData.creditScore === option.value && (
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

      {/* Credit Score Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-blue-400">💡</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {t('wizard.steps.debtsCredit.infoSections.creditScoreInfo.title')}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {t('wizard.steps.debtsCredit.infoSections.creditScoreInfo.description')}
              </p>
              {formData.creditScore === 'unknown' && (
                <p className="mt-2">
                  {t('wizard.steps.debtsCredit.infoSections.creditScoreInfo.unknownHelp')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debt-to-Income Preview */}
      {parsedDebts !== undefined && wizardData.annualIncome && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-green-400">📈</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {t('wizard.steps.debtsCredit.infoSections.debtToIncomeRatio.title')}
              </h3>
              <div className="mt-2 text-sm text-green-700">
                {(() => {
                  const monthlyIncome = wizardData.annualIncome / 12
                  const dtiRatio = parsedDebts / monthlyIncome * 100
                  return (
                    <p>
                      {t('wizard.steps.debtsCredit.infoSections.debtToIncomeRatio.description').replace('{{ratio}}', dtiRatio.toFixed(1))}
                    </p>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNext}
          disabled={!formData.creditScore || isValidating}
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
        💡 {t('wizard.steps.debtsCredit.helpText')}
      </div>
    </div>
  )
}
