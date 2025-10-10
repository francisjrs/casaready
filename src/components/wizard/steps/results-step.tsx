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
import remarkBreaks from 'remark-breaks'
import remarkSmartypants from 'remark-smartypants'
import remarkEmoji from 'remark-emoji'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import { AnimatedMetricCard } from '../animated-metric-card'
import { SocialProofStats } from '@/components/trust/trust-signals'

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

      {/* Social Proof Stats - Build credibility */}
      <SocialProofStats variant="grid" className="my-8" />

      {/* AI-Generated Report */}
      {reportData.reportContent && (
        <div className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks, remarkSmartypants, remarkEmoji]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
              ]}
              components={{
                h2: ({children}) => (
                  <div className="group bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight flex items-start gap-4 pl-4">
                      {children}
                    </h2>
                  </div>
                ),
                h3: ({children}) => (
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-4 leading-tight flex items-center gap-2 border-l-4 border-blue-500 pl-4 py-2 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg">
                    {children}
                  </h3>
                ),
                p: ({children}) => <p className="mb-4 text-gray-700 text-base sm:text-lg leading-relaxed tracking-wide">{children}</p>,
                ul: ({children}) => <ul className="mb-6 ml-6 sm:ml-8 space-y-3 text-gray-700">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-5 sm:ml-6 list-decimal text-gray-700 space-y-1">{children}</ol>,
                li: ({children}) => (
                  <li className="text-gray-700 text-base sm:text-lg leading-relaxed pl-2 relative before:content-['→'] before:absolute before:-left-6 before:text-blue-500 before:font-bold">
                    {children}
                  </li>
                ),
                strong: ({children}) => (
                  <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 px-1">
                    {children}
                  </strong>
                ),
                table: ({children}) => (
                  <div className="overflow-x-auto my-8 -mx-2 sm:mx-0 rounded-2xl shadow-lg border border-gray-200">
                    <table className="min-w-full border-collapse bg-white text-sm sm:text-base">{children}</table>
                  </div>
                ),
                thead: ({children}) => <thead className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700">{children}</thead>,
                tbody: ({children}) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
                tr: ({children}) => <tr className="hover:bg-blue-50/50 transition-all duration-200">{children}</tr>,
                th: ({children}) => <th className="px-4 sm:px-6 py-4 sm:py-5 text-left font-bold text-white text-sm sm:text-base uppercase tracking-wider">{children}</th>,
                td: ({children}) => <td className="px-4 sm:px-6 py-4 sm:py-5 text-gray-800 border-r border-gray-100 last:border-r-0 text-sm sm:text-base font-medium">{children}</td>,
              }}
            >
              {cleanMarkdownTables(reportData.reportContent)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Affordability Analysis - With Delight Animations */}
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white border-2 border-gray-200/80 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 animate-slide-in-left">
          <span className="text-3xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg animate-float">💰</span>
          {t('wizard.steps.results.affordabilityAnalysis')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedMetricCard
            value={formatCurrency(reportData.estimatedPrice)}
            label={t('wizard.steps.results.recommendedPriceRange')}
            description={t('wizard.steps.results.affordabilityDetails.basedOnIncome')}
            color="green"
            icon="🎯"
            delay={100}
          />

          <AnimatedMetricCard
            value={formatCurrency(reportData.maxAffordable)}
            label={t('wizard.steps.results.affordabilityDetails.maximumAffordable')}
            description={t('wizard.steps.results.affordabilityDetails.upperLimit')}
            color="blue"
            icon="🏠"
            delay={300}
          />

          <AnimatedMetricCard
            value={formatCurrency(reportData.monthlyPayment)}
            label={t('wizard.steps.results.affordabilityDetails.estimatedMonthlyPayment')}
            description={t('wizard.steps.results.affordabilityDetails.piti')}
            color="orange"
            icon="📅"
            delay={500}
          />
        </div>
      </div>

      {/* Recommended Programs */}
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-white border-2 border-purple-200/80 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span className="text-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">🏆</span>
          {t('wizard.steps.results.sections.loanPrograms')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reportData.programFit.map((program, index) => (
            <div key={index} className="group bg-gradient-to-r from-purple-50 to-indigo-50/50 border-2 border-purple-200 rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <div className="font-bold text-gray-900 text-base sm:text-lg">{program}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-blue-200/80 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span className="text-3xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl shadow-lg">📋</span>
          {t('wizard.steps.results.sections.actionPlan')}
        </h3>

        <div className="space-y-4">
          {reportData.actionPlan.map((action, index) => (
            <div key={index} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl hover:from-blue-100/50 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
              <div className="text-gray-800 font-medium text-base sm:text-lg leading-relaxed">{action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Tips */}
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50/50 to-yellow-50 border-2 border-yellow-300/80 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-bold text-yellow-900 mb-8 flex items-center gap-3">
          <span className="text-3xl bg-gradient-to-br from-yellow-500 to-amber-600 p-3 rounded-2xl shadow-lg">💡</span>
          {t('wizard.steps.results.sections.expertTips')}
        </h3>

        <div className="space-y-4">
          {reportData.tips.map((tip, index) => (
            <div key={index} className="group flex items-start gap-4 p-4 bg-white/60 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-yellow-200">
              <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform shadow-sm"></div>
              <div className="text-yellow-900 font-medium text-base sm:text-lg leading-relaxed">{tip}</div>
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