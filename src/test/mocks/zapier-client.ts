import { vi } from 'vitest'

interface ZapierLeadData {
  email: string
  firstName: string
  lastName: string
  phone: string
  city: string
  state: string
  zipCode: string
  timeline: string
  [key: string]: any
}

interface ZapierResponse {
  status: 'success' | 'error'
  id?: string
  message?: string
  errors?: string[]
}

// Mock state
let mockDelay = 200
let mockShouldFail = false
let mockFailureType: 'network' | 'validation' | 'server' | 'rate_limit' = 'network'
let mockSuccessRate = 1.0 // 100% success by default
let submittedLeads: ZapierLeadData[] = []

// Mock responses
const mockResponses = {
  success: {
    status: 'success' as const,
    id: 'lead_123456789',
    message: 'Lead successfully submitted to Zapier'
  },
  validation_error: {
    status: 'error' as const,
    message: 'Validation failed',
    errors: ['Email is required', 'Phone number is invalid']
  },
  server_error: {
    status: 'error' as const,
    message: 'Internal server error'
  },
  rate_limit_error: {
    status: 'error' as const,
    message: 'Rate limit exceeded. Please try again later.'
  }
}

// Mock implementation of submitLead
export const mockSubmitLead = vi.fn().mockImplementation(async (leadData: ZapierLeadData): Promise<ZapierResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, mockDelay))

  // Store submitted lead for verification
  submittedLeads.push({ ...leadData })

  // Check if should simulate failure
  if (mockShouldFail || Math.random() > mockSuccessRate) {
    switch (mockFailureType) {
      case 'network':
        throw new Error('Network error: Unable to connect to Zapier')
      case 'validation':
        return mockResponses.validation_error
      case 'server':
        return mockResponses.server_error
      case 'rate_limit':
        return mockResponses.rate_limit_error
      default:
        throw new Error('Unknown error')
    }
  }

  return {
    ...mockResponses.success,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
})

// Helper functions for test configuration
export const mockZapierHelpers = {
  // Set response delay
  setDelay: (delay: number) => {
    mockDelay = delay
  },

  // Enable/disable failures
  setShouldFail: (shouldFail: boolean, failureType: 'network' | 'validation' | 'server' | 'rate_limit' = 'network') => {
    mockShouldFail = shouldFail
    mockFailureType = failureType
  },

  // Set success rate (0.0 to 1.0)
  setSuccessRate: (rate: number) => {
    mockSuccessRate = Math.max(0, Math.min(1, rate))
  },

  // Reset to defaults
  reset: () => {
    mockDelay = 200
    mockShouldFail = false
    mockFailureType = 'network'
    mockSuccessRate = 1.0
    submittedLeads = []
    mockSubmitLead.mockClear()
  },

  // Configure specific scenarios
  configureSuccess: () => {
    mockShouldFail = false
    mockSuccessRate = 1.0
  },

  configureNetworkError: () => {
    mockShouldFail = true
    mockFailureType = 'network'
  },

  configureValidationError: () => {
    mockShouldFail = true
    mockFailureType = 'validation'
  },

  configureServerError: () => {
    mockShouldFail = true
    mockFailureType = 'server'
  },

  configureRateLimit: () => {
    mockShouldFail = true
    mockFailureType = 'rate_limit'
  },

  configureIntermittentFailure: (successRate: number) => {
    mockShouldFail = false
    mockSuccessRate = successRate
  },

  // Test verification helpers
  getSubmittedLeads: () => [...submittedLeads],

  getLastSubmittedLead: () => submittedLeads[submittedLeads.length - 1] || null,

  getSubmissionCount: () => submittedLeads.length,

  clearSubmittedLeads: () => {
    submittedLeads = []
  },

  // Verify specific lead data
  verifyLeadSubmitted: (email: string) => {
    return submittedLeads.some(lead => lead.email === email)
  },

  verifyLeadData: (email: string, expectedData: Partial<ZapierLeadData>) => {
    const lead = submittedLeads.find(lead => lead.email === email)
    if (!lead) return false

    return Object.entries(expectedData).every(([key, value]) => {
      return lead[key] === value
    })
  },

  // Get mock state for debugging
  getMockState: () => ({
    delay: mockDelay,
    shouldFail: mockShouldFail,
    failureType: mockFailureType,
    successRate: mockSuccessRate,
    submissionCount: submittedLeads.length
  })
}

// Export mock implementation
export default {
  submitLead: mockSubmitLead
}