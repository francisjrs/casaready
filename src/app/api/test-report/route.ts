import { NextRequest, NextResponse } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import { createPrivacySafePlanInput, type WizardData, type ContactInfo } from '@/lib/services/ai-service'
import type { Locale } from '@/lib/i18n'

// Dev-only endpoint for testing report generation
export const runtime = 'nodejs'
export const maxDuration = 60

// Test data presets
const TEST_SCENARIOS = {
  'first-time-buyer': {
    wizardData: {
      city: 'Round Rock',
      zipCode: '78664',
      locationPriority: ['schools', 'safety'],
      timeline: '3-6',
      budgetType: 'price' as const,
      targetPrice: 350000,
      annualIncome: 85000,
      monthlyDebts: 400,
      creditScore: '740-799',
      downPaymentPercent: 3,
      employmentType: 'w2',
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
      city: 'Austin',
      zipCode: '78701',
      locationPriority: ['commute', 'amenities'],
      timeline: '0-3',
      budgetType: 'price' as const,
      targetPrice: 550000,
      annualIncome: 200000,
      monthlyDebts: 1000,
      creditScore: '800+',
      downPaymentPercent: 10,
      employmentType: 'w2',
      buyerType: ['investor'],
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
      city: 'Hutto',
      zipCode: '78634',
      locationPriority: ['price', 'schools'],
      timeline: '6-12',
      budgetType: 'price' as const,
      targetPrice: 280000,
      annualIncome: 65000,
      monthlyDebts: 600,
      creditScore: '620-679',
      downPaymentPercent: 3,
      employmentType: 'w2',
      buyerType: ['first-time'],
      householdSize: 3
    },
    contactInfo: {
      firstName: 'Budget',
      lastName: 'Conscious',
      email: 'budget@example.com',
      phone: '555-9012'
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

    // Model selection (same as production)
    const MODELS = {
      financial: 'gemini-2.5-pro',
      loanOptions: 'gemini-2.5-flash',
      location: 'gemini-2.5-flash'
    }

    const sections: Record<string, string> = {}

    // SECTION 1: Financial Analysis
    console.log('\n🔄 Generating Financial Analysis (Pro)...')
    const financialStart = Date.now()

    const income = fullPlanInput.userProfile.incomeDebt.annualIncome
    const monthlyIncome = Math.round(income / 12)
    const monthlyDebts = fullPlanInput.userProfile.incomeDebt.monthlyDebts
    const creditScore = fullPlanInput.userProfile.incomeDebt.creditScore
    const downPaymentPct = wizardData.downPaymentPercent || 3
    const targetPrice = wizardData.targetPrice || Math.round(income * 3.5)

    // CONTEXT CACHING OPTIMIZATION: Place static instructions FIRST, then variable data
    // This allows Gemini to cache the instruction portion (75% discount on cached tokens)
    const financialPrompt = `You are a financial advisor. Write financial analysis at a 3rd grade reading level.

INSTRUCTIONS:
- Use simple, short sentences that a 3rd grader can understand
- Explain money concepts using everyday examples (like building blocks, report cards)
- Generate max 250 words
- Include specific dollar amounts in calculations
- Create tables using markdown format

REQUIRED SECTIONS:
## 💰 Financial Analysis

**Your Money:**
- Income: [explain monthly income in simple terms]
- Debts: [explain what debts are and monthly amount]
- Available: [calculate income - debts and explain what's left]

**Price Comparison Table:**
Create a table with 3 price points showing:
| House Price | Down Payment (X%) | Closing Costs (Est.) | Total Cash Needed |

**Total Cash Needed:**
Break down the total cash needed on closing day:
- Down Payment: $X (explain what this is)
- Closing Costs: $X (explain what this is)
- Total: $X

---
USER DATA (use these exact numbers in your analysis):
Annual income: $${income.toLocaleString()} ($${monthlyIncome.toLocaleString()}/month)
Monthly debts: $${monthlyDebts.toLocaleString()}
Credit score: ${creditScore}
Down payment: ${downPaymentPct}%
Target price: $${targetPrice.toLocaleString()}`

    let financialContent = ''
    for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, financialPrompt, 800, MODELS.financial)) {
      financialContent += chunk
    }

    sections.financial = financialContent
    sectionTimes.financial = Date.now() - financialStart

    // SECTION 2: Loan Options
    console.log('🔄 Generating Loan Options (Flash)...')
    const loanStart = Date.now()

    // CONTEXT CACHING: Static instructions first for cache hits
    const loanPrompt = `You are a loan advisor. Write loan options at a 3rd grade reading level.

INSTRUCTIONS:
- Use simple, short sentences for 3rd graders
- Explain loan types using everyday comparisons
- Generate max 300 words
- Include specific program names and features
- Create comparison tables using markdown

REQUIRED SECTIONS:
## 🏦 Loan Options

**Best Program:**
Recommend the best loan program based on the user's credit score and down payment.

**Program Comparison Table:**
Create a table comparing:
| Loan Type | Down Payment | Who It's For | Monthly Extra Cost (PMI) |
Include: Conventional, FHA, VA

**Texas Programs:**
Explain these Texas-specific programs:
- TSAHC (Texas State Affordable Housing Corporation): Up to $15,000 down payment assistance
- Hometown Heroes: 0.25% rate discount for teachers, firefighters, police, nurses, etc.

---
USER DATA (use these exact numbers):
Credit score: ${creditScore}
Target price: $${targetPrice.toLocaleString()}
Down payment: ${downPaymentPct}%`

    let loanContent = ''
    for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, loanPrompt, 1000, MODELS.loanOptions)) {
      loanContent += chunk
    }

    sections.loanOptions = loanContent
    sectionTimes.loanOptions = Date.now() - loanStart

    // SECTION 3: Location
    console.log('🔄 Generating Location Analysis (Flash)...')
    const locationStart = Date.now()

    // CONTEXT CACHING: Static instructions first for cache hits
    const locationPrompt = `You are a real estate expert. Write location analysis at a 3rd grade reading level.

INSTRUCTIONS:
- Use simple, short sentences for 3rd graders
- Explain real estate concepts using everyday comparisons
- Generate max 350 words
- Include specific city names and price comparisons
- Be honest about what the budget can afford

REQUIRED SECTIONS:
## 📍 Location & Market

**Market Reality:**
- State the median home price in the target city
- Calculate the budget gap (median price - user's budget)
- Explain if their budget is above, below, or at the median

**What You Get:**
Explain what types of properties they can realistically find:
- Single-family homes (houses with yards)
- Townhomes (houses that share walls)
- Condos (apartments you own)
- Mobile homes
- Older vs. newer properties
- Size and condition expectations

**Alternatives:**
List 3 nearby cities with lower median prices where their budget goes further.
Explain how far each city is and what makes it different.

---
USER DATA (use these exact details):
City: ${wizardData.city}
Budget: $${targetPrice.toLocaleString()}`

    let locationContent = ''
    for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput, false, locationPrompt, 1200, MODELS.location)) {
      locationContent += chunk
    }

    sections.location = locationContent
    sectionTimes.location = Date.now() - locationStart

    const totalTime = Date.now() - startTime

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
        models: MODELS
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
