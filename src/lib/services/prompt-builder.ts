/**
 * Prompt Builder Service - LEAD MAGNET OPTIMIZED
 *
 * Generates customized AI prompts based on lead classification.
 * Uses template system following Hook→Value→Gap→CTA lead magnet formula.
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

// ============================================
// LEAD MAGNET FORMULA COMPONENTS
// ============================================

/**
 * Reusable CTA components for consistent conversion elements
 */
const CTA_COMPONENTS = {
  phone: '(512) 412-2352',
  sullySignature: {
    en: '- Sully Ruiz, REALTOR®\nKeller Williams Austin NW',
    es: '- Sully Ruiz, REALTOR®\nKeller Williams Austin NW'
  },
  urgency: {
    en: (city: string) => `In ${city}, homes at your price point are selling in 8-12 days average. Let's get you positioned to win.`,
    es: (city: string) => `En ${city}, casas en tu rango de precio se venden en promedio 8-12 días. Vamos a posicionarte para ganar.`
  },
  socialProof: {
    en: 'I've helped 200+ Austin-area families find their homes',
    es: 'He ayudado a más de 200 familias en el área de Austin a encontrar sus hogares'
  }
}

/**
 * Strategic "gap" patterns - what we can't show in the report
 */
const GAP_PATTERNS = {
  listings: {
    en: '- Homes hitting the market 7-10 days before they go live on Zillow',
    es: '- Casas que llegan al mercado 7-10 días antes de aparecer en Zillow'
  },
  lenderConnections: {
    en: '- Which 2 lenders actually LOVE buyers in your situation (vs just tolerate)',
    es: '- Cuáles 2 prestamistas realmente AMAN compradores en tu situación (vs solo tolerar)'
  },
  negotiation: {
    en: '- The 3 offer strategies that won my last 12 deals in competitive situations',
    es: '- Las 3 estrategias de oferta que ganaron mis últimas 12 negociaciones competitivas'
  }
}

// ============================================
// FINANCIAL ANALYSIS PROMPT TEMPLATES
// ============================================

const financialPromptTemplates: Record<LeadType, (ctx: PromptContext) => string> = {

  // ==================== ITIN BORROWERS ====================

  [LeadType.ITIN_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
REPORTE LEAD MAGNET para comprador ITIN primera vez - Sully Ruiz, Experto Austin

PERFIL DEL COMPRADOR:
- Ingreso mensual: $${ctx.monthlyIncome.toLocaleString()}
- Deudas mensuales: $${ctx.monthlyDebts.toLocaleString()}
- DTI actual: ${ctx.currentDTI}%
- Crédito: ${ctx.creditScore}
- Enganche: ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()})
- Ciudad objetivo: ${ctx.city}, TX

IMPORTANTE: Comprador ITIN - SOLO préstamos portfolio (10-20% enganche), NO FHA.

FORMATO REQUERIDO (LEAD MAGNET):

**1. TU VENTAJA ITIN** (Hook - 2-3 oraciones):
"¡Buenas noticias! Con ${ctx.downPayment}% de enganche ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()}) y crédito ${ctx.creditScore}, estás en mejor posición que el 60% de compradores ITIN que veo. He cerrado 15 préstamos ITIN en el área de Austin este año - SÍ se puede comprar casa con ITIN."

**2. TU PODER DE COMPRA REAL** (Value):
Con $${ctx.monthlyIncome.toLocaleString()}/mes de ingreso y ${ctx.downPayment}% de enganche, calificas para casas de $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}.

Aquí está tu realidad ITIN (no lo que otros agentes te dirán):
- ❌ FHA/VA/Conventional: Requieren SSN (no eres elegible)
- ✅ Préstamos Portfolio ITIN: Tu ÚNICA opción (pero es BUENA)
- Enganche: 10-20% (tú tienes ${ctx.downPayment}% ✓)
- Tasas: 7.0-8.5% (0.5-1.5% más que conventional, pero obtienes la casa)
- Procesamiento: 45-60 días

**3. TABLA DE COMPARACIÓN** (3 escenarios):
| Precio Casa | Pago Mensual (7.5%) | Efectivo Necesario | DTI Resultante |
|-------------|---------------------|-------------------|----------------|
| $${Math.round(ctx.targetPrice * 0.9).toLocaleString()} | ~$${Math.round((ctx.targetPrice * 0.9 * 0.9 * 0.00699) + (ctx.targetPrice * 0.9 * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * 0.9 * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 0.9 * 0.9 * 0.00699) + (ctx.targetPrice * 0.9 * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |
| $${ctx.targetPrice.toLocaleString()} | ~$${Math.round((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |
| $${Math.round(ctx.targetPrice * 1.1).toLocaleString()} | ~$${Math.round((ctx.targetPrice * 1.1 * 0.9 * 0.00699) + (ctx.targetPrice * 1.1 * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * 1.1 * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 1.1 * 0.9 * 0.00699) + (ctx.targetPrice * 1.1 * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |

**4. POR QUÉ LOS PRESTAMISTAS TE AMARÁN** (Proof):
- Enganche ${ctx.downPayment}% = Compromiso serio (top 40% de aplicantes ITIN)
- DTI ${ctx.currentDTI}% = Saludable (prestamistas quieren <43%)
- Crédito ${ctx.creditScore} = ${ctx.creditScore >= '680' ? 'Excelente para ITIN' : 'Aceptable, mejorará tu tasa'}
- Historial tributario = Prueba de ingresos estables

**5. LO QUE NO PUEDO MOSTRARTE AQUÍ** (Strategic Gap):
Este reporte te da el panorama, pero hay información que requiere una conversación:
${GAP_PATTERNS.lenderConnections.es}
- El paquete EXACTO de documentos que obtiene pre-aprobaciones en 48hrs (no 2 semanas)
- Cómo presentar tus declaraciones de impuestos para obtener 7.25% en lugar de 8%
- Los 3 vecindarios en ${ctx.city} donde mis clientes ITIN están construyendo equity más rápido

**6. TU PRÓXIMO PASO** (Clear CTA):
📞 Llámame o mándame mensaje esta semana: ${CTA_COMPONENTS.phone}
Te conectaré con EL prestamista correcto para tu situación (no cualquier prestamista - el que aprobó mis últimos 3 clientes ITIN en 48 horas).

${CTA_COMPONENTS.urgency.es(ctx.city)}

¡Vamos a encontrar tu casa! 🏡
${CTA_COMPONENTS.sullySignature.es}

TONO: Sully = Experto local bilingüe, 200+ familias servidas, conocimiento insider, amigo que conoce los atajos
ENFOQUE: 70% valor educativo + 30% crear necesidad de conversación
LONGITUD: 500-550 palabras
` : `
LEAD MAGNET REPORT for ITIN first-time homebuyer - Sully Ruiz, Austin Expert

BUYER PROFILE:
- Monthly income: $${ctx.monthlyIncome.toLocaleString()}
- Monthly debts: $${ctx.monthlyDebts.toLocaleString()}
- Current DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down payment: ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()})
- Target city: ${ctx.city}, TX

CRITICAL: ITIN buyer - ONLY portfolio loans (10-20% down), NOT FHA.

REQUIRED FORMAT (LEAD MAGNET):

**1. YOUR ITIN ADVANTAGE** (Hook - 2-3 sentences):
"Great news! With ${ctx.downPayment}% down ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()}) and ${ctx.creditScore} credit, you're in better shape than 60% of ITIN buyers I see. I've closed 15 ITIN loans in the Austin area this year - you CAN buy a home with ITIN."

**2. YOUR REAL BUYING POWER** (Value):
With $${ctx.monthlyIncome.toLocaleString()}/month income and ${ctx.downPayment}% down, you qualify for homes in the $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()} range.

Here's your ITIN reality (not what other agents will tell you):
- ❌ FHA/VA/Conventional: Require SSN (you're not eligible)
- ✅ ITIN Portfolio Loans: Your ONLY option (but it's a GOOD one)
- Down payment: 10-20% (you have ${ctx.downPayment}% ✓)
- Rates: 7.0-8.5% (0.5-1.5% higher than conventional, but you get the house)
- Processing: 45-60 days

**3. COMPARISON TABLE** (3 scenarios):
| Home Price | Monthly Payment (7.5%) | Cash Needed | Resulting DTI |
|------------|------------------------|-------------|---------------|
| $${Math.round(ctx.targetPrice * 0.9).toLocaleString()} | ~$${Math.round((ctx.targetPrice * 0.9 * 0.9 * 0.00699) + (ctx.targetPrice * 0.9 * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * 0.9 * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 0.9 * 0.9 * 0.00699) + (ctx.targetPrice * 0.9 * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |
| $${ctx.targetPrice.toLocaleString()} | ~$${Math.round((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |
| $${Math.round(ctx.targetPrice * 1.1).toLocaleString()} | ~$${Math.round((ctx.targetPrice * 1.1 * 0.9 * 0.00699) + (ctx.targetPrice * 1.1 * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * 1.1 * (ctx.downPayment / 100) + 8000).toLocaleString()} | ${Math.round(((ctx.targetPrice * 1.1 * 0.9 * 0.00699) + (ctx.targetPrice * 1.1 * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}% |

**4. WHY LENDERS WILL LOVE YOU** (Proof):
- ${ctx.downPayment}% down = Serious commitment (top 40% of ITIN applicants)
- ${ctx.currentDTI}% DTI = Healthy (lenders want <43%)
- ${ctx.creditScore} credit = ${ctx.creditScore >= '680' ? 'Excellent for ITIN' : 'Acceptable, will improve your rate'}
- Tax history = Proof of stable income

**5. WHAT I CAN'T SHOW YOU HERE** (Strategic Gap):
This report gives you the big picture, but there's information that requires a conversation:
${GAP_PATTERNS.lenderConnections.en}
- The EXACT document package that gets 48hr pre-approvals (not 2 weeks)
- How to present your tax returns to get 7.25% instead of 8%
- The 3 neighborhoods in ${ctx.city} where my ITIN clients are building equity fastest

**6. YOUR NEXT STEP** (Clear CTA):
📞 Call or text me this week: ${CTA_COMPONENTS.phone}
I'll connect you with THE right lender for your situation (not just any lender - the one who approved my last 3 ITIN clients in 48 hours).

${CTA_COMPONENTS.urgency.en(ctx.city)}

Let's find your home! 🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Sully = Bilingual local expert, 200+ families served, insider knowledge, friend who knows shortcuts
FOCUS: 70% educational value + 30% create need for conversation
LENGTH: 500-550 words
`,

  [LeadType.ITIN_INVESTOR]: (ctx) => ctx.locale === 'es' ? `
REPORTE LEAD MAGNET para inversionista ITIN - Sully Ruiz

PERFIL:
- Ingreso: $${ctx.monthlyIncome.toLocaleString()}/mes
- DTI: ${ctx.currentDTI}%
- Crédito: ${ctx.creditScore}
- Enganche: ${ctx.downPayment}%
- ESTRATEGIA: Propiedad de inversión con ITIN

FORMATO LEAD MAGNET:

**1. TU VENTAJA COMO INVERSIONISTA ITIN** (Hook):
"${ctx.downPayment >= 20 ? '¡Perfecto!' : 'Muy bien!'} Con ${ctx.downPayment}% de enganche, estás posicionado para inversión con ITIN. He ayudado a inversionistas ITIN a comprar 8 propiedades de renta en Austin este año - el cash flow es REAL."

**2. TU PODER DE INVERSIÓN** (Value):
A $${ctx.targetPrice.toLocaleString()}, aquí están tus números de inversión:
- Pago mensual: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- Renta esperada ${ctx.city}: $${Math.round(ctx.targetPrice * 0.006).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.008).toLocaleString()}/mes
- Cash flow estimado: $${Math.round(ctx.targetPrice * 0.007 - (ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) - (ctx.targetPrice * 0.015 / 12)).toLocaleString()}/mes
- ROI cash-on-cash: ${Math.round((ctx.targetPrice * 0.007 - (ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) - (ctx.targetPrice * 0.015 / 12)) * 12 / (ctx.targetPrice * ctx.downPayment / 100) * 100)}%

**3. REALIDAD ITIN PARA INVERSIÓN** (Education):
Préstamos ITIN para inversión requieren:
- Enganche: 20-25% mínimo (estándar industria)
- Tasas: 7.5-9% (inversión siempre más alta que residencial)
- DSCR (Debt Service Coverage Ratio): Propiedad debe generar 1.25x el pago
- Reservas: 6-12 meses PITI en banco

**4. LOS 3 MERCADOS CALIENTES** (Insider Knowledge):
Basado en mis cierres recientes de inversión:
1. ${ctx.city} - Apreciación ${ctx.city.toLowerCase().includes('austin') ? '8-12%' : '6-10%'} anual
2. [Mercado emergente] - Cap rates 7-9%
3. [Zona universitaria] - Demanda constante, baja vacancia

**5. LO QUE NO PUEDO MOSTRARTE** (Gap):
${GAP_PATTERNS.lenderConnections.es}
- Los 2 vecindarios donde propiedades están generando $400+/mes cash flow
- Estrategia de "house hacking" que mis clientes ITIN usan (viven gratis + cash flow)
- Cómo estructurar para comprar 2-3 propiedades en 18 meses

**6. PRÓXIMO PASO** (CTA):
📞 ${CTA_COMPONENTS.phone} - Hablemos esta semana
Te mostraré las 5 propiedades actuales que cumplen criterios DSCR + cash flow positivo.

${CTA_COMPONENTS.urgency.es(ctx.city)}

${CTA_COMPONENTS.sullySignature.es}

TONO: Estratégico, números reales, enfoque inversión
LONGITUD: 500-550 palabras
` : `
LEAD MAGNET REPORT for ITIN investor - Sully Ruiz

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/month
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down payment: ${ctx.downPayment}%
- STRATEGY: Investment property with ITIN

LEAD MAGNET FORMAT:

**1. YOUR ITIN INVESTOR ADVANTAGE** (Hook):
"${ctx.downPayment >= 20 ? 'Perfect!' : 'Great!'} With ${ctx.downPayment}% down, you're positioned for ITIN investment. I've helped ITIN investors buy 8 rental properties in Austin this year - the cash flow is REAL."

**2. YOUR INVESTMENT POWER** (Value):
At $${ctx.targetPrice.toLocaleString()}, here are your investment numbers:
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- Expected rent ${ctx.city}: $${Math.round(ctx.targetPrice * 0.006).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.008).toLocaleString()}/month
- Estimated cash flow: $${Math.round(ctx.targetPrice * 0.007 - (ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) - (ctx.targetPrice * 0.015 / 12)).toLocaleString()}/month
- Cash-on-cash ROI: ${Math.round((ctx.targetPrice * 0.007 - (ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0075) - (ctx.targetPrice * 0.015 / 12)) * 12 / (ctx.targetPrice * ctx.downPayment / 100) * 100)}%

**3. ITIN INVESTMENT REALITY** (Education):
ITIN loans for investment require:
- Down payment: 20-25% minimum (industry standard)
- Rates: 7.5-9% (investment always higher than residential)
- DSCR (Debt Service Coverage Ratio): Property must generate 1.25x the payment
- Reserves: 6-12 months PITI in bank

**4. THE 3 HOT MARKETS** (Insider Knowledge):
Based on my recent investment closings:
1. ${ctx.city} - ${ctx.city.toLowerCase().includes('austin') ? '8-12%' : '6-10%'} annual appreciation
2. [Emerging market] - 7-9% cap rates
3. [University area] - Consistent demand, low vacancy

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.lenderConnections.en}
- The 2 neighborhoods where properties are generating $400+/month cash flow
- "House hacking" strategy my ITIN clients use (live free + cash flow)
- How to structure to buy 2-3 properties in 18 months

**6. NEXT STEP** (CTA):
📞 ${CTA_COMPONENTS.phone} - Let's talk this week
I'll show you the 5 current properties that meet DSCR + positive cash flow criteria.

${CTA_COMPONENTS.urgency.en(ctx.city)}

${CTA_COMPONENTS.sullySignature.en}

TONE: Strategic, real numbers, investment focus
LENGTH: 500-550 words
`,

  [LeadType.ITIN_UPSIZING]: (ctx) => ctx.locale === 'es' ? `
REPORTE LEAD MAGNET para comprador ITIN cambiando a casa más grande - Sully

PERFIL:
- Ingreso: $${ctx.monthlyIncome.toLocaleString()}/mes
- DTI actual: ${ctx.currentDTI}%
- Crédito: ${ctx.creditScore}
- Enganche: ${ctx.downPayment}%
- SITUACIÓN: Compraste con ITIN, ahora quieres más grande

**1. TU VENTAJA SECRETA** (Hook):
"¡Ya tienes equity en tu casa actual - esa es tu arma secreta! Con ${ctx.downPayment}% enganche + ganancias de tu venta, puedes subir MUCHO más grande. He ayudado a 12 familias ITIN cambiar de casa en Austin este año."

**2. TU NUEVO PODER DE COMPRA** (Value):
Casa nueva de $${ctx.targetPrice.toLocaleString()}:
- Pago mensual: ~$${Math.round((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- Efectivo necesario: $${Math.round(ctx.targetPrice * (ctx.downPayment / 100) + 8000).toLocaleString()}
- Si vendes casa actual: Equity puede aumentar enganche significativamente

**3. TU ESTRATEGIA DE CAMBIO** (Education):
De tu casa actual a $${ctx.targetPrice.toLocaleString()}:
- Opción A: Vende primero (limpio, pero necesitas vivienda temporal)
- Opción B: Compra primero (riesgoso con ITIN, no recomendado)
- Opción C: Oferta contingente (mi especialidad - puedo hacerlo funcionar)

**4. POR QUÉ ${ctx.city.toUpperCase()} AHORA** (Urgency):
Mercado ${ctx.city}:
- Inventario: ${ctx.targetPrice >= 400000 ? 'BAJO' : 'Moderado'} en rango $${ctx.targetPrice.toLocaleString()}
- Competencia: ${ctx.targetPrice >= 400000 ? '3-5' : '5-8'} ofertas en mejores casas
- Tu ventaja: Prestamistas ITIN actúan rápido cuando tienes equity

**5. LO QUE NO PUEDO MOSTRARTE AQUÍ** (Gap):
${GAP_PATTERNS.listings.es}
- Cómo sincronizar venta + compra para NO mudarte dos veces
- Los 3 prestamistas que hacen programas ITIN "vende + compra" (mayoría no)
- Estrategia de negociación que ahorró $18K a mi último cliente

**6. TU PRÓXIMO PASO** (CTA):
📞 ${CTA_COMPONENTS.phone} - Llámame esta semana
Vamos a crear tu timeline de cambio + te muestro lo disponible en tu nuevo rango.

${CTA_COMPONENTS.sullySignature.es}

LONGITUD: 450-500 palabras
` : `
LEAD MAGNET for ITIN buyer upsizing - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo
- Current DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- SITUATION: You bought with ITIN, now upsizing

**1. YOUR SECRET WEAPON** (Hook):
"You already built equity in your current home - that's your secret weapon! With ${ctx.downPayment}% down + sale proceeds, you can move up SIGNIFICANTLY bigger. I've helped 12 ITIN families upsize in Austin this year."

**2. YOUR NEW BUYING POWER** (Value):
New home at $${ctx.targetPrice.toLocaleString()}:
- Monthly payment: ~$${Math.round((ctx.targetPrice * 0.9 * 0.00699) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- Cash needed: $${Math.round(ctx.targetPrice * (ctx.downPayment / 100) + 8000).toLocaleString()}
- Current home equity: Can boost down payment significantly

| Scenario | Your Current Home | New Home @ $${ctx.targetPrice.toLocaleString()} |
|----------|-------------------|--------------------------------|
| Sell for $${Math.round(ctx.targetPrice * 0.7).toLocaleString()} | Equity: ~$${Math.round(ctx.targetPrice * 0.7 * 0.25).toLocaleString()} | Total down: ${Math.round(((ctx.targetPrice * 0.7 * 0.25) / ctx.targetPrice) * 100)}% |
| Sell for $${Math.round(ctx.targetPrice * 0.8).toLocaleString()} | Equity: ~$${Math.round(ctx.targetPrice * 0.8 * 0.25).toLocaleString()} | Total down: ${Math.round(((ctx.targetPrice * 0.8 * 0.25) / ctx.targetPrice) * 100)}% |

**3. YOUR UPSIZING STRATEGY** (Education):
Path from current home to $${ctx.targetPrice.toLocaleString()}:

**Option A: Sell First** ⭐ (Recommended for ITIN)
- ✅ Clean offer (no contingency = stronger)
- ✅ Know exact down payment amount
- ⚠️ Need temporary housing (I can help with 30-60 day rent-back)

**Option B: Buy First**
- ❌ Bridge loans difficult with ITIN
- ❌ Qualify for both mortgages = hard
- Not recommended unless you have 40%+ down saved

**Option C: Contingent Offer** (My Specialty)
- ✅ No moving twice
- ✅ I negotiate acceptance (did it 8 times this year for ITIN clients)
- ⚠️ Only works in slower markets

**4. WHY ${ctx.city.toUpperCase()} NOW** (Market Urgency):
${ctx.city} upsizing market reality:
- Inventory: ${ctx.targetPrice >= 400000 ? 'CRITICALLY LOW' : 'Moderate'} at $${ctx.targetPrice.toLocaleString()}
- Days on market: ${ctx.targetPrice >= 400000 ? '8-12' : '15-20'} days average
- Competition: ${ctx.targetPrice >= 400000 ? '3-5' : '5-8'} offers on best homes
- Your edge: ITIN lenders move FAST when you have equity history

**5. WHAT I CAN'T SHOW HERE** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- Timing blueprint: Sell high + buy low (30-60-90 day plan)
- The 3 lenders who do ITIN "sell + buy" programs (most DON'T)
- How my last upsizing ITIN client got $18K off asking (seller didn't want ITIN uncertainty - I proved otherwise)

**6. READY TO UPGRADE?** (CTA):
📞 ${CTA_COMPONENTS.phone} - Call me this week
Let's create your upsizing timeline + I'll show you what's available at $${ctx.targetPrice.toLocaleString()}.

${CTA_COMPONENTS.urgency.en(ctx.city)}

You've proven you can own - now let's upgrade! 🏡➡️🏡✨
${CTA_COMPONENTS.sullySignature.en}

TONE: Empowerment (already homeowner), leverage equity, ITIN-specific challenges
LENGTH: 550-600 words
`,

  // ==================== SELF-EMPLOYED ====================

  [LeadType.SELF_EMPLOYED_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
REPORTE para auto-empleado/1099 primera compra - Sully Ruiz

PERFIL:
- Ingreso mensual: $${ctx.monthlyIncome.toLocaleString()} (promedio 2 años taxes)
- Deudas: $${ctx.monthlyDebts.toLocaleString()}
- DTI: ${ctx.currentDTI}%
- Crédito: ${ctx.creditScore}
- Enganche: ${ctx.downPayment}%

FORMATO LEAD MAGNET:

**1. TU VENTAJA AUTO-EMPLEADO** (Hook):
"Ser auto-empleado NO es desventaja - ¡es ventaja! Con DTI ${ctx.currentDTI}% + crédito ${ctx.creditScore}, estás en mejor posición que el 70% de compradores W2. He cerrado 32 préstamos para auto-empleados en Austin este año."

**2. TU PODER DE COMPRA** (Value):
Como auto-empleado con $${ctx.monthlyIncome.toLocaleString()}/mes (promedio de taxes), calificas para:
- Rango de precio: $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}
- Pago mensual estimado: $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- DTI después de compra: ${Math.round(((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}%

**3. CÓMO PRESTAMISTAS CALCULAN TU INGRESO** (Education):
Para auto-empleados:
- Toman promedio de 2 años de declaraciones
- Suman depreciation back (¡aumenta tu ingreso calificable!)
- Algunos programas usan bank statements (ingresos brutos)
- ${ctx.downPayment >= 10 ? 'Tu enganche fuerte compensa variabilidad de ingreso' : 'Considera subir enganche a 10% para mejor tasa'}

**4. TU VENTAJA COMPETITIVA** (Proof):
Por qué vendedores aceptan tu oferta:
- ✅ Auto-empleado = Reservas de efectivo (más seguro que W2 que vive paycheck-to-paycheck)
- ✅ Enganche ${ctx.downPayment}% = Compromiso serio
- ✅ Pre-aprobación con 2yr taxes = Financiamiento sólido

**5. LO QUE NO PUEDO MOSTRARTE** (Gap):
${GAP_PATTERNS.lenderConnections.es}
- Los 2 programas de bank statement loans que duplican tu poder de compra
- Cómo presentar tus P&Ls para maximizar ingreso calificable
- La estrategia que usó mi último cliente para comprar en $380K con ingreso "oficial" de solo $60K

**6. PRÓXIMO PASO** (CTA):
📞 ${CTA_COMPONENTS.phone}
Te conecto con el prestamista que ESPECIALIZA en auto-empleados (cerró 40+ este año).

${CTA_COMPONENTS.urgency.es(ctx.city)}

${CTA_COMPONENTS.sullySignature.es}

TONO: Empoderador para auto-empleados, "tu situación es fortaleza"
LONGITUD: 500-550 palabras
` : `
LEAD MAGNET for self-employed/1099 first-time buyer - Sully Ruiz

PROFILE:
- Monthly income: $${ctx.monthlyIncome.toLocaleString()} (2-year tax average)
- Debts: $${ctx.monthlyDebts.toLocaleString()}
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down payment: ${ctx.downPayment}%

LEAD MAGNET FORMAT:

**1. YOUR SELF-EMPLOYED ADVANTAGE** (Hook):
"Being self-employed is NOT a disadvantage - it's an ADVANTAGE! With ${ctx.currentDTI}% DTI + ${ctx.creditScore} credit, you're in better shape than 70% of W2 buyers. I've closed 32 self-employed loans in Austin this year."

**2. YOUR BUYING POWER** (Value):
As self-employed with $${ctx.monthlyIncome.toLocaleString()}/month (tax average), you qualify for:
- Price range: $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}
- Estimated monthly payment: $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- DTI after purchase: ${Math.round(((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}%

**3. HOW LENDERS CALCULATE YOUR INCOME** (Education):
For self-employed:
- Average of 2 years tax returns
- Add depreciation back (increases qualifying income!)
- Some programs use bank statements (gross deposits)
- ${ctx.downPayment >= 10 ? 'Your strong down payment offsets income variability' : 'Consider increasing to 10% down for better rate'}

**4. YOUR COMPETITIVE EDGE** (Proof):
Why sellers accept your offer:
- ✅ Self-employed = Cash reserves (safer than W2 living paycheck-to-paycheck)
- ✅ ${ctx.downPayment}% down = Serious commitment
- ✅ Pre-approval with 2yr taxes = Solid financing

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.lenderConnections.en}
- The 2 bank statement loan programs that double your buying power
- How to present your P&Ls to maximize qualifying income
- The strategy my last client used to buy at $380K with "official" income of only $60K

**6. NEXT STEP** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll connect you with the lender who SPECIALIZES in self-employed (closed 40+ this year).

${CTA_COMPONENTS.urgency.en(ctx.city)}

${CTA_COMPONENTS.sullySignature.en}

TONE: Empowering for self-employed, "your situation is strength"
LENGTH: 500-550 words
`,

  [LeadType.SELF_EMPLOYED_INVESTOR]: (ctx) => ctx.locale === 'es' ? `
[Spanish self-employed investor template]
` : `
LEAD MAGNET for self-employed investor - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (2yr tax avg)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Property: Investment/rental
- Employment: Self-employed/1099

**1. ENTREPRENEUR + INVESTOR = WEALTH MACHINE** (Hook):
"Self-employed investing in real estate? SMART MOVE! Your tax returns already show business income - adding rental income is the PERFECT next step. I helped 19 self-employed entrepreneurs buy investment properties in Austin this year."

**2. YOUR INVESTMENT POWER** (Value):
At $${ctx.targetPrice.toLocaleString()} investment property:
- Expected rent: $${Math.round(ctx.targetPrice * 0.009).toLocaleString()}/mo
- Your monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00699) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- **Cash flow**: ${Math.round(ctx.targetPrice * 0.009) - Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00699) + (ctx.targetPrice * 0.015 / 12)) > 0 ? '+' : ''}$${(Math.round(ctx.targetPrice * 0.009) - Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00699) + (ctx.targetPrice * 0.015 / 12))).toLocaleString()}/mo

**3. SELF-EMPLOYED INVESTOR LOAN** (Your Path):
You need CONVENTIONAL investor loan:
- **Down**: 15-25% (you have ${ctx.downPayment}% ✓)
- **Rate**: ~6.75-7.5% (slightly higher than primary residence)
- **Documentation**: 2yr tax returns (business + personal), P&L, bank statements
- **Income**: They'll average your 2yr net (${ctx.monthlyIncome.toLocaleString()}/mo already calculated)
- **Reserves**: 6mo PITI required = $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00699 + ctx.targetPrice * 0.015 / 12) * 6).toLocaleString()}

**4. TAX ADVANTAGES FOR YOU** (Huge Benefit!):
As self-employed investor, you get DOUBLE tax benefits:
- ✅ Rental property: Depreciation, repairs, property tax deductions
- ✅ Business expenses: Mileage, office, tools used for rental management
- ✅ Combined strategy: Write off MORE than W2 investors can
- 💡 Talk to CPA: Potential $3K-$8K/yr in extra deductions

**5. WHY LENDERS APPROVE YOU** (Proof):
Your strengths:
- ✅ 2yr tax history = Proven income stability (key for self-employed)
- ✅ ${ctx.downPayment}% down = Serious investor
- ✅ DTI ${ctx.currentDTI}% = ${ctx.currentDTI <= 36 ? 'Excellent' : 'Good'} debt management
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Best rate tier' : 'Approved'}
- ✅ Rental income (75% counted) = Lowers DTI

**6. AUSTIN INVESTMENT HOT ZONES** (Teaser):
Best rent-to-price neighborhoods for $${ctx.targetPrice.toLocaleString()}:
- ${ctx.city.toLowerCase().includes('austin') ? 'Pflugerville, Manor, Hutto - 7-9% cap rates' : 'Emerging growth areas'}
- Tenant pool: UT students, tech workers, military
- Appreciation: 4-6%/yr historical

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.lenderConnections.en}
- Which lender loves self-employed investors (closed 28 last year - super fast)
- The property manager who handles Section 8 (95% occupancy, guaranteed rent)
- Tax strategy: Set up LLC vs personal name (my CPA's playbook)
- How to use your business credit to qualify for MORE properties

**6. LET'S BUILD YOUR RENTAL PORTFOLIO** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll show you the 3 properties that hit market THIS WEEK + connect you with my investor-specialist lender.

${CTA_COMPONENTS.urgency.en(ctx.city)}

Passive income + tax benefits = Freedom! 💰🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Entrepreneurial wealth-building, tax advantages, passive income focus
LENGTH: 600-650 words
`,

  [LeadType.SELF_EMPLOYED_UPSIZING]: (ctx) => ctx.locale === 'es' ? `
[Spanish self-employed upsizing template]
` : `
LEAD MAGNET for self-employed upsizing buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (2yr avg)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Current home: Owner (upsizing)
- Employment: Self-employed/1099

**1. YOUR BUSINESS GREW - NOW GROW YOUR HOME** (Hook):
"Your business is thriving (congrats on ${ctx.monthlyIncome.toLocaleString()}/mo income!) - time to upgrade your home! I helped 22 self-employed entrepreneurs upsize in Austin this year. Your equity + proven income = POWERFUL combo."

**2. YOUR UPSIZING POWER** (Value):
Current home equity (est):
- Austin appreciation: ~6-8%/yr
- Your likely equity: $${Math.round(ctx.targetPrice * 0.2).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.3).toLocaleString()}

New home at $${ctx.targetPrice.toLocaleString()}:
- Use equity for down: ${ctx.downPayment}%+ ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()})
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- NO PMI (if 20%+ down from equity)

**3. SELF-EMPLOYED UPSIZING PATH** (Education):
Best strategy for self-employed:

**Option A: Sell First** ⭐ (Recommended)
- ✅ Clean offer (no contingency)
- ✅ Know exact down payment
- ✅ Stronger pre-approval (only one mortgage to qualify for)
- ⚠️ Need temp housing (30-60 day leaseback - I negotiate these)

**Option B: HELOC + Buy**
- ✅ Use HELOC for down payment on new home
- ✅ Sell old home after move-in
- ⚠️ Qualify with both debts (harder for self-employed)
- Need: 2yr strong tax returns + 20%+ equity

**Option C: Contingent Offer**
- ❌ Difficult for self-employed (lenders cautious)
- Only works in slow markets

**4. WHY YOU CAN AFFORD MORE** (Income Analysis):
Your 2yr income trend:
- If income increased: Lenders may use current year (higher approval!)
- If stable: 2yr average = ${ctx.monthlyIncome.toLocaleString()}/mo
- With equity: You can jump $${Math.round(ctx.targetPrice * 0.2).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.4).toLocaleString()} higher

**5. WHAT SELLERS LOVE ABOUT YOU** (Proof):
- ✅ Large down payment (from equity) = No appraisal gap risk
- ✅ 2yr tax history = Proven income (lenders trust you)
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Excellent approval odds' : 'Solid approval'}
- ✅ Experienced homeowner = Smooth closing

**6. YOUR UPGRADE OPTIONS** (Vision):
At $${ctx.targetPrice.toLocaleString()} in ${ctx.city}:
- ${ctx.targetPrice >= 500000 ? '2400-3000 sq ft, 4-5bd/3ba, home office, pool' : '2000-2400 sq ft, 4bd/2-3ba, office, yard'}
- ${ctx.targetPrice >= 600000 ? 'Premium neighborhoods, modern builds, luxury finishes' : 'Great schools, updated homes, bigger lots'}
- Work from home setup: Dedicated office (tax write-off!), better internet, quiet neighborhood

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- Which lender LOVES self-employed upsizers (approved 31 last year, super flexible)
- 30-60-90 day timeline: Sell high + buy low (timing is everything)
- How to use your business tax structure to qualify for MORE house
- Neighborhoods with best appreciation for next 3-5 years

**6. READY FOR YOUR UPGRADE?** (CTA):
📞 ${CTA_COMPONENTS.phone}
Let's create your upsizing game plan + I'll show you what's available at $${ctx.targetPrice.toLocaleString()}.

${CTA_COMPONENTS.urgency.en(ctx.city)}

Your business grew - now grow your lifestyle! 🏡✨
${CTA_COMPONENTS.sullySignature.en}

TONE: Celebrate business success, leverage equity, home office benefits
LENGTH: 600-650 words
`,

  // ==================== W2 BUYERS ====================

  [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: (ctx) => ctx.locale === 'es' ? `
[Spanish W2 good credit template]
` : `
LEAD MAGNET for W2 first-time buyer with excellent credit - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/month (W2)
- Debts: $${ctx.monthlyDebts.toLocaleString()}
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore} ⭐
- Down: ${ctx.downPayment}%

**1. YOU'RE IN THE TOP 25%** (Hook):
"Your ${ctx.creditScore} credit + W2 employment puts you in the TOP 25% of buyers in ${ctx.city}. Sellers WANT your offer. I closed 45 deals with buyers like you this year - you're in EXCELLENT position."

**2. YOUR BUYING POWER** (Value):
With your profile, you qualify for $${Math.round(ctx.targetPrice * 0.9).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}:

| Home Price | Monthly (FHA) | Monthly (Conv) | Rate Advantage |
|------------|---------------|----------------|----------------|
| $${Math.round(ctx.targetPrice * 0.9).toLocaleString()} | $${Math.round((ctx.targetPrice * 0.9 * 0.965 * 0.00582) + (ctx.targetPrice * 0.9 * 0.012 / 12) + 180).toLocaleString()} | $${Math.round((ctx.targetPrice * 0.9 * 0.97 * 0.00532) + (ctx.targetPrice * 0.9 * 0.012 / 12) + (ctx.downPayment < 20 ? 140 : 0)).toLocaleString()} | Save $${Math.round(((ctx.targetPrice * 0.9 * 0.965 * 0.00582) - (ctx.targetPrice * 0.9 * 0.97 * 0.00532))).toLocaleString()}/mo |
| $${ctx.targetPrice.toLocaleString()} | $${Math.round((ctx.targetPrice * 0.965 * 0.00582) + (ctx.targetPrice * 0.012 / 12) + 180).toLocaleString()} | $${Math.round((ctx.targetPrice * 0.97 * 0.00532) + (ctx.targetPrice * 0.012 / 12) + (ctx.downPayment < 20 ? 140 : 0)).toLocaleString()} | Save $${Math.round(((ctx.targetPrice * 0.965 * 0.00582) - (ctx.targetPrice * 0.97 * 0.00532))).toLocaleString()}/mo |

**3. YOUR CREDIT ADVANTAGE** (Proof):
Your ${ctx.creditScore} credit saves you:
- ~0.5% lower rate vs 680 credit = $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.005 / 12).toLocaleString()}/month
- Over 30 years = $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.005 / 12 * 360).toLocaleString()} total savings
- Plus: Sellers prefer buyers with excellent credit (financing certainty)

**4. WHY SELLERS CHOOSE YOU** (Competitive Edge):
In multiple offer situations, you win because:
- ✅ ${ctx.creditScore} credit = 99% approval certainty
- ✅ W2 employment = Quick verification (3-5 days vs 2 weeks self-employed)
- ✅ ${ctx.currentDTI}% DTI = Financial strength

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.negotiation.en}
${GAP_PATTERNS.listings.en}
- The exact FHA vs Conventional decision tree for YOUR situation
- How to leverage your credit to negotiate $10K-$15K in seller concessions

**6. YOUR MOVE** (CTA):
📞 ${CTA_COMPONENTS.phone} - Let's talk this week
I'll show you the 5-7 homes that just hit my radar (before Zillow) in your criteria.

${CTA_COMPONENTS.urgency.en(ctx.city)}

You're in the driver's seat - let's use it! 🚗
${CTA_COMPONENTS.sullySignature.en}

LENGTH: 500-550 words
`,

  [LeadType.W2_FIRST_TIME_LOW_CREDIT]: (ctx) => ctx.locale === 'es' ? `
[Spanish W2 low credit template]
` : `
LEAD MAGNET for W2 buyer building credit - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (W2 - stable!)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore} (building...)
- Down: ${ctx.downPayment}%

**1. YOU CAN BUY NOW (While Building Credit)** (Hook):
"Credit ${ctx.creditScore}? You're APPROVED for FHA! I helped 18 buyers with similar credit buy homes in Austin this year. Yes, you can buy NOW *and* improve your credit at the same time."

**2. YOUR BUYING POWER TODAY** (Value):
At $${ctx.targetPrice.toLocaleString()}:
- FHA monthly payment: ~$${Math.round((ctx.targetPrice * 0.965 * 0.0065) + (ctx.targetPrice * 0.015 / 12) + 200).toLocaleString()}
- Total cash needed: $${Math.round(ctx.targetPrice * 0.035 + 8000).toLocaleString()} (3.5% down + closing)
- DTI after purchase: ${Math.round(((ctx.targetPrice * 0.965 * 0.0065) + (ctx.targetPrice * 0.015 / 12) + 200 + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}%

**3. YOUR CREDIT IMPROVEMENT PLAN** (While You Own!)  (Education):
Buy now, improve credit, refinance in 12-18 months:
- Step 1: Buy with FHA @ ~6.5% rate
- Step 2: Pay on time + reduce debt → credit rises to 680+
- Step 3: Refinance @ ~5.9% rate = Save $${Math.round(ctx.targetPrice * 0.965 * 0.006 / 12).toLocaleString()}/month

Total savings over life of loan: $${Math.round(ctx.targetPrice * 0.965 * 0.006 / 12 * 360).toLocaleString()}!

**4. WHY WAIT COSTS YOU MONEY** (Urgency):
If you wait 18 months to "build credit first":
- Homes appreciate ~4-6%/year = $${Math.round(ctx.targetPrice * 0.05).toLocaleString()} higher price
- Rent for 18 months: $${Math.round(ctx.targetPrice * 0.007 * 18).toLocaleString()} paid to landlord
- Total cost of waiting: ~$${Math.round(ctx.targetPrice * 0.05 + ctx.targetPrice * 0.007 * 18).toLocaleString()}

VS buying now: Build equity from day 1!

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.lenderConnections.en}
- The 3 quick wins that boost your credit 40+ points in 90 days (while you own)
- $8K-$12K down payment assistance programs most agents don't know
- How to use your rental history to strengthen your FHA application

**6. LET'S GET YOU IN A HOME** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll connect you with my FHA specialist (approved 95% of credit-building buyers last year).

${CTA_COMPONENTS.urgency.en(ctx.city)}

Your home is waiting - let's go get it! 🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Empowering "buy now, improve later", urgency, cost of waiting
LENGTH: 550-600 words
`,

  [LeadType.W2_INVESTOR]: (ctx) => ctx.locale === 'es' ? `
[Spanish W2 investor template]
` : `
LEAD MAGNET for W2 investor buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (W2 stable)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Property: Investment/rental

**1. BUILD WEALTH WHILE YOU SLEEP** (Hook):
"W2 income + investment property = SMART wealth building! I helped 23 W2 earners buy investment properties in Austin this year. Your stable income gives you a HUGE lending advantage investors with 1099 income don't have."

**2. YOUR RENTAL INCOME STRATEGY** (Value):
At $${ctx.targetPrice.toLocaleString()} investment property:
- Expected rent: $${Math.round(ctx.targetPrice * 0.009).toLocaleString()}/mo (${ctx.city} avg)
- Your monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- **Cash flow**: ${Math.round(ctx.targetPrice * 0.009) - Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)) > 0 ? '+' : ''}$${(Math.round(ctx.targetPrice * 0.009) - Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12))).toLocaleString()}/mo
- **Tax benefits**: Depreciation + expenses + interest deduction

**3. CONVENTIONAL INVESTOR LOAN** (Your Best Option):
| Feature | Amount | Advantage |
|---------|--------|-----------|
| Down payment | ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()}) | Lower than FHA for investment |
| Rate | ~6.5-7.0% | Best for investors (W2 = lower risk) |
| Rent income | 75% counts toward qualifying | Lowers your DTI |
| Reserves | 6 months PITI | You need $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12) * 6).toLocaleString()} |

**4. WHY YOU'RE A LENDER'S DREAM** (Proof):
- ✅ W2 income = Stable (not self-employed uncertainty)
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Excellent rate tier' : 'Approved'}
- ✅ DTI ${ctx.currentDTI}% = ${ctx.currentDTI <= 36 ? 'Excellent capacity' : 'Good capacity'}
- ✅ ${ctx.downPayment}% down = Serious investor (lenders trust you)

**5. AUSTIN INVESTMENT HOT SPOTS** (Teaser):
Neighborhoods with best rent-to-price ratio in ${ctx.city}:
- ${ctx.city.toLowerCase().includes('austin') ? 'Pflugerville, Manor, Kyle - 7-9% cap rates' : 'Emerging areas - 6-8% cap rates'}
- Tenant demand: College students, military, tech workers

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- Which 3 neighborhoods have Section 8 waitlists 6+ months (guaranteed rent!)
- The property manager I use (95% occupancy rate, handles everything)
- Tax strategy to write off 100% of your costs (my CPA's playbook)

**6. LET'S BUILD YOUR RENTAL EMPIRE** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll show you the 5 properties that hit the market THIS WEEK perfect for your budget.

${CTA_COMPONENTS.urgency.en(ctx.city)}

Invest in your future - call me today! 💰🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Wealth-building excitement, passive income focus, W2 advantage
LENGTH: 550-600 words
`,

  [LeadType.W2_UPSIZING]: (ctx) => ctx.locale === 'es' ? `
[Spanish W2 upsizing template]
` : `
LEAD MAGNET for W2 upsizing buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (W2)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Current home: Owner (upsizing)

**1. TIME TO UPGRADE - YOU'VE EARNED IT** (Hook):
"You've built equity in your current home - now it's time to move UP! I helped 31 families upsize in Austin this year. Your W2 income + home equity = POWERFUL combination that sellers love."

**2. YOUR UPSIZING POWER** (Value):
Current home equity (estimated):
- Austin home appreciation: ~6-8%/yr average
- Your likely equity: $${Math.round(ctx.targetPrice * 0.15).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.25).toLocaleString()}

New home at $${ctx.targetPrice.toLocaleString()}:
- Use equity as down payment: ${ctx.downPayment}% ($${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()})
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- NO PMI (if 20%+ down from equity)

**3. TWO SMART UPSIZING PATHS** (Education):
**Option A: Sell First, Then Buy**
- ✅ Stronger offer (no contingency)
- ✅ Know exact down payment
- ⚠️  Need temporary housing

**Option B: Buy First, Then Sell** (Bridge/HELOC)
- ✅ No moving twice
- ✅ No temporary housing
- ⚠️  Must qualify for both mortgages temporarily

Most of my clients: Option A (stronger negotiation position in ${ctx.city} market)

**4. WHY SELLERS CHOOSE YOU** (Proof):
Your competitive advantages:
- ✅ W2 income = Fast closing (lenders love you)
- ✅ Home equity = Large down payment (20%+ = no appraisal gap risk)
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Best rates, no loan issues' : 'Approved, smooth process'}
- ✅ Experienced buyer = Sellers trust you understand the process

**5. WHAT YOU CAN AFFORD NOW** (Upgrade Vision):
At $${ctx.targetPrice.toLocaleString()} in ${ctx.city}:
- ${ctx.targetPrice >= 400000 ? '2200-2800 sq ft, 4bd/3ba' : '1800-2200 sq ft, 3-4bd/2ba'}
- ${ctx.targetPrice >= 500000 ? 'Premium neighborhoods, modern finishes, larger lots' : 'Established neighborhoods, updated homes, good schools'}
- Lifestyle upgrade: ${ctx.targetPrice >= 600000 ? 'Pool, game room, home office' : 'Bigger yard, extra bedroom, updated kitchen'}

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- The 30-60-90 timeline that lets you sell high + buy low (timing strategy)
- How to use your current home as leverage to win bidding wars
- Neighborhoods where upsizers get best appreciation (next 3-5 years)

**6. READY TO UPGRADE?** (CTA):
📞 ${CTA_COMPONENTS.phone}
Let's create your upsizing game plan (I'll even help you price your current home for max profit).

${CTA_COMPONENTS.urgency.en(ctx.city)}

You've earned this upgrade - let's make it happen! 🏡➡️🏡✨
${CTA_COMPONENTS.sullySignature.en}

TONE: Celebration of progress, upgrade excitement, leverage equity
LENGTH: 600-650 words
`,

  // ==================== MILITARY/VETERAN ====================

  [LeadType.MILITARY_VETERAN_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
[Spanish military/veteran template]
` : `
LEAD MAGNET for military/veteran first-time buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Status: Military/Veteran ⭐
- Down: ${ctx.downPayment}% (VA = 0% option!)

**1. YOUR VA BENEFIT = UNFAIR ADVANTAGE** (Hook):
"You served - now your VA benefit gives you the BIGGEST advantage in homebuying: 0% down + no PMI. I've helped 27 veterans buy in Austin this year. Your service earned you this - let's use it!"

**2. YOUR VA BUYING POWER** (Value):
With VA loan at $${ctx.targetPrice.toLocaleString()}:
- Down payment: $0 (yes, ZERO)
- Monthly payment: ~$${Math.round((ctx.targetPrice * 0.00582) + (ctx.targetPrice * 0.012 / 12)).toLocaleString()}
- No PMI = Save $${Math.round(ctx.targetPrice * 0.005 / 12).toLocaleString()}/mo vs conventional
- VA funding fee: ${ctx.leadProfile.strengths.includes('first') ? '2.3%' : '3.6%'} (can be rolled into loan)

**3. WHY VA BEATS EVERYTHING** (Proof):
| Program | Down Payment | PMI | Your Advantage |
|---------|--------------|-----|----------------|
| VA (YOU) | $0 | $0 | ← WIN! |
| FHA | $${Math.round(ctx.targetPrice * 0.035).toLocaleString()} | $${Math.round(ctx.targetPrice * 0.0085 / 12).toLocaleString()}/mo | Save $${Math.round(ctx.targetPrice * 0.035).toLocaleString()} cash |
| Conventional | $${Math.round(ctx.targetPrice * 0.05).toLocaleString()} | $${Math.round(ctx.targetPrice * 0.005 / 12).toLocaleString()}/mo | Save $${Math.round(ctx.targetPrice * 0.05).toLocaleString()} cash |

**4. ${ctx.city.toUpperCase()} LOVES VETERANS** (Social Proof):
Military-friendly features in ${ctx.city}:
- ${ctx.city.toLowerCase().includes('austin') ? 'Camp Mabry, Fort Cavazos nearby' : 'Multiple military installations'}
- VA-approved neighborhoods: 95%+ of ${ctx.city}
- My veteran clients: 27 closed this year, 100% approval rate

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.lenderConnections.en}
${GAP_PATTERNS.listings.en}
- The VA "reuse" strategy to buy your 2nd/3rd home with 0% down
- How to avoid the funding fee entirely (disability exemption)
- 5 neighborhoods where veterans get priority (not published)

**6. THANK YOU FOR YOUR SERVICE - LET'S FIND YOUR HOME** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll connect you with my VA specialist lender (ex-military, understands your benefits inside-out).

${CTA_COMPONENTS.urgency.en(ctx.city)}

You earned this benefit - let's put it to work! 🇺🇸🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Respect for service, emphasize earned benefits, patriotic
LENGTH: 500-550 words
`,

  [LeadType.MILITARY_VETERAN_UPSIZING]: (ctx) => ctx.locale === 'es' ? `
[Spanish military/veteran upsizing template]
` : `
LEAD MAGNET for military/veteran upsizing - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Status: Military/Veteran ⭐
- Current home: Owner (upsizing)

**1. YOU SERVED, YOU SAVED, NOW UPGRADE** (Hook):
"You used your VA benefit once - now use it AGAIN to upsize! 85% of veterans don't know they can reuse VA loans. I helped 14 veteran families upsize in Austin this year using this strategy."

**2. YOUR VA UPSIZING ADVANTAGE** (Value):
New home at $${ctx.targetPrice.toLocaleString()}:
- VA loan: 0% down option (yes, AGAIN!)
- Use home equity for: Closing costs, upgrades, reserves
- Monthly payment: ~$${Math.round((ctx.targetPrice * 0.00582) + (ctx.targetPrice * 0.012 / 12)).toLocaleString()}
- NO PMI = Save $${Math.round(ctx.targetPrice * 0.005 / 12).toLocaleString()}/mo vs conventional

**3. VA "REUSE" STRATEGIES** (Education):
**Option A: Sell First + Use VA Again** ⭐ (Most Common)
- ✅ Sell current home (releases VA entitlement)
- ✅ Buy new home with VA at 0% down
- ✅ Use equity for closing costs
- ⚠️ Need temporary housing (30-60 day leaseback)

**Option B: Keep Current + Buy New with VA**
- ✅ If you have FULL entitlement left ($766,550 in most TX counties)
- ✅ Keep current home as rental
- ✅ Use VA for new primary residence
- ⚠️ Must qualify for both mortgages

**Option C: Restore Partial Entitlement**
- If used partial VA benefit, can restore for new purchase
- Requires: Pay off first VA loan OR one-time use of remaining entitlement

**4. WHY THIS IS YOUR MOMENT** (Urgency):
${ctx.city} market for veterans upsizing:
- Inventory: ${ctx.targetPrice >= 400000 ? 'LOW' : 'Moderate'} at $${ctx.targetPrice.toLocaleString()}
- Your advantage: 0% down + no PMI = STRONGEST offer
- Equity built: Likely $${Math.round(ctx.targetPrice * 0.2).toLocaleString()}-$${Math.round(ctx.targetPrice * 0.3).toLocaleString()} (use for upgrades!)

**5. WHAT SELLERS LOVE** (Proof):
- ✅ VA loan = Government-backed (sellers trust it)
- ✅ 0% down = All your equity for STRONG offer/appraisal gap
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '680' ? 'Excellent approval odds' : 'Solid approval'}
- ✅ Experienced homeowner = Smooth closing

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- VA entitlement calculator: See EXACTLY how much you can reuse
- The VA lender who SPECIALIZES in veteran upsizing (closed 89 last year)
- How to time your sale + purchase for max equity extraction
- Disability exemption: Waive funding fee entirely (if 10%+ rating)

**6. THANK YOU FOR YOUR SERVICE - LET'S UPGRADE YOUR HOME** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll calculate your exact VA entitlement + show you what's available at $${ctx.targetPrice.toLocaleString()}.

${CTA_COMPONENTS.urgency.en(ctx.city)}

You earned this benefit - use it TWICE! 🇺🇸🏡➡️🏡✨
${CTA_COMPONENTS.sullySignature.en}

TONE: Patriotic gratitude, VA reuse education, leverage benefits
LENGTH: 600-650 words
`,

  // ==================== OTHER TYPES ====================

  [LeadType.RETIRED_BUYER]: (ctx) => ctx.locale === 'es' ? `
[Spanish retired buyer template]
` : `
LEAD MAGNET for retired buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (retirement)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Status: Retired/Fixed income

**1. RETIREMENT = APPROVED FOR MORTGAGE** (Hook):
"Retired? You're APPROVED! Social Security + pensions + retirement income ALL count for mortgages. I helped 16 retired buyers in Austin this year - lenders LOVE retirees (stable income, excellent credit, low debt)."

**2. YOUR RETIREMENT BUYING POWER** (Value):
With $${ctx.monthlyIncome.toLocaleString()}/mo retirement income:
- Qualify for: $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00582) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- DTI: ${ctx.currentDTI}% (lenders want <43%, you're ${ctx.currentDTI <= 36 ? 'EXCELLENT' : 'good'})

**3. RETIREMENT INCOME SOURCES** (What Counts):
✅ **Accepted by lenders**:
- Social Security (1099-SSA)
- Pension/retirement accounts (IRA, 401k distributions)
- Investment income (dividends, interest)
- Rental property income
- Part-time work income

**4. WHY LENDERS LOVE RETIREES** (Proof):
Your advantages:
- ✅ Stable income (predictable, often guaranteed)
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Excellent (top tier rates)' : 'Solid approval'}
- ✅ Low DTI ${ctx.currentDTI}% = Minimal debt (common for retirees)
- ✅ ${ctx.downPayment}% down = Strong financial position
- ✅ No job loss risk (income is permanent)

**5. DOWNSIZING OR RIGHT-SIZING?** (Your Options):
At $${ctx.targetPrice.toLocaleString()} in ${ctx.city}:
- ${ctx.targetPrice >= 400000 ? '2000-2400 sq ft, 3-4bd/2-3ba, single-story options' : '1600-2000 sq ft, 2-3bd/2ba, low maintenance'}
- Retirement-friendly: ${ctx.targetPrice >= 500000 ? 'Master on main, community amenities, HOA handles yard' : 'Easy maintenance, walkable, good medical access'}

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
- Active adult communities (55+) with golf, pools, activities
- Which neighborhoods have BEST medical access (hospitals, specialists)
- Property tax exemptions for 65+ (save $1K-$3K/yr in Texas!)
- The lender who SPECIALIZES in retirement income (approved 94% last year)

**6. ENJOY RETIREMENT IN YOUR DREAM HOME** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll show you retirement-friendly homes + connect you with my retirement-income specialist lender.

${CTA_COMPONENTS.urgency.en(ctx.city)}

You worked your whole life - enjoy it in the perfect home! 🏡☀️
${CTA_COMPONENTS.sullySignature.en}

TONE: Respectful, retirement lifestyle focus, ease/convenience emphasis
LENGTH: 550-600 words
`,

  [LeadType.HIGH_NET_WORTH]: (ctx) => ctx.locale === 'es' ? `
[Spanish high net worth template]
` : `
LEAD MAGNET for high net worth buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}% (${Math.round(ctx.targetPrice * ctx.downPayment / 100).toLocaleString()})
- Status: High income, substantial down payment

**1. YOUR WEALTH OPENS PREMIUM OPTIONS** (Hook):
"With $${ctx.monthlyIncome.toLocaleString()}/mo income + ${ctx.downPayment}% down, you have ACCESS to Austin's finest properties AND the negotiating power to WIN. I closed 12 high-net-worth deals this year - you're in the driver's seat."

**2. YOUR PREMIUM BUYING POWER** (Value):
At $${ctx.targetPrice.toLocaleString()}+ with ${ctx.downPayment}% down:
- Jumbo loan: ${ctx.targetPrice >= 766550 ? 'Required (over conforming limit)' : 'Optional (better rates available)'}
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00565) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- NO PMI (20%+ down)
- Interest deduction: $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00565 * 12).toLocaleString()}/yr (consult CPA)

**3. YOUR LOAN OPTIONS** (Jumbo vs Conventional):
| Feature | Jumbo Loan | Conventional | Your Best Choice |
|---------|------------|--------------|------------------|
| Loan amount | ${ctx.targetPrice >= 766550 ? `$${ctx.targetPrice.toLocaleString()}` : 'Up to $766,550'} | Up to $766,550 | ${ctx.targetPrice >= 766550 ? 'Jumbo required' : 'Conventional (better rate)'} |
| Rate | ~6.25-6.75% | ~6.0-6.5% | ${ctx.targetPrice >= 766550 ? 'Competitive jumbo' : 'Conventional wins'} |
| Down min | 10-20% | 5-20% | You have ${ctx.downPayment}% ✓ |
| Reserves | 12mo+ PITI | 2-6mo PITI | Higher for jumbo |

**4. WHY SELLERS CHOOSE YOUR OFFER** (Proof):
You are the IDEAL buyer:
- ✅ ${ctx.downPayment}% down = NO appraisal gap risk (cover any difference)
- ✅ Income $${ctx.monthlyIncome.toLocaleString()}/mo = Zero financing concerns
- ✅ DTI ${ctx.currentDTI}% = Exceptional financial strength
- ✅ Quick close: Can close in 14-21 days (no contingencies needed)

**5. PREMIUM AUSTIN PROPERTIES** (What You Can Access):
At $${ctx.targetPrice.toLocaleString()}:
- ${ctx.targetPrice >= 1000000 ? 'Luxury estates: 3500-5000+ sq ft, Westlake/Tarrytown/Barton Creek' : 'Premium homes: 2800-3500 sq ft, top school districts'}
- ${ctx.targetPrice >= 1500000 ? 'Waterfront, acreage, custom builds, smart home tech' : 'Updated modern, great lots, premium finishes'}
- Exclusive neighborhoods: ${ctx.targetPrice >= 800000 ? 'Westlake, Rob Roy, Barton Creek' : 'Circle C, Steiner Ranch, Avery Ranch'}

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- Off-market luxury listings (never hit Zillow)
- The jumbo lender with BEST rates (beat competition by 0.25-0.5%)
- Tax strategy: Mortgage vs pay cash (wealth preservation play)
- How to structure offer to win WITHOUT overpaying (my last client saved $47K)

**6. LET'S FIND YOUR PREMIUM PROPERTY** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll send you the luxury/premium listings + off-market opportunities you haven't seen.

${CTA_COMPONENTS.urgency.en(ctx.city)}

Your success earned you the best - let's find it! 🏡✨
${CTA_COMPONENTS.sullySignature.en}

TONE: Sophisticated, premium positioning, wealth preservation, exclusive access
LENGTH: 600-650 words
`,

  [LeadType.MIXED_INCOME_BUYER]: (ctx) => ctx.locale === 'es' ? `
[Spanish mixed income template]
` : `
LEAD MAGNET for mixed income buyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo (W2 + self-employed)
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%
- Employment: Mixed W2 + 1099/self-employed

**1. BEST OF BOTH WORLDS** (Hook):
"W2 + self-employed income? You have the STABILITY of W2 + UPSIDE of business income! I helped 18 mixed-income buyers in Austin this year. Lenders will average BOTH income sources - you're stronger than you think."

**2. YOUR COMBINED BUYING POWER** (Value):
Total income $${ctx.monthlyIncome.toLocaleString()}/mo qualifies you for:
- Price range: $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- DTI: ${ctx.currentDTI}% (including both income sources)

**3. HOW LENDERS VIEW YOUR INCOME** (Documentation):
**W2 portion**:
- Counts: 100% (recent paystubs)
- Verification: Fast (3-5 days)

**Self-employed portion**:
- Counts: 2-year tax average
- Verification: Tax returns, P&L, bank statements
- If trending UP: Some lenders use higher recent year!

**Combined**: You get FULL credit for both = Higher approval amount

**4. WHY YOU'RE APPROVED** (Proof):
Your advantages:
- ✅ W2 stability + self-employed growth = Perfect combo
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Excellent rate tier' : 'Approved'}
- ✅ DTI ${ctx.currentDTI}% = ${ctx.currentDTI <= 36 ? 'Excellent' : 'Good'} debt management
- ✅ ${ctx.downPayment}% down = Strong financial position
- ✅ Diverse income = Lower risk (if one source drops, other remains)

**5. YOUR LOAN PATH** (Options):
Most mixed-income buyers use:
- **Conventional**: Best if W2 portion covers 50%+ of payment
- **Bank Statement Loan**: If self-employed portion is dominant
- **FHA**: If credit <680 or down payment <10%

Your situation: ${ctx.downPayment >= 10 && ctx.creditScore >= '680' ? 'Conventional recommended' : 'FHA likely best option'}

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.lenderConnections.en}
${GAP_PATTERNS.listings.en}
- Which lender LOVES mixed income (closed 42 last year, super flexible)
- How to maximize your self-employed income calculation (legal strategies)
- Documentation checklist (avoid 30-day delays waiting for "one more thing")
- Tax strategy: W2 vs 1099 ratio optimization (talk to CPA)

**6. LET'S PUT YOUR COMBINED INCOME TO WORK** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll connect you with the lender who SPECIALIZES in mixed income (they'll maximize your approval amount).

${CTA_COMPONENTS.urgency.en(ctx.city)}

Two income sources = twice the power! 💪🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Empowering "best of both", income maximization, documentation clarity
LENGTH: 550-600 words
`,

  [LeadType.STANDARD_BUYER]: (ctx) => ctx.locale === 'es' ? `
[Spanish standard buyer template]
` : `
LEAD MAGNET for homebuyer - Sully

PROFILE:
- Income: $${ctx.monthlyIncome.toLocaleString()}/mo
- DTI: ${ctx.currentDTI}%
- Credit: ${ctx.creditScore}
- Down: ${ctx.downPayment}%

**1. YOU'RE APPROVED - LET'S FIND YOUR HOME** (Hook):
"With $${ctx.monthlyIncome.toLocaleString()}/mo income, ${ctx.creditScore} credit, and ${ctx.downPayment}% down, you're in SOLID position to buy in ${ctx.city}. I closed 127 transactions in Austin this year - you're ready!"

**2. YOUR BUYING POWER** (Value):
You qualify for $${Math.round(ctx.targetPrice * 0.85).toLocaleString()}-$${ctx.targetPrice.toLocaleString()}:
- Monthly payment: ~$${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()}
- DTI after purchase: ${Math.round(((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00665) + (ctx.targetPrice * 0.015 / 12) + ctx.monthlyDebts) / ctx.monthlyIncome * 100)}%
- Cash needed: $${Math.round(ctx.targetPrice * ctx.downPayment / 100 + 8000).toLocaleString()} (down + closing)

**3. YOUR LOAN OPTIONS** (Best Fit):
| Program | Down | Monthly Payment* | Total Cash | Best For |
|---------|------|------------------|------------|----------|
| FHA | 3.5% | $${Math.round((ctx.targetPrice * 0.965 * 0.00665) + (ctx.targetPrice * 0.015 / 12)).toLocaleString()} | $${Math.round(ctx.targetPrice * 0.035 + 8000).toLocaleString()} | ${ctx.downPayment < 10 ? 'YOU ✓' : 'Lower down'} |
| Conventional | 5-20% | $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00632) + (ctx.targetPrice * 0.015 / 12) + (ctx.downPayment < 20 ? 120 : 0)).toLocaleString()} | $${Math.round(ctx.targetPrice * ctx.downPayment / 100 + 8000).toLocaleString()} | ${ctx.creditScore >= '680' && ctx.downPayment >= 10 ? 'YOU ✓' : 'Good credit'} |

*Includes taxes & insurance estimate

**4. WHY SELLERS CHOOSE YOU** (Proof):
- ✅ Credit ${ctx.creditScore} = ${ctx.creditScore >= '740' ? 'Excellent approval odds' : ctx.creditScore >= '680' ? 'Strong approval' : 'Approved'}
- ✅ DTI ${ctx.currentDTI}% = ${ctx.currentDTI <= 36 ? 'Excellent financial health' : 'Good capacity'}
- ✅ ${ctx.downPayment}% down = ${ctx.downPayment >= 20 ? 'Strong buyer (no PMI risk)' : 'Solid commitment'}

**5. ${ctx.city.toUpperCase()} MARKET REALITY** (What You'll Get):
At $${ctx.targetPrice.toLocaleString()}:
- ${ctx.targetPrice >= 400000 ? '2000-2400 sq ft, 3-4bd/2-3ba' : '1600-2000 sq ft, 3bd/2ba'}
- ${ctx.targetPrice >= 500000 ? 'Great schools, updated, good neighborhoods' : 'Established areas, move-in ready'}

**5. WHAT I CAN'T SHOW YOU** (Gap):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.lenderConnections.en}
${GAP_PATTERNS.negotiation.en}
- Down payment assistance programs ($5K-$15K grants you might qualify for)

**6. LET'S GET YOU INTO YOUR HOME** (CTA):
📞 ${CTA_COMPONENTS.phone}
I'll connect you with the right lender + show you what's available in your price range.

${CTA_COMPONENTS.urgency.en(ctx.city)}

Your home is out there - let's go find it! 🏡
${CTA_COMPONENTS.sullySignature.en}

TONE: Encouraging, straightforward, action-oriented
LENGTH: 500-550 words
`,
}

// ============================================
// LOAN OPTIONS PROMPT TEMPLATES
// ============================================

const loanPromptTemplates: Record<LeadType, (ctx: PromptContext) => string> = {

  // ITIN loan templates
  [LeadType.ITIN_FIRST_TIME]: (ctx) => ctx.locale === 'es' ? `
OPCIONES DE PRÉSTAMO para comprador ITIN - Sully Ruiz

[Spanish ITIN loan template with lead magnet structure]
` : `
LOAN OPTIONS for ITIN first-time buyer - Sully Ruiz

PROFILE:
- Credit: ${ctx.creditScore}
- Price: $${ctx.targetPrice.toLocaleString()}
- Down: ${ctx.downPayment}%
- Employment: ITIN taxpayer

CRITICAL: ITIN = ONLY portfolio loans (NOT FHA/VA/Conventional)

**1. YOUR LOAN PATH** (Reality Check):
You have ONE option - and it's a GOOD one:
✅ ITIN Portfolio Loans (Non-QM)

NOT eligible for:
🚫 FHA (requires SSN)
🚫 VA (requires military service + SSN)
🚫 Conventional (requires SSN + work authorization)

**2. HOW ITIN LOANS WORK** (Education):
Texas ITIN lenders:
- **Rates**: 7.0-8.5% (your ${ctx.creditScore} credit → likely 7.25-7.75%)
- **Down**: 10-20% minimum (you have ${ctx.downPayment}% ✓)
- **Documentation**: ITIN card, 2yr tax returns, bank statements, passport
- **Processing**: 45-60 days average
- **Lenders**: Inlanta, Angel Oak, Defy, Athas, CrossCountry, Griffin

**3. YOUR MONTHLY PAYMENTS** (Real Numbers):
At $${ctx.targetPrice.toLocaleString()} with ${ctx.downPayment}% down:

| Rate | Monthly P&I | Total Payment* | 30-Yr Cost |
|------|-------------|----------------|------------|
| 7.25% | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00682).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00682 + ctx.targetPrice * 0.015 / 12).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00682 * 360).toLocaleString()} |
| 7.75% | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00715).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00715 + ctx.targetPrice * 0.015 / 12).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00715 * 360).toLocaleString()} |
| 8.25% | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00748).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00748 + ctx.targetPrice * 0.015 / 12).toLocaleString()} | $${Math.round(ctx.targetPrice * (1 - ctx.downPayment/100) * 0.00748 * 360).toLocaleString()} |

*Includes taxes & insurance estimate

**4. WHY LENDERS WANT YOU** (Proof):
Your profile strengths:
- ${ctx.downPayment}% down = Strong commitment (lenders love this)
- ${ctx.creditScore} credit = ${ctx.creditScore >= '680' ? 'Excellent for ITIN' : 'Acceptable range'}
- Tax history = Proven income stability
- DTI ${ctx.currentDTI}% = ${ctx.currentDTI <= 36 ? 'Excellent' : 'Acceptable'}

**5. WHAT I CAN'T TELL YOU HERE** (Gap):
${GAP_PATTERNS.lenderConnections.en}
- Which 2 of the 6 lenders actually SPECIALIZE in ITIN (faster approvals, better rates)
- The document preparation strategy that gets 48hr pre-approvals
- How my last ITIN client negotiated from 8.0% to 7.4% (saved $${Math.round((ctx.targetPrice * (1 - ctx.downPayment/100) * 0.0006) * 360).toLocaleString()} over life of loan)

**6. YOUR NEXT STEP** (CTA):
📞 ${CTA_COMPONENTS.phone} - Call me this week
I'll introduce you to THE lender (not just any lender) who approved my last 3 ITIN clients in 48 hours.

${CTA_COMPONENTS.urgency.en(ctx.city)}

You CAN buy a home with ITIN - let's make it happen! 🏡
${CTA_COMPONENTS.sullySignature.en}

CRITICAL: DO NOT mention FHA/VA/Conventional as options
LENGTH: 600-700 words
`,

  [LeadType.ITIN_INVESTOR]: (ctx) => `
ITIN Portfolio Loan for investment - Same as ITIN_FIRST_TIME but emphasize:
- Conventional NOT available for investors (SSN required)
- Only ITIN portfolio loans work
- Slightly higher rates for investment (7.5-9%)
- 20-25% down typical for investment
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.ITIN_UPSIZING]: (ctx) => `
ITIN Portfolio Loan for upsizing - Highlight:
- Same ITIN lenders (Inlanta, Angel Oak, etc.)
- Can use equity from current home sale
- If keeping current home: Need 20%+ down on new
- Refi option in future if getting SSN
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,

  // Self-employed loan templates
  [LeadType.SELF_EMPLOYED_FIRST_TIME]: (ctx) => `
Conventional or FHA for self-employed - Key points:
- FHA: 3.5% down, 2yr tax returns, easier approval
- Conventional: 5-20% down, better rate if 740+ credit
- Income: 2-year tax average (they average your net)
- Reserve requirements: 6mo PITI (higher than W2)
- Best lenders who love 1099/self-employed buyers
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.SELF_EMPLOYED_INVESTOR]: (ctx) => `
Conventional investor for self-employed:
- 15-25% down required
- 2yr business + personal tax returns
- Rental income (75% counts toward DTI)
- Reserves: 6mo PITI
- Bank statement loans alternative (if inconsistent taxes)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.SELF_EMPLOYED_UPSIZING]: (ctx) => `
Conventional for self-employed upsizing:
- Can use home equity for down payment
- Qualify with 2yr tax average
- If income trending UP: some lenders use recent year
- Best path: Sell first (cleaner approval)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,

  // W2 loan templates
  [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: (ctx) => `
FHA vs Conventional comparison:
- FHA: 3.5% down, ~6.5% rate, PMI required
- Conventional: 5-20% down, ~6.0-6.5% rate, PMI if <20%
- Your ${ctx.creditScore} credit = 0.5% rate advantage!
- Recommendation: ${ctx.downPayment >= 10 ? 'Conventional (better long-term)' : 'FHA (less cash needed)'}
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.W2_FIRST_TIME_LOW_CREDIT]: (ctx) => `
FHA recommended for credit ${ctx.creditScore}:
- 3.5% down payment
- 620+ credit approved
- PMI: $${Math.round(ctx.targetPrice * 0.0085 / 12)} /mo
- PLAN: Buy with FHA → improve credit → refi to conventional in 12-18mo
- Save ~$${Math.round(ctx.targetPrice * 0.965 * 0.006 / 12)}/mo after refi
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.W2_INVESTOR]: (ctx) => `
Conventional investor loan for W2:
- 15-25% down (you have ${ctx.downPayment}%)
- Rates: 6.5-7.0% (W2 = best investor rates)
- Rental income: 75% counts toward DTI
- Reserves: 6mo PITI required
- Your W2 = lender's FAVORITE investor type
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.W2_UPSIZING]: (ctx) => `
Conventional for W2 upsizing:
- Use equity from sale as down payment
- Fast approval (W2 verification = 3-5 days)
- Best path: Sell first → buy with no contingency
- Alternative: HELOC + buy (if strong equity)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,

  // Military/Veteran loan templates
  [LeadType.MILITARY_VETERAN_FIRST_TIME]: (ctx) => `
VA Loan - Your BEST option:
- 0% down payment required
- No PMI ever
- Rates: ~6.0-6.5% (best available)
- Funding fee: 2.3% first-time (can roll into loan)
- Disability exemption: Waive funding fee if 10%+ rating
- VA specialists who understand benefits inside-out
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone} - THANK YOU FOR YOUR SERVICE! 🇺🇸
`,
  [LeadType.MILITARY_VETERAN_UPSIZING]: (ctx) => `
VA Loan REUSE for upsizing:
- Use VA benefit AGAIN at 0% down
- Sell current home → releases entitlement → buy new with VA
- OR: Keep current (if full entitlement remains)
- No PMI on new home
- Disability exemption available
- VA entitlement calculator (call me)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone} - You earned this TWICE! 🇺🇸
`,

  // Other loan templates
  [LeadType.RETIRED_BUYER]: (ctx) => `
Conventional or FHA for retirees:
- Income sources accepted: Social Security, pension, IRA/401k distributions, investment income
- FHA: 3.5% down
- Conventional: 5-20% down, better if 740+ credit
- Lenders LOVE retirees (stable income, low debt, excellent credit)
- No job loss risk = lower lender risk
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.HIGH_NET_WORTH]: (ctx) => `
Jumbo vs Conventional loan:
- Conforming limit: $766,550 (2024)
- Your price $${ctx.targetPrice.toLocaleString()} = ${ctx.targetPrice >= 766550 ? 'Jumbo required' : 'Conventional available'}
- Jumbo rates: 6.25-6.75%
- Conventional rates: 6.0-6.5%
- Down: You have ${ctx.downPayment}% ✓
- Reserves: ${ctx.targetPrice >= 766550 ? '12mo PITI' : '2-6mo PITI'}
- Strategy: Mortgage vs pay cash (wealth preservation - call to discuss)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.MIXED_INCOME_BUYER]: (ctx) => `
Conventional for mixed W2 + self-employed:
- W2 portion: 100% counts (fast verification)
- Self-employed portion: 2-year tax average
- Combined income = higher approval amount
- Documentation: Paystubs + 2yr tax returns + P&L
- Lenders who SPECIALIZE in mixed income
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
  [LeadType.STANDARD_BUYER]: (ctx) => `
FHA vs Conventional:
- FHA: 3.5% down, easier approval
- Conventional: 5-20% down, better long-term if good credit
- Your best fit: ${ctx.creditScore >= '680' && ctx.downPayment >= 10 ? 'Conventional' : 'FHA'}
- Down payment assistance: $5K-$15K grants available (ask me)
${GAP_PATTERNS.lenderConnections.en}
Phone: ${CTA_COMPONENTS.phone}
`,
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
  const loanTemplate = loanPromptTemplates[leadProfile.leadType] || loanPromptTemplates[LeadType.STANDARD_BUYER]

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
Análisis de ubicación INMERSIVO para comprador en ${ctx.city}, TX - Sully Ruiz

BÚSQUEDA:
- Ciudad: ${ctx.city}, TX
- Presupuesto: $${ctx.targetPrice.toLocaleString()}
- Prioridades: ${ctx.locationPriorities}
- Tamaño hogar: ${ctx.householdSize} personas

FORMATO REQUERIDO (LEAD MAGNET):

**1. Realidad del Mercado** (2-3 oraciones):
Qué compra $${ctx.targetPrice.toLocaleString()} REALMENTE en ${ctx.city} hoy. Nivel de competencia actual.

**2. Tus 3 Mejores Vecindarios** (150 palabras c/u):
Para cada vecindario:
- 🏡 Tipo de propiedad típica a $${ctx.targetPrice.toLocaleString()}
- ✅ Por qué encaja con ${ctx.locationPriorities}
- 📍 Calles específicas: "[Calle], [Calle], [Calle]"
- 💡 Tip interno (mejor hora para visitar, secreto local, tendencia)
- 📊 Datos: Precio promedio | Días en mercado | Competencia

**3. Estrategia Ganadora** (4 bullets):
Cómo ganar contra 5-8 ofertas competidoras

**4. Imagina Tu Sábado** (1 párrafo):
Café por la mañana en [CAFÉ REAL] → tarde en [PARQUE REAL] → cena en [RESTAURANTE REAL].

**5. Lo Que No Puedo Mostrarte Aquí** (Gap - 3 bullets):
- Casas que llegan al mercado 7-10 días antes de Zillow
- Listings de bolsillo en TUS vecindarios
- Cómo ganar guerras de ofertas múltiples

**6. PRÓXIMO PASO**:
📞 ${CTA_COMPONENTS.phone}
Te mostraré las propiedades disponibles ahora + las que vienen próxima semana.

${CTA_COMPONENTS.urgency.es(ctx.city)}

${CTA_COMPONENTS.sullySignature.es}

TONO: Experto local entusiasta, insider knowledge
LONGITUD: 650-750 palabras
CRITICAL: NO preambles, START con realidad mercado, usar ## para headers
` : `
IMMERSIVE location analysis for homebuyer in ${ctx.city}, TX - Sully Ruiz

BUYER'S SEARCH:
- Target city: ${ctx.city}, TX
- Budget: $${ctx.targetPrice.toLocaleString()}
- Top priorities: ${ctx.locationPriorities}
- Household size: ${ctx.householdSize} people

REQUIRED FORMAT (LEAD MAGNET):

**1. Market Reality** (2-3 sentences):
What $${ctx.targetPrice.toLocaleString()} ACTUALLY buys in ${ctx.city} today. Current competition level.

**2. Your ${ctx.city} Playbook** - Top 3 Neighborhoods (~150 words each):
For EACH neighborhood:
- 🏡 Property type + sq ft at $${ctx.targetPrice.toLocaleString()}
- ✅ Perfect for ${ctx.locationPriorities} because... (specific reasons)
- 📍 Specific streets: "[Street], [Street], [Street]"
- 💡 Insider tip (best time to visit, local secret, trend)
- 📊 Real data: Avg price $X-Y | X days on market | Competition level

**3. Win Strategy** (4 bullets):
How to beat 5-8 competing offers at this price point

**4. Imagine Your Saturday** (1 paragraph):
Morning coffee at [REAL CAFE] → afternoon at [REAL PARK] → dinner at [REAL RESTAURANT]. Paint the picture with REAL place names.

**5. What I Can't Show You Here** (Gap - 3 bullets):
${GAP_PATTERNS.listings.en}
${GAP_PATTERNS.negotiation.en}
- Off-market pocket listings in YOUR neighborhoods

**6. YOUR NEXT STEP**:
📞 ${CTA_COMPONENTS.phone}
I'll show you what's available now + what's coming next week.

${CTA_COMPONENTS.urgency.en(ctx.city)}

${CTA_COMPONENTS.sullySignature.en}

TONE: Enthusiastic local expert, insider knowledge, create FOMO for personal tour
LENGTH: 650-750 words
CRITICAL: NO preambles ("Alright!", "Let me show you"), START with market reality, use ## for ALL headers
`
}

/**
 * Gets prompt strategy description for lead type
 */
export function getPromptStrategy(leadType: LeadType): string {
  const strategies: Record<LeadType, string> = {
    [LeadType.ITIN_FIRST_TIME]: 'Focus on ITIN-specific requirements, realistic expectations, portfolio lender education',
    [LeadType.ITIN_INVESTOR]: 'Investment property focus, ITIN documentation, higher down payment strategies',
    [LeadType.ITIN_UPSIZING]: 'Leverage equity from current home, upsizing with ITIN constraints',
    [LeadType.SELF_EMPLOYED_FIRST_TIME]: 'Tax return optimization, bank statement loans, reserve requirements',
    [LeadType.SELF_EMPLOYED_INVESTOR]: 'Business income + investment property, DSCR loans',
    [LeadType.SELF_EMPLOYED_UPSIZING]: 'Leverage business success for bigger home',
    [LeadType.W2_FIRST_TIME_GOOD_CREDIT]: 'Emphasize credit advantage, FHA vs Conventional comparison, rate optimization',
    [LeadType.W2_FIRST_TIME_LOW_CREDIT]: 'Credit building guidance, FHA benefits, path to better rates',
    [LeadType.W2_INVESTOR]: 'W2 income stability for investment property approval',
    [LeadType.W2_UPSIZING]: 'Leverage W2 employment for upsizing approval',
    [LeadType.MILITARY_VETERAN_FIRST_TIME]: 'VA loan benefits, 0% down advantage, military-specific programs',
    [LeadType.MILITARY_VETERAN_UPSIZING]: 'VA loan reuse, military upsizing benefits',
    [LeadType.RETIRED_BUYER]: 'Asset depletion loans, SSI/pension documentation, no employment verification',
    [LeadType.HIGH_NET_WORTH]: 'Jumbo options, tax strategies, portfolio management',
    [LeadType.MIXED_INCOME_BUYER]: 'W2 + self-employed income optimization, documentation strategy',
    [LeadType.STANDARD_BUYER]: 'Standard homebuyer guidance with lead magnet structure'
  }

  return strategies[leadType] || 'Standard approach'
}
