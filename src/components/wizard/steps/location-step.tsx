/**
 * Location Step Component
 *
 * Handles location and preferences input (city, zip code, location priorities)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWizard, sanitizeOptionalString, SERVICE_CONSTANTS, getCensusAreaInsights, CensusUtils, type CensusAreaInsights } from '@/lib/services'
import { TexasCityAutocomplete } from '../texas-city-autocomplete'
import { type TexasCity } from '@/lib/data/texas-cities'
import { useLanguage } from '@/contexts/language-context'

interface LocationStepProps {
  onNext: () => void
}

export function LocationStep({ onNext }: LocationStepProps) {
  const { t } = useLanguage()
  const { wizardData, updateStepData, validateStep, locale, markStepCompleted, censusData, updateCensusData } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    city: wizardData.city || '',
    zipCode: wizardData.zipCode || '',
    locationPriority: wizardData.locationPriority || []
  })

  const [selectedTexasCity, setSelectedTexasCity] = useState<TexasCity | null>(null)

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [isFetchingCensus, setIsFetchingCensus] = useState(false)
  const [censusError, setCensusError] = useState<string | null>(null)

  // Update wizard data when form data changes
  useEffect(() => {
    updateStepData(1, {
      city: formData.city || undefined,
      zipCode: formData.zipCode || undefined,
      locationPriority: formData.locationPriority.length > 0 ? formData.locationPriority : undefined
    })
  }, [formData, updateStepData])

  // Fetch census data when city changes
  const fetchCensusData = useCallback(async (city: string) => {
    if (!city.trim() || city.length < 3) {
      updateCensusData(undefined)
      setCensusError(null)
      return
    }

    setIsFetchingCensus(true)
    setCensusError(null)

    try {
      const result = await getCensusAreaInsights(city, undefined, locale)

      if (result.success && result.data) {
        updateCensusData(result.data)
        setCensusError(null)
      } else {
        // Use fallback data if available
        if (result.fallbackData) {
          updateCensusData(result.fallbackData as CensusAreaInsights)
        }
        setCensusError(result.error || t('wizard.steps.location.censusErrors.apiError'))
      }
    } catch (error) {
      console.error('Census data fetch failed:', error)
      setCensusError(t('wizard.steps.location.censusErrors.apiError'))
      updateCensusData(undefined)
    } finally {
      setIsFetchingCensus(false)
    }
  }, [locale, updateCensusData])

  // Debounced census data fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.city && formData.city.length >= 3) {
        fetchCensusData(formData.city)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [formData.city, fetchCensusData])

  const handleCityChange = (cityName: string, city?: TexasCity) => {
    const sanitizedValue = sanitizeOptionalString(cityName, SERVICE_CONSTANTS.MAX_CITY_LENGTH).value || ''

    setFormData(prev => ({
      ...prev,
      city: sanitizedValue
    }))

    setSelectedTexasCity(city || null)
  }

  const handleInputChange = (field: 'zipCode', value: string) => {
    const sanitizedValue = sanitizeOptionalString(value, SERVICE_CONSTANTS.MAX_ZIP_LENGTH).value || ''

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }))
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      locationPriority: checked
        ? [...prev.locationPriority, priority]
        : prev.locationPriority.filter(p => p !== priority)
    }))
  }

  const handleNext = async () => {
    setIsValidating(true)
    setErrors({})

    try {
      const validation = await validateStep(1, formData, locale)

      if (validation.valid) {
        markStepCompleted(1)
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

  const locationPriorityOptions = [
    {
      value: 'schools',
      label: t('wizard.steps.location.priorities.schools'),
      icon: '🎓'
    },
    {
      value: 'commute',
      label: t('wizard.steps.location.priorities.commute'),
      icon: '🚗'
    },
    {
      value: 'safety',
      label: t('wizard.steps.location.priorities.safety'),
      icon: '🛡️'
    },
    {
      value: 'walkability',
      label: t('wizard.steps.location.priorities.walkability'),
      icon: '🚶'
    },
    {
      value: 'shopping',
      label: t('wizard.steps.location.priorities.shopping'),
      icon: '🛒'
    },
    {
      value: 'parks',
      label: t('wizard.steps.location.priorities.parks'),
      icon: '🌳'
    },
    {
      value: 'nightlife',
      label: t('wizard.steps.location.priorities.nightlife'),
      icon: '🎵'
    },
    {
      value: 'diversity',
      label: t('wizard.steps.location.priorities.diversity'),
      icon: '🌎'
    }
  ]

  return (
    <div className="space-y-8 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('wizard.steps.location.header')}
        </h2>
        <p className="text-gray-600">
          {t('wizard.steps.location.subtitle')}
        </p>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('wizard.steps.location.errorTitle')}
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

      {/* Location Inputs */}
      <div className="space-y-6 sm:space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📍</span>
          {t('wizard.steps.location.preferredLocationTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-4">
          <div className="space-y-3 sm:space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              {t('wizard.steps.location.fields.city')}
            </label>
            <TexasCityAutocomplete
              value={formData.city}
              onChange={handleCityChange}
              placeholder={t('wizard.steps.location.fields.cityPlaceholder')}
              locale={locale}
              required
            />
            {selectedTexasCity && (
              <div className="mt-3 sm:mt-2 text-sm text-gray-600 bg-gray-50 p-3 sm:p-2 rounded-lg">
                <span className="font-medium">{selectedTexasCity.county} County</span> • {selectedTexasCity.region}
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              {t('wizard.steps.location.fields.zipCode')}
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder={t('wizard.steps.location.fields.zipPlaceholder')}
              className="w-full px-4 py-4 sm:px-3 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent touch-manipulation min-h-[48px]"
              maxLength={SERVICE_CONSTANTS.MAX_ZIP_LENGTH}
            />
            {selectedTexasCity && selectedTexasCity.zipCodes.length > 1 && (
              <div className="mt-3 sm:mt-2 text-xs text-gray-500 bg-blue-50 p-3 sm:p-2 rounded-lg">
                <strong>Common ZIP codes: </strong>
                {selectedTexasCity.zipCodes.slice(0, 3).join(', ')}
                {selectedTexasCity.zipCodes.length > 3 && '...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Priorities */}
      <div className="space-y-6 sm:space-y-4">
        <div className="space-y-3 sm:space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">⭐</span>
            {t('wizard.steps.location.prioritiesTitle')}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('wizard.steps.location.helpText')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
          {locationPriorityOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 sm:p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors min-h-[56px] sm:min-h-[48px] touch-manipulation focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2"
            >
              <input
                type="checkbox"
                checked={formData.locationPriority.includes(option.value)}
                onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                className="h-5 w-5 sm:h-4 sm:w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded touch-manipulation"
              />
              <span className="ml-4 sm:ml-3 flex items-center">
                <span className="mr-2 text-lg sm:text-base">{option.icon}</span>
                <span className="text-base sm:text-sm font-medium text-gray-700 leading-relaxed">{option.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>


      {/* Navigation */}
      <div className="pt-8 sm:pt-6 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-4 sm:py-3 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation min-h-[48px] flex items-center justify-center"
        >
          <span className="mr-2">←</span>
          {t('common.previous')}
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isValidating}
          className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 sm:py-3 rounded-xl font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[48px] flex items-center justify-center shadow-lg"
        >
          {isValidating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('wizard.shared.validating')}
            </>
          ) : (
            <>
              {t('common.next')}
              <span className="ml-2">→</span>
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-3">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-lg sm:text-base flex-shrink-0 mt-0.5">💡</div>
          <div className="text-sm sm:text-xs text-blue-800 leading-relaxed">
            <span className="font-medium">{t('wizard.shared.tip')}</span>{' '}
            {t('wizard.steps.location.helpText')}
          </div>
        </div>
      </div>
    </div>
  )
}