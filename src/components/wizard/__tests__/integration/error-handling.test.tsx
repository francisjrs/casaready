import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { TimelineStep } from '@/components/wizard/steps/timeline-step'
import { ContactStep } from '@/components/wizard/steps/contact-step'
import { submitLead } from '@/lib/services/lead-service'
import {
  renderWithWizardProviders,
  installIntegrationFetchMocks,
  restoreIntegrationFetchMocks,
  resetIntegrationMocks,
  integrationMockHelpers,
  createWizardFlowData,
  completeContactStep
} from '@/test/utils/integration-helpers'
import { mockGeneratePersonalizedPlan } from '@/test/mocks/gemini-client'

const renderTimelineStep = () => {
  const onNext = vi.fn()
  const result = renderWithWizardProviders(<TimelineStep onNext={onNext} />)
  return { onNext, ...result }
}

const renderContactStep = () => {
  const onNext = vi.fn()
  const result = renderWithWizardProviders(<ContactStep onNext={onNext} />, {
    initialState: {
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
      wizardData: {
        city: 'Austin',
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
  })

  return { onNext, ...result }
}

describe('Wizard error handling', () => {
  beforeEach(() => {
    installIntegrationFetchMocks()
    resetIntegrationMocks()

    integrationMockHelpers.census.setDelay(0)
    integrationMockHelpers.ai.setDelay(0)
    integrationMockHelpers.api.setDelay(0)
    integrationMockHelpers.zapier.setDelay(0)

    integrationMockHelpers.ai.configureSuccess()
    integrationMockHelpers.api.configureSuccess()
    integrationMockHelpers.zapier.configureSuccess()
  })

  afterEach(() => {
    restoreIntegrationFetchMocks()
  })

  it('prevents navigation when timeline selection is missing', async () => {
    const { user, onNext, ...result } = renderTimelineStep()

    const nextButton = result.getByRole('button', { name: /Next Step/i })
    await user.click(nextButton)

    const alert = await result.findByText(/Please fix the following/i)
    expect(alert).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('shows contact form validation errors for malformed email and allows correction', async () => {
    const { user, onNext, ...result } = renderContactStep()
    const data = createWizardFlowData({ contact: { email: 'invalid-email' } })

    await completeContactStep(result, user, data)

    const errorList = await result.findByText(/Valid email is required/i)
    expect(errorList).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()

    await user.clear(result.getByLabelText(/Email Address/i))
    await user.type(result.getByLabelText(/Email Address/i), 'fixed@example.com')

    await user.click(result.getByRole('button', { name: /Generate My Plan/i }))

    await waitFor(() => {
      expect(mockGeneratePersonalizedPlan).toHaveBeenCalled()
    })
  })

  it('displays retry guidance when AI report generation fails and clears after success', async () => {
    integrationMockHelpers.ai.configureError()

    const { user, ...result } = renderContactStep()
    await completeContactStep(result, user, createWizardFlowData())

    const error = await result.findByText(/Failed to generate plan/i)
    expect(error).toBeInTheDocument()

    integrationMockHelpers.ai.configureSuccess()

    await user.clear(result.getByLabelText(/Email Address/i))
    await user.type(result.getByLabelText(/Email Address/i), 'retry@example.com')
    await user.click(result.getByRole('button', { name: /Generate My Plan/i }))

    await waitFor(() => {
      expect(mockGeneratePersonalizedPlan).toHaveBeenCalled()
    })

    expect(result.queryByText(/Failed to generate plan/i)).toBeNull()
  })

  it('returns descriptive error result when both lead submission channels fail', async () => {
    integrationMockHelpers.api.setShouldFail(true, 'server')
    integrationMockHelpers.zapier.configureNetworkError()

    const wizardData = {
      city: 'Austin',
      timeline: '3-6',
      budgetType: 'price' as const,
      targetPrice: 450000,
      annualIncome: 95000,
      monthlyDebts: 500,
      creditScore: '700-739',
      downPaymentAmount: 45000,
      employmentType: 'w2_employee',
      buyerType: ['first-time'] as string[],
      householdSize: 3
    }

    const contact = createWizardFlowData().contact
    const result = await submitLead(wizardData, contact, 'en')

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/failed/i)
    expect(result.error).toContain('Zapier')
  })
})
