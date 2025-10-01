import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { LocationStep } from '@/components/wizard/steps/location-step'
import { ContactStep } from '@/components/wizard/steps/contact-step'
import { ResultsStep } from '@/components/wizard/steps/results-step'
import { TimelineStep } from '@/components/wizard/steps/timeline-step'
import {
  renderWithWizardProviders,
  createWizardFlowData,
  installIntegrationFetchMocks,
  restoreIntegrationFetchMocks,
  resetIntegrationMocks,
  integrationMockHelpers
} from '@/test/utils/integration-helpers'
import { useWizard } from '@/lib/services/wizard-service'

const WizardProbe = ({ testId }: { testId: string }) => {
  const wizard = useWizard()
  return (
    <div data-testid={testId}>
      {JSON.stringify({
        wizardData: wizard.wizardData,
        contactInfo: wizard.contactInfo,
        completed: Array.from(wizard.completedSteps)
      })}
    </div>
  )
}

describe('Wizard step component integration', () => {
  beforeEach(() => {
    installIntegrationFetchMocks()
    resetIntegrationMocks()

    integrationMockHelpers.census.setDelay(0)
    integrationMockHelpers.api.setDelay(0)
    integrationMockHelpers.ai.setDelay(0)
    integrationMockHelpers.zapier.setDelay(0)

    integrationMockHelpers.census.configureSuccess()
    integrationMockHelpers.api.configureSuccess()
    integrationMockHelpers.ai.configureSuccess()
    integrationMockHelpers.zapier.configureSuccess()
  })

  afterEach(() => {
    restoreIntegrationFetchMocks()
  })

  it('persists location input into wizard state', async () => {
    const onNext = vi.fn()
    const { user, ...result } = renderWithWizardProviders(
      <>
        <LocationStep onNext={onNext} />
        <WizardProbe testId="wizard-state" />
      </>
    )

    const cityInput = await result.findByPlaceholderText(/enter texas city name/i)
    await user.clear(cityInput)
    await user.type(cityInput, 'Dallas')

    const priorityOption = result.getByLabelText(/Good Schools/i)
    await user.click(priorityOption)

    await waitFor(() => {
      const state = JSON.parse(result.getByTestId('wizard-state').textContent || '{}')
      expect(state.wizardData.city).toBe('Dallas')
      expect(state.wizardData.locationPriority).toContain('schools')
    })
  })

  it('synchronizes contact info and formats phone numbers', async () => {
    const onNext = vi.fn()
    const { user, ...result } = renderWithWizardProviders(
      <>
        <ContactStep onNext={onNext} />
        <WizardProbe testId="wizard-contact" />
      </>,
      {
        initialState: {
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
          wizardData: {
            timeline: '3-6',
            budgetType: 'price',
            targetPrice: 450000
          }
        }
      }
    )

    await result.findByRole('heading', { name: /Get your personalized results/i })

    await user.type(result.getByLabelText(/First Name/i), 'Alex')
    await user.type(result.getByLabelText(/Last Name/i), 'Nguyen')
    await user.type(result.getByLabelText(/Email Address/i), 'alex.nguyen@example.com')
    await user.type(result.getByLabelText(/Phone Number/i), '5125550000')

    await waitFor(() => {
      const state = JSON.parse(result.getByTestId('wizard-contact').textContent || '{}')
      expect(state.contactInfo).toMatchObject({
        firstName: 'Alex',
        lastName: 'Nguyen',
        email: 'alex.nguyen@example.com'
      })
      expect(state.contactInfo.phone).toBe('(512) 555-0000')
    })
  })

  it('renders results summary using wizard context data', async () => {
    const flowData = createWizardFlowData({ targetPrice: 500000 })

    const { getByText } = renderWithWizardProviders(
      <ResultsStep />,
      {
        initialState: {
          wizardData: {
            city: flowData.city,
            targetPrice: flowData.targetPrice,
            annualIncome: flowData.annualIncome,
            downPaymentAmount: flowData.downPaymentAmount
          },
          contactInfo: flowData.contact
        }
      }
    )

    expect(getByText(/Jordan Rivera/)).toBeInTheDocument()
    expect(getByText(/Target Price/)).toBeInTheDocument()
    expect(getByText(/\$500,000/)).toBeInTheDocument()
  })

  it('retains wizard data when components unmount and remount', async () => {
    const onNext = vi.fn()
    const render = renderWithWizardProviders(
      <>
        <LocationStep onNext={onNext} />
        <WizardProbe testId="wizard-state" />
      </>
    )

    const { user, rerender, getByTestId, findByPlaceholderText } = render

    const cityInput = await findByPlaceholderText(/enter texas city name/i)
    await user.type(cityInput, 'Houston')

    await waitFor(() => {
      const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')
      expect(state.wizardData.city).toBe('Houston')
    })

    rerender(
      <>
        <LocationStep onNext={onNext} />
        <WizardProbe testId="wizard-state" />
      </>
    )

    const cityInputAfter = await findByPlaceholderText(/enter texas city name/i)
    expect((cityInputAfter as HTMLInputElement).value).toBe('Houston')
  })

  it('marks steps as completed after successful validation', async () => {
    const onNext = vi.fn()
    const { user, ...result } = renderWithWizardProviders(
      <>
        <TimelineStep onNext={onNext} />
        <WizardProbe testId="wizard-state" />
      </>
    )

    const option = result.getByLabelText(/3-6 months/i)
    await user.click(option)

    const nextButton = result.getByRole('button', { name: /Next Step/i })
    await user.click(nextButton)

    await waitFor(() => {
      const state = JSON.parse(result.getByTestId('wizard-state').textContent || '{}')
      expect(state.completed).toContain(2)
    })
    expect(onNext).toHaveBeenCalled()
  })
})
