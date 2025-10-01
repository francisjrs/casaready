'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PlanGenerationInput } from '@/validators/planning-schemas'

interface TestScenario {
  name: string
  data: PlanGenerationInput
}

const testScenarios: TestScenario[] = [
  {
    name: "First-Time Buyer - English (Complete Wizard Profile)",
    data: {
      userProfile: {
        contact: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          dateOfBirth: "1992-06-15",
          maritalStatus: "single"
        },
        incomeDebt: {
          annualIncome: 85000,
          monthlyDebts: 450,
          downPaymentAmount: 25000,
          creditScore: "670-739",
          additionalIncome: 5000,
          assets: 35000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Software Developer",
          employerName: "Tech Corp",
          yearsAtJob: 3,
          employerPhone: "(555) 999-0001",
          workAddress: "123 Tech Street, Austin, TX 78701"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78701",
          maxBudget: 400000,
          minBedrooms: 2,
          minBathrooms: 2,
          homeType: "single-family",
          timeframe: "3-6",
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: "en",
        riskTolerance: "moderate",
        focusAreas: ["schools", "commute", "safety"],
        excludePrograms: []
      }
    }
  },
  {
    name: "Familia Joven - Español (Perfil Completo del Asistente)",
    data: {
      userProfile: {
        contact: {
          firstName: "María",
          lastName: "González",
          email: "maria.gonzalez@email.com",
          phone: "(555) 987-6543",
          dateOfBirth: "1988-03-20",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 65000,
          monthlyDebts: 800,
          downPaymentAmount: 15000,
          creditScore: "580-669",
          additionalIncome: 2000,
          assets: 20000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Teacher",
          employerName: "Austin ISD",
          yearsAtJob: 5,
          employerPhone: "(555) 999-0002",
          workAddress: "456 Education Blvd, Austin, TX 78704"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78704",
          maxBudget: 300000,
          minBedrooms: 3,
          minBathrooms: 2,
          homeType: "townhouse",
          timeframe: "6-12",
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: "es",
        riskTolerance: "low",
        focusAreas: ["price", "schools", "neighborhood"],
        excludePrograms: []
      }
    }
  },
  {
    name: "High Income Professional - English (Full Wizard Data)",
    data: {
      userProfile: {
        contact: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@email.com",
          phone: "(555) 456-7890",
          dateOfBirth: "1985-11-12",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 150000,
          monthlyDebts: 2000,
          downPaymentAmount: 80000,
          creditScore: "800-850",
          additionalIncome: 15000,
          assets: 120000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Marketing Director",
          employerName: "Fortune 500 Co",
          yearsAtJob: 7,
          employerPhone: "(555) 999-0003",
          workAddress: "789 Corporate Plaza, Austin, TX 78759"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78759",
          maxBudget: 650000,
          minBedrooms: 4,
          minBathrooms: 3,
          homeType: "single-family",
          timeframe: "0-3",
          firstTimeBuyer: false
        }
      },
      preferences: {
        language: "en",
        riskTolerance: "high",
        focusAreas: ["amenities", "size", "neighborhood"],
        excludePrograms: ["fha", "usda"]
      }
    }
  },
  {
    name: "Military Veteran - English (VA Loan Profile)",
    data: {
      userProfile: {
        contact: {
          firstName: "Michael",
          lastName: "Davis",
          email: "michael.davis@email.com",
          phone: "(555) 678-1234",
          dateOfBirth: "1987-04-22",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 95000,
          monthlyDebts: 600,
          downPaymentAmount: 0,
          creditScore: "670-739",
          additionalIncome: 8000,
          assets: 45000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Project Manager",
          employerName: "Defense Contractor Inc",
          yearsAtJob: 6,
          employerPhone: "(555) 999-0005",
          workAddress: "567 Military Base Rd, Austin, TX 78731"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78731",
          maxBudget: 380000,
          minBedrooms: 3,
          minBathrooms: 2,
          homeType: "single-family",
          timeframe: "3-6",
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: "en",
        riskTolerance: "low",
        focusAreas: ["safety", "schools", "commute"],
        excludePrograms: ["fha"]
      }
    }
  },
  {
    name: "Trabajador Independiente - Español (Perfil de Negocio Propio)",
    data: {
      userProfile: {
        contact: {
          firstName: "Carlos",
          lastName: "Rodriguez",
          email: "carlos.rodriguez@email.com",
          phone: "(555) 321-9876",
          dateOfBirth: "1980-09-08",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 120000,
          monthlyDebts: 1500,
          downPaymentAmount: 100000,
          creditScore: "740-799",
          additionalIncome: 25000,
          assets: 150000
        },
        employment: {
          employmentStatus: "self-employed",
          jobTitle: "Business Owner",
          employerName: "Rodriguez Construction LLC",
          yearsAtJob: 12,
          employerPhone: "(555) 999-0004",
          workAddress: "321 Industrial Way, Austin, TX 78745"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78745",
          maxBudget: 450000,
          minBedrooms: 3,
          minBathrooms: 2,
          homeType: "single-family",
          timeframe: "6-12",
          firstTimeBuyer: false
        }
      },
      preferences: {
        language: "es",
        riskTolerance: "high",
        focusAreas: ["price", "size", "commute"],
        excludePrograms: ["fha"]
      }
    }
  },
  {
    name: "Retired Couple - English (Fixed Income Profile)",
    data: {
      userProfile: {
        contact: {
          firstName: "Eleanor",
          lastName: "Johnson",
          email: "eleanor.johnson@email.com",
          phone: "(555) 876-5432",
          dateOfBirth: "1958-12-10",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 48000,
          monthlyDebts: 200,
          downPaymentAmount: 60000,
          creditScore: "740-799",
          additionalIncome: 12000,
          assets: 180000
        },
        employment: {
          employmentStatus: "retired",
          jobTitle: "Retired Teacher",
          employerName: "Social Security Administration",
          yearsAtJob: 0,
          employerPhone: "(555) 999-0006",
          workAddress: "Retirement Benefits, Austin, TX 78702"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78702",
          maxBudget: 250000,
          minBedrooms: 2,
          minBathrooms: 2,
          homeType: "townhouse",
          timeframe: "6-12",
          firstTimeBuyer: false
        }
      },
      preferences: {
        language: "en",
        riskTolerance: "low",
        focusAreas: ["price", "amenities", "safety"],
        excludePrograms: []
      }
    }
  },
  {
    name: "ITIN Taxpayer - Español (Perfil Sin SSN)",
    data: {
      userProfile: {
        contact: {
          firstName: "Rosa",
          lastName: "Hernández",
          email: "rosa.hernandez@email.com",
          phone: "(555) 234-5678",
          dateOfBirth: "1985-07-15",
          maritalStatus: "married"
        },
        incomeDebt: {
          annualIncome: 72000,
          monthlyDebts: 650,
          downPaymentAmount: 18000,
          creditScore: "580-669",
          additionalIncome: 6000,
          assets: 25000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Restaurant Manager",
          employerName: "Local Restaurant Group",
          yearsAtJob: 4,
          employerPhone: "(555) 999-0007",
          workAddress: "890 Commerce St, Austin, TX 78704"
        },
        location: {
          preferredCity: "Austin",
          preferredState: "TX",
          preferredZipCode: "78704",
          maxBudget: 320000,
          minBedrooms: 3,
          minBathrooms: 2,
          homeType: "single-family",
          timeframe: "6-12",
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: "es",
        riskTolerance: "moderate",
        focusAreas: ["price", "schools", "neighborhood"],
        excludePrograms: ["va"]
      }
    }
  },
  {
    name: "USDA Rural Buyer - English (Zero Down Payment)",
    data: {
      userProfile: {
        contact: {
          firstName: "Jennifer",
          lastName: "Miller",
          email: "jennifer.miller@email.com",
          phone: "(555) 345-6789",
          dateOfBirth: "1990-03-28",
          maritalStatus: "single"
        },
        incomeDebt: {
          annualIncome: 58000,
          monthlyDebts: 400,
          downPaymentAmount: 0,
          creditScore: "670-739",
          additionalIncome: 3000,
          assets: 12000
        },
        employment: {
          employmentStatus: "w2",
          jobTitle: "Nurse",
          employerName: "Rural Health Center",
          yearsAtJob: 3,
          employerPhone: "(555) 999-0008",
          workAddress: "456 Country Road, Cedar Creek, TX 78612"
        },
        location: {
          preferredCity: "Cedar Creek",
          preferredState: "TX",
          preferredZipCode: "78612",
          maxBudget: 275000,
          minBedrooms: 2,
          minBathrooms: 2,
          homeType: "single-family",
          timeframe: "3-6",
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: "en",
        riskTolerance: "low",
        focusAreas: ["price", "size", "safety"],
        excludePrograms: ["va"]
      }
    }
  }
]

export default function DemoPage() {
  // Redirect to home in production
  if (process.env.NODE_ENV === 'production') {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(testScenarios[0]!)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [results, setResults] = useState<{
    structured?: any
    markdown?: string
    error?: string
    isStreaming?: boolean
  }>({})

  // Manual testing form state
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualTestData, setManualTestData] = useState<PlanGenerationInput>({
    userProfile: {
      contact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        maritalStatus: 'single'
      },
      incomeDebt: {
        annualIncome: 50000,
        monthlyDebts: 500,
        downPaymentAmount: 10000,
        creditScore: '670-739',
        additionalIncome: 0,
        assets: 15000
      },
      employment: {
        employmentStatus: 'w2',
        jobTitle: '',
        employerName: '',
        yearsAtJob: 1,
        employerPhone: '',
        workAddress: ''
      },
      location: {
        preferredCity: '',
        preferredState: '',
        preferredZipCode: '',
        maxBudget: 300000,
        minBedrooms: 2,
        minBathrooms: 2,
        homeType: 'single-family',
        timeframe: '3-6',
        firstTimeBuyer: true
      }
    },
    preferences: {
      language: 'en',
      riskTolerance: 'moderate',
      focusAreas: [],
      excludePrograms: [],
      buyerSpecialization: {
        isITINTaxpayer: false,
        isMilitaryVeteran: false,
        isUSDAEligible: false,
        isFirstTimeBuyer: false,
        isInvestor: false,
        needsAccessibilityFeatures: false
      }
    }
  })

  // AI Configuration state
  const [aiConfig, setAiConfig] = useState({
    useGrounding: true,
    useStructuredOutput: true,
    thinkingBudget: -1,
    temperature: 0.2
  })

  const testGeminiIntegration = async () => {
    setLoading(true)
    setResults({})

    try {
      console.log('🚀 Starting Gemini test with scenario:', selectedScenario.name)

      // Call the server-side API route
      const response = await fetch('/api/demo-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: selectedScenario.data
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      setResults({
        structured: result.structured,
        markdown: result.markdown
      })

      console.log('✅ Test completed successfully!')

    } catch (error) {
      console.error('❌ Test failed:', error)
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testStreamingIntegration = async () => {
    setStreaming(true)
    setStreamingContent('')
    setResults({})

    try {
      console.log('🚀 Starting streaming Gemini test with scenario:', selectedScenario.name)

      // Create EventSource for server-sent events
      const eventSource = new EventSource('/api/demo-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: selectedScenario.data
        })
      })

      // Alternative approach using fetch with streaming
      const response = await fetch('/api/demo-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: selectedScenario.data
        })
      })

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedMarkdown = ''

      setResults({ isStreaming: true })

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('✅ Streaming completed')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'start') {
                console.log('📡 Streaming started:', data.message)
              } else if (data.type === 'chunk') {
                accumulatedMarkdown = data.accumulated
                setStreamingContent(accumulatedMarkdown)
                console.log(`📨 Received chunk ${data.chunkNumber}`)
              } else if (data.type === 'complete') {
                console.log('✅ Streaming complete, received structured data')
                setResults({
                  structured: data.structured,
                  markdown: data.fullMarkdown,
                  isStreaming: false
                })
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError)
            }
          }
        }
      }

      console.log('✅ Streaming test completed successfully!')

    } catch (error) {
      console.error('❌ Streaming test failed:', error)
      setResults({
        error: error instanceof Error ? error.message : 'Unknown streaming error'
      })
    } finally {
      setStreaming(false)
    }
  }

  const testManualScenario = async (useStreaming = false) => {
    if (useStreaming) {
      // Test manual scenario with streaming
      setStreaming(true)
      setStreamingContent('')
      setResults({})

      try {
        console.log('🚀 Starting manual streaming test with custom scenario')

        const response = await fetch('/api/demo-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scenario: manualTestData,
            aiConfig: aiConfig
          })
        })

        if (!response.body) {
          throw new Error('No response body for manual streaming test')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedMarkdown = ''

        setResults({ isStreaming: true })

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log('✅ Manual streaming completed')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'start') {
                  console.log('📡 Manual streaming started:', data.message)
                } else if (data.type === 'chunk') {
                  accumulatedMarkdown = data.accumulated
                  setStreamingContent(accumulatedMarkdown)
                  console.log(`📨 Manual received chunk ${data.chunkNumber}`)
                } else if (data.type === 'complete') {
                  console.log('✅ Manual streaming complete')
                  setResults({
                    structured: data.structured,
                    markdown: data.fullMarkdown,
                    isStreaming: false
                  })
                } else if (data.type === 'error') {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.warn('Failed to parse manual SSE data:', parseError)
              }
            }
          }
        }

      } catch (error) {
        console.error('❌ Manual streaming test failed:', error)
        setResults({
          error: error instanceof Error ? error.message : 'Unknown manual streaming error'
        })
      } finally {
        setStreaming(false)
      }
    } else {
      // Test manual scenario without streaming
      setLoading(true)
      setResults({})

      try {
        console.log('🚀 Starting manual regular test with custom scenario')

        const response = await fetch('/api/demo-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scenario: manualTestData,
            aiConfig: aiConfig
          })
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Manual API request failed')
        }

        setResults({
          structured: result.structured,
          markdown: result.markdown
        })

        console.log('✅ Manual test completed successfully!')

      } catch (error) {
        console.error('❌ Manual test failed:', error)
        setResults({
          error: error instanceof Error ? error.message : 'Unknown manual error'
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const updateManualField = (path: string[], value: any) => {
    setManualTestData(prev => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  const resetManualForm = () => {
    setManualTestData({
      userProfile: {
        contact: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          maritalStatus: 'single'
        },
        incomeDebt: {
          annualIncome: 50000,
          monthlyDebts: 500,
          downPaymentAmount: 10000,
          creditScore: '670-739',
          additionalIncome: 0,
          assets: 15000
        },
        employment: {
          employmentStatus: 'w2',
          jobTitle: '',
          employerName: '',
          yearsAtJob: 1,
          employerPhone: '',
          workAddress: ''
        },
        location: {
          preferredCity: '',
          preferredState: '',
          preferredZipCode: '',
          maxBudget: 300000,
          minBedrooms: 2,
          minBathrooms: 2,
          homeType: 'single-family',
          timeframe: '3-6',
          firstTimeBuyer: true
        }
      },
      preferences: {
        language: 'en',
        riskTolerance: 'moderate',
        focusAreas: [],
        excludePrograms: [],
        buyerSpecialization: {
          isITINTaxpayer: false,
          isMilitaryVeteran: false,
          isUSDAEligible: false,
          isFirstTimeBuyer: false,
          isInvestor: false,
          needsAccessibilityFeatures: false
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            🧪 Gemini AI Integration Demo
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Test the updated Gemini AI integration with gemini-2.5-flash model.
            Select a test scenario and see both structured JSON output and formatted markdown analysis.
          </p>
        </div>

        {/* Scenario Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedScenario.name === scenario.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-black">{scenario.name}</div>
                <div className="text-sm text-black mt-1">
                  Income: ${scenario.data.userProfile.incomeDebt.annualIncome.toLocaleString()}/yr
                </div>
                <div className="text-sm text-black">
                  Budget: ${scenario.data.userProfile.location.maxBudget.toLocaleString()}
                </div>
                <div className="text-sm text-black">
                  Language: {scenario.data.preferences.language === 'en' ? 'English' : 'Español'}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Scenario Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-black mb-2">Selected: {selectedScenario.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-black">
              <div>
                <span className="font-medium">Name:</span> {selectedScenario.data.userProfile.contact.firstName} {selectedScenario.data.userProfile.contact.lastName}
              </div>
              <div>
                <span className="font-medium">Job:</span> {selectedScenario.data.userProfile.employment.jobTitle}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedScenario.data.userProfile.location.preferredCity}, {selectedScenario.data.userProfile.location.preferredState}
              </div>
              <div>
                <span className="font-medium">Timeline:</span> {selectedScenario.data.userProfile.location.timeframe}
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testGeminiIntegration}
              disabled={loading || streaming}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Testing Integration...
                </div>
              ) : (
                '🚀 Test Regular (38-46s)'
              )}
            </button>

            <button
              onClick={testStreamingIntegration}
              disabled={loading || streaming}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {streaming ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Streaming Live...
                </div>
              ) : (
                '⚡ Test Streaming (Real-time)'
              )}
            </button>
          </div>
        </div>

        {/* Streaming Content Display */}
        {streaming && streamingContent && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
              <span className="mr-3 text-2xl">⚡</span>
              Live Streaming Content
              <div className="ml-3 w-3 h-3 bg-black rounded-full animate-pulse"></div>
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="prose prose-sm max-w-none">
                <div className="bg-white rounded-lg p-4 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({children}) => <h2 className="text-lg font-semibold text-black mt-4 mb-2 first:mt-0">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-medium text-black mt-3 mb-2">{children}</h3>,
                      p: ({children}) => <p className="mb-3 text-black">{children}</p>,
                      ul: ({children}) => <ul className="mb-3 ml-4 list-disc text-black">{children}</ul>,
                      ol: ({children}) => <ol className="mb-3 ml-4 list-decimal text-black">{children}</ol>,
                      li: ({children}) => <li className="mb-1 text-black">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                      table: ({children}) => <table className="w-full border-collapse border border-gray-200 my-4 bg-white rounded-lg overflow-hidden">{children}</table>,
                      thead: ({children}) => <thead className="bg-gray-100">{children}</thead>,
                      tbody: ({children}) => <tbody>{children}</tbody>,
                      tr: ({children}) => <tr className="border-b border-gray-200 last:border-b-0">{children}</tr>,
                      th: ({children}) => <th className="px-4 py-3 text-left font-semibold text-black bg-gray-100">{children}</th>,
                      td: ({children}) => <td className="px-4 py-3 text-black border-r border-gray-200 last:border-r-0">{children}</td>,
                    }}
                  >
                    {streamingContent}
                  </ReactMarkdown>
                  {streaming && (
                    <div className="mt-4 flex items-center text-black">
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce mr-2"></div>
                      <span className="text-sm font-medium">AI is generating content...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {(Object.keys(results).length > 0 || results.isStreaming) && (
          <div className="space-y-8">
            {/* Error Display */}
            {results.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-black mb-2 flex items-center">
                  <span className="mr-2">❌</span>
                  Error
                </h3>
                <pre className="text-sm text-black bg-red-100 rounded p-3 overflow-x-auto">
                  {results.error}
                </pre>
              </div>
            )}

            {/* Markdown Analysis Display */}
            {results.markdown && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
                  <span className="mr-3 text-2xl">📝</span>
                  Markdown Analysis (Formatted)
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-white rounded-lg p-4 text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({children}) => <h2 className="text-lg font-semibold text-black mt-4 mb-2 first:mt-0">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-medium text-black mt-3 mb-2">{children}</h3>,
                          p: ({children}) => <p className="mb-3 text-black">{children}</p>,
                          ul: ({children}) => <ul className="mb-3 ml-4 list-disc text-black">{children}</ul>,
                          ol: ({children}) => <ol className="mb-3 ml-4 list-decimal text-black">{children}</ol>,
                          li: ({children}) => <li className="mb-1 text-black">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                          table: ({children}) => <table className="w-full border-collapse border border-gray-200 my-4 bg-white rounded-lg overflow-hidden">{children}</table>,
                          thead: ({children}) => <thead className="bg-gray-100">{children}</thead>,
                          tbody: ({children}) => <tbody>{children}</tbody>,
                          tr: ({children}) => <tr className="border-b border-gray-200 last:border-b-0">{children}</tr>,
                          th: ({children}) => <th className="px-4 py-3 text-left font-semibold text-black bg-gray-100">{children}</th>,
                          td: ({children}) => <td className="px-4 py-3 text-black border-r border-gray-200 last:border-r-0">{children}</td>,
                        }}
                      >
                        {results.markdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Markdown Display */}
            {results.markdown && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
                  <span className="mr-3 text-2xl">📄</span>
                  Raw Markdown Output
                </h3>
                <pre className="text-sm text-black bg-gray-100 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                  {results.markdown}
                </pre>
              </div>
            )}

            {/* Structured Data Display */}
            {results.structured && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
                  <span className="mr-3 text-2xl">📊</span>
                  Structured JSON Output
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-black font-mono">
                    {JSON.stringify(results.structured, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Testing Form */}
        <div className="mt-12 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-black">🛠️ Manual Testing Form</h3>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showManualForm ? 'Hide Form' : 'Show Manual Testing Form'}
            </button>
          </div>

          <p className="text-black mb-4">
            Create custom scenarios to test all enhanced features: ITIN taxpayers, USDA rural buyers, military veterans, and advanced AI configurations.
          </p>

          {showManualForm && (
            <div className="space-y-8">
              {/* AI Configuration Section */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">🤖 AI Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiConfig.useGrounding}
                      onChange={(e) => setAiConfig(prev => ({...prev, useGrounding: e.target.checked}))}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">Google Search Grounding</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiConfig.useStructuredOutput}
                      onChange={(e) => setAiConfig(prev => ({...prev, useStructuredOutput: e.target.checked}))}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">Structured Output</span>
                  </label>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Thinking Budget</label>
                    <select
                      value={aiConfig.thinkingBudget}
                      onChange={(e) => setAiConfig(prev => ({...prev, thinkingBudget: parseInt(e.target.value) || -1}))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                    >
                      <option value={-1}>Dynamic</option>
                      <option value={0}>Disabled</option>
                      <option value={1000}>Limited (1000)</option>
                      <option value={5000}>Standard (5000)</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Temperature</label>
                    <input
                      type="number"
                      value={aiConfig.temperature}
                      onChange={(e) => setAiConfig(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                      min="0"
                      max="1"
                      step="0.1"
                      className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">👤 Contact Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={manualTestData.userProfile.contact.firstName}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'firstName'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={manualTestData.userProfile.contact.lastName}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'lastName'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={manualTestData.userProfile.contact.email}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'email'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={manualTestData.userProfile.contact.phone}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'phone'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={manualTestData.userProfile.contact.dateOfBirth}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'dateOfBirth'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <select
                    value={manualTestData.userProfile.contact.maritalStatus}
                    onChange={(e) => updateManualField(['userProfile', 'contact', 'maritalStatus'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">💰 Financial Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Annual Income</label>
                    <input
                      type="number"
                      placeholder="Annual Income"
                      value={manualTestData.userProfile.incomeDebt.annualIncome || ''}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'annualIncome'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Monthly Debts</label>
                    <input
                      type="number"
                      placeholder="Monthly Debts"
                      value={manualTestData.userProfile.incomeDebt.monthlyDebts || ''}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'monthlyDebts'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Down Payment Amount</label>
                    <input
                      type="number"
                      placeholder="Down Payment"
                      value={manualTestData.userProfile.incomeDebt.downPaymentAmount || ''}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'downPaymentAmount'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Credit Score Range</label>
                    <select
                      value={manualTestData.userProfile.incomeDebt.creditScore}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'creditScore'], e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    >
                      <option value="300-579">Poor (300-579)</option>
                      <option value="580-669">Fair (580-669)</option>
                      <option value="670-739">Good (670-739)</option>
                      <option value="740-799">Very Good (740-799)</option>
                      <option value="800-850">Excellent (800-850)</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Additional Income</label>
                    <input
                      type="number"
                      placeholder="Additional Income"
                      value={manualTestData.userProfile.incomeDebt.additionalIncome || ''}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'additionalIncome'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Total Assets</label>
                    <input
                      type="number"
                      placeholder="Assets"
                      value={manualTestData.userProfile.incomeDebt.assets || ''}
                      onChange={(e) => updateManualField(['userProfile', 'incomeDebt', 'assets'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">💼 Employment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Employment Status</label>
                    <select
                      value={manualTestData.userProfile.employment.employmentStatus}
                      onChange={(e) => updateManualField(['userProfile', 'employment', 'employmentStatus'], e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    >
                      <option value="w2">W-2 Employee</option>
                      <option value="1099">1099 Contractor</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Years at Job</label>
                    <input
                      type="number"
                      placeholder="Years at Job"
                      value={manualTestData.userProfile.employment.yearsAtJob || ''}
                      onChange={(e) => updateManualField(['userProfile', 'employment', 'yearsAtJob'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={manualTestData.userProfile.employment.jobTitle}
                    onChange={(e) => updateManualField(['userProfile', 'employment', 'jobTitle'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Employer Name"
                    value={manualTestData.userProfile.employment.employerName}
                    onChange={(e) => updateManualField(['userProfile', 'employment', 'employerName'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Employer Phone"
                    value={manualTestData.userProfile.employment.employerPhone}
                    onChange={(e) => updateManualField(['userProfile', 'employment', 'employerPhone'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Work Address"
                    value={manualTestData.userProfile.employment.workAddress}
                    onChange={(e) => updateManualField(['userProfile', 'employment', 'workAddress'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                </div>
              </div>

              {/* Location & Property Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">🏠 Location & Property Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Preferred City"
                    value={manualTestData.userProfile.location.preferredCity}
                    onChange={(e) => updateManualField(['userProfile', 'location', 'preferredCity'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Preferred State"
                    value={manualTestData.userProfile.location.preferredState}
                    onChange={(e) => updateManualField(['userProfile', 'location', 'preferredState'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Preferred Zip Code"
                    value={manualTestData.userProfile.location.preferredZipCode}
                    onChange={(e) => updateManualField(['userProfile', 'location', 'preferredZipCode'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  />
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Max Budget</label>
                    <input
                      type="number"
                      placeholder="Max Budget"
                      value={manualTestData.userProfile.location.maxBudget || ''}
                      onChange={(e) => updateManualField(['userProfile', 'location', 'maxBudget'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Min Bedrooms</label>
                    <input
                      type="number"
                      value={manualTestData.userProfile.location.minBedrooms || ''}
                      onChange={(e) => updateManualField(['userProfile', 'location', 'minBedrooms'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Min Bathrooms</label>
                    <input
                      type="number"
                      value={manualTestData.userProfile.location.minBathrooms || ''}
                      onChange={(e) => updateManualField(['userProfile', 'location', 'minBathrooms'], parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <select
                    value={manualTestData.userProfile.location.homeType}
                    onChange={(e) => updateManualField(['userProfile', 'location', 'homeType'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condo</option>
                    <option value="duplex">Duplex</option>
                  </select>
                  <select
                    value={manualTestData.userProfile.location.timeframe}
                    onChange={(e) => updateManualField(['userProfile', 'location', 'timeframe'], e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    <option value="0-3">Immediate (0-3 months)</option>
                    <option value="3-6">3-6 months</option>
                    <option value="6-12">6-12 months</option>
                    <option value="12+">12+ months</option>
                  </select>
                  <label className="flex items-center col-span-1">
                    <input
                      type="checkbox"
                      checked={manualTestData.userProfile.location.firstTimeBuyer}
                      onChange={(e) => updateManualField(['userProfile', 'location', 'firstTimeBuyer'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">First-Time Buyer</span>
                  </label>
                </div>
              </div>

              {/* Buyer Specializations */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">🎯 Buyer Specializations (Enhanced Features)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.isITINTaxpayer || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'isITINTaxpayer'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">🆔 ITIN Taxpayer</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.isMilitaryVeteran || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'isMilitaryVeteran'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">🎖️ Military/Veteran</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.isUSDAEligible || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'isUSDAEligible'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">🌾 USDA Eligible</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.isFirstTimeBuyer || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'isFirstTimeBuyer'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">🏠 First-Time Buyer</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.isInvestor || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'isInvestor'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">💼 Investor</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={manualTestData.preferences.buyerSpecialization?.needsAccessibilityFeatures || false}
                      onChange={(e) => updateManualField(['preferences', 'buyerSpecialization', 'needsAccessibilityFeatures'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">♿ Accessibility Needs</span>
                  </label>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-black mb-4">⚙️ Preferences & Settings</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Language</label>
                    <select
                      value={manualTestData.preferences.language}
                      onChange={(e) => updateManualField(['preferences', 'language'], e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-black mb-1">Risk Tolerance</label>
                    <select
                      value={manualTestData.preferences.riskTolerance || 'moderate'}
                      onChange={(e) => updateManualField(['preferences', 'riskTolerance'], e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={resetManualForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset Form
                </button>

                <div className="space-x-4">
                  <button
                    onClick={() => testManualScenario(false)}
                    disabled={loading || streaming}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Testing Manual...
                      </div>
                    ) : (
                      '🧪 Test Manual Scenario'
                    )}
                  </button>

                  <button
                    onClick={() => testManualScenario(true)}
                    disabled={loading || streaming}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {streaming ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Streaming Manual...
                      </div>
                    ) : (
                      '⚡ Test Manual Streaming'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Information */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black mb-2">🤖 Enhanced AI System Information</h3>
          <div className="text-sm text-black space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-black mb-1">Core Technology:</p>
                <p><strong>Package:</strong> @google/genai v1.20.0</p>
                <p><strong>Model:</strong> gemini-2.5-flash</p>
                <p><strong>API Features:</strong> Google Search Grounding, Structured Output Schema, Safety Settings</p>
              </div>
              <div>
                <p className="font-semibold text-black mb-1">Enhanced Capabilities:</p>
                <p><strong>🔍 Real-Time Data:</strong> Live mortgage rates, local programs, market trends</p>
                <p><strong>📊 Structured Output:</strong> JSON schema validation with responseMimeType</p>
                <p><strong>🛡️ Safety Settings:</strong> Content filtering for harassment, hate speech, dangerous content</p>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-semibold text-black mb-1">Specialized Buyer Support:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <span className="bg-blue-100 px-2 py-1 rounded text-black">🆔 ITIN Taxpayers</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-black">🎖️ Military/Veterans</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-black">🌾 USDA Rural</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-black">🏠 First-Time Buyers</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-black">💼 Self-Employed</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-black">⚪ Retired/Fixed Income</span>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-semibold text-black mb-1">Performance & Reliability:</p>
              <p><strong>Regular Performance:</strong> Complete response (~38-46 seconds)</p>
              <p><strong>Streaming Performance:</strong> <span className="font-semibold text-black">Real-time chunks (first content ~2-5 seconds)</span></p>
              <p><strong>Error Handling:</strong> Enhanced streaming error recovery, null-safe fallbacks</p>
              <p><strong>Retry Logic:</strong> Exponential backoff with improved error detection</p>
              <p><strong>Thinking Mode:</strong> Dynamic/Limited/Disabled options for performance tuning</p>
            </div>

            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-semibold text-black mb-1">✅ Recent Enhancements:</p>
              <ul className="text-xs space-y-1 text-black">
                <li>• Fixed critical logging bug in response validation</li>
                <li>• Removed biased buyer detection, added explicit specialization flags</li>
                <li>• Integrated Google Search Grounding for real-time market data</li>
                <li>• Added structured output schema with responseMimeType</li>
                <li>• Enhanced streaming error handling with partial content recovery</li>
                <li>• Performance optimizations with thinking budget controls</li>
                <li>• Comprehensive manual testing form for all buyer types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}