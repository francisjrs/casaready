/**
 * Down Payment Step Component
 *
 * Handles down payment amount or percentage input
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, formatCurrency, parseNumericInput } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'

interface DownPaymentStepProps {
  onNext: () => void
}

export function DownPaymentStep({ onNext }: DownPaymentStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    downPaymentAmount: wizardData.downPaymentAmount || '',
    downPaymentPercent: wizardData.downPaymentPercent || '',
    paymentType: wizardData.paymentType || 'percentage' // 'none', 'amount', 'percentage'
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(6, {
      downPaymentAmount: parseNumericInput(formData.downPaymentAmount),
      downPaymentPercent: parseNumericInput(formData.downPaymentPercent),
      paymentType: formData.paymentType
    })
  }, [formData, updateStepData])

  const handlePaymentTypeChange = (type: 'none' | 'amount' | 'percentage') => {
    setFormData(prev => ({
      ...prev,
      paymentType: type,
      // Clear both fields when changing type
      downPaymentAmount: '',
      downPaymentPercent: ''
    }))
  }

  const handleInputChange = (field: 'downPaymentAmount' | 'downPaymentPercent', value: string) => {
    // Remove non-numeric characters except decimals
    const cleanedValue = value.replace(/[^0-9.]/g, '')

    setFormData(prev => ({
      ...prev,
      [field]: cleanedValue,
      // Update payment type based on field being edited
      paymentType: field === 'downPaymentAmount' ? 'amount' : 'percentage',
      // Clear the other field when one is entered
      ...(field === 'downPaymentAmount' ? { downPaymentPercent: '' } : { downPaymentAmount: '' })
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(6, formData, locale)

      if (validation.valid) {
        markStepCompleted(6)
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

  const parsedAmount = parseNumericInput(formData.downPaymentAmount)
  const parsedPercent = parseNumericInput(formData.downPaymentPercent)
  const hasValidInput = formData.paymentType === 'none' ||
    (formData.paymentType === 'amount' && parsedAmount && parsedAmount > 0) ||
    (formData.paymentType === 'percentage' && parsedPercent && parsedPercent >= 0)

  // Calculate equivalents if we have target price
  const targetPrice = wizardData.targetPrice
  const calculatedAmount = parsedPercent && targetPrice ? (parsedPercent / 100) * targetPrice : null
  const calculatedPercent = parsedAmount && targetPrice ? (parsedAmount / targetPrice) * 100 : null

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('wizard.steps.downPayment.errorTitle')}
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

      {/* Down Payment Input */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💰</span>
          {t('wizard.steps.downPayment.sectionTitle')}
        </h3>

        {/* Payment Type Selection */}
        <div className="space-y-4">
          {/* No Down Payment Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.paymentType === 'none'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentTypeChange('none')}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="paymentType"
                value="none"
                checked={formData.paymentType === 'none'}
                onChange={() => handlePaymentTypeChange('none')}
                className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {t('wizard.steps.downPayment.types.none.label')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t('wizard.steps.downPayment.types.none.description')}
                </p>
                {formData.paymentType === 'none' && (
                  <div className="mt-2 text-sm font-medium text-brand-700">
                    {t('wizard.steps.downPayment.selectedMessages.none')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dollar Amount Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.paymentType === 'amount'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentTypeChange('amount')}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="paymentType"
                value="amount"
                checked={formData.paymentType === 'amount'}
                onChange={() => handlePaymentTypeChange('amount')}
                className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {t('wizard.steps.downPayment.types.amount.label')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t('wizard.steps.downPayment.types.amount.description')}
                </p>
                {formData.paymentType === 'amount' && (
                  <div className="mt-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={formData.downPaymentAmount}
                        onChange={(e) => handleInputChange('downPaymentAmount', e.target.value)}
                        placeholder="50000"
                        className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
                      />
                    </div>
                    {parsedAmount && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-brand-700">
                          {formatCurrency(parsedAmount)}
                        </p>
                        {calculatedPercent && (
                          <p className="text-xs text-gray-500">
                            {t('wizard.steps.downPayment.calculations.approximately')} {calculatedPercent.toFixed(1)}% {t('wizard.steps.downPayment.calculations.ofTargetPrice')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Percentage Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.paymentType === 'percentage'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentTypeChange('percentage')}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="paymentType"
                value="percentage"
                checked={formData.paymentType === 'percentage'}
                onChange={() => handlePaymentTypeChange('percentage')}
                className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {t('wizard.steps.downPayment.types.percentage.label')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t('wizard.steps.downPayment.types.percentage.description')}
                </p>
                {formData.paymentType === 'percentage' && (
                  <div className="mt-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                        placeholder="20"
                        className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                    {parsedPercent >= 0 && formData.downPaymentPercent && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-brand-700">
                          {parsedPercent}%
                        </p>
                        {calculatedAmount && (
                          <p className="text-xs text-gray-500">
                            {t('wizard.steps.downPayment.calculations.approximately')} {formatCurrency(calculatedAmount)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Down Payment Options Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-blue-400">💡</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {t('wizard.steps.downPayment.optionsTitle')}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                {t('wizard.steps.downPayment.optionsDescription')}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('wizard.steps.downPayment.programsList.conventional')}</li>
                <li>{t('wizard.steps.downPayment.programsList.fha')}</li>
                <li>{t('wizard.steps.downPayment.programsList.va')}</li>
                <li>{t('wizard.steps.downPayment.programsList.usda')}</li>
                <li>{t('wizard.steps.downPayment.programsList.firstTime')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PMI Information */}
      {((formData.paymentType === 'percentage' && parsedPercent && parsedPercent < 20) ||
        (formData.paymentType === 'amount' && calculatedPercent && calculatedPercent < 20) ||
        formData.paymentType === 'none') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-yellow-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {t('wizard.steps.downPayment.pmiInfo.title')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {formData.paymentType === 'none'
                    ? t('wizard.steps.downPayment.pmiInfo.noDownPayment')
                    : t('wizard.steps.downPayment.pmiInfo.lessThan20')
                  }
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
          disabled={!hasValidInput || isValidating}
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
        💡 {t('wizard.steps.downPayment.helpText')}
      </div>
    </div>
  )
}
