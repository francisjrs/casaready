/**
 * AI Service - Handles report generation and AI interactions
 *
 * This service encapsulates all AI-related business logic and provides
 * a clean interface for generating personalized home buying reports.
 */

import { createGeminiClient } from '@/ai/gemini-client'
import type { Locale } from '@/lib/i18n'
import type { CensusAreaInsights } from './census-service'
import type { PrivacySafePlanGenerationInput } from '@/validators/planning-schemas'

// TypeScript interfaces for report data structures
export interface WizardData {
  city?: string
  zipCode?: string
  locationPriority?: string[]
  timeline?: string
  budgetType?: 'price' | 'monthly'
  targetPrice?: number
  monthlyBudget?: number
  annualIncome?: number
  monthlyDebts?: number
  creditScore?: string
  downPaymentAmount?: number
  downPaymentPercent?: number
  employmentType?: string
  buyerType?: string[]
  householdSize?: number
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  maritalStatus?: string
}

export interface ReportData {
  estimatedPrice: number
  maxAffordable: number
  monthlyPayment: number
  programFit: string[]
  actionPlan: string[]
  tips: string[]
  notes: string
  primaryLeadType: string
  aiGenerated: boolean
  reportContent?: string
}

/**
 * Creates a privacy-safe plan input that excludes contact information
 */
function createPrivacySafePlanInput(wizardData: WizardData, locale: Locale): PrivacySafePlanGenerationInput {
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
}

/**
 * Builds a comprehensive note from wizard data for AI processing (privacy-safe version)
 */
function buildPrivacySafeNote(wizardData: WizardData, locale: Locale, censusData?: CensusAreaInsights): string {
  const parts: string[] = []

  // Location preferences
  if (wizardData.city || wizardData.zipCode) {
    parts.push(`Location: ${wizardData.city || ''} ${wizardData.zipCode || ''}`.trim())
  }

  if (wizardData.locationPriority?.length) {
    parts.push(`Location priorities: ${wizardData.locationPriority.join(', ')}`)
  }

  // Timeline
  if (wizardData.timeline) {
    const timelineMap: Record<string, string> = {
      '0-3': '0-3 months',
      '3-6': '3-6 months',
      '6-12': '6-12 months',
      '12+': '12+ months'
    }
    parts.push(`Timeline: ${timelineMap[wizardData.timeline] || wizardData.timeline}`)
  }

  // Budget information
  if (wizardData.budgetType === 'price' && wizardData.targetPrice) {
    parts.push(`Target price: $${wizardData.targetPrice.toLocaleString()}`)
  } else if (wizardData.budgetType === 'monthly' && wizardData.monthlyBudget) {
    parts.push(`Monthly budget: $${wizardData.monthlyBudget.toLocaleString()}`)
  }

  // Financial information
  if (wizardData.annualIncome) {
    parts.push(`Annual income: $${wizardData.annualIncome.toLocaleString()}`)
  }

  if (wizardData.monthlyDebts) {
    parts.push(`Monthly debts: $${wizardData.monthlyDebts.toLocaleString()}`)
  }

  if (wizardData.creditScore) {
    parts.push(`Credit score range: ${wizardData.creditScore}`)
  }

  // Down payment
  if (wizardData.downPaymentAmount) {
    parts.push(`Down payment: $${wizardData.downPaymentAmount.toLocaleString()}`)
  } else if (wizardData.downPaymentPercent) {
    parts.push(`Down payment: ${wizardData.downPaymentPercent}%`)
  }

  // Employment
  if (wizardData.employmentType) {
    parts.push(`Employment: ${wizardData.employmentType}`)
  }

  // Buyer profile
  if (wizardData.buyerType?.length) {
    parts.push(`Buyer type: ${wizardData.buyerType.join(', ')}`)
  }

  if (wizardData.householdSize) {
    parts.push(`Household size: ${wizardData.householdSize}`)
  }

  // Census data insights
  if (censusData && censusData.demographics) {
    parts.push(`Area demographics: Population ${censusData.demographics.population.toLocaleString()}, Median income $${censusData.demographics.medianHouseholdIncome.toLocaleString()}, Median home value $${censusData.demographics.medianHomeValue.toLocaleString()}, Unemployment ${censusData.demographics.unemploymentRate}%`)

    if (censusData.economicIndicators) {
      parts.push(`Market trend: ${censusData.economicIndicators.marketTrend}, Cost of living index: ${censusData.economicIndicators.costOfLiving}`)
    }

    if (censusData.recommendations && censusData.recommendations.length > 0) {
      parts.push(`Area insights: ${censusData.recommendations.slice(0, 2).join(', ')}`)
    }
  }

  return parts.join('; ')
}

/**
 * Builds a comprehensive note from wizard data for AI processing (legacy version with contact info)
 */
function buildComprehensiveNote(wizardData: WizardData, contactInfo: ContactInfo, _locale: Locale, censusData?: CensusAreaInsights): string {
  const parts: string[] = []

  // Location preferences
  if (wizardData.city || wizardData.zipCode) {
    parts.push(`Location: ${wizardData.city || ''} ${wizardData.zipCode || ''}`.trim())
  }

  if (wizardData.locationPriority?.length) {
    parts.push(`Location priorities: ${wizardData.locationPriority.join(', ')}`)
  }

  // Timeline
  if (wizardData.timeline) {
    const timelineMap: Record<string, string> = {
      '0-3': '0-3 months',
      '3-6': '3-6 months',
      '6-12': '6-12 months',
      '12+': '12+ months'
    }
    parts.push(`Timeline: ${timelineMap[wizardData.timeline] || wizardData.timeline}`)
  }

  // Budget information
  if (wizardData.budgetType === 'price' && wizardData.targetPrice) {
    parts.push(`Target price: $${wizardData.targetPrice.toLocaleString()}`)
  } else if (wizardData.budgetType === 'monthly' && wizardData.monthlyBudget) {
    parts.push(`Monthly budget: $${wizardData.monthlyBudget.toLocaleString()}`)
  }

  // Financial information
  if (wizardData.annualIncome) {
    parts.push(`Annual income: $${wizardData.annualIncome.toLocaleString()}`)
  }

  if (wizardData.monthlyDebts) {
    parts.push(`Monthly debts: $${wizardData.monthlyDebts.toLocaleString()}`)
  }

  if (wizardData.creditScore) {
    parts.push(`Credit score range: ${wizardData.creditScore}`)
  }

  // Down payment
  if (wizardData.downPaymentAmount) {
    parts.push(`Down payment: $${wizardData.downPaymentAmount.toLocaleString()}`)
  } else if (wizardData.downPaymentPercent) {
    parts.push(`Down payment: ${wizardData.downPaymentPercent}%`)
  }

  // Employment
  if (wizardData.employmentType) {
    parts.push(`Employment: ${wizardData.employmentType}`)
  }

  // Buyer profile
  if (wizardData.buyerType?.length) {
    parts.push(`Buyer type: ${wizardData.buyerType.join(', ')}`)
  }

  if (wizardData.householdSize) {
    parts.push(`Household size: ${wizardData.householdSize}`)
  }

  // Contact information
  parts.push(`Contact: ${contactInfo.firstName} ${contactInfo.lastName}`)

  // Census data insights
  if (censusData && censusData.demographics) {
    parts.push(`Area demographics: Population ${censusData.demographics.population.toLocaleString()}, Median income $${censusData.demographics.medianHouseholdIncome.toLocaleString()}, Median home value $${censusData.demographics.medianHomeValue.toLocaleString()}, Unemployment ${censusData.demographics.unemploymentRate}%`)

    if (censusData.economicIndicators) {
      parts.push(`Market trend: ${censusData.economicIndicators.marketTrend}, Cost of living index: ${censusData.economicIndicators.costOfLiving}`)
    }

    if (censusData.recommendations && censusData.recommendations.length > 0) {
      parts.push(`Area insights: ${censusData.recommendations.slice(0, 2).join(', ')}`)
    }
  }

  return parts.join('; ')
}

/**
 * Determines program fit based on wizard data
 */
function determineProgramFit(wizardData: WizardData): string[] {
  const programs: string[] = []

  // First-time buyer programs
  if (wizardData.buyerType?.includes('first-time')) {
    programs.push('FHA Loan', 'First-Time Buyer Programs', 'Down Payment Assistance')
  }

  // Veteran programs
  if (wizardData.buyerType?.includes('veteran')) {
    programs.push('VA Loan', 'Military Housing Assistance')
  }

  // Low down payment options
  if (wizardData.downPaymentPercent && wizardData.downPaymentPercent < 10) {
    programs.push('Low Down Payment Options', 'PMI Programs')
  }

  // High income conventional
  if (wizardData.annualIncome && wizardData.annualIncome > 100000) {
    programs.push('Conventional Loan', 'Jumbo Loan Options')
  }

  // Self-employed programs
  if (wizardData.employmentType === 'self-employed' || wizardData.employmentType === '1099') {
    programs.push('Bank Statement Loans', 'Non-QM Programs')
  }

  // Default programs if none match
  if (programs.length === 0) {
    programs.push('Conventional Loan', 'FHA Loan', 'Down Payment Assistance')
  }

  return programs
}

/**
 * Generates tips based on wizard data
 */
function generateTips(wizardData: WizardData, locale: Locale): string[] {
  const tips: string[] = []

  if (locale === 'es') {
    tips.push('Obtenga una pre-aprobación antes de buscar casas')
    tips.push('Compare tasas de diferentes prestamistas')
    tips.push('Considere todos los costos de cierre')
    tips.push('Inspeccione la propiedad antes de comprar')
    tips.push('Tenga fondos de emergencia separados')
  } else {
    tips.push('Get pre-approved before house hunting')
    tips.push('Compare rates from multiple lenders')
    tips.push('Factor in all closing costs')
    tips.push('Get a professional home inspection')
    tips.push('Keep emergency funds separate')

    // Specific tips based on data
    if (wizardData.creditScore === '300-579') {
      tips.push('Work on improving your credit score before applying')
    }

    if (wizardData.downPaymentPercent && wizardData.downPaymentPercent < 5) {
      tips.push('Consider saving for a larger down payment to avoid PMI')
    }

    if (wizardData.employmentType === 'self-employed') {
      tips.push('Prepare 2 years of tax returns and bank statements')
    }
  }

  return tips
}

/**
 * Generates action plan based on wizard data
 */
function generateActionPlan(wizardData: WizardData, locale: Locale): string[] {
  const actions: string[] = []

  if (locale === 'es') {
    actions.push('1. Revisar y mejorar puntaje crediticio')
    actions.push('2. Ahorrar para el pago inicial')
    actions.push('3. Obtener pre-aprobación del prestamista')
    actions.push('4. Encontrar un agente inmobiliario')
    actions.push('5. Comenzar la búsqueda de propiedades')
  } else {
    actions.push('1. Review and improve credit score')
    actions.push('2. Save for down payment and closing costs')
    actions.push('3. Get pre-approved with a lender')
    actions.push('4. Find a qualified real estate agent')
    actions.push('5. Start house hunting in your price range')

    // Timeline-specific actions
    if (wizardData.timeline === '0-3') {
      actions.unshift('0. Act quickly - get pre-approved this week')
    } else if (wizardData.timeline === '12+') {
      actions.splice(1, 0, '1.5. Take time to improve financial profile')
    }
  }

  return actions
}

/**
 * Determines primary lead type for CRM categorization
 */
function determinePrimaryLeadType(wizardData: WizardData): string {
  if (wizardData.buyerType?.includes('first-time')) {
    return 'First-Time Buyer'
  }

  if (wizardData.buyerType?.includes('veteran')) {
    return 'Veteran Buyer'
  }

  if (wizardData.employmentType === 'self-employed' || wizardData.employmentType === '1099') {
    return 'Self-Employed Buyer'
  }

  if (wizardData.annualIncome && wizardData.annualIncome > 150000) {
    return 'High-Income Buyer'
  }

  if (wizardData.buyerType?.includes('investor')) {
    return 'Investor'
  }

  return 'General Buyer'
}

/**
 * Generates comprehensive analysis content for fallback report
 */
function generateFallbackAnalysis(
  wizardData: WizardData,
  contactInfo: ContactInfo,
  locale: Locale,
  calculations: { estimatedPrice: number; maxAffordable: number; monthlyPayment: number; primaryLeadType: string },
  censusData?: CensusAreaInsights
): string {
  const isEnglish = locale === 'en'
  const { estimatedPrice, maxAffordable, monthlyPayment, primaryLeadType } = calculations

  // Generate markdown format for better UI display
  const analysis = []

  // Header
  analysis.push(isEnglish
    ? `## 🏠 Personalized Home Buying Analysis for ${contactInfo.firstName} ${contactInfo.lastName}`
    : `## 🏠 Análisis Personalizado de Compra de Casa para ${contactInfo.firstName} ${contactInfo.lastName}`)

  // Financial Overview
  analysis.push(isEnglish ? '\n### 💰 Financial Overview' : '\n### 💰 Resumen Financiero')
  analysis.push(isEnglish
    ? `- **Your estimated home price range**: $${estimatedPrice.toLocaleString()}`
    : `- **Tu rango de precio estimado**: $${estimatedPrice.toLocaleString()}`)
  analysis.push(isEnglish
    ? `- **Maximum affordable**: $${maxAffordable.toLocaleString()}`
    : `- **Máximo asequible**: $${maxAffordable.toLocaleString()}`)
  analysis.push(isEnglish
    ? `- **Estimated monthly payment**: $${monthlyPayment.toLocaleString()}`
    : `- **Pago mensual estimado**: $${monthlyPayment.toLocaleString()}`)

  // Buyer Profile Analysis
  analysis.push(isEnglish ? '\n### 👤 Buyer Profile Analysis' : '\n### 👤 Análisis de Perfil de Comprador')
  analysis.push(isEnglish
    ? `- **Primary buyer type**: ${primaryLeadType}`
    : `- **Tipo principal de comprador**: ${primaryLeadType}`)

  if (wizardData.buyerType?.includes('first-time')) {
    analysis.push(isEnglish
      ? '- **First-time buyer advantages**: Access to special programs, lower down payment options, and potential tax benefits'
      : '- **Ventajas del comprador primerizo**: Acceso a programas especiales, opciones de enganche más bajo y beneficios fiscales potenciales')
  }

  if (wizardData.creditScore) {
    analysis.push(isEnglish
      ? `- **Credit profile**: ${wizardData.creditScore} - This affects your interest rate and loan options`
      : `- **Perfil crediticio**: ${wizardData.creditScore} - Esto afecta tu tasa de interés y opciones de préstamo`)
  }

  // Location Insights
  if (wizardData.city || censusData) {
    analysis.push(isEnglish ? '\n### 🏘️ Location Insights' : '\n### 🏘️ Perspectivas de Ubicación')
    if (wizardData.city) {
      analysis.push(isEnglish
        ? `- **Target area**: ${wizardData.city}`
        : `- **Área objetivo**: ${wizardData.city}`)
    }
    if (censusData?.demographics?.medianHomeValue) {
      analysis.push(isEnglish
        ? `- **Area median home value**: $${censusData.demographics.medianHomeValue.toLocaleString()}`
        : `- **Valor mediano de vivienda del área**: $${censusData.demographics.medianHomeValue.toLocaleString()}`)
    }
  }

  // Timeline Analysis
  if (wizardData.timeline) {
    analysis.push(isEnglish ? '\n### ⏰ Timeline Strategy' : '\n### ⏰ Estrategia de Cronograma')
    analysis.push(isEnglish
      ? `- **Target timeline**: ${wizardData.timeline}`
      : `- **Cronograma objetivo**: ${wizardData.timeline}`)

    if (wizardData.timeline === 'immediately' || wizardData.timeline === '3-6 months') {
      analysis.push(isEnglish
        ? '- **Recommendation**: Get pre-approved immediately and start house hunting actively'
        : '- **Recomendación**: Obtén preaprobación inmediatamente y comienza la búsqueda activa de casa')
    }
  }

  // Key Recommendations
  analysis.push(isEnglish ? '\n### 🎯 Key Recommendations' : '\n### 🎯 Recomendaciones Clave')

  if (wizardData.downPaymentPercent && wizardData.downPaymentPercent < 20) {
    analysis.push(isEnglish
      ? `- **Down payment strategy**: ${wizardData.downPaymentPercent}% down - Consider PMI costs and removal strategies`
      : `- **Estrategia de enganche**: ${wizardData.downPaymentPercent}% de enganche - Considera costos de PMI y estrategias de eliminación`)
  }

  if (wizardData.employmentType === 'w2_employee') {
    analysis.push(isEnglish
      ? '- **Employment advantage**: W-2 employment typically qualifies for better rates and easier approval'
      : '- **Ventaja de empleo**: El empleo W-2 típicamente califica para mejores tasas y aprobación más fácil')
  }

  analysis.push(isEnglish
    ? '- **Next step priority**: Secure pre-approval to strengthen your offers in competitive markets'
    : '- **Prioridad del siguiente paso**: Asegura la preaprobación para fortalecer tus ofertas en mercados competitivos')

  // Market Context
  analysis.push(isEnglish ? '\n### 📊 Market Context' : '\n### 📊 Contexto del Mercado')
  analysis.push(isEnglish
    ? '- Current market conditions suggest getting pre-approved before house hunting to act quickly on good opportunities'
    : '- Las condiciones actuales del mercado sugieren obtener preaprobación antes de buscar casa para actuar rápidamente en buenas oportunidades')

  return analysis.join('\n')
}

/**
 * Generates fallback UI report when AI is unavailable
 */
function generateUIReport(wizardData: WizardData, contactInfo: ContactInfo, locale: Locale, censusData?: CensusAreaInsights): ReportData {
  // Calculate estimated affordability
  const annualIncome = wizardData.annualIncome || 50000
  const monthlyIncome = annualIncome / 12
  const monthlyDebts = wizardData.monthlyDebts || 0

  // Use 28% rule for housing payment
  const maxHousingPayment = monthlyIncome * 0.28
  const maxTotalDebtPayment = monthlyIncome * 0.36
  const availableForHousing = Math.min(maxHousingPayment, maxTotalDebtPayment - monthlyDebts)

  // Estimate home price (assuming 6.5% interest rate, 30-year loan)
  const monthlyPayment = Math.max(availableForHousing * 0.8, 1000) // 80% for P&I, rest for taxes/insurance
  const estimatedPrice = monthlyPayment * 166 // Rough calculation for 6.5% 30-year

  // Use target price if provided and reasonable, or use census data for context
  let targetPrice = wizardData.targetPrice || estimatedPrice

  // Adjust estimates based on census data if available
  if (censusData && censusData.demographics) {
    const areaMedianHome = censusData.demographics.medianHomeValue
    const areaMedianIncome = censusData.demographics.medianHouseholdIncome

    // If user's income is significantly different from area median, adjust expectations
    if (areaMedianHome > 0 && areaMedianIncome > 0) {
      const incomeRatio = annualIncome / areaMedianIncome
      const adjustedAreaValue = areaMedianHome * Math.min(incomeRatio, 1.5) // Cap adjustment at 150%

      // If no target price provided, use area-adjusted value
      if (!wizardData.targetPrice) {
        targetPrice = Math.min(adjustedAreaValue, estimatedPrice * 1.2)
      }
    }
  }

  const finalEstimatedPrice = Math.min(targetPrice, estimatedPrice * 1.2) // Don't exceed 120% of calculated affordability

  // Generate a comprehensive analysis content for fallback
  const reportContent = generateFallbackAnalysis(wizardData, contactInfo, locale, {
    estimatedPrice: Math.round(finalEstimatedPrice),
    maxAffordable: Math.round(estimatedPrice),
    monthlyPayment: Math.round(monthlyPayment),
    primaryLeadType: determinePrimaryLeadType(wizardData)
  }, censusData)

  return {
    estimatedPrice: Math.round(finalEstimatedPrice),
    maxAffordable: Math.round(estimatedPrice),
    monthlyPayment: Math.round(monthlyPayment),
    programFit: determineProgramFit(wizardData),
    actionPlan: generateActionPlan(wizardData, locale),
    tips: generateTips(wizardData, locale),
    notes: buildPrivacySafeNote(wizardData, locale, censusData),
    primaryLeadType: determinePrimaryLeadType(wizardData),
    reportContent,
    aiGenerated: false
  }
}

/**
 * Main function to generate home buying report
 * Integrates with AI service and provides fallback options
 */
export async function generateHomebuyingReport(
  wizardData: WizardData,
  contactInfo: ContactInfo,
  locale: Locale = 'en',
  censusData?: CensusAreaInsights
): Promise<ReportData> {
  try {
    // Generate UI report as fallback
    const fallbackReport = generateUIReport(wizardData, contactInfo, locale, censusData)

    // Try AI generation
    let aiResult: { success: boolean; data?: any } = { success: false }

    try {
      const geminiClient = createGeminiClient()

      // Create privacy-safe plan input (excludes contact information)
      const privacySafePlanInput = createPrivacySafePlanInput(wizardData, locale)

      const personalizedPlan = await geminiClient.generatePersonalizedPlan(privacySafePlanInput)

      // Generate markdown analysis separately using privacy-safe input
      const markdownAnalysis = await geminiClient.generateMarkdownAnalysis(privacySafePlanInput)

      aiResult = {
        success: true,
        data: {
          plan: markdownAnalysis || JSON.stringify(personalizedPlan, null, 2),
          estimatedPrice: personalizedPlan.affordabilityEstimate?.recommendedPrice,
          monthlyPayment: personalizedPlan.affordabilityEstimate?.budgetBreakdown?.monthlyPayment,
          programFit: personalizedPlan.programRecommendations?.map(p => p.name) || [],
          actionPlan: personalizedPlan.actionPlan?.phases?.flatMap(phase =>
            phase.steps.map(step => step.title)
          ) || [],
          tips: personalizedPlan.actionPlan?.phases?.flatMap(phase =>
            phase.steps.map(step => step.description)
          ).slice(0, 5) || []
        }
      }
    } catch (aiError) {
      console.warn('AI generation failed:', aiError)
      aiResult = { success: false }
    }

    if (aiResult.success && aiResult.data) {
      // Merge AI results with calculated data
      return {
        ...fallbackReport,
        reportContent: aiResult.data.plan || aiResult.data.response,
        aiGenerated: true,
        // Override with AI recommendations if available
        ...(aiResult.data.estimatedPrice && { estimatedPrice: aiResult.data.estimatedPrice }),
        ...(aiResult.data.monthlyPayment && { monthlyPayment: aiResult.data.monthlyPayment }),
        ...(aiResult.data.programFit && { programFit: aiResult.data.programFit }),
        ...(aiResult.data.actionPlan && { actionPlan: aiResult.data.actionPlan }),
        ...(aiResult.data.tips && { tips: aiResult.data.tips })
      }
    }

    // Fall back to UI-generated report
    console.log('AI generation failed, using fallback report')
    return fallbackReport

  } catch (error) {
    console.error('Error generating home buying report:', error)

    // Return fallback report on error
    return generateUIReport(wizardData, contactInfo, locale, censusData)
  }
}

/**
 * Export all helper functions for testing and reuse
 */
export {
  createPrivacySafePlanInput,
  buildPrivacySafeNote,
  buildComprehensiveNote,
  determineProgramFit,
  generateTips,
  generateActionPlan,
  determinePrimaryLeadType,
  generateUIReport
}