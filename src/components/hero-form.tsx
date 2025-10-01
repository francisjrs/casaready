'use client'

import { useState } from 'react'
import { EmailInput, PhoneInput, NameInput, EnhancedSelect } from '@/components/wizard/enhanced-inputs'
import { useLanguage } from '@/contexts/language-context'

interface HeroFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  submitError: string | null
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  annualIncome: string
}

export function HeroFormComponent({ onSubmit, isSubmitting, submitError }: HeroFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    annualIncome: ''
  })

  const [validationState, setValidationState] = useState({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    annualIncome: true
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateValidation = (field: keyof FormData, isValid: boolean) => {
    setValidationState(prev => ({ ...prev, [field]: isValid }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Create FormData object to match existing handler expectations
    const form = e.currentTarget
    const formDataObj = new FormData()
    formDataObj.append('firstName', formData.firstName)
    formDataObj.append('lastName', formData.lastName)
    formDataObj.append('email', formData.email)
    formDataObj.append('phone', formData.phone)
    formDataObj.append('annualIncome', formData.annualIncome)

    // Replace form data in the event
    Object.defineProperty(e, 'currentTarget', {
      value: { ...form, reset: form.reset },
      writable: false
    })

    onSubmit(e)
  }

  const isFormValid = Object.values(validationState).every(Boolean) &&
                     Object.values(formData).every(value => value.trim() !== '')

  const incomeOptions = [
    { value: '', label: t('components.heroForm.incomeOptions.default') },
    { value: '$30,000 - $50,000', label: t('components.heroForm.incomeOptions.30k50k') },
    { value: '$50,000 - $75,000', label: t('components.heroForm.incomeOptions.50k75k') },
    { value: '$75,000 - $100,000', label: t('components.heroForm.incomeOptions.75k100k') },
    { value: '$100,000 - $150,000', label: t('components.heroForm.incomeOptions.100k150k') },
    { value: '$150,000+', label: t('components.heroForm.incomeOptions.150kPlus') }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
      {submitError && (
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-down"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm font-medium">{submitError}</p>
          </div>
        </div>
      )}

      {/* Names - Mobile-first responsive layout */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
        <NameInput
          label={t('components.heroForm.fields.firstName')}
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          onValidationChange={(isValid) => updateValidation('firstName', isValid)}
          fieldName="first name"
          required
          disabled={isSubmitting}
          autoComplete="given-name"
          className="w-full"
        />

        <NameInput
          label={t('components.heroForm.fields.lastName')}
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          onValidationChange={(isValid) => updateValidation('lastName', isValid)}
          fieldName="last name"
          required
          disabled={isSubmitting}
          autoComplete="family-name"
          className="w-full"
        />
      </div>

      {/* Email */}
      <EmailInput
        label={t('components.heroForm.fields.email')}
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        onValidationChange={(isValid) => updateValidation('email', isValid)}
        required
        disabled={isSubmitting}
        className="w-full"
      />

      {/* Phone */}
      <PhoneInput
        label={t('components.heroForm.fields.phone')}
        value={formData.phone}
        onChange={(value) => updateField('phone', value)}
        onValidationChange={(isValid) => updateValidation('phone', isValid)}
        required
        disabled={isSubmitting}
        className="w-full"
      />

      {/* Income */}
      <EnhancedSelect
        label={t('components.heroForm.fields.income')}
        value={formData.annualIncome}
        onChange={(value) => {
          updateField('annualIncome', value)
          updateValidation('annualIncome', value !== '')
        }}
        options={incomeOptions}
        required
        disabled={isSubmitting}
        helpText={t('components.heroForm.helpText')}
        className="w-full"
      />

      {/* Submit Button with Enhanced UX */}
      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="
          w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold
          py-4 px-6 rounded-xl min-h-[48px]
          hover:from-brand-700 hover:to-brand-800
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          transition-all duration-300 transform hover:-translate-y-0.5
          shadow-lg hover:shadow-xl
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          disabled:hover:shadow-lg
        "
        aria-describedby={submitError ? 'form-error' : undefined}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('components.heroForm.submittingButton')}</span>
          </span>
        ) : (
          <span>{t('components.heroForm.submitButton')}</span>
        )}
      </button>

      {/* Privacy Notice */}
      <div className="mt-6 flex flex-col items-center text-xs text-gray-500 leading-relaxed space-y-2">
        <span className="inline-flex items-center">
          <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {t('components.heroForm.privacyTitle')}
        </span>
        <span className="text-center">
          {t('components.heroForm.privacyNotice')}
        </span>
      </div>
    </form>
  )
}
