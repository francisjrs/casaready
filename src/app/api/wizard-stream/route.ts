import { NextRequest } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import { createPrivacySafePlanInput, type WizardData, type ContactInfo } from '@/lib/services/ai-service'
import type { PrivacySafePlanGenerationInput } from '@/validators/planning-schemas'
import type { Locale } from '@/lib/i18n'

// Vercel serverless configuration
export const runtime = 'nodejs' // Use Node.js runtime for Gemini API
export const maxDuration = 60 // Max 60s for Pro plan (increase streaming capacity)
export const dynamic = 'force-dynamic' // Always run dynamically for SSE

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Wizard Streaming API: Starting Gemini streaming for wizard report...')

    const body = await request.json() as { wizardData: WizardData, contactInfo: ContactInfo, locale?: Locale }
    const { wizardData, contactInfo, locale = 'en' } = body

    if (!wizardData || !contactInfo) {
      return new Response(
        JSON.stringify({ error: 'Wizard data and contact info are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`📊 Wizard Streaming API: Processing report for ${contactInfo.firstName} ${contactInfo.lastName}`)
    console.log(`🌐 Wizard Streaming API: Locale set to "${locale}"`)

    // Create privacy-safe plan input (removes contact information)
    const privacySafePlanInput: PrivacySafePlanGenerationInput = createPrivacySafePlanInput(wizardData, locale)

    console.log(`📝 Wizard Streaming API: Privacy-safe input created with language: ${privacySafePlanInput.preferences.language}`)

    // Create full plan input for Gemini (includes contact info and additional wizard data)
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
        // Add location priorities for personalized analysis
        locationPriorities: wizardData.locationPriority || [],
        buyerTypes: wizardData.buyerType || []
      },
      preferences: {
        ...privacySafePlanInput.preferences,
        // Enhance buyer specialization with raw data for conditional logic
        buyerSpecialization: {
          isITINTaxpayer: privacySafePlanInput.preferences.buyerSpecialization?.isITINTaxpayer ?? false,
          isMilitaryVeteran: privacySafePlanInput.preferences.buyerSpecialization?.isMilitaryVeteran ?? false,
          isUSDAEligible: privacySafePlanInput.preferences.buyerSpecialization?.isUSDAEligible ?? false,
          isFirstTimeBuyer: privacySafePlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer ?? false,
          isInvestor: privacySafePlanInput.preferences.buyerSpecialization?.isInvestor ?? false,
          needsAccessibilityFeatures: privacySafePlanInput.preferences.buyerSpecialization?.needsAccessibilityFeatures ?? false,
          // Add raw arrays for template conditional logic
          rawBuyerTypes: wizardData.buyerType || [],
          rawLocationPriorities: wizardData.locationPriority || []
        }
      }
    }

    // Create Gemini client
    const geminiClient = createGeminiClient()

    // Set up Server-Sent Events (SSE) stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('📝 Wizard Streaming API: Starting markdown analysis stream...')
          }

          let totalChunks = 0
          const sectionContents = {
            financial: '',
            loanOptions: '',
            location: '',
            disclaimer: ''
          }

          // MODEL SELECTION STRATEGY:
          // - Financial Analysis: Use Pro (complex calculations, DTI, cash needed)
          // - Loan Options: Use Flash (program comparison, faster by 3x)
          // - Location: Use Flash (market data lookup, faster by 3x)
          // Expected performance: 45s -> ~25s (45% faster)

          const MODELS = {
            financial: 'gemini-2.5-pro',    // Complex math requires Pro
            loanOptions: 'gemini-2.5-flash', // Simple comparison, use Flash for speed
            location: 'gemini-2.5-flash'     // Market lookup, use Flash for speed
          }

          console.log(`🎯 Multi-model strategy: Financial=${MODELS.financial}, LoanOptions=${MODELS.loanOptions}, Location=${MODELS.location}`)

          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            message: locale === 'es' ? 'Generando tu reporte personalizado...' : 'Generating your personalized report...',
            totalSections: 4
          })}\n\n`))

          // SECTION 1: Financial Analysis
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'financial',
              title: locale === 'es' ? '💰 Análisis Financiero' : '💰 Financial Analysis',
              sectionNumber: 1,
              totalSections: 4
            })}\n\n`))

            // Build comprehensive financial prompt with calculations
            const income = fullPlanInput.userProfile.incomeDebt.annualIncome
            const monthlyIncome = Math.round(income / 12)
            const monthlyDebts = fullPlanInput.userProfile.incomeDebt.monthlyDebts
            const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore
            const downPaymentPct = wizardData.downPaymentPercent || 3
            const targetPrice = wizardData.targetPrice || Math.round(income * 3.5)

            // Calculate key metrics
            const currentDTI = Math.round((monthlyDebts / monthlyIncome) * 100)
            const maxMonthlyPayment = Math.round(monthlyIncome * 0.43) // 43% DTI max
            const recommendedMonthlyPayment = Math.round(monthlyIncome * 0.35) // 35% safer
            const availableForHousing = maxMonthlyPayment - monthlyDebts

            // Calculate for 3 price points
            const pricePoints = [
              targetPrice,
              Math.round(targetPrice * 1.15),
              Math.round(targetPrice * 1.3)
            ]

            const financialPrompt = locale === 'es'
              ? `Eres un asesor financiero experto. Escribe análisis financiero completo (nivel tercer grado - palabras simples).

SITUACIÓN ACTUAL DEL COMPRADOR:
- Ingreso anual: $${income.toLocaleString()} ($${monthlyIncome.toLocaleString()}/mes)
- Deudas mensuales: $${monthlyDebts.toLocaleString()}
- DTI actual: ${currentDTI}% (excelente si <20%, bueno si <36%)
- Puntaje de crédito: ${creditScore}
- Enganche: ${downPaymentPct}%

GENERA ESTE ANÁLISIS (máximo 250 palabras):

## 💰 Análisis Financiero

**Tu Situación Actual:**
- Ganas $${monthlyIncome.toLocaleString()} cada mes
- Pagas $${monthlyDebts.toLocaleString()} en deudas (${currentDTI}% de tu ingreso)
- Disponible para casa: $${availableForHousing.toLocaleString()}/mes

**Comparación de Precios:**

| Precio Casa | Enganche (${downPaymentPct}%) | Pago Mensual* | Costos Cierre | Efectivo Necesario Total |
|-------------|-------------------------------|---------------|---------------|--------------------------|
| $${pricePoints[0].toLocaleString()} | $${Math.round(pricePoints[0] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[0] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[0] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |
| $${pricePoints[1].toLocaleString()} | $${Math.round(pricePoints[1] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[1] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[1] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |
| $${pricePoints[2].toLocaleString()} | $${Math.round(pricePoints[2] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[2] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[2] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |

*Incluye: préstamo + impuestos + seguro + PMI

**Efectivo Total Necesario para Cerrar (precio $${targetPrice.toLocaleString()}):**
- Enganche: $${Math.round(targetPrice * downPaymentPct/100).toLocaleString()}
- Costos de cierre: $${Math.round(targetPrice * 0.035).toLocaleString()} (3-4%)
- Depósitos/reservas: $${(3000).toLocaleString()}
- TOTAL: $${Math.round(targetPrice * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()}

**Recomendación:** [Basado en DTI y disponibilidad de efectivo]

Usa palabras simples. Explica todo claramente.`
              : `You are an expert financial advisor. Write comprehensive financial analysis (3rd grade level - simple words).

BUYER'S CURRENT SITUATION:
- Annual income: $${income.toLocaleString()} ($${monthlyIncome.toLocaleString()}/month)
- Monthly debts: $${monthlyDebts.toLocaleString()}
- Current DTI: ${currentDTI}% (excellent if <20%, good if <36%)
- Credit score: ${creditScore}
- Down payment: ${downPaymentPct}%

GENERATE THIS ANALYSIS (maximum 250 words):

## 💰 Financial Analysis

**Your Current Situation:**
- You earn $${monthlyIncome.toLocaleString()} each month
- You pay $${monthlyDebts.toLocaleString()} in debts (${currentDTI}% of income)
- Available for housing: $${availableForHousing.toLocaleString()}/month

**Price Comparison:**

| House Price | Down Payment (${downPaymentPct}%) | Monthly Payment* | Closing Costs | Total Cash Needed |
|-------------|-----------------------------------|------------------|---------------|-------------------|
| $${pricePoints[0].toLocaleString()} | $${Math.round(pricePoints[0] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[0] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[0] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |
| $${pricePoints[1].toLocaleString()} | $${Math.round(pricePoints[1] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[1] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[1] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |
| $${pricePoints[2].toLocaleString()} | $${Math.round(pricePoints[2] * downPaymentPct/100).toLocaleString()} | ~$X,XXX | ~$${Math.round(pricePoints[2] * 0.035).toLocaleString()} | ~$${Math.round(pricePoints[2] * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()} |

*Includes: loan + taxes + insurance + PMI

**Total Cash Needed to Close (for $${targetPrice.toLocaleString()} home):**
- Down payment: $${Math.round(targetPrice * downPaymentPct/100).toLocaleString()}
- Closing costs: $${Math.round(targetPrice * 0.035).toLocaleString()} (3-4%)
- Escrow/reserves: $${(3000).toLocaleString()}
- TOTAL CASH: $${Math.round(targetPrice * (downPaymentPct/100 + 0.035) + 3000).toLocaleString()}

**Recommendation:** [Based on DTI and cash availability]

Use simple words. Explain everything clearly.`

            // Use Pro model for complex financial calculations, disable grounding
            const FINANCIAL_TOKEN_LIMIT = 800 // ~250 words
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, financialPrompt, FINANCIAL_TOKEN_LIMIT, MODELS.financial)) {
              totalChunks++
              sectionContents.financial += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'financial',
                content: chunk
              })}\n\n`))
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'financial',
              content: sectionContents.financial
            })}\n\n`))

          } catch (error) {
            console.error('Error generating financial section:', error)
          }

          // SECTION 2: Loan Options
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'loanOptions',
              title: locale === 'es' ? '🏦 Opciones de Préstamo' : '🏦 Loan Options',
              sectionNumber: 2,
              totalSections: 4
            })}\n\n`))

            const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore
            const downPaymentPct2 = wizardData.downPaymentPercent || 3
            const targetPrice2 = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
            const isFirstTime = fullPlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer || false
            const isMilitary = fullPlanInput.preferences.buyerSpecialization?.isMilitaryVeteran || false
            const isUSDA = fullPlanInput.preferences.buyerSpecialization?.isUSDAEligible || false

            // Calculate loan details for different programs
            const downPayment3pct = Math.round(targetPrice2 * 0.03)
            const downPayment3_5pct = Math.round(targetPrice2 * 0.035)
            const downPayment5pct = Math.round(targetPrice2 * 0.05)
            const downPayment10pct = Math.round(targetPrice2 * 0.10)
            const downPayment20pct = Math.round(targetPrice2 * 0.20)

            // Estimate PMI (rough calculation)
            const loanAmount3pct = targetPrice2 - downPayment3pct
            const pmi3pct = Math.round((loanAmount3pct * 0.005) / 12) // 0.5% annual PMI

            const loanPrompt = locale === 'es'
              ? `Eres un experto en préstamos hipotecarios en Texas. Escribe análisis completo de opciones de préstamo (nivel tercer grado).

INFORMACIÓN DEL COMPRADOR:
- Puntaje de crédito: ${creditScore}
- Precio objetivo: $${targetPrice2.toLocaleString()}
- Enganche planeado: ${downPaymentPct2}% ($${Math.round(targetPrice2 * downPaymentPct2/100).toLocaleString()})
- Primera vez comprando: ${isFirstTime ? 'Sí' : 'No'}
- Militar/Veterano: ${isMilitary ? 'Sí' : 'No'}

GENERA ESTE ANÁLISIS (máximo 300 palabras):

## 🏦 Opciones de Préstamo

**Mejor Programa para Ti:** [Recomienda el mejor basado en perfil]

**Comparación de Programas:**

| Programa | Enganche Mínimo | PMI/MIP | Puntaje Crédito | Mejor Para |
|----------|-----------------|---------|-----------------|------------|
| Conventional 97 | 3% ($${downPayment3pct.toLocaleString()}) | ~$${pmi3pct.toLocaleString()}/mes | 620+ | Primer comprador, buen crédito |
| FHA | 3.5% ($${downPayment3_5pct.toLocaleString()}) | ~$XXX/mes (permanente) | 580+ | Crédito más bajo |
| VA Loan | 0% ($0) | No PMI | N/A | Militares/veteranos solamente |
| Conventional 95 | 5% ($${downPayment5pct.toLocaleString()}) | ~$XXX/mes (menos) | 620+ | Más ahorro inicial |

**Programas de Ayuda en Texas:**
- **TSAHC (Texas State Affordable Housing):** Hasta $15,000 de ayuda para enganche
- **Hometown Heroes:** 0.25% descuento en tasa para maestros, bomberos, policías, enfermeras, etc.
- **My First Texas Home:** Préstamos con tasa baja para primeros compradores

**Comparación de Enganche (casa de $${targetPrice2.toLocaleString()}):**

| Enganche | Monto | Préstamo | PMI/Mes | Pago Total/Mes* |
|----------|-------|----------|---------|-----------------|
| 3% | $${downPayment3pct.toLocaleString()} | $${(targetPrice2-downPayment3pct).toLocaleString()} | ~$${pmi3pct.toLocaleString()} | ~$X,XXX |
| 5% | $${downPayment5pct.toLocaleString()} | $${(targetPrice2-downPayment5pct).toLocaleString()} | ~$XXX | ~$X,XXX |
| 10% | $${downPayment10pct.toLocaleString()} | $${(targetPrice2-downPayment10pct).toLocaleString()} | ~$XXX | ~$X,XXX |
| 20% | $${downPayment20pct.toLocaleString()} | $${(targetPrice2-downPayment20pct).toLocaleString()} | $0 (sin PMI) | ~$X,XXX |

*Estimado con tasa ~6.75%, incluye impuestos y seguro

**Próximos Pasos:**
1. Tomar curso de educación para compradores (8 horas, ~$75)
2. Solicitar pre-aprobación con 3 prestamistas
3. Aplicar a TSAHC si calificas
4. Comparar tasas y programas

Usa palabras simples. Explica beneficios de cada programa.`
              : `You are a Texas mortgage loan expert. Write comprehensive loan options analysis (3rd grade level).

BUYER INFORMATION:
- Credit score: ${creditScore}
- Target price: $${targetPrice2.toLocaleString()}
- Planned down payment: ${downPaymentPct2}% ($${Math.round(targetPrice2 * downPaymentPct2/100).toLocaleString()})
- First-time buyer: ${isFirstTime ? 'Yes' : 'No'}
- Military/Veteran: ${isMilitary ? 'Yes' : 'No'}

GENERATE THIS ANALYSIS (maximum 300 words):

## 🏦 Loan Options

**Best Program for You:** [Recommend best based on profile]

**Program Comparison:**

| Program | Min Down Payment | PMI/MIP | Credit Score | Best For |
|---------|------------------|---------|--------------|----------|
| Conventional 97 | 3% ($${downPayment3pct.toLocaleString()}) | ~$${pmi3pct.toLocaleString()}/month | 620+ | First-time, good credit |
| FHA | 3.5% ($${downPayment3_5pct.toLocaleString()}) | ~$XXX/month (permanent) | 580+ | Lower credit |
| VA Loan | 0% ($0) | No PMI | N/A | Military/veterans only |
| Conventional 95 | 5% ($${downPayment5pct.toLocaleString()}) | ~$XXX/month (lower) | 620+ | More savings |

**Texas Assistance Programs:**
- **TSAHC (Texas State Affordable Housing):** Up to $15,000 down payment help
- **Hometown Heroes:** 0.25% rate discount for teachers, firefighters, police, nurses, etc.
- **My First Texas Home:** Low-rate loans for first-time buyers

**Down Payment Comparison (for $${targetPrice2.toLocaleString()} home):**

| Down Payment | Amount | Loan Size | PMI/Month | Total Payment/Month* |
|--------------|--------|-----------|-----------|----------------------|
| 3% | $${downPayment3pct.toLocaleString()} | $${(targetPrice2-downPayment3pct).toLocaleString()} | ~$${pmi3pct.toLocaleString()} | ~$X,XXX |
| 5% | $${downPayment5pct.toLocaleString()} | $${(targetPrice2-downPayment5pct).toLocaleString()} | ~$XXX | ~$X,XXX |
| 10% | $${downPayment10pct.toLocaleString()} | $${(targetPrice2-downPayment10pct).toLocaleString()} | ~$XXX | ~$X,XXX |
| 20% | $${downPayment20pct.toLocaleString()} | $${(targetPrice2-downPayment20pct).toLocaleString()} | $0 (no PMI) | ~$X,XXX |

*Estimated at ~6.75% rate, includes taxes and insurance

**Next Steps:**
1. Take homebuyer education course (8 hours, ~$75)
2. Get pre-approved with 3 lenders
3. Apply for TSAHC if you qualify
4. Compare rates and programs

Use simple words. Explain benefits of each program.`

            // Use Flash model for faster program comparison, disable grounding
            const LOAN_OPTIONS_TOKEN_LIMIT = 1000 // ~300 words
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, loanPrompt, LOAN_OPTIONS_TOKEN_LIMIT, MODELS.loanOptions)) {
              totalChunks++
              sectionContents.loanOptions += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'loanOptions',
                content: chunk
              })}\n\n`))
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'loanOptions',
              content: sectionContents.loanOptions
            })}\n\n`))

          } catch (error) {
            console.error('Error generating loan options section:', error)
          }

          // SECTION 3: Location & Priorities
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'location',
              title: locale === 'es' ? '📍 Ubicación y Prioridades' : '📍 Location & Priorities',
              sectionNumber: 3,
              totalSections: 4
            })}\n\n`))

            const city = fullPlanInput.userProfile.location.preferredCity || wizardData.city || 'the area'
            const state = fullPlanInput.userProfile.location.preferredState || 'TX'
            const zipCode = wizardData.zipCode || ''
            const homeType = fullPlanInput.userProfile.location.homeType || 'house'
            const targetPrice3 = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
            const locationPriorities = wizardData.locationPriority || []

            // Austin metro market data (hardcoded for common cities - can be enhanced with API later)
            const marketData: Record<string, { median: number, alternatives: string[], taxRate: number }> = {
              'Round Rock': { median: 475000, alternatives: ['Pflugerville', 'Hutto', 'Manor'], taxRate: 2.2 },
              'Austin': { median: 550000, alternatives: ['Pflugerville', 'Round Rock', 'Buda'], taxRate: 2.1 },
              'Pflugerville': { median: 375000, alternatives: ['Hutto', 'Manor', 'Round Rock'], taxRate: 2.3 },
              'Cedar Park': { median: 485000, alternatives: ['Leander', 'Liberty Hill', 'Hutto'], taxRate: 2.2 },
              'Leander': { median: 425000, alternatives: ['Liberty Hill', 'Georgetown', 'Cedar Park'], taxRate: 2.1 },
              'Georgetown': { median: 450000, alternatives: ['Hutto', 'Leander', 'Round Rock'], taxRate: 2.3 },
              'Hutto': { median: 340000, alternatives: ['Manor', 'Taylor', 'Pflugerville'], taxRate: 2.4 },
              'Manor': { median: 320000, alternatives: ['Pflugerville', 'Hutto', 'Elgin'], taxRate: 2.3 }
            }

            const cityData = marketData[city] || { median: 400000, alternatives: ['surrounding areas'], taxRate: 2.2 }
            const medianPrice = cityData.median
            const alternatives = cityData.alternatives
            const taxRate = cityData.taxRate

            // Calculate monthly costs
            const monthlyPropertyTax = Math.round((targetPrice3 * taxRate / 100) / 12)
            const monthlyInsurance = Math.round((targetPrice3 * 0.005) / 12)
            const monthlyMaintenance = Math.round((targetPrice3 * 0.01) / 12)
            const monthlyUtilities = 250

            const locationPrompt = locale === 'es'
              ? `Eres un experto en bienes raíces del área de Austin, Texas. Escribe análisis completo del mercado local (nivel tercer grado).

INFORMACIÓN DE UBICACIÓN:
- Ciudad objetivo: ${city}, ${state} ${zipCode}
- Presupuesto: $${targetPrice3.toLocaleString()}
- Precio mediano en ${city}: $${medianPrice.toLocaleString()}
- Diferencia: ${targetPrice3 < medianPrice ? `BAJO por $${(medianPrice - targetPrice3).toLocaleString()}` : `dentro del rango`}
- Prioridades: ${locationPriorities.join(', ') || 'No especificado'}

GENERA ESTE ANÁLISIS (máximo 350 palabras):

## 📍 Ubicación y Realidad del Mercado

**Realidad del Mercado en ${city}:**
- Precio mediano actual: $${medianPrice.toLocaleString()}
- Tu presupuesto: $${targetPrice3.toLocaleString()}
- ${targetPrice3 < medianPrice ? `⚠️ Tu presupuesto está ${Math.round(((medianPrice - targetPrice3) / medianPrice) * 100)}% bajo el precio mediano` : `✅ Tu presupuesto está dentro del mercado`}

**Qué Puedes Comprar por $${targetPrice3.toLocaleString()} en ${city}:**
[Describe tipo de propiedades, tamaño, condición, competencia esperada]

**Alternativas con Mejor Valor:**

| Ciudad | Precio Mediano | Diferencia | Tiempo a Austin | Ventajas |
|--------|----------------|------------|-----------------|----------|
| ${alternatives[0]} | $XXX,XXX | -X% | XX min | [Ventajas] |
| ${alternatives[1]} | $XXX,XXX | -X% | XX min | [Ventajas] |
| ${alternatives[2]} | $XXX,XXX | -X% | XX min | [Ventajas] |

**Vecindarios Recomendados en ${city}:**
${locationPriorities.includes('schools') ? '[Enfoque en buenas escuelas]' : ''}
${locationPriorities.includes('commute') ? '[Enfoque en commute corto]' : ''}
${locationPriorities.includes('safety') ? '[Enfoque en seguridad]' : ''}
[Lista 2-3 vecindarios con calificación de escuelas si relevante]

**Costos Mensuales MÁS ALLÁ del Pago de Hipoteca:**
- Impuestos de propiedad: ~$${monthlyPropertyTax.toLocaleString()}/mes (${taxRate}% anual)
- Seguro de casa: ~$${monthlyInsurance.toLocaleString()}/mes
- HOA (si aplica): $50-300/mes
- Servicios públicos: ~$${monthlyUtilities}/mes
- Mantenimiento: ~$${monthlyMaintenance.toLocaleString()}/mes (1% del valor)
- **TOTAL EXTRA:** ~$${(monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyUtilities).toLocaleString()}-${(monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyUtilities + 300).toLocaleString()}/mes

**Consejo de Mercado:**
[Incluye: competencia (múltiples ofertas?), tiempo en mercado, mejor temporada para comprar, estrategias]

Usa palabras simples. Sé honesto sobre el mercado.`
              : `You are an Austin, Texas area real estate expert. Write comprehensive local market analysis (3rd grade level).

LOCATION INFORMATION:
- Target city: ${city}, ${state} ${zipCode}
- Budget: $${targetPrice3.toLocaleString()}
- Median price in ${city}: $${medianPrice.toLocaleString()}
- Gap: ${targetPrice3 < medianPrice ? `BELOW by $${(medianPrice - targetPrice3).toLocaleString()}` : `within range`}
- Priorities: ${locationPriorities.join(', ') || 'Not specified'}

GENERATE THIS ANALYSIS (maximum 350 words):

## 📍 Location & Market Reality

**Market Reality in ${city}:**
- Current median price: $${medianPrice.toLocaleString()}
- Your budget: $${targetPrice3.toLocaleString()}
- ${targetPrice3 < medianPrice ? `⚠️ Your budget is ${Math.round(((medianPrice - targetPrice3) / medianPrice) * 100)}% below median` : `✅ Your budget is within market range`}

**What You Can Buy for $${targetPrice3.toLocaleString()} in ${city}:**
[Describe property types, size, condition, expected competition]

**Better Value Alternatives:**

| City | Median Price | Difference | Time to Austin | Advantages |
|------|--------------|------------|----------------|------------|
| ${alternatives[0]} | $XXX,XXX | -X% | XX min | [Benefits] |
| ${alternatives[1]} | $XXX,XXX | -X% | XX min | [Benefits] |
| ${alternatives[2]} | $XXX,XXX | -X% | XX min | [Benefits] |

**Recommended Neighborhoods in ${city}:**
${locationPriorities.includes('schools') ? '[Focus on good schools]' : ''}
${locationPriorities.includes('commute') ? '[Focus on short commute]' : ''}
${locationPriorities.includes('safety') ? '[Focus on safety]' : ''}
[List 2-3 neighborhoods with school ratings if relevant]

**Monthly Costs BEYOND Mortgage Payment:**
- Property taxes: ~$${monthlyPropertyTax.toLocaleString()}/month (${taxRate}% annual)
- Home insurance: ~$${monthlyInsurance.toLocaleString()}/month
- HOA (if applicable): $50-300/month
- Utilities: ~$${monthlyUtilities}/month
- Maintenance: ~$${monthlyMaintenance.toLocaleString()}/month (1% of value)
- **TOTAL EXTRA:** ~$${(monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyUtilities).toLocaleString()}-${(monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyUtilities + 300).toLocaleString()}/month

**Market Advice:**
[Include: competition (multiple offers?), days on market, best season to buy, strategies]

Use simple words. Be honest about the market.`

            // Use Flash model for faster market data lookup, disable grounding
            const LOCATION_TOKEN_LIMIT = 1200 // ~350 words
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, locationPrompt, LOCATION_TOKEN_LIMIT, MODELS.location)) {
              totalChunks++
              sectionContents.location += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'location',
                content: chunk
              })}\n\n`))
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'location',
              content: sectionContents.location
            })}\n\n`))

          } catch (error) {
            console.error('Error generating location section:', error)
          }

          // SECTION 4: Disclaimer (Static - No AI needed)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-start',
            section: 'disclaimer',
            title: locale === 'es' ? '⚠️ Avisos Importantes' : '⚠️ Important Disclaimers',
            sectionNumber: 4,
            totalSections: 4
          })}\n\n`))

          const disclaimerText = locale === 'es'
            ? `## ⚠️ Avisos Importantes

**Aviso Legal:** Este reporte es únicamente para fines educativos e informativos. No constituye asesoramiento financiero, legal o de inversión. Las estimaciones proporcionadas son aproximaciones basadas en la información que usted proporcionó y las condiciones actuales del mercado.

**Consulte con Profesionales Licenciados:**
- **Prestamista Hipotecario:** Para obtener aprobación previa y tasas de interés exactas.
- **Agente de Bienes Raíces con Licencia TREC:** Para representación profesional en transacciones inmobiliarias.
- **Asesor Financiero Certificado:** Para planificación financiera personalizada.
- **Abogado de Bienes Raíces:** Para revisión de contratos y cuestiones legales.

**Limitaciones de Responsabilidad:**
- Las cifras presentadas son estimaciones y pueden variar significativamente.
- Las tasas de interés, programas de préstamos y requisitos cambian frecuentemente.
- Los costos reales de cierre, impuestos y seguros dependen de múltiples factores.
- Los valores de las propiedades fluctúan según las condiciones del mercado.

**Información de TREC (Texas Real Estate Commission):**
Este reporte fue generado por una herramienta digital proporcionada por un agente con licencia TREC. Para presentar una queja o buscar información adicional sobre licencias de bienes raíces en Texas, visite www.trec.texas.gov o llame al 1-800-250-8732.`
            : `## ⚠️ Important Disclaimers

**Legal Notice:** This report is for educational and informational purposes only. It does not constitute financial, legal, or investment advice. The estimates provided are approximations based on the information you supplied and current market conditions.

**Consult Licensed Professionals:**
- **Mortgage Lender:** For pre-approval and exact interest rates.
- **TREC-Licensed Real Estate Agent:** For professional representation in real estate transactions.
- **Certified Financial Advisor:** For personalized financial planning.
- **Real Estate Attorney:** For contract review and legal matters.

**Limitations of Liability:**
- The figures presented are estimates and may vary significantly.
- Interest rates, loan programs, and requirements change frequently.
- Actual closing costs, taxes, and insurance depend on multiple factors.
- Property values fluctuate based on market conditions.

**TREC (Texas Real Estate Commission) Information:**
This report was generated by a digital tool provided by a TREC-licensed agent. To file a complaint or seek additional information about real estate licensing in Texas, visit www.trec.texas.gov or call 1-800-250-8732.`

          sectionContents.disclaimer = disclaimerText

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-chunk',
            section: 'disclaimer',
            content: disclaimerText
          })}\n\n`))

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-complete',
            section: 'disclaimer',
            content: disclaimerText
          })}\n\n`))

          const accumulatedContent = Object.values(sectionContents).join('\n\n---\n\n')
          console.log(`✅ Wizard Streaming API: Generated ${totalChunks} chunks across 4 sections, ${accumulatedContent.length} total characters`)

          // Generate structured response based on wizard data (not privacy-safe since it stays server-side)
          const structuredResponse = {
            id: `wizard-report-${Date.now()}`,
            userId: contactInfo.email,
            language: locale,
            estimatedPrice: Math.round((wizardData.annualIncome || 0) * 3.5),
            maxAffordable: Math.round((wizardData.targetPrice || wizardData.monthlyBudget ? (wizardData.monthlyBudget || 0) * 166 : 300000) * 0.9),
            monthlyPayment: Math.round(((wizardData.annualIncome || 0) / 12) * 0.28),
            programFit: determineEligiblePrograms(wizardData),
            actionPlan: generateActionPlan(wizardData),
            tips: generatePersonalizedTips(wizardData),
            primaryLeadType: wizardData.buyerType?.includes('first-time') ? 'First-Time Buyer' : 'Experienced Buyer',
            reportContent: accumulatedContent,
            aiGenerated: true,
            // Include contact info for CRM integration (server-side only)
            contactInfo: {
              firstName: contactInfo.firstName,
              lastName: contactInfo.lastName,
              email: contactInfo.email,
              phone: contactInfo.phone
            }
          }

          // Send completion event with structured data
          const completeEvent = `data: ${JSON.stringify({
            type: 'complete',
            structured: structuredResponse,
            fullMarkdown: accumulatedContent,
            totalChunks: totalChunks,
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(completeEvent))

          console.log(`✅ Wizard Streaming API: Completed successfully with ${totalChunks} chunks for locale "${locale}"`)

        } catch (error) {
          console.error('❌ Wizard Streaming API: Error occurred:', error)

          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown streaming error',
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(errorEvent))

        } finally {
          // Close the stream
          controller.close()
        }
      }
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('❌ Wizard Streaming API: Request setup failed:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Helper functions to generate structured response based on wizard data
function determineEligiblePrograms(wizardData: WizardData): string[] {
  const programs: string[] = []

  if (wizardData.buyerType?.includes('first-time')) {
    programs.push('First-Time Buyer Programs', 'FHA Loan')
  }

  const income = wizardData.annualIncome || 0
  const creditScore = parseInt(wizardData.creditScore || '0') || 0

  if (creditScore >= 620) {
    programs.push('Conventional Loan')
  }

  if (income < 80000) {
    programs.push('USDA Rural Development', 'State Housing Programs')
  }

  programs.push('VA Loan') // Could be conditional based on military status if collected

  return programs.length > 0 ? programs : ['FHA Loan', 'Conventional Loan']
}

function generateActionPlan(wizardData: WizardData): string[] {
  const timeline = wizardData.timeline || 'within-year'
  const firstTime = wizardData.buyerType?.includes('first-time')

  if (timeline === 'immediate' || timeline === 'within-3-months') {
    return [
      'Get pre-approved for a mortgage immediately',
      'Connect with a real estate agent today',
      'Start active house hunting',
      'Prepare for multiple offers in competitive market',
      'Schedule inspections quickly',
      'Be ready for fast closing'
    ]
  }

  if (firstTime) {
    return [
      'Take a first-time homebuyer course',
      'Improve credit score if needed',
      'Save for down payment and closing costs',
      'Get pre-approved for a mortgage',
      'Find an experienced buyer\'s agent',
      'Start house hunting with clear criteria'
    ]
  }

  return [
    'Get pre-approved for a mortgage',
    'Find a qualified real estate agent',
    'Define your home search criteria',
    'Start house hunting in your preferred areas',
    'Make competitive offers',
    'Complete inspections and close'
  ]
}

function generatePersonalizedTips(wizardData: WizardData): string[] {
  const tips: string[] = []
  const creditScore = parseInt(wizardData.creditScore || '0') || 0
  const firstTime = wizardData.buyerType?.includes('first-time')

  if (creditScore < 700) {
    tips.push('Work on improving your credit score for better rates')
  }

  if (firstTime) {
    tips.push('Take advantage of first-time buyer programs and grants')
    tips.push('Budget for unexpected homeownership costs')
  }

  tips.push('Shop around with multiple lenders for the best rates')
  tips.push('Get a professional home inspection')
  tips.push('Consider the total cost of homeownership including taxes and insurance')

  return tips
}