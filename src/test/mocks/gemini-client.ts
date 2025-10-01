import { vi } from 'vitest'

interface MockGeminiResponse {
  text: () => Promise<string>
}

interface MockGeminiResult {
  response: MockGeminiResponse
}

interface MockGeminiModel {
  generateContent: (prompt: string) => Promise<MockGeminiResult>
}

interface MockGeminiClient {
  getGenerativeModel: (config: { model: string }) => MockGeminiModel
  generatePersonalizedPlan: (input: any) => Promise<any>
}

// Default mock responses for different scenarios
const mockResponses = {
  success: `{
    "personalizedReport": {
      "buyerProfile": {
        "primaryLeadType": "first_time_buyer",
        "financialReadiness": "moderate",
        "timeframe": "6_months",
        "priceRange": "$350,000 - $450,000"
      },
      "keyInsights": [
        "Strong income provides good foundation for homeownership",
        "Current savings suggest 10% down payment feasible",
        "Consider FHA loan programs for first-time buyers"
      ],
      "personalizedTips": [
        "Start building credit score to 720+ for better rates",
        "Save additional $5,000 for closing costs",
        "Get pre-approved before house hunting"
      ],
      "actionPlan": [
        {
          "task": "Get pre-qualification letter",
          "timeline": "Next 2 weeks",
          "priority": "high"
        },
        {
          "task": "Start house hunting in target areas",
          "timeline": "Month 2-4",
          "priority": "medium"
        }
      ],
      "programRecommendations": [
        {
          "program": "FHA Loan",
          "fit": "excellent",
          "reason": "Low down payment requirement ideal for first-time buyer"
        }
      ]
    }
  }`,
  fallback: `{
    "personalizedReport": {
      "buyerProfile": {
        "primaryLeadType": "buyer",
        "financialReadiness": "needs_assessment",
        "timeframe": "flexible",
        "priceRange": "to_be_determined"
      },
      "keyInsights": [
        "Professional consultation recommended",
        "Custom analysis needed for your situation"
      ],
      "personalizedTips": [
        "Schedule consultation with our experts",
        "Prepare financial documents for review"
      ],
      "actionPlan": [
        {
          "task": "Schedule consultation",
          "timeline": "This week",
          "priority": "high"
        }
      ],
      "programRecommendations": []
    }
  }`,
  error: 'API_ERROR'
}

// Mock state
let mockDelay = 500
let mockShouldThrow = false
let mockResponseType: keyof typeof mockResponses = 'success'

// Mock implementation
const createMockGeminiClient = (): MockGeminiClient => ({
  getGenerativeModel: () => ({
    generateContent: async (prompt: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, mockDelay))

      if (mockShouldThrow) {
        throw new Error('Gemini API Error: Rate limit exceeded')
      }

      return {
        response: {
          text: async () => mockResponses[mockResponseType]
        }
      }
    }
  }),
  generatePersonalizedPlan: async (input: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, mockDelay))

    if (mockShouldThrow) {
      throw new Error('Gemini API Error')
    }

    const response = JSON.parse(mockResponses[mockResponseType])
    return response.personalizedReport
  }
})

// Helper functions for test configuration
export const mockGeminiHelpers = {
  // Set response type
  setResponseType: (type: keyof typeof mockResponses) => {
    mockResponseType = type
  },

  // Set network delay
  setDelay: (delay: number) => {
    mockDelay = delay
  },

  // Enable/disable error throwing
  setShouldThrow: (shouldThrow: boolean) => {
    mockShouldThrow = shouldThrow
  },

  // Reset to defaults
  reset: () => {
    mockDelay = 500
    mockShouldThrow = false
    mockResponseType = 'success'
  },

  // Configure for specific scenarios
  configureSuccess: () => {
    mockShouldThrow = false
    mockResponseType = 'success'
  },

  configureFallback: () => {
    mockShouldThrow = false
    mockResponseType = 'fallback'
  },

  configureError: () => {
    mockShouldThrow = true
  },

  configureNetworkError: () => {
    mockShouldThrow = true
  },

  // Get current mock state for debugging
  getMockState: () => ({
    delay: mockDelay,
    shouldThrow: mockShouldThrow,
    responseType: mockResponseType
  })
}

// Mock the Gemini client module
export const mockCreateGeminiClient = vi.fn().mockImplementation(() => {
  return createMockGeminiClient()
})

// Mock generatePersonalizedPlan function
export const mockGeneratePersonalizedPlan = vi.fn().mockImplementation(async (wizardData: any, censusData?: any, locale = 'en') => {
  await new Promise(resolve => setTimeout(resolve, mockDelay))

  if (mockShouldThrow) {
    throw new Error('Gemini API Error')
  }

  const response = JSON.parse(mockResponses[mockResponseType])
  return response.personalizedReport
})

// Named exports for module replacement
export const createGeminiClient = mockCreateGeminiClient
export const generatePersonalizedPlan = mockGeneratePersonalizedPlan

// Export mock for module replacement
export default {
  createGeminiClient: mockCreateGeminiClient,
  generatePersonalizedPlan: mockGeneratePersonalizedPlan
}