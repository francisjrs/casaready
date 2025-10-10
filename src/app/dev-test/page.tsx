'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkSmartypants from 'remark-smartypants'
import remarkEmoji from 'remark-emoji'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'

export default function DevTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [scenario, setScenario] = useState('first-time-buyer')
  const [locale, setLocale] = useState('en')
  const [showTestData, setShowTestData] = useState(false)

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

  const scenarioDetails = {
    'first-time-buyer': {
      name: 'First-Time Buyer',
      income: '$85,000',
      budget: '$350,000',
      city: 'Round Rock',
      credit: '740-799',
      down: '3%',
      employment: 'W2',
      tags: ['first-time', 'good-credit', 'W2'],
      color: 'blue'
    },
    'itin-jarrell': {
      name: 'ITIN Buyer (Jarrell)',
      income: '$72,000',
      budget: '$320,000',
      city: 'Jarrell',
      credit: '680-739',
      down: '10%',
      employment: 'ITIN',
      tags: ['ITIN', 'first-time', 'jarrell'],
      color: 'emerald'
    },
    '1099-contractor': {
      name: '1099 Self-Employed',
      income: '$110,000',
      budget: '$400,000',
      city: 'Round Rock',
      credit: '720-779',
      down: '15%',
      employment: '1099',
      tags: ['self-employed', '1099', 'contractor'],
      color: 'amber'
    },
    'investor-kyle': {
      name: 'Investor (Kyle)',
      income: '$180,000',
      budget: '$480,000',
      city: 'Kyle',
      credit: '780-800+',
      down: '20%',
      employment: 'Investor',
      tags: ['investor', 'kyle', 'rental-property'],
      color: 'purple'
    },
    'high-income': {
      name: 'High Income Buyer',
      income: '$200,000',
      budget: '$550,000',
      city: 'Austin',
      credit: '800+',
      down: '10%',
      employment: 'W2',
      tags: ['high-income', 'excellent-credit', 'W2'],
      color: 'indigo'
    },
    'tight-budget': {
      name: 'Tight Budget Family',
      income: '$65,000',
      budget: '$280,000',
      city: 'Hutto',
      credit: '620-679',
      down: '3%',
      employment: 'W2',
      tags: ['first-time', 'family-of-4', 'tight-budget'],
      color: 'green'
    }
  }

  const currentScenario = scenarioDetails[scenario as keyof typeof scenarioDetails]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <span className="text-3xl">🧪</span>
                AI Report Dev Test
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Production-parity testing • Real-time AI generation • Full report preview
              </p>
            </div>
            <a
              href="/wizard"
              className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg"
            >
              → Live Wizard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Control Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Scenario Selection */}
            <div className="lg:col-span-8">
              <label className="block text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Select Test Scenario
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(scenarioDetails).map(([key, details]) => {
                  const isSelected = scenario === key
                  const borderColor = isSelected
                    ? details.color === 'blue' ? 'border-blue-500 bg-blue-50'
                    : details.color === 'emerald' ? 'border-emerald-500 bg-emerald-50'
                    : details.color === 'amber' ? 'border-amber-500 bg-amber-50'
                    : details.color === 'purple' ? 'border-purple-500 bg-purple-50'
                    : details.color === 'indigo' ? 'border-indigo-500 bg-indigo-50'
                    : 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'

                  return (
                    <button
                      key={key}
                      onClick={() => setScenario(key)}
                      className={`relative p-4 rounded-lg border-2 transition-all text-left ${borderColor}`}
                    >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{details.name}</h3>
                      {scenario === key && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Income:</span>
                        <span className="font-medium text-gray-900">{details.income}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium text-gray-900">{details.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium text-gray-900">{details.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {details.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Language & Action */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div>
                <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🌐</span> Language
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇲🇽 Español</option>
                </select>
              </div>

              <button
                onClick={() => setShowTestData(!showTestData)}
                className="w-full text-sm text-gray-700 hover:text-gray-900 font-semibold py-3 border-2 border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all"
              >
                {showTestData ? '▼ Hide' : '▶'} Test Data Preview
              </button>

              <button
                onClick={runTest}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Report...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 Generate AI Report
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Test Data Preview */}
          {showTestData && (
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Test Data Preview (Production Parity)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-semibold mb-1">🏠 Target Home Price</div>
                  <div className="font-bold text-blue-900 text-lg">{currentScenario.budget}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="text-green-600 font-semibold mb-1">💵 Annual Income</div>
                  <div className="font-bold text-green-900 text-lg">{currentScenario.income}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                  <div className="text-purple-600 font-semibold mb-1">💳 Monthly Debts</div>
                  <div className="font-bold text-purple-900 text-lg">
                    {scenario === 'first-time-buyer' ? '$400'
                      : scenario === 'itin-jarrell' ? '$350'
                      : scenario === '1099-contractor' ? '$800'
                      : scenario === 'investor-kyle' ? '$1,200'
                      : scenario === 'high-income' ? '$1,000'
                      : '$600'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                  <div className="text-orange-600 font-semibold mb-1">📊 Credit Score</div>
                  <div className="font-bold text-orange-900 text-lg">{currentScenario.credit}</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-3 rounded-lg border border-teal-200">
                  <div className="text-teal-600 font-semibold mb-1">💰 Down Payment</div>
                  <div className="font-bold text-teal-900 text-lg">{currentScenario.down} ({
                    scenario === 'first-time-buyer' ? '$10.5k'
                      : scenario === 'itin-jarrell' ? '$32k'
                      : scenario === '1099-contractor' ? '$60k'
                      : scenario === 'investor-kyle' ? '$96k'
                      : scenario === 'high-income' ? '$55k'
                      : '$8.4k'
                  })</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200">
                  <div className="text-indigo-600 font-semibold mb-1">💼 Employment</div>
                  <div className="font-bold text-indigo-900 text-lg">{currentScenario.employment}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg border border-pink-200">
                  <div className="text-pink-600 font-semibold mb-1">👥 Buyer Profile</div>
                  <div className="font-bold text-pink-900 text-sm">
                    {scenario === 'first-time-buyer' ? 'First-Time'
                      : scenario === 'itin-jarrell' ? 'ITIN/First-Time'
                      : scenario === '1099-contractor' ? 'Self-Employed'
                      : scenario === 'investor-kyle' ? 'Investor'
                      : scenario === 'high-income' ? 'High-Income'
                      : 'First-Time'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                  <div className="text-amber-600 font-semibold mb-1">🏡 Household Size</div>
                  <div className="font-bold text-amber-900 text-lg">
                    {scenario === 'first-time-buyer' ? '2 people'
                      : scenario === 'itin-jarrell' ? '3 people'
                      : scenario === '1099-contractor' ? '2 people'
                      : scenario === 'investor-kyle' ? '1 person'
                      : scenario === 'high-income' ? '1 person'
                      : '4 people'}
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-xs flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">📍 Location:</span>
                  <span className="text-gray-900">{currentScenario.city}, TX</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-semibold">🎯 Timeline:</span>
                  <span className="text-gray-900">
                    {scenario === 'first-time-buyer' ? '3-6 months'
                      : scenario === 'itin-jarrell' ? '6-12 months'
                      : scenario === '1099-contractor' ? '3-6 months'
                      : scenario === 'investor-kyle' ? '0-3 months'
                      : scenario === 'high-income' ? '0-3 months'
                      : '6-12 months'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-semibold">📄 Tax Status:</span>
                  <span className="text-gray-900">{currentScenario.employment}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && results.success && (
          <>
            {/* Performance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Metrics */}
              <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Generation Time</span>
                    <span className="text-2xl font-bold text-green-600">{results.performance.totalTime}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-gray-600 mb-1">Financial</div>
                      <div className="font-bold text-blue-700">{results.performance.financialTime}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-gray-600 mb-1">Loans</div>
                      <div className="font-bold text-purple-700">{results.performance.loanOptionsTime}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-gray-600 mb-1">Location</div>
                      <div className="font-bold text-green-700">{results.performance.locationTime}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="text-xl">⚙️</span> Configuration (from .env)
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Generation Mode:</span>
                    {results.performance.parallelMode ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-xs">
                        ⚡ Parallel (60% faster)
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium text-xs">
                        ⏭️ Sequential
                      </span>
                    )}
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-600 mb-2">Models Used:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-blue-50 px-2 py-1.5 rounded text-center">
                        <div className="text-gray-500">Financial</div>
                        <div className="font-medium text-blue-700">
                          {results.performance.models?.financial?.replace('gemini-', '') || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-purple-50 px-2 py-1.5 rounded text-center">
                        <div className="text-gray-500">Loans</div>
                        <div className="font-medium text-purple-700">
                          {results.performance.models?.loanOptions?.replace('gemini-', '') || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-green-50 px-2 py-1.5 rounded text-center">
                        <div className="text-gray-500">Location</div>
                        <div className="font-medium text-green-700">
                          {results.performance.models?.location?.replace('gemini-', '') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-600 mb-2">Real-time Data (Grounding):</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${results.performance.grounding?.location ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        Location: {results.performance.grounding?.location ? '✓ ON' : '✗ OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color-Coded Section Cards with Enhanced UX */}
            <div className="space-y-6">
              {/* Financial Analysis Section */}
              <div className="bg-white rounded-2xl shadow-2xl border border-blue-100/50 overflow-hidden hover:shadow-blue-200/50 transition-shadow">
                {/* Section Header - Always Visible */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                        💰
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Financial Analysis</h3>
                        <p className="text-blue-50 text-sm font-medium mt-1">Buying power & affordability breakdown</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                        {results.performance.financialTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content with Better Spacing */}
                <div className="p-8">
                  <div className="prose prose-lg prose-blue max-w-none
                    prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-6
                    prose-h2:text-3xl prose-h2:bg-gradient-to-r prose-h2:from-blue-900 prose-h2:to-blue-700 prose-h2:bg-clip-text prose-h2:text-transparent
                    prose-h3:text-xl prose-h3:text-blue-900 prose-h3:border-l-4 prose-h3:border-blue-500 prose-h3:pl-4 prose-h3:py-2 prose-h3:bg-gradient-to-r prose-h3:from-blue-50/50 prose-h3:to-transparent prose-h3:rounded-r-lg
                    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-lg
                    prose-strong:font-extrabold prose-strong:bg-gradient-to-r prose-strong:from-blue-700 prose-strong:to-purple-700 prose-strong:bg-clip-text prose-strong:text-transparent
                    prose-ul:my-6 prose-ul:space-y-3
                    prose-li:text-gray-800 prose-li:text-lg prose-li:leading-relaxed prose-li:pl-2 prose-li:relative before:prose-li:content-['→'] before:prose-li:absolute before:prose-li:-left-6 before:prose-li:text-blue-500 before:prose-li:font-bold
                    prose-table:my-8 prose-table:rounded-2xl prose-table:shadow-xl prose-table:overflow-hidden prose-table:border prose-table:border-blue-200
                    prose-thead:bg-gradient-to-r prose-thead:from-blue-600 prose-thead:to-blue-700
                    prose-th:text-white prose-th:font-bold prose-th:px-6 prose-th:py-5 prose-th:text-base prose-th:uppercase prose-th:tracking-wider
                    prose-td:px-6 prose-td:py-5 prose-td:text-gray-800 prose-td:font-medium prose-td:border-r prose-td:border-blue-100 last:prose-td:border-r-0
                    prose-tr:hover:bg-blue-50/50 prose-tr:transition-all
                    prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks, remarkSmartypants, remarkEmoji]}
                      rehypePlugins={[
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
                      ]}
                    >
                      {results.sections.financial.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Loan Options Section */}
              <div className="bg-white rounded-2xl shadow-2xl border border-purple-100/50 overflow-hidden hover:shadow-purple-200/50 transition-shadow">
                <div className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                        🏦
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Loan Options</h3>
                        <p className="text-purple-50 text-sm font-medium mt-1">Best mortgage programs & rates</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                        {results.performance.loanOptionsTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="prose prose-lg prose-purple max-w-none
                    prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-6
                    prose-h2:text-3xl prose-h2:bg-gradient-to-r prose-h2:from-purple-900 prose-h2:to-purple-700 prose-h2:bg-clip-text prose-h2:text-transparent
                    prose-h3:text-xl prose-h3:text-purple-900 prose-h3:border-l-4 prose-h3:border-purple-500 prose-h3:pl-4 prose-h3:py-2 prose-h3:bg-gradient-to-r prose-h3:from-purple-50/50 prose-h3:to-transparent prose-h3:rounded-r-lg
                    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-lg
                    prose-strong:font-extrabold prose-strong:bg-gradient-to-r prose-strong:from-purple-700 prose-strong:to-indigo-700 prose-strong:bg-clip-text prose-strong:text-transparent
                    prose-ul:my-6 prose-ul:space-y-3
                    prose-li:text-gray-800 prose-li:text-lg prose-li:leading-relaxed prose-li:pl-2 prose-li:relative before:prose-li:content-['→'] before:prose-li:absolute before:prose-li:-left-6 before:prose-li:text-purple-500 before:prose-li:font-bold
                    prose-table:my-8 prose-table:rounded-2xl prose-table:shadow-xl prose-table:overflow-hidden prose-table:border prose-table:border-purple-200
                    prose-thead:bg-gradient-to-r prose-thead:from-purple-600 prose-thead:to-purple-700
                    prose-th:text-white prose-th:font-bold prose-th:px-6 prose-th:py-5 prose-th:text-base prose-th:uppercase prose-th:tracking-wider
                    prose-td:px-6 prose-td:py-5 prose-td:text-gray-800 prose-td:font-medium prose-td:border-r prose-td:border-purple-100 last:prose-td:border-r-0
                    prose-tr:hover:bg-purple-50/50 prose-tr:transition-all
                    prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks, remarkSmartypants, remarkEmoji]}
                      rehypePlugins={[
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
                      ]}
                    >
                      {results.sections.loanOptions.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Location & Market Section */}
              <div className="bg-white rounded-2xl shadow-2xl border border-green-100/50 overflow-hidden hover:shadow-green-200/50 transition-shadow">
                <div className="bg-gradient-to-r from-green-600 via-green-600 to-green-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                        📍
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Location & Market</h3>
                        <p className="text-green-50 text-sm font-medium mt-1">Perfect neighborhoods & insights</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                        {results.performance.locationTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="prose prose-lg prose-green max-w-none
                    prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-6
                    prose-h2:text-3xl prose-h2:bg-gradient-to-r prose-h2:from-green-900 prose-h2:to-green-700 prose-h2:bg-clip-text prose-h2:text-transparent
                    prose-h3:text-xl prose-h3:text-green-900 prose-h3:border-l-4 prose-h3:border-green-500 prose-h3:pl-4 prose-h3:py-2 prose-h3:bg-gradient-to-r prose-h3:from-green-50/50 prose-h3:to-transparent prose-h3:rounded-r-lg
                    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-lg
                    prose-strong:font-extrabold prose-strong:bg-gradient-to-r prose-strong:from-green-700 prose-strong:to-emerald-700 prose-strong:bg-clip-text prose-strong:text-transparent
                    prose-ul:my-6 prose-ul:space-y-3
                    prose-li:text-gray-800 prose-li:text-lg prose-li:leading-relaxed prose-li:pl-2 prose-li:relative before:prose-li:content-['→'] before:prose-li:absolute before:prose-li:-left-6 before:prose-li:text-green-500 before:prose-li:font-bold
                    prose-table:my-8 prose-table:rounded-2xl prose-table:shadow-xl prose-table:overflow-hidden prose-table:border prose-table:border-green-200
                    prose-thead:bg-gradient-to-r prose-thead:from-green-600 prose-thead:to-green-700
                    prose-th:text-white prose-th:font-bold prose-th:px-6 prose-th:py-5 prose-th:text-base prose-th:uppercase prose-th:tracking-wider
                    prose-td:px-6 prose-td:py-5 prose-td:text-gray-800 prose-td:font-medium prose-td:border-r prose-td:border-green-100 last:prose-td:border-r-0
                    prose-tr:hover:bg-green-50/50 prose-tr:transition-all
                    prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:py-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks, remarkSmartypants, remarkEmoji]}
                      rehypePlugins={[
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
                      ]}
                    >
                      {results.sections.location.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Down Payment Assistance Section */}
              {results.sections.grants && (
                <div className="bg-white rounded-2xl shadow-2xl border border-amber-100/50 overflow-hidden hover:shadow-amber-200/50 transition-shadow">
                  <div className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                          💸
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tight">Down Payment Help</h3>
                          <p className="text-amber-50 text-sm font-medium mt-1">Available grants & programs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                          Static
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="prose prose-lg prose-amber max-w-none
                      prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-6
                      prose-h2:text-3xl prose-h2:bg-gradient-to-r prose-h2:from-amber-900 prose-h2:to-amber-700 prose-h2:bg-clip-text prose-h2:text-transparent
                      prose-h3:text-xl prose-h3:text-amber-900 prose-h3:border-l-4 prose-h3:border-amber-500 prose-h3:pl-4 prose-h3:py-2 prose-h3:bg-gradient-to-r prose-h3:from-amber-50/50 prose-h3:to-transparent prose-h3:rounded-r-lg
                      prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-p:text-lg
                      prose-strong:font-extrabold prose-strong:bg-gradient-to-r prose-strong:from-amber-700 prose-strong:to-yellow-700 prose-strong:bg-clip-text prose-strong:text-transparent
                      prose-ul:my-6 prose-ul:space-y-3
                      prose-li:text-gray-800 prose-li:text-lg prose-li:leading-relaxed prose-li:pl-2 prose-li:relative before:prose-li:content-['→'] before:prose-li:absolute before:prose-li:-left-6 before:prose-li:text-amber-500 before:prose-li:font-bold
                      prose-table:my-8 prose-table:rounded-2xl prose-table:shadow-xl prose-table:overflow-hidden prose-table:border prose-table:border-amber-200
                      prose-thead:bg-gradient-to-r prose-thead:from-amber-600 prose-thead:to-amber-700
                      prose-th:text-white prose-th:font-bold prose-th:px-6 prose-th:py-5 prose-th:text-base prose-th:uppercase prose-th:tracking-wider
                      prose-td:px-6 prose-td:py-5 prose-td:text-gray-800 prose-td:font-medium prose-td:border-r prose-td:border-amber-100 last:prose-td:border-r-0
                      prose-tr:hover:bg-amber-50/50 prose-tr:transition-all
                      prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:py-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks, remarkSmartypants, remarkEmoji]}
                        rehypePlugins={[
                          rehypeSlug,
                          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                          [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
                        ]}
                      >
                        {results.sections.grants.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Raw Data */}
            <details className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <summary className="cursor-pointer font-bold text-lg hover:text-white transition-colors flex items-center gap-2">
                <span>📊</span> View Raw JSON Response
              </summary>
              <pre className="mt-6 text-xs bg-black/50 p-6 rounded-xl overflow-x-auto border border-gray-700 font-mono">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </>
        )}

        {results && !results.success && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-8 shadow-xl">
            <h3 className="font-bold text-xl text-red-900 mb-4 flex items-center gap-3">
              <span className="text-2xl">❌</span> Test Failed
            </h3>
            <pre className="text-sm text-red-800 bg-red-200/50 p-6 rounded-xl mt-4 overflow-x-auto border border-red-300 font-mono">
              {results.error}
            </pre>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-200/50 p-16 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Generating AI Report...
                </h3>
                <p className="text-base text-gray-600 font-medium">
                  Using parallel generation • Takes 15-45 seconds
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
