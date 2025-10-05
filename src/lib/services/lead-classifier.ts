/**
 * Lead Classifier Service
 *
 * Analyzes buyer profile and classifies leads into specific categories
 * for targeted AI prompt generation and personalized recommendations.
 *
 * @module lead-classifier
 */

import type { WizardData } from './ai-service'
import type { Locale } from '@/lib/i18n'

/**
 * Lead classification types based on buyer profile analysis
 */
export enum LeadType {
  // ITIN Borrowers
  ITIN_FIRST_TIME = 'ITIN_FIRST_TIME',
  ITIN_INVESTOR = 'ITIN_INVESTOR',
  ITIN_UPSIZING = 'ITIN_UPSIZING',

  // Self-Employed / 1099
  SELF_EMPLOYED_FIRST_TIME = 'SELF_EMPLOYED_FIRST_TIME',
  SELF_EMPLOYED_INVESTOR = 'SELF_EMPLOYED_INVESTOR',
  SELF_EMPLOYED_UPSIZING = 'SELF_EMPLOYED_UPSIZING',

  // W2 Employees
  W2_FIRST_TIME_LOW_CREDIT = 'W2_FIRST_TIME_LOW_CREDIT',      // Credit < 680
  W2_FIRST_TIME_GOOD_CREDIT = 'W2_FIRST_TIME_GOOD_CREDIT',   // Credit >= 680
  W2_INVESTOR = 'W2_INVESTOR',
  W2_UPSIZING = 'W2_UPSIZING',

  // Special Categories
  MILITARY_VETERAN_FIRST_TIME = 'MILITARY_VETERAN_FIRST_TIME',
  MILITARY_VETERAN_UPSIZING = 'MILITARY_VETERAN_UPSIZING',
  RETIRED_BUYER = 'RETIRED_BUYER',
  HIGH_NET_WORTH = 'HIGH_NET_WORTH',                          // Income >$150k, 20%+ down

  // Mixed Employment
  MIXED_INCOME_BUYER = 'MIXED_INCOME_BUYER',

  // Fallback
  STANDARD_BUYER = 'STANDARD_BUYER'
}

/**
 * Loan eligibility based on lead profile
 */
export interface LoanEligibility {
  eligible: string[]
  notEligible: string[]
  recommended: string
  requiresSpecialDocumentation: boolean
}

/**
 * Complete lead profile with classification and attributes
 */
export interface LeadProfile {
  // Core Classification
  leadType: LeadType
  primaryCategory: 'ITIN' | 'SELF_EMPLOYED' | 'W2' | 'MILITARY' | 'RETIRED' | 'MIXED' | 'HIGH_NET_WORTH'

  // Buyer Attributes
  isFirstTime: boolean
  isInvestor: boolean
  isUpsizing: boolean
  isMilitary: boolean

  // Employment
  employmentType: string
  employmentStability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'REQUIRES_REVIEW'

  // Financial
  creditTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN'
  creditScore: string
  debtToIncome: number
  downPaymentPercent: number
  incomeLevel: 'HIGH' | 'MEDIUM' | 'LOW'

  // Location
  targetCity: string
  targetPrice: number
  timeline: string

  // Loan Eligibility
  loanEligibility: LoanEligibility

  // Metadata
  locale: Locale
  specialConsiderations: string[]
  riskFactors: string[]
  strengths: string[]
}

/**
 * Analyzes credit score and returns tier
 */
function getCreditTier(creditScore: string): LeadProfile['creditTier'] {
  if (creditScore === '800+') return 'EXCELLENT'
  if (creditScore === '780-800+' || creditScore === '740-799') return 'EXCELLENT'
  if (creditScore === '720-779' || creditScore === '680-739') return 'GOOD'
  if (creditScore === '620-679' || creditScore === '640-679') return 'FAIR'
  if (creditScore === '600-639' || creditScore === '580-619') return 'POOR'
  return 'UNKNOWN'
}

/**
 * Determines income level based on annual income
 */
function getIncomeLevel(annualIncome: number): LeadProfile['incomeLevel'] {
  if (annualIncome >= 150000) return 'HIGH'
  if (annualIncome >= 70000) return 'MEDIUM'
  return 'LOW'
}

/**
 * Calculates debt-to-income ratio
 */
function calculateDTI(annualIncome: number, monthlyDebts: number): number {
  const monthlyIncome = annualIncome / 12
  return monthlyIncome > 0 ? Math.round((monthlyDebts / monthlyIncome) * 100) : 0
}

/**
 * Determines employment stability
 */
function getEmploymentStability(
  employmentType: string,
  annualIncome: number,
  creditTier: LeadProfile['creditTier']
): LeadProfile['employmentStability'] {
  if (employmentType === 'w2' && creditTier === 'EXCELLENT' && annualIncome >= 80000) {
    return 'EXCELLENT'
  }
  if (employmentType === 'w2' && creditTier === 'GOOD') {
    return 'GOOD'
  }
  if (employmentType === 'self-employed' || employmentType === '1099') {
    return creditTier === 'EXCELLENT' ? 'GOOD' : 'MODERATE'
  }
  if (employmentType === 'itin' || employmentType === 'mixed') {
    return 'REQUIRES_REVIEW'
  }
  return 'MODERATE'
}

/**
 * Determines loan eligibility based on lead profile
 */
function determineLoanEligibility(wizardData: WizardData): LoanEligibility {
  const eligible: string[] = []
  const notEligible: string[] = []
  let recommended = ''
  let requiresSpecialDocumentation = false

  const employmentType = wizardData.employmentType || 'w2'
  const isFirstTime = wizardData.buyerType?.includes('first-time') || false
  const isInvestor = wizardData.buyerType?.includes('investor') || false
  const isMilitary = wizardData.buyerType?.includes('veteran') || false
  const creditTier = getCreditTier(wizardData.creditScore || '680-739')
  const downPayment = wizardData.downPaymentPercent || 3

  // ITIN Borrowers - ONLY portfolio loans
  if (employmentType === 'itin') {
    eligible.push('ITIN Portfolio Loans (Non-QM)')
    notEligible.push('FHA', 'VA', 'Conventional')
    recommended = 'ITIN Portfolio Loans (Non-QM)'
    requiresSpecialDocumentation = true
  } else {
    // Non-ITIN borrowers
    if (isMilitary) {
      eligible.push('VA')
      recommended = 'VA'
    }

    if (isFirstTime && !isInvestor) {
      eligible.push('FHA')
      if (!recommended) recommended = 'FHA'
    } else if (isInvestor) {
      notEligible.push('FHA (not allowed for investment properties)')
    }

    eligible.push('Conventional')
    if (!isMilitary && !recommended) recommended = 'Conventional'

    if (!isMilitary) notEligible.push('VA')

    // Self-employed may need bank statement loans
    if (employmentType === 'self-employed' || employmentType === '1099') {
      eligible.push('Bank Statement Loans')
      requiresSpecialDocumentation = true
    }
  }

  return {
    eligible,
    notEligible,
    recommended,
    requiresSpecialDocumentation
  }
}

/**
 * Classifies lead based on wizard data
 *
 * @param wizardData - Complete wizard form data
 * @param locale - User's language preference
 * @returns Complete lead profile with classification
 */
export function classifyLead(wizardData: WizardData, locale: Locale): LeadProfile {
  // Extract key attributes
  const employmentType = wizardData.employmentType || 'w2'
  const buyerType = wizardData.buyerType || []
  const isFirstTime = buyerType.includes('first-time')
  const isInvestor = buyerType.includes('investor')
  const isUpsizing = buyerType.includes('upsizing')
  const isMilitary = buyerType.includes('veteran')

  const annualIncome = wizardData.annualIncome || 50000
  const monthlyDebts = wizardData.monthlyDebts || 0
  const creditScore = wizardData.creditScore || '680-739'
  const downPaymentPercent = wizardData.downPaymentPercent || 3
  const targetPrice = wizardData.targetPrice || 300000

  // Calculate derived attributes
  const creditTier = getCreditTier(creditScore)
  const incomeLevel = getIncomeLevel(annualIncome)
  const debtToIncome = calculateDTI(annualIncome, monthlyDebts)
  const employmentStability = getEmploymentStability(employmentType, annualIncome, creditTier)
  const loanEligibility = determineLoanEligibility(wizardData)

  // Determine lead type using priority-based classification
  let leadType: LeadType = LeadType.STANDARD_BUYER
  let primaryCategory: LeadProfile['primaryCategory'] = 'W2'

  // Priority 1: ITIN Borrowers (most specific requirements)
  if (employmentType === 'itin') {
    primaryCategory = 'ITIN'
    if (isInvestor) leadType = LeadType.ITIN_INVESTOR
    else if (isFirstTime) leadType = LeadType.ITIN_FIRST_TIME
    else leadType = LeadType.ITIN_UPSIZING
  }
  // Priority 2: Military/Veterans (special benefits)
  else if (isMilitary) {
    primaryCategory = 'MILITARY'
    leadType = isFirstTime ? LeadType.MILITARY_VETERAN_FIRST_TIME : LeadType.MILITARY_VETERAN_UPSIZING
  }
  // Priority 3: High Net Worth (special treatment)
  else if (annualIncome >= 150000 && downPaymentPercent >= 20) {
    primaryCategory = 'HIGH_NET_WORTH'
    leadType = LeadType.HIGH_NET_WORTH
  }
  // Priority 4: Retired
  else if (employmentType === 'retired') {
    primaryCategory = 'RETIRED'
    leadType = LeadType.RETIRED_BUYER
  }
  // Priority 5: Self-Employed/1099
  else if (employmentType === 'self-employed' || employmentType === '1099') {
    primaryCategory = 'SELF_EMPLOYED'
    if (isInvestor) leadType = LeadType.SELF_EMPLOYED_INVESTOR
    else if (isFirstTime) leadType = LeadType.SELF_EMPLOYED_FIRST_TIME
    else leadType = LeadType.SELF_EMPLOYED_UPSIZING
  }
  // Priority 6: Mixed Income
  else if (employmentType === 'mixed') {
    primaryCategory = 'MIXED'
    leadType = LeadType.MIXED_INCOME_BUYER
  }
  // Priority 7: W2 Employees (most common)
  else if (employmentType === 'w2') {
    primaryCategory = 'W2'
    if (isInvestor) {
      leadType = LeadType.W2_INVESTOR
    } else if (isFirstTime) {
      leadType = creditTier === 'FAIR' || creditTier === 'POOR'
        ? LeadType.W2_FIRST_TIME_LOW_CREDIT
        : LeadType.W2_FIRST_TIME_GOOD_CREDIT
    } else {
      leadType = LeadType.W2_UPSIZING
    }
  }

  // Identify special considerations
  const specialConsiderations: string[] = []
  const riskFactors: string[] = []
  const strengths: string[] = []

  if (employmentType === 'itin') {
    specialConsiderations.push('ITIN documentation required')
    specialConsiderations.push('Higher down payment needed (10-20%)')
    specialConsiderations.push('Limited to portfolio lenders')
  }

  if (employmentType === 'self-employed' || employmentType === '1099') {
    specialConsiderations.push('2-year tax return requirement')
    specialConsiderations.push('Higher reserve requirements')
  }

  if (debtToIncome > 43) {
    riskFactors.push('High DTI ratio')
  }

  if (creditTier === 'POOR' || creditTier === 'FAIR') {
    riskFactors.push('Credit score needs improvement')
  }

  if (creditTier === 'EXCELLENT') {
    strengths.push('Excellent credit score')
  }

  if (debtToIncome < 36) {
    strengths.push('Strong DTI ratio')
  }

  if (downPaymentPercent >= 20) {
    strengths.push('Strong down payment')
  }

  return {
    leadType,
    primaryCategory,
    isFirstTime,
    isInvestor,
    isUpsizing,
    isMilitary,
    employmentType,
    employmentStability,
    creditTier,
    creditScore,
    debtToIncome,
    downPaymentPercent,
    incomeLevel,
    targetCity: wizardData.city || 'Unknown',
    targetPrice,
    timeline: wizardData.timeline || '6-12',
    loanEligibility,
    locale,
    specialConsiderations,
    riskFactors,
    strengths
  }
}

/**
 * Gets human-readable description of lead type
 */
export function getLeadTypeDescription(leadType: LeadType, locale: Locale = 'en'): string {
  const descriptions: Record<LeadType, { en: string; es: string }> = {
    [LeadType.ITIN_FIRST_TIME]: {
      en: 'ITIN First-Time Homebuyer',
      es: 'Comprador ITIN Primera Vez'
    },
    [LeadType.ITIN_INVESTOR]: {
      en: 'ITIN Investor',
      es: 'Inversionista ITIN'
    },
    [LeadType.ITIN_UPSIZING]: {
      en: 'ITIN Upsizing Buyer',
      es: 'Comprador ITIN Ampliando'
    },
    [LeadType.SELF_EMPLOYED_FIRST_TIME]: {
      en: 'Self-Employed First-Time Buyer',
      es: 'Comprador Auto-Empleado Primera Vez'
    },
    [LeadType.SELF_EMPLOYED_INVESTOR]: {
      en: 'Self-Employed Investor',
      es: 'Inversionista Auto-Empleado'
    },
    [LeadType.SELF_EMPLOYED_UPSIZING]: {
      en: 'Self-Employed Upsizing Buyer',
      es: 'Comprador Auto-Empleado Ampliando'
    },
    [LeadType.W2_FIRST_TIME_LOW_CREDIT]: {
      en: 'W2 First-Time Buyer (Building Credit)',
      es: 'Comprador W2 Primera Vez (Construyendo Crédito)'
    },
    [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: {
      en: 'W2 First-Time Buyer (Strong Credit)',
      es: 'Comprador W2 Primera Vez (Crédito Fuerte)'
    },
    [LeadType.W2_INVESTOR]: {
      en: 'W2 Employee Investor',
      es: 'Inversionista Empleado W2'
    },
    [LeadType.W2_UPSIZING]: {
      en: 'W2 Employee Upsizing',
      es: 'Empleado W2 Ampliando'
    },
    [LeadType.MILITARY_VETERAN_FIRST_TIME]: {
      en: 'Military/Veteran First-Time Buyer',
      es: 'Comprador Militar/Veterano Primera Vez'
    },
    [LeadType.MILITARY_VETERAN_UPSIZING]: {
      en: 'Military/Veteran Upsizing',
      es: 'Militar/Veterano Ampliando'
    },
    [LeadType.RETIRED_BUYER]: {
      en: 'Retired Buyer',
      es: 'Comprador Retirado'
    },
    [LeadType.HIGH_NET_WORTH]: {
      en: 'High Net Worth Buyer',
      es: 'Comprador Alto Patrimonio'
    },
    [LeadType.MIXED_INCOME_BUYER]: {
      en: 'Mixed Income Buyer',
      es: 'Comprador Ingreso Mixto'
    },
    [LeadType.STANDARD_BUYER]: {
      en: 'Standard Homebuyer',
      es: 'Comprador de Vivienda Estándar'
    }
  }

  return descriptions[leadType][locale]
}
