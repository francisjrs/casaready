/**
 * Results Step Component
 *
 * Displays the generated home buying plan and comprehensive analysis
 */

'use client'

import { useState } from 'react'
import { useWizard, formatCurrency } from '@/lib/services'
import { useLanguage } from '@/contexts/language-context'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ResultsStepProps {
  // No longer need results prop since we get it from wizard context
}

// Helper function to fix malformed Markdown tables by removing extra newlines
function cleanMarkdownTables(content: string): string {
  // Build regex patterns dynamically to avoid Tailwind CSS scanner detecting them
  const pipe = '\\|'
  const notNewline = '[^\\n]+'
  const separator = '[\\-:\\s\\|]+'
  const multipleNewlines = '\\n\\n+'

  // Pattern: table row followed by multiple newlines followed by separator row
  const pattern1 = new RegExp(`(${pipe}${notNewline}${pipe})${multipleNewlines}(${pipe}${separator}${pipe})`, 'g')
  // Pattern: separator row followed by multiple newlines followed by data row
  const pattern2 = new RegExp(`(${pipe}${separator}${pipe})${multipleNewlines}(${pipe}${notNewline}${pipe})`, 'g')
  // Pattern: data row followed by multiple newlines followed by another data row
  const pattern3 = new RegExp(`(${pipe}${notNewline}${pipe})${multipleNewlines}(${pipe}${notNewline}${pipe})`, 'g')

  return content
    .replace(pattern1, '$1\n$2')
    .replace(pattern2, '$1\n$2')
    .replace(pattern3, '$1\n$2')
}

export function ResultsStep({}: ResultsStepProps) {
  const { t } = useLanguage()
  const { wizardData, contactInfo, locale, reportData } = useWizard()
  const [isEmailing, setIsEmailing] = useState(false)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)

  const handleEmailReport = async () => {
    if (!contactInfo.email) {
      setEmailStatus(t('wizard.steps.results.emailStatus.notFound'))
      return
    }

    setIsEmailing(true)
    setEmailStatus(null)

    try {
      const response = await fetch('/api/email-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: contactInfo.email,
          recipientName: `${contactInfo.firstName} ${contactInfo.lastName}`,
          reportContent: reportData?.reportContent || '',
          reportData,
          locale
        })
      })

      const result = await response.json()

      if (response.ok && result.mailtoLink) {
        // Open mailto link
        window.location.href = result.mailtoLink
        setEmailStatus(result.message)
      } else {
        setEmailStatus(result.error || t('wizard.steps.results.emailStatus.failedToPrepare'))
      }
    } catch (error) {
      setEmailStatus(t('wizard.steps.results.emailStatus.errorPreparing'))
    } finally {
      setIsEmailing(false)
    }
  }

  // If no report data, show loading or error state
  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 {t('wizard.steps.results.title')}
          </h2>
          <p className="text-gray-600">
            {t('wizard.steps.results.loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 {t('wizard.steps.results.title')}
        </h2>
        <p className="text-lg text-gray-600">
          {t('wizard.steps.results.subtitle')}
        </p>
      </div>

      {/* AI-Generated Report */}
      {reportData.reportContent && (
        <div className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({children}) => (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight flex items-start gap-3">
                      {children}
                    </h2>
                  </div>
                ),
                h3: ({children}) => <h3 className="text-base sm:text-lg font-semibold text-gray-800 mt-6 mb-3 leading-tight">{children}</h3>,
                p: ({children}) => <p className="mb-3 text-gray-700 text-base leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="mb-4 ml-5 sm:ml-6 list-disc text-gray-700 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-5 sm:ml-6 list-decimal text-gray-700 space-y-1">{children}</ol>,
                li: ({children}) => <li className="mb-1.5 text-gray-700 text-base leading-relaxed">{children}</li>,
                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                table: ({children}) => (
                  <div className="overflow-x-auto my-4 -mx-2 sm:mx-0">
                    <table className="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm text-sm sm:text-base">{children}</table>
                  </div>
                ),
                thead: ({children}) => <thead className="bg-gradient-to-r from-gray-100 to-gray-50">{children}</thead>,
                tbody: ({children}) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
                tr: ({children}) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
                th: ({children}) => <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-bold text-gray-900 bg-gray-100 border-b-2 border-gray-300 text-xs sm:text-sm uppercase tracking-wide">{children}</th>,
                td: ({children}) => <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 border-r border-gray-200 last:border-r-0 text-sm sm:text-base">{children}</td>,
              }}
            >
              {cleanMarkdownTables(reportData.reportContent)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Affordability Analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-2xl">💰</span>
          {t('wizard.steps.results.affordabilityAnalysis')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800 mb-1">
              {t('wizard.steps.results.recommendedPriceRange')}
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(reportData.estimatedPrice)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {t('wizard.steps.results.affordabilityDetails.basedOnIncome')}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-1">
              {t('wizard.steps.results.affordabilityDetails.maximumAffordable')}
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(reportData.maxAffordable)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {t('wizard.steps.results.affordabilityDetails.upperLimit')}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-800 mb-1">
              {t('wizard.steps.results.affordabilityDetails.estimatedMonthlyPayment')}
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(reportData.monthlyPayment)}
            </div>
            <div className="text-xs text-orange-600 mt-1">
              {t('wizard.steps.results.affordabilityDetails.piti')}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Programs */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-3 text-2xl">🏆</span>
          {t('wizard.steps.results.sections.loanPrograms')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportData.programFit.map((program, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-brand-100 text-brand-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </div>
                <div className="font-medium text-gray-900">{program}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-3 text-2xl">📋</span>
          {t('wizard.steps.results.sections.actionPlan')}
        </h3>

        <div className="space-y-3">
          {reportData.actionPlan.map((action, index) => (
            <div key={index} className="flex items-start">
              <div className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <div className="text-gray-700">{action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
          <span className="mr-3 text-2xl">💡</span>
          {t('wizard.steps.results.sections.expertTips')}
        </h3>

        <div className="space-y-3">
          {reportData.tips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <div className="text-yellow-800">{tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <span className="mr-3 text-xl">👤</span>
          {t('wizard.steps.results.sections.yourInformation')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800">{t('wizard.steps.results.contactFields.name')}</div>
            <div className="text-blue-700">{contactInfo.firstName} {contactInfo.lastName}</div>
          </div>
          <div>
            <div className="font-medium text-blue-800">{t('wizard.steps.results.contactFields.email')}</div>
            <div className="text-blue-700">{contactInfo.email}</div>
          </div>
          <div>
            <div className="font-medium text-blue-800">{t('wizard.steps.results.contactFields.phone')}</div>
            <div className="text-blue-700">{contactInfo.phone}</div>
          </div>
          <div>
            <div className="font-medium text-blue-800">{t('wizard.steps.results.contactFields.leadType')}</div>
            <div className="text-blue-700">{reportData.primaryLeadType}</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <span className="mr-3 text-2xl">🚀</span>
          {t('wizard.steps.results.sections.nextSteps')}
        </h3>

        <div className="space-y-4">
          <p className="text-green-700">
            {t('wizard.steps.results.nextStepsDescription')}
          </p>

          <div className="flex justify-center">
            <a
              href="tel:+15124122352"
              className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📱</span>
              {t('wizard.steps.results.actions.callSully')}
            </a>
          </div>
        </div>
      </div>

      {/* Thank You */}
      <div className="text-center p-6 bg-gray-50 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('wizard.steps.results.sections.thankYou')}
        </h3>
        <p className="text-gray-600">
          {t('wizard.steps.results.thankYouDescription')}
        </p>
      </div>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Information (Development Only)</h4>
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-700">View Report Data</summary>
            <pre className="mt-2 bg-white border border-gray-200 rounded p-2 overflow-x-auto text-xs">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </details>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-gray-700">View Wizard Data</summary>
            <pre className="mt-2 bg-white border border-gray-200 rounded p-2 overflow-x-auto text-xs">
              {JSON.stringify(wizardData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}