import { NextRequest } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import { createPrivacySafePlanInput, type WizardData, type ContactInfo } from '@/lib/services/ai-service'
import type { PrivacySafePlanGenerationInput } from '@/validators/planning-schemas'
import type { Locale } from '@/lib/i18n'

// Vercel serverless configuration
export const runtime = 'nodejs' // Use Node.js runtime for Gemini API
export const maxDuration = 30 // Max 30s for Hobby plan (60s for Pro)
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

          let accumulatedContent = ''
          let chunkCount = 0

          // Send initial status
          const startEvent = `data: ${JSON.stringify({
            type: 'start',
            message: 'Generating your personalized homebuying report...'
          })}\n\n`
          controller.enqueue(encoder.encode(startEvent))

          // Process streaming response using full plan input
          for await (const chunk of geminiClient.generateMarkdownAnalysisStream(fullPlanInput)) {
            chunkCount++
            accumulatedContent += chunk

            try {
              // Send each chunk to client (check if controller is still open)
              const chunkEvent = `data: ${JSON.stringify({
                type: 'chunk',
                content: chunk,
                accumulated: accumulatedContent,
                chunkNumber: chunkCount
              })}\n\n`
              controller.enqueue(encoder.encode(chunkEvent))

              if (process.env.NODE_ENV === 'development') {
                console.log(`📨 Wizard Streaming API: Sent chunk ${chunkCount}, length: ${chunk.length}`)
              }
            } catch (controllerError) {
              console.log(`🔌 Wizard Streaming API: Client disconnected during chunk ${chunkCount}`)
              break // Exit the loop if client disconnected
            }
          }

          // Check if we received any content from Gemini
          if (!accumulatedContent || accumulatedContent.trim().length === 0) {
            throw new Error('No content received from Gemini API - streaming may have failed')
          }

          console.log(`✅ Wizard Streaming API: Received ${chunkCount} chunks with ${accumulatedContent.length} total characters`)

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
            totalChunks: chunkCount,
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(completeEvent))

          console.log(`✅ Wizard Streaming API: Completed successfully with ${chunkCount} chunks for locale "${locale}"`)

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