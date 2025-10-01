import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { LocationStep } from '@/components/wizard/steps/location-step'
import { ContactStep } from '@/components/wizard/steps/contact-step'
import { censusCache } from '@/lib/services/census-service'
import {
  createWizardFlowData,
  renderWithWizardProviders,
  installIntegrationFetchMocks,
  restoreIntegrationFetchMocks,
  resetIntegrationMocks,
  integrationMockHelpers,
  completeContactStep
} from '@/test/utils/integration-helpers'
import { mockCensusFetch } from '@/test/mocks/census-api'
import { mockGeneratePersonalizedPlan } from '@/test/mocks/gemini-client'
import { mockSubmitLead } from '@/test/mocks/zapier-client'
import { mockApiFetch } from '@/test/mocks/api-routes'

const renderLocationStep = (options?: Parameters<typeof renderWithWizardProviders>[1]) => {
  const onNext = vi.fn()
  return renderWithWizardProviders(<LocationStep onNext={onNext} />, options)
}

const renderContactStep = (locale: 'en' | 'es' = 'en') => {
  const onNext = vi.fn()
  const initialState = {
    completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    wizardData: {
      city: 'Austin',
      zipCode: '78701',
      timeline: '3-6',
      budgetType: 'price',
      targetPrice: 450000,
      annualIncome: 95000,
      monthlyDebts: 500,
      creditScore: '700-739',
      downPaymentAmount: 45000,
      employmentType: 'w2_employee',
      buyerType: ['first-time'],
      householdSize: 3
    }
  }

  return renderWithWizardProviders(<ContactStep onNext={onNext} />, {
    locale,
    initialState
  })
}

describe('Wizard external service integrations', () => {
  beforeEach(() => {
    installIntegrationFetchMocks()
    resetIntegrationMocks()
    censusCache.clear()

    integrationMockHelpers.census.setDelay(0)
    integrationMockHelpers.ai.setDelay(0)
    integrationMockHelpers.api.setDelay(0)
    integrationMockHelpers.zapier.setDelay(0)

    integrationMockHelpers.census.configureSuccess()
    integrationMockHelpers.ai.configureSuccess()
    integrationMockHelpers.api.configureSuccess()
    integrationMockHelpers.zapier.configureSuccess()
  })

  afterEach(() => {
    restoreIntegrationFetchMocks()
  })

  it('fetches census insights for location step and caches the result', async () => {
    vi.useFakeTimers()

    const { user, ...result } = renderLocationStep({ userOptions: { advanceTimers: vi.advanceTimersByTime.bind(vi) } })
    const flowData = createWizardFlowData()

    const cityInput = await result.findByPlaceholderText(/enter texas city name/i)
    await user.clear(cityInput)
    await user.type(cityInput, flowData.city)

    vi.runAllTimers()

    await waitFor(() => {
      expect(mockCensusFetch).toHaveBeenCalled()
      expect(censusCache.get('austin-')).toBeTruthy()
    })

    mockCensusFetch.mockClear()

    result.rerender(<LocationStep onNext={vi.fn()} />)
    vi.runAllTimers()

    await waitFor(() => {
      expect(mockCensusFetch).not.toHaveBeenCalled()
    })

    vi.useRealTimers()
  })

  it('provides fallback behavior when census service fails', async () => {
    integrationMockHelpers.census.configureNetworkError()
    vi.useFakeTimers()

    const { user, ...result } = renderLocationStep({ userOptions: { advanceTimers: vi.advanceTimersByTime.bind(vi) } })
    const cityInput = await result.findByPlaceholderText(/enter texas city name/i)

    await user.type(cityInput, 'Unknown City')
    vi.runAllTimers()

    await waitFor(() => {
      expect(mockCensusFetch).toHaveBeenCalled()
    })

    expect(censusCache.get('unknown city-')).toBeNull()

    vi.useRealTimers()
  })

  it('submits AI report generation and lead data in parallel on contact step submit', async () => {
    const flowData = createWizardFlowData()
    const { user, ...result } = renderContactStep('en')

    await completeContactStep(result, user, flowData)

    await waitFor(() => {
      expect(mockGeneratePersonalizedPlan).toHaveBeenCalled()
      expect(mockApiFetch).toHaveBeenCalledWith('/api/leads', expect.objectContaining({ method: 'POST' }))
      expect(mockSubmitLead).not.toHaveBeenCalled()
    })

    const [reportCallWizardData, reportCallContact, reportLocale] = mockGeneratePersonalizedPlan.mock.calls.at(-1) as any
    expect(reportCallWizardData).toMatchObject({ city: 'Austin', targetPrice: 450000 })
    expect(reportCallContact).toMatchObject({ email: flowData.contact.email })
    expect(reportLocale).toBe('en')
  })

  it('shows a submission error when AI service fails', async () => {
    integrationMockHelpers.ai.configureError()

    const { user, ...result } = renderContactStep('en')
    const flowData = createWizardFlowData()

    await completeContactStep(result, user, flowData)

    const errorAlert = await result.findByText(/Failed to generate plan/i)
    expect(errorAlert).toBeInTheDocument()
    expect(mockSubmitLead).not.toHaveBeenCalled()
  })

  it('falls back to Zapier submission when API request fails', async () => {
    integrationMockHelpers.api.setShouldFail(true, 'server')

    const { user, ...result } = renderContactStep('en')
    await completeContactStep(result, user, createWizardFlowData())

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalled()
    })
  })

  it('passes locale to AI service for Spanish submissions', async () => {
    const { user, ...result } = renderContactStep('es')
    const flowData = createWizardFlowData({ contact: { email: 'spanish@example.com' } })

    await completeContactStep(result, user, flowData)

    await waitFor(() => {
      expect(mockGeneratePersonalizedPlan).toHaveBeenCalled()
    })

    const lastCall = mockGeneratePersonalizedPlan.mock.calls.at(-1)
    expect(lastCall?.[2]).toBe('es')
  })
})
