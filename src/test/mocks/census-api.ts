import { vi } from 'vitest'

// Mock census data for different cities
const mockCensusData = {
  'Austin, TX': {
    geocoding: {
      result: {
        addressMatches: [{
          coordinates: {
            x: -97.7431,
            y: 30.2672
          },
          addressComponents: {
            city: "Austin",
            state: "TX",
            county: "Travis County"
          },
          matchedAddress: "Austin, TX"
        }]
      }
    },
    demographics: {
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
      }
    }
  },
  'San Francisco, CA': {
    geocoding: {
      result: {
        addressMatches: [{
          coordinates: {
            x: -122.4194,
            y: 37.7749
          },
          addressComponents: {
            city: "San Francisco",
            state: "CA",
            county: "San Francisco County"
          },
          matchedAddress: "San Francisco, CA"
        }]
      }
    },
    demographics: {
      population: 873965,
      medianAge: 38.5,
      medianHouseholdIncome: 119136,
      medianHomeValue: 1378300,
      unemploymentRate: 2.8,
      bachelorsDegreeOrHigher: 56.7,
      ageDistribution: {
        under18: 13.4,
        age18to64: 74.8,
        age65plus: 11.8
      }
    }
  },
  'Miami, FL': {
    geocoding: {
      result: {
        addressMatches: [{
          coordinates: {
            x: -80.1918,
            y: 25.7617
          },
          addressComponents: {
            city: "Miami",
            state: "FL",
            county: "Miami-Dade County"
          },
          matchedAddress: "Miami, FL"
        }]
      }
    },
    demographics: {
      population: 467963,
      medianAge: 40.2,
      medianHouseholdIncome: 42863,
      medianHomeValue: 372600,
      unemploymentRate: 4.1,
      bachelorsDegreeOrHigher: 31.8,
      ageDistribution: {
        under18: 18.7,
        age18to64: 67.1,
        age65plus: 14.2
      }
    }
  }
}

// Mock state
let mockDelay = 300
let mockShouldFail = false
let mockFailureType: 'network' | 'not_found' | 'rate_limit' = 'network'

// Helper to get city key
const getCityKey = (city: string, state?: string): string => {
  if (state) {
    return `${city}, ${state}`
  }
  // Try to find matching city
  const keys = Object.keys(mockCensusData)
  const match = keys.find(key => key.toLowerCase().includes(city.toLowerCase()))
  return match || `${city}, Unknown`
}

// Mock fetch implementation for Census API
export const mockCensusFetch = vi.fn().mockImplementation(async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, mockDelay))

  if (mockShouldFail) {
    switch (mockFailureType) {
      case 'network':
        throw new Error('Network error')
      case 'rate_limit':
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: async () => ({ error: 'Rate limit exceeded' })
        }
      case 'not_found':
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ error: 'Location not found' })
        }
    }
  }

  // Parse URL to determine endpoint
  if (url.includes('geocoding')) {
    // Geocoding endpoint
    const city = extractCityFromGeocodingUrl(url)
    const cityKey = getCityKey(city)
    const data = mockCensusData[cityKey as keyof typeof mockCensusData]

    if (data) {
      return {
        ok: true,
        json: async () => data.geocoding
      }
    } else {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Location not found' })
      }
    }
  } else if (url.includes('acs/acs5')) {
    // Demographics endpoint
    const coordinates = extractCoordinatesFromUrl(url)
    const cityData = findCityByCoordinates(coordinates)

    if (cityData) {
      // Return demographics in Census API format
      return {
        ok: true,
        json: async () => [[
          cityData.demographics.population.toString(),
          cityData.demographics.medianAge.toString(),
          cityData.demographics.medianHouseholdIncome.toString(),
          cityData.demographics.medianHomeValue.toString(),
          Math.round((1 - cityData.demographics.unemploymentRate / 100) * cityData.demographics.population).toString(),
          Math.round((cityData.demographics.bachelorsDegreeOrHigher / 100) * cityData.demographics.population).toString(),
          Math.round((cityData.demographics.ageDistribution.under18 / 100) * cityData.demographics.population).toString(),
          Math.round((cityData.demographics.ageDistribution.age18to64 / 100) * cityData.demographics.population).toString(),
          Math.round((cityData.demographics.ageDistribution.age65plus / 100) * cityData.demographics.population).toString()
        ]]
      }
    } else {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'No data available for coordinates' })
      }
    }
  }

  return {
    ok: false,
    status: 400,
    json: async () => ({ error: 'Invalid endpoint' })
  }
})

// Helper functions
function extractCityFromGeocodingUrl(url: string): string {
  // Extract city from geocoding URL
  const match = url.match(/street=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : 'Unknown'
}

function extractCoordinatesFromUrl(url: string): { x: number, y: number } {
  // For mock purposes, return Austin coordinates as default
  return { x: -97.7431, y: 30.2672 }
}

function findCityByCoordinates(coords: { x: number, y: number }) {
  // Simple matching based on approximate coordinates
  const cities = Object.values(mockCensusData)
  return cities.find(city => {
    const cityCoords = city.geocoding.result.addressMatches[0].coordinates
    return Math.abs(cityCoords.x - coords.x) < 1 && Math.abs(cityCoords.y - coords.y) < 1
  }) || cities[0] // Default to first city
}

// Helper functions for test configuration
export const mockCensusHelpers = {
  // Set response delay
  setDelay: (delay: number) => {
    mockDelay = delay
  },

  // Enable/disable failures
  setShouldFail: (shouldFail: boolean, failureType: 'network' | 'not_found' | 'rate_limit' = 'network') => {
    mockShouldFail = shouldFail
    mockFailureType = failureType
  },

  // Reset to defaults
  reset: () => {
    mockDelay = 300
    mockShouldFail = false
    mockFailureType = 'network'
  },

  // Configure specific scenarios
  configureSuccess: () => {
    mockShouldFail = false
  },

  configureNetworkError: () => {
    mockShouldFail = true
    mockFailureType = 'network'
  },

  configureNotFound: () => {
    mockShouldFail = true
    mockFailureType = 'not_found'
  },

  configureRateLimit: () => {
    mockShouldFail = true
    mockFailureType = 'rate_limit'
  },

  // Add custom city data
  addCityData: (cityKey: string, data: any) => {
    (mockCensusData as any)[cityKey] = data
  },

  // Get available cities
  getAvailableCities: () => Object.keys(mockCensusData),

  // Get mock state
  getMockState: () => ({
    delay: mockDelay,
    shouldFail: mockShouldFail,
    failureType: mockFailureType
  })
}

// Export mock data for direct access in tests
export { mockCensusData }