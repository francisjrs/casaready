import { NextRequest, NextResponse } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import type { PlanGenerationInput } from '@/validators/planning-schemas'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Demo API: Starting Gemini test (with enhanced error logging)...')

    const body = await request.json() as { scenario: PlanGenerationInput }
    const { scenario } = body

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario data is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Demo API: Testing scenario for ${scenario.userProfile.contact.firstName} ${scenario.userProfile.contact.lastName}`)

    // Create Gemini client (will pick up GEMINI_API_KEY from server environment)
    const geminiClient = createGeminiClient()

    // For demo purposes, let's start with just markdown generation to test the formatting
    console.log('📝 Demo API: Generating markdown analysis...')
    const markdownAnalysis = await geminiClient.generateMarkdownAnalysis(scenario)

    // Create a simplified structured response for demo
    const simplifiedStructured = {
      id: `demo-${Date.now()}`,
      userId: scenario.userProfile.contact.email,
      language: scenario.preferences.language,
      estimatedPrice: Math.round(scenario.userProfile.incomeDebt.annualIncome * 3.5),
      maxAffordable: Math.round(scenario.userProfile.location.maxBudget * 0.9),
      monthlyPayment: Math.round(scenario.userProfile.incomeDebt.annualIncome / 12 * 0.28),
      programFit: ['FHA Loan', 'Conventional Loan', 'First-Time Buyer Programs'],
      actionPlan: [
        'Get pre-approved for a mortgage',
        'Find a real estate agent',
        'Start house hunting',
        'Make an offer',
        'Complete home inspection',
        'Close on your home'
      ],
      tips: [
        'Shop around for the best mortgage rates',
        'Get a professional home inspection',
        'Save for closing costs and moving expenses',
        'Consider the total cost of homeownership',
        'Don\'t rush - take time to find the right home'
      ],
      primaryLeadType: scenario.userProfile.location.firstTimeBuyer ? 'First-Time Buyer' : 'Experienced Buyer',
      reportContent: markdownAnalysis,
      aiGenerated: true
    }

    console.log('✅ Demo API: Test completed successfully!')

    return NextResponse.json({
      success: true,
      structured: simplifiedStructured,
      markdown: markdownAnalysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Demo API: Test failed:', error)

    // If it's a GeminiValidationError, include the validation details
    if (error && typeof error === 'object' && 'validationErrors' in error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini output validation failed',
          validationErrors: (error as any).validationErrors,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}