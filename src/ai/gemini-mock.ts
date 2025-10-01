/**
 * Mock implementation of Google Generative AI for development/testing
 * Replace this with the real implementation when @google/generative-ai is available
 */

// Mock types that match the real Gemini API
export enum HarmCategory {
  HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT'
}

export enum HarmBlockThreshold {
  BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
  BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
  BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
  BLOCK_NONE = 'BLOCK_NONE'
}

export interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  responseMimeType?: string;
}

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

export interface ModelParams {
  model: string;
  generationConfig?: GenerationConfig;
  safetySettings?: SafetySetting[];
}

export interface GenerateContentResult {
  response: {
    text(): string;
  };
}

export class GenerativeModel {
  constructor(private params: ModelParams) {}

  async generateContent(prompt: string): Promise<GenerateContentResult> {
    // Mock implementation - in real usage this would call Gemini API
    console.log('Mock Gemini API called with prompt length:', prompt.length);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock structured JSON response
    const mockResponse = {
      id: `mock-plan-${Date.now()}`,
      userId: 'mock-user',
      generatedAt: new Date().toISOString(),
      language: 'en',
      affordabilityEstimate: {
        maxHomePrice: 450000,
        recommendedPrice: 400000,
        budgetBreakdown: {
          downPayment: 80000,
          monthlyPayment: 2200,
          closingCosts: 13500,
          emergencyFund: 15000,
          totalRequired: 108500
        },
        riskAssessment: {
          riskLevel: 'moderate',
          factors: ['Debt-to-income ratio within acceptable range', 'Stable employment history'],
          recommendation: 'Your financial profile shows moderate risk with good potential for mortgage approval.'
        },
        timeframe: '6-months',
        assumptions: ['Current interest rates around 7%', 'Stable employment continues'],
        confidence: 0.85
      },
      programRecommendations: [
        {
          programType: 'conventional',
          name: 'Conventional 30-Year Fixed',
          description: 'Standard mortgage with competitive rates and flexible terms.',
          eligibilityScore: 0.9,
          requirements: ['20% down payment', 'Credit score 620+', 'Debt-to-income ratio <43%'],
          benefits: ['No mortgage insurance with 20% down', 'Competitive interest rates', 'Flexible property types'],
          costBenefit: {
            upfrontCosts: 13500,
            monthlySavings: 0,
            longTermValue: 50000,
            breakEvenMonths: 0,
            netBenefit: 50000
          },
          applicationSteps: ['Get pre-approved', 'Submit full application', 'Complete underwriting'],
          estimatedTimeline: '30-45 days',
          priority: 'high'
        }
      ],
      actionPlan: {
        overview: 'Comprehensive home buying plan focusing on preparation and execution.',
        totalSteps: 8,
        estimatedDuration: '90-120 days',
        phases: [
          {
            name: 'Financial Preparation',
            description: 'Prepare your finances and documentation for the mortgage application.',
            steps: [
              {
                id: 'prep-credit',
                title: 'Review and Optimize Credit Score',
                description: 'Obtain credit reports and address any issues before applying.',
                category: 'preparation',
                priority: 'high',
                estimatedTime: '2-4 weeks',
                dependencies: [],
                resources: ['Credit monitoring service', 'Credit counselor if needed'],
                successCriteria: [
                  {
                    metric: 'Credit Score',
                    target: '700+',
                    timeframe: '30 days',
                    measurable: true
                  }
                ],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                completed: false
              }
            ]
          }
        ],
        criticalPath: ['prep-credit'],
        riskMitigation: [
          {
            risk: 'Interest rate increases',
            impact: 'medium',
            mitigation: 'Get pre-approved quickly and consider rate lock options.'
          }
        ]
      },
      confidence: 0.85,
      lastUpdated: new Date().toISOString(),
      version: '1.0-mock',
      isValid: true,
      validationErrors: []
    };

    return {
      response: {
        text: () => JSON.stringify(mockResponse)
      }
    };
  }
}

export class GoogleGenerativeAI {
  constructor(private apiKey: string) {
    if (!apiKey || apiKey === 'fallback') {
      console.warn('Using mock Gemini implementation - set GEMINI_API_KEY for real API access');
    }
  }

  getGenerativeModel(params: ModelParams): GenerativeModel {
    return new GenerativeModel(params);
  }
}