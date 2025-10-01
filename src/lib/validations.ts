import { z } from 'zod';
import { Locale } from './i18n';

// Validation error messages in both languages
export const validationMessages = {
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must be no more than ${max} characters`,
    min: (min: number) => `Must be at least ${min}`,
    max: (max: number) => `Must be no more than ${max}`,
    invalidNumber: 'Please enter a valid number',
    invalidDate: 'Please enter a valid date',
    invalidZip: 'Please enter a valid ZIP code',
    invalidSSN: 'Please enter a valid SSN (XXX-XX-XXXX)',
    tooYoung: 'Must be at least 18 years old',
    futureDate: 'Date cannot be in the future'
  },
  es: {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingrese un correo electrónico válido',
    phone: 'Por favor ingrese un número de teléfono válido',
    minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
    maxLength: (max: number) => `No debe tener más de ${max} caracteres`,
    min: (min: number) => `Debe ser al menos ${min}`,
    max: (max: number) => `No debe ser más de ${max}`,
    invalidNumber: 'Por favor ingrese un número válido',
    invalidDate: 'Por favor ingrese una fecha válida',
    invalidZip: 'Por favor ingrese un código postal válido',
    invalidSSN: 'Por favor ingrese un SSN válido (XXX-XX-XXXX)',
    tooYoung: 'Debe tener al menos 18 años',
    futureDate: 'La fecha no puede estar en el futuro'
  }
};

// Helper function to get localized error message
export const getErrorMessage = (
  locale: Locale,
  key: keyof typeof validationMessages.en,
  ...args: Array<string | number>
) => {
  const message = validationMessages[locale][key];
  return typeof message === 'function' ? message(...args) : message;
};

// Custom validation schemas
export const createValidationSchemas = (locale: Locale = 'en') => {
  const msg = (key: keyof typeof validationMessages.en, ...args: Array<string | number>) =>
    getErrorMessage(locale, key, ...args);

  // Phone number validation
  const phoneRegex = /^(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

  // ZIP code validation (US and basic international)
  const zipRegex = /^(\d{5}(-\d{4})?|[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d)$/;

  // SSN validation
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

  // Step 1: Personal Information
  const personalInfoSchema = z.object({
    firstName: z
      .string()
      .min(1, msg('required'))
      .min(2, msg('minLength', 2))
      .max(50, msg('maxLength', 50)),

    lastName: z
      .string()
      .min(1, msg('required'))
      .min(2, msg('minLength', 2))
      .max(50, msg('maxLength', 50)),

    email: z
      .string()
      .min(1, msg('required'))
      .email(msg('email')),

    phone: z
      .string()
      .min(1, msg('required'))
      .regex(phoneRegex, msg('phone')),

    dateOfBirth: z
      .string()
      .min(1, msg('required'))
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18;
      }, msg('tooYoung')),

    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated'], {
      message: msg('required')
    }),

    ssn: z
      .string()
      .optional()
      .refine((ssn) => !ssn || ssnRegex.test(ssn), msg('invalidSSN'))
  });

  // Step 1: Income & Debt Information
  const incomeDebtSchema = z.object({
    annualIncome: z
      .number({ message: msg('invalidNumber') })
      .min(1, { message: msg('required') })
      .min(10000, { message: msg('min', 10000) })
      .max(10000000, { message: msg('max', 10000000) }),

    monthlyDebts: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .max(50000, { message: msg('max', 50000) }),

    downPaymentAmount: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .max(2000000, { message: msg('max', 2000000) }),

    creditScore: z.enum(['300-579', '580-669', '670-739', '740-799', '800-850', 'unknown'], {
      message: msg('required')
    }),

    additionalIncome: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .optional(),

    assets: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .optional()
  });

  // Step 2: Employment Information
  const employmentInfoSchema = z.object({
    employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired', 'student'], {
      message: msg('required')
    }),

    employerName: z
      .string()
      .min(1, msg('required'))
      .max(100, msg('maxLength', 100)),

    jobTitle: z
      .string()
      .min(1, msg('required'))
      .max(100, msg('maxLength', 100)),

    yearsAtJob: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .max(50, { message: msg('max', 50) }),

    employerPhone: z
      .string()
      .min(1, msg('required'))
      .regex(phoneRegex, msg('phone')),

    workAddress: z
      .string()
      .min(1, msg('required'))
      .max(200, msg('maxLength', 200)),

    previousEmployer: z
      .string()
      .max(100, msg('maxLength', 100))
      .optional(),

    yearsAtPreviousJob: z
      .number({ message: msg('invalidNumber') })
      .min(0, { message: msg('min', 0) })
      .max(50, { message: msg('max', 50) })
      .optional()
  });

  // Step 3: Location Preferences
  const locationPreferencesSchema = z.object({
    preferredState: z
      .string()
      .min(1, msg('required')),

    preferredCity: z
      .string()
      .min(1, msg('required'))
      .max(100, msg('maxLength', 100)),

    preferredZipCode: z
      .string()
      .min(1, msg('required'))
      .regex(zipRegex, msg('invalidZip')),

    maxBudget: z
      .number({ message: msg('invalidNumber') })
      .min(50000, { message: msg('min', 50000) })
      .max(10000000, { message: msg('max', 10000000) }),

    minBedrooms: z
      .number({ message: msg('invalidNumber') })
      .min(1, { message: msg('min', 1) })
      .max(10, { message: msg('max', 10) }),

    minBathrooms: z
      .number({ message: msg('invalidNumber') })
      .min(1, { message: msg('min', 1) })
      .max(10, { message: msg('max', 10) }),

    homeType: z.enum(['house', 'condo', 'townhouse', 'apartment', 'any'], {
      message: msg('required')
    }),

    timeframe: z.enum(['immediate', '3-months', '6-months', '12-months', 'exploring'], {
      message: msg('required')
    }),

    firstTimeBuyer: z.boolean(),

    workingWithAgent: z.boolean(),

    agentName: z
      .string()
      .max(100, msg('maxLength', 100))
      .optional(),

    additionalNotes: z
      .string()
      .max(1000, msg('maxLength', 1000))
      .optional()
  });

  // Step 4: Contact Information
  const contactInfoSchema = z.object({
    firstName: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .min(1, msg('required'))
      .min(2, msg('minLength', 2))
      .max(50, msg('maxLength', 50)),

    lastName: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .min(1, msg('required'))
      .min(2, msg('minLength', 2))
      .max(50, msg('maxLength', 50)),

    email: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .min(1, msg('required'))
      .email(msg('email')),

    phone: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .min(1, msg('required'))
      .regex(phoneRegex, msg('phone')),

    dateOfBirth: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .min(1, msg('required'))
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18;
      }, msg('tooYoung')),

    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated'], {
      message: msg('required')
    }),

    ssn: z
      .string()
      .optional()
      .refine((ssn) => !ssn || ssnRegex.test(ssn), msg('invalidSSN'))
  });

  const locationPriorities = [
    'School district quality',
    'Commute to work',
    'Family/friends nearby',
    'Neighborhood amenities',
    'Investment potential',
    'Safety/low crime'
  ] as const;

  const buyerTypes = [
    'First-time homebuyer',
    'Military veteran or active duty',
    'Move-up buyer (selling current home)',
    'Investment property buyer',
    'ITIN holder (no SSN)',
    'Healthcare professional',
    'Teacher/educator',
    'Government employee'
  ] as const;

  const locationStepSchema = z.object({
    city: z
      .string({
        error: (issue) => issue.input === undefined ? msg('required') : msg('invalidString')
      })
      .trim()
      .min(1, msg('required'))
      .max(100, msg('maxLength', 100)),
    zipCode: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || zipRegex.test(value), msg('invalidZip')),
    locationPriority: z
      .array(z.enum(locationPriorities))
      .max(locationPriorities.length)
      .optional()
      .default([])
  });

  const timelineStepSchema = z.object({
    timeline: z.enum(['0-3', '3-6', '6-12', '12+'], { message: msg('required') })
  });

  const budgetStepSchema = z
    .object({
      budgetType: z.enum(['price', 'monthly'], { message: msg('required') }),
      targetPrice: z
        .number({
          error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
        })
        .positive(msg('min', 1))
        .max(20000000, msg('max', 20000000))
        .optional(),
      monthlyBudget: z
        .number({
          error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
        })
        .positive(msg('min', 1))
        .max(100000, msg('max', 100000))
        .optional()
    })
    .superRefine((data, ctx) => {
      if (data.budgetType === 'price') {
        if (data.targetPrice === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetPrice'], message: msg('required') });
        }
      } else if (data.monthlyBudget === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyBudget'], message: msg('required') });
      }
    });

  const incomeStepSchema = z.object({
    annualIncome: z
      .number({
        error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
      })
      .min(10000, msg('min', 10000))
      .max(10000000, msg('max', 10000000))
  });

  const debtsStepSchema = z.object({
    monthlyDebts: z
      .number({
        error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
      })
      .min(0, msg('min', 0))
      .max(50000, msg('max', 50000))
      .optional(),
    creditScore: z
      .enum(['760+', '720-759', '680-719', '640-679', '<640', 'not-sure'], {
        message: msg('required')
      })
  });

  const downPaymentStepSchema = z
    .object({
      paymentType: z.enum(['amount', 'percent'], { message: msg('required') }),
      downPaymentAmount: z
        .number({
          error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
        })
        .min(0, msg('min', 0))
        .max(5000000, msg('max', 5000000))
        .optional(),
      downPaymentPercent: z
        .number({
          error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
        })
        .min(0, msg('min', 0))
        .max(100, msg('max', 100))
        .optional()
    })
    .superRefine((data, ctx) => {
      if (data.paymentType === 'amount') {
        if (data.downPaymentAmount === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['downPaymentAmount'], message: msg('required') });
        }
      } else if (data.downPaymentPercent === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['downPaymentPercent'], message: msg('required') });
      }
    });

  const employmentStepSchema = z.object({
    employmentType: z
      .enum(['w2', '1099', 'self-employed', 'mixed', 'retired', 'other'], { message: msg('required') })
  });

  const buyerProfileStepSchema = z
    .object({
      buyerType: z.array(z.enum(buyerTypes)).min(1, msg('required')),
      householdSize: z
        .number({
          error: (issue) => issue.code === "invalid_type" ? msg('invalidNumber') : "Invalid input"
        })
        .min(1, msg('min', 1))
        .max(10, msg('max', 10))
        .optional()
    })
    .refine((data) => {
      if (data.householdSize === undefined) return true;
      return Number.isInteger(data.householdSize);
    }, {
      message: msg('invalidNumber'),
      path: ['householdSize']
    });

  const contactStepSchema = contactInfoSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true
  });

  const wizardStepSchemas = {
    location: locationStepSchema,
    timeline: timelineStepSchema,
    budget: budgetStepSchema,
    income: incomeStepSchema,
    debts: debtsStepSchema,
    downPayment: downPaymentStepSchema,
    employment: employmentStepSchema,
    buyerProfile: buyerProfileStepSchema,
    contact: contactStepSchema
  } as const;

  return {
    personalInfoSchema,
    incomeDebtSchema,
    employmentInfoSchema,
    locationPreferencesSchema,
    contactInfoSchema,
    locationStepSchema,
    timelineStepSchema,
    budgetStepSchema,
    incomeStepSchema,
    debtsStepSchema,
    downPaymentStepSchema,
    employmentStepSchema,
    buyerProfileStepSchema,
    contactStepSchema,
    wizardStepSchemas
  };
};

// Combined form data type
export type IncomeDebtInfo = z.infer<ReturnType<typeof createValidationSchemas>['incomeDebtSchema']>;
export type EmploymentInfo = z.infer<ReturnType<typeof createValidationSchemas>['employmentInfoSchema']>;
export type LocationPreferences = z.infer<ReturnType<typeof createValidationSchemas>['locationPreferencesSchema']>;
export type ContactInfo = z.infer<ReturnType<typeof createValidationSchemas>['contactInfoSchema']>;

export interface FormData {
  incomeDebt: Partial<IncomeDebtInfo>;
  employment: Partial<EmploymentInfo>;
  location: Partial<LocationPreferences>;
  contact: Partial<ContactInfo>;
}

// Legacy types for backward compatibility
export type PersonalInfo = ContactInfo;
export type FinancialInfo = IncomeDebtInfo;

type WizardSchemas = ReturnType<typeof createValidationSchemas>;
type WizardStepSchemaMap = WizardSchemas['wizardStepSchemas'];

export type WizardStepId = keyof WizardStepSchemaMap;

export type WizardStepDataMap = {
  [Key in WizardStepId]: z.infer<WizardStepSchemaMap[Key]>;
};

export type LocationStepData = WizardStepDataMap['location'];
export type TimelineStepData = WizardStepDataMap['timeline'];
export type BudgetStepData = WizardStepDataMap['budget'];
export type IncomeStepData = WizardStepDataMap['income'];
export type DebtsStepData = WizardStepDataMap['debts'];
export type DownPaymentStepData = WizardStepDataMap['downPayment'];
export type EmploymentStepData = WizardStepDataMap['employment'];
export type BuyerProfileStepData = WizardStepDataMap['buyerProfile'];
export type ContactStepData = WizardStepDataMap['contact'];

export type WizardFormData = LocationStepData &
  TimelineStepData &
  BudgetStepData &
  IncomeStepData &
  DebtsStepData &
  Omit<DownPaymentStepData, 'paymentType'> &
  EmploymentStepData &
  BuyerProfileStepData;

export type StepValidationResult<TData> =
  | { success: true; data: TData }
  | { success: false; errors: Record<string, string> };

export function validateWizardStep<TStep extends WizardStepId>(
  stepId: TStep,
  data: unknown,
  locale: Locale = 'en'
): StepValidationResult<WizardStepDataMap[TStep]> {
  const schemas = createValidationSchemas(locale);
  const schema = schemas.wizardStepSchemas[stepId];
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  const flattened = result.error.flatten().fieldErrors;
  for (const [field, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      fieldErrors[field] = messages[0];
    }
  }

  if (!Object.keys(fieldErrors).length) {
    fieldErrors._ = result.error.message;
  }

  return { success: false, errors: fieldErrors };
}

// Form steps configuration - Updated 4-step structure
export const FORM_STEPS = [
  {
    id: 'income-debt',
    title: { en: 'Income & Debt', es: 'Ingresos y Deudas' },
    description: { en: 'Your financial situation', es: 'Tu situación financiera' }
  },
  {
    id: 'employment',
    title: { en: 'Employment', es: 'Empleo' },
    description: { en: 'Work and employment details', es: 'Detalles de trabajo y empleo' }
  },
  {
    id: 'location',
    title: { en: 'Location', es: 'Ubicación' },
    description: { en: 'Property preferences', es: 'Preferencias de propiedad' }
  },
  {
    id: 'contact',
    title: { en: 'Contact', es: 'Contacto' },
    description: { en: 'Personal information', es: 'Información personal' }
  }
] as const;
