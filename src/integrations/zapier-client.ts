/**
 * Zapier Webhook Integration Client
 *
 * Handles lead capture and CRM integration via Zapier webhooks
 * following KW Command webhook format and best practices.
 */

import { env, getRealtorInfo } from '@/lib/env';

// =============================================================================
// Types and Interfaces
// =============================================================================

/**
 * KW Command Lead Data Structure
 * Based on the webhook format: https://hooks.zapier.com/hooks/catch/22573164/uhkxqwx/
 */
export interface ZapierLeadData {
  // Required Fields
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // Address Fields
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  // Metadata
  notes?: string;
  tags?: string;
  description?: string;
}

/**
 * Internal Lead Data (from form submissions)
 */
export interface LeadData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Financial Information (optional)
  annualIncome?: number;
  downPaymentAmount?: number;
  creditScore?: string;
  monthlyDebts?: number;

  // Location Preferences (optional)
  preferredState?: string;
  preferredCity?: string;
  preferredZipCode?: string;
  maxBudget?: number;
  homeType?: string;
  timeframe?: string;
  firstTimeBuyer?: boolean;

  // Employment Information (optional)
  employmentStatus?: string;
  employerName?: string;
  jobTitle?: string;

  // Source Information
  source?: string;
  campaign?: string;
  language?: 'en' | 'es';
  page?: string;
}

/**
 * Webhook Response
 */
export interface ZapierResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// =============================================================================
// Zapier Client Class
// =============================================================================

export class ZapierClient {
  private webhookUrl: string;
  private realtorInfo: ReturnType<typeof getRealtorInfo>;

  constructor() {
    this.webhookUrl = env.ZAPIER_WEBHOOK_URL || '';
    this.realtorInfo = getRealtorInfo();

    if (!this.webhookUrl) {
      console.warn('⚠️  Zapier webhook URL not configured. Lead capture will be logged only.');
    }
  }

  /**
   * Submit lead to Zapier webhook
   */
  async submitLead(leadData: LeadData): Promise<ZapierResponse> {
    try {
      // Convert internal lead data to Zapier format
      const zapierData = this.transformLeadData(leadData);

      // Log the submission (for debugging)
      console.log('📤 Submitting lead to Zapier:', {
        email: zapierData.email,
        source: leadData.source || 'CasaReady App',
        timestamp: new Date().toISOString()
      });

      // If no webhook URL configured, just log and return success
      if (!this.webhookUrl) {
        console.log('💾 Lead logged (Zapier not configured):', zapierData);
        return {
          success: true,
          message: 'Lead logged successfully (webhook not configured)'
        };
      }

      // Submit to Zapier webhook
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CasaReady/1.0'
        },
        body: JSON.stringify(zapierData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json().catch(() => ({}));

      console.log('✅ Lead submitted successfully to Zapier');

      return {
        success: true,
        message: 'Lead submitted successfully',
        data: responseData
      };

    } catch (error) {
      console.error('❌ Error submitting lead to Zapier:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to submit lead'
      };
    }
  }

  /**
   * Transform internal lead data to Zapier webhook format
   */
  private transformLeadData(leadData: LeadData): ZapierLeadData {
    // Build notes section with all additional information
    const notes = this.buildNotesSection(leadData);

    // Build tags for categorization
    const tags = this.buildTags(leadData);

    // Build description for source tracking
    const description = this.buildDescription(leadData);

    return {
      // Required fields
      first_name: leadData.firstName,
      last_name: leadData.lastName,
      email: leadData.email,
      phone: this.formatPhoneNumber(leadData.phone),

      // Address from preferences or realtor location
      address1: this.realtorInfo.address || '',
      city: leadData.preferredCity || 'Austin',
      state: leadData.preferredState || 'TX',
      zip: leadData.preferredZipCode || '',
      country: 'US',

      // Metadata
      notes,
      tags,
      description
    };
  }

  /**
   * Build comprehensive notes section
   */
  private buildNotesSection(leadData: LeadData): string {
    const notes: string[] = [];

    // Financial Information
    if (leadData.annualIncome) {
      notes.push(`Annual Income: $${leadData.annualIncome.toLocaleString()}`);
    }

    if (leadData.downPaymentAmount) {
      notes.push(`Down Payment Available: $${leadData.downPaymentAmount.toLocaleString()}`);
    }

    if (leadData.creditScore) {
      notes.push(`Credit Score Range: ${leadData.creditScore}`);
    }

    if (leadData.monthlyDebts) {
      notes.push(`Monthly Debts: $${leadData.monthlyDebts.toLocaleString()}`);
    }

    // Home Preferences
    if (leadData.maxBudget) {
      notes.push(`Max Budget: $${leadData.maxBudget.toLocaleString()}`);
    }

    if (leadData.homeType) {
      notes.push(`Home Type: ${leadData.homeType}`);
    }

    if (leadData.timeframe) {
      notes.push(`Timeline: ${leadData.timeframe}`);
    }

    if (leadData.firstTimeBuyer) {
      notes.push('First-time homebuyer');
    }

    // Employment
    if (leadData.employmentStatus) {
      notes.push(`Employment: ${leadData.employmentStatus}`);
    }

    if (leadData.employerName) {
      notes.push(`Employer: ${leadData.employerName}`);
    }

    // Language preference
    if (leadData.language === 'es') {
      notes.push('Prefers Spanish communication');
    }

    // AI assistance note
    notes.push('Requested AI-powered home buying guidance');

    // Realtor contact info
    if (this.realtorInfo.name) {
      notes.push(`Assigned Realtor: ${this.realtorInfo.name}`);
    }

    return notes.join(' • ');
  }

  /**
   * Build tags for lead categorization
   */
  private buildTags(leadData: LeadData): string {
    const tags: string[] = [];

    // Source tags
    tags.push('CasaReady');

    if (leadData.source) {
      tags.push(leadData.source);
    }

    if (leadData.page) {
      tags.push(leadData.page);
    }

    // Demographic tags
    if (leadData.language === 'es') {
      tags.push('Spanish');
    }

    if (leadData.firstTimeBuyer) {
      tags.push('FirstTime');
    }

    // Financial tags
    if (leadData.annualIncome) {
      if (leadData.annualIncome >= 100000) {
        tags.push('HighIncome');
      } else if (leadData.annualIncome >= 50000) {
        tags.push('MidIncome');
      }
    }

    // Location tags
    if (leadData.preferredState) {
      tags.push(leadData.preferredState);
    }

    // Timeline tags
    if (leadData.timeframe) {
      if (leadData.timeframe.includes('immediate') || leadData.timeframe.includes('3-months')) {
        tags.push('Urgent');
      } else if (leadData.timeframe.includes('6-months')) {
        tags.push('Active');
      }
    }

    tags.push('LeadWizard');
    tags.push('AI');

    return tags.join(',');
  }

  /**
   * Build description for source tracking
   */
  private buildDescription(leadData: LeadData): string {
    const parts: string[] = [];

    // Source information
    if (leadData.source) {
      parts.push(`Source: ${leadData.source}`);
    } else {
      parts.push('Source: CasaReady App');
    }

    // Page information
    if (leadData.page) {
      parts.push(`Page: ${leadData.page}`);
    }

    // Campaign information
    if (leadData.campaign) {
      parts.push(`Campaign: ${leadData.campaign}`);
    } else {
      parts.push('Campaign: AI Home Buying Assistant');
    }

    return parts.join(' • ');
  }

  /**
   * Format phone number for consistency
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Add +1 country code if missing and it's a 10-digit US number
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // Return original if it doesn't match expected patterns
    return phone;
  }

  /**
   * Test webhook connection
   */
  async testConnection(): Promise<ZapierResponse> {
    const testData: LeadData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@casaready.com',
      phone: '(512) 555-0123',
      source: 'Connection Test',
      campaign: 'System Test',
      language: 'en'
    };

    return this.submitLead(testData);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const zapierClient = new ZapierClient();

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Submit a lead (convenience function)
 */
export async function submitLead(leadData: LeadData): Promise<ZapierResponse> {
  return zapierClient.submitLead(leadData);
}

/**
 * Test Zapier connection (convenience function)
 */
export async function testZapierConnection(): Promise<ZapierResponse> {
  return zapierClient.testConnection();
}