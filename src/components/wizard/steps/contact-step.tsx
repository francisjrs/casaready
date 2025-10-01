/**
 * Contact Step Component
 *
 * Handles contact information input and report generation
 */

'use client'

import { useState, useEffect } from 'react'
import { useWizard, submitLead, formatPhoneNumber } from '@/lib/services'
import { EnhancedErrorBox } from '@/components/ui/enhanced-error-display'
import { useLanguage } from '@/contexts/language-context'
import type { ReportData } from '@/lib/services/ai-service'

interface ContactStepProps {
  onNext: () => void
}

export function ContactStep({ onNext }: ContactStepProps) {
  const { t } = useLanguage()
  const { wizardData, contactInfo, updateContactInfo, validateStep, locale, markStepCompleted, updateReportData, censusData } = useWizard()

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: contactInfo.firstName || '',
    lastName: contactInfo.lastName || '',
    email: contactInfo.email || '',
    phone: contactInfo.phone || ''
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  // Update contact info when form data changes
  useEffect(() => {
    updateContactInfo({
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined
    })
  }, [formData, updateContactInfo])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const formattedPhone = formatPhoneNumber(value)
    setFormData(prev => ({
      ...prev,
      phone: formattedPhone
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsValidating(true)
    setErrors({})
    setSubmissionError(null)
    setStreamingContent('')
    setStreamingStatus(null)

    try {
      const validation = await validateStep(9, formData, locale)

      if (!validation.valid) {
        setErrors({ general: validation.errors })
        setIsValidating(false)
        return
      }

      setIsGenerating(true)
      setIsStreaming(true)
      markStepCompleted(9)

      // Start streaming report generation and submit lead in parallel
      const [streamResult] = await Promise.all([
        streamWizardReport(),
        submitLead(wizardData, formData, locale)
      ])

      if (streamResult) {
        // Store the generated report in wizard context
        updateReportData(streamResult)
        // Proceed to results step to display the report
        onNext()
      }

    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : t('wizard.steps.contact.errorGenerate')
      )
    } finally {
      setIsValidating(false)
      setIsGenerating(false)
      setIsStreaming(false)
    }
  }

  // Fix malformed markdown tables
  const fixMarkdownTables = (content: string): string => {
    // Fix tables where all rows are on one line like: | Category | Amount | |----------|--------| | Item | Value |
    return content.replace(
      /(\|[^|\n]+\|)(\s*\|[-\s|]+\|)(\s*(\|[^|\n]+\|)+)/g,
      (match, header, separator, rows) => {
        // Split rows by | and reconstruct with proper newlines
        const rowsArray = rows.trim().split(/\s*\|\s*(?=[^|]*\|)/).filter(row => row.trim());
        const formattedRows = rowsArray.map(row => row.trim().startsWith('|') ? row : `| ${row}`).join('\n');
        return `${header}\n${separator}\n${formattedRows}`;
      }
    );
  };

  // Stream wizard report from our new streaming API
  const streamWizardReport = async (): Promise<ReportData | null> => {
    try {
      const response = await fetch('/api/wizard-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wizardData,
          contactInfo: formData,
          locale
        })
      })

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let structuredData: ReportData | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case 'start':
                  setStreamingStatus(data.message)
                  break

                case 'chunk':
                  accumulatedContent = fixMarkdownTables(data.accumulated)
                  setStreamingContent(accumulatedContent)
                  setStreamingStatus(`Processing... (${data.chunkNumber} chunks)`)
                  break

                case 'complete':
                  setStreamingStatus(t('wizard.steps.contact.streaming.success'))
                  structuredData = {
                    id: data.structured.id,
                    userId: data.structured.userId,
                    language: data.structured.language,
                    estimatedPrice: data.structured.estimatedPrice,
                    maxAffordable: data.structured.maxAffordable,
                    monthlyPayment: data.structured.monthlyPayment,
                    programFit: data.structured.programFit,
                    actionPlan: data.structured.actionPlan,
                    tips: data.structured.tips,
                    primaryLeadType: data.structured.primaryLeadType,
                    reportContent: fixMarkdownTables(data.structured.reportContent),
                    aiGenerated: data.structured.aiGenerated
                  }
                  break

                case 'error':
                  throw new Error(data.error)
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }

      return structuredData
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    }
  }

  const isFormValid = formData.firstName.trim() && formData.lastName.trim() &&
                     formData.email.trim() && formData.phone.trim()

  return (
    <div className="space-y-6">

      {/* Error Display */}
      {errors.general && (
        <EnhancedErrorBox
          errors={errors.general}
          variant="form"
          className="mb-2"
        />
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📞</span>
            {t('wizard.steps.contact.sectionTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.steps.contact.fields.firstName')} *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 touch-manipulation text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.steps.contact.fields.lastName')} *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 touch-manipulation text-base"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('wizard.steps.contact.fields.email')} *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              {t('wizard.steps.contact.fields.phone')} *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={t('wizard.steps.contact.phonePlaceholder')}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-yellow-400">📞</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {t('wizard.steps.contact.consent.title')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {t('wizard.steps.contact.consent.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming Progress Display */}
        {isStreaming && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-blue-400">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  {t('wizard.steps.contact.streaming.title')}
                </h3>
                {streamingStatus && (
                  <p className="mt-1 text-sm text-blue-600">{streamingStatus}</p>
                )}
                {streamingContent && (
                  <div className="mt-3 max-h-32 overflow-y-auto">
                    <div className="text-xs text-blue-700 bg-blue-100 rounded p-2 font-mono">
                      {streamingContent.slice(-200)}...
                    </div>
                    <p className="text-xs text-blue-500 mt-1">
                      {t('wizard.steps.contact.streaming.charactersGenerated').replace('{{count}}', streamingContent.length.toString())}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submission Error */}
        {submissionError && (
          <EnhancedErrorBox
            errors={[submissionError]}
            variant="critical"
            title={t('wizard.steps.contact.submissionFailed')}
            dismissible
            onDismiss={() => setSubmissionError(null)}
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={!isFormValid || isValidating || isGenerating || isStreaming}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center"
          >
            {isGenerating || isStreaming ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isStreaming
                  ? t('wizard.steps.contact.streaming.aiGenerating')
                  : t('wizard.steps.contact.streaming.generatingPlan')}
              </>
            ) : isValidating ? (
              t('wizard.shared.validating')
            ) : (
              <>
                🎯 {t('wizard.steps.contact.generatePlan')}
              </>
            )}
          </button>
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          🔒 {t('wizard.steps.contact.privacyNote')}
        </div>
      </form>
    </div>
  )
}
