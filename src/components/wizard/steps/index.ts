/**
 * Wizard Steps Index
 *
 * Central export point for all wizard step components and utilities
 */

import React from 'react'

// Step Components
export { LocationStep } from './location-step'
export { TimelineStep } from './timeline-step'
export { BudgetStep } from './budget-step'
export { IncomeStep } from './income-step'
export { DebtsCreditStep } from './debts-credit-step'
export { DownPaymentStep } from './down-payment-step'
export { EmploymentStep } from './employment-step'
export { BuyerProfileStep } from './buyer-profile-step'
export { ContactStep } from './contact-step'
export { ResultsStep } from './results-step'

// Step Component Types
export interface StepComponentProps {
  onNext: () => void
}

export interface ResultsStepProps {
  results?: Record<string, unknown>
}

// Step Configuration
export interface StepConfig {
  id: number
  name: string
  title: Record<'en' | 'es', string>
  description: Record<'en' | 'es', string>
  componentKey: number
  required: boolean
  validation?: boolean
}

// Step Configuration Array
export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 1,
    name: 'location',
    title: {
      en: 'Location & Preferences',
      es: 'Ubicación y Preferencias'
    },
    description: {
      en: 'Where would you like to buy and what type of home?',
      es: '¿Dónde te gustaría comprar y qué tipo de casa?'
    },
    componentKey: 1,
    required: true,
    validation: true
  },
  {
    id: 2,
    name: 'timeline',
    title: {
      en: 'Timeline',
      es: 'Cronograma'
    },
    description: {
      en: 'When are you planning to buy?',
      es: '¿Cuándo planeas comprar?'
    },
    componentKey: 2,
    required: true,
    validation: true
  },
  {
    id: 3,
    name: 'budget',
    title: {
      en: 'Budget & Price Range',
      es: 'Presupuesto y Rango de Precios'
    },
    description: {
      en: 'What\'s your target price range?',
      es: '¿Cuál es tu rango de precios objetivo?'
    },
    componentKey: 3,
    required: true,
    validation: true
  },
  {
    id: 4,
    name: 'income',
    title: {
      en: 'Income Information',
      es: 'Información de Ingresos'
    },
    description: {
      en: 'Tell us about your income',
      es: 'Cuéntanos sobre tus ingresos'
    },
    componentKey: 4,
    required: true,
    validation: true
  },
  {
    id: 5,
    name: 'debts-credit',
    title: {
      en: 'Debts & Credit',
      es: 'Deudas y Crédito'
    },
    description: {
      en: 'Your current debts and credit situation',
      es: 'Tus deudas actuales y situación crediticia'
    },
    componentKey: 5,
    required: true,
    validation: true
  },
  {
    id: 6,
    name: 'down-payment',
    title: {
      en: 'Down Payment',
      es: 'Enganche'
    },
    description: {
      en: 'How much can you put down?',
      es: '¿Cuánto puedes dar de enganche?'
    },
    componentKey: 6,
    required: true,
    validation: true
  },
  {
    id: 7,
    name: 'employment',
    title: {
      en: 'Employment',
      es: 'Empleo'
    },
    description: {
      en: 'Your employment situation',
      es: 'Tu situación de empleo'
    },
    componentKey: 7,
    required: true,
    validation: true
  },
  {
    id: 8,
    name: 'buyer-profile',
    title: {
      en: 'Buyer Profile',
      es: 'Perfil del Comprador'
    },
    description: {
      en: 'Tell us about yourself',
      es: 'Háblanos sobre ti'
    },
    componentKey: 8,
    required: true,
    validation: true
  },
  {
    id: 9,
    name: 'contact',
    title: {
      en: 'Contact Information',
      es: 'Información de Contacto'
    },
    description: {
      en: 'Get your personalized results',
      es: 'Obtén tus resultados personalizados'
    },
    componentKey: 9,
    required: true,
    validation: true
  },
  {
    id: 10,
    name: 'results',
    title: {
      en: 'Your Results',
      es: 'Tus Resultados'
    },
    description: {
      en: 'Your personalized home buying plan',
      es: 'Tu plan personalizado de compra de casa'
    },
    componentKey: 10,
    required: false,
    validation: false
  }
]

// Utility Functions
export const getStepById = (id: number): StepConfig | undefined => {
  return WIZARD_STEPS.find(step => step.id === id)
}

export const getStepByName = (name: string): StepConfig | undefined => {
  return WIZARD_STEPS.find(step => step.name === name)
}

export const getNextStep = (currentStepId: number): StepConfig | undefined => {
  return WIZARD_STEPS.find(step => step.id === currentStepId + 1)
}

export const getPreviousStep = (currentStepId: number): StepConfig | undefined => {
  return WIZARD_STEPS.find(step => step.id === currentStepId - 1)
}

export const getTotalSteps = (): number => {
  return WIZARD_STEPS.length
}

export const getRequiredSteps = (): StepConfig[] => {
  return WIZARD_STEPS.filter(step => step.required)
}

export const getOptionalSteps = (): StepConfig[] => {
  return WIZARD_STEPS.filter(step => !step.required)
}

export const getStepsWithValidation = (): StepConfig[] => {
  return WIZARD_STEPS.filter(step => step.validation)
}

export const isLastStep = (stepId: number): boolean => {
  return stepId === WIZARD_STEPS.length
}

export const isFirstStep = (stepId: number): boolean => {
  return stepId === 1
}

export const getStepProgress = (currentStepId: number): number => {
  return Math.round((currentStepId / WIZARD_STEPS.length) * 100)
}

export const getCompletedStepsCount = (completedSteps: number[]): number => {
  return completedSteps.length
}

export const getRemainingStepsCount = (completedSteps: number[]): number => {
  return WIZARD_STEPS.length - completedSteps.length
}

// Step Navigation Helpers
export const canNavigateToStep = (
  targetStepId: number,
  completedSteps: number[],
  currentStepId: number
): boolean => {
  // Can always go backwards
  if (targetStepId <= currentStepId) {
    return true
  }

  // Can only go forward if all previous required steps are completed
  const requiredStepsBefore = WIZARD_STEPS
    .filter(step => step.id < targetStepId && step.required)
    .map(step => step.id)

  return requiredStepsBefore.every(stepId => completedSteps.includes(stepId))
}

export const getAvailableSteps = (completedSteps: number[], currentStepId: number): StepConfig[] => {
  return WIZARD_STEPS.filter(step =>
    canNavigateToStep(step.id, completedSteps, currentStepId)
  )
}

// Validation Helpers
export const validateStepCompletion = (stepId: number, stepData: Record<string, unknown>): boolean => {
  const step = getStepById(stepId)
  if (!step || !step.validation) {
    return true
  }

  // Basic validation - would be expanded with actual validation logic
  return stepData && Object.keys(stepData).length > 0
}

export const getIncompleteRequiredSteps = (completedSteps: number[]): StepConfig[] => {
  return WIZARD_STEPS.filter(step =>
    step.required && !completedSteps.includes(step.id)
  )
}

// Step Component Map for Dynamic Rendering - using lazy loading to avoid circular dependencies
export const STEP_COMPONENTS_MAP = {
  1: () => import('./location-step').then(m => m.LocationStep),
  2: () => import('./timeline-step').then(m => m.TimelineStep),
  3: () => import('./budget-step').then(m => m.BudgetStep),
  4: () => import('./income-step').then(m => m.IncomeStep),
  5: () => import('./debts-credit-step').then(m => m.DebtsCreditStep),
  6: () => import('./down-payment-step').then(m => m.DownPaymentStep),
  7: () => import('./employment-step').then(m => m.EmploymentStep),
  8: () => import('./buyer-profile-step').then(m => m.BuyerProfileStep),
  9: () => import('./contact-step').then(m => m.ContactStep),
  10: () => import('./results-step').then(m => m.ResultsStep)
} as const

// Alias for backward compatibility
export const STEP_COMPONENTS = STEP_COMPONENTS_MAP

// Type Exports for External Use
export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type StepName = 'location' | 'timeline' | 'budget' | 'income' | 'debts-credit' | 'down-payment' | 'employment' | 'buyer-profile' | 'contact' | 'results'
export type Locale = 'en' | 'es'

// Constants
export const FIRST_STEP_ID = 1
export const LAST_STEP_ID = 10
export const RESULTS_STEP_ID = 10

// Default Export - Main Configuration
const WizardStepsConfig = {
  steps: WIZARD_STEPS,
  components: STEP_COMPONENTS_MAP,
  utils: {
    getStepById,
    getStepByName,
    getNextStep,
    getPreviousStep,
    getTotalSteps,
    getRequiredSteps,
    getOptionalSteps,
    getStepsWithValidation,
    isLastStep,
    isFirstStep,
    getStepProgress,
    getCompletedStepsCount,
    getRemainingStepsCount,
    canNavigateToStep,
    getAvailableSteps,
    validateStepCompletion,
    getIncompleteRequiredSteps
  }
}

export default WizardStepsConfig