import { NextRequest } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import { createPrivacySafePlanInput, type WizardData, type ContactInfo } from '@/lib/services/ai-service'
import type { PrivacySafePlanGenerationInput } from '@/validators/planning-schemas'
import type { Locale } from '@/lib/i18n'
import { getGeminiConfig } from '@/lib/env'
import { classifyLead, getLeadTypeDescription } from '@/lib/services/lead-classifier'
import { buildSectionPrompts } from '@/lib/services/prompt-builder'

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
            grants: '',
            disclaimer: ''
          }

          // MODEL SELECTION STRATEGY: Now configurable via environment variables!
          // - Financial Analysis: Use Pro (complex calculations, DTI, cash needed)
          // - Loan Options: Use Flash (program comparison, faster by 3x)
          // - Location: Use Flash (market data lookup, faster by 3x)
          // Expected performance: 45s -> ~25s (45% faster)

          const geminiConfig = getGeminiConfig()
          const MODELS = geminiConfig.models
          const TOKEN_LIMITS = geminiConfig.maxOutputTokens
          const GROUNDING = geminiConfig.grounding

          console.log(`🎯 Multi-model strategy (ENV configured):`, {
            financial: MODELS.financial,
            loanOptions: MODELS.loanOptions,
            location: MODELS.location,
            parallelEnabled: geminiConfig.enableParallelGeneration,
            grounding: GROUNDING
          })

          // ============================================
          // STEP 2: BUILD CUSTOM PROMPTS FOR LEAD TYPE
          // ============================================
          const customPrompts = buildSectionPrompts(leadProfile, wizardData)
          console.log(`📝 Custom prompts generated for ${leadProfile.leadType}`)
          console.log(`   Financial prompt length: ${customPrompts.financial.length} chars`)
          console.log(`   Loan prompt length: ${customPrompts.loanOptions.length} chars`)
          console.log(`   Location prompt length: ${customPrompts.location.length} chars`)

          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            message: locale === 'es' ? 'Generando tu reporte personalizado...' : 'Generating your personalized report...',
            totalSections: 5
          })}\n\n`))

          // Performance monitoring
          const sectionMetrics: Record<string, { start: number; end: number; tokens: number; model: string }> = {
            financial: { start: 0, end: 0, tokens: 0, model: MODELS.financial },
            loanOptions: { start: 0, end: 0, tokens: 0, model: MODELS.loanOptions },
            location: { start: 0, end: 0, tokens: 0, model: MODELS.location },
          }
          const overallStartTime = performance.now()

          // Check if parallel generation is enabled
          if (geminiConfig.enableParallelGeneration) {
            console.log('⚡ PARALLEL GENERATION ENABLED - Processing all sections concurrently...')

            // Generate all sections in parallel
            const [financialResult, loanResult, locationResult] = await Promise.allSettled([
              // Financial Section
              (async () => {
                sectionMetrics.financial.start = performance.now()
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'section-start',
                  section: 'financial',
                  title: locale === 'es' ? '💰 Análisis Financiero' : '💰 Financial Analysis',
                  sectionNumber: 1,
                  totalSections: 5
                })}\n\n`))

                // Use custom financial prompt from lead classification
                let content = ''
                for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.financial, customPrompts.financial, TOKEN_LIMITS.financial, MODELS.financial)) {
                  content += chunk
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-chunk', section: 'financial', content: chunk })}\n\n`))
                }

                sectionMetrics.financial.end = performance.now()
                sectionMetrics.financial.tokens = content.length
                sectionContents.financial = content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-complete', section: 'financial', content })}\n\n`))
                return content
              })(),

              // Loan Options Section
              (async () => {
                sectionMetrics.loanOptions.start = performance.now()
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'section-start',
                  section: 'loanOptions',
                  title: locale === 'es' ? '🏦 Opciones de Préstamo' : '🏦 Loan Options',
                  sectionNumber: 2,
                  totalSections: 5
                })}\n\n`))

                // Use custom loan options prompt from lead classification
                let content = ''
                for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.loans, customPrompts.loanOptions, TOKEN_LIMITS.loans, MODELS.loanOptions)) {
                  content += chunk
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-chunk', section: 'loanOptions', content: chunk })}\n\n`))
                }

                sectionMetrics.loanOptions.end = performance.now()
                sectionMetrics.loanOptions.tokens = content.length
                sectionContents.loanOptions = content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-complete', section: 'loanOptions', content })}\n\n`))
                return content
              })(),

              // Location Section
              (async () => {
                sectionMetrics.location.start = performance.now()
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'section-start',
                  section: 'location',
                  title: locale === 'es' ? '📍 Ubicación y Prioridades' : '📍 Location & Priorities',
                  sectionNumber: 3,
                  totalSections: 5
                })}\n\n`))

                // Use custom location prompt from lead classification
                let content = ''
                for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.location, customPrompts.location, TOKEN_LIMITS.location, MODELS.location)) {
                  content += chunk
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-chunk', section: 'location', content: chunk })}\n\n`))
                }

                sectionMetrics.location.end = performance.now()
                sectionMetrics.location.tokens = content.length
                sectionContents.location = content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'section-complete', section: 'location', content })}\n\n`))
                return content
              })()
            ])

            // Process results
            if (financialResult.status === 'fulfilled') totalChunks += sectionContents.financial.length
            if (loanResult.status === 'fulfilled') totalChunks += sectionContents.loanOptions.length
            if (locationResult.status === 'fulfilled') totalChunks += sectionContents.location.length

            const overallEndTime = performance.now()
            console.log(`📊 PARALLEL GENERATION COMPLETE:`, {
              totalTime: `${((overallEndTime - overallStartTime) / 1000).toFixed(2)}s`,
              financial: `${((sectionMetrics.financial.end - sectionMetrics.financial.start) / 1000).toFixed(2)}s (${sectionMetrics.financial.tokens} chars)`,
              loans: `${((sectionMetrics.loanOptions.end - sectionMetrics.loanOptions.start) / 1000).toFixed(2)}s (${sectionMetrics.loanOptions.tokens} chars)`,
              location: `${((sectionMetrics.location.end - sectionMetrics.location.start) / 1000).toFixed(2)}s (${sectionMetrics.location.tokens} chars)`,
              speedup: 'Estimated 60% faster than sequential'
            })

          } else {
            console.log('⏭️  SEQUENTIAL GENERATION (set GEMINI_ENABLE_PARALLEL_GENERATION=true for 60% speedup)')

            // SECTION 1: Financial Analysis (SEQUENTIAL FALLBACK)
          try {
            sectionMetrics.financial.start = performance.now()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'financial',
              title: locale === 'es' ? '💰 Análisis Financiero' : '💰 Financial Analysis',
              sectionNumber: 1,
              totalSections: 4
            })}\n\n`))

            // Use custom financial prompt from lead classification (SEQUENTIAL MODE)
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.financial, customPrompts.financial, TOKEN_LIMITS.financial, MODELS.financial)) {
              totalChunks++
              sectionContents.financial += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'financial',
                content: chunk
              })}\n\n`))
            }

            sectionMetrics.financial.end = performance.now()
            sectionMetrics.financial.tokens = sectionContents.financial.length

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'financial',
              content: sectionContents.financial
            })}\n\n`))

            console.log(`⏱️  Financial: ${((sectionMetrics.financial.end - sectionMetrics.financial.start) / 1000).toFixed(2)}s`)

          } catch (error) {
            console.error('Error generating financial section:', error)
          }

          // SECTION 2: Loan Options
          try {
            sectionMetrics.loanOptions.start = performance.now()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'loanOptions',
              title: locale === 'es' ? '🏦 Opciones de Préstamo' : '🏦 Loan Options',
              sectionNumber: 2,
              totalSections: 4
            })}\n\n`))

            // Use custom loan options prompt from lead classification (SEQUENTIAL MODE)
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.loans, customPrompts.loanOptions, TOKEN_LIMITS.loans, MODELS.loanOptions)) {
              totalChunks++
              sectionContents.loanOptions += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'loanOptions',
                content: chunk
              })}\n\n`))
            }

            sectionMetrics.loanOptions.end = performance.now()
            sectionMetrics.loanOptions.tokens = sectionContents.loanOptions.length

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'loanOptions',
              content: sectionContents.loanOptions
            })}\n\n`))

            console.log(`⏱️  Loan Options: ${((sectionMetrics.loanOptions.end - sectionMetrics.loanOptions.start) / 1000).toFixed(2)}s`)

          } catch (error) {
            console.error('Error generating loan options section:', error)
          }

          // SECTION 3: Location & Priorities
          try {
            sectionMetrics.location.start = performance.now()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-start',
              section: 'location',
              title: locale === 'es' ? '📍 Ubicación y Prioridades' : '📍 Location & Priorities',
              sectionNumber: 3,
              totalSections: 4
            })}\n\n`))

            // Use custom location prompt from lead classification (SEQUENTIAL MODE)
            for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, GROUNDING.location, customPrompts.location, TOKEN_LIMITS.location, MODELS.location)) {
              totalChunks++
              sectionContents.location += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'section-chunk',
                section: 'location',
                content: chunk
              })}\n\n`))
            }

            sectionMetrics.location.end = performance.now()
            sectionMetrics.location.tokens = sectionContents.location.length

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'section-complete',
              section: 'location',
              content: sectionContents.location
            })}\n\n`))

            console.log(`⏱️  Location: ${((sectionMetrics.location.end - sectionMetrics.location.start) / 1000).toFixed(2)}s`)

          } catch (error) {
            console.error('Error generating location section:', error)
          }

          // Log sequential performance
          const overallEndTime = performance.now()
          console.log(`📊 SEQUENTIAL GENERATION COMPLETE:`, {
            totalTime: `${((overallEndTime - overallStartTime) / 1000).toFixed(2)}s`,
            financial: `${((sectionMetrics.financial.end - sectionMetrics.financial.start) / 1000).toFixed(2)}s`,
            loans: `${((sectionMetrics.loanOptions.end - sectionMetrics.loanOptions.start) / 1000).toFixed(2)}s`,
            location: `${((sectionMetrics.location.end - sectionMetrics.location.start) / 1000).toFixed(2)}s`
          })
          } // End sequential else block

          // SECTION 4: Down Payment Assistance & Grants (Location-aware)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-start',
            section: 'grants',
            title: locale === 'es' ? '💰 Ayuda para Enganche' : '💰 Down Payment Assistance',
            sectionNumber: 4,
            totalSections: 5
          })}\n\n`))

          const city = fullPlanInput.userProfile.location.preferredCity || wizardData.city || 'Austin'
          const targetPrice = wizardData.targetPrice || Math.round(fullPlanInput.userProfile.incomeDebt.annualIncome * 3.5)
          const income = fullPlanInput.userProfile.incomeDebt.annualIncome
          const isFirstTime = fullPlanInput.preferences.buyerSpecialization?.isFirstTimeBuyer || false
          const isMilitary = fullPlanInput.preferences.buyerSpecialization?.isMilitaryVeteran || false
          const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore

          const downPaymentNeeded = Math.round(targetPrice * 0.03)
          const withGrantAssistance = Math.round(downPaymentNeeded - 10000)
          const monthlySavings = Math.round((10000 * 0.07) / 12)

          const grantsText = locale === 'es'
            ? `## 💰 Ayuda para Enganche

Tu casa de $${targetPrice.toLocaleString()} necesita $${downPaymentNeeded.toLocaleString()} de enganche al 3%. Pero hay $10,000-$15,000 disponibles en ayuda que NADIE usa.

## Tu Dinero Gratis

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

## Pasos Siguientes Recomendados

1. **Investigue directamente** - Visite los sitios web de cada programa para requisitos actuales
2. **Consulte con profesionales** - Hable con prestamistas hipotecarios sobre compatibilidad de programas
3. **Tome el curso requerido** - La mayoría requiere educación para compradores de vivienda
4. **Aplique temprano** - Muchos programas tienen fondos limitados

**Descargo de Responsabilidad:** Los requisitos de elegibilidad, montos de asistencia y disponibilidad de fondos cambian frecuentemente. Esta información puede estar desactualizada. Siempre verifique directamente con cada programa antes de tomar decisiones financieras.

**Consulta Profesional Requerida:** Para orientación específica sobre cuáles programas pueden aplicar a su situación, consulte con un prestamista hipotecario licenciado y un agente de bienes raíces con licencia TREC.`

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

          sectionContents.grants = grantsText

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-chunk',
            section: 'grants',
            content: grantsText
          })}\n\n`))

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-complete',
            section: 'grants',
            content: grantsText
          })}\n\n`))

          // SECTION 5: Disclaimer (Static - No AI needed)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'section-start',
            section: 'disclaimer',
            title: locale === 'es' ? '⚠️ Avisos Importantes' : '⚠️ Important Disclaimers',
            sectionNumber: 5,
            totalSections: 5
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