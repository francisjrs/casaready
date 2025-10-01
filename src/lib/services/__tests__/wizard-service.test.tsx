import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WizardProvider, useWizard, WizardUtils } from '../wizard-service'
import { createTestWizardData, testDataScenarios } from '@/test/utils/test-data'
import { renderWithWizard } from '@/test/utils/render-helpers'
import { getTotalSteps } from '@/components/wizard/steps'

// Mock external dependencies
vi.mock('@/lib/services/ai-service', () => ({
  generateHomebuyingReport: vi.fn().mockResolvedValue({
    buyerProfile: { primaryLeadType: 'first_time_buyer' },
    keyInsights: ['Test insight'],
    personalizedTips: ['Test tip'],
    actionPlan: [{ task: 'Test task', timeline: 'Next week', priority: 'high' }],
    programRecommendations: []
  })
}))

describe('WizardProvider', () => {
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    wrapper = ({ children }) => <WizardProvider>{children}</WizardProvider>
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      expect(result.current.currentStep).toBe(0)
      expect(result.current.wizardData).toEqual({
        location: {},
        timeline: {},
        budget: {},
        preferences: {},
        financing: {}
      })
      expect(result.current.contactInfo).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        preferredContactMethod: 'email'
      })
      expect(result.current.completedSteps).toEqual(new Set())
      expect(result.current.errors).toEqual({})
    })

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useWizard())
      }).toThrow('useWizard must be used within a WizardProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Navigation', () => {
    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStep).toBe(2)
    })

    it('should navigate to next step', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      act(() => {
        result.current.goToNextStep()
      })

      expect(result.current.currentStep).toBe(1)
    })

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // First go to step 2
      act(() => {
        result.current.goToStep(2)
      })

      // Then go back
      act(() => {
        result.current.goToPreviousStep()
      })

      expect(result.current.currentStep).toBe(1)
    })

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      act(() => {
        result.current.goToPreviousStep()
      })

      expect(result.current.currentStep).toBe(0)
    })

    it('should not go above maximum step', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      act(() => {
        result.current.goToStep(999)
      })

      // Should remain at valid step
      expect(result.current.currentStep).toBeLessThanOrEqual(getTotalSteps())
    })
  })

  describe('Data Management', () => {
    it('should update step data correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const locationData = { city: 'Austin', state: 'TX', zipCode: '78759' }

      act(() => {
        result.current.updateStepData(0, locationData)
      })

      expect(result.current.wizardData.location).toEqual(locationData)
    })

    it('should retrieve step data correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const budgetData = { annualIncome: 75000, monthlyDebt: 800 }

      act(() => {
        result.current.updateStepData(2, budgetData)
      })

      const retrievedData = result.current.getStepData(2)
      expect(retrievedData).toEqual(budgetData)
    })

    it('should update contact info', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        preferredContactMethod: 'email'
      }

      act(() => {
        result.current.updateContactInfo(contactInfo)
      })

      expect(result.current.contactInfo).toEqual(contactInfo)
    })

    it('should update census data', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const censusData = {
        city: 'Austin',
        state: 'TX',
        population: 964254,
        medianHouseholdIncome: 78691
      }

      act(() => {
        result.current.updateCensusData(censusData as any)
      })

      expect(result.current.censusData).toEqual(censusData)
    })
  })

  describe('Step Validation', () => {
    it('should validate location step correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // Invalid location data
      let validation = result.current.validateStep(0)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveProperty('city')

      // Valid location data
      act(() => {
        result.current.updateStepData(0, {
          city: 'Austin',
          state: 'TX',
          zipCode: '78759'
        })
      })

      validation = result.current.validateStep(0)
      expect(validation.isValid).toBe(true)
      expect(Object.keys(validation.errors)).toHaveLength(0)
    })

    it('should validate timeline step correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // Invalid timeline data
      let validation = result.current.validateStep(1)
      expect(validation.isValid).toBe(false)

      // Valid timeline data
      act(() => {
        result.current.updateStepData(1, {
          timeframe: '6_months',
          isFlexible: true,
          reason: 'ready_to_buy'
        })
      })

      validation = result.current.validateStep(1)
      expect(validation.isValid).toBe(true)
    })

    it('should validate budget step correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // Invalid budget data
      let validation = result.current.validateStep(2)
      expect(validation.isValid).toBe(false)

      // Valid budget data
      act(() => {
        result.current.updateStepData(2, {
          annualIncome: 75000,
          monthlyDebt: 800,
          downPayment: 25000,
          creditScore: '700-749'
        })
      })

      validation = result.current.validateStep(2)
      expect(validation.isValid).toBe(true)
    })

    it('should determine if can proceed to next step', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // Initially cannot proceed
      expect(result.current.canProceedToNext()).toBe(false)

      // Add valid data for current step
      act(() => {
        result.current.updateStepData(0, {
          city: 'Austin',
          state: 'TX',
          zipCode: '78759'
        })
      })

      expect(result.current.canProceedToNext()).toBe(true)
    })
  })

  describe('Progress Tracking', () => {
    it('should track completed steps', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      expect(result.current.isStepCompleted(0)).toBe(false)

      act(() => {
        result.current.markStepCompleted(0)
      })

      expect(result.current.isStepCompleted(0)).toBe(true)
      expect(result.current.completedSteps.has(0)).toBe(true)
    })

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const totalSteps = getTotalSteps()

      // No steps completed
      expect(result.current.getProgress()).toBe(0)

      // Complete first step
      act(() => {
        result.current.markStepCompleted(0)
      })

      const progressAfterOne = result.current.getProgress()
      expect(progressAfterOne).toBe(Math.round((1 / totalSteps) * 100))

      // Complete more steps
      act(() => {
        result.current.markStepCompleted(1)
        result.current.markStepCompleted(2)
      })

      const progressAfterThree = result.current.getProgress()
      expect(progressAfterThree).toBe(Math.round((3 / totalSteps) * 100))
    })
  })

  describe('Wizard Reset', () => {
    it('should reset wizard to initial state', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })

      // Set some data
      act(() => {
        result.current.updateStepData(0, { city: 'Austin' })
        result.current.goToStep(2)
        result.current.markStepCompleted(0)
        result.current.updateContactInfo({ firstName: 'John' })
      })

      // Reset
      act(() => {
        result.current.resetWizard()
      })

      expect(result.current.currentStep).toBe(0)
      expect(result.current.wizardData.location).toEqual({})
      expect(result.current.completedSteps.size).toBe(0)
      expect(result.current.contactInfo.firstName).toBe('')
    })
  })

  describe('Integration with Different User Scenarios', () => {
    it('should handle first-time buyer scenario', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const firstTimeBuyerData = testDataScenarios.firstTimeBuyer()

      act(() => {
        result.current.updateStepData(0, firstTimeBuyerData.location)
        result.current.updateStepData(1, firstTimeBuyerData.timeline)
        result.current.updateStepData(2, firstTimeBuyerData.budget)
        result.current.updateStepData(3, firstTimeBuyerData.preferences)
        result.current.updateStepData(4, firstTimeBuyerData.financing)
      })

      // Validate all steps
      expect(result.current.validateStep(0).isValid).toBe(true)
      expect(result.current.validateStep(1).isValid).toBe(true)
      expect(result.current.validateStep(2).isValid).toBe(true)
      expect(result.current.validateStep(3).isValid).toBe(true)
      expect(result.current.validateStep(4).isValid).toBe(true)

      expect(result.current.wizardData.financing.isFirstTimeBuyer).toBe(true)
      expect(result.current.wizardData.financing.assistancePrograms).toContain('fha')
    })

    it('should handle veteran scenario', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const veteranData = testDataScenarios.veteran()

      act(() => {
        result.current.updateStepData(4, veteranData.financing)
      })

      expect(result.current.wizardData.financing.isVeteran).toBe(true)
      expect(result.current.wizardData.financing.assistancePrograms).toContain('va_loan')
    })

    it('should handle self-employed scenario', () => {
      const { result } = renderHook(() => useWizard(), { wrapper })
      const selfEmployedData = testDataScenarios.selfEmployed()

      act(() => {
        result.current.updateStepData(2, selfEmployedData.budget)
        result.current.updateStepData(4, selfEmployedData.financing)
      })

      expect(result.current.wizardData.financing.employmentType).toBe('self_employed')
      expect(result.current.wizardData.budget.hasPreapproval).toBe(false)
    })
  })
})

describe('WizardUtils', () => {
  describe('formatStepData', () => {
    it('should format location data correctly', () => {
      const locationData = { city: 'Austin', state: 'TX', zipCode: '78759' }
      const formatted = WizardUtils.formatStepData(0, locationData)

      expect(formatted).toContain('Austin')
      expect(formatted).toContain('TX')
      expect(formatted).toContain('78759')
    })

    it('should format budget data correctly', () => {
      const budgetData = {
        annualIncome: 75000,
        monthlyDebt: 800,
        downPayment: 25000,
        creditScore: '700-749'
      }
      const formatted = WizardUtils.formatStepData(2, budgetData)

      expect(formatted).toContain('$75,000')
      expect(formatted).toContain('$800')
      expect(formatted).toContain('$25,000')
      expect(formatted).toContain('700-749')
    })
  })

  describe('calculateStepProgress', () => {
    it('should calculate progress for each step correctly', () => {
      const completedSteps = new Set([0, 1, 2])
      const totalSteps = getTotalSteps()

      const progress = WizardUtils.calculateStepProgress(completedSteps, totalSteps)
      expect(progress).toBe(Math.round((3 / totalSteps) * 100))
    })

    it('should handle empty completed steps', () => {
      const completedSteps = new Set()
      const totalSteps = getTotalSteps()

      const progress = WizardUtils.calculateStepProgress(completedSteps, totalSteps)
      expect(progress).toBe(0)
    })

    it('should handle all steps completed', () => {
      const totalSteps = getTotalSteps()
      const completedSteps = new Set(Array.from({ length: totalSteps }, (_, i) => i))

      const progress = WizardUtils.calculateStepProgress(completedSteps, totalSteps)
      expect(progress).toBe(100)
    })
  })

  describe('getStepValidationRules', () => {
    it('should return validation rules for location step', () => {
      const rules = WizardUtils.getStepValidationRules(0)

      expect(rules).toHaveProperty('city')
      expect(rules).toHaveProperty('zipCode')
      expect(rules.city.required).toBe(true)
      expect(rules.zipCode.required).toBe(true)
    })

    it('should return validation rules for budget step', () => {
      const rules = WizardUtils.getStepValidationRules(2)

      expect(rules).toHaveProperty('annualIncome')
      expect(rules).toHaveProperty('monthlyDebt')
      expect(rules.annualIncome.required).toBe(true)
      expect(rules.annualIncome.min).toBeGreaterThan(0)
    })
  })

  describe('generateWizardSummary', () => {
    it('should generate comprehensive summary', () => {
      const wizardData = createTestWizardData()
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        preferredContactMethod: 'email'
      }

      const summary = WizardUtils.generateWizardSummary(wizardData, contactInfo)

      expect(summary).toContain('John Doe')
      expect(summary).toContain('john@example.com')
      expect(summary).toContain('Austin')
      expect(summary).toContain('$75,000')
      expect(summary).toContain('First-time buyer')
    })

    it('should handle incomplete data gracefully', () => {
      const incompleteData = {
        location: { city: 'Austin' },
        budget: {},
        timeline: {},
        preferences: {},
        financing: {}
      }
      const contactInfo = { firstName: 'John' }

      const summary = WizardUtils.generateWizardSummary(incompleteData, contactInfo as any)

      expect(summary).toContain('John')
      expect(summary).toContain('Austin')
      expect(summary).not.toContain('undefined')
      expect(summary).not.toContain('null')
    })
  })
})