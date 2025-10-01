'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Check, Loader2, TrendingUp, Users, DollarSign, Info } from 'lucide-react'
import { getCensusAreaInsights } from '@/lib/services/census-service'
import type { CensusAreaInsights } from '@/lib/services/census-service'

interface LocationData {
  city: string
  zipCode: string
  state?: string
}

interface EnhancedLocationStepProps {
  onLocationChange?: (location: LocationData) => void
  onCensusDataChange?: (data: CensusAreaInsights | undefined) => void
  onValidationChange?: (isValid: boolean) => void
  initialValues?: Partial<LocationData>
  className?: string
}

export function EnhancedLocationStep({
  onLocationChange,
  onCensusDataChange,
  onValidationChange,
  initialValues = {},
  className = ''
}: EnhancedLocationStepProps) {
  // Form state
  const [zipCode, setZipCode] = useState(initialValues.zipCode || '')
  const [city, setCity] = useState(initialValues.city || '')
  const [errors, setErrors] = useState<{ zipCode?: string; city?: string }>({})
  const [isZipLoading, setIsZipLoading] = useState(false)
  const [isCityLoading, setIsCityLoading] = useState(false)
  const [isZipValid, setIsZipValid] = useState(false)
  const [isCityAutoFilled, setIsCityAutoFilled] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)
  const [censusData, setCensusData] = useState<CensusAreaInsights | undefined>()
  const [showCensusData, setShowCensusData] = useState(false)

  // Refs
  const zipDebounceRef = useRef<NodeJS.Timeout>()
  const cityDebounceRef = useRef<NodeJS.Timeout>()
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Mock ZIP code database for instant feedback
  const quickZipDatabase: Record<string, { city: string; state: string }> = {
    '78759': { city: 'Austin', state: 'TX' },
    '78701': { city: 'Austin', state: 'TX' },
    '78702': { city: 'Austin', state: 'TX' },
    '90210': { city: 'Beverly Hills', state: 'CA' },
    '90211': { city: 'Beverly Hills', state: 'CA' },
    '10001': { city: 'New York', state: 'NY' },
    '10002': { city: 'New York', state: 'NY' },
    '94102': { city: 'San Francisco', state: 'CA' },
    '94103': { city: 'San Francisco', state: 'CA' },
    '60601': { city: 'Chicago', state: 'IL' },
    '60602': { city: 'Chicago', state: 'IL' },
    '33101': { city: 'Miami', state: 'FL' },
    '33102': { city: 'Miami', state: 'FL' },
    '98101': { city: 'Seattle', state: 'WA' },
    '98102': { city: 'Seattle', state: 'WA' }
  }

  // Validation functions
  const validateZipCode = useCallback((value: string): string | null => {
    if (!value) return 'ZIP code is required'
    if (value.length < 5) return 'ZIP code must be 5 digits'
    if (!/^\d{5}$/.test(value)) return 'Invalid ZIP code format'
    return null
  }, [])

  const validateCity = useCallback((value: string): string | null => {
    if (!value.trim()) return 'City is required'
    if (value.trim().length < 2) return 'City name too short'
    return null
  }, [])

  // ZIP code handling with Census API integration
  const handleZipCodeChange = useCallback((value: string) => {
    // Clean input - only allow digits
    const cleanValue = value.replace(/\D/g, '').slice(0, 5)
    setZipCode(cleanValue)

    // Clear previous validation
    setIsZipValid(false)
    setCensusData(undefined)
    setShowCensusData(false)

    // Validate immediately
    const error = validateZipCode(cleanValue)
    setErrors(prev => ({ ...prev, zipCode: error || undefined }))

    // Clear city auto-fill if ZIP is being changed
    if (isCityAutoFilled) {
      setCity('')
      setIsCityAutoFilled(false)
    }

    // Clear previous timeout
    if (zipDebounceRef.current) {
      clearTimeout(zipDebounceRef.current)
    }

    if (cleanValue.length === 5 && !error) {
      // Quick local lookup for immediate feedback
      const quickResult = quickZipDatabase[cleanValue]
      if (quickResult) {
        setCity(quickResult.city)
        setIsCityAutoFilled(true)
        setIsZipValid(true)
        setErrors(prev => ({ ...prev, zipCode: undefined }))
      }

      // Debounced Census API lookup for detailed data
      setIsZipLoading(true)
      zipDebounceRef.current = setTimeout(async () => {
        try {
          // Use Census API to get city and demographic data
          const result = await getCensusAreaInsights(
            quickResult?.city || '',
            quickResult?.state,
            'en'
          )

          if (result.success && result.data) {
            // Update city if we have more accurate data
            if (result.data.location?.city) {
              setCity(result.data.location.city)
              setIsCityAutoFilled(true)
            }

            setCensusData(result.data)
            setShowCensusData(true)
            setIsZipValid(true)
            setErrors(prev => ({ ...prev, zipCode: undefined }))

            // Notify parent components
            onCensusDataChange?.(result.data)
          } else if (!quickResult) {
            setErrors(prev => ({ ...prev, zipCode: 'ZIP code not found' }))
          }
        } catch (error) {
          console.error('Census API lookup failed:', error)
          if (!quickResult) {
            setErrors(prev => ({ ...prev, zipCode: 'Unable to verify ZIP code' }))
          }
        } finally {
          setIsZipLoading(false)
        }
      }, 500)
    } else {
      setIsZipLoading(false)
    }
  }, [isCityAutoFilled, validateZipCode, onCensusDataChange])

  // City handling with Census API integration
  const handleCityChange = useCallback((value: string) => {
    setCity(value)
    setIsCityAutoFilled(false)
    setCensusData(undefined)
    setShowCensusData(false)

    // Validate immediately
    const error = validateCity(value)
    setErrors(prev => ({ ...prev, city: error || undefined }))

    // Clear previous timeout
    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current)
    }

    // Only proceed with API calls if we have a reasonable city name
    if (value.length > 2) {
      // Start loading for Census data
      setIsCityLoading(true)

      cityDebounceRef.current = setTimeout(async () => {
        try {
          // Fetch Census data for the city
          const result = await getCensusAreaInsights(value, undefined, 'en')

          if (result.success && result.data) {
            setCensusData(result.data)
            setShowCensusData(true)
            setErrors(prev => ({ ...prev, city: undefined }))
            onCensusDataChange?.(result.data)
          }

          // Simple city suggestions based on Census data or local list
          const mockSuggestions = [
            `${value}, TX`,
            `${value}, CA`,
            `${value}, FL`,
            `${value}, NY`,
            `${value}, IL`
          ].slice(0, 3)

          setCitySuggestions(mockSuggestions)
          setShowSuggestions(mockSuggestions.length > 0)
        } catch (error) {
          console.error('City lookup failed:', error)
          setShowSuggestions(false)
        } finally {
          setIsCityLoading(false)
        }
      }, 500)
    } else {
      setShowSuggestions(false)
      setIsCityLoading(false)
    }
  }, [validateCity, onCensusDataChange])

  // Geolocation with reverse geocoding
  const handleUseLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGeolocationLoading(true)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // For demo purposes, we'll use Austin coordinates
          // In real implementation, use actual reverse geocoding
          const locationData = {
            city: 'Austin',
            zipCode: '78759',
            state: 'TX'
          }

          setZipCode(locationData.zipCode)
          setCity(locationData.city)
          setIsCityAutoFilled(true)
          setIsZipValid(true)
          setErrors({})

          // Fetch Census data for the detected location
          try {
            const result = await getCensusAreaInsights(locationData.city, locationData.state, 'en')
            if (result.success && result.data) {
              setCensusData(result.data)
              setShowCensusData(true)
              onCensusDataChange?.(result.data)
            }
          } catch (error) {
            console.error('Failed to fetch Census data for current location:', error)
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          alert('Unable to determine your location. Please enter manually.')
        } finally {
          setIsGeolocationLoading(false)
        }
      },
      (error) => {
        let message = 'Unable to get your location. '
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Location access was denied.'
            break
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            message += 'Location request timed out.'
            break
          default:
            message += 'An unknown error occurred.'
            break
        }
        alert(message)
        setIsGeolocationLoading(false)
      },
      options
    )
  }, [onCensusDataChange])

  // Suggestion selection
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setCity(suggestion)
    setShowSuggestions(false)
    setIsCityAutoFilled(false)
    setErrors(prev => ({ ...prev, city: undefined }))

    // Trigger Census data fetch for selected city
    const cityName = suggestion.split(',')[0].trim()
    handleCityChange(cityName)
  }, [handleCityChange])

  // Form validation and callbacks
  useEffect(() => {
    const isValid = !errors.zipCode && !errors.city && zipCode.length === 5 && city.trim().length > 0
    onValidationChange?.(isValid)

    if (isValid) {
      onLocationChange?.({
        zipCode,
        city: city.trim(),
        state: censusData?.location?.state
      })
    }
  }, [zipCode, city, errors, censusData, onLocationChange, onValidationChange])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ZIP Code Field */}
      <div className="space-y-2">
        <label
          htmlFor="enhanced-zip-code"
          className="block text-sm font-semibold text-gray-700"
        >
          ZIP Code
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>

        <div className="relative">
          <input
            id="enhanced-zip-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            value={zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            placeholder="Enter ZIP Code"
            autoComplete="postal-code"
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg transition-colors duration-200 bg-white
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.zipCode
                ? 'border-red-500 ring-red-500'
                : isZipValid
                  ? 'border-green-500 ring-green-500'
                  : 'border-gray-300'
              }
            `}
            aria-describedby="zip-help zip-error"
            aria-invalid={!!errors.zipCode}
          />

          {/* Loading indicator */}
          {isZipLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Success indicator */}
          {isZipValid && !isZipLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Help text */}
        <div id="zip-help" className="text-sm text-gray-500">
          We'll auto-fill your city and show area insights when you enter a valid ZIP code
        </div>

        {/* Error message */}
        {errors.zipCode && (
          <div id="zip-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.zipCode}
          </div>
        )}
      </div>

      {/* City Field */}
      <div className="space-y-2">
        <label
          htmlFor="enhanced-city"
          className="block text-sm font-semibold text-gray-700"
        >
          City
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>

        <div className="relative" ref={cityInputRef}>
          <input
            id="enhanced-city"
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Enter City"
            autoComplete="address-level2"
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg transition-colors duration-200 bg-white
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.city
                ? 'border-red-500 ring-red-500'
                : 'border-gray-300'
              }
            `}
            aria-describedby="city-help city-error"
            aria-invalid={!!errors.city}
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />

          {/* Loading indicator */}
          {isCityLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Auto-filled indicator */}
          {isCityAutoFilled && !isCityLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Auto-filled
              </span>
            </div>
          )}

          {/* City suggestions */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {citySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help text */}
        <div id="city-help" className="text-sm text-gray-500">
          Start typing for city suggestions, or we'll fill this automatically
        </div>

        {/* Error message */}
        {errors.city && (
          <div id="city-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.city}
          </div>
        )}
      </div>

      {/* Geolocation Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isGeolocationLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-600 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isGeolocationLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {isGeolocationLoading ? 'Getting Location...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Census Data Display */}
      {showCensusData && censusData && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900">
              Area Insights for {censusData.location?.city}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demographics */}
            {censusData.demographics && (
              <div className="flex items-center p-3 bg-white rounded-lg border">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Population</div>
                  <div className="text-lg font-semibold">
                    {censusData.demographics.population.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Income */}
            {censusData.demographics?.medianHouseholdIncome && (
              <div className="flex items-center p-3 bg-white rounded-lg border">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Median Income</div>
                  <div className="text-lg font-semibold">
                    ${censusData.demographics.medianHouseholdIncome.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Home Value */}
            {censusData.demographics?.medianHomeValue && (
              <div className="flex items-center p-3 bg-white rounded-lg border">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Median Home Value</div>
                  <div className="text-lg font-semibold">
                    ${censusData.demographics.medianHomeValue.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {censusData.recommendations && censusData.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Area Highlights:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {censusData.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedLocationStep