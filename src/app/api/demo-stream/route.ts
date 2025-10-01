import { NextRequest } from 'next/server'
import { createGeminiClient } from '@/ai/gemini-client'
import type { PlanGenerationInput } from '@/validators/planning-schemas'

// Vercel serverless configuration
export const runtime = 'nodejs'
export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Demo Streaming API: Starting Gemini streaming test...')

    const body = await request.json() as { scenario: PlanGenerationInput }
    const { scenario } = body

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: 'Scenario data is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`📊 Demo Streaming API: Testing scenario for ${scenario.userProfile.contact.firstName} ${scenario.userProfile.contact.lastName}`)

    // Create Gemini client
    const geminiClient = createGeminiClient()

    // Set up Server-Sent Events (SSE) stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          console.log('📝 Demo Streaming API: Starting markdown analysis stream...')

          let accumulatedContent = ''
          let chunkCount = 0

          // Send initial status
          const startEvent = `data: ${JSON.stringify({
            type: 'start',
            message: 'Starting AI analysis...'
          })}\n\n`
          controller.enqueue(encoder.encode(startEvent))

          // Process streaming response
          for await (const chunk of geminiClient.generateMarkdownAnalysisStream(scenario)) {
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

              console.log(`📨 Demo Streaming API: Sent chunk ${chunkCount}, length: ${chunk.length}`)
            } catch (controllerError) {
              console.log(`🔌 Demo Streaming API: Client disconnected during chunk ${chunkCount}`)
              break // Exit the loop if client disconnected
            }
          }

          // Create simplified structured response
          const simplifiedStructured = {
            id: `demo-stream-${Date.now()}`,
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
            reportContent: accumulatedContent,
            aiGenerated: true
          }

          // Send completion event with structured data
          const completeEvent = `data: ${JSON.stringify({
            type: 'complete',
            structured: simplifiedStructured,
            fullMarkdown: accumulatedContent,
            totalChunks: chunkCount,
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(completeEvent))

          console.log(`✅ Demo Streaming API: Completed successfully with ${chunkCount} chunks`)

        } catch (error) {
          console.error('❌ Demo Streaming API: Error occurred:', error)

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
    console.error('❌ Demo Streaming API: Request setup failed:', error)

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