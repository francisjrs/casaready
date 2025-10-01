import { describe, it, expect, vi } from 'vitest'
import {
  parseNumericInput,
  sanitizePositiveNumberInput,
  sanitizeNonNegativeNumberInput,
  sanitizeOptionalString,
  validatePhoneNumber,
  validateEmail,
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,
  normalizeWizardData,
  normalizeContactInfo,
  calculateFinancialMetrics,
  convertWizardToLeadData,
  generateDataSummary
} from '../data-service'
import { createTestWizardData, testDataScenarios, validationTestData } from '@/test/utils/test-data'

describe('Data Service', () => {
  describe('parseNumericInput', () => {
    it('should parse valid numeric strings', () => {
      expect(parseNumericInput('100')).toBe(100)
      expect(parseNumericInput('75000')).toBe(75000)
      expect(parseNumericInput('0')).toBe(0)
      expect(parseNumericInput('123.45')).toBe(123.45)
    })

    it('should parse numbers', () => {
      expect(parseNumericInput(100)).toBe(100)
      expect(parseNumericInput(75000)).toBe(75000)
      expect(parseNumericInput(0)).toBe(0)
      expect(parseNumericInput(123.45)).toBe(123.45)
    })

    it('should parse formatted currency strings', () => {
      expect(parseNumericInput('$100')).toBe(100)
      expect(parseNumericInput('$75,000')).toBe(75000)
      expect(parseNumericInput('$1,234.56')).toBe(1234.56)
      expect(parseNumericInput('$0')).toBe(0)
    })

    it('should handle whitespace', () => {
      expect(parseNumericInput(' 100 ')).toBe(100)
      expect(parseNumericInput('  $75,000  ')).toBe(75000)
    })

    it('should return null for invalid inputs', () => {
      expect(parseNumericInput('')).toBeNull()
      expect(parseNumericInput('abc')).toBeNull()
      expect(parseNumericInput('$abc')).toBeNull()
      expect(parseNumericInput(null)).toBeNull()
      expect(parseNumericInput(undefined)).toBeNull()
    })

    it('should handle edge cases', () => {
      expect(parseNumericInput('0.00')).toBe(0)
      expect(parseNumericInput('$0.00')).toBe(0)
      expect(parseNumericInput('000100')).toBe(100)
      expect(parseNumericInput('$000,100.00')).toBe(100)
    })
  })

  describe('sanitizePositiveNumberInput', () => {
    it('should return positive numbers', () => {
      expect(sanitizePositiveNumberInput(100)).toBe(100)
      expect(sanitizePositiveNumberInput('75000')).toBe(75000)
      expect(sanitizePositiveNumberInput('$1,234')).toBe(1234)
    })

    it('should return null for zero and negative numbers', () => {
      expect(sanitizePositiveNumberInput(0)).toBeNull()
      expect(sanitizePositiveNumberInput(-100)).toBeNull()
      expect(sanitizePositiveNumberInput('-100')).toBeNull()
    })

    it('should return null for invalid inputs', () => {
      expect(sanitizePositiveNumberInput('')).toBeNull()
      expect(sanitizePositiveNumberInput('abc')).toBeNull()
      expect(sanitizePositiveNumberInput(null)).toBeNull()
    })
  })

  describe('sanitizeNonNegativeNumberInput', () => {
    it('should return non-negative numbers', () => {
      expect(sanitizeNonNegativeNumberInput(100)).toBe(100)
      expect(sanitizeNonNegativeNumberInput(0)).toBe(0)
      expect(sanitizeNonNegativeNumberInput('75000')).toBe(75000)
    })

    it('should return null for negative numbers', () => {
      expect(sanitizeNonNegativeNumberInput(-100)).toBeNull()
      expect(sanitizeNonNegativeNumberInput('-100')).toBeNull()
    })

    it('should return null for invalid inputs', () => {
      expect(sanitizeNonNegativeNumberInput('')).toBeNull()
      expect(sanitizeNonNegativeNumberInput('abc')).toBeNull()
    })
  })

  describe('sanitizeOptionalString', () => {
    it('should return trimmed non-empty strings', () => {
      expect(sanitizeOptionalString('hello')).toBe('hello')
      expect(sanitizeOptionalString('  hello  ')).toBe('hello')
      expect(sanitizeOptionalString('Hello World')).toBe('Hello World')
    })

    it('should return null for empty or whitespace-only strings', () => {
      expect(sanitizeOptionalString('')).toBeNull()
      expect(sanitizeOptionalString('   ')).toBeNull()
      expect(sanitizeOptionalString('\t\n')).toBeNull()
    })

    it('should handle max length constraint', () => {
      const longString = 'a'.repeat(100)
      expect(sanitizeOptionalString(longString, 50)).toBe('a'.repeat(50))
      expect(sanitizeOptionalString('hello', 10)).toBe('hello')
    })

    it('should return null for null/undefined inputs', () => {
      expect(sanitizeOptionalString(null)).toBeNull()
      expect(sanitizeOptionalString(undefined)).toBeNull()
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      validationTestData.validPhones.forEach(phone => {
        const result = validatePhoneNumber(phone)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid phone numbers', () => {
      validationTestData.invalidPhones.forEach(phone => {
        const result = validatePhoneNumber(phone)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const result = validatePhoneNumber('123')
      expect(result.error).toContain('10 digits')

      const result2 = validatePhoneNumber('')
      expect(result2.error).toContain('required')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      validationTestData.validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid email addresses', () => {
      validationTestData.invalidEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const result = validateEmail('invalid.email')
      expect(result.error).toContain('valid email')

      const result2 = validateEmail('')
      expect(result2.error).toContain('required')
    })

    it('should handle edge cases', () => {
      // Email with plus sign
      const result1 = validateEmail('user+tag@example.com')
      expect(result1.isValid).toBe(true)

      // Email with subdomain
      const result2 = validateEmail('user@mail.example.com')
      expect(result2.isValid).toBe(true)

      // Email with special TLD
      const result3 = validateEmail('user@example.co.uk')
      expect(result3.isValid).toBe(true)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(75000)).toBe('$75,000')
      expect(formatCurrency(1234567)).toBe('$1,234,567')
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should handle decimal places', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235') // Rounded
      expect(formatCurrency(1000.99)).toBe('$1,001') // Rounded
    })

    it('should handle different locales', () => {
      expect(formatCurrency(1000, 'en-US')).toBe('$1,000')
      // Test would depend on actual locale formatting implementation
    })

    it('should handle edge cases', () => {
      expect(formatCurrency(0.99)).toBe('$1')
      expect(formatCurrency(-1000)).toBe('-$1,000')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.25)).toBe('25.0%')
      expect(formatPercentage(0.1)).toBe('10.0%')
      expect(formatPercentage(1.0)).toBe('100.0%')
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('should handle decimal precision', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%')
      expect(formatPercentage(0.12345, 0)).toBe('12%')
    })

    it('should handle edge cases', () => {
      expect(formatPercentage(1.5)).toBe('150.0%')
      expect(formatPercentage(-0.1)).toBe('-10.0%')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format phone numbers consistently', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567')
    })

    it('should handle phone numbers with extensions', () => {
      expect(formatPhoneNumber('5551234567 ext 123')).toBe('(555) 123-4567 ext 123')
      expect(formatPhoneNumber('555-123-4567 x123')).toBe('(555) 123-4567 x123')
    })

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('not-a-phone')).toBe('not-a-phone')
    })

    it('should handle international formats', () => {
      expect(formatPhoneNumber('+1 555 123 4567')).toBe('+1 (555) 123-4567')
    })
  })

  describe('normalizeWizardData', () => {
    it('should normalize complete wizard data', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const normalized = normalizeWizardData(wizardData)

      expect(normalized.location.city).toBe('Austin')
      expect(normalized.location.state).toBe('TX')
      expect(normalized.budget.annualIncome).toBe(65000)
      expect(normalized.budget.monthlyDebt).toBe(600)
      expect(normalized.financing.isFirstTimeBuyer).toBe(true)
    })

    it('should handle partial wizard data', () => {
      const partialData = {
        location: { city: 'Austin' },
        budget: { annualIncome: '75000' }, // String input
        timeline: {},
        preferences: {},
        financing: {}
      }

      const normalized = normalizeWizardData(partialData as any)

      expect(normalized.location.city).toBe('Austin')
      expect(normalized.budget.annualIncome).toBe(75000) // Converted to number
      expect(normalized.timeline).toBeDefined()
      expect(normalized.preferences).toBeDefined()
      expect(normalized.financing).toBeDefined()
    })

    it('should sanitize invalid values', () => {
      const invalidData = {
        location: { city: '   ', zipCode: 'invalid' },
        budget: { annualIncome: -1000, monthlyDebt: 'abc' },
        timeline: { timeframe: '' },
        preferences: { bedrooms: 'many' },
        financing: { employmentLength: null }
      }

      const normalized = normalizeWizardData(invalidData as any)

      expect(normalized.location.city).toBe('')
      expect(normalized.budget.annualIncome).toBe(0) // Default for invalid
      expect(normalized.budget.monthlyDebt).toBe(0)
      expect(normalized.preferences.bedrooms).toBe(1) // Default
    })

    it('should handle array fields correctly', () => {
      const dataWithArrays = {
        location: { city: 'Austin' },
        budget: {},
        timeline: {},
        preferences: {
          propertyTypes: ['single_family', 'townhome'],
          features: ['garage', 'yard'],
          dealBreakers: ['hoa']
        },
        financing: {
          assistancePrograms: ['fha', 'first_time_buyer']
        }
      }

      const normalized = normalizeWizardData(dataWithArrays as any)

      expect(normalized.preferences.propertyTypes).toEqual(['single_family', 'townhome'])
      expect(normalized.preferences.features).toEqual(['garage', 'yard'])
      expect(normalized.financing.assistancePrograms).toEqual(['fha', 'first_time_buyer'])
    })
  })

  describe('normalizeContactInfo', () => {
    it('should normalize contact information', () => {
      const contactInfo = {
        firstName: '  john  ',
        lastName: '  DOE  ',
        email: '  JOHN.DOE@EXAMPLE.COM  ',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const normalized = normalizeContactInfo(contactInfo)

      expect(normalized.firstName).toBe('John') // Capitalized and trimmed
      expect(normalized.lastName).toBe('Doe')
      expect(normalized.email).toBe('john.doe@example.com') // Lowercase
      expect(normalized.phone).toBe('(555) 123-4567') // Formatted
    })

    it('should handle missing fields', () => {
      const incompleteInfo = {
        firstName: 'John',
        email: 'john@example.com'
      }

      const normalized = normalizeContactInfo(incompleteInfo as any)

      expect(normalized.firstName).toBe('John')
      expect(normalized.lastName).toBe('')
      expect(normalized.email).toBe('john@example.com')
      expect(normalized.phone).toBe('')
      expect(normalized.preferredContactMethod).toBe('email') // Default
    })

    it('should validate email during normalization', () => {
      const invalidInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '123',
        preferredContactMethod: 'email'
      }

      const normalized = normalizeContactInfo(invalidInfo)

      expect(normalized.firstName).toBe('John')
      expect(normalized.email).toBe('') // Invalid email cleared
      expect(normalized.phone).toBe('') // Invalid phone cleared
    })
  })

  describe('calculateFinancialMetrics', () => {
    it('should calculate financial metrics correctly', () => {
      const financialData = {
        annualIncome: 75000,
        monthlyDebt: 1000,
        downPayment: 25000,
        creditScore: '700-749'
      }

      const metrics = calculateFinancialMetrics(financialData)

      expect(metrics.monthlyIncome).toBe(6250) // 75000 / 12
      expect(metrics.debtToIncomeRatio).toBeCloseTo(0.16, 2) // 1000 / 6250
      expect(metrics.maxAffordablePayment).toBeGreaterThan(0)
      expect(metrics.estimatedPurchasePrice).toBeGreaterThan(0)
      expect(metrics.creditScoreRange.min).toBe(700)
      expect(metrics.creditScoreRange.max).toBe(749)
    })

    it('should handle zero income gracefully', () => {
      const financialData = {
        annualIncome: 0,
        monthlyDebt: 500,
        downPayment: 10000,
        creditScore: '650-699'
      }

      const metrics = calculateFinancialMetrics(financialData)

      expect(metrics.monthlyIncome).toBe(0)
      expect(metrics.debtToIncomeRatio).toBe(Infinity) // Division by zero
      expect(metrics.maxAffordablePayment).toBe(0)
      expect(metrics.estimatedPurchasePrice).toBe(0)
    })

    it('should calculate appropriate debt-to-income ratios', () => {
      const lowDebtData = {
        annualIncome: 100000,
        monthlyDebt: 500,
        downPayment: 50000,
        creditScore: '750-799'
      }

      const highDebtData = {
        annualIncome: 50000,
        monthlyDebt: 2000,
        downPayment: 10000,
        creditScore: '580-619'
      }

      const lowDebtMetrics = calculateFinancialMetrics(lowDebtData)
      const highDebtMetrics = calculateFinancialMetrics(highDebtData)

      expect(lowDebtMetrics.debtToIncomeRatio).toBeLessThan(0.3) // Good DTI
      expect(highDebtMetrics.debtToIncomeRatio).toBeGreaterThan(0.4) // High DTI
    })

    it('should estimate purchase price based on down payment and income', () => {
      const data = {
        annualIncome: 80000,
        monthlyDebt: 800,
        downPayment: 40000,
        creditScore: '720-749'
      }

      const metrics = calculateFinancialMetrics(data)

      expect(metrics.estimatedPurchasePrice).toBeGreaterThan(metrics.downPayment)
      expect(metrics.estimatedPurchasePrice).toBeGreaterThan(200000) // Reasonable minimum
      expect(metrics.estimatedPurchasePrice).toBeLessThan(1000000) // Reasonable maximum
    })

    it('should parse credit score ranges correctly', () => {
      const testCases = [
        { input: '580-619', expected: { min: 580, max: 619 } },
        { input: '700-749', expected: { min: 700, max: 749 } },
        { input: '800_plus', expected: { min: 800, max: 850 } },
        { input: 'unknown', expected: { min: 300, max: 850 } }
      ]

      testCases.forEach(({ input, expected }) => {
        const metrics = calculateFinancialMetrics({
          annualIncome: 75000,
          monthlyDebt: 1000,
          downPayment: 25000,
          creditScore: input
        })

        expect(metrics.creditScoreRange.min).toBe(expected.min)
        expect(metrics.creditScoreRange.max).toBe(expected.max)
      })
    })
  })

  describe('convertWizardToLeadData', () => {
    it('should convert wizard data to lead format', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        preferredContactMethod: 'email'
      }

      const leadData = convertWizardToLeadData(wizardData, contactInfo)

      expect(leadData.firstName).toBe('John')
      expect(leadData.lastName).toBe('Doe')
      expect(leadData.email).toBe('john@example.com')
      expect(leadData.city).toBe('Austin')
      expect(leadData.state).toBe('TX')
      expect(leadData.annualIncome).toBe(65000)
      expect(leadData.isFirstTimeBuyer).toBe(true)
      expect(leadData.timeline).toBe('6_months')
    })

    it('should handle missing contact information', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const incompleteContact = {
        firstName: 'John'
      }

      const leadData = convertWizardToLeadData(wizardData, incompleteContact as any)

      expect(leadData.firstName).toBe('John')
      expect(leadData.lastName).toBe('')
      expect(leadData.email).toBe('')
      expect(leadData.phone).toBe('')
    })

    it('should convert array fields to proper format', () => {
      const wizardData = createTestWizardData({
        preferences: {
          propertyTypes: ['single_family', 'townhome'],
          features: ['garage', 'yard', 'pool']
        },
        financing: {
          assistancePrograms: ['fha', 'first_time_buyer']
        }
      })
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const leadData = convertWizardToLeadData(wizardData, contactInfo)

      expect(leadData.propertyTypes).toEqual(['single_family', 'townhome'])
      expect(leadData.desiredFeatures).toEqual(['garage', 'yard', 'pool'])
      expect(leadData.assistancePrograms).toEqual(['fha', 'first_time_buyer'])
    })

    it('should handle boolean fields correctly', () => {
      const wizardData = testDataScenarios.veteran()
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const leadData = convertWizardToLeadData(wizardData, contactInfo)

      expect(leadData.isVeteran).toBe(true)
      expect(leadData.hasPreapproval).toBe(true)
    })
  })

  describe('generateDataSummary', () => {
    it('should generate comprehensive data summary', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        preferredContactMethod: 'email'
      }

      const summary = generateDataSummary(wizardData, contactInfo, 'en')

      expect(summary).toContain('John Doe')
      expect(summary).toContain('Austin, TX')
      expect(summary).toContain('$65,000')
      expect(summary).toContain('first-time buyer')
      expect(summary).toContain('6 months')
    })

    it('should generate Spanish summary', () => {
      const wizardData = testDataScenarios.firstTimeBuyer()
      const contactInfo = {
        firstName: 'María',
        lastName: 'García',
        email: 'maria@ejemplo.com',
        phone: '(555) 987-6543',
        preferredContactMethod: 'phone'
      }

      const summary = generateDataSummary(wizardData, contactInfo, 'es')

      expect(summary).toContain('María García')
      expect(summary).toContain('Austin, TX')
      // Should be formatted appropriately for Spanish locale
    })

    it('should handle incomplete data gracefully', () => {
      const incompleteData = {
        location: { city: 'Austin' },
        budget: { annualIncome: 50000 },
        timeline: {},
        preferences: {},
        financing: {}
      }
      const minimalContact = {
        firstName: 'John',
        email: 'john@test.com'
      }

      const summary = generateDataSummary(incompleteData as any, minimalContact as any, 'en')

      expect(summary).toContain('John')
      expect(summary).toContain('Austin')
      expect(summary).not.toContain('undefined')
      expect(summary).not.toContain('null')
    })

    it('should include financial metrics in summary', () => {
      const wizardData = testDataScenarios.highIncome()
      const contactInfo = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const summary = generateDataSummary(wizardData, contactInfo, 'en')

      expect(summary).toContain('$150,000') // Annual income
      expect(summary).toContain('$100,000') // Down payment
      expect(summary).toContain('debt-to-income') // Financial analysis
    })

    it('should include program recommendations', () => {
      const wizardData = testDataScenarios.veteran()
      const contactInfo = {
        firstName: 'John',
        lastName: 'Veteran',
        email: 'john@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const summary = generateDataSummary(wizardData, contactInfo, 'en')

      expect(summary).toContain('veteran')
      expect(summary).toContain('VA loan')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(parseNumericInput(null)).toBeNull()
      expect(parseNumericInput(undefined)).toBeNull()
      expect(sanitizeOptionalString(null)).toBeNull()
      expect(sanitizeOptionalString(undefined)).toBeNull()
    })

    it('should handle extreme numeric values', () => {
      expect(parseNumericInput('999999999')).toBe(999999999)
      expect(parseNumericInput('0.0001')).toBe(0.0001)
      expect(sanitizePositiveNumberInput(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle malformed data structures', () => {
      const malformedData = {
        location: null,
        budget: 'not an object',
        timeline: [],
        preferences: 123,
        financing: undefined
      }

      const normalized = normalizeWizardData(malformedData as any)

      expect(normalized.location).toBeDefined()
      expect(normalized.budget).toBeDefined()
      expect(normalized.timeline).toBeDefined()
      expect(normalized.preferences).toBeDefined()
      expect(normalized.financing).toBeDefined()
    })

    it('should handle very long strings', () => {
      const veryLongString = 'a'.repeat(10000)
      const sanitized = sanitizeOptionalString(veryLongString, 100)

      expect(sanitized).toHaveLength(100)
      expect(sanitized).toBe('a'.repeat(100))
    })

    it('should handle special characters in names', () => {
      const contactInfo = {
        firstName: "O'Connor",
        lastName: "Smith-Jones",
        email: 'test@example.com',
        phone: '555-123-4567',
        preferredContactMethod: 'email'
      }

      const normalized = normalizeContactInfo(contactInfo)

      expect(normalized.firstName).toBe("O'Connor")
      expect(normalized.lastName).toBe("Smith-Jones")
    })

    it('should handle international phone numbers', () => {
      const internationalPhone = '+1 555 123 4567'
      const formatted = formatPhoneNumber(internationalPhone)

      expect(formatted).toContain('+1')
      expect(formatted).toContain('555')
    })
  })
})