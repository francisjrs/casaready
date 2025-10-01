/**
 * Validators Module
 *
 * Centralized validation schemas and utilities using Zod for type-safe validation
 * of AI planning service inputs and outputs.
 */

// Re-export planning schemas
export * from './planning-schemas';

// Re-export existing validation schemas for consistency
export * from '@/lib/validations';

/**
 * Common validation utilities
 */
import { z } from 'zod';

// Common data types
export const EmailSchema = z.string().email('Invalid email format');
export const PhoneSchema = z.string().regex(/^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number format');
export const ZipCodeSchema = z.string().regex(/^(\d{5}(-\d{4})?|[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d)$/, 'Invalid ZIP code');
export const SSNSchema = z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format (XXX-XX-XXXX)');

// Currency validation
export const CurrencySchema = z.number().min(0, 'Amount must be positive');
export const PercentageSchema = z.number().min(0).max(1, 'Percentage must be between 0 and 1');

// Date validation helpers
export const FutureDateSchema = z.string().refine((date) => {
  const inputDate = new Date(date);
  const today = new Date();
  return inputDate > today;
}, 'Date must be in the future');

export const PastDateSchema = z.string().refine((date) => {
  const inputDate = new Date(date);
  const today = new Date();
  return inputDate < today;
}, 'Date must be in the past');

export const AgeValidationSchema = z.string().refine((date) => {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
}, 'Must be at least 18 years old');

// Language validation
export const LanguageSchema = z.enum(['en', 'es'], {
  message: 'Language must be either "en" (English) or "es" (Spanish)'
});

// API response validation
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  requestId: z.string().optional()
});

// Validation error formatter
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

// Validation helper function
export function validateWithFallback<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): { success: boolean; data: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: fallback,
        errors: formatValidationErrors(error)
      };
    }
    return {
      success: false,
      data: fallback,
      errors: ['Unknown validation error']
    };
  }
}

// Safe parsing with detailed error reporting
export function safeParseWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

  return { success: false, errors };
}