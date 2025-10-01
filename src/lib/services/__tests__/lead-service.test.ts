import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  submitLead,
  extractLeadDataFromWizard,
  validateLeadData,
  generateLeadNotes,
  submitToAPI
} from '../lead-service'
import { createTestWizardData, testDataScenarios, contactInfoVariations } from '@/test/utils/test-data'
import { mockApiHelpers } from '@/test/mocks/api-routes'
import { mockZapierHelpers } from '@/test/mocks/zapier-client'

// Mock fetch
global.fetch = vi.fn()

// Mock external dependencies
vi.mock('@/integrations/zapier-client', () => ({
  submitLead: vi.fn()
}))

vi.mock('../ai-service', () => ({
  generateHomebuyingReport: vi.fn().mockResolvedValue({
    buyerProfile: { primaryLeadType: 'first_time_buyer' },
    keyInsights: ['Test insight'],
    personalizedTips: ['Test tip'],
    actionPlan: [{ task: 'Test task', timeline: 'Next week', priority: 'high' }],
    programRecommendations: []
  })
}))

// Import mocked functions
import { submitLead as mockZapierSubmitLead } from '@/integrations/zapier-client'

describe('Lead Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiHelpers.reset()
    mockZapierHelpers.reset()
    mockApiHelpers.setDelay(0) // Set to 0 for deterministic tests
    mockZapierHelpers.setDelay(0) // Set to 0 for deterministic tests

    // Use the mock API implementation
    ;(global.fetch as any).mockImplementation(async (url: string, options: any) => {
      const { mockApiFetch } = await import('@/test/mocks/api-routes')
      return mockApiFetch(url, options)
    })
  })

  afterEach(() => {
    mockApiHelpers.reset()
    mockZapierHelpers.reset()
  })

  describe('extractLeadDataFromWizard', () => {
    it('should extract complete lead data from wizard', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      const leadData = extractLeadDataFromWizard(wizardData, contactInfo)

      expect(leadData).toHaveProperty('email', contactInfo.email)
      expect(leadData).toHaveProperty('firstName', contactInfo.firstName)
      expect(leadData).toHaveProperty('lastName', contactInfo.lastName)
      expect(leadData).toHaveProperty('phone', contactInfo.phone)
      expect(leadData).toHaveProperty('city', wizardData.location.city)
      expect(leadData).toHaveProperty('state', wizardData.location.state)
      expect(leadData).toHaveProperty('zipCode', wizardData.location.zipCode)
      expect(leadData).toHaveProperty('timeline')
      expect(leadData).toHaveProperty('annualIncome')
      expect(leadData).toHaveProperty('monthlyDebt')
      expect(leadData).toHaveProperty('downPayment')
      expect(leadData).toHaveProperty('creditScore')
      expect(leadData).toHaveProperty('employmentType')
      expect(leadData).toHaveProperty('isFirstTimeBuyer')
      expect(leadData).toHaveProperty('isVeteran')
      expect(leadData).toHaveProperty('propertyTypes')
      expect(leadData).toHaveProperty('bedrooms')
      expect(leadData).toHaveProperty('bathrooms')
    })

    it('should handle missing optional data gracefully', () => {
      const incompleteWizardData = {
        location: { city: 'Austin', state: 'TX' },
        timeline: { timeframe: '6_months' },
        budget: { annualIncome: 50000 },
        preferences: {},
        financing: {}
      }
      const contactInfo = { firstName: 'John', email: 'john@test.com' }

      const leadData = extractLeadDataFromWizard(incompleteWizardData as any, contactInfo as any)

      expect(leadData.firstName).toBe('John')
      expect(leadData.email).toBe('john@test.com')
      expect(leadData.city).toBe('Austin')
      expect(leadData.annualIncome).toBe(50000)
      expect(leadData.zipCode).toBe('')
      expect(leadData.isFirstTimeBuyer).toBe(false)
    })

    it('should map timeline correctly', () => {
      const wizardData = createTestWizardData({
        timeline: { timeframe: '3_months', isFlexible: false, reason: 'lease_ending' }
      })
      const contactInfo = contactInfoVariations.standard

      const leadData = extractLeadDataFromWizard(wizardData, contactInfo)

      expect(leadData.timeline).toBe('3_months')
      expect(leadData.timelineFlexible).toBe(false)
      expect(leadData.buyingReason).toBe('lease_ending')
    })

    it('should map employment type correctly', () => {
      const wizardData = createTestWizardData({
        financing: { employmentType: 'self_employed', employmentLength: '2_plus_years' }
      })
      const contactInfo = contactInfoVariations.standard

      const leadData = extractLeadDataFromWizard(wizardData, contactInfo)

      expect(leadData.employmentType).toBe('self_employed')
      expect(leadData.employmentLength).toBe('2_plus_years')
    })

    it('should handle array fields correctly', () => {
      const wizardData = createTestWizardData({
        preferences: {
          propertyTypes: ['single_family', 'townhome'],
          features: ['garage', 'yard', 'pool'],
          dealBreakers: ['hoa', 'busy_street']
        },
        financing: {
          assistancePrograms: ['fha', 'first_time_buyer']
        }
      })
      const contactInfo = contactInfoVariations.standard

      const leadData = extractLeadDataFromWizard(wizardData, contactInfo)

      expect(leadData.propertyTypes).toEqual(['single_family', 'townhome'])
      expect(leadData.desiredFeatures).toEqual(['garage', 'yard', 'pool'])
      expect(leadData.dealBreakers).toEqual(['hoa', 'busy_street'])
      expect(leadData.assistancePrograms).toEqual(['fha', 'first_time_buyer'])
    })
  })

  describe('validateLeadData', () => {
    it('should validate correct lead data', () => {
      const validLeadData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '5551234567',
        city: 'Austin',
        state: 'TX',
        zipCode: '78759',
        timeline: '6_months'
      }

      const validation = validateLeadData(validLeadData)

      expect(validation.isValid).toBe(true)
      expect(Object.keys(validation.errors)).toHaveLength(0)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        phone: '5551234567',
        city: 'Austin'
      }

      const validation = validateLeadData(invalidData)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveProperty('email')
    })

    it('should reject missing required fields', () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing other required fields
      }

      const validation = validateLeadData(incompleteData)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveProperty('firstName')
      expect(validation.errors).toHaveProperty('lastName')
    })

    it('should validate phone numbers', () => {
      const dataWithInvalidPhone = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123', // Invalid phone
        city: 'Austin'
      }

      const validation = validateLeadData(dataWithInvalidPhone)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveProperty('phone')
    })

    it('should validate numeric fields', () => {
      const dataWithInvalidNumeric = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Austin',
        annualIncome: 'not-a-number'
      }

      const validation = validateLeadData(dataWithInvalidNumeric)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveProperty('annualIncome')
    })

    it('should allow optional fields to be missing', () => {
      const minimalValidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '5551234567',
        city: 'Austin'
        // Optional fields missing
      }

      const validation = validateLeadData(minimalValidData)

      expect(validation.isValid).toBe(true)
    })
  })

  describe('generateLeadNotes', () => {
    it('should generate comprehensive notes', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      const notes = generateLeadNotes(wizardData, contactInfo, 'en')

      expect(notes).toContain('John Doe')
      expect(notes).toContain(contactInfo.email)
      expect(notes).toContain('Austin, TX')
      expect(notes).toContain('$65,000')
      expect(notes).toContain('first-time buyer')
      expect(notes).toContain('6 months')
      expect(notes).toContain('FHA')
    })

    it('should generate notes in Spanish', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.spanish

      const notes = generateLeadNotes(wizardData, contactInfo, 'es')

      expect(notes).toContain('María García')
      expect(notes).toContain(contactInfo.email)
      // Notes should be formatted appropriately for Spanish locale
    })

    it('should handle veteran status in notes', () => {
      const wizardData = testDataScenarios.veteran()
      const contactInfo = contactInfoVariations.standard

      const notes = generateLeadNotes(wizardData, contactInfo, 'en')

      expect(notes).toContain('veteran')
      expect(notes).toContain('VA loan')
    })

    it('should include census data when available', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard
      const censusData = {
        population: 964254,
        medianHouseholdIncome: 78691,
        medianHomeValue: 494178
      }

      const notes = generateLeadNotes(wizardData, contactInfo, 'en', censusData as any)

      expect(notes).toContain('964,254')
      expect(notes).toContain('$78,691')
      expect(notes).toContain('$494,178')
    })

    it('should handle incomplete data gracefully', () => {
      const incompleteData = {
        location: { city: 'Austin' },
        budget: { annualIncome: 50000 },
        timeline: {},
        preferences: {},
        financing: {}
      }
      const contactInfo = { firstName: 'John', email: 'john@test.com' }

      const notes = generateLeadNotes(incompleteData as any, contactInfo as any, 'en')

      expect(notes).toContain('John')
      expect(notes).toContain('Austin')
      expect(notes).not.toContain('undefined')
      expect(notes).not.toContain('null')
    })
  })

  describe('submitToAPI', () => {
    it('should submit to API successfully', async () => {
      const leadData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Austin'
      }

      // Configure successful API response
      mockApiHelpers.configureSuccess()

      const result = await submitToAPI(leadData)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id')
      expect(global.fetch).toHaveBeenCalledWith('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })
    })

    it('should handle API validation errors', async () => {
      const leadData = { email: 'invalid-email' }

      // Configure validation error response
      mockApiHelpers.configureValidationError()

      const result = await submitToAPI(leadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('VALIDATION_ERROR')
      expect(result.message).toContain('email')
    })

    it('should handle network errors', async () => {
      const leadData = { email: 'test@example.com' }

      // Configure network error
      mockApiHelpers.configureNetworkError()

      const result = await submitToAPI(leadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('NETWORK_ERROR')
    })

    it('should handle server errors', async () => {
      const leadData = { email: 'test@example.com' }

      // Configure server error
      mockApiHelpers.configureServerError()

      const result = await submitToAPI(leadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should handle malformed JSON responses', async () => {
      const leadData = { email: 'test@example.com' }

      // Mock malformed response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const result = await submitToAPI(leadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('PARSE_ERROR')
    })
  })

  describe('submitLead (Main Function)', () => {
    it('should submit lead via API successfully', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      // Configure successful API response
      mockApiHelpers.configureSuccess()

      const result = await submitLead(wizardData, contactInfo)

      expect(result.success).toBe(true)
      expect(result.method).toBe('api')
      expect(result.data).toHaveProperty('id')
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should fallback to Zapier when API fails', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      // Configure API failure and Zapier success
      mockApiHelpers.configureNetworkError()
      mockZapierHelpers.configureSuccess()

      const result = await submitLead(wizardData, contactInfo)

      expect(result.success).toBe(true)
      expect(result.method).toBe('zapier')
      expect(result.data).toHaveProperty('id')
      expect(mockZapierSubmitLead).toHaveBeenCalled()
    })

    it('should fail when both API and Zapier fail', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      // Configure both to fail
      mockApiHelpers.configureNetworkError()
      mockZapierHelpers.configureNetworkError()

      const result = await submitLead(wizardData, contactInfo)

      expect(result.success).toBe(false)
      expect(result.error).toBe('SUBMISSION_FAILED')
      expect(result.attempts).toHaveProperty('api')
      expect(result.attempts).toHaveProperty('zapier')
    })

    it('should reject invalid lead data', async () => {
      const incompleteWizardData = {
        location: {},
        timeline: {},
        budget: {},
        preferences: {},
        financing: {}
      }
      const incompleteContactInfo = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        phone: '',
        preferredContactMethod: 'email'
      }

      const result = await submitLead(incompleteWizardData as any, incompleteContactInfo)

      expect(result.success).toBe(false)
      expect(result.error).toBe('VALIDATION_ERROR')
      expect(result.validationErrors).toBeDefined()
    })

    it('should include notes and report data', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      // Mock successful API response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: 'lead_123' } })
      })

      await submitLead(wizardData, contactInfo)

      // Verify that the API was called with comprehensive data
      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody).toHaveProperty('notes')
      expect(requestBody.notes).toContain('John Doe')
      expect(requestBody.notes).toContain('first-time buyer')
    })

    it('should handle locale-specific submission', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.spanish

      // Mock successful API response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: 'lead_123' } })
      })

      await submitLead(wizardData, contactInfo, undefined, 'es')

      // Verify that Spanish locale was used in notes generation
      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody).toHaveProperty('notes')
      expect(requestBody.notes).toContain('María García')
    })

    it('should include census data when provided', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard
      const censusData = {
        city: 'Austin',
        state: 'TX',
        population: 964254,
        medianHouseholdIncome: 78691
      }

      // Mock successful API response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: 'lead_123' } })
      })

      await submitLead(wizardData, contactInfo, censusData as any)

      // Verify census data was included in notes
      const callArgs = (global.fetch as any).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)

      expect(requestBody.notes).toContain('964,254')
      expect(requestBody.notes).toContain('$78,691')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow for different buyer types', async () => {
      const scenarios = [
        { name: 'First Time Buyer', data: testDataScenarios.firstTimeBuyer() },
        { name: 'Veteran', data: testDataScenarios.veteran() },
        { name: 'Self Employed', data: testDataScenarios.selfEmployed() },
        { name: 'High Income', data: testDataScenarios.highIncome() }
      ]

      for (const scenario of scenarios) {
        // Mock successful API response
        ;(global.fetch as any).mockResolvedValue({
          ok: true,
          status: 201,
          json: async () => ({ success: true, data: { id: `lead_${scenario.name}` } })
        })

        const result = await submitLead(scenario.data, contactInfoVariations.standard)

        expect(result.success).toBe(true)
        expect(result.method).toBe('api')

        // Verify lead data extraction worked correctly
        const callArgs = (global.fetch as any).mock.calls.pop()
        const requestBody = JSON.parse(callArgs[1].body)

        expect(requestBody.email).toBe(contactInfoVariations.standard.email)
        expect(requestBody.city).toBe(scenario.data.location.city)

        // Clear mock for next iteration
        ;(global.fetch as any).mockClear()
      }
    })

    it('should preserve data integrity through the full pipeline', async () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = contactInfoVariations.standard

      // Mock successful API response
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: 'lead_123' } })
      })

      await submitLead(wizardData, contactInfo)

      const callArgs = (global.fetch as any).mock.calls[0]
      const submittedData = JSON.parse(callArgs[1].body)

      // Verify data integrity
      expect(submittedData.firstName).toBe(contactInfo.firstName)
      expect(submittedData.lastName).toBe(contactInfo.lastName)
      expect(submittedData.email).toBe(contactInfo.email)
      expect(submittedData.city).toBe(wizardData.location.city)
      expect(submittedData.annualIncome).toBe(wizardData.budget.annualIncome)
      expect(submittedData.isFirstTimeBuyer).toBe(wizardData.financing.isFirstTimeBuyer)
      expect(submittedData.isVeteran).toBe(wizardData.financing.isVeteran)
    })
  })
})