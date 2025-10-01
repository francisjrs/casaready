/**
 * AI Planning Service Module
 *
 * Provides Google Gemini integration for generating personalized home buying plans
 * with structured output validation, bilingual support, and robust error handling.
 *
 * References:
 * - Gemini API Text Generation: https://ai.google.dev/gemini-api/docs/text-generation
 * - Structured Output: https://ai.google.dev/gemini-api/docs/structured-output
 * - Google Search Grounding: https://ai.google.dev/gemini-api/docs/google-search
 */

// Main client exports
export {
  GeminiPlanningClient,
  createGeminiClient,
  GeminiError,
  GeminiValidationError
} from './gemini-client';

// Import for internal use
import { createGeminiClient, GeminiError, GeminiValidationError } from './gemini-client';
import { validatePlanForRendering, renderPersonalizedPlan, renderPlanSummary } from './response-templates';
import { PlanGenerationInput } from '@/validators/planning-schemas';

// Template rendering exports
export {
  renderAffordabilityEstimate,
  renderProgramRecommendations,
  renderActionPlan,
  renderPersonalizedPlan,
  renderPlanSummary,
  validatePlanForRendering,
  type TemplateConfig
} from './response-templates';

// Re-export validator schemas and types for convenience
export {
  PersonalizedPlanSchema,
  PlanGenerationInputSchema,
  AffordabilityEstimateSchema,
  ProgramRecommendationSchema,
  ActionPlanSchema,
  type PersonalizedPlan,
  type PlanGenerationInput,
  type AffordabilityEstimate,
  type ProgramRecommendation,
  type ActionPlan,
  type ActionStep,
  type RiskTolerance,
  type ProgramType
} from '@/validators/planning-schemas';

/**
 * Main planning service function with full error handling and fallbacks
 */
export async function generatePersonalizedPlan(
  input: import('@/validators/planning-schemas').PlanGenerationInput,
  options: {
    useGrounding?: boolean;
    language?: 'en' | 'es';
    includeMarkdown?: boolean;
    customConfig?: any;
  } = {}
): Promise<{
  plan: import('@/validators/planning-schemas').PersonalizedPlan;
  markdown?: string;
  summary?: string;
  errors?: string[];
}> {
  const {
    useGrounding = true,
    language = 'en',
    includeMarkdown = true,
    customConfig
  } = options;

  try {
    // Create Gemini client
    const client = createGeminiClient(customConfig);

    // Set language preference in input
    const inputWithLanguage = {
      ...input,
      preferences: {
        ...input.preferences,
        language
      }
    };

    // Generate plan
    const plan = await client.generatePersonalizedPlan(inputWithLanguage, useGrounding);

    // Validate plan for rendering
    const validation = validatePlanForRendering(plan);
    if (!validation.isValid) {
      return {
        plan,
        errors: validation.errors
      };
    }

    const result: any = { plan: validation.sanitizedPlan || plan };

    // Generate markdown if requested
    if (includeMarkdown) {
      const templateConfig = { language, includeDisclaimer: true };
      result.markdown = renderPersonalizedPlan(plan, templateConfig);
      result.summary = renderPlanSummary(plan, templateConfig);
    }

    return result;

  } catch (error) {
    console.error('Error generating personalized plan:', error);

    // Return fallback plan in case of complete failure
    if (error instanceof GeminiError || error instanceof GeminiValidationError) {
      const client = createGeminiClient({ apiKey: 'fallback' });
      const fallbackPlan = (client as any).generateFallbackPlan(input);

      return {
        plan: fallbackPlan,
        errors: [error.message]
      };
    }

    throw error;
  }
}

/**
 * Utility function to test Gemini connection and API key
 */
export async function testGeminiConnection(): Promise<{
  connected: boolean;
  error?: string;
  apiVersion?: string;
}> {
  try {
    const client = createGeminiClient();

    // Simple test generation
    const testInput: PlanGenerationInput = {
      userProfile: {
        incomeDebt: {
          annualIncome: 75000,
          monthlyDebts: 500,
          downPaymentAmount: 15000,
          creditScore: '670-739'
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Test Corp',
          jobTitle: 'Developer',
          yearsAtJob: 2,
          employerPhone: '555-0123',
          workAddress: '123 Test St'
        },
        location: {
          preferredState: 'CA',
          preferredCity: 'Los Angeles',
          preferredZipCode: '90210',
          maxBudget: 500000,
          minBedrooms: 2,
          minBathrooms: 1,
          homeType: 'house',
          timeframe: '6-months',
          firstTimeBuyer: true
        },
        contact: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '555-0123',
          dateOfBirth: '1990-01-01',
          maritalStatus: 'single'
        }
      },
      preferences: {
        language: 'en',
        focusAreas: [],
        excludePrograms: []
      }
    };

    await client.generatePersonalizedPlan(testInput, false);

    return {
      connected: true,
      apiVersion: 'gemini-1.5-pro'
    };

  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}