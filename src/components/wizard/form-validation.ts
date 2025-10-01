// Form validation utilities for the Interactive Homebuyer Wizard

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface FieldValidation {
  value: string | number
  required?: boolean
  touched?: boolean
}

// Email validation with common typo detection
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Please enter your email address' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  // Check for common typos
  const commonTypos = [
    { pattern: /@gmail\.co$/, suggestion: '@gmail.com' },
    { pattern: /@yahoo\.co$/, suggestion: '@yahoo.com' },
    { pattern: /@hotmail\.co$/, suggestion: '@hotmail.com' },
    { pattern: /@outlook\.co$/, suggestion: '@outlook.com' }
  ]

  for (const typo of commonTypos) {
    if (typo.pattern.test(email)) {
      return { isValid: false, error: `Did you mean ${email.replace(typo.pattern, typo.suggestion)}?` }
    }
  }

  return { isValid: true }
}

// Phone validation with auto-formatting
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Please enter your phone number' }
  }

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  if (digits.length < 10) {
    return { isValid: false, error: 'Please enter a valid phone number like (555) 123-4567' }
  }

  if (digits.length > 11) {
    return { isValid: false, error: 'Phone number is too long' }
  }

  // Check for valid US number (optional country code)
  if (digits.length === 11 && !digits.startsWith('1')) {
    return { isValid: false, error: 'Please enter a valid US phone number' }
  }

  return { isValid: true }
}

// Format phone number as user types
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 0) return ''
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`

  // Handle 11 digit numbers (with country code)
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
}

// Name validation
export const validateName = (name: string, fieldName: string = 'name'): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: `Please enter your ${fieldName.toLowerCase()}` }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` }
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` }
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }

  return { isValid: true }
}

// Auto-capitalize name
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Numeric field validation
export const validateNumeric = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: `Please enter ${fieldName.toLowerCase()}` }
  }

  const numericValue = parseFloat(value.replace(/,/g, ''))

  if (isNaN(numericValue)) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` }
  }

  if (min !== undefined && numericValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min.toLocaleString()}` }
  }

  if (max !== undefined && numericValue > max) {
    return { isValid: false, error: `${fieldName} must be less than ${max.toLocaleString()}` }
  }

  return { isValid: true }
}

// Format currency with commas
export const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '')
  if (!numericValue) return ''

  return parseInt(numericValue).toLocaleString()
}

// ZIP code validation
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode.trim()) {
    return { isValid: true } // ZIP code is optional
  }

  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!zipRegex.test(zipCode)) {
    return { isValid: false, error: 'Please enter a valid ZIP code (e.g., 78759 or 78759-1234)' }
  }

  return { isValid: true }
}

// City validation
export const validateCity = (city: string): ValidationResult => {
  if (!city.trim()) {
    return { isValid: false, error: 'Please enter a city or area' }
  }

  if (city.trim().length < 2) {
    return { isValid: false, error: 'City name must be at least 2 characters' }
  }

  if (city.trim().length > 100) {
    return { isValid: false, error: 'City name is too long' }
  }

  // Allow letters, spaces, hyphens, apostrophes, periods
  const cityRegex = /^[a-zA-ZÀ-ÿ\s\-'.]+$/
  if (!cityRegex.test(city)) {
    return { isValid: false, error: 'City name contains invalid characters' }
  }

  return { isValid: true }
}

// Format city name
export const formatCity = (city: string): string => {
  return city
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Debounced validation for real-time feedback
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
}

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: number = 0
  private lastAttempt: number = 0
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 3, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  canAttempt(): boolean {
    const now = Date.now()

    // Reset if window has passed
    if (now - this.lastAttempt > this.windowMs) {
      this.attempts = 0
    }

    return this.attempts < this.maxAttempts
  }

  recordAttempt(): void {
    this.attempts++
    this.lastAttempt = Date.now()
  }

  getTimeUntilReset(): number {
    const now = Date.now()
    const timeSinceLastAttempt = now - this.lastAttempt
    return Math.max(0, this.windowMs - timeSinceLastAttempt)
  }
}