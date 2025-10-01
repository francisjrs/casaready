'use client'

import { useState, useCallback, useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { RadioButton } from '@/components/ui/enhanced-button-states'
import {
  ValidationResult,
  validateEmail,
  validatePhone,
  validateName,
  validateNumeric,
  validateCity,
  validateZipCode,
  formatPhone,
  formatName,
  formatCurrency,
  formatCity,
  debounce,
  sanitizeInput
} from './form-validation'

interface BaseInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onValidationChange?: (isValid: boolean, error?: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  autoComplete?: string
  className?: string
}

interface EnhancedInputProps extends BaseInputProps {
  type: 'text' | 'email' | 'tel' | 'number'
  validator?: (value: string) => ValidationResult
  formatter?: (value: string) => string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal'
  maxLength?: number
  minHeight?: number
}

export function EnhancedInput({
  label,
  value,
  onChange,
  onBlur,
  onValidationChange,
  placeholder,
  required = false,
  disabled = false,
  helpText,
  autoComplete,
  className = '',
  type,
  validator,
  formatter,
  inputMode,
  maxLength,
  minHeight = 48
}: EnhancedInputProps) {
  const [touched, setTouched] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [isFocused, setIsFocused] = useState(false)

  // Debounced validation for real-time feedback
  const debouncedValidation = useCallback(
    debounce((val: string) => {
      if (validator && touched) {
        const result = validator(val)
        setValidation(result)
        onValidationChange?.(result.isValid, result.error)
      }
    }, 300),
    [validator, touched, onValidationChange]
  )

  useEffect(() => {
    debouncedValidation(value)
  }, [value, debouncedValidation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = sanitizeInput(e.target.value)

    // Apply formatter if provided
    if (formatter) {
      newValue = formatter(newValue)
    }

    onChange(newValue)
  }

  const handleBlur = () => {
    setTouched(true)
    setIsFocused(false)

    if (validator) {
      const result = validator(value)
      setValidation(result)
      onValidationChange?.(result.isValid, result.error)
    }

    onBlur?.()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  // Dynamic border and ring colors
  const getBorderClass = () => {
    if (disabled) return 'border-gray-200'
    if (isFocused) return 'border-brand-500 ring-2 ring-brand-200'
    if (touched && !validation.isValid) return 'border-red-500 ring-2 ring-red-200'
    if (touched && validation.isValid && value) return 'border-green-500'
    return 'border-gray-200 hover:border-gray-300'
  }

  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`space-y-2 landscape:space-y-1.5 ${className}`}>
      {/* Label */}
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-describedby={
            helpText ? `${inputId}-help` :
            (touched && validation.error) ? `${inputId}-error` : undefined
          }
          aria-invalid={touched && !validation.isValid}
          className={`
            w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200
            ${getBorderClass()}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            text-gray-900 placeholder-gray-400
            ${minHeight ? `min-h-[${minHeight}px]` : ''}
            focus:outline-none
          `}
          style={{ minHeight: `${minHeight}px` }}
        />

        {/* Success/Error Icons */}
        {touched && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && !touched && (
        <p id={`${inputId}-help`} className="text-sm sm:text-xs text-gray-600 leading-relaxed mt-2">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {touched && validation.error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600 flex items-center animate-slide-down"
          role="alert"
        >
          <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {validation.error}
        </p>
      )}

      {/* Character Counter */}
      {maxLength && isFocused && (
        <p className="text-xs text-gray-400 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  )
}

// Specialized input components
export function EmailInput(props: Omit<BaseInputProps, 'type'>) {
  return (
    <EnhancedInput
      {...props}
      type="email"
      inputMode="email"
      validator={validateEmail}
      autoComplete="email"
      placeholder={props.placeholder || "your@email.com"}
      helpText="We'll never share your email with anyone"
    />
  )
}

export function PhoneInput(props: Omit<BaseInputProps, 'type'>) {
  return (
    <EnhancedInput
      {...props}
      type="tel"
      inputMode="tel"
      validator={validatePhone}
      formatter={formatPhone}
      autoComplete="tel"
      placeholder={props.placeholder || "(555) 123-4567"}
      helpText="US phone numbers only"
      maxLength={18} // Formatted phone length
    />
  )
}

export function NameInput(props: Omit<BaseInputProps, 'type'> & { fieldName?: string }) {
  const { fieldName = 'name', ...inputProps } = props

  return (
    <EnhancedInput
      {...inputProps}
      type="text"
      validator={(value) => validateName(value, fieldName)}
      formatter={formatName}
      autoComplete={fieldName === 'first name' ? 'given-name' : 'family-name'}
      maxLength={50}
    />
  )
}

export function CityInput(props: Omit<BaseInputProps, 'type'>) {
  return (
    <EnhancedInput
      {...props}
      type="text"
      validator={validateCity}
      formatter={formatCity}
      autoComplete="address-level2"
      placeholder={props.placeholder || "e.g., Austin, Round Rock"}
      helpText="Enter your preferred city or area"
      maxLength={100}
    />
  )
}

export function ZipCodeInput(props: Omit<BaseInputProps, 'type'>) {
  return (
    <EnhancedInput
      {...props}
      type="text"
      inputMode="numeric"
      validator={validateZipCode}
      autoComplete="postal-code"
      placeholder={props.placeholder || "78759"}
      helpText="Optional - helps us show local programs"
      maxLength={10}
    />
  )
}

export function CurrencyInput(props: Omit<BaseInputProps, 'type'> & {
  min?: number
  max?: number
  fieldName?: string
}) {
  const { min, max, fieldName = 'amount', ...inputProps } = props

  return (
    <EnhancedInput
      {...inputProps}
      type="text"
      inputMode="numeric"
      validator={(value) => validateNumeric(value, fieldName, min, max)}
      formatter={formatCurrency}
      placeholder={props.placeholder || "350000"}
      helpText="Enter amount without commas or dollar signs"
    />
  )
}

// Enhanced Select Component
interface SelectOption {
  value: string
  label: string
  description?: string
}

interface EnhancedSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  className?: string
}

export function EnhancedSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Please select...',
  required = false,
  disabled = false,
  helpText,
  className = ''
}: EnhancedSelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`space-y-2 landscape:space-y-1.5 ${className}`}>
      {/* Label */}
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      {/* Select Container */}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          aria-describedby={helpText ? `${selectId}-help` : undefined}
          className={`
            w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 appearance-none
            ${isFocused ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}
            text-gray-900 min-h-[48px]
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={`${selectId}-help`} className="text-sm sm:text-xs text-gray-600 leading-relaxed mt-2">
          {helpText}
        </p>
      )}
    </div>
  )
}

// Enhanced Checkbox Group
interface CheckboxOption {
  value: string
  label: string
  description?: string
}

interface EnhancedCheckboxGroupProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: CheckboxOption[]
  required?: boolean
  disabled?: boolean
  helpText?: string
  className?: string
  columns?: 1 | 2 | 3
}

export function EnhancedCheckboxGroup({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  helpText,
  className = '',
  columns = 2
}: EnhancedCheckboxGroupProps) {
  const groupId = `checkbox-group-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleToggle = (optionValue: string) => {
    if (disabled) return

    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]

    onChange(newValue)
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }

  return (
    <fieldset className={`space-y-3 ${className}`}>
      {/* Legend */}
      <legend className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </legend>

      {/* Options Grid */}
      <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4 landscape:gap-2 landscape:sm:gap-3`} role="group" aria-labelledby={groupId}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start space-x-3 sm:space-x-4 p-4 sm:p-3 border rounded-xl cursor-pointer transition-all duration-200 min-h-[64px] sm:min-h-[auto] touch-manipulation
              ${value.includes(option.value)
                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
              focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2
            `}
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              disabled={disabled}
              className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-2 mt-1 sm:mt-0.5 touch-manipulation"
              aria-describedby={option.description ? `${option.value}-desc` : undefined}
            />
            <div className="flex-1 min-w-0">
              <span className="text-gray-900 font-medium text-base sm:text-sm leading-relaxed">{option.label}</span>
              {option.description && (
                <p id={`${option.value}-desc`} className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Help Text */}
      {helpText && (
        <p className="text-sm sm:text-xs text-gray-600 leading-relaxed mt-2">
          {helpText}
        </p>
      )}
    </fieldset>
  )
}

// Enhanced Radio Group
interface RadioOption {
  value: string
  label: string
  description?: string
  icon?: string
  example?: string
  urgency?: 'low' | 'medium' | 'high'
}

interface EnhancedRadioGroupProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  required?: boolean
  disabled?: boolean
  helpText?: string
  className?: string
  columns?: 1 | 2 | 3
}

export function EnhancedRadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  helpText,
  className = '',
  columns = 2
}: EnhancedRadioGroupProps) {
  const groupId = `radio-group-${name}`

  const handleChange = (optionValue: string) => {
    if (disabled) return
    onChange(optionValue)
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }

  return (
    <fieldset className={`space-y-3 ${className}`}>
      {/* Legend */}
      <legend className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </legend>

      {/* Options Grid */}
      <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4 landscape:gap-2 landscape:sm:gap-3`} role="radiogroup" aria-labelledby={groupId}>
        {options.map((option) => {
          // Create enhanced content for RadioButton
          const radioContent = (
            <div className="flex items-start w-full">
              {option.icon && (
                <div className="flex-shrink-0 mr-3 sm:mr-2">
                  <span className="text-2xl sm:text-xl">{option.icon}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-base sm:text-sm font-semibold text-gray-900 leading-relaxed">
                      {option.label}
                    </span>

                    {option.urgency === 'high' && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                {option.description && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {option.description}
                  </p>
                )}

                {option.example && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {option.example}
                  </p>
                )}
              </div>
            </div>
          )

          // Enhanced description for accessibility
          const enhancedDescription = [
            option.description,
            option.example && `Example: ${option.example}`,
            option.urgency === 'high' ? 'This is an urgent option' : null
          ].filter(Boolean).join('. ')

          return (
            <RadioButton
              key={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
              description={enhancedDescription}
              className="min-h-[80px] sm:min-h-[64px]"
            >
              {radioContent}
            </RadioButton>
          )
        })}
      </div>

      {/* Help Text */}
      {helpText && (
        <p className="text-sm sm:text-xs text-gray-600 leading-relaxed mt-2">
          {helpText}
        </p>
      )}
    </fieldset>
  )
}