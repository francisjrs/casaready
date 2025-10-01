/**
 * Data Service - Handles data transformation and validation utilities
 *
 * This service encapsulates all data processing utilities and provides
 * a clean interface for data transformation throughout the application.
 */

import type { WizardData, ContactInfo } from './ai-service'
import type { LeadData } from './lead-service'
import type { Locale } from '@/lib/i18n'

// TypeScript interfaces for data transformation operations
export interface DataValidationResult {
  isValid: boolean
  value: any
  errors: string[]
}

export interface FormattingOptions {
  locale?: string
  currency?: string
  decimals?: number
}

/**
 * Parses numeric input from string, handling various formats
 */
export function parseNumericInput(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value
  }

  // Remove common formatting characters
  const cleanedValue = value.toString()
    .replace(/[$,\s]/g, '') // Remove $, commas, and spaces
    .replace(/[^\d.-]/g, '') // Keep only digits, dots, and dashes

  const parsed = parseFloat(cleanedValue)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * Sanitizes and validates positive number input
 */
export function sanitizePositiveNumberInput(
  value: string | number | undefined,
  fieldName: string = 'value'
): DataValidationResult {
  const parsed = parseNumericInput(value)

  if (parsed === undefined) {
    return {
      isValid: false,
      value: undefined,
      errors: [`${fieldName} is required`]
    }
  }

  if (parsed <= 0) {
    return {
      isValid: false,
      value: parsed,
      errors: [`${fieldName} must be positive`]
    }
  }

  return {
    isValid: true,
    value: parsed,
    errors: []
  }
}

/**
 * Sanitizes and validates non-negative number input
 */
export function sanitizeNonNegativeNumberInput(
  value: string | number | undefined,
  fieldName: string = 'value'
): DataValidationResult {
  const parsed = parseNumericInput(value)

  if (parsed === undefined) {
    return {
      isValid: true, // Non-negative allows undefined/empty
      value: undefined,
      errors: []
    }
  }

  if (parsed < 0) {
    return {
      isValid: false,
      value: parsed,
      errors: [`${fieldName} cannot be negative`]
    }
  }

  return {
    isValid: true,
    value: parsed,
    errors: []
  }
}

/**
 * Sanitizes optional string input
 */
export function sanitizeOptionalString(
  value: string | undefined,
  maxLength?: number
): DataValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: true,
      value: undefined,
      errors: []
    }
  }

  const trimmed = value.trim()

  if (maxLength && trimmed.length > maxLength) {
    return {
      isValid: false,
      value: trimmed,
      errors: [`Value must be ${maxLength} characters or less`]
    }
  }

  return {
    isValid: true,
    value: trimmed,
    errors: []
  }
}

/**
 * Formats currency values for display
 */
export function formatCurrency(
  amount: number | undefined,
  options: FormattingOptions = {}
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0'
  }

  const { locale = 'en-US', currency = 'USD', decimals = 0 } = options

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount)
}

/**
 * Formats percentage values for display
 */
export function formatPercentage(
  value: number | undefined,
  decimals: number = 1
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%'
  }

  return `${value.toFixed(decimals)}%`
}

/**
 * Formats phone numbers for display and storage
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) {
    return ''
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Format US phone numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return original if not a standard US number
  return phone
}

/**
 * Validates phone number format
 */
export function validatePhoneNumber(phone: string | undefined): DataValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      value: undefined,
      errors: ['Phone number is required']
    }
  }

  const digits = phone.replace(/\D/g, '')

  if (digits.length < 10) {
    return {
      isValid: false,
      value: phone,
      errors: ['Phone number must be at least 10 digits']
    }
  }

  if (digits.length > 11) {
    return {
      isValid: false,
      value: phone,
      errors: ['Phone number is too long']
    }
  }

  return {
    isValid: true,
    value: formatPhoneNumber(phone),
    errors: []
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string | undefined): DataValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      value: undefined,
      errors: ['Email is required']
    }
  }

  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      value: trimmed,
      errors: ['Please enter a valid email address']
    }
  }

  return {
    isValid: true,
    value: trimmed,
    errors: []
  }
}

/**
 * Normalizes wizard data for consistent processing
 */
export function normalizeWizardData(data: Partial<WizardData>): WizardData {
  const normalized: WizardData = {}

  // Normalize string fields
  if (data.city) {
    normalized.city = sanitizeOptionalString(data.city, 100).value
  }

  if (data.zipCode) {
    normalized.zipCode = sanitizeOptionalString(data.zipCode, 10).value
  }

  if (data.timeline) {
    normalized.timeline = data.timeline
  }

  if (data.budgetType) {
    normalized.budgetType = data.budgetType
  }

  if (data.employmentType) {
    normalized.employmentType = data.employmentType
  }

  // Normalize numeric fields
  if (data.targetPrice !== undefined) {
    normalized.targetPrice = parseNumericInput(data.targetPrice)
  }

  if (data.monthlyBudget !== undefined) {
    normalized.monthlyBudget = parseNumericInput(data.monthlyBudget)
  }

  if (data.annualIncome !== undefined) {
    normalized.annualIncome = parseNumericInput(data.annualIncome)
  }

  if (data.monthlyDebts !== undefined) {
    normalized.monthlyDebts = parseNumericInput(data.monthlyDebts)
  }

  if (data.downPaymentAmount !== undefined) {
    normalized.downPaymentAmount = parseNumericInput(data.downPaymentAmount)
  }

  if (data.downPaymentPercent !== undefined) {
    normalized.downPaymentPercent = parseNumericInput(data.downPaymentPercent)
  }

  if (data.householdSize !== undefined) {
    normalized.householdSize = parseNumericInput(data.householdSize)
  }

  // Normalize array fields
  if (data.locationPriority) {
    normalized.locationPriority = Array.isArray(data.locationPriority) ? data.locationPriority : []
  }

  if (data.buyerType) {
    normalized.buyerType = Array.isArray(data.buyerType) ? data.buyerType : []
  }

  // Normalize credit score
  if (data.creditScore) {
    normalized.creditScore = data.creditScore
  }

  return normalized
}

/**
 * Normalizes contact info for consistent processing
 */
export function normalizeContactInfo(data: Partial<ContactInfo>): ContactInfo {
  return {
    firstName: sanitizeOptionalString(data.firstName, 50).value || '',
    lastName: sanitizeOptionalString(data.lastName, 50).value || '',
    email: data.email ? validateEmail(data.email).value || '' : '',
    phone: data.phone ? validatePhoneNumber(data.phone).value || '' : ''
  }
}

/**
 * Calculates financial metrics from wizard data
 */
export interface FinancialMetrics {
  monthlyIncome: number
  debtToIncomeRatio: number
  maxHousingPayment: number
  estimatedAffordability: number
  recommendedDownPayment: number
}

export function calculateFinancialMetrics(wizardData: WizardData): FinancialMetrics {
  const annualIncome = wizardData.annualIncome || 0
  const monthlyIncome = annualIncome / 12
  const monthlyDebts = wizardData.monthlyDebts || 0

  // Calculate debt-to-income ratio
  const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebts / monthlyIncome) * 100 : 0

  // Calculate maximum housing payment (28% rule)
  const maxHousingPayment = monthlyIncome * 0.28

  // Calculate estimated affordability (rough calculation)
  // Assumes 6.5% interest rate, 30-year loan, 80% for P&I (20% for taxes/insurance)
  const availableForPI = maxHousingPayment * 0.8
  const estimatedAffordability = availableForPI * 166 // Rough multiplier for 6.5% 30-year

  // Calculate recommended down payment (20% of estimated affordability)
  const recommendedDownPayment = estimatedAffordability * 0.2

  return {
    monthlyIncome,
    debtToIncomeRatio,
    maxHousingPayment,
    estimatedAffordability,
    recommendedDownPayment
  }
}

/**
 * Converts wizard data to lead data format
 */
export function convertWizardToLeadData(
  wizardData: WizardData,
  contactInfo: ContactInfo,
  locale: Locale
): Partial<LeadData> {
  const normalized = normalizeWizardData(wizardData)
  const normalizedContact = normalizeContactInfo(contactInfo)

  const leadData: Partial<LeadData> = {
    ...normalizedContact,
    language: locale,
    source: 'Sully Ruiz Website',
    page: 'Interactive Wizard',
    campaign: 'Home Buying Wizard'
  }

  // Map wizard fields to lead fields
  if (normalized.annualIncome) leadData.annualIncome = normalized.annualIncome
  if (normalized.monthlyDebts) leadData.monthlyDebts = normalized.monthlyDebts
  if (normalized.creditScore) leadData.creditScore = normalized.creditScore
  if (normalized.downPaymentAmount) leadData.downPaymentAmount = normalized.downPaymentAmount
  if (normalized.city) leadData.preferredCity = normalized.city
  if (normalized.zipCode) leadData.preferredZipCode = normalized.zipCode
  if (normalized.targetPrice) leadData.maxBudget = normalized.targetPrice
  if (normalized.employmentType) leadData.employmentStatus = normalized.employmentType

  // Set first-time buyer flag
  if (normalized.buyerType?.includes('first-time')) {
    leadData.firstTimeBuyer = true
  }

  // Map timeline
  if (normalized.timeline) {
    const timeframeMap: Record<string, string> = {
      '0-3': '0-3 months',
      '3-6': '3-6 months',
      '6-12': '6-12 months',
      '12+': '12+ months'
    }
    leadData.timeframe = timeframeMap[normalized.timeline] || normalized.timeline
  }

  return leadData
}

/**
 * Generates a data summary for debugging and logging
 */
export function generateDataSummary(wizardData: WizardData, contactInfo: ContactInfo): string {
  const summary: string[] = []

  summary.push('=== Wizard Data Summary ===')
  summary.push(`Timestamp: ${new Date().toISOString()}`)

  // Contact info
  summary.push(`Contact: ${contactInfo.firstName} ${contactInfo.lastName}`)
  summary.push(`Email: ${contactInfo.email}`)
  summary.push(`Phone: ${contactInfo.phone}`)

  // Financial data
  if (wizardData.annualIncome) {
    summary.push(`Annual Income: ${formatCurrency(wizardData.annualIncome)}`)
  }
  if (wizardData.monthlyDebts) {
    summary.push(`Monthly Debts: ${formatCurrency(wizardData.monthlyDebts)}`)
  }
  if (wizardData.creditScore) {
    summary.push(`Credit Score: ${wizardData.creditScore}`)
  }

  // Goals and preferences
  if (wizardData.targetPrice) {
    summary.push(`Target Price: ${formatCurrency(wizardData.targetPrice)}`)
  }
  if (wizardData.monthlyBudget) {
    summary.push(`Monthly Budget: ${formatCurrency(wizardData.monthlyBudget)}`)
  }
  if (wizardData.city || wizardData.zipCode) {
    summary.push(`Location: ${wizardData.city || ''} ${wizardData.zipCode || ''}`.trim())
  }
  if (wizardData.timeline) {
    summary.push(`Timeline: ${wizardData.timeline}`)
  }

  // Calculate and add financial metrics
  const metrics = calculateFinancialMetrics(wizardData)
  summary.push('=== Financial Analysis ===')
  summary.push(`Monthly Income: ${formatCurrency(metrics.monthlyIncome)}`)
  summary.push(`Debt-to-Income Ratio: ${formatPercentage(metrics.debtToIncomeRatio)}`)
  summary.push(`Max Housing Payment: ${formatCurrency(metrics.maxHousingPayment)}`)
  summary.push(`Estimated Affordability: ${formatCurrency(metrics.estimatedAffordability)}`)

  return summary.join('\n')
}

// Note: All functions are exported at declaration level above
// No need for re-export block