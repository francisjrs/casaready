/**
 * Prompt Builder Service
 *
 * Generates customized AI prompts based on lead classification.
 * Uses template system for consistent, scalable prompt generation.
 *
 * @module prompt-builder
 */

import { LeadType, type LeadProfile } from './lead-classifier'
import type { WizardData } from './ai-service'
import type { Locale } from '@/lib/i18n'

/**
 * Prompt sections for AI report generation
 */
export interface SectionPrompts {
  financial: string
  loanOptions: string
  location: string
}

/**
 * Context variables for prompt templates
 */
interface PromptContext {
  // Lead Profile
  leadProfile: LeadProfile
  wizardData: WizardData

  // Financial Data
  monthlyIncome: number
  monthlyDebts: number
  currentDTI: number
  targetPrice: number
  downPayment: number
  creditScore: string

  // Location
  city: string
  locationPriorities: string
  householdSize: number

  // Loan Eligibility
  eligibleLoans: string
  notEligibleLoans: string
  recommendedLoan: string

  // Employment
  employmentType: string
  employmentContext: string

  // Locale
  locale: Locale
}

/**
 * Builds prompt context from lead profile and wizard data
 */
function buildPromptContext(leadProfile: LeadProfile, wizardData: WizardData): PromptContext {
  const annualIncome = wizardData.annualIncome || 50000
  const monthlyIncome = Math.round(annualIncome / 12)
  const monthlyDebts = wizardData.monthlyDebts || 0
  const targetPrice = wizardData.targetPrice || 300000
  const currentDTI = leadProfile.debtToIncome

  // Build employment context description
  const employmentContextMap: Record<string, string> = {
    'itin': 'ITIN taxpayer (Individual Taxpayer Identification Number holder)',
    '1099': 'Self-employed/1099 contractor',
    'self-employed': 'Self-employed business owner',
    'mixed': 'Mixed income (W2 + self-employed)',
    'retired': 'Retired (SSI, pension, 401k distributions)',
    'w2': 'W2 employee (standard documentation)'
  }

  return {
    leadProfile,
    wizardData,
    monthlyIncome,
    monthlyDebts,
    currentDTI,
    targetPrice,
    downPayment: leadProfile.downPaymentPercent,
    creditScore: leadProfile.creditScore,
    city: wizardData.city || 'the area',
    locationPriorities: (wizardData.locationPriority || []).join(', ') || 'Overall balance',
    householdSize: wizardData.householdSize || 1,
    eligibleLoans: leadProfile.loanEligibility.eligible.join(', '),
    notEligibleLoans: leadProfile.loanEligibility.notEligible.join(', '),
    recommendedLoan: leadProfile.loanEligibility.recommended,
    employmentType: leadProfile.employmentType,
    employmentContext: employmentContextMap[leadProfile.employmentType] || 'Standard employment',
    locale: leadProfile.locale
  }
}

/**
 * Financial Analysis Prompt Templates by Lead Type
 */
const financialPromptTemplates: Record<LeadType, (ctx: PromptContext) => string> = {
  // ITIN Borrowers
  [LeadType.ITIN_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
Análisis financiero PERSONALIZADO para comprador ITIN primera vez.

PERFIL CRÍTICO - COMPRADOR ITIN:
- Ingreso mensual: $${ctx.monthlyIncome}
- Deudas mensuales: $${ctx.monthlyDebts}
- DTI actual: ${ctx.currentDTI}%
- Crédito: ${ctx.creditScore}
- Enganche disponible: ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100)})
- STATUS: Primera compra de vivienda con ITIN

IMPORTANTE: Este comprador NO califica para FHA (3.5% enganche). SOLO préstamos portfolio ITIN (10-20% enganche).

FORMATO REQUERIDO:
1. **Realidad ITIN** (2-3 oraciones): Explicar honestamente que préstamos ITIN requieren 10-20% enganche, NO 3.5%. Celebrar que tienen ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100)}).
2. **Tu Poder de Compra ITIN**: Con ${ctx.downPayment}% enganche, pueden comprar hasta $${ctx.targetPrice}. Explicar por qué este monto (basado en ingreso + enganche).
3. **Tabla ITIN Específica**: Comparar precios ${Math.round(ctx.targetPrice * 0.9)}, ${ctx.targetPrice}, ${Math.round(ctx.targetPrice * 1.1)} con:
   - Pago mensual (con tasa ITIN 7.5-8.5%)
   - Efectivo total necesario
   - DTI resultante
4. **Ventaja Como ITIN**: Qué hace atractiva su aplicación (enganche fuerte, historial tributario, crédito)
5. **Camino a la Compra**: Pasos específicos próximas 4 semanas

TONO: Realista pero empoderador. NO comparar con FHA. Enfocarse en SU camino único.
LONGITUD: 450-550 palabras` : `
PERSONALIZED financial analysis for ITIN first-time homebuyer.

CRITICAL PROFILE - ITIN BUYER:
- Monthly income: $${ctx.monthlyIncome}
- Monthly debts: $${ctx.monthlyDebts}
- Current DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down payment available: ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100)})
- STATUS: First-time home purchase with ITIN

IMPORTANT: This buyer does NOT qualify for FHA (3.5% down). ONLY ITIN portfolio loans (10-20% down).

REQUIRED FORMAT:
1. **ITIN Reality** (2-3 sentences): Honestly explain ITIN loans require 10-20% down, NOT 3.5%. Celebrate they have ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100)}).
2. **Your ITIN Buying Power**: With ${ctx.downPayment}% down, you can buy up to $${ctx.targetPrice}. Explain WHY this amount (based on income + down payment).
3. **ITIN-Specific Table**: Compare prices ${Math.round(ctx.targetPrice * 0.9)}, ${ctx.targetPrice}, ${Math.round(ctx.targetPrice * 1.1)} with:
   - Monthly payment (with ITIN rate 7.5-8.5%)
   - Total cash needed
   - Resulting DTI
4. **Your ITIN Advantage**: What makes their application attractive (strong down payment, tax history, credit)
5. **Path to Purchase**: Specific steps next 4 weeks

TONE: Realistic but empowering. DO NOT compare to FHA. Focus on THEIR unique path.
LENGTH: 450-550 words`,

  // Self-Employed
  [LeadType.SELF_EMPLOYED_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
[Spanish template for self-employed first-time buyer]
`  : `
PERSONALIZED financial analysis for self-employed/1099 first-time homebuyer.

PROFILE:
- Monthly income: $${ctx.monthlyIncome} (based on 2-year tax average)
- Monthly debts: $${ctx.monthlyDebts}
- Current DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down payment: ${ctx.downPayment}%
- Employment: Self-employed/1099

SELF-EMPLOYED ADVANTAGE: Your ${ctx.downPayment}% down payment shows financial discipline lenders value.

FORMAT:
1. **Celebration** (2-3 sentences): Celebrate DTI ${ctx.currentDTI}% + credit ${ctx.creditScore} for self-employed buyer
2. **Your Buying Power**: Explain how lenders calculate income for self-employed (2-year tax average)
3. **Price Comparison Table**: Show 3 price points with monthly PITI, cash needed, new DTI
4. **Self-Employed Competitive Edge**: Why your strong down payment + clean tax returns win offers
5. **Breathing Room**: After payment, how much left for business/lifestyle
6. **Next Steps**: What documentation to gather this week

TONE: Confident advisor. Emphasize self-employed strengths.
LENGTH: 450-550 words`,

  // Add templates for all other lead types...
  [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: (ctx) => ctx.locale === 'es' ? `
[Spanish template]
` : `
PERSONALIZED financial analysis for W2 first-time homebuyer with strong credit.

BUYER DATA:
- Monthly income: $${ctx.monthlyIncome}
- Monthly debts: $${ctx.monthlyDebts}
- Current DTI: ${ctx.currentDTI}%
- Credit score: ${ctx.creditScore}
- Down payment: ${ctx.downPayment}%

YOUR ADVANTAGE: Excellent credit + W2 employment = best rates and terms available.

FORMAT:
1. **Celebration**: Your ${ctx.creditScore} credit puts you in top 25% of buyers
2. **Buying Power**: You qualify for $X-Y based on income + credit
3. **Price Table**: 3 scenarios with FHA vs Conventional comparison
4. **Why Sellers Choose You**: Strong credit = financing certainty
5. **Breathing Room**: Monthly budget after payment
6. **Rate Advantage**: How much your credit saves monthly/30 years

TONE: Excited. You're in excellent position.
LENGTH: 450-550 words`,

  // Fallback templates for other types (similar structure)
  ...Object.fromEntries(
    [
      LeadType.ITIN_INVESTOR,
      LeadType.ITIN_UPSIZING,
      LeadType.SELF_EMPLOYED_INVESTOR,
      LeadType.SELF_EMPLOYED_UPSIZING,
      LeadType.W2_FIRST_TIME_LOW_CREDIT,
      LeadType.W2_INVESTOR,
      LeadType.W2_UPSIZING,
      LeadType.MILITARY_VETERAN_FIRST_TIME,
      LeadType.MILITARY_VETERAN_UPSIZING,
      LeadType.RETIRED_BUYER,
      LeadType.HIGH_NET_WORTH,
      LeadType.MIXED_INCOME_BUYER,
      LeadType.STANDARD_BUYER
    ].map(type => [type, (ctx: PromptContext) => `Standard financial prompt for ${type}`])
  )
}

/**
 * Loan Options Prompt Templates by Lead Type
 */
const loanPromptTemplates: Record<LeadType, (ctx: PromptContext) => string> = {
  // ITIN Borrowers - Special template
  [LeadType.ITIN_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
[Spanish ITIN loan template]
` : `
PERSONALIZED loan comparison for ITIN first-time homebuyer.

PROFILE:
- Credit: ${ctx.creditScore}
- Target price: $${ctx.targetPrice}
- Down payment: ${ctx.downPayment}%
- Employment: ITIN taxpayer
- First-time: YES

CRITICAL: ITIN borrowers CANNOT get FHA, VA, or standard Conventional loans.

ELIGIBLE LOANS FOR YOU:
✅ ITIN Portfolio Loans (Non-QM) - YOUR ONLY OPTION

NOT ELIGIBLE:
🚫 FHA (requires SSN)
🚫 VA (requires military service + SSN)
🚫 Conventional (requires SSN + legal presence proof)

REQUIRED FORMAT:
1. **Your Loan Option**: ITIN Portfolio Loan is your path to homeownership - here's why
2. **How ITIN Loans Work**:
   - Lenders: Inlanta, Angel Oak, Defy, Athas, CrossCountry, Griffin (Texas specialists)
   - Rates: 7.0-8.5% (0.5-1.5% higher than conventional)
   - Down: 10-20% minimum (you have ${ctx.downPayment}%)
   - Documentation: ITIN card, 2yr tax returns, bank statements, passport
   - Processing: 45-60 days
3. **Your Advantage**: ${ctx.downPayment}% down + ${ctx.creditScore} credit makes you attractive to ITIN lenders
4. **Monthly Payment**: Estimate for $${ctx.targetPrice} at 7.5% and 8.5%
5. **Texas ITIN Lenders**: Which to call this week and what to ask
6. **Timeline**: 60-day path from application to closing

TONE: Empowering. You CAN buy a home with ITIN.
CRITICAL: DO NOT mention FHA/VA/Conventional as options.
LENGTH: 600-700 words`,

  // Add templates for all other lead types...
  [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: (ctx) => `Standard W2 loan template`,

  ...Object.fromEntries(
    Object.keys(financialPromptTemplates).filter(k => k !== LeadType.ITIN_FIRST_TIME && k !== LeadType.W2_FIRST_TIME_GOOD_CREDIT).map(type => [
      type,
      (ctx: PromptContext) => `Standard loan prompt for ${type}`
    ])
  )
}

/**
 * Builds section prompts based on lead classification
 *
 * @param leadProfile - Classified lead profile
 * @param wizardData - Complete wizard data
 * @returns Customized prompts for each section
 */
export function buildSectionPrompts(leadProfile: LeadProfile, wizardData: WizardData): SectionPrompts {
  const ctx = buildPromptContext(leadProfile, wizardData)

  // Get templates for this lead type
  const financialTemplate = financialPromptTemplates[leadProfile.leadType] || financialPromptTemplates[LeadType.STANDARD_BUYER]
  const loanTemplate = loanPromptTemplates[leadProfile.leadType] || loanPromptTemplates[LeadType.W2_FIRST_TIME_GOOD_CREDIT]

  return {
    financial: financialTemplate(ctx),
    loanOptions: loanTemplate(ctx),
    location: buildLocationPrompt(ctx) // Standard location prompt for all types
  }
}

/**
 * Builds location prompt (standard for all lead types)
 */
function buildLocationPrompt(ctx: PromptContext): string {
  return ctx.locale === 'es' ? `
Análisis de ubicación INMERSIVO para comprador en ${ctx.city}, TX.

BÚSQUEDA:
- Ciudad: ${ctx.city}, TX
- Presupuesto: $${ctx.targetPrice}
- Prioridades: ${ctx.locationPriorities}
- Tamaño hogar: ${ctx.householdSize} personas

[Standard location format...]
` : `
IMMERSIVE location analysis for homebuyer in ${ctx.city}, TX.

BUYER'S SEARCH:
- Target city: ${ctx.city}, TX
- Budget: $${ctx.targetPrice}
- Top priorities: ${ctx.locationPriorities}
- Household size: ${ctx.householdSize} people

REQUIRED FORMAT:
1. **Market Reality**: What $${ctx.targetPrice} buys in ${ctx.city} today
2. **Your ${ctx.city} Playbook** - Top 3 Neighborhoods
3. **Win Strategy**: How to beat competing offers
4. **Imagine Your Saturday**: Paint picture with real place names
5. **What You Can't See Here**: Tease insider access value

TONE: Enthusiastic local expert
LENGTH: 650-750 words`
}

/**
 * Gets prompt strategy description for lead type
 */
export function getPromptStrategy(leadType: LeadType): string {
  const strategies: Record<LeadType, string> = {
    [LeadType.ITIN_FIRST_TIME]: 'Focus on ITIN-specific requirements, realistic expectations, portfolio lender education',
    [LeadType.ITIN_INVESTOR]: 'Investment property focus, ITIN documentation, higher down payment strategies',
    [LeadType.SELF_EMPLOYED_FIRST_TIME]: 'Tax return optimization, bank statement loans, reserve requirements',
    [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: 'Emphasize credit advantage, FHA vs Conventional comparison, rate optimization',
    [LeadType.W2_FIRST_TIME_LOW_CREDIT]: 'Credit building guidance, FHA benefits, path to better rates',
    [LeadType.MILITARY_VETERAN_FIRST_TIME]: 'VA loan benefits, 0% down advantage, military-specific programs',
    [LeadType.HIGH_NET_WORTH]: 'Jumbo options, tax strategies, portfolio management',
    [LeadType.RETIRED_BUYER]: 'Asset depletion loans, SSI/pension documentation, no employment verification',
    // ... add all types
    [LeadType.STANDARD_BUYER]: 'Standard homebuyer guidance'
  }

  return strategies[leadType] || 'Standard approach'
}
