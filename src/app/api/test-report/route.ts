import { NextRequest, NextResponse } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import { createPrivacySafePlanInput, type WizardData, type ContactInfo } from '@/lib/services/ai-service'
import type { Locale } from '@/lib/i18n'
import { getGeminiConfig } from '@/lib/env'
import { classifyLead, getLeadTypeDescription } from '@/lib/services/lead-classifier'
import { buildSectionPrompts } from '@/lib/services/prompt-builder'

// Dev-only endpoint for testing report generation
export const runtime = 'nodejs'
export const maxDuration = 60

// Test data presets - MATCHES WIZARD DATA STRUCTURE EXACTLY
const TEST_SCENARIOS = {
  'first-time-buyer': {
    wizardData: {
      // Step 1: Location
      city: 'Round Rock',
      zipCode: '78664',
      locationPriority: ['schools', 'safety'],

      // Step 2: Timeline
      timeline: '3-6',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 350000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 85000,

      // Step 5: Debts & Credit
      monthlyDebts: 400,
      creditScore: '740-799',

      // Step 6: Down Payment
      downPaymentAmount: 10500, // 3% of 350k
      downPaymentPercent: 3,

      // Step 7: Employment
      employmentType: 'w2',

      // Step 8: Buyer Profile
      buyerType: ['first-time'],
      householdSize: 2
    },
    contactInfo: {
      firstName: 'Test',
      lastName: 'Buyer',
      email: 'test@example.com',
      phone: '555-1234'
    },
    locale: 'en' as Locale
  },
  'high-income': {
    wizardData: {
      // Step 1: Location
      city: 'Austin',
      zipCode: '78701',
      locationPriority: ['commute', 'walkability', 'nightlife'],

      // Step 2: Timeline
      timeline: '0-3',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 550000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 200000,

      // Step 5: Debts & Credit
      monthlyDebts: 1000,
      creditScore: '800+',

      // Step 6: Down Payment
      downPaymentAmount: 55000, // 10% of 550k
      downPaymentPercent: 10,

      // Step 7: Employment
      employmentType: 'w2',

      // Step 8: Buyer Profile
      buyerType: ['investor', 'upsizing'],
      householdSize: 1
    },
    contactInfo: {
      firstName: 'High',
      lastName: 'Earner',
      email: 'high-earner@example.com',
      phone: '555-5678'
    },
    locale: 'en' as Locale
  },
  'tight-budget': {
    wizardData: {
      // Step 1: Location
      city: 'Hutto',
      zipCode: '78634',
      locationPriority: ['schools', 'safety', 'shopping'],

      // Step 2: Timeline
      timeline: '6-12',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 280000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 65000,

      // Step 5: Debts & Credit
      monthlyDebts: 600,
      creditScore: '620-679',

      // Step 6: Down Payment
      downPaymentAmount: 8400, // 3% of 280k
      downPaymentPercent: 3,

      // Step 7: Employment
      employmentType: 'w2',

      // Step 8: Buyer Profile
      buyerType: ['first-time', 'upsizing'],
      householdSize: 4 // Family with kids needs more space
    },
    contactInfo: {
      firstName: 'Budget',
      lastName: 'Conscious',
      email: 'budget@example.com',
      phone: '555-9012'
    },
    locale: 'en' as Locale
  },
  'itin-jarrell': {
    wizardData: {
      // Step 1: Location
      city: 'Jarrell',
      zipCode: '76537',
      locationPriority: ['schools', 'safety', 'shopping'],

      // Step 2: Timeline
      timeline: '6-12',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 320000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 72000,

      // Step 5: Debts & Credit
      monthlyDebts: 350,
      creditScore: '680-739',

      // Step 6: Down Payment
      downPaymentAmount: 32000, // 10% of 320k
      downPaymentPercent: 10,

      // Step 7: Employment
      employmentType: 'itin',

      // Step 8: Buyer Profile
      buyerType: ['first-time'],
      householdSize: 3
    },
    contactInfo: {
      firstName: 'ITIN',
      lastName: 'Buyer',
      email: 'itin@example.com',
      phone: '555-3333'
    },
    locale: 'en' as Locale
  },
  '1099-contractor': {
    wizardData: {
      // Step 1: Location
      city: 'Round Rock',
      zipCode: '78664',
      locationPriority: ['commute', 'shopping'],

      // Step 2: Timeline
      timeline: '3-6',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 400000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 110000,

      // Step 5: Debts & Credit
      monthlyDebts: 800,
      creditScore: '720-779',

      // Step 6: Down Payment
      downPaymentAmount: 60000, // 15% of 400k
      downPaymentPercent: 15,

      // Step 7: Employment
      employmentType: 'self-employed',

      // Step 8: Buyer Profile
      buyerType: ['upsizing'],
      householdSize: 2
    },
    contactInfo: {
      firstName: '1099',
      lastName: 'Contractor',
      email: '1099@example.com',
      phone: '555-4444'
    },
    locale: 'en' as Locale
  },
  'investor-kyle': {
    wizardData: {
      // Step 1: Location
      city: 'Kyle',
      zipCode: '78640',
      locationPriority: ['investment', 'growth'],

      // Step 2: Timeline
      timeline: '0-3',

      // Step 3: Budget
      budgetType: 'price' as const,
      targetPrice: 480000,
      monthlyBudget: undefined,

      // Step 4: Income
      annualIncome: 180000,

      // Step 5: Debts & Credit
      monthlyDebts: 1200,
      creditScore: '800+',

      // Step 6: Down Payment
      downPaymentAmount: 96000, // 20% of 480k
      downPaymentPercent: 20,

      // Step 7: Employment
      employmentType: 'w2',

      // Step 8: Buyer Profile
      buyerType: ['investor'],
      householdSize: 1
    },
    contactInfo: {
      firstName: 'Investor',
      lastName: 'Kyle',
      email: 'investor@example.com',
      phone: '555-5555'
    },
    locale: 'en' as Locale
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const scenario = searchParams.get('scenario') || 'first-time-buyer'
  const locale = (searchParams.get('locale') || 'en') as Locale

  // Get test data
  const testData = TEST_SCENARIOS[scenario as keyof typeof TEST_SCENARIOS] || TEST_SCENARIOS['first-time-buyer']
  const { wizardData, contactInfo } = testData

  console.log('🧪 TEST REPORT GENERATION START')
  console.log(`📋 Scenario: ${scenario}`)
  console.log(`🌐 Locale: ${locale}`)
  console.log(`💰 Budget: $${wizardData.targetPrice?.toLocaleString()}`)
  console.log(`📊 Income: $${wizardData.annualIncome?.toLocaleString()}`)

  const startTime = Date.now()
  const sectionTimes: Record<string, number> = {}
  const sectionCosts: Record<string, number> = {}
  const sectionTokens: Record<string, { prompt: number, output: number, cached: number }> = {}

  try {
    // Create privacy-safe plan input
    const privacySafePlanInput = createPrivacySafePlanInput(wizardData, locale)

    // Create full plan input (includes contact info)
    const fullPlanInput: import('@/validators/planning-schemas').PlanGenerationInput = {
      ...privacySafePlanInput,
      userProfile: {
        ...privacySafePlanInput.userProfile,
        contact: {
          firstName: contactInfo.firstName || 'User',
          lastName: contactInfo.lastName || '',
          email: contactInfo.email || 'user@example.com',
          phone: contactInfo.phone || '',
          dateOfBirth: contactInfo.dateOfBirth || '',
          maritalStatus: contactInfo.maritalStatus || 'unknown'
        },
        locationPriorities: wizardData.locationPriority || [],
        buyerTypes: wizardData.buyerType || []
      },
      preferences: {
        ...privacySafePlanInput.preferences,
        buyerSpecialization: {
          isITINTaxpayer: privacySafePlanInput.preferences.buyerSpecialization?.isITINTaxpayer ?? false,
          isMilitaryVeteran: privacySafePlanInput.preferences.buyerSpecialization?.isMilitaryVeteran ?? false,
          isUSDAEligible: privacySafePlanInput.preferences.buyerSpecialization?.isUSDAEligible ?? false,
          isFirstTimeBuyer: privacySafePlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer ?? false,
          isInvestor: privacySafePlanInput.preferences.buyerSpecialization?.isInvestor ?? false,
          needsAccessibilityFeatures: privacySafePlanInput.preferences.buyerSpecialization?.needsAccessibilityFeatures ?? false,
          rawBuyerTypes: wizardData.buyerType || [],
          rawLocationPriorities: wizardData.locationPriority || []
        }
      }
    }

    const geminiClient = createGeminiClient()

    // Use ENV configuration (same as production wizard-stream)
    const geminiConfig = getGeminiConfig()
    const MODELS = geminiConfig.models
    const TOKEN_LIMITS = geminiConfig.maxOutputTokens
    const GROUNDING = geminiConfig.grounding
    const PARALLEL_ENABLED = geminiConfig.enableParallelGeneration

    console.log(`🎯 Test using ENV config:`, {
      models: MODELS,
      grounding: GROUNDING,
      parallelEnabled: PARALLEL_ENABLED,
      tokenLimits: TOKEN_LIMITS
    })

    // ============================================
    // STEP 1: CLASSIFY LEAD
    // ============================================
    const leadProfile = classifyLead(wizardData, locale)
    console.log(`🎯 Lead Classification: ${leadProfile.leadType} (${leadProfile.primaryCategory})`)
    console.log(`💳 Credit Tier: ${leadProfile.creditTier} | DTI: ${leadProfile.debtToIncome}%`)
    console.log(`🏦 Eligible Loans: ${leadProfile.loanEligibility.eligible.join(', ')}`)
    console.log(`✅ Recommended: ${leadProfile.loanEligibility.recommended}`)
    if (leadProfile.specialConsiderations.length > 0) {
      console.log(`⚠️  Special Considerations: ${leadProfile.specialConsiderations.join(', ')}`)
    }

    // ============================================
    // STEP 2: BUILD CUSTOM PROMPTS FOR LEAD TYPE
    // ============================================
    const customPrompts = buildSectionPrompts(leadProfile, wizardData)
    console.log(`📝 Custom prompts generated for ${leadProfile.leadType}`)
    console.log(`   Financial prompt length: ${customPrompts.financial.length} chars`)
    console.log(`   Loan prompt length: ${customPrompts.loanOptions.length} chars`)
    console.log(`   Location prompt length: ${customPrompts.location.length} chars`)

    const sections: Record<string, string> = {}
    const overallStart = Date.now()

    // Check if parallel generation is enabled
    if (PARALLEL_ENABLED) {
      console.log('\n⚡ PARALLEL GENERATION MODE - Processing all 3 sections concurrently...')

      const [financialResult, loanResult, locationResult] = await Promise.allSettled([
        // Financial Section (Parallel)
        (async () => {
          const sectionStart = Date.now()
          console.log('🔄 [PARALLEL] Financial Analysis starting...')

          // Use custom financial prompt from lead classification (PARALLEL MODE)
          let content = ''
          for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.financial, customPrompts.financial, TOKEN_LIMITS.financial, MODELS.financial)) {
            content += chunk
          }

          sectionTimes.financial = Date.now() - sectionStart
          console.log(`✅ [PARALLEL] Financial complete: ${sectionTimes.financial}ms`)
          return content
        })(),

        // Loan Options Section (Parallel)
        (async () => {
          const sectionStart = Date.now()
          console.log('🔄 [PARALLEL] Loan Options starting...')

          // Use custom loan options prompt from lead classification (PARALLEL MODE)
          let content = ''
          for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.loans, customPrompts.loanOptions, TOKEN_LIMITS.loans, MODELS.loanOptions)) {
            content += chunk
          }

          sectionTimes.loanOptions = Date.now() - sectionStart
          console.log(`✅ [PARALLEL] Loan Options complete: ${sectionTimes.loanOptions}ms`)
          return content
        })(),

        // Location Section (Parallel)
        (async () => {
          const sectionStart = Date.now()
          console.log('🔄 [PARALLEL] Location Analysis starting...')

          const city = fullPlanInput.userProfile.location.preferredCity || wizardData.city || 'the area'
          const targetPrice = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
          const locationPriorities = wizardData.locationPriority || []
          const householdSize = wizardData.householdSize || 1

          // EXACT PROMPT FROM WIZARD-STREAM (wizard-stream/route.ts:324-398)
          const locationPrompt = locale === 'es'
            ? `Crea un análisis de ubicación INMERSIVO como guía de regalo para comprador de vivienda.

BÚSQUEDA DEL COMPRADOR:
- Ciudad objetivo: ${city}, TX
- Presupuesto: $${targetPrice}
- Prioridades principales: ${locationPriorities.join(', ') || 'Balance general'}
- Tamaño del hogar: ${householdSize} personas

FORMATO REQUERIDO:
1. **Resumen de Realidad del Mercado** (2-3 líneas):
   - Qué compra $${targetPrice} REALMENTE en ${city} hoy
   - Nivel de competencia del mercado

2. **Vecindarios Recomendados** (Top 3-4):
   Para cada uno:
   - 🏡 Tipo de propiedad típica a $${targetPrice}
   - ✅ Por qué encaja con sus prioridades (${locationPriorities.join(', ')})
   - 📍 Ejemplos específicos de calles/áreas
   - 💡 Consejo interno (mejores horas para visitar, tendencias, etc.)
   - 📊 Datos reales: precio promedio, días en mercado, competencia de ofertas

3. **Estrategia Ganadora**:
   - Cómo superar a otros compradores en este mercado
   - Secretos locales que mayoría no sabe
   - Compromiso inteligente si es necesario

4. **Visualiza Tu Vida Aquí**:
   - Pinta imagen de día típico en vecindario recomendado
   - Cafeterías, parques, restaurantes específicos cerca
   - Por qué amarán vivir ahí

5. **Acción Inmediata**: Qué vecindarios ver este fin de semana

TONO: Experto local entusiasta, storyteller. Como amigo que conoce la ciudad.
INCLUYE: Datos reales del mercado (vía grounding), nombres específicos de calles/lugares, contexto cultural.
EVITA: Generalidades, datos desactualizados, listar sin contexto.

CRITICAL MARKDOWN RULES:
- NO preambles ("Alright!", "Get ready") - START with market reality
- NO separator lines (---)
- Use ## for headers (NOT ###)
- Keep under 600 words`

            : `Create an IMMERSIVE location analysis as a gift guide for homebuyer.

BUYER'S SEARCH:
- Target city: ${city}, TX
- Budget: $${targetPrice}
- Top priorities: ${locationPriorities.join(', ') || 'Overall balance'}
- Household size: ${householdSize} people

REQUIRED FORMAT (LEAD MAGNET - 700 WORDS):
1. **Market Reality** (2-3 sentences): What $${targetPrice} ACTUALLY buys in ${city} today

2. **Your ${city} Playbook** - Top 3 Neighborhoods (emoji: 🏡/🏞️/🌳):
   For EACH (~150 words):
   - Property type + sq ft at $${targetPrice}
   - Perfect for ${locationPriorities.join(', ')} because... (specific reasons)
   - Specific streets: "[Street], [Street], [Street]"
   - Insider tip (best time to visit, local secret, trend)
   - Real data: Avg price $X-Y | X days on market | Competition level

3. **Win Strategy** (4 bullets): How to beat 5-8 competing offers at this price

4. **Imagine Your Saturday** (1 paragraph): Morning coffee at [REAL CAFE] → afternoon at [REAL PARK] → dinner at [REAL RESTAURANT]. Paint the picture with REAL place names.

5. **What I Can't Show You Here** (3 bullets): Tease "homes hitting market 7-10 days early", "pocket listings in YOUR neighborhoods", "how to win multiple-offer wars"

TONE: Enthusiastic local expert. Give vision, create FOMO for insider access.
LENGTH: 650-750 words. Rich detail on neighborhoods, strategic gaps on execution.
STRATEGY: They can PICTURE living there, they need YOU to actually FIND and WIN the home.

CRITICAL MARKDOWN RULES:
- NO preambles ("Alright!", "Get ready", "Let me show you") - START with market reality
- NO separator lines (---)
- Use ## for ALL headers (NOT ###)
- Keep each neighborhood to 150 words MAX
- Total under 750 words`

          let content = ''
          for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.location, locationPrompt, TOKEN_LIMITS.location, MODELS.location)) {
            content += chunk
          }

          sectionTimes.location = Date.now() - sectionStart
          console.log(`✅ [PARALLEL] Location complete: ${sectionTimes.location}ms`)
          return content
        })()
      ])

      // Process results
      if (financialResult.status === 'fulfilled') {
        sections.financial = financialResult.value
      } else {
        throw new Error(`Financial section failed: ${financialResult.reason}`)
      }

      if (loanResult.status === 'fulfilled') {
        sections.loanOptions = loanResult.value
      } else {
        throw new Error(`Loan section failed: ${loanResult.reason}`)
      }

      if (locationResult.status === 'fulfilled') {
        sections.location = locationResult.value
      } else {
        throw new Error(`Location section failed: ${locationResult.reason}`)
      }

      console.log(`\n📊 PARALLEL GENERATION COMPLETE: ${Date.now() - overallStart}ms`)

    } else {
      console.log('\n⏭️  SEQUENTIAL GENERATION MODE (set GEMINI_ENABLE_PARALLEL_GENERATION=true for speedup)')

      // SECTION 1: Financial Analysis (SEQUENTIAL)
      console.log('\n🔄 Generating Financial Analysis (Sequential)...')
      const financialStart = Date.now()

      const income = fullPlanInput.userProfile.incomeDebt.annualIncome
      const monthlyIncome = Math.round(income / 12)
      const monthlyDebts = fullPlanInput.userProfile.incomeDebt.monthlyDebts
      const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore
      const downPaymentPct = wizardData.downPaymentPercent || 3
      const targetPrice = wizardData.targetPrice || Math.round(income * 3.5)
      const currentDTI = Math.round((monthlyDebts / monthlyIncome) * 100)
      const pricePoints = [targetPrice, Math.round(targetPrice * 1.15), Math.round(targetPrice * 1.3)]

      // EXACT PROMPT FROM WIZARD-STREAM (Sequential mode)
      const financialPrompt = locale === 'es'
        ? `Análisis financiero: Ingreso ${monthlyIncome}/mes, Deudas ${monthlyDebts}, DTI ${currentDTI}%, Crédito ${creditScore}. Genera tabla comparativa de precios ${pricePoints.join(', ')}.`
        : `Financial analysis: Income ${monthlyIncome}/month, Debts ${monthlyDebts}, DTI ${currentDTI}%, Credit ${creditScore}. Generate price comparison table ${pricePoints.join(', ')}.`

      let financialContent = ''
      for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.financial, financialPrompt, TOKEN_LIMITS.financial, MODELS.financial)) {
        financialContent += chunk
      }

      sections.financial = financialContent
      sectionTimes.financial = Date.now() - financialStart

      // SECTION 2: Loan Options (SEQUENTIAL)
      console.log('🔄 Generating Loan Options (Sequential)...')
      const loanStart = Date.now()

      const creditScore2 = fullPlanInput.userProfile.incomeDebt.creditScore
      const targetPrice2 = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
      const isFirstTime2 = fullPlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer || false
      const isMilitary2 = fullPlanInput.preferences.buyerSpecialization?.isMilitaryVeteran || false
      const isInvestor2 = fullPlanInput.preferences.buyerSpecialization?.isInvestor || false
      const employmentType2 = wizardData.employmentType || 'w2'
      const downPayment2 = wizardData.downPaymentPercent || 3

      // Employment context for sequential mode
      const employmentContext2 = employmentType2 === 'itin' ? 'ITIN taxpayer'
        : employmentType2 === '1099' || employmentType2 === 'self-employed' ? 'Self-employed/1099'
        : employmentType2 === 'mixed' ? 'Mixed income'
        : employmentType2 === 'retired' ? 'Retired'
        : 'W2 employee'

      // Simplified loan list for sequential
      const eligibleLoans2: string[] = []
      // ITIN borrowers: ONLY portfolio loans
      if (employmentType2 === 'itin') {
        eligibleLoans2.push('ITIN Portfolio Loans (non-QM)')
      } else {
        if (isMilitary2) eligibleLoans2.push('VA')
        if (isFirstTime2 && !isInvestor2) eligibleLoans2.push('FHA')
        eligibleLoans2.push('Conventional')
      }

      // HOLISTIC PROMPT (Sequential mode - simplified)
      const loanPrompt = locale === 'es'
        ? `Opciones de préstamo: Crédito ${creditScore2}, Precio ${targetPrice2}, Empleo ${employmentContext2}, Primera vez: ${isFirstTime2 ? 'Sí' : 'No'}, Militar: ${isMilitary2 ? 'Sí' : 'No'}. SOLO comparar: ${eligibleLoans2.join(', ')}. ${employmentType2 === 'itin' ? 'CRÍTICO: ITIN NO puede obtener FHA/VA/Conventional. SOLO préstamos portfolio ITIN. INCLUIR prestamistas Texas, tasas más altas, 15-20% enganche.' : employmentType2 === '1099' || employmentType2 === 'self-employed' ? 'INCLUIR requisitos auto-empleado: 2 años taxes, reservas.' : ''} NO recomendar VA si no militar. NO recomendar FHA para inversionista.`
        : `Loan options: Credit ${creditScore2}, Price ${targetPrice2}, ${downPayment2}% down, Employment ${employmentContext2}, First-time: ${isFirstTime2 ? 'Yes' : 'No'}, Military: ${isMilitary2 ? 'Yes' : 'No'}. ONLY compare: ${eligibleLoans2.join(', ')}. ${employmentType2 === 'itin' ? 'CRITICAL: ITIN CANNOT get FHA/VA/Conventional. ONLY ITIN portfolio loans. INCLUDE Texas lenders, higher rates, 15-20% down.' : employmentType2 === '1099' || employmentType2 === 'self-employed' ? 'INCLUDE self-employed requirements: 2yr tax returns, higher reserves.' : ''} DO NOT recommend VA if not military. DO NOT recommend FHA for investors.`

      let loanContent = ''
      for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.loans, loanPrompt, TOKEN_LIMITS.loans, MODELS.loanOptions)) {
        loanContent += chunk
      }

      sections.loanOptions = loanContent
      sectionTimes.loanOptions = Date.now() - loanStart

      // SECTION 3: Location (SEQUENTIAL)
      console.log('🔄 Generating Location Analysis (Sequential)...')
      const locationStart = Date.now()

      const city = fullPlanInput.userProfile.location.preferredCity || wizardData.city || 'the area'
      const targetPrice3 = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
      const locationPriorities = wizardData.locationPriority || []

      // EXACT PROMPT FROM WIZARD-STREAM (Sequential mode)
      const locationPrompt = locale === 'es'
        ? `Análisis de ubicación: ${city}, TX. Presupuesto ${targetPrice3}. Prioridades: ${locationPriorities.join(', ') || 'N/A'}. Incluye datos de mercado real.`
        : `Location analysis: ${city}, TX. Budget ${targetPrice3}. Priorities: ${locationPriorities.join(', ') || 'N/A'}. Include real market data.`

      let locationContent = ''
      for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.location, locationPrompt, TOKEN_LIMITS.location, MODELS.location)) {
        locationContent += chunk
      }

      sections.location = locationContent
      sectionTimes.location = Date.now() - locationStart

      console.log(`\n📊 SEQUENTIAL GENERATION COMPLETE: ${Date.now() - overallStart}ms`)
    } // End sequential else block

    const totalTime = Date.now() - overallStart

    // SECTION 4: Down Payment Assistance (Static content - not AI generated)
    const city = wizardData.city || 'Austin'
    const targetPrice = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
    const income = fullPlanInput.userProfile.incomeDebt.annualIncome
    const isFirstTime = fullPlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer || false
    const isMilitary = fullPlanInput.preferences.buyerSpecialization?.isMilitaryVeteran || false
    const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore

    const downPaymentNeeded = Math.round(targetPrice * 0.03)
    const withGrantAssistance = Math.round(downPaymentNeeded - 10000)
    const monthlySavings = Math.round((10000 * 0.07) / 12)

    const grantsText = locale === 'es'
      ? `## 💰 Programas de Asistencia para Enganche

**Propósito Educativo:** Esta información sobre programas de asistencia es solo para fines educativos. Consulte directamente con cada programa y un asesor financiero licenciado para verificar elegibilidad y términos actuales.

Para una casa de $${targetPrice.toLocaleString()}, un enganche del 3% requiere aproximadamente $${downPaymentNeeded.toLocaleString()}. Existen varios programas de asistencia en Texas que pueden ayudar a compradores calificados.

## Programas Disponibles en Texas

| Programa | Obtienes | Tiempo | Tu Acción |
|----------|----------|--------|-----------|
| **TSAHC My First Texas Home** | $10,000-$15,000 | 3-4 semanas | Curso 8 horas → Aplicar |
| **Texas Hometown Heroes** | $7,500 + 0.25% tasa | 2-3 semanas | Verificar profesión → Aplicar |
| **Austin AHFC** | $15,000-$80,000 | 4-6 semanas | Ingreso <$95k → Curso → Aplicar |
| **HUD Good Neighbor** | 50% descuento | Varía | Maestro/policía/bombero en zona |

## Ejemplo Ilustrativo

${isFirstTime ? `Como comprador por primera vez con crédito ${creditScore}, puede calificar para programas como TSAHC. La elegibilidad varía según múltiples factores.` : ''}

**Escenario de Ejemplo:**
- Enganche requerido (3%): $${downPaymentNeeded.toLocaleString()}
- Con asistencia de $10,000: $${withGrantAssistance.toLocaleString()}
- Posible ahorro mensual estimado: ~$${monthlySavings}/mes

**Importante:** Estas son estimaciones ilustrativas. Los montos reales, elegibilidad y términos varían. Consulte con cada programa directamente.

${isMilitary ? `
## Militar/Veterano = Dinero Extra

- VA Loan: 0% enganche (¡no necesitas ayuda!)
- Operation Homefront: $3,000-$5,000 adicional
- Homes for Heroes: Descuentos en cierre
` : ''}

${isFirstTime ? `
## Tu Plan (Primer Comprador)

**Semana 1:** Curso online 8 horas ($75) - [NeighborWorks](https://www.neighborworks.org)
**Semana 2:** Pre-aprobación con 2-3 prestamistas
**Semana 3:** Aplicar TSAHC + programas ${city}
**Semana 4-6:** Aprobación, buscar casas, ofertas

Total de tu bolsillo: $${withGrantAssistance.toLocaleString()} en vez de $${downPaymentNeeded.toLocaleString()}
` : `
## Rápido - 3 Pasos

1. Curso comprador (8hr online, $75) → Certificado
2. Pre-aprobación → Muestra poder de compra
3. Aplicar programas → Dinero en 2-4 semanas
`}

## Lo Que No Puedo Decirte Aquí

- Qué prestamistas procesan TSAHC en 10 días (vs 30)
- Cómo stackear múltiples programas para $20k+ total
- Qué decir en aplicación para aprobación rápida
- Cuándo aplicar (fondos se agotan en mayo-junio)

**Tu crédito ${creditScore} califica.** Los fondos se acaban. Primera llamada: mapeamos tu plan exacto de $10k-$15k gratis.`

      : `## 💰 Down Payment Assistance Programs

**Educational Purpose:** This information about assistance programs is for educational purposes only. Consult directly with each program and a licensed financial advisor to verify current eligibility and terms.

For a $${targetPrice.toLocaleString()} home, a 3% down payment requires approximately $${downPaymentNeeded.toLocaleString()}. Several assistance programs exist in Texas that may help qualified buyers.

## Available Texas Programs

| Program | You Get | Timeline | Your Action |
|---------|---------|----------|-------------|
| **TSAHC My First Texas Home** | $10,000-$15,000 | 3-4 weeks | 8hr course → Apply |
| **Texas Hometown Heroes** | $7,500 + 0.25% rate | 2-3 weeks | Verify profession → Apply |
| **Austin AHFC** | $15,000-$80,000 | 4-6 weeks | Income <$95k → Course → Apply |
| **HUD Good Neighbor** | 50% off price | Varies | Teacher/police/fire in zone |

## Illustrative Example

${isFirstTime ? `As a first-time buyer with ${creditScore} credit, you may qualify for programs like TSAHC. Eligibility varies based on multiple factors.` : ''}

**Example Scenario:**
- Required down payment (3%): $${downPaymentNeeded.toLocaleString()}
- With $10,000 assistance: $${withGrantAssistance.toLocaleString()}
- Potential estimated monthly savings: ~$${monthlySavings}/month

**Important:** These are illustrative estimates. Actual amounts, eligibility, and terms vary. Consult with each program directly.

${isMilitary ? `
## Military/Veteran = Extra Cash

- VA Loan: 0% down (you don't need help!)
- Operation Homefront: $3,000-$5,000 extra
- Homes for Heroes: Closing cost discounts
` : ''}

${isFirstTime ? `
## Your Plan (First-Timer)

**Week 1:** Online course 8 hours ($75) - [NeighborWorks](https://www.neighborworks.org)
**Week 2:** Pre-approval with 2-3 lenders
**Week 3:** Apply TSAHC + ${city} programs
**Week 4-6:** Approval, house hunting, offers

Out of YOUR pocket: $${withGrantAssistance.toLocaleString()} instead of $${downPaymentNeeded.toLocaleString()}
` : `
## Quick - 3 Steps

1. Buyer course (8hr online, $75) → Certificate
2. Pre-approval → Shows buying power
3. Apply programs → Money in 2-4 weeks
`}

## Recommended Next Steps

1. **Research directly** - Visit each program's website for current requirements
2. **Consult with professionals** - Speak with mortgage lenders about program compatibility
3. **Take required course** - Most require homebuyer education
4. **Apply early** - Many programs have limited funds

**Disclaimer:** Eligibility requirements, assistance amounts, and fund availability change frequently. This information may be outdated. Always verify directly with each program before making financial decisions.

**Professional Consultation Required:** For specific guidance on which programs may apply to your situation, consult with a licensed mortgage lender and a TREC-licensed real estate agent.`

    sections.grants = grantsText

    // Build test results
    const results = {
      success: true,
      scenario,
      locale,
      performance: {
        totalTime: `${totalTime}ms`,
        financialTime: `${sectionTimes.financial}ms`,
        loanOptionsTime: `${sectionTimes.loanOptions}ms`,
        locationTime: `${sectionTimes.location}ms`,
        models: MODELS,
        grounding: GROUNDING,
        parallelMode: PARALLEL_ENABLED,
        tokenLimits: TOKEN_LIMITS
      },
      sections: {
        financial: {
          content: sections.financial,
          length: sections.financial.length,
          time: sectionTimes.financial
        },
        loanOptions: {
          content: sections.loanOptions,
          length: sections.loanOptions.length,
          time: sectionTimes.loanOptions
        },
        location: {
          content: sections.location,
          length: sections.location.length,
          time: sectionTimes.location
        },
        grants: {
          content: grantsText,
          length: grantsText.length,
          time: 0
        }
      },
      testData: {
        income: wizardData.annualIncome,
        budget: wizardData.targetPrice,
        city: wizardData.city,
        credit: wizardData.creditScore
      }
    }

    console.log('\n✅ TEST COMPLETE')
    console.log(`⏱️  Total time: ${totalTime}ms`)
    console.log(`📊 Financial (Pro): ${sectionTimes.financial}ms - ${sections.financial.length} chars`)
    console.log(`⚡ Loan Options (Flash): ${sectionTimes.loanOptions}ms - ${sections.loanOptions.length} chars`)
    console.log(`⚡ Location (Flash): ${sectionTimes.location}ms - ${sections.location.length} chars`)

    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        totalTime: `${Date.now() - startTime}ms`,
        ...sectionTimes
      }
    }, { status: 500 })
  }
}
