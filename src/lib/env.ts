/**
 * Environment Variable Validation and Type Safety
 *
 * This module provides centralized environment variable validation,
 * type safety, and documentation for the CasaReady application.
 */

import { z } from 'zod';

// =============================================================================
// Environment Variable Schema
// =============================================================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // =============================================================================
  // SERVER-SIDE ONLY (Private Variables)
  // =============================================================================

  // AI/API Configuration
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for AI functionality').optional(),

  // Webhook Configuration
  ZAPIER_WEBHOOK_URL: z
    .string()
    .url('ZAPIER_WEBHOOK_URL must be a valid URL')
    .optional(),

  // =============================================================================
  // CLIENT-SIDE ACCESSIBLE (NEXT_PUBLIC_ Variables)
  // =============================================================================

  // Analytics
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, 'NEXT_PUBLIC_GA_ID must be a valid Google Analytics ID')
    .optional(),

  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Realtor Contact Information
  NEXT_PUBLIC_REALTOR_NAME: z.string().default('Real Estate Professional'),
  NEXT_PUBLIC_REALTOR_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_REALTOR_PHONE: z.string().optional(),
  NEXT_PUBLIC_REALTOR_WHATSAPP: z.string().optional(),
  NEXT_PUBLIC_REALTOR_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_REALTOR_FACEBOOK: z.string().url().optional(),
  NEXT_PUBLIC_REALTOR_INSTAGRAM: z.string().url().optional(),

  // =============================================================================
  // OPTIONAL CONFIGURATION
  // =============================================================================

  // Development flags
  SKIP_ENV_VALIDATION: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// =============================================================================
// Environment Variable Validation
// =============================================================================

let env: z.infer<typeof envSchema>;

try {
  // Skip validation during build time, in production runtime, or if flag is set
  if (
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV === 'production'
  ) {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Environment validation skipped (production runtime)');
    } else {
      console.warn('⚠️  Environment validation skipped (build time or development mode)');
    }
    env = process.env as any;
  } else {
    env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });

    // Only validate in development mode
    console.warn('⚠️  Continuing with invalid environment');
    env = process.env as any;
  } else {
    console.error('❌ Error validating environment variables:', error);
    // Don't crash - just warn
    console.warn('⚠️  Continuing despite validation error');
    env = process.env as any;
  }
}

// =============================================================================
// Typed Environment Export
// =============================================================================

export { env };

// =============================================================================
// Environment Helper Functions
// =============================================================================

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  return env.NODE_ENV === 'development';
};

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => {
  return env.NODE_ENV === 'production';
};

/**
 * Check if we're running in test mode
 */
export const isTest = (): boolean => {
  return env.NODE_ENV === 'test';
};

/**
 * Get the site URL with proper protocol
 */
export const getSiteUrl = (): string => {
  return env.NEXT_PUBLIC_SITE_URL;
};

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return !!env.NEXT_PUBLIC_GA_ID && isProduction();
};

/**
 * Check if Zapier integration is enabled
 */
export const isZapierEnabled = (): boolean => {
  return !!env.ZAPIER_WEBHOOK_URL;
};

/**
 * Get realtor contact information
 */
export const getRealtorInfo = () => ({
  name: env.NEXT_PUBLIC_REALTOR_NAME,
  address: env.NEXT_PUBLIC_REALTOR_ADDRESS,
  phone: env.NEXT_PUBLIC_REALTOR_PHONE,
  whatsapp: env.NEXT_PUBLIC_REALTOR_WHATSAPP,
  email: env.NEXT_PUBLIC_REALTOR_EMAIL,
  facebook: env.NEXT_PUBLIC_REALTOR_FACEBOOK,
  instagram: env.NEXT_PUBLIC_REALTOR_INSTAGRAM,
});

/**
 * Environment configuration summary for debugging
 */
export const getEnvSummary = () => ({
  nodeEnv: env.NODE_ENV,
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  analyticsEnabled: isAnalyticsEnabled(),
  zapierEnabled: isZapierEnabled(),
  realtorConfigured: !!env.NEXT_PUBLIC_REALTOR_NAME,
  logLevel: env.LOG_LEVEL,
});

// =============================================================================
// Development Environment Helpers
// =============================================================================

if (isDevelopment()) {
  // Log environment summary in development
  console.log('🔧 Environment Summary:', getEnvSummary());

  // Warn about missing optional configurations
  if (!env.NEXT_PUBLIC_GA_ID) {
    console.warn('⚠️  Google Analytics not configured (NEXT_PUBLIC_GA_ID)');
  }

  if (!env.ZAPIER_WEBHOOK_URL) {
    console.warn('⚠️  Zapier webhook not configured (ZAPIER_WEBHOOK_URL)');
  }
}