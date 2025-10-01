import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InteractiveHomebuyerWizard } from '@/components/wizard/interactive-homebuyer-wizard'
import { LanguageProvider } from '@/contexts/language-context'
import {
  completeHappyPathWizardFlow,
  installIntegrationFetchMocks,
  restoreIntegrationFetchMocks,
  resetIntegrationMocks,
  integrationMockHelpers,
  createWizardFlowData,
  completeLocationStep,
  completeTimelineStep,
  expectWizardProgress,
  expectStepTitle
} from '@/test/utils/integration-helpers'

const renderWizardApp = async (
  locale: 'en' | 'es' = 'en',
  userOptions?: Parameters<typeof userEvent.setup>[0]
) => {
  const user = userEvent.setup(userOptions)
  const result = render(
    <LanguageProvider initialLocale={locale}>
      <InteractiveHomebuyerWizard />
    </LanguageProvider>
  )

  await waitFor(() => {
    expect(result.getByText(/Step 1 of 10/i)).toBeInTheDocument()
  })

  return { user, result }
}

describe('InteractiveHomebuyerWizard integration flow', () => {
  beforeEach(() => {
    installIntegrationFetchMocks()
    resetIntegrationMocks()

    integrationMockHelpers.census.setDelay(0)
    integrationMockHelpers.api.setDelay(0)
    integrationMockHelpers.ai.setDelay(0)
    integrationMockHelpers.zapier.setDelay(0)

    integrationMockHelpers.census.configureSuccess()
    integrationMockHelpers.ai.configureSuccess()
    integrationMockHelpers.zapier.configureSuccess()
    integrationMockHelpers.api.configureSuccess()
  })

  afterEach(() => {
    restoreIntegrationFetchMocks()
  })

  it('navigates forward through all wizard steps with valid input and shows final results', async () => {
    const { user, result } = await renderWizardApp('en')

    await completeHappyPathWizardFlow(result, user)

    await result.findByText(/Plan Generated Successfully/i)
    expect(result.getByText(/Step 10 of 10/i)).toBeInTheDocument()
    expectStepTitle(result, /Your Personalized Home Buying Plan/i)
  })

  it('preserves entered data when navigating backwards via progress controls', async () => {
    const { user, result } = await renderWizardApp('en')
    const flowData = createWizardFlowData({ city: 'San Antonio', zipCode: '78205' })

    await completeLocationStep(result, user, flowData)
    await completeTimelineStep(result, user, flowData)

    const budgetHeading = await result.findByRole('heading', { name: /what's your budget/i })
    expect(budgetHeading).toBeInTheDocument()

    const locationProgress = result.getByTitle(/Location & Preferences \(Completed\)/i)
    await user.click(locationProgress)

    const cityField = await result.findByPlaceholderText(/enter texas city name/i)
    expect((cityField as HTMLInputElement).value).toBe('San Antonio')

    const zipField = result.getByPlaceholderText(/enter zip code/i) as HTMLInputElement
    expect(zipField.value).toBe('78205')

    const timelineProgress = result.getByTitle(/Timeline \(Completed\)/i)
    await user.click(timelineProgress)

    const selectedTimeline = result.getByLabelText(/3-6 months/i) as HTMLInputElement
    expect(selectedTimeline.checked).toBe(true)
  })

  it('prevents navigation to incomplete future steps', async () => {
    const { user, result } = await renderWizardApp('en')

    await completeLocationStep(result, user, createWizardFlowData())

    const stepFiveButton = result.getByTitle(/Debts & Credit/i)
    expect(stepFiveButton).toHaveAttribute('disabled')
  })

  it('updates progress indicator as steps are completed', async () => {
    const { user, result } = await renderWizardApp('en')

    expectWizardProgress(result, 10)

    await completeLocationStep(result, user, createWizardFlowData())
    expectWizardProgress(result, 20)

    await completeTimelineStep(result, user, createWizardFlowData())
    expectWizardProgress(result, 30)
  })

  it('shows loading state when dynamically loading the next step', async () => {
    const { user, result } = await renderWizardApp('en')

    await completeLocationStep(result, user, createWizardFlowData())

    await waitFor(() => {
      expect(result.getByText(/Loading step/i)).toBeInTheDocument()
    })

    await result.findByRole('heading', { name: /when do you want to buy/i })
  })

  it('supports Spanish locale for headings and validation feedback', async () => {
    const { user, result } = await renderWizardApp('es')

    expectStepTitle(result, /¿Dónde quieres comprar\?/i)

    const nextButton = result.getByRole('button', { name: /Siguiente Paso/i })
    await user.click(nextButton)

    expectStepTitle(result, /¿Cuándo quieres comprar\?/i)

    const timelineNext = result.getByRole('button', { name: /Siguiente Paso/i })
    await user.click(timelineNext)

    const errorBanner = await result.findByText(/Por favor corrige lo siguiente/i)
    expect(errorBanner).toBeInTheDocument()
  })
})
