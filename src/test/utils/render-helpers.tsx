import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { act } from '@testing-library/react'
import { vi } from 'vitest'
import { WizardProvider, WizardState } from '@/lib/services/wizard-service'
import { createTestWizardData, TestWizardData } from './test-data'

// Mock wizard state for testing
interface MockWizardState extends Partial<WizardState> {
  currentStep?: number
  wizardData?: Partial<TestWizardData>
  contactInfo?: any
  completedSteps?: Set<number>
  errors?: Record<string, string>
}

// Default mock wizard state
const defaultMockState: MockWizardState = {
  currentStep: 0,
  wizardData: createTestWizardData(),
  contactInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'email'
  },
  completedSteps: new Set(),
  errors: {}
}

// Mock wizard context functions
export const createMockWizardContext = (initialState: MockWizardState = {}) => {
  const state = { ...defaultMockState, ...initialState }

  return {
    // State
    currentStep: state.currentStep || 0,
    wizardData: state.wizardData || createTestWizardData(),
    contactInfo: state.contactInfo,
    completedSteps: state.completedSteps || new Set(),
    errors: state.errors || {},
    censusData: state.censusData,

    // Navigation
    goToStep: vi.fn(),
    goToNextStep: vi.fn(),
    goToPreviousStep: vi.fn(),

    // Data management
    updateStepData: vi.fn(),
    getStepData: vi.fn().mockImplementation((step: number) => {
      switch (step) {
        case 0: return state.wizardData?.location || {}
        case 1: return state.wizardData?.timeline || {}
        case 2: return state.wizardData?.budget || {}
        case 3: return state.wizardData?.preferences || {}
        case 4: return state.wizardData?.financing || {}
        default: return {}
      }
    }),
    updateContactInfo: vi.fn(),
    updateCensusData: vi.fn(),

    // Validation
    validateStep: vi.fn().mockReturnValue({ isValid: true, errors: {} }),
    canProceedToNext: vi.fn().mockReturnValue(true),
    markStepCompleted: vi.fn(),
    isStepCompleted: vi.fn().mockImplementation((step: number) =>
      state.completedSteps?.has(step) || false
    ),

    // Progress
    getProgress: vi.fn().mockReturnValue(50),

    // Utilities
    resetWizard: vi.fn(),
    getWizardSummary: vi.fn().mockReturnValue('Mock wizard summary')
  }
}

// Custom render function with wizard provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wizardState?: MockWizardState
  useMockProvider?: boolean
}

export const renderWithWizard = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { mockWizardContext?: ReturnType<typeof createMockWizardContext> } => {
  const { wizardState = {}, useMockProvider = false, ...renderOptions } = options

  let mockWizardContext: ReturnType<typeof createMockWizardContext> | undefined

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (useMockProvider) {
      // For mocking, use module mock instead of prop injection:
      // vi.mock('@/lib/services/wizard-service', async (orig) => {
      //   const actual = await orig()
      //   return { ...actual, useWizard: () => createMockWizardContext(initialState) }
      // })
      mockWizardContext = createMockWizardContext(wizardState)
      throw new Error('Use module mocking instead of useMockProvider. See test comments for example.')
    }

    // Use real provider by default
    return <WizardProvider>{children}</WizardProvider>
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })

  return {
    ...result,
    mockWizardContext
  }
}

// Helper for testing specific wizard steps
export const renderWizardStep = (
  stepComponent: ReactElement,
  stepNumber: number,
  wizardData: Partial<TestWizardData> = {}
) => {
  const wizardState: MockWizardState = {
    currentStep: stepNumber,
    wizardData: createTestWizardData(wizardData),
    completedSteps: new Set(Array.from({ length: stepNumber }, (_, i) => i))
  }

  return renderWithWizard(stepComponent, { wizardState })
}

// Helper for testing form interactions
export const setupFormTest = (
  formComponent: ReactElement,
  initialData: any = {}
) => {
  const wizardState: MockWizardState = {
    wizardData: createTestWizardData(),
    ...initialData
  }

  const result = renderWithWizard(formComponent, { wizardState })

  return {
    ...result,
    // Common form testing utilities
    getFormElement: () => result.container.querySelector('form'),
    getSubmitButton: () => result.getByRole('button', { name: /submit|continue|next/i }),
    getErrorMessages: () => result.container.querySelectorAll('[role="alert"]'),
    hasValidationError: (fieldName: string) => {
      const field = result.container.querySelector(`[name="${fieldName}"]`)
      return field?.getAttribute('aria-invalid') === 'true'
    }
  }
}

// Helper for testing navigation
export const testWizardNavigation = async (
  component: ReactElement,
  navigationTests: Array<{
    action: string
    expectedStep: number
    description: string
  }>
) => {
  const { mockWizardContext } = renderWithWizard(component)

  const results = []

  for (const test of navigationTests) {
    switch (test.action) {
      case 'next':
        await mockWizardContext.goToNextStep()
        break
      case 'previous':
        await mockWizardContext.goToPreviousStep()
        break
      case 'goto':
        await mockWizardContext.goToStep(test.expectedStep)
        break
    }

    results.push({
      description: test.description,
      called: mockWizardContext.goToStep.mock.calls.length > 0 ||
              mockWizardContext.goToNextStep.mock.calls.length > 0 ||
              mockWizardContext.goToPreviousStep.mock.calls.length > 0
    })
  }

  return results
}

// Mock event helpers
export const createMockEvent = (type: string, data: any = {}) => {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {
      value: data.value || '',
      name: data.name || '',
      checked: data.checked || false,
      ...data.target
    },
    ...data
  }
}

// Async testing helper
export const waitForWizardUpdate = async (callback: () => void | Promise<void>) => {
  await act(async () => {
    await callback()
  })
}

// Mock validation helper
export const mockValidationResult = (isValid: boolean, errors: Record<string, string> = {}) => {
  return {
    isValid,
    errors
  }
}

// Test data access helpers
export const getTestWizardData = (scenario: keyof typeof testDataScenarios) => {
  return testDataScenarios[scenario]()
}

// Common assertions for wizard components
export const wizardAssertions = {
  shouldShowStep: (result: RenderResult, stepNumber: number) => {
    expect(result.container).toHaveAttribute('data-current-step', stepNumber.toString())
  },

  shouldShowProgress: (result: RenderResult, expectedProgress: number) => {
    const progressBar = result.container.querySelector('[role="progressbar"]')
    expect(progressBar).toHaveAttribute('aria-valuenow', expectedProgress.toString())
  },

  shouldShowValidationError: (result: RenderResult, fieldName: string, errorMessage: string) => {
    const field = result.container.querySelector(`[name="${fieldName}"]`)
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(result.getByText(errorMessage)).toBeInTheDocument()
  },

  shouldBeNavigable: (mockContext: any, direction: 'next' | 'previous') => {
    const canNavigate = direction === 'next' ?
      mockContext.canProceedToNext() :
      mockContext.currentStep > 0
    expect(canNavigate).toBe(true)
  }
}

// Export commonly used testing utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'