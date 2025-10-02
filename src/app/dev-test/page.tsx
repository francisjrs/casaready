'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function DevTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [scenario, setScenario] = useState('first-time-buyer')
  const [locale, setLocale] = useState('en')

  const runTest = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch(`/api/test-report?scenario=${scenario}&locale=${locale}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Test failed:', error)
      setResults({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 AI Report Dev Test Tool</h1>
          <p className="text-gray-600 mb-6">Test multi-model report generation with performance metrics</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Scenario</label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="first-time-buyer">First-Time Buyer ($85k, $350k budget)</option>
                <option value="high-income">High Income ($200k, $550k budget)</option>
                <option value="tight-budget">Tight Budget ($65k, $280k budget)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={runTest}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ Generating...' : '🚀 Run Test'}
              </button>
            </div>
          </div>

          {results && results.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total Time</div>
                  <div className="text-2xl font-bold text-green-700">{results.performance.totalTime}</div>
                </div>
                <div>
                  <div className="text-gray-600">Financial (Pro)</div>
                  <div className="text-lg font-semibold text-blue-700">{results.performance.financialTime}</div>
                </div>
                <div>
                  <div className="text-gray-600">Loans (Flash)</div>
                  <div className="text-lg font-semibold text-purple-700">{results.performance.loanOptionsTime}</div>
                </div>
                <div>
                  <div className="text-gray-600">Location (Flash)</div>
                  <div className="text-lg font-semibold text-purple-700">{results.performance.locationTime}</div>
                </div>
              </div>
            </div>
          )}

          {results && !results.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Test Failed</h3>
              <pre className="text-sm text-red-700">{results.error}</pre>
            </div>
          )}
        </div>

        {results && results.success && (
          <>
            {/* Financial Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">💰 Financial Analysis</h2>
                <div className="flex gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    Model: {results.performance.models.financial}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.financial.time}ms
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.financial.length} chars
                  </span>
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results.sections.financial.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Loan Options Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">🏦 Loan Options</h2>
                <div className="flex gap-4 text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    Model: {results.performance.models.loanOptions}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.loanOptions.time}ms
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.loanOptions.length} chars
                  </span>
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results.sections.loanOptions.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">📍 Location & Market</h2>
                <div className="flex gap-4 text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    Model: {results.performance.models.location}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.location.time}ms
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                    {results.sections.location.length} chars
                  </span>
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results.sections.location.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Raw Data */}
            <details className="bg-gray-100 rounded-lg p-6">
              <summary className="cursor-pointer font-semibold text-gray-700">📊 View Raw Test Data</summary>
              <pre className="mt-4 text-xs bg-white p-4 rounded overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
