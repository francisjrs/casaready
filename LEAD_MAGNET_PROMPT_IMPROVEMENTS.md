# 🎯 Lead Magnet Prompt Improvements

## Current Issues with Output:
1. **Too formal/robotic** - Reads like a bank report, not a personal guide
2. **No emotional connection** - Doesn't celebrate buyer's achievements or paint a picture
3. **Missing urgency** - No market context or time-sensitive insights
4. **No clear CTA** - Doesn't guide buyer to next action
5. **Generic advice** - Could apply to anyone, not personalized enough

---

## 📝 Enhanced Prompts for Each Section

### 1. Financial Analysis Prompt (BEFORE)
```
Financial analysis: Income ${monthlyIncome}/month, Debts ${monthlyDebts}, DTI ${currentDTI}%, Credit ${creditScore}. Generate price comparison table ${pricePoints.join(', ')}.
```

### 1. Financial Analysis Prompt (IMPROVED)
```typescript
const financialPrompt = locale === 'es'
  ? `Crea un análisis financiero PERSONALIZADO y MOTIVADOR como REGALO para un comprador de vivienda.

DATOS DEL COMPRADOR:
- Ingreso mensual: $${monthlyIncome}
- Deudas mensuales: $${monthlyDebts}
- DTI actual: ${currentDTI}%
- Puntuación de crédito: ${creditScore}
- Enganche disponible: ${downPaymentPct}%

FORMATO REQUERIDO:
1. **Celebración Inicial**: Felicita al comprador por sus logros financieros (si DTI < 36% o crédito > 700)
2. **Tu Poder de Compra**: Explica en lenguaje simple qué significa su perfil financiero
3. **Tabla Comparativa de Precios**: ${pricePoints.join(', ')} con:
   - Pago mensual total (PITI)
   - Efectivo necesario para cerrar
   - Nuevo DTI resultante
   - ✅/⚠️ Indicadores de salud financiera
4. **Ventaja Competitiva**: Cómo su perfil les da ventaja en el mercado
5. **Respiro Financiero**: Cuánto dinero les queda después del pago para vivir/ahorrar
6. **Datos del Mercado Actual**: Tasas de hoy, tendencias de precios (si disponible)

TONO: Amigable, celebratorio, empoderador. Como un asesor que se preocupa por su éxito.
INCLUYE: Emojis relevantes (💰 📊 ✅), ejemplos reales, contexto del mercado.
EVITA: Jerga técnica sin explicar, tono corporativo frío, advertencias excesivas.`

  : `Create a PERSONALIZED and MOTIVATING financial analysis as a GIFT for a homebuyer.

BUYER DATA:
- Monthly income: $${monthlyIncome}
- Monthly debts: $${monthlyDebts}
- Current DTI: ${currentDTI}%
- Credit score: ${creditScore}
- Down payment available: ${downPaymentPct}%

REQUIRED FORMAT:
1. **Celebration Opening**: Congratulate buyer on financial achievements (if DTI < 36% or credit > 700)
2. **Your Buying Power**: Explain in simple terms what their profile means
3. **Price Comparison Table**: ${pricePoints.join(', ')} including:
   - Total monthly payment (PITI)
   - Cash needed to close
   - Resulting new DTI
   - ✅/⚠️ Financial health indicators
4. **Competitive Advantage**: How their profile gives them an edge in market
5. **Financial Breathing Room**: How much money left after payment for life/savings
6. **Current Market Data**: Today's rates, price trends (if available via grounding)

TONE: Friendly, celebratory, empowering. Like an advisor who cares about their success.
INCLUDE: Relevant emojis (💰 📊 ✅), real examples, market context.
AVOID: Technical jargon without explanation, cold corporate tone, excessive warnings.`
```

---

### 2. Loan Options Prompt (BEFORE)
```
Loan options: Credit ${creditScore2}, Price ${targetPrice2}, First-time: ${isFirstTime ? 'Yes' : 'No'}, Military: ${isMilitary ? 'Yes' : 'No'}. Compare FHA, VA, Conventional.
```

### 2. Loan Options Prompt (IMPROVED)
```typescript
const loanPrompt = locale === 'es'
  ? `Crea una comparación de préstamos PERSONALIZADA como guía de regalo para comprador.

PERFIL:
- Crédito: ${creditScore2}
- Precio objetivo: $${targetPrice2}
- Primera vez: ${isFirstTime ? 'SÍ' : 'No'}
- Militar/Veterano: ${isMilitary ? 'SÍ' : 'No'}

FORMATO REQUERIDO:
1. **Resumen Ejecutivo Rápido**: Cuál es EL MEJOR préstamo para ELLOS (1-2 líneas)
2. **Comparación de Programas**:
   ${isMilitary ? '✅ VA Loan (Tu mejor opción como veterano)' : '⚠️ VA Loan (No elegible)'}
   ${isFirstTime ? '✅ FHA Loan (Opción de primera vez)' : 'ℹ️ FHA Loan'}
   ✅ Conventional Loan

   Para cada uno ELEGIBLE, incluye:
   - Ventajas ESPECÍFICAS para su situación
   - Desventajas honestas
   - Pago mensual estimado para $${targetPrice2}
   - Cuándo tiene sentido elegirlo

3. **Recomendación Personal**: "Basado en tu ${creditScore2} crédito y ${isFirstTime ? 'estatus de primera vez' : 'experiencia'}, te recomiendo..."
4. **Ahorros Potenciales**: Cuánto pueden ahorrar eligiendo el préstamo correcto ($/mes y total 30 años)
5. **Próximos Pasos**: Qué hacer esta semana para avanzar

TONO: Guía de confianza, no vendedor. Honesto sobre pros/contras.
INCLUYE: Números reales, comparaciones lado a lado, contexto de por qué importa.
EVITA: Recomendar productos no elegibles, ser vago, solo listar características.`

  : `Create a PERSONALIZED loan comparison as a gift guide for homebuyer.

PROFILE:
- Credit: ${creditScore2}
- Target price: $${targetPrice2}
- First-time: ${isFirstTime ? 'YES' : 'No'}
- Military/Veteran: ${isMilitary ? 'YES' : 'No'}

REQUIRED FORMAT:
1. **Quick Executive Summary**: What's THE BEST loan for THEM (1-2 lines)
2. **Program Comparison**:
   ${isMilitary ? '✅ VA Loan (Your best option as veteran)' : '⚠️ VA Loan (Not eligible)'}
   ${isFirstTime ? '✅ FHA Loan (First-time option)' : 'ℹ️ FHA Loan'}
   ✅ Conventional Loan

   For each ELIGIBLE program, include:
   - SPECIFIC advantages for their situation
   - Honest disadvantages
   - Estimated monthly payment for $${targetPrice2}
   - When it makes sense to choose it

3. **Personal Recommendation**: "Based on your ${creditScore2} credit and ${isFirstTime ? 'first-time status' : 'experience'}, I recommend..."
4. **Potential Savings**: How much they can save choosing right loan ($/month and 30-year total)
5. **Next Steps**: What to do this week to move forward

TONE: Trusted advisor, not salesperson. Honest about pros/cons.
INCLUDE: Real numbers, side-by-side comparisons, context of why it matters.
AVOID: Recommending ineligible products, being vague, just listing features.`
```

---

### 3. Location Analysis Prompt (BEFORE)
```
Location analysis: ${city}, TX. Budget ${targetPrice}. Priorities: ${locationPriorities.join(', ') || 'N/A'}. Include real market data.
```

### 3. Location Analysis Prompt (IMPROVED)
```typescript
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
EVITA: Generalidades, datos desactualizados, listar sin contexto.`

  : `Create an IMMERSIVE location analysis as a gift guide for homebuyer.

BUYER'S SEARCH:
- Target city: ${city}, TX
- Budget: $${targetPrice}
- Top priorities: ${locationPriorities.join(', ') || 'Overall balance'}
- Household size: ${householdSize} people

REQUIRED FORMAT:
1. **Market Reality Summary** (2-3 lines):
   - What $${targetPrice} ACTUALLY buys in ${city} today
   - Market competition level

2. **Recommended Neighborhoods** (Top 3-4):
   For each:
   - 🏡 Typical property type at $${targetPrice}
   - ✅ Why it matches their priorities (${locationPriorities.join(', ')})
   - 📍 Specific street/area examples
   - 💡 Insider tip (best times to visit, trends, etc.)
   - 📊 Real data: avg price, days on market, offer competition

3. **Winning Strategy**:
   - How to beat other buyers in this market
   - Local secrets most don't know
   - Smart compromises if needed

4. **Visualize Your Life Here**:
   - Paint picture of typical day in recommended neighborhood
   - Specific coffee shops, parks, restaurants nearby
   - Why they'll love living there

5. **Immediate Action**: Which neighborhoods to see this weekend

TONE: Enthusiastic local expert, storyteller. Like friend who knows the city.
INCLUDE: Real market data (via grounding), specific street/place names, cultural context.
AVOID: Generalities, outdated data, listing without context.`
```

---

## 🎨 Visual Formatting Improvements

Add these markdown formatting guides to system prompt:

```typescript
const systemPromptAddition = `
FORMATTING REQUIREMENTS FOR LEAD MAGNET:

1. **Use Visual Hierarchy**:
   - Start sections with 🎉 emoji for celebrations
   - Use ✅ for advantages, ⚠️ for cautions, 💡 for tips
   - Add 📊 for data, 💰 for money insights

2. **Make Tables Engaging**:
   - Use emoji in headers (💵 Income, 🏠 Price, ✅ Status)
   - Add color indicators: ✅ Good | ⚠️ Caution | ❌ Avoid

3. **Create Scannable Content**:
   - Bold key numbers and recommendations
   - Use bullet points with icons
   - Add summary boxes with borders

4. **Personal Touches**:
   - Address reader as "you" not "the buyer"
   - Celebrate their achievements
   - Paint vivid pictures of their future

5. **Action-Oriented**:
   - End each section with "Your Next Step"
   - Include specific timelines (This Week, Today, etc.)
   - Make CTAs clear and urgent
`
```

---

## 📊 Expected Output Improvements

### BEFORE (Current Output):
> "Your DTI is 28%. This is good."

### AFTER (Improved Output):
> "🎉 **Your DTI is 28%** - That's exceptional! You're well below the 43% maximum, which means:
> - ✅ Lenders will compete for your business
> - 💰 You qualify for the best interest rates
> - 🏠 You have $2,500/month in financial breathing room
>
> **What this means:** While others max out at 43% DTI, you're at 28% - that's $72,000 in extra savings over 30 years you can use for renovations, vacations, or investments! 💪"

---

## 🚀 Implementation Steps

1. **Update wizard-stream/route.ts prompts** (lines 156-158, 189-191, 221-223)
2. **Add system prompt enhancements** to gemini-client.ts template registration
3. **Test output** with dev-test page
4. **Compare before/after** readability and engagement
5. **A/B test** if needed (track lead conversion rates)

---

## 🎯 Success Metrics for Lead Magnet

Track these to measure improvement:

1. **Lead Quality**
   - % who book consultation after reading report
   - Time spent reading (analytics)
   - Sections most read/shared

2. **Engagement**
   - Email open rates when report sent
   - Social shares of report
   - Questions/replies from leads

3. **Conversion**
   - Report → Consultation booking rate
   - Consultation → Client conversion
   - Time to conversion

---

## 💡 Additional Enhancements

### Add to End of Report:
```markdown
---

## 🎁 Your Personal Next Steps

**This Week (Before Rates Change):**
- [ ] Get pre-approved by 3 lenders I recommend (I'll introduce you)
- [ ] Tour your top 3 neighborhoods this weekend
- [ ] Review your "hidden gem" strategy from location section

**Why This Week Matters:**
Austin homes at your price point get 5-8 offers within 72 hours. Every day you wait, you compete with 3-5 new buyers entering the market.

**📅 Ready to Start?**
Book your free 30-minute strategy call:
[Schedule Here] → https://calendly.com/your-link

**Questions? Text me directly:**
(512) XXX-XXXX - I respond within 2 hours

**P.S.** Bring this report to our call - we'll use it to create your personalized winning strategy. See you soon! 🏡

---

*This analysis prepared exclusively for [FirstName] [LastName]*
*Market data current as of [Date]*
*[Your Name], [Your Title] | [Brokerage Name]*
```

---

This transforms the output from a generic calculator result into a valuable, personalized gift that positions you as a trusted advisor! 🎯
