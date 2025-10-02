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
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [sectionProgress, setSectionProgress] = useState({ current: 0, total: 4 })

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
        console.log('✅ Report generated successfully:', {
          id: streamResult.id,
          language: streamResult.language,
          contentLength: streamResult.reportContent?.length || 0
        })
        // Store the generated report in wizard context
        updateReportData(streamResult)
        console.log('✅ Report stored in wizard context, navigating to results...')
        // Proceed to results step to display the report
        onNext()
      } else {
        console.error('❌ No report data received from stream')
        setSubmissionError(t('wizard.steps.contact.errorGenerate') + ' - No data received from AI')
      }

    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
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
    console.log('🚀 Starting report generation stream...')

    // Debug info for development
    const requestPayload = {
      wizardData,
      contactInfo: formData,
      locale
    }

    if (process.env.NODE_ENV === 'development') {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        endpoint: '/api/wizard-stream',
        method: 'POST',
        payload: requestPayload,
        status: 'Sending request...'
      })
    }

    try {
      const response = await fetch('/api/wizard-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      })

      console.log('📡 Stream response status:', response.status)

      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(prev => ({
          ...prev,
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          status: response.ok ? 'Response received' : 'Error response'
        }))
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Stream request failed:', errorText)
        throw new Error(`Stream request failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let structuredData: ReportData | null = null
      let chunkCount = 0

      console.log('📨 Starting to read stream chunks...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log(`✅ Stream reading completed. Total chunks: ${chunkCount}`)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case 'start':
                  console.log('🎬 Stream started:', data.message)
                  setStreamingStatus(data.message)
                  if (data.totalSections) {
                    setSectionProgress({ current: 0, total: data.totalSections })
                  }
                  break

                case 'section-start':
                  console.log(`📂 Section started: ${data.section} (${data.sectionNumber}/${data.totalSections})`)
                  setCurrentSection(data.section)
                  setSectionProgress({ current: data.sectionNumber, total: data.totalSections })
                  setStreamingStatus(`${data.title} (${data.sectionNumber}/${data.totalSections})`)
                  break

                case 'section-chunk':
                  chunkCount++
                  accumulatedContent += data.content
                  setStreamingContent(fixMarkdownTables(accumulatedContent))
                  if (chunkCount % 5 === 0) {
                    console.log(`📝 Section ${data.section}: ${chunkCount} chunks`)
                  }
                  break

                case 'section-complete':
                  console.log(`✅ Section complete: ${data.section}`)
                  break

                case 'chunk':
                  // Legacy support for old chunk format
                  chunkCount++
                  accumulatedContent = data.accumulated || (accumulatedContent + data.content)
                  setStreamingContent(fixMarkdownTables(accumulatedContent))
                  break

                case 'complete':
                  console.log('✅ Stream complete event received')
                  console.log('📊 Structured data:', {
                    id: data.structured.id,
                    language: data.structured.language,
                    contentLength: data.structured.reportContent?.length || 0
                  })
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
                  console.log('✅ Structured data created successfully')
                  break

                case 'error':
                  console.error('❌ Stream error event:', data.error)
                  throw new Error(data.error)
              }
            } catch (parseError) {
              console.error('❌ Failed to parse SSE data:', parseError, 'Line:', line)
            }
          }
        }
      }

      if (!structuredData) {
        console.error('❌ Stream completed but no structured data was created')
      }

      return structuredData
    } catch (error) {
      console.error('❌ Streaming error:', error)

      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(prev => ({
          ...prev,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            type: error?.constructor?.name || 'Unknown',
            stack: error instanceof Error ? error.stack : undefined
          },
          status: 'Error occurred'
        }))
      }

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
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full min-h-[44px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 touch-manipulation text-base"
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
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full min-h-[44px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 touch-manipulation text-base"
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
              name="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent touch-manipulation text-base"
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
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={t('wizard.steps.contact.phonePlaceholder')}
              className="w-full min-h-[44px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent touch-manipulation text-base"
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
            <div className="flex items-start">
              <div className="text-blue-400 mt-0.5">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  {t('wizard.steps.contact.streaming.title')}
                </h3>

                {/* Time Estimate */}
                <p className="mt-1 text-xs text-blue-700 flex items-center">
                  <span className="mr-1">⏱️</span>
                  {t('wizard.steps.contact.streaming.timeEstimate')}
                </p>

                {/* Section Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600">
                      Section {sectionProgress.current} of {sectionProgress.total}
                    </span>
                    <span className="text-xs text-blue-600">
                      {Math.round((sectionProgress.current / sectionProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(sectionProgress.current / sectionProgress.total) * 100}%` }}
                    />
                  </div>
                </div>

                {streamingStatus && (
                  <p className="mt-2 text-sm text-blue-700 font-medium">{streamingStatus}</p>
                )}

                {streamingContent && (
                  <div className="mt-3">
                    <p className="text-xs text-blue-600 mb-1">
                      {streamingContent.length} characters generated
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

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-6 bg-gray-900 text-gray-100 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-yellow-400 flex items-center">
                <span className="mr-2">🐛</span>
                Debug Information (Dev Only)
              </h4>
              <button
                type="button"
                onClick={() => setDebugInfo(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-800"
              >
                ✕ Close
              </button>
            </div>
            <details className="text-xs" open>
              <summary className="cursor-pointer text-gray-300 font-semibold mb-2 hover:text-white">
                View Debug Details
              </summary>
              <div className="bg-gray-950 rounded p-3 overflow-x-auto">
                <pre className="text-xs leading-relaxed">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </details>
            <div className="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
              <span className="font-semibold">⚠️ Security:</span> This debug panel only appears in development mode and will not be visible in production.
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
