/**
 * Example usage of the Gemini AI Planning Service
 *
 * This file demonstrates how to use the AI planning service with
 * structured output validation, retry mechanisms, and bilingual support.
 */

import {
  generatePersonalizedPlan,
  testGeminiConnection,
  createGeminiClient,
  renderPersonalizedPlan,
  type PlanGenerationInput
} from './index';

/**
 * Example 1: Basic plan generation with English output
 */
async function exampleBasicPlanGeneration() {
  console.log('🏠 Generating basic home buying plan...');

  const userInput: PlanGenerationInput = {
    userProfile: {
      incomeDebt: {
        annualIncome: 85000,
        monthlyDebts: 650,
        downPaymentAmount: 25000,
        creditScore: '670-739',
        additionalIncome: 5000,
        assets: 45000
      },
      employment: {
        employmentStatus: 'employed',
        employerName: 'Tech Solutions Inc',
        jobTitle: 'Software Engineer',
        yearsAtJob: 3,
        employerPhone: '555-0123',
        workAddress: '123 Business Ave, San Francisco, CA 94105'
      },
      location: {
        preferredState: 'CA',
        preferredCity: 'San Francisco',
        preferredZipCode: '94105',
        maxBudget: 650000,
        minBedrooms: 2,
        minBathrooms: 2,
        homeType: 'condo',
        timeframe: '6-months',
        firstTimeBuyer: true
      },
      contact: {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '555-0123',
        dateOfBirth: '1990-05-15',
        maritalStatus: 'single'
      }
    },
    preferences: {
      language: 'en',
      riskTolerance: 'moderate',
      focusAreas: ['first-time-buyer-programs', 'down-payment-assistance'],
      excludePrograms: []
    }
  };

  try {
    const result = await generatePersonalizedPlan(userInput, {
      useGrounding: true,
      language: 'en',
      includeMarkdown: true
    });

    console.log('✅ Plan generated successfully!');
    console.log('Max Home Price:', result.plan.affordabilityEstimate.maxHomePrice);
    console.log('Programs Found:', result.plan.programRecommendations.length);
    console.log('Action Steps:', result.plan.actionPlan.totalSteps);

    if (result.markdown) {
      console.log('\n📄 Generated Markdown Plan:');
      console.log(result.markdown.substring(0, 500) + '...');
    }

    return result;

  } catch (error) {
    console.error('❌ Error generating plan:', error);
    throw error;
  }
}

/**
 * Example 2: Spanish language plan with custom configuration
 */
async function exampleSpanishPlanGeneration() {
  console.log('🏠 Generando plan de compra de vivienda en español...');

  const userInput: PlanGenerationInput = {
    userProfile: {
      incomeDebt: {
        annualIncome: 60000,
        monthlyDebts: 400,
        downPaymentAmount: 15000,
        creditScore: '580-669',
        additionalIncome: 0,
        assets: 20000
      },
      employment: {
        employmentStatus: 'employed',
        employerName: 'Construcciones López',
        jobTitle: 'Supervisor de Obras',
        yearsAtJob: 5,
        employerPhone: '555-0456',
        workAddress: '456 Industrial Blvd, Los Angeles, CA 90001'
      },
      location: {
        preferredState: 'CA',
        preferredCity: 'Los Angeles',
        preferredZipCode: '90001',
        maxBudget: 450000,
        minBedrooms: 3,
        minBathrooms: 2,
        homeType: 'house',
        timeframe: '12-months',
        firstTimeBuyer: false
      },
      contact: {
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos.lopez@email.com',
        phone: '555-0456',
        dateOfBirth: '1985-03-20',
        maritalStatus: 'married'
      }
    },
    preferences: {
      language: 'es',
      riskTolerance: 'low',
      focusAreas: ['conventional', 'fha'],
      excludePrograms: ['jumbo']
    }
  };

  try {
    const result = await generatePersonalizedPlan(userInput, {
      useGrounding: true,
      language: 'es',
      includeMarkdown: true,
      customConfig: {
        temperature: 0.2, // Lower temperature for more conservative recommendations
        maxOutputTokens: 6144
      }
    });

    console.log('✅ ¡Plan generado exitosamente!');
    console.log('Precio Máximo de Casa:', result.plan.affordabilityEstimate.maxHomePrice);
    console.log('Programas Encontrados:', result.plan.programRecommendations.length);

    if (result.summary) {
      console.log('\n📋 Resumen del Plan:');
      console.log(result.summary);
    }

    return result;

  } catch (error) {
    console.error('❌ Error generando plan:', error);
    throw error;
  }
}

/**
 * Example 3: Direct client usage with retry configuration
 */
async function exampleDirectClientUsage() {
  console.log('🔧 Using Gemini client directly with custom retry config...');

  try {
    const client = createGeminiClient(
      {
        temperature: 0.4,
        maxOutputTokens: 8192
      },
      {
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 15000
      }
    );

    const input: PlanGenerationInput = {
      userProfile: {
        incomeDebt: {
          annualIncome: 95000,
          monthlyDebts: 800,
          downPaymentAmount: 40000,
          creditScore: '740-799',
          additionalIncome: 12000,
          assets: 75000
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Healthcare Partners',
          jobTitle: 'Registered Nurse',
          yearsAtJob: 6,
          employerPhone: '555-0789',
          workAddress: '789 Medical Center Dr, Houston, TX 77001'
        },
        location: {
          preferredState: 'TX',
          preferredCity: 'Houston',
          preferredZipCode: '77001',
          maxBudget: 550000,
          minBedrooms: 3,
          minBathrooms: 2,
          homeType: 'house',
          timeframe: 'immediate',
          firstTimeBuyer: false
        },
        contact: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '555-0789',
          dateOfBirth: '1988-09-12',
          maritalStatus: 'married'
        }
      },
      preferences: {
        language: 'en',
        riskTolerance: 'moderate',
        focusAreas: [],
        excludePrograms: []
      }
    };

    const plan = await client.generatePersonalizedPlan(input, true);

    console.log('✅ Direct client call successful!');
    console.log('Plan ID:', plan.id);
    console.log('Confidence:', (plan.confidence * 100).toFixed(1) + '%');

    // Render with custom template configuration
    const markdown = renderPersonalizedPlan(plan, {
      language: 'en',
      includeDisclaimer: true,
      formatCurrency: true,
      showConfidence: true
    });

    console.log('📄 Markdown length:', markdown.length, 'characters');

    return plan;

  } catch (error) {
    console.error('❌ Direct client usage failed:', error);
    throw error;
  }
}

/**
 * Example 4: Connection testing and validation
 */
async function exampleConnectionTesting() {
  console.log('🔍 Testing Gemini API connection...');

  try {
    const connectionResult = await testGeminiConnection();

    if (connectionResult.connected) {
      console.log('✅ Gemini API connection successful!');
      console.log('API Version:', connectionResult.apiVersion);
    } else {
      console.log('❌ Gemini API connection failed:', connectionResult.error);
    }

    return connectionResult;

  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Example 5: Error handling and fallback demonstration
 */
async function exampleErrorHandling() {
  console.log('⚠️ Demonstrating error handling with invalid API key...');

  const invalidClient = createGeminiClient({
    apiKey: 'invalid-api-key-for-testing'
  });

  const testInput: PlanGenerationInput = {
    userProfile: {
      incomeDebt: {
        annualIncome: 50000,
        monthlyDebts: 300,
        downPaymentAmount: 10000,
        creditScore: '670-739'
      },
      employment: {
        employmentStatus: 'employed',
        employerName: 'Test Company',
        jobTitle: 'Analyst',
        yearsAtJob: 2,
        employerPhone: '555-0000',
        workAddress: 'Test Address'
      },
      location: {
        preferredState: 'FL',
        preferredCity: 'Miami',
        preferredZipCode: '33101',
        maxBudget: 300000,
        minBedrooms: 2,
        minBathrooms: 1,
        homeType: 'condo',
        timeframe: '6-months',
        firstTimeBuyer: true
      },
      contact: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-0000',
        dateOfBirth: '1995-01-01',
        maritalStatus: 'single'
      }
    },
    preferences: {
      language: 'en',
      focusAreas: [],
      excludePrograms: []
    }
  };

  try {
    await invalidClient.generatePersonalizedPlan(testInput);
    console.log('⚠️ Unexpected success with invalid API key');
  } catch (error) {
    console.log('✅ Error handling working correctly');
    console.log('Error type:', error instanceof Error ? error.constructor.name : typeof error);

    // Demonstrate fallback plan generation
    console.log('🔄 Generating fallback plan...');
    try {
      const fallbackResult = await generatePersonalizedPlan(testInput, {
        useGrounding: false,
        language: 'en'
      });

      console.log('✅ Fallback plan generated');
      console.log('Version:', fallbackResult.plan.version);
      console.log('Confidence:', (fallbackResult.plan.confidence * 100).toFixed(1) + '%');

      if (fallbackResult.errors) {
        console.log('⚠️ Fallback errors:', fallbackResult.errors);
      }

    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Starting Gemini AI Planning Service Examples\n');

  const examples = [
    { name: 'Connection Testing', fn: exampleConnectionTesting },
    { name: 'Basic Plan Generation (English)', fn: exampleBasicPlanGeneration },
    { name: 'Spanish Plan Generation', fn: exampleSpanishPlanGeneration },
    { name: 'Direct Client Usage', fn: exampleDirectClientUsage },
    { name: 'Error Handling & Fallbacks', fn: exampleErrorHandling }
  ];

  const results = [];

  for (const example of examples) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Running: ${example.name}`);
    console.log('='.repeat(50));

    try {
      const startTime = Date.now();
      const result = await example.fn();
      const duration = Date.now() - startTime;

      console.log(`✅ ${example.name} completed in ${duration}ms`);
      results.push({ name: example.name, success: true, duration, result });

    } catch (error) {
      console.error(`❌ ${example.name} failed:`, error);
      results.push({
        name: example.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('EXAMPLE RESULTS SUMMARY');
  console.log('='.repeat(50));

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = result.success ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.name}${duration}`);
  });

  console.log('\n🎉 All examples completed!');
  return results;
}

// Export individual examples for selective testing
export {
  exampleBasicPlanGeneration,
  exampleSpanishPlanGeneration,
  exampleDirectClientUsage,
  exampleConnectionTesting,
  exampleErrorHandling
};