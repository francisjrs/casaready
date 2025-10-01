/**
 * Wizard Service - Manages wizard state, navigation, and validation logic
 *
 * This service encapsulates all wizard flow management and provides
 * a clean interface for the wizard component to manage user progression through the steps.
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { createValidationSchemas } from '@/lib/validations'
import type { WizardData, ContactInfo, ReportData } from './ai-service'
import type { CensusAreaInsights } from './census-service'
import type { Locale } from '@/lib/i18n'
import { translations, getNestedTranslation } from '@/lib/i18n'
import type { PrivacySafePlanGenerationInput } from '@/validators/planning-schemas'
import {
  autoSaveProgress,
  loadWizardProgress,
  clearWizardProgress,
  type WizardProgress
} from './wizard-storage'

// TypeScript interfaces for wizard state and operations
export interface WizardState {
  currentStep: number
  totalSteps: number
  wizardData: WizardData
  contactInfo: ContactInfo
  completedSteps: Set<number>
  isValid: Record<number, boolean>
  errors: Record<number, string[]>
  locale: Locale
  censusData?: CensusAreaInsights
  reportData?: ReportData
  isTransitioning: boolean
  isValidating: boolean
}

export interface WizardContextValue extends WizardState {
  // Navigation methods
  goToStep: (stepId: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void

  // Data management methods
  updateStepData: <T extends keyof WizardData>(stepId: number, data: Partial<Pick<WizardData, T>>) => void
  updateContactInfo: (data: Partial<ContactInfo>) => void
  getStepData: (stepId: number) => Partial<WizardData>
  updateCensusData: (data: CensusAreaInsights | undefined) => void
  updateReportData: (data: ReportData) => void
  getPrivacySafeData: () => PrivacySafePlanGenerationInput

  // Validation methods
  validateStep: (stepId: number, data: any, locale: Locale) => Promise<{ valid: boolean; errors: string[] }>
  canProceedToNext: (stepId: number) => boolean

  // Progress tracking
  getProgress: () => number
  isStepCompleted: (stepId: number) => boolean
  markStepCompleted: (stepId: number) => void

  // Progress saving/restoration
  restoreProgress: (progress: WizardProgress) => void
  clearSavedProgress: () => void
}

// Create the wizard context
const WizardContext = createContext<WizardContextValue | undefined>(undefined)

// Step data mapping - defines which data belongs to which step
const STEP_DATA_MAPPING: Record<number, (keyof WizardData)[]> = {
  1: ['city', 'zipCode', 'locationPriority'], // Location
  2: ['timeline'], // Timeline
  3: ['budgetType', 'targetPrice', 'monthlyBudget'], // Budget
  4: ['annualIncome'], // Income
  5: ['monthlyDebts', 'creditScore'], // Debts & Credit
  6: ['downPaymentAmount', 'downPaymentPercent'], // Down Payment
  7: ['employmentType'], // Employment
  8: ['buyerType', 'householdSize'], // Buyer Profile
  9: [], // Contact Info (handled separately)
  10: [] // Results (no data input)
}

/**
 * Wizard Provider Component
 */
interface WizardProviderProps {
  children: ReactNode
  totalSteps: number
  locale: Locale
}

export function WizardProvider({ children, totalSteps, locale }: WizardProviderProps) {
  // Initialize state
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({})
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isValid, setIsValid] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Record<number, string[]>>({})
  const [censusData, setCensusData] = useState<CensusAreaInsights | undefined>(undefined)
  const [reportData, setReportData] = useState<ReportData | undefined>(undefined)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Navigation methods
  const goToStep = useCallback(async (stepId: number) => {
    if (stepId >= 1 && stepId <= totalSteps && stepId !== currentStep) {
      setIsTransitioning(true)

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 150))

      setCurrentStep(stepId)

      // Scroll to top smoothly for better mobile UX
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setIsTransitioning(false)
    }
  }, [totalSteps, currentStep])

  const goToNextStep = useCallback(async () => {
    if (currentStep < totalSteps) {
      setIsTransitioning(true)

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 150))

      setCurrentStep(prev => prev + 1)

      // Scroll to top smoothly for better mobile UX
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setIsTransitioning(false)
    }
  }, [currentStep, totalSteps])

  const goToPreviousStep = useCallback(async () => {
    if (currentStep > 1) {
      setIsTransitioning(true)

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 150))

      setCurrentStep(prev => prev - 1)

      // Scroll to top smoothly for better mobile UX
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setIsTransitioning(false)
    }
  }, [currentStep])

  // Data management methods
  const updateStepData = useCallback(<T extends keyof WizardData>(
    stepId: number,
    data: Partial<Pick<WizardData, T>>
  ) => {
    setWizardData(prev => ({
      ...prev,
      ...data
    }))

    // Mark step as having data (for progress tracking)
    if (Object.keys(data).length > 0) {
      setCompletedSteps(prev => new Set(prev).add(stepId))
    }
  }, [])

  const updateContactInfo = useCallback((data: Partial<ContactInfo>) => {
    setContactInfo(prev => ({
      ...prev,
      ...data
    }))
  }, [])

  const updateCensusData = useCallback((data: CensusAreaInsights | undefined) => {
    setCensusData(data)
  }, [])

  const updateReportData = useCallback((data: ReportData) => {
    setReportData(data)
  }, [])

  const getStepData = useCallback((stepId: number): Partial<WizardData> => {
    const stepFields = STEP_DATA_MAPPING[stepId] || []
    const stepData: Partial<WizardData> = {}

    stepFields.forEach(field => {
      if (wizardData[field] !== undefined) {
        stepData[field] = wizardData[field]
      }
    })

    return stepData
  }, [wizardData])

  // Validation methods
  const validateStep = useCallback(async (
    stepId: number,
    data: any,
    locale: Locale
  ): Promise<{ valid: boolean; errors: string[] }> => {
    setIsValidating(true)

    try {
      // Select appropriate schema based on step
      switch (stepId) {
        case 1: // Location
          // Note: Location validation might need a custom schema
          // For now, we'll do basic validation
          break
        case 2: // Timeline
          // Basic timeline validation
          if (!data.timeline) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.timelineRequired')] }
          }
          return { valid: true, errors: [] }
        case 3: // Budget
          // Budget validation
          if (data.budgetType === 'price' && !data.targetPrice) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.targetPriceRequired')] }
          }
          if (data.budgetType === 'monthly' && !data.monthlyBudget) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.monthlyBudgetRequired')] }
          }
          return { valid: true, errors: [] }
        case 4: // Income
          if (!data.annualIncome || data.annualIncome <= 0) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.annualIncomeRequired')] }
          }
          return { valid: true, errors: [] }
        case 5: // Debts & Credit
          if (data.monthlyDebts < 0) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.monthlyDebtsNegative')] }
          }
          if (!data.creditScore) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.creditScoreRequired')] }
          }
          return { valid: true, errors: [] }
        case 6: // Down Payment
          if (!data.paymentType) {
            return { valid: false, errors: ['Please select a down payment option'] }
          }

          if (data.paymentType === 'none') {
            // No down payment is valid
            return { valid: true, errors: [] }
          }

          if (data.paymentType === 'amount') {
            if (!data.downPaymentAmount || data.downPaymentAmount <= 0) {
              return { valid: false, errors: ['Please enter a valid down payment amount'] }
            }
            return { valid: true, errors: [] }
          }

          if (data.paymentType === 'percentage') {
            if (data.downPaymentPercent === undefined || data.downPaymentPercent === null || data.downPaymentPercent < 0 || data.downPaymentPercent > 100) {
              return { valid: false, errors: ['Please enter a valid percentage between 0 and 100'] }
            }
            return { valid: true, errors: [] }
          }

          return { valid: false, errors: ['Invalid payment type selected'] }
        case 7: // Employment
          if (!data.employmentType) {
            return { valid: false, errors: [getNestedTranslation(translations[locale], 'wizard.validation.employmentTypeRequired')] }
          }
          return { valid: true, errors: [] }
        case 8: // Buyer Profile
          if (!data.buyerType || data.buyerType.length === 0) {
            return { valid: false, errors: ['At least one buyer type is required'] }
          }
          if (!data.householdSize || data.householdSize < 1) {
            return { valid: false, errors: ['Valid household size is required'] }
          }
          return { valid: true, errors: [] }
        case 9: // Contact Info
          // Use the contact info schema
          const contactErrors: string[] = []
          if (!data.firstName?.trim()) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.firstNameRequired'))
          }
          if (!data.lastName?.trim()) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.lastNameRequired'))
          }
          if (!data.email?.trim()) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.emailRequired'))
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.emailInvalid'))
          }
          if (!data.phone?.trim()) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.phoneRequired'))
          } else if (data.phone.replace(/\D/g, '').length < 10) {
            contactErrors.push(getNestedTranslation(translations[locale], 'wizard.validation.phoneInvalid'))
          }
          return { valid: contactErrors.length === 0, errors: contactErrors }
        default:
          return { valid: true, errors: [] }
      }

      // Update validation state
      setIsValid(prev => ({ ...prev, [stepId]: true }))
      setErrors(prev => ({ ...prev, [stepId]: [] }))

      return { valid: true, errors: [] }
    } catch (_error) {
      const errorMessages = [getNestedTranslation(translations[locale], 'wizard.validation.generalError')]
      setIsValid(prev => ({ ...prev, [stepId]: false }))
      setErrors(prev => ({ ...prev, [stepId]: errorMessages }))

      return { valid: false, errors: errorMessages }
    } finally {
      setIsValidating(false)
    }
  }, [])

  const canProceedToNext = useCallback((stepId: number): boolean => {
    // Check if current step is valid
    if (isValid[stepId] === false) {
      return false
    }

    // Check if required data is present for the step
    const stepFields = STEP_DATA_MAPPING[stepId] || []

    if (stepId === 9) {
      // Contact info validation
      return !!(contactInfo.firstName && contactInfo.lastName && contactInfo.email && contactInfo.phone)
    }

    // For other steps, check if at least some data is present
    if (stepFields.length === 0) {
      return true // Steps with no data requirements
    }

    return stepFields.some(field => wizardData[field] !== undefined && wizardData[field] !== '')
  }, [isValid, wizardData, contactInfo])

  // Progress tracking
  const getProgress = useCallback((): number => {
    return Math.round((completedSteps.size / totalSteps) * 100)
  }, [completedSteps.size, totalSteps])

  const isStepCompleted = useCallback((stepId: number): boolean => {
    return completedSteps.has(stepId)
  }, [completedSteps])

  const markStepCompleted = useCallback((stepId: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepId))
  }, [])

  // Progress saving/restoration methods
  const restoreProgress = useCallback((progress: WizardProgress) => {
    setCurrentStep(progress.currentStep)
    setCompletedSteps(progress.completedSteps)
    setWizardData(progress.formData.wizardData || {})
    setContactInfo(progress.formData.contactInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })
    // Note: We don't restore censusData or reportData for privacy/freshness
  }, [])

  const clearSavedProgress = useCallback(() => {
    clearWizardProgress()
  }, [])

  // Auto-save effect - save progress whenever important state changes
  useEffect(() => {
    if (currentStep > 1 || completedSteps.size > 0 || Object.keys(wizardData).length > 0) {
      const progressData = {
        currentStep,
        completedSteps,
        formData: {
          wizardData,
          contactInfo
        },
        locale,
        totalSteps
      }

      // Auto-save with 2 second debounce
      autoSaveProgress(progressData, 2000)
    }
  }, [currentStep, completedSteps, wizardData, contactInfo, locale, totalSteps])

  // Privacy-safe data extraction
  const getPrivacySafeData = useCallback((): PrivacySafePlanGenerationInput => {
    return {
      userProfile: {
        incomeDebt: {
          annualIncome: wizardData.annualIncome || 50000,
          monthlyDebts: wizardData.monthlyDebts || 0,
          downPaymentAmount: wizardData.downPaymentAmount || 0,
          creditScore: wizardData.creditScore || 'unknown'
        },
        employment: {
          employmentStatus: wizardData.employmentType || 'unknown',
          employerName: 'Confidential',
          jobTitle: 'Confidential',
          yearsAtJob: 1,
          employerPhone: '',
          workAddress: ''
        },
        location: {
          preferredCity: wizardData.city || 'Unknown',
          preferredState: 'Unknown',
          preferredZipCode: wizardData.zipCode || '',
          maxBudget: wizardData.targetPrice || (wizardData.monthlyBudget ? wizardData.monthlyBudget * 166 : 300000),
          minBedrooms: 1,
          minBathrooms: 1,
          homeType: 'single-family',
          timeframe: wizardData.timeline || '6-12',
          firstTimeBuyer: wizardData.buyerType?.includes('first-time') || false
        }
      },
      preferences: {
        language: locale,
        riskTolerance: 'moderate' as const,
        focusAreas: [],
        excludePrograms: [],
        buyerSpecialization: {
          isFirstTimeBuyer: wizardData.buyerType?.includes('first-time') || false,
          isMilitaryVeteran: wizardData.buyerType?.includes('veteran') || false,
          isUSDAEligible: false,
          isITINTaxpayer: false,
          isInvestor: wizardData.buyerType?.includes('investor') || false,
          needsAccessibilityFeatures: false
        }
      }
    }
  }, [wizardData, locale])

  // Context value
  const contextValue: WizardContextValue = {
    // State
    currentStep,
    totalSteps,
    wizardData,
    contactInfo,
    completedSteps,
    isValid,
    errors,
    locale,
    censusData,
    reportData,
    isTransitioning,
    isValidating,

    // Navigation methods
    goToStep,
    goToNextStep,
    goToPreviousStep,

    // Data management methods
    updateStepData,
    updateContactInfo,
    getStepData,
    updateCensusData,
    updateReportData,
    getPrivacySafeData,

    // Validation methods
    validateStep,
    canProceedToNext,

    // Progress tracking
    getProgress,
    isStepCompleted,
    markStepCompleted,

    // Progress saving/restoration
    restoreProgress,
    clearSavedProgress
  }

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  )
}

/**
 * Custom hook to use the wizard context
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}

/**
 * Utility functions for wizard management
 */
export const WizardUtils = {
  /**
   * Gets the validation status for all steps
   */
  getValidationSummary: (wizard: WizardContextValue) => {
    const summary = {
      totalSteps: wizard.totalSteps,
      validSteps: Object.keys(wizard.isValid).filter(step => wizard.isValid[parseInt(step)]).length,
      invalidSteps: Object.keys(wizard.errors).filter(step => wizard.errors[parseInt(step)]?.length > 0).length,
      completedSteps: wizard.completedSteps.size
    }
    return summary
  },

  /**
   * Checks if the wizard is ready for submission
   */
  isReadyForSubmission: (wizard: WizardContextValue) => {
    // Check if all required steps are completed and valid
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9] // All steps except results

    return requiredSteps.every(step => {
      if (step === 9) {
        // Contact info validation
        return !!(wizard.contactInfo.firstName && wizard.contactInfo.lastName &&
                 wizard.contactInfo.email && wizard.contactInfo.phone)
      }
      return wizard.canProceedToNext(step)
    })
  },

  /**
   * Gets a summary of wizard data for debugging
   */
  getDataSummary: (wizard: WizardContextValue) => {
    return {
      currentStep: wizard.currentStep,
      progress: wizard.getProgress(),
      dataKeys: Object.keys(wizard.wizardData),
      contactInfoComplete: !!(wizard.contactInfo.firstName && wizard.contactInfo.lastName &&
                             wizard.contactInfo.email && wizard.contactInfo.phone),
      validationState: wizard.isValid,
      errors: wizard.errors
    }
  }
}