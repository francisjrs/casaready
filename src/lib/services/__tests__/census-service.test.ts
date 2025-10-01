import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getCensusAreaInsights,
  validateCity,
  compareAreas,
  CensusUtils
} from '../census-service'
import { mockCensusHelpers, mockCensusData } from '@/test/mocks/census-api'

// Mock fetch globally
global.fetch = vi.fn()

describe('Census Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCensusHelpers.reset()
    mockCensusHelpers.setDelay(0) // Set to 0 for deterministic tests

    // Set up default fetch mock to use our census mock
    ;(global.fetch as any).mockReset()
  })

  afterEach(() => {
    mockCensusHelpers.reset()
  })

  describe('getCensusAreaInsights', () => {
    it('should return insights for valid city', async () => {
      mockCensusHelpers.configureSuccess()

      // Mock the fetch calls
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            [
              'NAME','B01003_001E','B19013_001E','B25077_001E','B23025_005E','B23025_002E','B15003_017E','B15003_022E','B15003_023E','B01001_001E','B01001_003E','B01001_020E','state','place'
            ],
            [
              'Austin city, Texas',
              '964254',  // B01003_001E - Total Population
              '78691',   // B19013_001E - Median Household Income
              '494178',  // B25077_001E - Median Home Value
              '15000',   // B23025_005E - Unemployed
              '500000',  // B23025_002E - Labor Force
              '100000',  // B15003_017E - High School
              '200000',  // B15003_022E - Bachelor's Degree
              '50000',   // B15003_023E - Master's Degree
              '964254',  // B01001_001E - Total Population for age calc
              '200000',  // B01001_003E - Under 18
              '100000',  // B01001_020E - 65 and over
              '48',      // state code
              '53000'    // place code
            ]
          ]
        })

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.location.city).toBe('Austin')
      expect(result.data?.location.state).toBe('TX')
      expect(result.data?.demographics.population).toBe(964254)
      expect(result.data?.demographics.medianHouseholdIncome).toBe(78691)
      expect(result.data?.demographics.medianHomeValue).toBe(494178)
      expect(result.data?.demographics.unemploymentRate).toBeCloseTo(3.0, 1)
      expect(result.data?.recommendations).toBeInstanceOf(Array)
    })

    it('should handle city without state', async () => {
      mockCensusHelpers.configureSuccess()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            '964254', '33.8', '78691', '494178', '932726', '466107', '203738', '664207', '96309'
          ]]
        })

      const result = await getCensusAreaInsights('Austin', undefined, 'en')

      expect(result.success).toBe(true)
      expect(result.data?.city).toBe('Austin')
    })

    it('should return cached results on subsequent calls', async () => {
      mockCensusHelpers.configureSuccess()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            '964254', '33.8', '78691', '494178', '932726', '466107', '203738', '664207', '96309'
          ]]
        })

      // First call
      const result1 = await getCensusAreaInsights('Austin', 'TX', 'en')
      expect(result1.success).toBe(true)

      // Second call should use cache
      const result2 = await getCensusAreaInsights('Austin', 'TX', 'en')
      expect(result2.success).toBe(true)
      expect(result2.cached).toBe(true)

      // Should only have made API calls once
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return fallback data when API fails', async () => {
      mockCensusHelpers.configureNetworkError()

      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.city).toBe('Austin')
      expect(result.data?.state).toBe('TX')
      expect(result.data?.dataQuality).toBe('estimated')
    })

    it('should handle geocoding failure gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Location not found' })
      })

      const result = await getCensusAreaInsights('InvalidCity', 'XX', 'en')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Location not found')
    })

    it('should handle demographics API failure', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        })

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
      expect(result.data?.dataQuality).toBe('estimated')
    })

    it('should generate Spanish recommendations', async () => {
      mockCensusHelpers.configureSuccess()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            '964254', '33.8', '78691', '494178', '932726', '466107', '203738', '664207', '96309'
          ]]
        })

      const result = await getCensusAreaInsights('Austin', 'TX', 'es')

      expect(result.success).toBe(true)
      expect(result.data?.recommendations).toBeInstanceOf(Array)
      // Recommendations should be appropriate for Spanish locale
    })

    it('should handle rate limiting', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      })

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
      expect(result.data?.dataQuality).toBe('estimated')
    })
  })

  // Note: geocodeLocation function doesn't exist in the current implementation

  // Note: fetchDemographicData and generateRecommendations functions don't exist in the current implementation

  describe('validateCity', () => {
    it('should validate proper city names', async () => {
      // Mock successful geocoding responses
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['San Francisco, CA'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding // Reuse for New York
        })

      const result1 = await validateCity('Austin')
      expect(result1.isValid).toBe(true)

      const result2 = await validateCity('San Francisco')
      expect(result2.isValid).toBe(true)

      const result3 = await validateCity('New York')
      expect(result3.isValid).toBe(true)
    })

    it('should reject invalid city names', async () => {
      const result1 = await validateCity('')
      expect(result1.isValid).toBe(false)

      const result2 = await validateCity('a')
      expect(result2.isValid).toBe(false)

      const result3 = await validateCity('123')
      expect(result3.isValid).toBe(false)
    })

    it('should handle edge cases', async () => {
      const result1 = await validateCity('  Austin  ')
      expect(result1.isValid).toBe(true) // Trimmed

      const result2 = await validateCity('AUSTIN')
      expect(result2.isValid).toBe(true) // Case insensitive

      const result3 = await validateCity('austin')
      expect(result3.isValid).toBe(true) // Lowercase
    })
  })

  describe('compareAreas', () => {
    it('should compare multiple areas', async () => {
      // Mock multiple successful responses
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            'NAME,B01003_001E,B19013_001E,B25077_001E,B23025_005E,B23025_002E,B15003_017E,B15003_022E,B15003_023E,B01001_001E,B01001_003E,B01001_020E,state,place',
            'Austin city, TX,964254,78691,494178,32000,500000,100000,80000,20000,964254,200000,100000,48,53000'
          ]]
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['San Francisco, CA'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            'NAME,B01003_001E,B19013_001E,B25077_001E,B23025_005E,B23025_002E,B15003_017E,B15003_022E,B15003_023E,B01001_001E,B01001_003E,B01001_020E,state,place',
            'San Francisco city, CA,873965,119136,1378300,40000,600000,120000,100000,30000,873965,150000,120000,06,67000'
          ]]
        })

      const cities = [
        { city: 'Austin', state: 'TX' },
        { city: 'San Francisco', state: 'CA' }
      ]

      const result = await compareAreas(cities, 'en')

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(2)

      const austin = result.find(area => area.location.city === 'Austin')
      const sf = result.find(area => area.location.city === 'San Francisco')

      expect(austin).toBeDefined()
      expect(sf).toBeDefined()
      expect(austin?.demographics.medianHouseholdIncome).toBeLessThan(sf?.demographics.medianHouseholdIncome || 0)
    })

    it('should handle partial failures', async () => {
      // Mock one success, one failure
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCensusData['Austin, TX'].geocoding
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            'NAME,B01003_001E,B19013_001E,B25077_001E,B23025_005E,B23025_002E,B15003_017E,B15003_022E,B15003_023E,B01001_001E,B01001_003E,B01001_020E,state,place',
            'Austin city, TX,964254,78691,494178,32000,500000,100000,80000,20000,964254,200000,100000,48,53000'
          ]]
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        })

      const cities = [
        { city: 'Austin', state: 'TX' },
        { city: 'InvalidCity', state: 'XX' }
      ]

      const result = await compareAreas(cities, 'en')

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(1) // Only successful city
      expect(result[0].location.city).toBe('Austin')
    })

    it('should handle empty city list', async () => {
      const result = await compareAreas([], 'en')

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(0)
    })
  })

  describe('CensusUtils', () => {
    describe('formatPopulation', () => {
      it('should format population correctly', () => {
        expect(CensusUtils.formatPopulation(964254)).toBe('964.3K')
        expect(CensusUtils.formatPopulation(1000000)).toBe('1.0M')
        expect(CensusUtils.formatPopulation(500)).toBe('500')
      })
    })

    describe('formatCurrency', () => {
      it('should format currency correctly', () => {
        expect(CensusUtils.formatCurrency(78691)).toBe('$78,691')
        expect(CensusUtils.formatCurrency(494178)).toBe('$494,178')
      })
    })

    describe('getTrendColor', () => {
      it('should return correct color classes', () => {
        expect(CensusUtils.getTrendColor('growing')).toBe('text-green-600')
        expect(CensusUtils.getTrendColor('stable')).toBe('text-blue-600')
        expect(CensusUtils.getTrendColor('declining')).toBe('text-orange-600')
        expect(CensusUtils.getTrendColor('unknown')).toBe('text-gray-600')
      })
    })

    describe('getDataQualityBadge', () => {
      it('should return correct badge info', () => {
        expect(CensusUtils.getDataQualityBadge('high')).toEqual({
          text: 'Verified Data',
          color: 'bg-green-100 text-green-800'
        })
        expect(CensusUtils.getDataQualityBadge('medium')).toEqual({
          text: 'Estimated Data',
          color: 'bg-yellow-100 text-yellow-800'
        })
        expect(CensusUtils.getDataQualityBadge('low')).toEqual({
          text: 'Limited Data',
          color: 'bg-red-100 text-red-800'
        })
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed API responses', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => 'invalid json structure'
      })

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
    })

    it('should handle network timeouts', async () => {
      ;(global.fetch as any).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
    })

    it('should handle API key issues', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API key' })
      })

      const result = await getCensusAreaInsights('Austin', 'TX', 'en')

      expect(result.success).toBe(true)
      expect(result.fallback).toBe(true)
    })

    it('should handle empty city names', async () => {
      const result = await getCensusAreaInsights('', 'TX', 'en')

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should handle very long city names', async () => {
      const longCityName = 'A'.repeat(1000)
      const result = await getCensusAreaInsights(longCityName, 'TX', 'en')

      expect(result.success).toBe(false)
      expect(result.error).toContain('too long')
    })

    it('should handle special characters in city names', async () => {
      mockCensusHelpers.configureSuccess()

      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              addressMatches: [{
                coordinates: { x: -97.7431, y: 30.2672 },
                matchedAddress: "Austin, TX"
              }]
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [[
            '100000', '35', '50000', '300000', '95000', '40000', '20000', '70000', '10000'
          ]]
        })

      const result = await getCensusAreaInsights("St. John's", 'TX', 'en')

      expect(result.success).toBe(true)
    })
  })
})