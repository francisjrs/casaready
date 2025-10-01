/**
 * Lead Capture API Endpoint
 *
 * Handles lead submissions from forms and forwards to Zapier webhook
 * with proper validation, rate limiting, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitLead, type LeadData } from '@/integrations/zapier-client';
import { env } from '@/lib/env';

// Vercel serverless configuration
export const runtime = 'nodejs'
export const maxDuration = 10 // Lead submission is fast
export const dynamic = 'force-dynamic'

// =============================================================================
// Request Validation Schema
// =============================================================================

const leadSubmissionSchema = z.object({
  // Required fields
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),

  // Optional financial information
  annualIncome: z.number().positive().optional(),
  downPaymentAmount: z.number().min(0).optional(),
  creditScore: z.string().optional(),
  monthlyDebts: z.number().min(0).optional(),

  // Optional location preferences
  preferredState: z.string().max(2).optional(),
  preferredCity: z.string().max(100).optional(),
  preferredZipCode: z.string().max(10).optional(),
  maxBudget: z.number().positive().optional(),
  homeType: z.string().optional(),
  timeframe: z.string().optional(),
  firstTimeBuyer: z.boolean().optional(),

  // Optional employment information
  employmentStatus: z.string().optional(),
  employerName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),

  // Optional metadata
  source: z.string().max(50).optional(),
  campaign: z.string().max(50).optional(),
  language: z.enum(['en', 'es']).default('en'),
  page: z.string().max(50).optional(),
});

type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

// =============================================================================
// Rate Limiting (Simple in-memory store)
// =============================================================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 submissions per 15 minutes per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = ip;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First request or window expired
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

// =============================================================================
// API Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many submissions. Please try again later.',
          rateLimitReset: new Date(rateLimit.resetTime).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = leadSubmissionSchema.parse(body);

    // Add source information
    const leadData: LeadData = {
      ...validatedData,
      source: validatedData.source || 'CasaReady App',
      page: validatedData.page || 'Hero Form'
    };

    // Submit to Zapier
    const result = await submitLead(leadData);

    if (!result.success) {
      console.error('Lead submission failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          error: 'Submission failed',
          message: 'There was an error processing your request. Please try again.'
        },
        { status: 500 }
      );
    }

    // Log successful submission (without sensitive data)
    console.log('✅ Lead submitted successfully:', {
      email: leadData.email,
      source: leadData.source,
      page: leadData.page,
      timestamp: new Date().toISOString(),
      ip: ip
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your information has been submitted successfully.',
        data: {
          submissionId: `lead_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    );

  } catch (error) {
    console.error('API error in lead submission:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Please check your information and try again.',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Request data is not valid JSON.'
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Health Check Handler
// =============================================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Lead capture API is operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
}