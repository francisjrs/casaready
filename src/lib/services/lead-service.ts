/**
 * Lead Service - Handles lead data processing and submission
 *
 * This service encapsulates all lead processing business logic and provides
 * a clean interface for submitting leads from the wizard.
 */

import { submitLead as submitToZapier } from '@/integrations/zapier-client'
import type { WizardData, ContactInfo } from './ai-service'
import type { Locale } from '@/lib/i18n'

// TypeScript interfaces for lead data
export interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  annualIncome?: number
  downPaymentAmount?: number
  creditScore?: string
  monthlyDebts?: number
  additionalIncome?: number
  assets?: number

  // Optional financial information
  downPaymentPercent?: number
  targetPrice?: number
  monthlyBudget?: number

  // Optional location preferences
  preferredState?: string
  preferredCity?: string
  preferredZipCode?: string
  maxBudget?: number
  homeType?: string
  timeframe?: string
  firstTimeBuyer?: boolean

  // Optional employment information
  employmentStatus?: string
  employerName?: string
  jobTitle?: string

  // Optional metadata
  source?: string
  campaign?: string
  language: 'en' | 'es'
  page?: string
}

export interface LeadSubmissionResult {
  success: boolean
  message: string
  leadId?: string
  error?: string
}

/**
 * Extracts lead data from wizard format and transforms it for CRM submission
 */
function extractLeadDataFromWizard(wizardData: WizardData, contactInfo: ContactInfo, locale: Locale): LeadData {
  // Base contact information
  const leadData: LeadData = {
    firstName: contactInfo.firstName,
    lastName: contactInfo.lastName,
    email: contactInfo.email,
    phone: contactInfo.phone,
    language: locale,
    source: 'Sully Ruiz Website',
    page: 'Interactive Wizard',
    campaign: 'Home Buying Wizard'
  }

  // Financial information
  if (wizardData.annualIncome) {
    leadData.annualIncome = wizardData.annualIncome
  }

  if (wizardData.monthlyDebts) {
    leadData.monthlyDebts = wizardData.monthlyDebts
  }

  if (wizardData.creditScore) {
    leadData.creditScore = wizardData.creditScore
  }

  if (wizardData.downPaymentAmount) {
    leadData.downPaymentAmount = wizardData.downPaymentAmount
  }

  if (wizardData.downPaymentPercent) {
    leadData.downPaymentPercent = wizardData.downPaymentPercent
  }

  // Budget and pricing
  if (wizardData.targetPrice) {
    leadData.targetPrice = wizardData.targetPrice
    leadData.maxBudget = wizardData.targetPrice
  }

  if (wizardData.monthlyBudget) {
    leadData.monthlyBudget = wizardData.monthlyBudget
  }

  // Location preferences
  if (wizardData.city) {
    leadData.preferredCity = wizardData.city
  }

  if (wizardData.zipCode) {
    leadData.preferredZipCode = wizardData.zipCode
  }

  // Timeline mapping
  if (wizardData.timeline) {
    const timeframeMap: Record<string, string> = {
      '0-3': '0-3 months',
      '3-6': '3-6 months',
      '6-12': '6-12 months',
      '12+': '12+ months'
    }
    leadData.timeframe = timeframeMap[wizardData.timeline] || wizardData.timeline
  }

  // Employment information
  if (wizardData.employmentType) {
    leadData.employmentStatus = wizardData.employmentType
  }

  // Buyer profile
  if (wizardData.buyerType?.includes('first-time')) {
    leadData.firstTimeBuyer = true
  }

  return leadData
}

/**
 * Generates comprehensive notes for lead tracking
 */
function generateLeadNotes(wizardData: WizardData, contactInfo: ContactInfo, locale: Locale): string {
  const notes: string[] = []

  // Lead source and context
  notes.push(`Lead generated via Interactive Home Buying Wizard`)
  notes.push(`Language preference: ${locale === 'es' ? 'Spanish' : 'English'}`)
  notes.push(`Submission date: ${new Date().toLocaleDateString()}`)

  // Financial profile
  if (wizardData.annualIncome) {
    notes.push(`Annual Income: $${wizardData.annualIncome.toLocaleString()}`)
  }

  if (wizardData.monthlyDebts) {
    notes.push(`Monthly Debts: $${wizardData.monthlyDebts.toLocaleString()}`)
  }

  if (wizardData.creditScore) {
    notes.push(`Credit Score Range: ${wizardData.creditScore}`)
  }

  // Budget preferences
  if (wizardData.budgetType === 'price' && wizardData.targetPrice) {
    notes.push(`Target Price: $${wizardData.targetPrice.toLocaleString()}`)
  } else if (wizardData.budgetType === 'monthly' && wizardData.monthlyBudget) {
    notes.push(`Monthly Payment Budget: $${wizardData.monthlyBudget.toLocaleString()}`)
  }

  // Down payment details
  if (wizardData.downPaymentAmount) {
    notes.push(`Down Payment Amount: $${wizardData.downPaymentAmount.toLocaleString()}`)
  } else if (wizardData.downPaymentPercent) {
    notes.push(`Down Payment Percentage: ${wizardData.downPaymentPercent}%`)
  }

  // Location and preferences
  if (wizardData.city || wizardData.zipCode) {
    notes.push(`Preferred Location: ${wizardData.city || ''} ${wizardData.zipCode || ''}`.trim())
  }

  if (wizardData.locationPriority?.length) {
    notes.push(`Location Priorities: ${wizardData.locationPriority.join(', ')}`)
  }

  // Timeline
  if (wizardData.timeline) {
    const timelineMap: Record<string, string> = {
      '0-3': '0-3 months (urgent)',
      '3-6': '3-6 months',
      '6-12': '6-12 months',
      '12+': '12+ months (planning ahead)'
    }
    notes.push(`Buying Timeline: ${timelineMap[wizardData.timeline] || wizardData.timeline}`)
  }

  // Employment and buyer profile
  if (wizardData.employmentType) {
    notes.push(`Employment Type: ${wizardData.employmentType}`)
  }

  if (wizardData.buyerType?.length) {
    notes.push(`Buyer Profile: ${wizardData.buyerType.join(', ')}`)
  }

  if (wizardData.householdSize) {
    notes.push(`Household Size: ${wizardData.householdSize}`)
  }

  // Key insights and recommendations
  notes.push('\n--- Key Insights ---')

  if (wizardData.buyerType?.includes('first-time')) {
    notes.push('✓ First-time buyer - eligible for special programs')
  }

  if (wizardData.buyerType?.includes('veteran')) {
    notes.push('✓ Veteran - VA loan eligible')
  }

  if (wizardData.employmentType === 'self-employed' || wizardData.employmentType === '1099') {
    notes.push('⚠ Self-employed - may need alternative documentation')
  }

  if (wizardData.creditScore === '300-579') {
    notes.push('⚠ Credit improvement needed')
  }

  if (wizardData.timeline === '0-3') {
    notes.push('🔥 Urgent timeline - prioritize pre-approval')
  }

  return notes.join('\n')
}

/**
 * Validates lead data before submission
 */
function validateLeadData(leadData: LeadData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields validation
  if (!leadData.firstName?.trim()) {
    errors.push('First name is required')
  }

  if (!leadData.lastName?.trim()) {
    errors.push('Last name is required')
  }

  if (!leadData.email?.trim()) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    errors.push('Valid email is required')
  }

  if (!leadData.phone?.trim()) {
    errors.push('Phone number is required')
  } else if (leadData.phone.replace(/\D/g, '').length < 10) {
    errors.push('Valid phone number is required')
  }

  // Optional field validation
  if (leadData.annualIncome && leadData.annualIncome < 0) {
    errors.push('Annual income must be positive')
  }

  if (leadData.monthlyDebts && leadData.monthlyDebts < 0) {
    errors.push('Monthly debts must be non-negative')
  }

  if (leadData.downPaymentAmount && leadData.downPaymentAmount < 0) {
    errors.push('Down payment amount must be non-negative')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Submits lead to the API endpoint
 */
async function submitToAPI(leadData: LeadData): Promise<LeadSubmissionResult> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || 'Lead submitted successfully',
        leadId: result.data?.submissionId
      }
    } else {
      return {
        success: false,
        message: result.message || 'API submission failed',
        error: result.error || 'Unknown API error'
      }
    }
  } catch (error) {
    console.error('API submission error:', error)
    return {
      success: false,
      message: 'Network error during API submission',
      error: error instanceof Error ? error.message : 'Unknown network error'
    }
  }
}

/**
 * Main function to submit lead data with proper validation and error handling
 */
export async function submitLead(
  wizardData: WizardData,
  contactInfo: ContactInfo,
  locale: Locale = 'en'
): Promise<LeadSubmissionResult> {
  try {
    // Extract and transform lead data
    const leadData = extractLeadDataFromWizard(wizardData, contactInfo, locale)

    // Generate comprehensive notes
    const notes = generateLeadNotes(wizardData, contactInfo, locale)

    // Add notes to lead data (if supported by the API)
    const enrichedLeadData = {
      ...leadData,
      notes
    }

    // Validate lead data
    const validation = validateLeadData(enrichedLeadData)
    if (!validation.valid) {
      return {
        success: false,
        message: 'Lead data validation failed',
        error: validation.errors.join(', ')
      }
    }

    // Try API submission first
    const apiResult = await submitToAPI(enrichedLeadData)

    if (apiResult.success) {
      console.log('✅ Lead submitted successfully via API:', {
        email: contactInfo.email,
        leadId: apiResult.leadId,
        timestamp: new Date().toISOString()
      })

      // Also try Zapier submission as backup/additional integration
      try {
        await submitToZapier(enrichedLeadData)
        console.log('✅ Lead also submitted to Zapier successfully')
      } catch (zapierError) {
        console.warn('⚠️ Zapier submission failed (API submission succeeded):', zapierError)
      }

      return apiResult
    }

    // If API fails, try Zapier as fallback
    console.warn('API submission failed, trying Zapier fallback:', apiResult.error)

    const zapierResult = await submitToZapier(enrichedLeadData)

    if (zapierResult.success) {
      console.log('✅ Lead submitted successfully via Zapier fallback')
      return {
        success: true,
        message: 'Lead submitted successfully via backup system',
        leadId: `zapier_${Date.now()}`
      }
    }

    // Both failed
    console.error('❌ Both API and Zapier submission failed')
    return {
      success: false,
      message: 'Lead submission failed on all channels',
      error: `API: ${apiResult.error}, Zapier: ${zapierResult.error || 'Unknown error'}`
    }

  } catch (error) {
    console.error('Lead service error:', error)
    return {
      success: false,
      message: 'Unexpected error during lead submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Export helper functions for testing and reuse
 */
export {
  extractLeadDataFromWizard,
  generateLeadNotes,
  validateLeadData,
  submitToAPI
}