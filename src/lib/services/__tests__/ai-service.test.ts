import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateHomebuyingReport,
  buildComprehensiveNote,
  determineProgramFit,
  generateTips,
  generateActionPlan,
  determinePrimaryLeadType,
  generateUIReport
} from '../ai-service'
import { createTestWizardData, testDataScenarios, createTestCensusData, convertTestDataForAIService } from '@/test/utils/test-data'
import { mockGeminiHelpers } from '@/test/mocks/gemini-client'

// Mock the Gemini client
vi.mock('@/ai/gemini-client', async () => await import('@/test/mocks/gemini-client'))

describe('AI Service', () => {
  beforeEach(() => {
    mockGeminiHelpers.reset()
    mockGeminiHelpers.setDelay(0) // Set to 0 for deterministic tests
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockGeminiHelpers.reset()
  })

  describe('generateHomebuyingReport', () => {
    it('should generate report successfully with AI', async () => {
      // Configure successful AI response
      mockGeminiHelpers.configureSuccess()

      const testData = testDataScenarios.firstTimeBuyer()
      const { wizardData, contactInfo } = convertTestDataForAIService(testData)
      const censusData = createTestCensusData()

      const result = await generateHomebuyingReport(wizardData, contactInfo, 'en', censusData)

      expect(result).toHaveProperty('estimatedPrice')
      expect(result).toHaveProperty('maxAffordable')
      expect(result).toHaveProperty('monthlyPayment')
      expect(result).toHaveProperty('programFit')
      expect(result).toHaveProperty('actionPlan')
      expect(result).toHaveProperty('tips')
      expect(result).toHaveProperty('primaryLeadType')
      expect(result.primaryLeadType).toBe('First-Time Buyer')
    })

    it('should fall back to UI report when AI fails', async () => {
      // Configure AI to fail
      mockGeminiHelpers.configureError()

      const testData = testDataScenarios.firstTimeBuyer()
      const { wizardData, contactInfo } = convertTestDataForAIService(testData)
      const censusData = createTestCensusData()

      const result = await generateHomebuyingReport(wizardData, contactInfo, 'en', censusData)

      // Should return fallback report with ReportData structure
      expect(result).toHaveProperty('estimatedPrice')
      expect(result).toHaveProperty('maxAffordable')
      expect(result).toHaveProperty('monthlyPayment')
      expect(result).toHaveProperty('programFit')
      expect(result).toHaveProperty('actionPlan')
      expect(result).toHaveProperty('tips')
      expect(result).toHaveProperty('primaryLeadType')

      // Verify fallback report content
      expect(result.primaryLeadType).toBe('First-Time Buyer')
      expect(result.actionPlan).toBeInstanceOf(Array)
      expect(result.tips).toBeInstanceOf(Array)
    })

    it('should handle Spanish locale', async () => {
      mockGeminiHelpers.configureSuccess()

      const testData = testDataScenarios.firstTimeBuyer()
      const { wizardData, contactInfo } = convertTestDataForAIService(testData)
      const censusData = createTestCensusData()

      const result = await generateHomebuyingReport(wizardData, contactInfo, 'es', censusData)

      expect(result).toHaveProperty('estimatedPrice')
      expect(result).toHaveProperty('actionPlan')
      expect(result).toHaveProperty('tips')
      expect(result).toHaveProperty('primaryLeadType')
    })

    it('should work without census data', async () => {
      mockGeminiHelpers.configureSuccess()

      const testData = testDataScenarios.firstTimeBuyer()
      const { wizardData, contactInfo } = convertTestDataForAIService(testData)

      const result = await generateHomebuyingReport(wizardData, contactInfo, 'en')

      expect(result).toBeDefined()
      expect(result).toHaveProperty('estimatedPrice')
      expect(result).toHaveProperty('primaryLeadType')
    })
  })

  describe('buildComprehensiveNote', () => {
    it('should build comprehensive note with all data', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const censusData = createTestCensusData()

      const note = buildComprehensiveNote(wizardData, censusData)

      expect(note).toContain('Austin, TX')
      expect(note).toContain('$65,000')
      expect(note).toContain('$15,000')
      expect(note).toContain('first-time buyer')
      expect(note).toContain('6 months')
      expect(note).toContain('Population: 964,254')
      expect(note).toContain('Median Income: $78,691')
    })

    it('should build note without census data', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()

      const note = buildComprehensiveNote(wizardData)

      expect(note).toContain('Austin, TX')
      expect(note).toContain('$65,000')
      expect(note).not.toContain('Population:')
    })

    it('should handle incomplete wizard data', () => {
      const incompleteData = {
        location: { city: 'Austin', state: 'TX' },
        budget: { annualIncome: 50000 },
        timeline: {},
        preferences: {},
        financing: {}
      }

      const note = buildComprehensiveNote(incompleteData as any)

      expect(note).toContain('Austin, TX')
      expect(note).toContain('$50,000')
      expect(note).not.toContain('undefined')
    })
  })

  describe('determineProgramFit', () => {
    it('should recommend FHA for first-time buyers', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const programs = determineProgramFit(wizardData)

      const fhaProgram = programs.find(p => p.program === 'FHA Loan')
      expect(fhaProgram).toBeDefined()
      expect(fhaProgram?.fit).toBe('excellent')
      expect(fhaProgram?.reason).toContain('first-time buyer')
    })

    it('should recommend VA loan for veterans', () => {
      const wizardData = testDataScenarios.veteran()
      const programs = determineProgramFit(wizardData)

      const vaProgram = programs.find(p => p.program === 'VA Loan')
      expect(vaProgram).toBeDefined()
      expect(vaProgram?.fit).toBe('excellent')
      expect(vaProgram?.reason).toContain('veteran')
    })

    it('should recommend conventional for high income', () => {
      const wizardData = testDataScenarios.highIncome()
      const programs = determineProgramFit(wizardData)

      const conventionalProgram = programs.find(p => p.program === 'Conventional Loan')
      expect(conventionalProgram).toBeDefined()
      expect(conventionalProgram?.fit).toBe('excellent')
    })

    it('should recommend USDA for rural areas', () => {
      const wizardData = createTestWizardData({
        location: { city: 'Rural Town', state: 'TX', zipCode: '77777' },
        financing: { assistancePrograms: ['usda'] }
      })

      const programs = determineProgramFit(wizardData)

      const usdaProgram = programs.find(p => p.program === 'USDA Loan')
      expect(usdaProgram).toBeDefined()
    })

    it('should handle self-employed borrowers', () => {
      const wizardData = testDataScenarios.selfEmployed()
      const programs = determineProgramFit(wizardData)

      // Should still recommend programs but with notes about documentation
      expect(programs.length).toBeGreaterThan(0)
      const hasDocumentationNote = programs.some(p =>
        p.reason.includes('documentation') || p.reason.includes('self-employed')
      )
      expect(hasDocumentationNote).toBe(true)
    })
  })

  describe('generateTips', () => {
    it('should generate tips for first-time buyers', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const tips = generateTips(wizardData, 'en')

      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
      expect(tips.some(tip => tip.includes('credit'))).toBe(true)
      expect(tips.some(tip => tip.includes('down payment'))).toBe(true)
    })

    it('should generate tips in Spanish', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const tips = generateTips(wizardData, 'es')

      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
      // Tips should be in Spanish or contain Spanish-specific advice
    })

    it('should generate income-specific tips for low income', () => {
      const wizardData = testDataScenarios.lowIncome()
      const tips = generateTips(wizardData, 'en')

      expect(tips.some(tip =>
        tip.includes('assistance') || tip.includes('program') || tip.includes('help')
      )).toBe(true)
    })

    it('should generate tips for high income earners', () => {
      const wizardData = testDataScenarios.highIncome()
      const tips = generateTips(wizardData, 'en')

      expect(tips.some(tip =>
        tip.includes('conventional') || tip.includes('jumbo') || tip.includes('investment')
      )).toBe(true)
    })

    it('should generate credit-specific tips', () => {
      const wizardData = createTestWizardData({
        budget: { creditScore: '580-619', annualIncome: 50000 }
      })
      const tips = generateTips(wizardData, 'en')

      expect(tips.some(tip => tip.includes('credit score'))).toBe(true)
    })
  })

  describe('generateActionPlan', () => {
    it('should generate action plan with prioritized tasks', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const actionPlan = generateActionPlan(wizardData, 'en')

      expect(actionPlan).toBeInstanceOf(Array)
      expect(actionPlan.length).toBeGreaterThan(0)

      // Should have required properties
      actionPlan.forEach(item => {
        expect(item).toHaveProperty('task')
        expect(item).toHaveProperty('timeline')
        expect(item).toHaveProperty('priority')
        expect(['high', 'medium', 'low']).toContain(item.priority)
      })

      // Should include pre-approval task for most buyers
      const hasPreApproval = actionPlan.some(item =>
        item.task.toLowerCase().includes('pre-approval') ||
        item.task.toLowerCase().includes('prequalification')
      )
      expect(hasPreApproval).toBe(true)
    })

    it('should include veteran-specific actions', () => {
      const wizardData = testDataScenarios.veteran()
      const actionPlan = generateActionPlan(wizardData, 'en')

      const hasVASpecific = actionPlan.some(item =>
        item.task.includes('VA') || item.task.includes('Certificate of Eligibility')
      )
      expect(hasVASpecific).toBe(true)
    })

    it('should prioritize urgent timeline actions', () => {
      const wizardData = createTestWizardData({
        timeline: { timeframe: '3_months', isFlexible: false, reason: 'lease_ending' }
      })
      const actionPlan = generateActionPlan(wizardData, 'en')

      // Should have more high priority items for urgent timeline
      const highPriorityCount = actionPlan.filter(item => item.priority === 'high').length
      expect(highPriorityCount).toBeGreaterThan(0)
    })

    it('should include credit improvement for low scores', () => {
      const wizardData = createTestWizardData({
        budget: { creditScore: '580-619' }
      })
      const actionPlan = generateActionPlan(wizardData, 'en')

      const hasCreditAction = actionPlan.some(item =>
        item.task.toLowerCase().includes('credit')
      )
      expect(hasCreditAction).toBe(true)
    })
  })

  describe('determinePrimaryLeadType', () => {
    it('should identify first-time buyer', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const leadType = determinePrimaryLeadType(wizardData)

      expect(leadType).toBe('first_time_buyer')
    })

    it('should identify veteran', () => {
      const wizardData = testDataScenarios.veteran()
      const leadType = determinePrimaryLeadType(wizardData)

      expect(leadType).toBe('veteran')
    })

    it('should identify self-employed', () => {
      const wizardData = testDataScenarios.selfEmployed()
      const leadType = determinePrimaryLeadType(wizardData)

      expect(leadType).toBe('self_employed')
    })

    it('should identify investor', () => {
      const wizardData = testDataScenarios.investor()
      const leadType = determinePrimaryLeadType(wizardData)

      expect(leadType).toBe('investor')
    })

    it('should default to buyer for unclear cases', () => {
      const wizardData = createTestWizardData({
        financing: { isFirstTimeBuyer: false, isVeteran: false, employmentType: 'w2_employee' }
      })
      const leadType = determinePrimaryLeadType(wizardData)

      expect(leadType).toBe('buyer')
    })
  })

  describe('generateUIReport (Fallback)', () => {
    it('should generate complete fallback report', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const censusData = createTestCensusData()

      const report = generateUIReport(wizardData, censusData, 'en')

      expect(report).toHaveProperty('buyerProfile')
      expect(report).toHaveProperty('keyInsights')
      expect(report).toHaveProperty('personalizedTips')
      expect(report).toHaveProperty('actionPlan')
      expect(report).toHaveProperty('programRecommendations')

      // Verify buyer profile
      expect(report.buyerProfile.primaryLeadType).toBe('first_time_buyer')
      expect(report.buyerProfile.financialReadiness).toBeDefined()
      expect(report.buyerProfile.timeframe).toBe('6_months')

      // Verify insights include census data when available
      expect(report.keyInsights.some(insight =>
        insight.includes('Austin') || insight.includes('area')
      )).toBe(true)

      // Verify program recommendations
      expect(report.programRecommendations.length).toBeGreaterThan(0)
    })

    it('should calculate affordability correctly', () => {
      const wizardData = createTestWizardData({
        budget: {
          annualIncome: 100000,
          monthlyDebt: 1000,
          downPayment: 50000,
          creditScore: '750-799'
        }
      })

      const report = generateUIReport(wizardData, undefined, 'en')

      // Should include affordability calculations in insights
      const hasAffordabilityInsight = report.keyInsights.some(insight =>
        insight.includes('$') && insight.includes('afford')
      )
      expect(hasAffordabilityInsight).toBe(true)
    })

    it('should work without census data', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()

      const report = generateUIReport(wizardData, undefined, 'en')

      expect(report).toHaveProperty('buyerProfile')
      expect(report.keyInsights).not.toContain(undefined)
      expect(report.keyInsights).not.toContain(null)
    })

    it('should generate Spanish content', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const censusData = createTestCensusData()

      const report = generateUIReport(wizardData, censusData, 'es')

      expect(report).toHaveProperty('buyerProfile')
      expect(report.keyInsights).toBeInstanceOf(Array)
      expect(report.personalizedTips).toBeInstanceOf(Array)
      // Content should be appropriate for Spanish locale
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed AI responses gracefully', async () => {
      ;(generatePersonalizedPlan as any).mockResolvedValue(null)

      const wizardData = testDataScenarios.firstTimeBuyer()
      const result = await generateHomebuyingReport(wizardData, undefined, 'en')

      // Should fall back to UI report
      expect(result).toHaveProperty('buyerProfile')
      expect(result).toHaveProperty('keyInsights')
    })

    it('should handle AI timeout gracefully', async () => {
      ;(generatePersonalizedPlan as any).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const wizardData = testDataScenarios.firstTimeBuyer()
      const result = await generateHomebuyingReport(wizardData, undefined, 'en')

      // Should fall back to UI report
      expect(result).toBeDefined()
      expect(result.buyerProfile).toBeDefined()
    })

    it('should handle incomplete wizard data', () => {
      const incompleteData = {
        location: {},
        budget: {},
        timeline: {},
        preferences: {},
        financing: {}
      }

      const report = generateUIReport(incompleteData as any, undefined, 'en')

      expect(report).toBeDefined()
      expect(report.buyerProfile.primaryLeadType).toBe('buyer')
      expect(report.keyInsights).toBeInstanceOf(Array)
    })
  })
})