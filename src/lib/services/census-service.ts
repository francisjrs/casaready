/**
 * Census Service - Handles US Census API integration
 *
 * Provides demographic and geographic data for cities and zip codes
 * to enhance home buying recommendations and location insights.
 */

import type { Locale } from '@/lib/i18n'

// Census API Configuration
const CENSUS_API_KEY = '69bdd17182eeb3a7598093a0ecd3f2aa58a9aa9c'
const CENSUS_BASE_URL = 'https://api.census.gov/data'
const GEOCODING_BASE_URL = 'https://geocoding.geo.census.gov/geocoder'

// TypeScript interfaces for Census data
export interface CensusLocation {
  city: string
  state: string
  county: string
  zipCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface CensusDemographics {
  population: number
  medianHouseholdIncome: number
  medianHomeValue: number
  unemploymentRate: number
  educationLevel: {
    highSchool: number
    bachelors: number
    graduate: number
  }
  ageDistribution: {
    under18: number
    working: number
    senior: number
  }
}

export interface CensusAreaInsights {
  location: CensusLocation
  demographics: CensusDemographics
  economicIndicators: {
    jobGrowth: number
    costOfLiving: number
    marketTrend: 'growing' | 'stable' | 'declining'
  }
  recommendations: string[]
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: string
}

export interface CensusServiceResponse {
  success: boolean
  data?: CensusAreaInsights
  error?: string
  fallbackData?: Partial<CensusAreaInsights>
}

/**
 * Cache for Census API responses to reduce API calls and improve performance
 */
class CensusCache {
  private cache = new Map<string, { data: CensusAreaInsights; timestamp: number }>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  get(key: string): CensusAreaInsights | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key: string, data: CensusAreaInsights): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }
}

const censusCache = new CensusCache()

/**
 * Geocode a city/state combination to get coordinates and standardized location info
 */
async function geocodeLocation(city: string, state?: string): Promise<CensusLocation | null> {
  try {
    const query = state ? `${city}, ${state}` : city
    const params = new URLSearchParams({
      address: query
    })

    const response = await fetch(`/api/geocoding?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.result?.addressMatches?.length > 0) {
      const match = data.result.addressMatches[0]
      const { addressComponents, coordinates } = match

      return {
        city: addressComponents.city || city,
        state: addressComponents.state || state || '',
        county: addressComponents.county || '',
        coordinates: {
          lat: parseFloat(coordinates.y),
          lng: parseFloat(coordinates.x)
        }
      }
    }

    return null
  } catch (error) {
    console.warn('Geocoding failed:', error)
    return null
  }
}

/**
 * Fetch demographic data for a location using Census API
 */
async function fetchDemographics(location: CensusLocation): Promise<CensusDemographics | null> {
  try {
    // Use American Community Survey 5-Year Data (most comprehensive)
    const year = '2022'
    const dataset = 'acs/acs5'

    // Census variables for key demographic indicators
    const variables = [
      'B01003_001E', // Total Population
      'B19013_001E', // Median Household Income
      'B25077_001E', // Median Home Value
      'B23025_005E', // Unemployed
      'B23025_002E', // Labor Force
      'B15003_017E', // High School
      'B15003_022E', // Bachelor's Degree
      'B15003_023E', // Master's Degree
      'B01001_001E', // Total Population for age calc
      'B01001_003E', // Under 18
      'B01001_020E'  // 65 and over
    ].join(',')

    const url = `${CENSUS_BASE_URL}/${year}/${dataset}`
    const params = new URLSearchParams({
      get: `NAME,${variables}`,
      'for': `place:*`,
      'in': `state:*`,
      key: CENSUS_API_KEY
    })

    const response = await fetch(`${url}?${params}`)

    if (!response.ok) {
      throw new Error(`Census API failed: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.length > 1) {
      // Find matching city in the results
      const cityMatch = data.find((row: any[]) =>
        row[0] && row[0].toLowerCase().includes(location.city.toLowerCase())
      )

      if (cityMatch) {
        const [
          name, population, medianIncome, medianHomeValue,
          unemployed, laborForce, highSchool, bachelors, masters,
          totalPop, under18, over65
        ] = cityMatch

        const unemploymentRate = laborForce > 0 ? (unemployed / laborForce) * 100 : 0
        const workingAge = totalPop - under18 - over65

        return {
          population: parseInt(population) || 0,
          medianHouseholdIncome: parseInt(medianIncome) || 0,
          medianHomeValue: parseInt(medianHomeValue) || 0,
          unemploymentRate: parseFloat(unemploymentRate.toFixed(1)),
          educationLevel: {
            highSchool: parseInt(highSchool) || 0,
            bachelors: parseInt(bachelors) || 0,
            graduate: parseInt(masters) || 0
          },
          ageDistribution: {
            under18: parseInt(under18) || 0,
            working: workingAge || 0,
            senior: parseInt(over65) || 0
          }
        }
      }
    }

    return null
  } catch (error) {
    console.warn('Demographics fetch failed:', error)
    return null
  }
}

/**
 * Generate economic indicators and market trends based on demographic data
 */
function generateEconomicIndicators(demographics: CensusDemographics, location: CensusLocation) {
  // Simple heuristics for economic indicators
  const jobGrowth = demographics.unemploymentRate < 5 ? 3.2 :
                   demographics.unemploymentRate < 7 ? 1.8 : 0.5

  const costOfLiving = demographics.medianHomeValue > 500000 ? 120 :
                      demographics.medianHomeValue > 300000 ? 105 : 95

  const marketTrend = demographics.population > 50000 && demographics.medianHouseholdIncome > 60000
    ? 'growing' : demographics.population > 20000 ? 'stable' : 'declining'

  return {
    jobGrowth,
    costOfLiving,
    marketTrend: marketTrend as 'growing' | 'stable' | 'declining'
  }
}

/**
 * Generate home buying recommendations based on census data
 */
function generateRecommendations(
  demographics: CensusDemographics,
  location: CensusLocation,
  locale: Locale
): string[] {
  const recommendations: string[] = []

  if (locale === 'es') {
    if (demographics.medianHomeValue < 300000) {
      recommendations.push('Mercado inmobiliario accesible con buenas oportunidades de inversión')
    }
    if (demographics.unemploymentRate < 5) {
      recommendations.push('Mercado laboral sólido con buenas oportunidades de empleo')
    }
    if (demographics.educationLevel.bachelors > 10000) {
      recommendations.push('Comunidad educada con escuelas de calidad esperadas')
    }
    if (demographics.population > 50000) {
      recommendations.push('Área urbana con servicios y amenidades completas')
    }
    if (demographics.ageDistribution.working > demographics.ageDistribution.senior) {
      recommendations.push('Población joven y activa, ideal para familias')
    }
  } else {
    if (demographics.medianHomeValue < 300000) {
      recommendations.push('Affordable housing market with good investment opportunities')
    }
    if (demographics.unemploymentRate < 5) {
      recommendations.push('Strong job market with good employment opportunities')
    }
    if (demographics.educationLevel.bachelors > 10000) {
      recommendations.push('Educated community with quality schools expected')
    }
    if (demographics.population > 50000) {
      recommendations.push('Urban area with comprehensive services and amenities')
    }
    if (demographics.ageDistribution.working > demographics.ageDistribution.senior) {
      recommendations.push('Young, active population ideal for families')
    }
  }

  return recommendations
}

/**
 * Create fallback data when Census API is unavailable
 */
function createFallbackData(city: string, state?: string, locale: Locale = 'en'): Partial<CensusAreaInsights> {
  const defaultRecommendations = locale === 'es' ? [
    'Datos del censo no disponibles - considere investigar el área localmente',
    'Consulte con agentes inmobiliarios locales para obtener información del mercado',
    'Revise las estadísticas municipales y del condado directamente'
  ] : [
    'Census data unavailable - consider researching the area locally',
    'Consult with local real estate agents for market insights',
    'Check municipal and county statistics directly'
  ]

  return {
    location: {
      city: city,
      state: state || '',
      county: ''
    },
    recommendations: defaultRecommendations,
    dataQuality: 'low' as const,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Main function to get comprehensive area insights from Census data
 */
export async function getCensusAreaInsights(
  city: string,
  state?: string,
  locale: Locale = 'en'
): Promise<CensusServiceResponse> {
  if (!city.trim()) {
    return {
      success: false,
      error: 'City name is required',
      fallbackData: createFallbackData(city, state, locale)
    }
  }

  // Check cache first
  const cacheKey = `${city.toLowerCase()}-${state?.toLowerCase() || ''}`
  const cached = censusCache.get(cacheKey)
  if (cached) {
    return { success: true, data: cached }
  }

  try {
    // Step 1: Geocode the location
    const location = await geocodeLocation(city, state)
    if (!location) {
      return {
        success: false,
        error: 'Location not found',
        fallbackData: createFallbackData(city, state, locale)
      }
    }

    // Step 2: Fetch demographic data
    const demographics = await fetchDemographics(location)
    if (!demographics) {
      return {
        success: false,
        error: 'Demographics data not available',
        fallbackData: {
          location,
          ...createFallbackData(city, state, locale)
        }
      }
    }

    // Step 3: Generate insights
    const economicIndicators = generateEconomicIndicators(demographics, location)
    const recommendations = generateRecommendations(demographics, location, locale)

    const insights: CensusAreaInsights = {
      location,
      demographics,
      economicIndicators,
      recommendations,
      dataQuality: 'high',
      lastUpdated: new Date().toISOString()
    }

    // Cache the results
    censusCache.set(cacheKey, insights)

    return { success: true, data: insights }

  } catch (error) {
    console.error('Census service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackData: createFallbackData(city, state, locale)
    }
  }
}

/**
 * Get simplified city validation and basic info
 */
export async function validateCity(city: string, state?: string): Promise<{
  isValid: boolean
  standardizedName?: string
  state?: string
  county?: string
}> {
  try {
    const location = await geocodeLocation(city, state)
    if (location) {
      return {
        isValid: true,
        standardizedName: location.city,
        state: location.state,
        county: location.county
      }
    }
    return { isValid: false }
  } catch (error) {
    console.warn('City validation failed:', error)
    return { isValid: false }
  }
}

/**
 * Get area comparison data for multiple cities
 */
export async function compareAreas(
  cities: Array<{ city: string; state?: string }>,
  locale: Locale = 'en'
): Promise<CensusAreaInsights[]> {
  const results = await Promise.allSettled(
    cities.map(({ city, state }) => getCensusAreaInsights(city, state, locale))
  )

  return results
    .filter((result): result is PromiseFulfilledResult<CensusServiceResponse> =>
      result.status === 'fulfilled' && result.value.success
    )
    .map(result => result.value.data!)
}

/**
 * Utility functions for the Census service
 */
export const CensusUtils = {
  /**
   * Format population numbers for display
   */
  formatPopulation: (population: number): string => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K`
    }
    return population.toString()
  },

  /**
   * Format currency values
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  },

  /**
   * Get market trend color for UI
   */
  getTrendColor: (trend: string): string => {
    switch (trend) {
      case 'growing': return 'text-green-600'
      case 'stable': return 'text-blue-600'
      case 'declining': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  },

  /**
   * Get data quality badge
   */
  getDataQualityBadge: (quality: string): { text: string; color: string } => {
    switch (quality) {
      case 'high':
        return { text: 'Verified Data', color: 'bg-green-100 text-green-800' }
      case 'medium':
        return { text: 'Estimated Data', color: 'bg-yellow-100 text-yellow-800' }
      case 'low':
        return { text: 'Limited Data', color: 'bg-red-100 text-red-800' }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }
}

// Export cache for testing and management
export { censusCache }