/**
 * Services Index - Central export point for all service layer functionality
 *
 * This file provides a clean export interface for all services, making it easy
 * for components to import and use the services with a consistent interface.
 *
 * @fileoverview Service Layer Architecture
 *
 * The service layer separates business logic from UI components, providing:
 * - Clean separation of concerns
 * - Improved testability
 * - Better code organization
 * - Reusable business logic
 * - Consistent data handling
 *
 * ## Service Architecture:
 *
 * 1. **AI Service** (`ai-service.ts`)
 *    - Handles report generation and AI interactions
 *    - Integrates with Gemini AI client
 *    - Provides fallback report generation
 *    - Calculates affordability and recommendations
 *
 * 2. **Lead Service** (`lead-service.ts`)
 *    - Manages lead data processing and submission
 *    - Integrates with Zapier and API endpoints
 *    - Handles data transformation and validation
 *    - Provides comprehensive error handling
 *
 * 3. **Wizard Service** (`wizard-service.ts`)
 *    - Manages wizard state and navigation
 *    - Provides React Context for wizard flow
 *    - Handles step validation and progress tracking
 *    - Manages data persistence between steps
 *
 * 4. **Data Service** (`data-service.ts`)
 *    - Handles data transformation and validation
 *    - Provides utility functions for data processing
 *    - Manages data normalization and formatting
 *    - Calculates financial metrics
 *
 * ## Usage Examples:
 *
 * ```typescript
 * // Using AI Service
 * import { generateHomebuyingReport } from '@/lib/services'
 * const report = await generateHomebuyingReport(wizardData, contactInfo, 'en')
 *
 * // Using Lead Service
 * import { submitLead } from '@/lib/services'
 * const result = await submitLead(wizardData, contactInfo, 'en')
 *
 * // Using Wizard Context
 * import { WizardProvider, useWizard } from '@/lib/services'
 * const { currentStep, goToNextStep, updateStepData } = useWizard()
 *
 * // Using Data Utilities
 * import { formatCurrency, validateEmail } from '@/lib/services'
 * const formatted = formatCurrency(50000)
 * const validation = validateEmail('test@example.com')
 * ```
 */

// AI Service exports
export {
  generateHomebuyingReport,
  buildComprehensiveNote,
  determineProgramFit,
  generateTips,
  generateActionPlan,
  determinePrimaryLeadType,
  generateUIReport
} from './ai-service'

// Lead Service exports
export {
  submitLead,
  extractLeadDataFromWizard,
  generateLeadNotes,
  validateLeadData,
  submitToAPI
} from './lead-service'

// Wizard Service exports - React Context and utilities
export {
  WizardProvider,
  useWizard,
  WizardUtils
} from './wizard-service.tsx'

// Data Service exports - Utilities and transformations
export {
  // Input sanitization functions
  parseNumericInput,
  sanitizePositiveNumberInput,
  sanitizeNonNegativeNumberInput,
  sanitizeOptionalString,

  // Formatting functions
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,

  // Validation functions
  validatePhoneNumber,
  validateEmail,

  // Normalization functions
  normalizeWizardData,
  normalizeContactInfo,

  // Calculation functions
  calculateFinancialMetrics,

  // Conversion functions
  convertWizardToLeadData,

  // Debugging functions
  generateDataSummary
} from './data-service'

// Census Service exports - Location insights and demographic data
export {
  getCensusAreaInsights,
  validateCity,
  compareAreas,
  CensusUtils,
  censusCache
} from './census-service'

/**
 * Service Layer Factory Functions
 *
 * These functions provide convenient ways to initialize and use services
 * with common configurations.
 */

/**
 * Creates a complete service context for wizard operations
 * @param locale - The locale for internationalization
 * @returns Object containing all service functions bound to the locale
 */
export function createWizardServices(locale: 'en' | 'es' = 'en') {
  return {
    // AI services bound to locale
    generateReport: async (wizardData: any, contactInfo: any) => {
      const { generateHomebuyingReport } = await import('./ai-service')
      return generateHomebuyingReport(wizardData, contactInfo, locale)
    },

    // Lead services bound to locale
    submitLead: async (wizardData: any, contactInfo: any) => {
      const { submitLead } = await import('./lead-service')
      return submitLead(wizardData, contactInfo, locale)
    },

    // Data services
    formatCurrency: async (amount: number | undefined) => {
      const { formatCurrency } = await import('./data-service')
      return formatCurrency(amount, { locale: locale === 'es' ? 'es-MX' : 'en-US' })
    },

    validateData: async (data: any) => {
      const { normalizeWizardData, normalizeContactInfo } = await import('./data-service')
      return {
        wizardData: normalizeWizardData(data.wizardData || {}),
        contactInfo: normalizeContactInfo(data.contactInfo || {})
      }
    }
  }
}

/**
 * Service Layer Constants
 *
 * Common constants used across the service layer
 */
export const SERVICE_CONSTANTS = {
  // Validation constants
  MIN_PHONE_DIGITS: 10,
  MAX_PHONE_DIGITS: 11,
  MAX_NAME_LENGTH: 50,
  MAX_CITY_LENGTH: 100,
  MAX_ZIP_LENGTH: 10,

  // Financial calculation constants
  DEFAULT_INTEREST_RATE: 6.5,
  HOUSING_PAYMENT_RATIO: 0.28,
  TOTAL_DEBT_RATIO: 0.36,
  PI_RATIO: 0.8, // Principal & Interest as percentage of total housing payment

  // Default values
  DEFAULT_ANNUAL_INCOME: 50000,
  MIN_HOUSEHOLD_SIZE: 1,
  MAX_HOUSEHOLD_SIZE: 10,

  // Timeline options
  TIMELINE_OPTIONS: ['0-3', '3-6', '6-12', '12+'] as const,

  // Credit score ranges
  CREDIT_SCORE_RANGES: [
    '800-850',
    '740-799',
    '670-739',
    '580-669',
    '300-579',
    'unknown'
  ] as const,

  // Employment types
  EMPLOYMENT_TYPES: [
    'w2',
    '1099',
    'self-employed',
    'mixed',
    'retired',
    'other'
  ] as const,

  // Buyer types
  BUYER_TYPES: [
    'first-time',
    'repeat',
    'veteran',
    'investor',
    'relocating',
    'downsizing',
    'upsizing'
  ] as const,

  // Location priorities
  LOCATION_PRIORITIES: [
    'schools',
    'commute',
    'safety',
    'amenities',
    'price',
    'size',
    'neighborhood'
  ] as const
}

/**
 * Service Layer Error Classes
 *
 * Custom error classes for better error handling across services
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public operation: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

export class ValidationError extends ServiceError {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message, 'validation', 'validate', 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class SubmissionError extends ServiceError {
  constructor(
    message: string,
    public endpoint: string,
    public statusCode?: number
  ) {
    super(message, 'lead', 'submit', 'SUBMISSION_ERROR')
    this.name = 'SubmissionError'
  }
}

export class AIError extends ServiceError {
  constructor(
    message: string,
    public aiProvider: string,
    public fallbackUsed: boolean = false
  ) {
    super(message, 'ai', 'generate', 'AI_ERROR')
    this.name = 'AIError'
  }
}

/**
 * Service Layer Utilities
 *
 * Helper functions for working with the service layer
 */
export const ServiceUtils = {
  /**
   * Checks if a service error is recoverable
   */
  isRecoverableError: (error: Error): boolean => {
    if (error instanceof ServiceError) {
      return ['VALIDATION_ERROR', 'AI_ERROR'].includes(error.code || '')
    }
    return false
  },

  /**
   * Gets a user-friendly error message
   */
  getUserFriendlyErrorMessage: (error: Error, locale: 'en' | 'es' = 'en'): string => {
    if (error instanceof ValidationError) {
      return locale === 'es'
        ? 'Por favor verifica la información ingresada'
        : 'Please check the information you entered'
    }

    if (error instanceof SubmissionError) {
      return locale === 'es'
        ? 'Error al enviar la información. Por favor intenta de nuevo.'
        : 'Error submitting information. Please try again.'
    }

    if (error instanceof AIError) {
      return locale === 'es'
        ? 'Error generando el reporte. Usando reporte básico.'
        : 'Error generating report. Using basic report.'
    }

    return locale === 'es'
      ? 'Ha ocurrido un error inesperado'
      : 'An unexpected error occurred'
  },

  /**
   * Logs service operations for debugging
   */
  logServiceOperation: (service: string, operation: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Service: ${service}] ${operation}`, data)
    }
  }
}

/**
 * Re-export commonly used types for convenience
 */
export type { WizardData, ContactInfo, ReportData } from './ai-service'
export type { LeadData, LeadSubmissionResult } from './lead-service'
export type { WizardState, WizardContextValue } from './wizard-service.tsx'
export type { DataValidationResult, FormattingOptions, FinancialMetrics } from './data-service'
export type {
  CensusLocation,
  CensusDemographics,
  CensusAreaInsights,
  CensusServiceResponse
} from './census-service'