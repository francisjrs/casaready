import { z } from 'zod';

// Risk tolerance levels
export const RiskToleranceSchema = z.enum(['low', 'moderate', 'high'], {
  message: 'Risk tolerance must be low, moderate, or high'
});

// Timeframe options
export const TimeframeSchema = z.enum(['immediate', '3-months', '6-months', '12-months', '2-years', '5-years'], {
  message: 'Timeframe must be a valid period'
});

// Budget breakdown schema
export const BudgetBreakdownSchema = z.object({
  downPayment: z.number({ message: 'Down payment must be a number' }).min(0),
  monthlyPayment: z.number({ message: 'Monthly payment must be a number' }).min(0),
  closingCosts: z.number({ message: 'Closing costs must be a number' }).min(0),
  emergencyFund: z.number({ message: 'Emergency fund must be a number' }).min(0),
  totalRequired: z.number({ message: 'Total required must be a number' }).min(0)
});

// Affordability estimate schema
export const AffordabilityEstimateSchema = z.object({
  maxHomePrice: z.number({ message: 'Max home price must be a number' }).min(0),
  recommendedPrice: z.number({ message: 'Recommended price must be a number' }).min(0),
  budgetBreakdown: BudgetBreakdownSchema,
  riskAssessment: z.object({
    riskLevel: RiskToleranceSchema,
    factors: z.array(z.string()).min(1, { message: 'At least one risk factor required' }),
    recommendation: z.string({ message: 'Risk recommendation required' }).min(10)
  }),
  timeframe: TimeframeSchema,
  assumptions: z.array(z.string()).min(1, { message: 'At least one assumption required' }),
  confidence: z.number({ message: 'Confidence must be a number' }).min(0).max(1)
});

// Program types
export const ProgramTypeSchema = z.enum([
  'fha', 'va', 'usda', 'conventional', 'jumbo', 'first-time-buyer', 'down-payment-assistance'
], {
  message: 'Program type must be a valid mortgage program'
});

// Cost/benefit analysis
export const CostBenefitSchema = z.object({
  upfrontCosts: z.number({ message: 'Upfront costs must be a number' }).min(0),
  monthlySavings: z.number({ message: 'Monthly savings must be a number' }),
  longTermValue: z.number({ message: 'Long term value must be a number' }),
  breakEvenMonths: z.number({ message: 'Break even months must be a number' }).min(0),
  netBenefit: z.number({ message: 'Net benefit must be a number' })
});

// Program recommendation schema
export const ProgramRecommendationSchema = z.object({
  programType: ProgramTypeSchema,
  name: z.string({ message: 'Program name required' }).min(1),
  description: z.string({ message: 'Program description required' }).min(10),
  eligibilityScore: z.number({ message: 'Eligibility score must be a number' }).min(0).max(1),
  requirements: z.array(z.string()).min(1, { message: 'At least one requirement needed' }),
  benefits: z.array(z.string()).min(1, { message: 'At least one benefit needed' }),
  costBenefit: CostBenefitSchema,
  applicationSteps: z.array(z.string()).min(1, { message: 'At least one application step needed' }),
  estimatedTimeline: z.string({ message: 'Estimated timeline required' }).min(1),
  priority: z.enum(['high', 'medium', 'low'], { message: 'Priority must be high, medium, or low' })
});

// Success criteria
export const SuccessCriteriaSchema = z.object({
  metric: z.string({ message: 'Success metric required' }).min(1),
  target: z.string({ message: 'Success target required' }).min(1),
  timeframe: z.string({ message: 'Success timeframe required' }).min(1),
  measurable: z.boolean({ message: 'Measurable flag required' })
});

// Action step schema
export const ActionStepSchema = z.object({
  id: z.string({ message: 'Action step ID required' }).min(1),
  title: z.string({ message: 'Action step title required' }).min(1),
  description: z.string({ message: 'Action step description required' }).min(10),
  category: z.enum(['preparation', 'application', 'documentation', 'financial', 'search', 'closing'], {
    message: 'Category must be a valid action category'
  }),
  priority: z.enum(['critical', 'high', 'medium', 'low'], {
    message: 'Priority must be critical, high, medium, or low'
  }),
  estimatedTime: z.string({ message: 'Estimated time required' }).min(1),
  dependencies: z.array(z.string()),
  resources: z.array(z.string()),
  successCriteria: z.array(SuccessCriteriaSchema).min(1, { message: 'At least one success criteria required' }),
  dueDate: z.string({ message: 'Due date required' }).min(1),
  completed: z.boolean({ message: 'Completed status required' }).default(false)
});

// Complete action plan schema
export const ActionPlanSchema = z.object({
  overview: z.string({ message: 'Action plan overview required' }).min(20),
  totalSteps: z.number({ message: 'Total steps must be a number' }).min(1),
  estimatedDuration: z.string({ message: 'Estimated duration required' }).min(1),
  phases: z.array(z.object({
    name: z.string({ message: 'Phase name required' }).min(1),
    description: z.string({ message: 'Phase description required' }).min(10),
    steps: z.array(ActionStepSchema).min(1, { message: 'At least one step per phase required' })
  })).min(1, { message: 'At least one phase required' }),
  criticalPath: z.array(z.string()).min(1, { message: 'Critical path must have at least one step' }),
  riskMitigation: z.array(z.object({
    risk: z.string({ message: 'Risk description required' }).min(1),
    impact: z.enum(['low', 'medium', 'high'], { message: 'Impact must be low, medium, or high' }),
    mitigation: z.string({ message: 'Mitigation strategy required' }).min(10)
  }))
});

// Complete personalized plan schema
export const PersonalizedPlanSchema = z.object({
  id: z.string({ message: 'Plan ID required' }).min(1),
  userId: z.string({ message: 'User ID required' }).min(1),
  generatedAt: z.string({ message: 'Generation timestamp required' }).min(1),
  language: z.enum(['en', 'es'], { message: 'Language must be en or es' }),

  // Core plan components
  affordabilityEstimate: AffordabilityEstimateSchema,
  programRecommendations: z.array(ProgramRecommendationSchema)
    .min(1, { message: 'At least one program recommendation required' })
    .max(5, { message: 'Maximum 5 program recommendations allowed' }),
  actionPlan: ActionPlanSchema,

  // Metadata
  confidence: z.number({ message: 'Overall confidence must be a number' }).min(0).max(1),
  lastUpdated: z.string({ message: 'Last updated timestamp required' }).min(1),
  version: z.string({ message: 'Plan version required' }).min(1),

  // Validation flags
  isValid: z.boolean({ message: 'Validity flag required' }).default(true),
  validationErrors: z.array(z.string()).default([])
});

// Input data schema for plan generation
export const PlanGenerationInputSchema = z.object({
  // User profile data
  userProfile: z.object({
    incomeDebt: z.object({
      annualIncome: z.number().min(0),
      monthlyDebts: z.number().min(0),
      downPaymentAmount: z.number().min(0),
      creditScore: z.string(),
      additionalIncome: z.number().min(0).optional(),
      assets: z.number().min(0).optional()
    }),
    employment: z.object({
      employmentStatus: z.string(),
      employerName: z.string(),
      jobTitle: z.string(),
      yearsAtJob: z.number().min(0),
      employerPhone: z.string(),
      workAddress: z.string()
    }),
    location: z.object({
      preferredState: z.string(),
      preferredCity: z.string(),
      preferredZipCode: z.string(),
      maxBudget: z.number().min(0),
      minBedrooms: z.number().min(1),
      minBathrooms: z.number().min(1),
      homeType: z.string(),
      timeframe: z.string(),
      firstTimeBuyer: z.boolean()
    }),
    contact: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      dateOfBirth: z.string(),
      maritalStatus: z.string()
    }),
    locationPriorities: z.array(z.string()).optional(),
    buyerTypes: z.array(z.string()).optional()
  }),

  // Generation preferences
  preferences: z.object({
    language: z.enum(['en', 'es']).default('en'),
    riskTolerance: RiskToleranceSchema.optional(),
    focusAreas: z.array(z.string()).default([]),
    excludePrograms: z.array(ProgramTypeSchema).default([]),

    // Explicit buyer specialization flags (replaces biased inference)
    buyerSpecialization: z.object({
      isITINTaxpayer: z.boolean().default(false),
      isMilitaryVeteran: z.boolean().default(false),
      isUSDAEligible: z.boolean().default(false),
      isFirstTimeBuyer: z.boolean().default(false),
      isInvestor: z.boolean().default(false),
      needsAccessibilityFeatures: z.boolean().default(false),
      rawBuyerTypes: z.array(z.string()).optional(),
      rawLocationPriorities: z.array(z.string()).optional()
    }).optional()
  }).default({
    language: 'en',
    focusAreas: [],
    excludePrograms: []
  })
});

// Privacy-safe input schema for plan generation (excludes contact information)
export const PrivacySafePlanGenerationInputSchema = z.object({
  // User profile data (without contact information)
  userProfile: z.object({
    incomeDebt: z.object({
      annualIncome: z.number().min(0),
      monthlyDebts: z.number().min(0),
      downPaymentAmount: z.number().min(0),
      creditScore: z.string(),
      additionalIncome: z.number().min(0).optional(),
      assets: z.number().min(0).optional()
    }),
    employment: z.object({
      employmentStatus: z.string(),
      employerName: z.string(),
      jobTitle: z.string(),
      yearsAtJob: z.number().min(0),
      employerPhone: z.string(),
      workAddress: z.string()
    }),
    location: z.object({
      preferredState: z.string(),
      preferredCity: z.string(),
      preferredZipCode: z.string(),
      maxBudget: z.number().min(0),
      minBedrooms: z.number().min(1),
      minBathrooms: z.number().min(1),
      homeType: z.string(),
      timeframe: z.string(),
      firstTimeBuyer: z.boolean()
    })
    // Note: contact information is intentionally excluded for privacy
  }),

  // Generation preferences
  preferences: z.object({
    language: z.enum(['en', 'es']).default('en'),
    riskTolerance: RiskToleranceSchema.optional(),
    focusAreas: z.array(z.string()).default([]),
    excludePrograms: z.array(ProgramTypeSchema).default([]),

    // Explicit buyer specialization flags (replaces biased inference)
    buyerSpecialization: z.object({
      isITINTaxpayer: z.boolean().default(false),
      isMilitaryVeteran: z.boolean().default(false),
      isUSDAEligible: z.boolean().default(false),
      isFirstTimeBuyer: z.boolean().default(false),
      isInvestor: z.boolean().default(false),
      needsAccessibilityFeatures: z.boolean().default(false),
      rawBuyerTypes: z.array(z.string()).optional(),
      rawLocationPriorities: z.array(z.string()).optional()
    }).optional()
  }).default({
    language: 'en',
    focusAreas: [],
    excludePrograms: []
  })
});

// Export all types
export type RiskTolerance = z.infer<typeof RiskToleranceSchema>;
export type Timeframe = z.infer<typeof TimeframeSchema>;
export type BudgetBreakdown = z.infer<typeof BudgetBreakdownSchema>;
export type AffordabilityEstimate = z.infer<typeof AffordabilityEstimateSchema>;
export type ProgramType = z.infer<typeof ProgramTypeSchema>;
export type CostBenefit = z.infer<typeof CostBenefitSchema>;
export type ProgramRecommendation = z.infer<typeof ProgramRecommendationSchema>;
export type SuccessCriteria = z.infer<typeof SuccessCriteriaSchema>;
export type ActionStep = z.infer<typeof ActionStepSchema>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
export type PersonalizedPlan = z.infer<typeof PersonalizedPlanSchema>;
export type PlanGenerationInput = z.infer<typeof PlanGenerationInputSchema>;
export type PrivacySafePlanGenerationInput = z.infer<typeof PrivacySafePlanGenerationInputSchema>;