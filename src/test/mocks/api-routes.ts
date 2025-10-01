import { vi } from 'vitest'

interface ApiLeadData {
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

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Mock state
let mockDelay = 150
let mockShouldFail = false
let mockFailureType: 'network' | 'validation' | 'server' | 'not_found' = 'network'
let mockStatusCode = 200
let submittedApiLeads: ApiLeadData[] = []

// Mock responses
const mockApiResponses = {
  success: {
    success: true,
    data: {
      id: 'api_lead_123',
      status: 'received',
      createdAt: new Date().toISOString()
    },
    message: 'Lead successfully processed'
  },
  validation_error: {
    success: false,
    error: 'VALIDATION_ERROR',
    message: 'Required fields missing or invalid',
    data: {
      errors: {
        email: 'Invalid email format',
        phone: 'Phone number is required'
      }
    }
  },
  server_error: {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred'
  },
  not_found: {
    success: false,
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  }
}

// Mock fetch implementation for API routes
export const mockApiFetch = vi.fn().mockImplementation(async (url: string, options: RequestInit = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, mockDelay))

  // Parse request data if POST/PUT
  let requestData: any = null
  if (options.body && typeof options.body === 'string') {
    try {
      requestData = JSON.parse(options.body)
    } catch (e) {
      requestData = options.body
    }
  }

  // Handle different endpoints
  if (url.includes('/api/leads')) {
    return handleLeadsEndpoint(url, options.method || 'GET', requestData)
  }

  // Default 404 for unknown endpoints
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: async () => mockApiResponses.not_found
  }
})

function handleLeadsEndpoint(url: string, method: string, data: any) {
  if (mockShouldFail) {
    switch (mockFailureType) {
      case 'network':
        throw new Error('Network error: Failed to fetch')
      case 'validation':
        return {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => mockApiResponses.validation_error
        }
      case 'server':
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => mockApiResponses.server_error
        }
      case 'not_found':
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => mockApiResponses.not_found
        }
    }
  }

  switch (method) {
    case 'POST':
      // Store submitted lead
      if (data) {
        submittedApiLeads.push({ ...data })
      }
      return {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => ({
          ...mockApiResponses.success,
          data: {
            ...mockApiResponses.success.data,
            id: `api_lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            submittedData: data
          }
        })
      }

    case 'GET':
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          success: true,
          data: {
            leads: submittedApiLeads,
            total: submittedApiLeads.length
          }
        })
      }

    default:
      return {
        ok: false,
        status: 405,
        statusText: 'Method Not Allowed',
        json: async () => ({
          success: false,
          error: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed`
        })
      }
  }
}

// Helper functions for test configuration
export const mockApiHelpers = {
  // Set response delay
  setDelay: (delay: number) => {
    mockDelay = delay
  },

  // Enable/disable failures
  setShouldFail: (shouldFail: boolean, failureType: 'network' | 'validation' | 'server' | 'not_found' = 'network') => {
    mockShouldFail = shouldFail
    mockFailureType = failureType
  },

  // Set custom status code
  setStatusCode: (code: number) => {
    mockStatusCode = code
  },

  // Reset to defaults
  reset: () => {
    mockDelay = 150
    mockShouldFail = false
    mockFailureType = 'network'
    mockStatusCode = 200
    submittedApiLeads = []
    mockApiFetch.mockClear()
  },

  // Configure specific scenarios
  configureSuccess: () => {
    mockShouldFail = false
    mockStatusCode = 200
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

  configureNotFound: () => {
    mockShouldFail = true
    mockFailureType = 'not_found'
  },

  // Test verification helpers
  getSubmittedLeads: () => [...submittedApiLeads],

  getLastSubmittedLead: () => submittedApiLeads[submittedApiLeads.length - 1] || null,

  getSubmissionCount: () => submittedApiLeads.length,

  clearSubmittedLeads: () => {
    submittedApiLeads = []
  },

  // Verify specific lead data
  verifyLeadSubmitted: (email: string) => {
    return submittedApiLeads.some(lead => lead.email === email)
  },

  verifyLeadData: (email: string, expectedData: Partial<ApiLeadData>) => {
    const lead = submittedApiLeads.find(lead => lead.email === email)
    if (!lead) return false

    return Object.entries(expectedData).every(([key, value]) => {
      return lead[key] === value
    })
  },

  // Mock specific response data
  setCustomResponse: (response: any) => {
    mockApiResponses.success = { ...mockApiResponses.success, ...response }
  },

  // Get mock state for debugging
  getMockState: () => ({
    delay: mockDelay,
    shouldFail: mockShouldFail,
    failureType: mockFailureType,
    statusCode: mockStatusCode,
    submissionCount: submittedApiLeads.length
  })
}

// Export for module replacement
export default {
  fetch: mockApiFetch
}