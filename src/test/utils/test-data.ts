// Test data factories for consistent test data generation

export interface TestWizardData {
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredContactMethod: string
  }
  location: {
    city: string
    state: string
    zipCode: string
  }
  timeline: {
    timeframe: string
    isFlexible: boolean
    reason: string
  }
  budget: {
    annualIncome: number
    monthlyDebt: number
    downPayment: number
    hasPreapproval: boolean
    creditScore: string
  }
  preferences: {
    propertyTypes: string[]
    bedrooms: number
    bathrooms: number
    features: string[]
    dealBreakers: string[]
  }
  financing: {
    employmentType: string
    employmentLength: string
    isVeteran: boolean
    isFirstTimeBuyer: boolean
    assistancePrograms: string[]
  }
}

export interface TestCensusData {
  city: string
  state: string
  population: number
  medianAge: number
  medianHouseholdIncome: number
  medianHomeValue: number
  unemploymentRate: number
  bachelorsDegreeOrHigher: number
  ageDistribution: {
    under18: number
    age18to64: number
    age65plus: number
  }
  marketTrend: string
  costOfLiving: number
  recommendations: string[]
}

// Factory functions for creating test data
export const createTestWizardData = (overrides: Partial<TestWizardData> = {}): TestWizardData => {
  const baseData: TestWizardData = {
    contactInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      preferredContactMethod: 'email'
    },
    location: {
      city: 'Austin',
      state: 'TX',
      zipCode: '78759'
    },
    timeline: {
      timeframe: '6_months',
      isFlexible: true,
      reason: 'ready_to_buy'
    },
    budget: {
      annualIncome: 75000,
      monthlyDebt: 800,
      downPayment: 25000,
      hasPreapproval: false,
      creditScore: '700-749'
    },
    preferences: {
      propertyTypes: ['single_family'],
      bedrooms: 3,
      bathrooms: 2,
      features: ['garage', 'yard'],
      dealBreakers: ['hoa']
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: '2_plus_years',
      isVeteran: false,
      isFirstTimeBuyer: true,
      assistancePrograms: ['fha']
    }
  }

  return deepMerge(baseData, overrides)
}

// Specialized test data scenarios
export const testDataScenarios = {
  firstTimeBuyer: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 65000,
      monthlyDebt: 600,
      downPayment: 15000,
      hasPreapproval: false,
      creditScore: '650-699'
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: '1_2_years',
      isVeteran: false,
      isFirstTimeBuyer: true,
      assistancePrograms: ['fha', 'first_time_buyer']
    }
  }),

  veteran: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 80000,
      monthlyDebt: 1000,
      downPayment: 0,
      hasPreapproval: true,
      creditScore: '750-799'
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: '2_plus_years',
      isVeteran: true,
      isFirstTimeBuyer: false,
      assistancePrograms: ['va_loan']
    }
  }),

  selfEmployed: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 95000,
      monthlyDebt: 1200,
      downPayment: 50000,
      hasPreapproval: false,
      creditScore: '720-749'
    },
    financing: {
      employmentType: 'self_employed',
      employmentLength: '2_plus_years',
      isVeteran: false,
      isFirstTimeBuyer: false,
      assistancePrograms: ['conventional']
    }
  }),

  highIncome: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 150000,
      monthlyDebt: 2000,
      downPayment: 100000,
      hasPreapproval: true,
      creditScore: '800_plus'
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: '2_plus_years',
      isVeteran: false,
      isFirstTimeBuyer: false,
      assistancePrograms: ['conventional']
    },
    preferences: {
      propertyTypes: ['single_family', 'luxury'],
      bedrooms: 4,
      bathrooms: 3,
      features: ['pool', 'garage', 'high_end_finishes'],
      dealBreakers: []
    }
  }),

  lowIncome: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 35000,
      monthlyDebt: 400,
      downPayment: 5000,
      hasPreapproval: false,
      creditScore: '580-619'
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: 'less_than_1_year',
      isVeteran: false,
      isFirstTimeBuyer: true,
      assistancePrograms: ['fha', 'usda', 'down_payment_assistance']
    }
  }),

  rentingCurrently: (): TestWizardData => createTestWizardData({
    timeline: {
      timeframe: '3_months',
      isFlexible: false,
      reason: 'lease_ending'
    }
  }),

  investor: (): TestWizardData => createTestWizardData({
    budget: {
      annualIncome: 120000,
      monthlyDebt: 1500,
      downPayment: 80000,
      hasPreapproval: true,
      creditScore: '750-799'
    },
    financing: {
      employmentType: 'w2_employee',
      employmentLength: '2_plus_years',
      isVeteran: false,
      isFirstTimeBuyer: false,
      assistancePrograms: ['conventional']
    },
    preferences: {
      propertyTypes: ['multi_family', 'townhome'],
      bedrooms: 2,
      bathrooms: 2,
      features: ['rental_potential'],
      dealBreakers: ['high_maintenance']
    }
  })
}

// Census data factory
export const createTestCensusData = (overrides: Partial<TestCensusData> = {}): TestCensusData => {
  const baseData: TestCensusData = {
    city: 'Austin',
    state: 'TX',
    population: 964254,
    medianAge: 33.8,
    medianHouseholdIncome: 78691,
    medianHomeValue: 494178,
    unemploymentRate: 3.2,
    bachelorsDegreeOrHigher: 48.3,
    ageDistribution: {
      under18: 21.1,
      age18to64: 68.9,
      age65plus: 10.0
    },
    marketTrend: 'growing',
    costOfLiving: 105.3,
    recommendations: [
      'Strong job market makes this area attractive for long-term investment',
      'Consider newer developments in surrounding suburbs for better value'
    ]
  }

  return { ...baseData, ...overrides }
}

// Census data for different cities
export const censusByCity = {
  austin: createTestCensusData(),
  sanFrancisco: createTestCensusData({
    city: 'San Francisco',
    state: 'CA',
    population: 873965,
    medianAge: 38.5,
    medianHouseholdIncome: 119136,
    medianHomeValue: 1378300,
    unemploymentRate: 2.8,
    bachelorsDegreeOrHigher: 56.7,
    marketTrend: 'expensive',
    costOfLiving: 185.2,
    recommendations: [
      'Consider surrounding areas for better affordability',
      'High-income area with strong appreciation potential'
    ]
  }),
  miami: createTestCensusData({
    city: 'Miami',
    state: 'FL',
    population: 467963,
    medianAge: 40.2,
    medianHouseholdIncome: 42863,
    medianHomeValue: 372600,
    unemploymentRate: 4.1,
    bachelorsDegreeOrHigher: 31.8,
    marketTrend: 'seasonal',
    costOfLiving: 98.7,
    recommendations: [
      'Tourism-based economy with seasonal variations',
      'Consider flood insurance and hurricane preparedness'
    ]
  })
}

// Contact info variations
export const contactInfoVariations = {
  standard: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    preferredContactMethod: 'email'
  },
  spanish: {
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@ejemplo.com',
    phone: '(555) 987-6543',
    preferredContactMethod: 'phone'
  },
  professional: {
    firstName: 'Jennifer',
    lastName: 'Smith',
    email: 'j.smith@corporation.com',
    phone: '(555) 555-0123',
    preferredContactMethod: 'email'
  }
}

// Helper function for deep merging objects
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const value = source[key]
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        (result as any)[key] = deepMerge((target as any)[key] || {}, value)
      } else {
        (result as any)[key] = value
      }
    }
  }

  return result
}

// Validation test data
export const validationTestData = {
  validEmails: [
    'test@example.com',
    'user.name@domain.co.uk',
    'user+tag@example.org',
    'firstname.lastname@subdomain.example.com'
  ],
  invalidEmails: [
    'invalid.email',
    '@example.com',
    'test@',
    'test..test@example.com',
    'test@example',
    ''
  ],
  validPhones: [
    '(555) 123-4567',
    '555-123-4567',
    '5551234567',
    '+1 555 123 4567',
    '555.123.4567'
  ],
  invalidPhones: [
    '123',
    '555-12-3456',
    'not-a-phone',
    '555 123 456',
    '(555) 123-456'
  ],
  validZipCodes: [
    '78759',
    '90210',
    '10001',
    '94102',
    '60601'
  ],
  invalidZipCodes: [
    '1234',
    '123456',
    'abcde',
    '12-345',
    ''
  ]
}

// Helper function to convert TestWizardData to the format expected by AI service
export const convertTestDataForAIService = (testData: TestWizardData) => {
  // Extract flat WizardData properties from nested TestWizardData
  const wizardData = {
    city: testData.location.city,
    zipCode: testData.location.zipCode,
    timeline: testData.timeline.timeframe,
    annualIncome: testData.budget.annualIncome,
    monthlyDebts: testData.budget.monthlyDebt,
    creditScore: testData.budget.creditScore,
    downPaymentAmount: testData.budget.downPayment,
    employmentType: testData.financing.employmentType,
    // Convert financing flags to buyerType array
    buyerType: [
      ...(testData.financing.isFirstTimeBuyer ? ['first-time'] : []),
      ...(testData.financing.isVeteran ? ['veteran'] : []),
      ...(testData.preferences.propertyTypes?.includes('investment') ? ['investor'] : [])
    ] as string[]
  }

  // Extract ContactInfo
  const contactInfo = testData.contactInfo

  return { wizardData, contactInfo }
}