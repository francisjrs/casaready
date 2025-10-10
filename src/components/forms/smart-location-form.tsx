'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Check, Loader2 } from 'lucide-react'

interface LocationData {
  city: string
  zipCode: string
  state?: string
}

interface SmartLocationFormProps {
  onLocationChange?: (location: LocationData) => void
  onValidationChange?: (isValid: boolean) => void
  initialValues?: Partial<LocationData>
  className?: string
}

interface ZipCodeApiResponse {
  city: string | null
  state: string | null
}

export function SmartLocationForm({
  onLocationChange,
  onValidationChange,
  initialValues = {},
  className = ''
}: SmartLocationFormProps) {
  // Form state
  const [zipCode, setZipCode] = useState(initialValues.zipCode || '')
  const [city, setCity] = useState(initialValues.city || '')
  const [errors, setErrors] = useState<{ zipCode?: string; city?: string }>({})
  const [isZipLoading, setIsZipLoading] = useState(false)
  const [isZipValid, setIsZipValid] = useState(false)
  const [isCityAutoFilled, setIsCityAutoFilled] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)

  // Refs
  const zipDebounceRef = useRef<NodeJS.Timeout>()
  const cityDebounceRef = useRef<NodeJS.Timeout>()
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Mock ZIP code database - replace with real API
  const mockZipDatabase: Record<string, ZipCodeApiResponse> = {
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

  // Mock city suggestions - replace with real API
  const mockCities = [
    'Austin, TX', 'Atlanta, GA', 'Arlington, TX', 'Anaheim, CA', 'Albuquerque, NM',
    'Boston, MA', 'Brooklyn, NY', 'Baltimore, MD', 'Birmingham, AL', 'Baton Rouge, LA',
    'Chicago, IL', 'Charlotte, NC', 'Columbus, OH', 'Colorado Springs, CO', 'Corpus Christi, TX',
    'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Durham, NC', 'Des Moines, IA',
    'El Paso, TX', 'Eugene, OR', 'Fort Worth, TX', 'Fresno, CA', 'Fayetteville, AR',
    'Houston, TX', 'Henderson, NV', 'Honolulu, HI', 'Irving, TX', 'Indianapolis, IN',
    'Jacksonville, FL', 'Jersey City, NJ', 'Kansas City, MO', 'Knoxville, TN',
    'Las Vegas, NV', 'Los Angeles, CA', 'Louisville, KY', 'Little Rock, AR',
    'Memphis, TN', 'Miami, FL', 'Milwaukee, WI', 'Minneapolis, MN',
    'New York, NY', 'Nashville, TN', 'New Orleans, LA', 'Norfolk, VA', 'Newark, NJ',
    'Orlando, FL', 'Oakland, CA', 'Oklahoma City, OK', 'Omaha, NE',
    'Phoenix, AZ', 'Philadelphia, PA', 'Pittsburgh, PA', 'Portland, OR',
    'Raleigh, NC', 'Riverside, CA', 'Richmond, VA', 'Rochester, NY',
    'San Antonio, TX', 'San Diego, CA', 'San Francisco, CA', 'Seattle, WA', 'St. Louis, MO',
    'Tampa, FL', 'Tucson, AZ', 'Tulsa, OK', 'Toledo, OH'
  ]

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

  // API simulation functions
  const lookupCityFromZip = useCallback(async (zip: string): Promise<ZipCodeApiResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // In real implementation, call actual ZIP code API
    return mockZipDatabase[zip] || { city: null, state: null }
  }, [])

  const fetchCitySuggestions = useCallback(async (query: string): Promise<string[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // In real implementation, call city autocomplete API (Google Places, etc.)
    return mockCities
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6)
  }, [])

  // ZIP code handling
  const handleZipCodeChange = useCallback((value: string) => {
    // Clean input - only allow digits
    const cleanValue = value.replace(/\D/g, '').slice(0, 5)
    setZipCode(cleanValue)

    // Clear previous validation
    setIsZipValid(false)

    // Validate immediately
    const error = validateZipCode(cleanValue)
    setErrors(prev => ({ ...prev, zipCode: error || undefined }))

    // Clear city auto-fill if ZIP is being changed
    if (isCityAutoFilled) {
      setCity('')
      setIsCityAutoFilled(false)
    }

    // Debounced city lookup for valid ZIP codes
    if (zipDebounceRef.current) {
      clearTimeout(zipDebounceRef.current)
    }

    if (cleanValue.length === 5 && !error) {
      setIsZipLoading(true)
      zipDebounceRef.current = setTimeout(async () => {
        try {
          const result = await lookupCityFromZip(cleanValue)
          if (result.city) {
            setCity(result.city)
            setIsCityAutoFilled(true)
            setIsZipValid(true)
            setErrors(prev => ({ ...prev, zipCode: undefined }))
          } else {
            setErrors(prev => ({ ...prev, zipCode: 'ZIP code not found' }))
          }
        } catch (error) {
          setErrors(prev => ({ ...prev, zipCode: 'Unable to verify ZIP code' }))
        } finally {
          setIsZipLoading(false)
        }
      }, 300)
    } else {
      setIsZipLoading(false)
    }
  }, [isCityAutoFilled, lookupCityFromZip, validateZipCode])

  // City handling
  const handleCityChange = useCallback((value: string) => {
    setCity(value)
    setIsCityAutoFilled(false)

    // Validate immediately
    const error = validateCity(value)
    setErrors(prev => ({ ...prev, city: error || undefined }))

    // Clear previous suggestions timeout
    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current)
    }

    // Show suggestions for queries longer than 1 character
    if (value.length > 1) {
      cityDebounceRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchCitySuggestions(value)
          setCitySuggestions(suggestions)
          setShowSuggestions(suggestions.length > 0)
        } catch (error) {
          console.error('Failed to fetch city suggestions:', error)
          setShowSuggestions(false)
        }
      }, 300)
    } else {
      setShowSuggestions(false)
    }
  }, [fetchCitySuggestions, validateCity])

  // Geolocation
  const handleUseLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGeolocationLoading(true)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // In real implementation, use reverse geocoding API
          // For demo, we'll simulate with Austin coordinates
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
  }, [])

  // Suggestion selection
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setCity(suggestion)
    setShowSuggestions(false)
    setIsCityAutoFilled(false)
    setErrors(prev => ({ ...prev, city: undefined }))
  }, [])

  // Form validation and callbacks
  useEffect(() => {
    const isValid = !errors.zipCode && !errors.city && zipCode.length === 5 && city.trim().length > 0
    onValidationChange?.(isValid)

    if (isValid) {
      onLocationChange?.({
        zipCode,
        city: city.trim(),
        state: undefined // Could be derived from ZIP lookup
      })
    }
  }, [zipCode, city, errors, onLocationChange, onValidationChange])

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
          htmlFor="smart-zip-code"
          className="block text-sm font-semibold text-gray-700"
        >
          ZIP Code
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>

        <div className="relative">
          <input
            id="smart-zip-code"
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
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
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
          We'll auto-fill your city when you enter a valid ZIP code
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
          htmlFor="smart-city"
          className="block text-sm font-semibold text-gray-700"
        >
          City
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        </label>

        <div className="relative" ref={cityInputRef}>
          <input
            id="smart-city"
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

          {/* Auto-filled indicator */}
          {isCityAutoFilled && (
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
    </div>
  )
}

export default SmartLocationForm