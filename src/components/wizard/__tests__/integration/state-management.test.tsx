import { describe, expect, it } from 'vitest'

import { useWizard } from '@/lib/services/wizard-service'
import {
  renderWithWizardProviders
} from '@/test/utils/integration-helpers'

const WizardHarness = () => {
  const wizard = useWizard()

  const updateFinancials = () => {
    wizard.updateStepData(3, { budgetType: 'price', targetPrice: 425000 })
    wizard.updateStepData(4, { annualIncome: 95000 })
  }

  const updateContact = () => {
    wizard.updateContactInfo({
      firstName: 'Taylor',
      lastName: 'Morgan',
      email: 'taylor.morgan@example.com',
      phone: '(555) 111-2222'
    })
  }

  const completeLocation = () => {
    wizard.updateStepData(1, { city: 'Austin', zipCode: '78701' })
    wizard.markStepCompleted(1)
  }

  const advanceStep = () => {
    wizard.goToNextStep()
  }

  const goBack = () => {
    wizard.goToPreviousStep()
  }

  const validateContact = async () => {
    await wizard.validateStep(9, {
      firstName: '',
      lastName: '',
      email: 'invalid',
      phone: '1234'
    }, wizard.locale)
  }

  const setCensus = () => {
    wizard.updateCensusData({
      location: {
        city: 'Austin',
        state: 'TX',
        county: 'Travis County'
      },
      demographics: {
        population: 1000000,
        medianHouseholdIncome: 78000,
        medianHomeValue: 420000,
        unemploymentRate: 3.1,
        educationLevel: {
          highSchool: 400000,
          bachelors: 380000,
          graduate: 120000
        },
        ageDistribution: {
          under18: 200000,
          working: 650000,
          senior: 150000
        }
      },
      economicIndicators: {
        jobGrowth: 3.2,
        costOfLiving: 105,
        marketTrend: 'growing'
      },
      recommendations: ['Strong job market'],
      dataQuality: 'high',
      lastUpdated: new Date().toISOString()
    })
  }

  return (
    <div>
      <button onClick={updateFinancials} data-testid="update-financials">update</button>
      <button onClick={updateContact} data-testid="update-contact">contact</button>
      <button onClick={completeLocation} data-testid="complete-location">complete</button>
      <button onClick={advanceStep} data-testid="next-step">next</button>
      <button onClick={goBack} data-testid="prev-step">prev</button>
      <button onClick={validateContact} data-testid="validate-contact">validate</button>
      <button onClick={setCensus} data-testid="set-census">census</button>
      <div data-testid="wizard-state">
        {JSON.stringify({
          currentStep: wizard.currentStep,
          totalSteps: wizard.totalSteps,
          wizardData: wizard.wizardData,
          contactInfo: wizard.contactInfo,
          completed: Array.from(wizard.completedSteps),
          progress: wizard.getProgress(),
          contactReady: wizard.canProceedToNext(9),
          censusCity: wizard.censusData?.location.city
        })}
      </div>
    </div>
  )
}

describe('WizardProvider state management', () => {
  it('initializes with default values', () => {
    const { getByTestId } = renderWithWizardProviders(<WizardHarness />)
    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')

    expect(state.currentStep).toBe(1)
    expect(state.totalSteps).toBe(10)
    expect(state.wizardData).toEqual({})
    expect(state.contactInfo.email).toBe('')
    expect(state.progress).toBe(0)
  })

  it('updates wizard data and contact info while tracking completion', async () => {
    const { user, getByTestId } = renderWithWizardProviders(<WizardHarness />)

    await user.click(getByTestId('update-financials'))
    await user.click(getByTestId('complete-location'))

    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')

    expect(state.wizardData).toMatchObject({
      city: 'Austin',
      targetPrice: 425000,
      annualIncome: 95000
    })
    expect(state.completed).toContain(1)
    expect(state.progress).toBeGreaterThan(0)
  })

  it('persists contact information updates', async () => {
    const { user, getByTestId } = renderWithWizardProviders(<WizardHarness />)

    await user.click(getByTestId('update-contact'))

    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')
    expect(state.contactInfo).toMatchObject({
      firstName: 'Taylor',
      lastName: 'Morgan',
      email: 'taylor.morgan@example.com'
    })
  })

  it('navigates between steps and preserves collected data', async () => {
    const { user, getByTestId } = renderWithWizardProviders(<WizardHarness />)

    await user.click(getByTestId('complete-location'))
    await user.click(getByTestId('next-step'))
    await user.click(getByTestId('next-step'))
    await user.click(getByTestId('prev-step'))

    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')

    expect(state.currentStep).toBe(2)
    expect(state.wizardData.city).toBe('Austin')
  })

  it('records validation errors and blocks progression when data is invalid', async () => {
    const { user, getByTestId } = renderWithWizardProviders(<WizardHarness />)

    await user.click(getByTestId('validate-contact'))

    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')
    expect(state.contactReady).toBe(false)
  })

  it('stores census data updates for reuse across steps', async () => {
    const { user, getByTestId } = renderWithWizardProviders(<WizardHarness />)

    await user.click(getByTestId('set-census'))

    const state = JSON.parse(getByTestId('wizard-state').textContent || '{}')
    expect(state.censusCity).toBe('Austin')
  })
})
