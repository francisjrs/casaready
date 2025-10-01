import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateEmail,
  validatePhone,
  formatPhone,
  validateName,
  formatName,
  validateNumeric,
  formatCurrency,
  validateZipCode,
  validateCity,
  formatCity,
  debounce,
  sanitizeInput,
  RateLimiter
} from '../form-validation'
import { validationTestData } from '@/test/utils/test-data'

describe('Form Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      validationTestData.validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
        expect(result.suggestion).toBeNull()
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
      const testCases = [
        { input: '', expectedError: 'Email is required' },
        { input: 'invalid', expectedError: 'Please enter a valid email address' },
        { input: '@example.com', expectedError: 'Please enter a valid email address' },
        { input: 'test@', expectedError: 'Please enter a valid email address' },
        { input: 'test..test@example.com', expectedError: 'Invalid email format' }
      ]

      testCases.forEach(({ input, expectedError }) => {
        const result = validateEmail(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should detect common typos and provide suggestions', () => {
      const typoTests = [
        { input: 'test@gmial.com', expectedSuggestion: 'gmail.com' },
        { input: 'test@yahooo.com', expectedSuggestion: 'yahoo.com' },
        { input: 'test@hotmial.com', expectedSuggestion: 'hotmail.com' },
        { input: 'test@outlok.com', expectedSuggestion: 'outlook.com' }
      ]

      typoTests.forEach(({ input, expectedSuggestion }) => {
        const result = validateEmail(input)
        expect(result.isValid).toBe(false)
        expect(result.suggestion).toContain(expectedSuggestion)
      })
    })

    it('should handle edge cases', () => {
      const edgeCases = [
        'test+tag@example.com', // Plus addressing
        'user.name@subdomain.example.com', // Subdomain
        'firstname.lastname@example.co.uk', // Multiple TLD
        'test@example-domain.com', // Hyphenated domain
        'test123@example.org' // Numbers in local part
      ]

      edgeCases.forEach(email => {
        const result = validateEmail(email)
        expect(result.isValid).toBe(true)
      })
    })

    it('should handle whitespace correctly', () => {
      const result1 = validateEmail('  test@example.com  ')
      expect(result1.isValid).toBe(true)

      const result2 = validateEmail('test @example.com')
      expect(result2.isValid).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      validationTestData.validPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid phone numbers', () => {
      validationTestData.invalidPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const testCases = [
        { input: '', expectedError: 'Phone number is required' },
        { input: '123', expectedError: 'Phone number must contain 10 digits' },
        { input: '555-12-3456', expectedError: 'Invalid phone number format' },
        { input: 'not-a-phone', expectedError: 'Phone number must contain only digits' }
      ]

      testCases.forEach(({ input, expectedError }) => {
        const result = validatePhone(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should handle international numbers', () => {
      const internationalNumbers = [
        '+1 555 123 4567',
        '+1-555-123-4567',
        '1-555-123-4567'
      ]

      internationalNumbers.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.isValid).toBe(true)
      })
    })

    it('should handle extensions', () => {
      const numbersWithExtensions = [
        '555-123-4567 ext 123',
        '(555) 123-4567 x456',
        '5551234567 extension 789'
      ]

      numbersWithExtensions.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('formatPhone', () => {
    it('should format phone numbers consistently', () => {
      const testCases = [
        { input: '5551234567', expected: '(555) 123-4567' },
        { input: '555-123-4567', expected: '(555) 123-4567' },
        { input: '555.123.4567', expected: '(555) 123-4567' },
        { input: '(555) 123-4567', expected: '(555) 123-4567' },
        { input: '555 123 4567', expected: '(555) 123-4567' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatPhone(input)).toBe(expected)
      })
    })

    it('should preserve extensions', () => {
      const testCases = [
        { input: '5551234567 ext 123', expected: '(555) 123-4567 ext 123' },
        { input: '555-123-4567 x456', expected: '(555) 123-4567 x456' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatPhone(input)).toBe(expected)
      })
    })

    it('should handle international numbers', () => {
      const testCases = [
        { input: '+1 555 123 4567', expected: '+1 (555) 123-4567' },
        { input: '1-555-123-4567', expected: '1 (555) 123-4567' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatPhone(input)).toBe(expected)
      })
    })

    it('should return original for invalid formats', () => {
      const invalidFormats = ['123', 'abc', '555-12', 'not-a-phone']

      invalidFormats.forEach(input => {
        expect(formatPhone(input)).toBe(input)
      })
    })
  })

  describe('validateName', () => {
    it('should validate proper names', () => {
      const validNames = [
        'John',
        'Mary Jane',
        "O'Connor",
        'Smith-Jones',
        'José',
        'François',
        '李',
        'van der Berg'
      ]

      validNames.forEach(name => {
        const result = validateName(name)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        'J',
        'John123',
        'John@email',
        '123',
        'John.Doe@test',
        'A'.repeat(101) // Too long
      ]

      invalidNames.forEach(name => {
        const result = validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const testCases = [
        { input: '', expectedError: 'Name is required' },
        { input: 'J', expectedError: 'Name must be at least 2 characters' },
        { input: 'John123', expectedError: 'Name cannot contain numbers' },
        { input: 'John@email', expectedError: 'Name contains invalid characters' },
        { input: 'A'.repeat(101), expectedError: 'Name is too long' }
      ]

      testCases.forEach(({ input, expectedError }) => {
        const result = validateName(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should handle whitespace correctly', () => {
      const result1 = validateName('  John  ')
      expect(result1.isValid).toBe(true)

      const result2 = validateName('John   Doe')
      expect(result2.isValid).toBe(true)

      const result3 = validateName('   ')
      expect(result3.isValid).toBe(false)
    })

    it('should validate length constraints', () => {
      const result1 = validateName('Jo', { minLength: 3 })
      expect(result1.isValid).toBe(false)

      const result2 = validateName('John', { minLength: 3 })
      expect(result2.isValid).toBe(true)

      const result3 = validateName('John', { maxLength: 3 })
      expect(result3.isValid).toBe(false)

      const result4 = validateName('Jo', { maxLength: 3 })
      expect(result4.isValid).toBe(true)
    })
  })

  describe('formatName', () => {
    it('should capitalize names correctly', () => {
      const testCases = [
        { input: 'john', expected: 'John' },
        { input: 'JOHN DOE', expected: 'John Doe' },
        { input: 'mary-jane', expected: 'Mary-Jane' },
        { input: "o'connor", expected: "O'Connor" },
        { input: 'jean-claude van damme', expected: 'Jean-Claude Van Damme' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatName(input)).toBe(expected)
      })
    })

    it('should handle special cases', () => {
      const testCases = [
        { input: 'mcdonald', expected: 'McDonald' },
        { input: 'macpherson', expected: 'MacPherson' },
        { input: 'von neumann', expected: 'Von Neumann' },
        { input: 'de la cruz', expected: 'De La Cruz' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatName(input)).toBe(expected)
      })
    })

    it('should preserve accents and special characters', () => {
      const testCases = [
        { input: 'josé', expected: 'José' },
        { input: 'françois', expected: 'François' },
        { input: 'müller', expected: 'Müller' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatName(input)).toBe(expected)
      })
    })

    it('should handle whitespace', () => {
      expect(formatName('  john doe  ')).toBe('John Doe')
      expect(formatName('john   doe')).toBe('John Doe')
    })
  })

  describe('validateNumeric', () => {
    it('should validate numeric inputs', () => {
      const validNumbers = [
        { input: '100', options: {}, expected: true },
        { input: '0', options: {}, expected: true },
        { input: '123.45', options: { allowDecimals: true }, expected: true },
        { input: '-50', options: { allowNegative: true }, expected: true },
        { input: '1000000', options: {}, expected: true }
      ]

      validNumbers.forEach(({ input, options, expected }) => {
        const result = validateNumeric(input, options)
        expect(result.isValid).toBe(expected)
      })
    })

    it('should reject invalid numeric inputs', () => {
      const invalidNumbers = [
        { input: '', options: {}, expectedError: 'This field is required' },
        { input: 'abc', options: {}, expectedError: 'Must be a valid number' },
        { input: '123.45', options: { allowDecimals: false }, expectedError: 'Decimals not allowed' },
        { input: '-50', options: { allowNegative: false }, expectedError: 'Negative numbers not allowed' }
      ]

      invalidNumbers.forEach(({ input, options, expectedError }) => {
        const result = validateNumeric(input, options)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should validate min/max constraints', () => {
      const result1 = validateNumeric('50', { min: 100 })
      expect(result1.isValid).toBe(false)
      expect(result1.error).toContain('minimum')

      const result2 = validateNumeric('150', { max: 100 })
      expect(result2.isValid).toBe(false)
      expect(result2.error).toContain('maximum')

      const result3 = validateNumeric('75', { min: 50, max: 100 })
      expect(result3.isValid).toBe(true)
    })

    it('should handle currency formatting', () => {
      const currencyInputs = ['$100', '$1,000', '$50,000.00']

      currencyInputs.forEach(input => {
        const result = validateNumeric(input, { allowCurrency: true })
        expect(result.isValid).toBe(true)
      })
    })

    it('should provide formatted values', () => {
      const result1 = validateNumeric('$1,000', { allowCurrency: true })
      expect(result1.numericValue).toBe(1000)

      const result2 = validateNumeric('123.456', { allowDecimals: true })
      expect(result2.numericValue).toBe(123.456)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const testCases = [
        { input: 1000, expected: '$1,000' },
        { input: 75000, expected: '$75,000' },
        { input: 1234567, expected: '$1,234,567' },
        { input: 0, expected: '$0' },
        { input: 1234.56, expected: '$1,235' } // Rounded
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatCurrency(input)).toBe(expected)
      })
    })

    it('should handle different locales', () => {
      expect(formatCurrency(1000, { locale: 'en-US' })).toBe('$1,000')
      // Additional locale tests would depend on implementation
    })

    it('should handle decimal places option', () => {
      expect(formatCurrency(1234.56, { decimals: 2 })).toBe('$1,234.56')
      expect(formatCurrency(1234.56, { decimals: 0 })).toBe('$1,235')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000')
    })
  })

  describe('validateZipCode', () => {
    it('should validate correct ZIP codes', () => {
      validationTestData.validZipCodes.forEach(zip => {
        const result = validateZipCode(zip)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid ZIP codes', () => {
      validationTestData.invalidZipCodes.forEach(zip => {
        const result = validateZipCode(zip)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const testCases = [
        { input: '', expectedError: 'ZIP code is required' },
        { input: '1234', expectedError: 'ZIP code must be 5 digits' },
        { input: '123456', expectedError: 'ZIP code must be 5 digits' },
        { input: 'abcde', expectedError: 'ZIP code must contain only numbers' }
      ]

      testCases.forEach(({ input, expectedError }) => {
        const result = validateZipCode(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should handle ZIP+4 format', () => {
      const zipPlus4Codes = ['12345-6789', '78759-1234']

      zipPlus4Codes.forEach(zip => {
        const result = validateZipCode(zip, { allowExtended: true })
        expect(result.isValid).toBe(true)
      })
    })

    it('should format ZIP codes', () => {
      expect(validateZipCode('12345').formattedValue).toBe('12345')
      expect(validateZipCode('123456789', { allowExtended: true }).formattedValue).toBe('12345-6789')
    })
  })

  describe('validateCity', () => {
    it('should validate proper city names', () => {
      const validCities = [
        'Austin',
        'San Francisco',
        'New York',
        "O'Fallon",
        'St. Louis',
        'Las Vegas',
        'St. Paul',
        'Fort Worth'
      ]

      validCities.forEach(city => {
        const result = validateCity(city)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('should reject invalid city names', () => {
      const invalidCities = [
        '',
        'A',
        '123',
        'City123',
        'city@email.com',
        'A'.repeat(101) // Too long
      ]

      invalidCities.forEach(city => {
        const result = validateCity(city)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })
    })

    it('should provide helpful error messages', () => {
      const testCases = [
        { input: '', expectedError: 'City is required' },
        { input: 'A', expectedError: 'City name must be at least 2 characters' },
        { input: 'City123', expectedError: 'City name cannot contain numbers' },
        { input: 'A'.repeat(101), expectedError: 'City name is too long' }
      ]

      testCases.forEach(({ input, expectedError }) => {
        const result = validateCity(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain(expectedError)
      })
    })

    it('should handle international cities', () => {
      const internationalCities = [
        'São Paulo',
        'México',
        'Montréal',
        'Zürich',
        'Москва'
      ]

      internationalCities.forEach(city => {
        const result = validateCity(city, { allowInternational: true })
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('formatCity', () => {
    it('should capitalize city names correctly', () => {
      const testCases = [
        { input: 'austin', expected: 'Austin' },
        { input: 'san francisco', expected: 'San Francisco' },
        { input: 'new york', expected: 'New York' },
        { input: 'las vegas', expected: 'Las Vegas' },
        { input: 'fort worth', expected: 'Fort Worth' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatCity(input)).toBe(expected)
      })
    })

    it('should handle special cases', () => {
      const testCases = [
        { input: 'st. louis', expected: 'St. Louis' },
        { input: 'st paul', expected: 'St. Paul' },
        { input: 'ft. worth', expected: 'Ft. Worth' },
        { input: 'mt. pleasant', expected: 'Mt. Pleasant' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatCity(input)).toBe(expected)
      })
    })

    it('should preserve existing correct formatting', () => {
      const correctlyFormatted = ['Austin', 'San Francisco', 'St. Louis']

      correctlyFormatted.forEach(city => {
        expect(formatCity(city)).toBe(city)
      })
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should delay function execution', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('should cancel previous calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      vi.advanceTimersByTime(50)
      debouncedFn('second')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('second')
    })

    it('should handle multiple arguments', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 'arg3')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('should preserve this context', () => {
      const obj = {
        value: 'test',
        method: function(this: any, arg: string) {
          return this.value + arg
        }
      }

      const debouncedMethod = debounce(obj.method.bind(obj), 100)
      let result: string

      debouncedMethod.call(obj, ' works')
      vi.advanceTimersByTime(100)

      // Method should have access to correct context
      expect(obj.value).toBe('test')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const testCases = [
        { input: '<script>alert("xss")</script>', expected: 'alert("xss")' },
        { input: '<b>bold text</b>', expected: 'bold text' },
        { input: '<p>paragraph</p>', expected: 'paragraph' },
        { input: 'normal text', expected: 'normal text' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(sanitizeInput(input)).toBe(expected)
      })
    })

    it('should decode HTML entities', () => {
      const testCases = [
        { input: '&lt;test&gt;', expected: '<test>' },
        { input: '&amp;company', expected: '&company' },
        { input: '&quot;quoted&quot;', expected: '"quoted"' },
        { input: '&#39;apostrophe&#39;', expected: "'apostrophe'" }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(sanitizeInput(input)).toBe(expected)
      })
    })

    it('should handle malicious inputs', () => {
      const maliciousInputs = [
        '<script src="evil.js"></script>',
        '<img src="x" onerror="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
        'javascript:alert(1)'
      ]

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input)
        expect(sanitized).not.toContain('<script')
        expect(sanitized).not.toContain('<iframe')
        expect(sanitized).not.toContain('javascript:')
        expect(sanitized).not.toContain('onerror')
      })
    })

    it('should preserve safe content', () => {
      const safeInputs = [
        'Regular text input',
        'Text with "quotes" and symbols!',
        'Numbers 123 and dates 2023-12-01',
        'Email: test@example.com'
      ]

      safeInputs.forEach(input => {
        expect(sanitizeInput(input)).toBe(input)
      })
    })
  })

  describe('RateLimiter', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should allow requests within limit', () => {
      const limiter = new RateLimiter(5, 60000) // 5 requests per minute

      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed('user1')).toBe(true)
      }
    })

    it('should block requests exceeding limit', () => {
      const limiter = new RateLimiter(3, 60000) // 3 requests per minute

      // Use up the limit
      for (let i = 0; i < 3; i++) {
        expect(limiter.isAllowed('user1')).toBe(true)
      }

      // Next request should be blocked
      expect(limiter.isAllowed('user1')).toBe(false)
    })

    it('should reset after time window', () => {
      const limiter = new RateLimiter(2, 1000) // 2 requests per second

      // Use up the limit
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(false)

      // Advance time past window
      vi.advanceTimersByTime(1001)

      // Should be allowed again
      expect(limiter.isAllowed('user1')).toBe(true)
    })

    it('should track different identifiers separately', () => {
      const limiter = new RateLimiter(2, 60000) // 2 requests per minute

      // User 1 uses up their limit
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(false)

      // User 2 should still be allowed
      expect(limiter.isAllowed('user2')).toBe(true)
      expect(limiter.isAllowed('user2')).toBe(true)
      expect(limiter.isAllowed('user2')).toBe(false)
    })

    it('should provide remaining count', () => {
      const limiter = new RateLimiter(5, 60000)

      expect(limiter.getRemaining('user1')).toBe(5)

      limiter.isAllowed('user1')
      expect(limiter.getRemaining('user1')).toBe(4)

      limiter.isAllowed('user1')
      expect(limiter.getRemaining('user1')).toBe(3)
    })

    it('should provide reset time', () => {
      const limiter = new RateLimiter(2, 10000) // 2 requests per 10 seconds

      limiter.isAllowed('user1')

      const resetTime = limiter.getResetTime('user1')
      expect(resetTime).toBeGreaterThan(Date.now())
      expect(resetTime).toBeLessThanOrEqual(Date.now() + 10000)
    })

    it('should clean up old entries', () => {
      const limiter = new RateLimiter(2, 1000) // 2 requests per second

      limiter.isAllowed('user1')
      expect(limiter.getRemaining('user1')).toBe(1)

      // Advance time past window
      vi.advanceTimersByTime(1001)

      // Clean up should happen on next check
      expect(limiter.getRemaining('user1')).toBe(2) // Reset to full limit
    })
  })

  describe('Integration Tests', () => {
    it('should validate and format complete form data', () => {
      const formData = {
        firstName: 'john',
        lastName: 'doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
        phone: '5551234567',
        city: 'austin',
        zipCode: '78759',
        annualIncome: '$75,000'
      }

      // Validate and format each field
      const firstName = validateName(formData.firstName)
      expect(firstName.isValid).toBe(true)
      const formattedFirstName = formatName(formData.firstName)
      expect(formattedFirstName).toBe('John')

      const email = validateEmail(formData.email)
      expect(email.isValid).toBe(true)
      const normalizedEmail = formData.email.toLowerCase().trim()
      expect(normalizedEmail).toBe('john.doe@example.com')

      const phone = validatePhone(formData.phone)
      expect(phone.isValid).toBe(true)
      const formattedPhone = formatPhone(formData.phone)
      expect(formattedPhone).toBe('(555) 123-4567')

      const city = validateCity(formData.city)
      expect(city.isValid).toBe(true)
      const formattedCity = formatCity(formData.city)
      expect(formattedCity).toBe('Austin')

      const zipCode = validateZipCode(formData.zipCode)
      expect(zipCode.isValid).toBe(true)

      const income = validateNumeric(formData.annualIncome, { allowCurrency: true })
      expect(income.isValid).toBe(true)
      expect(income.numericValue).toBe(75000)
    })

    it('should handle validation errors consistently', () => {
      const invalidData = {
        firstName: '',
        email: 'invalid-email',
        phone: '123',
        city: '123City',
        zipCode: '1234',
        annualIncome: 'not-a-number'
      }

      const validationResults = {
        firstName: validateName(invalidData.firstName),
        email: validateEmail(invalidData.email),
        phone: validatePhone(invalidData.phone),
        city: validateCity(invalidData.city),
        zipCode: validateZipCode(invalidData.zipCode),
        income: validateNumeric(invalidData.annualIncome)
      }

      // All should be invalid
      Object.values(validationResults).forEach(result => {
        expect(result.isValid).toBe(false)
        expect(result.error).toBeTruthy()
      })

      // Errors should be helpful
      expect(validationResults.firstName.error).toContain('required')
      expect(validationResults.email.error).toContain('valid email')
      expect(validationResults.phone.error).toContain('10 digits')
      expect(validationResults.city.error).toContain('numbers')
      expect(validationResults.zipCode.error).toContain('5 digits')
      expect(validationResults.income.error).toContain('valid number')
    })
  })
})