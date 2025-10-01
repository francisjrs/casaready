import React, { PropsWithChildren, useEffect } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { LanguageProvider } from '@/contexts/language-context'
import { WizardProvider, useWizard } from '@/lib/services/wizard-service'
import { WIZARD_STEPS } from '@/components/wizard/steps'
import type { WizardData, ContactInfo } from '@/lib/services/ai-service'
import type { CensusAreaInsights } from '@/lib/services/census-service'
import type { Locale } from '@/lib/i18n'

// Test mocks for external services
import { mockCensusFetch, mockCensusHelpers, mockCensusData } from '../mocks/census-api'
import { mockApiFetch, mockApiHelpers } from '../mocks/api-routes'
import { mockGeminiHelpers, mockGeneratePersonalizedPlan } from '../mocks/gemini-client'
import { mockZapierHelpers, mockSubmitLead as mockZapierSubmitLead } from '../mocks/zapier-client'

// =============================================================================
// Module mocks
// =============================================================================

vi.mock('@/ai/gemini-client', async () => {
  const module = await import('../mocks/gemini-client')

  return {
    ...module,
    createGeminiClient: module.createGeminiClient,
    generatePersonalizedPlan: module.generatePersonalizedPlan,
    default: module
  }
})

vi.mock('@/integrations/zapier-client', async () => {
  const module = await import('../mocks/zapier-client')

  const adaptResponse = async (input: any) => {
    const result = await module.mockSubmitLead(input)

    if (result && 'status' in result) {
      return {
        success: result.status === 'success',
        message: result.message ?? (result.status === 'success' ? 'Lead processed successfully' : 'Lead failed'),
        error: result.status === 'error' ? (result.errors?.join(', ') ?? 'Zapier error') : undefined,
        data: result
      }
    }

    return result
  }

  class MockZapierClient {
    async submitLead(payload: any) {
      return adaptResponse(payload)
    }

    async testConnection() {
      return {
        success: true,
        message: 'Mock Zapier connection successful'
      }
    }
  }

  const mockedInstance = new MockZapierClient()

  return {
    ZapierClient: MockZapierClient,
    zapierClient: mockedInstance,
    submitLead: adaptResponse,
    testZapierConnection: async () => ({ success: true, message: 'Mock Zapier connection successful' }),
    default: {
      submitLead: adaptResponse,
      testZapierConnection: async () => ({ success: true, message: 'Mock Zapier connection successful' })
    }
  }
})

// =============================================================================
// Wizard test state setup
// =============================================================================

const STEP_FIELD_MAP: Record<number, (keyof WizardData)[]> = {
  1: ['city', 'zipCode', 'locationPriority'],
  2: ['timeline'],
  3: ['budgetType', 'targetPrice', 'monthlyBudget'],
  4: ['annualIncome'],
  5: ['monthlyDebts', 'creditScore'],
  6: ['downPaymentAmount', 'downPaymentPercent'],
  7: ['employmentType'],
  8: ['buyerType', 'householdSize'],
  9: [],
  10: []
}

export interface WizardInitialState {
  currentStep?: number
  wizardData?: Partial<WizardData>
  contactInfo?: Partial<ContactInfo>
  completedSteps?: number[]
  censusData?: CensusAreaInsights
}

interface WizardTestProvidersProps {
  locale: Locale
  initialState?: WizardInitialState
  children: React.ReactNode
}

function WizardStateInitializer({ initialState }: { initialState?: WizardInitialState }) {
  const {
    updateStepData,
    updateContactInfo,
    updateCensusData,
    markStepCompleted,
    goToStep
  } = useWizard()

  useEffect(() => {
    if (!initialState) {
      return
    }

    const { wizardData, contactInfo, censusData, completedSteps, currentStep } = initialState

    if (wizardData) {
      Object.entries(STEP_FIELD_MAP).forEach(([stepId, fields]) => {
        const data: Partial<WizardData> = {}

        fields.forEach(field => {
          const value = wizardData[field]
          if (value !== undefined) {
            data[field] = value as any
          }
        })

        if (Object.keys(data).length > 0) {
          updateStepData(Number(stepId), data)
        }
      })
    }

    if (contactInfo) {
      updateContactInfo(contactInfo)
    }

    if (censusData) {
      updateCensusData(censusData)
    }

    if (completedSteps?.length) {
      completedSteps.forEach(stepId => markStepCompleted(stepId))
    }

    if (currentStep && currentStep > 1) {
      goToStep(currentStep)
    }
  }, [initialState, updateStepData, updateContactInfo, updateCensusData, markStepCompleted, goToStep])

  return null
}

function WizardTestProviders({ locale, initialState, children }: WizardTestProvidersProps) {
  return (
    <LanguageProvider initialLocale={locale}>
      <WizardProvider totalSteps={WIZARD_STEPS.length} locale={locale}>
        <WizardStateInitializer initialState={initialState} />
        {children}
      </WizardProvider>
    </LanguageProvider>
  )
}

export interface RenderWizardOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale
  initialState?: WizardInitialState
  userOptions?: Parameters<typeof userEvent.setup>[0]
}

export interface RenderWizardResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>
}

export function renderWithWizardProviders(
  ui: React.ReactElement,
  { locale = 'en', initialState, userOptions, ...options }: RenderWizardOptions = {}
): RenderWizardResult {
  const user = userEvent.setup(userOptions)

  const wrapper = ({ children }: PropsWithChildren) => (
    <WizardTestProviders locale={locale} initialState={initialState}>
      {children}
    </WizardTestProviders>
  )

  const result = render(ui, { wrapper, ...options })

  return { ...result, user }
}

// =============================================================================
// Service mock orchestration
// =============================================================================

type FetchLike = typeof fetch

const originalFetch: FetchLike = global.fetch

function createGeocodingResponse(address: string) {
  const entryKey = Object.keys(mockCensusData).find(key => key.toLowerCase().includes(address.toLowerCase()))
  if (!entryKey) {
    return {
      result: {
        addressMatches: []
      }
    }
  }
  return mockCensusData[entryKey as keyof typeof mockCensusData].geocoding
}

function parseUrl(input: RequestInfo | URL): string {
  if (input instanceof URL) {
    return input.toString()
  }
  if (typeof input === 'string') {
    return input
  }
  return input.url
}

export function installIntegrationFetchMocks() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = parseUrl(input)

    if (url.startsWith('/api/geocoding')) {
      const fullUrl = new URL(url, 'http://localhost')
      const address = fullUrl.searchParams.get('address') || ''

      const responseData = createGeocodingResponse(address)

      return {
        ok: true,
        status: 200,
        json: async () => responseData
      } as Response
    }

    if (url.startsWith('/api/leads')) {
      return mockApiFetch(url, init)
    }

    if (url.includes('census.gov') || url.includes('geocoding.geo.census.gov')) {
      return mockCensusFetch(url)
    }

    return originalFetch(input as any, init)
  })

  vi.stubGlobal('fetch', fetchMock as unknown as FetchLike)

  return fetchMock
}

export function restoreIntegrationFetchMocks() {
  vi.stubGlobal('fetch', originalFetch)
}

export const integrationMockHelpers = {
  census: mockCensusHelpers,
  api: mockApiHelpers,
  ai: mockGeminiHelpers,
  zapier: mockZapierHelpers
}

// =============================================================================
// Wizard flow data builders
// =============================================================================

export interface WizardFlowData {
  city: string
  zipCode: string
  locationPriority: string[]
  timeline: string
  budgetType: 'price' | 'monthly'
  targetPrice?: number
  monthlyBudget?: number
  annualIncome: number
  monthlyDebts: number
  creditScore: string
  downPaymentAmount: number
  employmentType: string
  buyerType: string[]
  householdSize: number
  contact: ContactInfo
}

const BASE_FLOW_DATA: WizardFlowData = {
  city: 'Austin',
  zipCode: '78701',
  locationPriority: ['schools', 'safety'],
  timeline: '3-6',
  budgetType: 'price',
  targetPrice: 450000,
  monthlyBudget: undefined,
  annualIncome: 95000,
  monthlyDebts: 500,
  creditScore: '700-739',
  downPaymentAmount: 45000,
  employmentType: 'w2_employee',
  buyerType: ['first-time'],
  householdSize: 3,
  contact: {
    firstName: 'Jordan',
    lastName: 'Rivera',
    email: 'jordan.rivera@example.com',
    phone: '(555) 867-5309'
  }
}

export function createWizardFlowData(overrides: Partial<WizardFlowData> = {}): WizardFlowData {
  return {
    ...BASE_FLOW_DATA,
    ...overrides,
    locationPriority: overrides.locationPriority ?? [...BASE_FLOW_DATA.locationPriority],
    buyerType: overrides.buyerType ?? [...BASE_FLOW_DATA.buyerType],
    contact: {
      ...BASE_FLOW_DATA.contact,
      ...overrides.contact
    }
  }
}

// =============================================================================
// UI interaction helpers
// =============================================================================

export async function completeLocationStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /where do you want to buy\?|¿dónde quieres comprar\?/i })

  const cityInput = result.getByPlaceholderText(/enter texas city name|ingresa el nombre de la ciudad de texas/i)
  await user.clear(cityInput)
  await user.type(cityInput, data.city)

  const zipInput = result.getByPlaceholderText(/enter zip code|ingresa el código postal/i)
  await user.clear(zipInput)
  await user.type(zipInput, data.zipCode)

  const priorityLabel = result.getByLabelText(/good schools|buenas escuelas/i)
  await user.click(priorityLabel)

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeTimelineStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /when do you want to buy\?|¿cuándo quieres comprar\?/i })

  const option = result.getByLabelText(/3-6 months|3-6 meses/i)
  await user.click(option)

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeBudgetStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /what's your budget\?|¿cuál es tu presupuesto\?/i })

  const budgetTypeLabel = result.getByLabelText(/total home price|precio total de casa/i)
  await user.click(budgetTypeLabel)

  const targetPriceInput = result.getByLabelText(/target home price|precio objetivo de casa/i)
  await user.clear(targetPriceInput)
  await user.type(targetPriceInput, String(data.targetPrice || 400000))

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeIncomeStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /tell us about your income|cuéntanos sobre tus ingresos/i })

  const incomeInput = result.getByLabelText(/annual household income|ingreso anual del hogar/i)
  await user.clear(incomeInput)
  await user.type(incomeInput, String(data.annualIncome))

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeDebtsStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /current debts and credit|deudas actuales y crédito/i })

  const debtsInput = result.getByLabelText(/total monthly debt payments|total de pagos mensuales de deuda/i)
  await user.clear(debtsInput)
  await user.type(debtsInput, String(data.monthlyDebts))

  const creditSelect = result.getByLabelText(/credit score range|rango de puntaje crediticio/i)
  await user.selectOptions(creditSelect, data.creditScore)

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeDownPaymentStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /how much can you put down\?|¿cuánto puedes dar de enganche\?/i })

  const amountInput = result.getByLabelText(/down payment amount|monto del enganche/i)
  await user.clear(amountInput)
  await user.type(amountInput, String(data.downPaymentAmount))

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeEmploymentStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /employment situation|situación de empleo/i })

  const employmentOption = result.getByLabelText(/w-2 employee|empleado w-2/i)
  await user.click(employmentOption)

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeBuyerProfileStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /tell us about yourself|háblanos sobre ti/i })

  const buyerOption = result.getByLabelText(/first-time buyer|comprador por primera vez/i)
  await user.click(buyerOption)

  const householdInput = result.getByLabelText(/household size|tamaño del hogar/i)
  await user.clear(householdInput)
  await user.type(householdInput, String(data.householdSize))

  const nextButton = result.getByRole('button', { name: /next step|siguiente paso/i })
  await user.click(nextButton)
}

export async function completeContactStep(result: RenderResult, user: ReturnType<typeof userEvent.setup>, data: WizardFlowData) {
  await result.findByRole('heading', { name: /get your personalized results|obtén tus resultados personalizados/i })

  const { contact } = data
  await user.clear(result.getByLabelText(/first name|nombre/i))
  await user.type(result.getByLabelText(/first name|nombre/i), contact.firstName)
  await user.clear(result.getByLabelText(/last name|apellido/i))
  await user.type(result.getByLabelText(/last name|apellido/i), contact.lastName)
  await user.clear(result.getByLabelText(/email address|correo electrónico/i))
  await user.type(result.getByLabelText(/email address|correo electrónico/i), contact.email)
  await user.clear(result.getByLabelText(/phone number|número de teléfono/i))
  await user.type(result.getByLabelText(/phone number|número de teléfono/i), contact.phone)

  const submitButton = result.getByRole('button', { name: /Generate My Plan|Generar Mi Plan/i })
  await user.click(submitButton)
}

export async function completeHappyPathWizardFlow(result: RenderResult, user: ReturnType<typeof userEvent.setup>, overrides: Partial<WizardFlowData> = {}) {
  const data = createWizardFlowData(overrides)

  await completeLocationStep(result, user, data)
  await completeTimelineStep(result, user, data)
  await completeBudgetStep(result, user, data)
  await completeIncomeStep(result, user, data)
  await completeDebtsStep(result, user, data)
  await completeDownPaymentStep(result, user, data)
  await completeEmploymentStep(result, user, data)
  await completeBuyerProfileStep(result, user, data)
  await completeContactStep(result, user, data)
}

// =============================================================================
// Assertion helpers
// =============================================================================

export function expectWizardProgress(result: RenderResult, percentage: number) {
  const progressText = result.getByText(/Step \d+ of \d+\s+•\s+\d+%/i)
  expect(progressText.textContent).toContain(`${percentage}%`)
}

export function expectStepTitle(result: RenderResult, matcher: RegExp) {
  expect(result.getByRole('heading', { name: matcher })).toBeInTheDocument()
}

export function resetIntegrationMocks() {
  mockCensusHelpers.reset()
  mockApiHelpers.reset()
  mockGeminiHelpers.reset()
  mockZapierHelpers.reset()
  mockGeneratePersonalizedPlan.mockClear()
  mockZapierSubmitLead.mockClear()
}
