'use client'

import { useState, useRef, useEffect } from 'react'
import { searchTexasCities, type TexasCity } from '@/lib/data/texas-cities'
import { useLanguage } from '@/contexts/language-context'

interface TexasCityAutocompleteProps {
  value: string
  onChange: (value: string, city?: TexasCity) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  locale?: 'en' | 'es'
}

export function TexasCityAutocomplete({
  value,
  onChange,
  placeholder = "Enter Texas city name",
  disabled = false,
  required = false,
  className = "",
  locale = 'en'
}: TexasCityAutocompleteProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<TexasCity[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update suggestions when value changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchTexasCities(value, 8)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (value.length >= 2 && suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // Delay closing to allow click on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  const selectCity = (city: TexasCity) => {
    onChange(city.name, city)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectCity(suggestions[selectedIndex])
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const getBorderClass = () => {
    if (disabled) return 'border-gray-200'
    if (isFocused) return 'border-brand-500 ring-2 ring-brand-200'
    return 'border-gray-200 hover:border-gray-300'
  }

  const formatCityDisplay = (city: TexasCity) => {
    return `${city.name}, ${city.county} County`
  }

  const getRegionBadgeColor = (region: string) => {
    switch (region) {
      case 'Greater Houston':
        return 'bg-blue-100 text-blue-800'
      case 'Dallas-Fort Worth':
        return 'bg-purple-100 text-purple-800'
      case 'Austin':
        return 'bg-green-100 text-green-800'
      case 'San Antonio':
        return 'bg-red-100 text-red-800'
      case 'West Texas':
        return 'bg-orange-100 text-orange-800'
      case 'East Texas':
        return 'bg-yellow-100 text-yellow-800'
      case 'South Texas':
        return 'bg-pink-100 text-pink-800'
      case 'Central Texas':
        return 'bg-indigo-100 text-indigo-800'
      case 'Panhandle':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={`
            w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200
            ${getBorderClass()}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            text-gray-900 placeholder-gray-400
            min-h-[48px]
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />

        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.county}`}
              className={`
                px-4 py-3 cursor-pointer transition-colors duration-150
                ${selectedIndex === index
                  ? 'bg-brand-50 border-l-4 border-brand-500'
                  : 'hover:bg-gray-50'
                }
                ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
              onClick={() => selectCity(city)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {city.name}
                  </span>
                  {city.isMetro && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t('wizard.cityAutocomplete.metroBadge')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {city.county} County
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRegionBadgeColor(city.region)}`}>
                    {city.region}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && value.length >= 2 && suggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg"
        >
          <div className="px-4 py-3 text-center text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>
                {t('wizard.cityAutocomplete.noCitiesFound', { query: value })}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {t('wizard.cityAutocomplete.tryDifferentCity')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TexasCityAutocomplete