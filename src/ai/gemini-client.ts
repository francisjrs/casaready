// Updated Google GenAI implementation with gemini-2.5-flash model
import { GoogleGenAI } from '@google/genai';
import { PersonalizedPlanSchema, PlanGenerationInputSchema, type PersonalizedPlan, type PlanGenerationInput } from '@/validators/planning-schemas';

/**
 * Gemini API client for generating personalized home buying plans
 * Updated to use the newer @google/genai package with gemini-2.5-flash model
 *
 * References:
 * - Text generation: https://ai.google.dev/gemini-api/docs/text-generation
 * - Structured output: https://ai.google.dev/gemini-api/docs/structured-output
 * - Google Search grounding: https://ai.google.dev/gemini-api/docs/google-search
 */

// Configuration interface for the new GoogleGenAI client
interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

// Default configuration using gemini-2.5-pro model
const DEFAULT_CONFIG: Omit<GeminiConfig, 'apiKey'> = {
  model: 'gemini-2.5-pro', // Use Pro model for highest quality output
  temperature: 0.3, // Slightly higher for more natural, conversational language
  maxOutputTokens: 4000, // Increased for comprehensive but simple explanations
  topP: 0.95, // Higher topP for better quality responses
  topK: 40
};

// Structured output schema configuration
interface StructuredOutputConfig {
  useStructuredOutput: boolean;
  thinkingBudget?: number; // Thinking mode budget
}

const DEFAULT_STRUCTURED_CONFIG: StructuredOutputConfig = {
  useStructuredOutput: true, // Enable structured output by default
  thinkingBudget: 0, // Disable thinking for faster responses (no latency from thinking tokens)
};

// Performance optimization configuration
interface PerformanceConfig {
  enableCaching: boolean;
  cacheExpirationMs: number;
  requestTimeoutMs: number;
  maxConcurrentRequests: number;
  enableTokenMonitoring: boolean;
  enableConnectionPooling: boolean;
}

const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableCaching: true,
  cacheExpirationMs: 300000, // 5 minutes cache
  requestTimeoutMs: 600000, // 10 minutes timeout (recommended for Gemini 2.5 Pro)
  maxConcurrentRequests: 10,
  enableTokenMonitoring: true,
  enableConnectionPooling: true,
};

const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  enableTemplating: true,
  defaultTemplate: 'structured-v2',
  fallbackTemplate: 'structured-v1',
  enableVersioning: true,
  enableABTesting: false,
};

// Built-in prompt templates repository
const BUILT_IN_TEMPLATES: Record<string, PromptTemplate> = {
  'structured-v2': {
    id: 'structured-v2',
    name: 'Enhanced Structured Output Template v2',
    description: 'Advanced template with specialized buyer guidance and market context',
    language: 'en',
    type: 'structured',
    version: '2.0.0',
    template: `You are an expert mortgage advisor and home buying consultant with 15+ years of experience in the US real estate market. Generate a comprehensive, personalized home buying plan based on the user's financial profile and preferences.

{{#if specializedGuidance}}
**SPECIALIZED BUYER GUIDANCE:**
{{specializedGuidance}}

**CRITICAL:** Use this specialized context to provide targeted, specific advice for this buyer type. Address their unique requirements, documentation needs, and opportunities.
{{/if}}

**IMPORTANT GUIDELINES:**
1. All financial calculations must be realistic and based on current market conditions
2. Consider debt-to-income ratios, credit scores, and employment stability
3. Recommend only programs the user is likely to qualify for
4. Provide actionable, specific steps with realistic timelines
5. Include risk assessments and contingency planning
6. Focus on the user's stated preferences and constraints
7. Ensure all recommendations are financially responsible

**USER PROFILE:**
{{userProfileData}}

{{#if useGrounding}}
{{marketContext}}
{{/if}}

**RESPONSE FORMAT:**
Return ONLY a valid JSON object that matches the PersonalizedPlan schema structure. Do not include any text before or after the JSON.`,
    variables: ['specializedGuidance', 'userProfileData', 'useGrounding', 'marketContext'],
    metadata: {
      author: 'Claude Code Enhancement',
      createdAt: '2024-12-24',
      tags: ['structured', 'advanced', 'specialized']
    }
  },

  'structured-v2-es': {
    id: 'structured-v2-es',
    name: 'Enhanced Structured Output Template v2 (Spanish)',
    description: 'Advanced template with specialized buyer guidance and market context in Spanish',
    language: 'es',
    type: 'structured',
    version: '2.0.0',
    template: `Eres un asesor hipotecario experto y consultor de compra de vivienda con más de 15 años de experiencia en el mercado inmobiliario estadounidense. Genera un plan integral y personalizado para la compra de vivienda basado en el perfil financiero y las preferencias del usuario.

{{#if specializedGuidance}}
**ORIENTACIÓN ESPECIALIZADA PARA EL COMPRADOR:**
{{specializedGuidance}}

**CRÍTICO:** Usa este contexto especializado para proporcionar consejos específicos y dirigidos para este tipo de comprador. Aborda sus requisitos únicos, necesidades de documentación y oportunidades.
{{/if}}

**PAUTAS IMPORTANTES:**
1. Todos los cálculos financieros deben ser realistas y basados en las condiciones actuales del mercado
2. Considera las relaciones deuda-ingresos, puntajes crediticios y estabilidad laboral
3. Recomienda solo programas para los que el usuario probablemente califique
4. Proporciona pasos específicos y accionables con cronogramas realistas
5. Incluye evaluaciones de riesgo y planificación de contingencias
6. Enfócate en las preferencias y restricciones declaradas por el usuario
7. Asegúrate de que todas las recomendaciones sean financieramente responsables

**PERFIL DEL USUARIO:**
{{userProfileData}}

{{#if useGrounding}}
{{marketContext}}
{{/if}}

**FORMATO DE RESPUESTA:**
Devuelve SOLO un objeto JSON válido que coincida con la estructura del esquema PersonalizedPlan. No incluyas ningún texto antes o después del JSON.`,
    variables: ['specializedGuidance', 'userProfileData', 'useGrounding', 'marketContext'],
    metadata: {
      author: 'Claude Code Enhancement',
      createdAt: '2024-12-24',
      tags: ['structured', 'advanced', 'specialized', 'spanish']
    }
  },

  'markdown-analysis-v2': {
    id: 'markdown-analysis-v2',
    name: 'Enhanced Markdown Analysis Template v2',
    description: 'TREC-compliant template with personalized buyer guidance, conditional loan recommendations, and location analysis',
    language: 'en',
    type: 'markdown',
    version: '2.0.0',
    template: `**SYSTEM INSTRUCTIONS:** You are providing educational real estate guidance following TREC compliance guidelines. Provide personalized analysis based on buyer profile while emphasizing the need for professional consultation.

**WRITING STYLE:** Write at a 3rd grade reading level. Use simple words, short sentences (6-10 words max), and explain all concepts clearly. Avoid jargon. If you must use a technical term, explain it in simple language immediately after.

**TREC COMPLIANCE REQUIREMENTS:**
- All information is for educational purposes only
- Emphasize consulting licensed professionals
- Include proper disclaimers about data accuracy
- Cannot provide specific property investment advice
- Must recommend working with licensed real estate agents and lenders

**BUYER PROFILE PERSONALIZATION RULES:**

**CONDITIONAL LOAN RECOMMENDATIONS:**
CRITICAL: Only recommend loan types that match the buyer's actual profile:

IF buyer selected "veteran" OR "military":
- PROMINENTLY feature VA loan benefits (0% down, no PMI, competitive rates)
- Include VA funding fee information
- Mention Certificate of Eligibility requirements
- Consider military housing allowance

IF buyer selected "first-time":
- Emphasize FHA loans (3.5% down) and first-time buyer programs
- Include homebuyer education requirements
- Mention down payment assistance programs
- Reference first-time buyer grants

IF buyer selected "rural" OR location is rural:
- Include USDA loans (0% down for eligible rural areas)
- Mention rural development programs

IF buyer is NOT veteran/military:
- DO NOT mention VA loans at all

IF buyer is NOT first-time:
- Focus on conventional loans and move-up buyer strategies

IF buyer selected "investor":
- Focus on investment property requirements (typically 20-25% down)
- Include cash flow analysis considerations
- Mention investment property lending standards

**LOCATION PREFERENCES ANALYSIS:**

IF user selected location priorities, address them specifically:

IF "schools" priority:
- Mention researching school district ratings and boundaries
- Recommend consulting with licensed agents familiar with school districts

IF "commute" priority:
- Address transportation access and traffic considerations
- Suggest evaluating proximity to employment centers

IF "safety" priority:
- Recommend researching crime statistics and neighborhood safety
- Suggest consulting with local licensed agents for area insights

IF "amenities" priority:
- Address local shopping, dining, recreational facilities
- Mention considering future development impact

{{#if specializedGuidance}}
{{specializedGuidance}}
{{/if}}

**REQUIRED OUTPUT FORMAT:**

## 💰 **Affordability Analysis**
[DTI calculations and realistic price range with professional consultation disclaimer]

## 🎯 **Loan Options for Your Profile**
[ONLY include relevant loan types based on buyer profile - no VA for non-veterans]

[IF location priorities selected, include this section:]
## 🏘️ **Location Strategy Based on Your Priorities**
[Address their specific selected priorities with educational information]

## ✅ **Recommended Next Steps**
[Personalized action plan emphasizing licensed professional consultation]

## ⚠️ **Important Disclaimers**
**TREC COMPLIANCE NOTICE:**
- **Educational purposes only**: This analysis does not constitute professional real estate or financial advice
- **Consult licensed professionals**: Work with licensed real estate agents, mortgage lenders, and financial advisors
- **Verify all information**: Market data and program availability change frequently
- **Professional guidance required**: All major decisions should involve licensed professionals

---

**ANALYSIS TASK:**
Generate TREC-compliant analysis using buyer profile data. Follow conditional logic above for personalized recommendations.

**USER PROFILE:**
{{userProfileData}}

{{#if useGrounding}}
{{marketContext}}
{{/if}}

**OUTPUT PREFIX: ANALYSIS_RESULT:**`,
    variables: ['specializedGuidance', 'userProfileData', 'useGrounding', 'marketContext'],
    metadata: {
      author: 'Claude Code Enhancement',
      createdAt: '2024-12-24',
      tags: ['markdown', 'analysis', 'advanced']
    }
  },

  'markdown-analysis-v2-es': {
    id: 'markdown-analysis-v2-es',
    name: 'Enhanced Markdown Analysis Template v2 (Spanish)',
    description: 'Advanced markdown template with specialized guidance and real-time data in Spanish',
    language: 'es',
    type: 'markdown',
    version: '2.0.0',
    template: `**INSTRUCCIONES DEL SISTEMA:** Eres un asesor hipotecario certificado con 15+ años de experiencia en el mercado inmobiliario estadounidense. Especializado en compradores primerizos y programas de asistencia. Tu expertise incluye análisis DTI, programas FHA/VA/USDA, préstamos ITIN, y estrategias de financiamiento especializadas.

**ESTILO DE ESCRITURA:** Escribe a nivel de lectura de tercer grado. Usa palabras simples, oraciones cortas (6-10 palabras máximo), y explica todos los conceptos claramente. Evita jerga técnica. Si debes usar un término técnico, explícalo en lenguaje simple inmediatamente después.

{{#if specializedGuidance}}
{{specializedGuidance}}

**CRÍTICO:** Usa este contexto especializado para proporcionar consejos dirigidos y específicos para este tipo de comprador. Aborda sus requisitos únicos, necesidades de documentación y oportunidades.
{{/if}}

**EJEMPLO DE ANÁLISIS:**

PERFIL_ENTRADA:
Income: $65,000/year, Monthly Debts: $800, Down Payment: $15,000, Credit: fair, Location: Austin, TX, Budget: $280,000

RESPUESTA_ESPERADA:
## 💰 **Verificación de Asequibilidad**
- **DTI actual:** 14.8% (excelente)
- **DTI proyectado con hipoteca:** 42-45% (límite aceptable)
- **Rango de precio realista:** $240,000-$260,000 (tu presupuesto de $280,000 está ligeramente alto)

| Concepto | Monto Mensual |
|----------|---------------|
| Pago Principal + Interés | $1,580 |
| Impuestos + Seguro | $420 |
| **Total Estimado** | **$2,000** |

## 🎯 **Mejor Opción de Préstamo**
- **FHA Loan (recomendado):** 3.5% enganche, acepta crédito "fair"
- **Enganche necesario:** $8,400 (tienes $15,000 ✓)
- **Pago mensual estimado:** $1,950-$2,100

## ✅ **Próximos Pasos (Esta Semana)**
1. **Solicitar preaprobación FHA** - contacta 3 prestamistas (2-3 días)
2. **Curso de compradores primerizos** - requerido para FHA (1 día)
3. **Ajustar búsqueda** - enfócate en casas $240K-$260K (inmediato)

## ⚠️ **Alerta Importante**
- **Advertencia:** Tu presupuesto actual ($280K) podría llevarte al 48% DTI - riesgoso
- **Oportunidad:** Austin tiene programas de asistencia que podrían darte $5,000 adicionales

---

**TAREA:** Analiza el siguiente perfil de usuario y genera un análisis CONCISO pero educativo siguiendo EXACTAMENTE el formato del ejemplo.

**PROCESO DE RAZONAMIENTO:**
1. Calcula DTI actual y proyectado
2. Evalúa asequibilidad realista vs. presupuesto deseado
3. Identifica el mejor programa de préstamo (usa CONTEXTO ESPECIALIZADO si aplica)
4. Prioriza 3 acciones inmediatas (incluye documentación específica si hay contexto especializado)
5. Identifica 1-2 factores críticos (incluye advertencias/oportunidades especializadas)

**RESTRICCIONES:**
- MÁXIMO 4 secciones principales
- Números específicos y pasos accionables únicamente
- Usa tablas para comparaciones financieras clave

**REGLAS CRÍTICAS DE FORMATO DE TABLAS:**
- NUNCA dejes líneas en blanco entre el encabezado de tabla y el separador
- NUNCA dejes líneas en blanco entre el separador y las filas de datos
- Formato CORRECTO:
  | Concepto | Monto |
  |----------|-------|
  | Pago | $1,000 |
- Formato INCORRECTO (NO USAR):
  | Concepto | Monto |

  |----------|-------|
  | Pago | $1,000 |
- Cada fila de tabla DEBE estar en una línea separada sin líneas vacías
- Usa sintaxis correcta de tabla markdown: | Columna 1 | Columna 2 |
- Los encabezados y separadores de tabla deben estar en líneas CONSECUTIVAS (sin espacios en blanco entre ellas)
- Incluye emojis apropiados
- Responde SOLO en español
- SI hay CONTEXTO ESPECIALIZADO arriba, incorpóralo específicamente en tu análisis

**PREFIJO DE ENTRADA: PERFIL_USUARIO:**
{{userProfileData}}

{{#if useGrounding}}
{{marketContext}}
{{/if}}

**PREFIJO DE SALIDA: RESULTADO_ANÁLISIS:**`,
    variables: ['specializedGuidance', 'userProfileData', 'useGrounding', 'marketContext'],
    metadata: {
      author: 'Claude Code Enhancement',
      createdAt: '2024-12-24',
      tags: ['markdown', 'analysis', 'advanced', 'spanish']
    }
  }
};

// Safety settings for content filtering - Updated for API integration
const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
] as const;

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: EnhancedRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  circuitBreakerThreshold: 5, // Open circuit after 5 failures
  circuitBreakerResetTime: 60000, // 60 seconds
  adaptiveBackoff: true,
  maxJitterMs: 1000 // Add up to 1 second of random jitter
};

// Enhanced error types with better classification
export class GeminiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false,
    public errorType: 'API_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 'TIMEOUT' | 'VALIDATION_ERROR' | 'AUTHENTICATION_ERROR' = 'API_ERROR',
    public httpStatus?: number,
    public retryAfter?: number // Seconds to wait before retrying (for rate limits)
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class GeminiValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: string[]
  ) {
    super(message);
    this.name = 'GeminiValidationError';
  }
}

// Circuit breaker state management
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  nextAttemptTime: number;
}

// Enhanced retry configuration with circuit breaker
interface EnhancedRetryConfig extends RetryConfig {
  circuitBreakerThreshold: number;
  circuitBreakerResetTime: number;
  adaptiveBackoff: boolean;
  maxJitterMs: number;
}

// Template-driven prompt system interfaces
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  language: 'en' | 'es';
  type: 'structured' | 'markdown';
  version: string;
  template: string;
  variables: string[];
  metadata?: {
    author?: string;
    createdAt?: string;
    tags?: string[];
  };
}

interface PromptVariables {
  [key: string]: any;
  userProfile: any;
  preferences: any;
  language: string;
  useGrounding: boolean;
  specializedGuidance?: string;
  marketContext?: string;
}

interface PromptConfig {
  enableTemplating: boolean;
  defaultTemplate: string;
  fallbackTemplate: string;
  enableVersioning: boolean;
  enableABTesting: boolean;
}

// Cache interface for response caching
interface CachedResponse {
  response: string;
  timestamp: number;
  tokenCount?: number;
}

// Token usage statistics
interface TokenUsageStats {
  totalTokensUsed: number;
  requestCount: number;
  averageTokensPerRequest: number;
  lastRequestTokens?: number;
}

/**
 * Main Gemini client class for plan generation using the newer @google/genai package
 */
export class GeminiPlanningClient {
  private genAI: GoogleGenAI;
  private config: GeminiConfig;
  private retryConfig: EnhancedRetryConfig;
  private structuredConfig: StructuredOutputConfig;
  private performanceConfig: PerformanceConfig;
  private promptConfig: PromptConfig;
  private responseCache: Map<string, CachedResponse>;
  private activeRequests: Set<Promise<any>>;
  private tokenStats: TokenUsageStats;
  private circuitBreakerState: CircuitBreakerState;
  private templateRegistry: Map<string, PromptTemplate>;

  constructor(
    config: Partial<GeminiConfig> & { apiKey: string },
    retryConfig: Partial<EnhancedRetryConfig> = {},
    structuredConfig: Partial<StructuredOutputConfig> = {},
    performanceConfig: Partial<PerformanceConfig> = {},
    promptConfig: Partial<PromptConfig> = {}
  ) {
    if (!config.apiKey) {
      throw new GeminiError('Gemini API key is required');
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.structuredConfig = { ...DEFAULT_STRUCTURED_CONFIG, ...structuredConfig };
    this.performanceConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...performanceConfig };
    this.promptConfig = { ...DEFAULT_PROMPT_CONFIG, ...promptConfig };

    // Initialize performance optimization components
    this.responseCache = new Map();
    this.activeRequests = new Set();
    this.tokenStats = {
      totalTokensUsed: 0,
      requestCount: 0,
      averageTokensPerRequest: 0,
    };

    // Initialize circuit breaker state
    this.circuitBreakerState = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      nextAttemptTime: 0,
    };

    // Initialize template registry with built-in templates
    this.templateRegistry = new Map();
    Object.entries(BUILT_IN_TEMPLATES).forEach(([id, template]) => {
      this.templateRegistry.set(id, template);
    });

    console.log(`🤖 Initializing Gemini AI with model: ${this.config.model}`);
    console.log(`⚡ Structured output: ${this.structuredConfig.useStructuredOutput ? 'enabled' : 'disabled'}`);
    console.log(`🧠 Thinking mode: ${this.structuredConfig.thinkingBudget === -1 ? 'dynamic' : this.structuredConfig.thinkingBudget}`);
    console.log(`🚀 Performance optimizations: caching=${this.performanceConfig.enableCaching}, timeout=${this.performanceConfig.requestTimeoutMs}ms`);
    console.log(`📊 Token monitoring: ${this.performanceConfig.enableTokenMonitoring ? 'enabled' : 'disabled'}`);
    console.log(`🔄 Enhanced retry: circuit breaker=${this.retryConfig.circuitBreakerThreshold} failures, adaptive backoff=${this.retryConfig.adaptiveBackoff}`);
    console.log(`📝 Template system: ${this.promptConfig.enableTemplating ? 'enabled' : 'disabled'}, templates loaded: ${this.templateRegistry.size}`);

    this.genAI = new GoogleGenAI({
      apiKey: this.config.apiKey
    });
  }

  /**
   * Generate cache key from input data for response caching
   */
  private generateCacheKey(input: PlanGenerationInput, useGrounding: boolean): string {
    // Create a deterministic hash of key input parameters
    const keyData = {
      income: input.userProfile.incomeDebt.annualIncome,
      debts: input.userProfile.incomeDebt.monthlyDebts,
      downPayment: input.userProfile.incomeDebt.downPaymentAmount,
      creditScore: input.userProfile.incomeDebt.creditScore,
      location: `${input.userProfile.location.preferredCity}-${input.userProfile.location.preferredState}`,
      maxBudget: input.userProfile.location.maxBudget,
      language: input.preferences.language,
      useGrounding,
      // Include buyer specialization flags for accurate caching
      specialization: JSON.stringify(input.preferences.buyerSpecialization || {}),
    };

    return btoa(JSON.stringify(keyData)).slice(0, 32); // Base64 encode and truncate
  }

  /**
   * Check if cached response is still valid
   */
  private getCachedResponse(cacheKey: string): string | null {
    if (!this.performanceConfig.enableCaching) {
      return null;
    }

    const cached = this.responseCache.get(cacheKey);
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.performanceConfig.cacheExpirationMs;
    if (isExpired) {
      this.responseCache.delete(cacheKey);
      console.log(`🗑️ Expired cache entry removed for key: ${cacheKey.slice(0, 8)}...`);
      return null;
    }

    console.log(`📦 Cache hit for key: ${cacheKey.slice(0, 8)}... (age: ${((Date.now() - cached.timestamp) / 1000).toFixed(1)}s)`);
    return cached.response;
  }

  /**
   * Cache response for future use
   */
  private setCachedResponse(cacheKey: string, response: string, tokenCount?: number): void {
    if (!this.performanceConfig.enableCaching) {
      return;
    }

    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      tokenCount,
    });

    console.log(`💾 Response cached for key: ${cacheKey.slice(0, 8)}... (tokens: ${tokenCount || 'unknown'})`);
  }

  /**
   * Update token usage statistics
   */
  private updateTokenStats(tokenCount: number): void {
    if (!this.performanceConfig.enableTokenMonitoring) {
      return;
    }

    this.tokenStats.requestCount++;
    this.tokenStats.totalTokensUsed += tokenCount;
    this.tokenStats.averageTokensPerRequest = this.tokenStats.totalTokensUsed / this.tokenStats.requestCount;
    this.tokenStats.lastRequestTokens = tokenCount;

    console.log(`📊 Token usage: ${tokenCount} tokens (avg: ${this.tokenStats.averageTokensPerRequest.toFixed(0)}, total: ${this.tokenStats.totalTokensUsed})`);
  }

  /**
   * Get current token usage statistics
   */
  getTokenUsageStats(): TokenUsageStats {
    return { ...this.tokenStats };
  }

  /**
   * Manage concurrent request limits
   */
  private async manageRequestConcurrency<T>(operation: () => Promise<T>): Promise<T> {
    // Check concurrent request limit
    if (this.activeRequests.size >= this.performanceConfig.maxConcurrentRequests) {
      console.warn(`⏳ Max concurrent requests (${this.performanceConfig.maxConcurrentRequests}) reached, waiting...`);
      await Promise.race(this.activeRequests);
    }

    const requestPromise = operation();
    this.activeRequests.add(requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(requestPromise);
    }
  }

  /**
   * Enhanced API call with timeout and performance monitoring
   */
  private async performanceOptimizedAPICall<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    // Add request timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new GeminiError(
          `Request timeout after ${this.performanceConfig.requestTimeoutMs}ms`,
          'REQUEST_TIMEOUT',
          true
        ));
      }, this.performanceConfig.requestTimeoutMs);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      const duration = Date.now() - startTime;

      // Log performance metrics
      console.log(`⚡ Request completed in ${duration}ms (timeout limit: ${this.performanceConfig.requestTimeoutMs}ms)`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Request failed after ${duration}ms:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Template processing and management methods
   */

  /**
   * Simple template rendering with variable substitution
   * Supports {{variable}}, {{#if variable}} and {{/if}} syntax
   */
  private renderTemplate(template: string, variables: PromptVariables): string {
    let rendered = template;

    // Process conditional blocks first {{#if variable}} ... {{/if}}
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    rendered = rendered.replace(conditionalRegex, (match, varName, content) => {
      const value = variables[varName];
      // Return content if variable exists and is truthy
      return (value !== undefined && value !== null && value !== false && value !== '') ? content : '';
    });

    // Process simple variable substitutions {{variable}}
    const variableRegex = /\{\{(\w+)\}\}/g;
    rendered = rendered.replace(variableRegex, (match, varName) => {
      const value = variables[varName];
      return value !== undefined ? String(value) : match; // Keep original if undefined
    });

    return rendered;
  }

  /**
   * Select appropriate template based on language and type
   */
  private selectTemplate(type: 'structured' | 'markdown', language: 'en' | 'es'): PromptTemplate | null {
    if (!this.promptConfig.enableTemplating) {
      return null;
    }

    const templateId = type === 'structured'
      ? (language === 'es' ? 'structured-v2-es' : 'structured-v2')
      : (language === 'es' ? 'markdown-analysis-v2-es' : 'markdown-analysis-v2');

    let template = this.templateRegistry.get(templateId);

    // Fallback to default template if specific one not found
    if (!template && this.promptConfig.fallbackTemplate) {
      template = this.templateRegistry.get(this.promptConfig.fallbackTemplate);
      console.warn(`⚠️ Template '${templateId}' not found, using fallback: '${this.promptConfig.fallbackTemplate}'`);
    }

    return template || null;
  }

  /**
   * Register a new custom template
   */
  registerTemplate(template: PromptTemplate): void {
    this.templateRegistry.set(template.id, template);
    console.log(`📝 Registered custom template: ${template.id} (${template.name})`);
  }

  /**
   * Get all registered templates
   */
  getRegisteredTemplates(): PromptTemplate[] {
    return Array.from(this.templateRegistry.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templateRegistry.get(templateId);
  }

  /**
   * Build user profile data string for template variables
   */
  private buildUserProfileData(input: PlanGenerationInput): string {
    const { userProfile, preferences } = input;

    // Build buyer type array for conditional logic - prefer raw data if available
    const buyerTypes: string[] = (userProfile as any).buyerTypes ||
                                (preferences.buyerSpecialization as any)?.rawBuyerTypes || [];

    // Fallback to flags if raw data not available
    if (buyerTypes.length === 0) {
      if (preferences.buyerSpecialization?.isFirstTimeBuyer) buyerTypes.push('first-time');
      if (preferences.buyerSpecialization?.isMilitaryVeteran) buyerTypes.push('veteran');
      if (preferences.buyerSpecialization?.isInvestor) buyerTypes.push('investor');
      if (preferences.buyerSpecialization?.isUSDAEligible) buyerTypes.push('rural');
    }

    // Extract location priorities from user profile or preferences
    const locationPriorities: string[] = (userProfile as any).locationPriorities ||
                                        (preferences.buyerSpecialization as any)?.rawLocationPriorities || [];

    return `Income: $${userProfile.incomeDebt.annualIncome}/year
Monthly Debts: $${userProfile.incomeDebt.monthlyDebts}
Down Payment Available: $${userProfile.incomeDebt.downPaymentAmount}
Credit Score Range: ${userProfile.incomeDebt.creditScore}
Employment: ${userProfile.employment.jobTitle} at ${userProfile.employment.employerName} (${userProfile.employment.yearsAtJob} years)
Location Preference: ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}
Max Budget: $${userProfile.location.maxBudget}
Property Type: ${userProfile.location.homeType}
Timeline: ${userProfile.location.timeframe}
First-time Buyer: ${userProfile.location.firstTimeBuyer ? 'Yes' : 'No'}
Risk Tolerance: ${preferences.riskTolerance || 'moderate'}
Buyer Types: ${buyerTypes.length > 0 ? buyerTypes.join(', ') : 'Not specified'}
Location Priorities: ${locationPriorities.length > 0 ? locationPriorities.join(', ') : 'Not specified'}`;
  }

  /**
   * Build market context string for template variables
   */
  private buildMarketContext(input: PlanGenerationInput): string {
    const { userProfile } = input;
    return `**REAL-TIME MARKET DATA SEARCH:** Use Google Search to find and incorporate current information for ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}:
- Current mortgage rates (30-year fixed, FHA, VA rates)
- Local down payment assistance programs available in ${userProfile.location.preferredState}
- Recent housing market trends for ${userProfile.location.preferredCity} area
- First-time buyer programs specific to ${userProfile.location.preferredState}
- USDA rural development areas near ${userProfile.location.preferredCity} (if applicable)
Include specific program names, contact information, and current rates/incentives when found.`;
  }

  /**
   * Enhanced template-driven prompt generation
   */
  private generateTemplatedPrompt(
    input: PlanGenerationInput,
    type: 'structured' | 'markdown',
    useGrounding: boolean = true
  ): string {
    const { userProfile, preferences } = input;
    const language = preferences.language as 'en' | 'es';

    // Try to use template-driven system first
    if (this.promptConfig.enableTemplating) {
      const template = this.selectTemplate(type, language);

      if (template) {
        console.log(`📝 Using template: ${template.id} (${template.name})`);

        // Get specialized buyer context
        const { guidanceContexts } = this.detectBuyerSpecializations(input);
        const specializedGuidance = guidanceContexts.length > 0 ? guidanceContexts.join('\n\n') : '';

        // Prepare template variables
        const templateVariables: PromptVariables = {
          userProfile,
          preferences,
          language,
          useGrounding,
          specializedGuidance,
          userProfileData: this.buildUserProfileData(input),
          marketContext: useGrounding ? this.buildMarketContext(input) : '',
        };

        // Render the template
        const renderedPrompt = this.renderTemplate(template.template, templateVariables);

        console.log(`✅ Template rendered successfully, length: ${renderedPrompt.length} chars`);
        return renderedPrompt;
      }
    }

    // Fallback to legacy prompt building if templates disabled or not found
    console.warn('⚠️ Template not found or templating disabled, falling back to legacy prompt generation');
    return type === 'structured'
      ? this.buildLegacyStructuredPrompt(input, useGrounding)
      : this.buildLegacyMarkdownPrompt(input, useGrounding);
  }

  /**
   * Clear expired cache entries periodically
   */
  private cleanupCache(): void {
    if (!this.performanceConfig.enableCaching) {
      return;
    }

    const now = Date.now();
    let deletedCount = 0;

    for (const [key, cached] of this.responseCache.entries()) {
      if (now - cached.timestamp > this.performanceConfig.cacheExpirationMs) {
        this.responseCache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
    }
  }

  /**
   * Generate basic JSON schema for structured output
   * Simplified schema that should work with Gemini's structured output feature
   */
  private getPersonalizedPlanSchema() {
    return {
      type: "object",
      properties: {
        id: { type: "string" },
        userId: { type: "string" },
        generatedAt: { type: "string" },
        language: { type: "string", enum: ["en", "es"] },
        affordabilityEstimate: {
          type: "object",
          properties: {
            maxHomePrice: { type: "number" },
            recommendedPrice: { type: "number" },
            budgetBreakdown: {
              type: "object",
              properties: {
                downPayment: { type: "number" },
                monthlyPayment: { type: "number" },
                closingCosts: { type: "number" },
                emergencyFund: { type: "number" },
                totalRequired: { type: "number" }
              },
              required: ["downPayment", "monthlyPayment", "closingCosts", "emergencyFund", "totalRequired"]
            },
            riskAssessment: {
              type: "object",
              properties: {
                riskLevel: { type: "string", enum: ["low", "moderate", "high"] },
                factors: { type: "array", items: { type: "string" } },
                recommendation: { type: "string" }
              },
              required: ["riskLevel", "factors", "recommendation"]
            },
            timeframe: { type: "string" },
            assumptions: { type: "array", items: { type: "string" } },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["maxHomePrice", "recommendedPrice", "budgetBreakdown", "riskAssessment", "timeframe", "assumptions", "confidence"]
        },
        programRecommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              programType: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              eligibilityScore: { type: "number" },
              requirements: { type: "array", items: { type: "string" } },
              benefits: { type: "array", items: { type: "string" } },
              priority: { type: "string", enum: ["high", "medium", "low"] }
            },
            required: ["programType", "name", "description", "eligibilityScore", "priority"]
          }
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        isValid: { type: "boolean" },
        validationErrors: { type: "array", items: { type: "string" } }
      },
      required: ["id", "userId", "generatedAt", "language", "affordabilityEstimate", "programRecommendations", "confidence", "isValid"]
    };
  }

  /**
   * Generate a personalized home buying plan with structured output validation
   */
  async generatePersonalizedPlan(
    input: PlanGenerationInput,
    useGrounding: boolean = true
  ): Promise<PersonalizedPlan> {
    // Clean up expired cache entries periodically
    this.cleanupCache();

    // Validate input data
    const validatedInput = PlanGenerationInputSchema.parse(input);

    // Check cache first
    const cacheKey = this.generateCacheKey(validatedInput, useGrounding);
    const cachedResponse = this.getCachedResponse(cacheKey);

    if (cachedResponse) {
      console.log(`📦 Using cached response for similar request`);
      const plan = this.parseAndValidateResponse(cachedResponse, validatedInput, this.structuredConfig.useStructuredOutput);
      return plan;
    }

    const prompt = this.buildPrompt(validatedInput, useGrounding);

    try {
      console.log(`🚀 Starting Gemini API call for personalized plan generation`);
      const startTime = Date.now();

      const result = await this.manageRequestConcurrency(() =>
        this.performanceOptimizedAPICall(() =>
          this.retryWithBackoff(async () => {
        console.log(`📤 Sending request to Gemini model: ${this.config.model} ${useGrounding ? '(with Google Search grounding)' : ''}`);

        // Prepare request config with enhanced features
        const requestConfig: any = {
          model: this.config.model,
          contents: prompt,
          generationConfig: {
            temperature: this.config.temperature,
            topP: this.config.topP,
            topK: this.config.topK,
            maxOutputTokens: this.config.maxOutputTokens,
          },
          safetySettings: SAFETY_SETTINGS,
        };

        // Add thinking mode configuration if specified
        if (this.structuredConfig.thinkingBudget !== undefined) {
          requestConfig.generationConfig.thinkingBudget = this.structuredConfig.thinkingBudget;
          console.log(`🧠 Thinking budget set to: ${this.structuredConfig.thinkingBudget}`);
        }

        // Add structured output schema if enabled
        if (this.structuredConfig.useStructuredOutput) {
          requestConfig.generationConfig.responseMimeType = "application/json";
          requestConfig.generationConfig.responseSchema = this.getPersonalizedPlanSchema();
          console.log('📊 Structured JSON output schema enabled');
        }

        // Add Google Search grounding if requested
        if (useGrounding) {
          requestConfig.tools = [{ googleSearch: {} }];
          console.log('🔍 Google Search grounding enabled for real-time data access');
        }

            const response = await this.genAI.models.generateContent(requestConfig);
            const text = response.text;

            if (!text) {
              throw new GeminiError('Empty response from Gemini API', 'EMPTY_RESPONSE', true);
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Gemini API response received in ${duration}ms, length: ${text.length} chars`);

            // Estimate token count for monitoring (approximate)
            const tokenCount = Math.ceil(text.length / 4);
            this.updateTokenStats(tokenCount);

            return text;
          })
        )
      );

      // Cache the response for future use
      this.setCachedResponse(cacheKey, result);

      // Parse and validate the structured output
      const plan = this.parseAndValidateResponse(result, validatedInput, this.structuredConfig.useStructuredOutput);
      console.log(`✅ Successfully generated personalized plan for user: ${validatedInput.userProfile.contact.email}`);
      return plan;

    } catch (error) {
      console.error(`❌ Gemini plan generation failed:`, error);

      if (error instanceof GeminiError || error instanceof GeminiValidationError) {
        throw error;
      }

      // Handle unknown errors with fallback
      console.error('⚠️  Using fallback plan due to unexpected error:', error);
      return this.generateFallbackPlan(validatedInput);
    }
  }

  /**
   * Generate markdown-formatted analysis for better UI display
   */
  async generateMarkdownAnalysis(
    input: PlanGenerationInput,
    useGrounding: boolean = true
  ): Promise<string> {
    try {
      console.log(`🚀 Starting Gemini API call for markdown analysis generation`);
      const startTime = Date.now();

      // Validate input data
      const validatedInput = PlanGenerationInputSchema.parse(input);
      const { userProfile, preferences } = validatedInput;
      const language = preferences.language;

      const markdownPrompt = this.buildMarkdownPrompt(validatedInput, useGrounding);

      const result = await this.retryWithBackoff(async () => {
        console.log(`📤 Sending markdown request to Gemini model: ${this.config.model} ${useGrounding ? '(with Google Search grounding)' : ''}`);

        // Prepare request config with enhanced features
        const requestConfig: any = {
          model: this.config.model,
          contents: markdownPrompt,
          generationConfig: {
            temperature: this.config.temperature,
            topP: this.config.topP,
            topK: this.config.topK,
            maxOutputTokens: this.config.maxOutputTokens,
          },
          safetySettings: SAFETY_SETTINGS,
        };

        // Add thinking mode configuration for faster response (disabled)
        if (this.structuredConfig.thinkingBudget !== undefined) {
          requestConfig.generationConfig.thinkingBudget = this.structuredConfig.thinkingBudget;
          console.log(`🧠 Thinking budget set to: ${this.structuredConfig.thinkingBudget} (0 = disabled for speed)`);
        }

        // Add Google Search grounding if requested
        if (useGrounding) {
          requestConfig.tools = [{ googleSearch: {} }];
          console.log('🔍 Google Search grounding enabled for markdown analysis');
        }

        const response = await this.genAI.models.generateContent(requestConfig);
        const text = response.text;

        if (!text) {
          throw new GeminiError('Empty response from Gemini API', 'EMPTY_RESPONSE', true);
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Gemini markdown response received in ${duration}ms, length: ${text.length} chars`);
        return text;
      });

      console.log(`✅ Successfully generated markdown analysis for user: ${validatedInput.userProfile.contact.email}`);
      return result;

    } catch (error) {
      console.error(`❌ Gemini markdown generation failed:`, error);
      console.warn('⚠️  Using fallback markdown content');
      // Return fallback markdown content
      return this.generateFallbackMarkdown(input);
    }
  }

  /**
   * Generate streaming markdown-formatted analysis for real-time UI updates
   */
  async* generateMarkdownAnalysisStream(
    input: PlanGenerationInput,
    useGrounding: boolean = true,
    customPrompt?: string,
    maxTokens?: number,
    modelOverride?: string
  ): AsyncGenerator<string, void, unknown> {
    // Declare variables at function level for proper scope
    let totalText = '';
    let chunkCount = 0;
    let hasYieldedContent = false;
    let streamCompleted = false;

    try {
      console.log(`🚀 Starting Gemini API streaming call for markdown analysis generation`);
      const startTime = Date.now();

      // Validate input data
      const validatedInput = PlanGenerationInputSchema.parse(input);

      // Use custom prompt if provided, otherwise build full template
      const markdownPrompt = customPrompt || this.buildMarkdownPrompt(validatedInput, useGrounding);

      // Select model: use override if provided, otherwise use configured model
      const selectedModel = modelOverride || this.config.model;

      if (modelOverride) {
        console.log(`🔄 Model override: Using ${modelOverride} instead of ${this.config.model}`);
      }

      // TOKEN COUNTING: Count input tokens before API call
      let promptTokenCount = 0;
      try {
        const tokenCountResult = await this.genAI.models.countTokens({
          model: selectedModel,
          contents: markdownPrompt
        });
        promptTokenCount = tokenCountResult.totalTokens || 0;
        console.log(`📊 Token count - Prompt: ${promptTokenCount} tokens (~${Math.round(promptTokenCount * 0.25)} words)`);

        if (promptTokenCount > 3000) {
          console.warn(`⚠️  Large prompt detected (${promptTokenCount} tokens). Consider reducing for better cache hits.`);
        }
      } catch (tokenError) {
        console.warn('⚠️  Token counting failed:', tokenError);
      }

      if (customPrompt) {
        console.log(`📤 Sending streaming markdown request with CUSTOM PROMPT to Gemini model: ${selectedModel} (grounding: ${useGrounding})`);
      } else {
        console.log(`📤 Sending streaming markdown request to Gemini model: ${selectedModel} ${useGrounding ? '(with Google Search grounding)' : ''}`);
      }

      // Prepare request config with enhanced features
      const requestConfig: any = {
        model: selectedModel,
        contents: markdownPrompt,
        generationConfig: {
          temperature: this.config.temperature,
          topP: this.config.topP,
          topK: this.config.topK,
          maxOutputTokens: maxTokens || this.config.maxOutputTokens, // Use custom limit if provided
        },
        safetySettings: SAFETY_SETTINGS,
      };

      if (maxTokens) {
        console.log(`🎯 Custom output token limit: ${maxTokens} (default: ${this.config.maxOutputTokens})`);
      }

      // Add thinking mode configuration for faster streaming (disabled)
      if (this.structuredConfig.thinkingBudget !== undefined) {
        requestConfig.generationConfig.thinkingBudget = this.structuredConfig.thinkingBudget;
        console.log(`🧠 Thinking budget set to: ${this.structuredConfig.thinkingBudget} (0 = disabled for speed)`);
      }

      // Add Google Search grounding if requested (and not using custom prompt)
      if (useGrounding && !customPrompt) {
        requestConfig.tools = [{ googleSearch: {} }];
        console.log('🔍 Google Search grounding enabled for streaming analysis');
      } else if (customPrompt) {
        console.log('⚡ Google Search grounding DISABLED for custom prompt (faster response)');
      }

      // Use generateContentStream for streaming responses
      const stream = await this.genAI.models.generateContentStream(requestConfig);

      // Track usage metadata
      let outputTokenCount = 0;
      let cachedTokenCount = 0;

      try {
        for await (const chunk of stream) {
          if (chunk.text) {
            totalText += chunk.text;
            chunkCount++;
            hasYieldedContent = true;

            console.log(`📨 Received chunk ${chunkCount}, length: ${chunk.text.length} chars`);
            yield chunk.text;
          }

          // Capture usage metadata from final chunk (if available)
          if (chunk.usageMetadata) {
            outputTokenCount = chunk.usageMetadata.candidatesTokenCount || 0;
            cachedTokenCount = chunk.usageMetadata.cachedContentTokenCount || 0;
          }
        }
        streamCompleted = true;

        const duration = Date.now() - startTime;
        const totalTokens = promptTokenCount + outputTokenCount;

        // USAGE METADATA LOGGING with cost estimation (model-specific pricing)
        const isFlash = selectedModel.includes('flash');
        const isPro = selectedModel.includes('pro');

        // Pricing per million tokens
        const costPerMillionTokens = isFlash ? 0.075 : 0.30;  // Flash: $0.075/M, Pro: $0.30/M (input)
        const outputCostPerMillionTokens = isFlash ? 0.30 : 1.20; // Flash: $0.30/M, Pro: $1.20/M (output)
        const cachedCostPerMillionTokens = isFlash ? 0.01875 : 0.075; // 75% discount on cached

        const inputCost = ((promptTokenCount - cachedTokenCount) / 1000000) * costPerMillionTokens;
        const cachedCost = (cachedTokenCount / 1000000) * cachedCostPerMillionTokens;
        const outputCost = (outputTokenCount / 1000000) * outputCostPerMillionTokens;
        const totalCost = inputCost + cachedCost + outputCost;

        console.log(`📈 Usage Metadata:`, {
          model: selectedModel,
          promptTokens: promptTokenCount,
          outputTokens: outputTokenCount,
          cachedTokens: cachedTokenCount,
          totalTokens: totalTokens,
          cacheHitRate: promptTokenCount > 0 ? `${Math.round((cachedTokenCount / promptTokenCount) * 100)}%` : '0%',
          duration: `${duration}ms`,
          tokensPerSecond: Math.round((outputTokenCount / duration) * 1000),
          cost: `$${totalCost.toFixed(6)}`,
          costBreakdown: {
            input: `$${inputCost.toFixed(6)}`,
            cached: `$${cachedCost.toFixed(6)}`,
            output: `$${outputCost.toFixed(6)}`
          }
        });

        // Update token statistics
        this.updateTokenStats(totalTokens);

        console.log(`✅ Gemini streaming completed in ${duration}ms, total length: ${totalText.length} chars, chunks: ${chunkCount}`);
        console.log(`✅ Successfully generated streaming markdown analysis for user: ${validatedInput.userProfile.contact.email}`);

      } catch (streamError) {
        console.error(`❌ Streaming error after ${chunkCount} chunks:`, streamError);

        if (!hasYieldedContent) {
          // No content was streamed yet, safe to yield fallback
          console.warn('⚠️ No content streamed yet, yielding fallback markdown');
          yield this.generateFallbackMarkdown(input);
        } else {
          // Some content was already streamed, yield error message instead
          const errorMessage = '\n\n---\n\n⚠️ **Streaming Interrupted**\n\nThe AI analysis was interrupted due to a technical issue. The content above may be incomplete. Please try again for a complete analysis.';
          console.warn('⚠️ Streaming interrupted, yielding error message');
          yield errorMessage;
        }
        throw streamError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      if (!streamCompleted) {
        console.error(`❌ Gemini streaming markdown generation failed during setup:`, error);

        if (!hasYieldedContent) {
          // Only yield fallback if we haven't yielded any real content yet
          console.warn('⚠️ Setup error with no content streamed, yielding fallback markdown');
          yield this.generateFallbackMarkdown(input);
        }
      }
      // Don't re-throw setup errors if we already yielded something
    }
  }

  /**
   * Detect special buyer types and generate targeted guidance context
   * Updated to use explicit flags instead of biased inference
   */
  private detectBuyerSpecializations(input: PlanGenerationInput): {
    types: string[],
    guidanceContexts: string[]
  } {
    const { userProfile, preferences } = input;
    const language = preferences.language;
    const types: string[] = [];
    const guidanceContexts: string[] = [];
    const specialization = preferences.buyerSpecialization;

    // ITIN Taxpayer Detection (now explicit)
    if (specialization?.isITINTaxpayer) {
      types.push('ITIN_TAXPAYER');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO ITIN:** Este comprador usa ITIN en lugar de SSN. REQUIERE: 2 años de declaraciones de impuestos ITIN, carta de empleador confirmando elegibilidad laboral, programas de préstamos que aceptan ITIN (Bank of America, Wells Fargo, ciertos prestamistas locales). NO elegible para VA/USDA. FHA y convencionales disponibles con documentación adicional.` :
        `**ITIN CONTEXT:** This buyer uses ITIN instead of SSN. REQUIRES: 2 years ITIN tax returns, employer letter confirming work authorization, ITIN-accepting loan programs (Bank of America, Wells Fargo, certain local lenders). NOT eligible for VA/USDA. FHA and conventional available with additional documentation.`
      );
    }

    // Military/Veteran Detection (now explicit or employer-based)
    const militaryKeywords = ['military', 'veteran', 'defense', 'base', 'army', 'navy', 'air force', 'marines'];
    const hasMillitaryEmployer = militaryKeywords.some(keyword =>
      userProfile.employment.employerName.toLowerCase().includes(keyword) ||
      userProfile.employment.workAddress.toLowerCase().includes(keyword)
    );

    if (specialization?.isMilitaryVeteran || hasMillitaryEmployer) {
      types.push('MILITARY_VETERAN');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO MILITAR/VETERANO:** Elegible para préstamo VA. BENEFICIOS: 0% enganche, sin seguro hipotecario (PMI), tasas competitivas, sin límites de precio. REQUISITOS: Certificado de Elegibilidad (COE) del VA, servicio activo o veterano elegible. VENTAJA: puede reusar beneficio VA si califica.` :
        `**MILITARY/VETERAN CONTEXT:** Eligible for VA loan. BENEFITS: 0% down payment, no mortgage insurance (PMI), competitive rates, no price limits. REQUIREMENTS: Certificate of Eligibility (COE) from VA, active duty or eligible veteran status. ADVANTAGE: VA benefit can be reused if qualified.`
      );
    }

    // USDA Rural Buyer Detection (explicit flag or location-based with income check)
    const ruralCities = ['Cedar Creek', 'Bastrop', 'Elgin', 'Manor', 'Del Valle', 'Buda', 'Dripping Springs', 'Kyle'];
    const isRuralLocation = ruralCities.some(city =>
      userProfile.location.preferredCity.toLowerCase().includes(city.toLowerCase())
    ) || userProfile.location.preferredZipCode.startsWith('786');

    if (specialization?.isUSDAEligible || (isRuralLocation && userProfile.incomeDebt.annualIncome <= 80000)) {
      types.push('USDA_ELIGIBLE');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO USDA:** Elegible para préstamo USDA Rural Development. BENEFICIOS: 0% enganche, tasas competitivas, sin límites de precio (solo límites de ingresos). REQUISITOS: área rural elegible (verificar mapa USDA), ingresos bajo 115% del ingreso medio del área, ocupación del propietario. TIMELINE: proceso más largo (45-60 días) pero vale la pena por los ahorros.` :
        `**USDA CONTEXT:** Eligible for USDA Rural Development loan. BENEFITS: 0% down payment, competitive rates, no price limits (income limits only). REQUIREMENTS: USDA eligible rural area (check USDA map), income under 115% area median income, owner occupancy. TIMELINE: longer process (45-60 days) but worth it for savings.`
      );
    }

    // Self-Employed Detection
    if (userProfile.employment.employmentStatus === 'self-employed') {
      types.push('SELF_EMPLOYED');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO TRABAJADOR INDEPENDIENTE:** Requiere documentación adicional. NECESARIO: 2 años de declaraciones de impuestos completas, estados P&L (pérdidas y ganancias), 3 meses de estados bancarios comerciales, carta CPA. OPCIONES: préstamos basados en estados bancarios (bank statement loans) si los ingresos de impuestos son bajos. DTI calculado en ingresos netos promedio de 2 años.` :
        `**SELF-EMPLOYED CONTEXT:** Requires additional documentation. NEEDED: 2 years complete tax returns, P&L statements, 3 months business bank statements, CPA letter. OPTIONS: bank statement loans if tax income is low. DTI calculated on 2-year average net income.`
      );
    }

    // Retired/Fixed Income Detection
    if (userProfile.employment.employmentStatus === 'retired' ||
        userProfile.employment.jobTitle.toLowerCase().includes('retired')) {
      types.push('RETIRED_FIXED_INCOME');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO JUBILADO/INGRESOS FIJOS:** Enfoque en ingresos estables y conservadores. INGRESOS ACEPTADOS: Seguro Social, pensiones, 401k/IRA, ingresos de inversión. VENTAJAS: DTI más flexible, gran historial crediticio típico. CONSIDERACIONES: evitar pagos altos, mantener reservas de emergencia significativas.` :
        `**RETIRED/FIXED INCOME CONTEXT:** Focus on stable, conservative income approach. ACCEPTED INCOME: Social Security, pensions, 401k/IRA distributions, investment income. ADVANTAGES: more flexible DTI, typically great credit history. CONSIDERATIONS: avoid high payments, maintain significant emergency reserves.`
      );
    }

    // First-Time Buyer (explicit flag or profile-based)
    if (specialization?.isFirstTimeBuyer || userProfile.location.firstTimeBuyer) {
      types.push('FIRST_TIME_BUYER');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO PRIMER COMPRADOR:** Elegible para múltiples programas de asistencia. BENEFICIOS: cursos gratuitos de compra de vivienda, programas de asistencia para enganche, tasas preferenciales FHA. RECURSOS: programas estatales y locales de asistencia, créditos fiscales para compradores primerizos.` :
        `**FIRST-TIME BUYER CONTEXT:** Eligible for multiple assistance programs. BENEFITS: free homebuyer education courses, down payment assistance programs, preferential FHA rates. RESOURCES: state and local assistance programs, first-time buyer tax credits.`
      );
    }

    // Zero Down Payment Context (for users with $0 down who aren't VA/USDA eligible)
    if (userProfile.incomeDebt.downPaymentAmount === 0 &&
        !types.includes('MILITARY_VETERAN') &&
        !types.includes('USDA_ELIGIBLE')) {
      types.push('ZERO_DOWN_NEEDED');
      guidanceContexts.push(language === 'es' ?
        `**CONTEXTO SIN ENGANCHE:** Necesita programas de 0% enganche. OPCIONES: programas locales de asistencia para enganche, préstamos del empleador, programas estatales de vivienda asequible. CONSIDERAR: FHA con 3.5% mínimo + asistencia para enganche.` :
        `**ZERO DOWN CONTEXT:** Needs 0% down payment programs. OPTIONS: local down payment assistance programs, employer loan programs, state affordable housing programs. CONSIDER: FHA with 3.5% minimum + down payment assistance.`
      );
    }

    return { types, guidanceContexts };
  }

  /**
   * Legacy markdown prompt builder (fallback when templates unavailable)
   */
  private buildLegacyMarkdownPrompt(input: PlanGenerationInput, useGrounding: boolean): string {
    const { userProfile, preferences } = input;
    const language = preferences.language;

    // Get specialized buyer context
    const { types: buyerTypes, guidanceContexts } = this.detectBuyerSpecializations(input);

    // Google Best Practice: System Instructions + Role Definition + Domain Context
    const baseInstructions = language === 'es' ?
      `INSTRUCCIONES DEL SISTEMA: Eres un asesor hipotecario certificado con 15+ años de experiencia en el mercado inmobiliario estadounidense. Especializado en compradores primerizos y programas de asistencia. Tu expertise incluye análisis DTI, programas FHA/VA/USDA, préstamos ITIN, y estrategias de financiamiento especializadas.

ESTILO DE ESCRITURA: Escribe a nivel de lectura de tercer grado. Usa palabras simples, oraciones cortas (6-10 palabras máximo), y explica todos los conceptos claramente. Evita jerga técnica. Si debes usar un término técnico, explícalo en lenguaje simple inmediatamente después.` :
      `SYSTEM INSTRUCTIONS: You are a certified mortgage advisor with 15+ years of experience in the US real estate market. Specialized in first-time homebuyers and assistance programs. Your expertise includes DTI analysis, FHA/VA/USDA programs, ITIN loans, and specialized financing strategies.

WRITING STYLE: Write at a 3rd grade reading level. Use simple words, short sentences (6-10 words max), and explain all concepts clearly. Avoid jargon. If you must use a technical term, explain it in simple language immediately after.`;

    const specializedGuidance = guidanceContexts.length > 0 ? `

**SPECIALIZED BUYER GUIDANCE:**
${guidanceContexts.join('\n\n')}

**CRITICAL:** Use this specialized context to provide targeted, specific advice for this buyer type. Address their unique requirements, documentation needs, and opportunities.` : '';

    const systemInstructions = baseInstructions + specializedGuidance;

    // Google Best Practice: Few-Shot Examples with Input/Output Prefixes
    const fewShotExamples = language === 'es' ?
      `EJEMPLO DE ANÁLISIS:

PERFIL_ENTRADA:
Income: $65,000/year, Monthly Debts: $800, Down Payment: $15,000, Credit: fair, Location: Austin, TX, Budget: $280,000

RESPUESTA_ESPERADA:
## 💰 **Verificación de Asequibilidad**
- **DTI actual:** 14.8% (excelente)
- **DTI proyectado con hipoteca:** 42-45% (límite aceptable)
- **Rango de precio realista:** $240,000-$260,000 (tu presupuesto de $280,000 está ligeramente alto)

| Concepto | Monto Mensual |
|----------|---------------|
| Pago Principal + Interés | $1,580 |
| Impuestos + Seguro | $420 |
| **Total Estimado** | **$2,000** |

## 🎯 **Mejor Opción de Préstamo**
- **FHA Loan (recomendado):** 3.5% enganche, acepta crédito "fair"
- **Enganche necesario:** $8,400 (tienes $15,000 ✓)
- **Pago mensual estimado:** $1,950-$2,100

## ✅ **Próximos Pasos (Esta Semana)**
1. **Solicitar preaprobación FHA** - contacta 3 prestamistas (2-3 días)
2. **Curso de compradores primerizos** - requerido para FHA (1 día)
3. **Ajustar búsqueda** - enfócate en casas $240K-$260K (inmediato)

## ⚠️ **Alerta Importante**
- **Advertencia:** Tu presupuesto actual ($280K) podría llevarte al 48% DTI - riesgoso
- **Oportunidad:** Austin tiene programas de asistencia que podrían darte $5,000 adicionales

---` :
      `ANALYSIS EXAMPLE:

INPUT_PROFILE:
Income: $65,000/year, Monthly Debts: $800, Down Payment: $15,000, Credit: fair, Location: Austin, TX, Budget: $280,000

EXPECTED_OUTPUT:
## 💰 **Affordability Check**
- **Current DTI:** 14.8% (excellent)
- **Projected DTI with mortgage:** 42-45% (acceptable limit)
- **Realistic price range:** $240,000-$260,000 (your $280,000 budget is slightly high)

| Item | Monthly Amount |
|------|----------------|
| Principal + Interest | $1,580 |
| Taxes + Insurance | $420 |
| **Total Estimated** | **$2,000** |

## 🎯 **Best Loan Option**
- **FHA Loan (recommended):** 3.5% down, accepts "fair" credit
- **Down payment needed:** $8,400 (you have $15,000 ✓)
- **Estimated monthly payment:** $1,950-$2,100

## ✅ **Next Steps (This Week)**
1. **Apply for FHA pre-approval** - contact 3 lenders (2-3 days)
2. **First-time buyer course** - required for FHA (1 day)
3. **Adjust search criteria** - focus on $240K-$260K homes (immediate)

## ⚠️ **Important Alert**
- **Warning:** Your current budget ($280K) could push you to 48% DTI - risky
- **Opportunity:** Austin has down payment assistance programs offering up to $5,000

---`;

    const taskInstructions = language === 'es' ?
      `TAREA: Analiza el siguiente perfil de usuario y genera un análisis CONCISO pero educativo siguiendo EXACTAMENTE el formato del ejemplo.

      **PROCESO DE RAZONAMIENTO:**
      1. Calcula DTI actual y proyectado
      2. Evalúa asequibilidad realista vs. presupuesto deseado
      3. Identifica el mejor programa de préstamo (usa CONTEXTO ESPECIALIZADO si aplica)
      4. Prioriza 3 acciones inmediatas (incluye documentación específica si hay contexto especializado)
      5. Identifica 1-2 factores críticos (incluye advertencias/oportunidades especializadas)

      **RESTRICCIONES:**
      - MÁXIMO 4 secciones principales
      - Números específicos y pasos accionables únicamente
      - Usa tablas para comparaciones financieras clave
      - Incluye emojis apropiados
      - Responde SOLO en español
      - SI hay CONTEXTO ESPECIALIZADO arriba, incorpóralo específicamente en tu análisis

      **PREFIJO DE ENTRADA: PERFIL_USUARIO:**` :
      `TASK: Analyze the following user profile and generate a CONCISE but educational analysis following EXACTLY the example format.

      **REASONING PROCESS:**
      1. Calculate current and projected DTI
      2. Evaluate realistic affordability vs. desired budget
      3. Identify best loan program match (use SPECIALIZED CONTEXT if applicable)
      4. Prioritize 3 immediate actionable steps (include specific documentation if specialized context exists)
      5. Identify 1-2 critical factors (include specialized warnings/opportunities)

      **CONSTRAINTS:**
      - MAXIMUM 4 main sections
      - Specific numbers and actionable steps only
      - Use tables for key financial comparisons
      - Include appropriate emojis
      - Respond ONLY in English
      - IF SPECIALIZED CONTEXT exists above, incorporate it specifically into your analysis

      **INPUT PREFIX: USER_PROFILE:**`;

    // Add focused market context for essential insights only
    const marketContextInstruction = useGrounding ? `
**REAL-TIME MARKET DATA SEARCH:** Use Google Search to find and incorporate current information for ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}:
- Current mortgage rates (30-year fixed, FHA, VA rates)
- Local down payment assistance programs available in ${userProfile.location.preferredState}
- Recent housing market trends for ${userProfile.location.preferredCity} area
- First-time buyer programs specific to ${userProfile.location.preferredState}
- USDA rural development areas near ${userProfile.location.preferredCity} (if applicable)
Include specific program names, contact information, and current rates/incentives when found.
` : '';

    return `${systemInstructions}

${fewShotExamples}

${taskInstructions}
Income: $${userProfile.incomeDebt.annualIncome}/year
Monthly Debts: $${userProfile.incomeDebt.monthlyDebts}
Down Payment Available: $${userProfile.incomeDebt.downPaymentAmount}
Credit Score Range: ${userProfile.incomeDebt.creditScore}
Employment: ${userProfile.employment.jobTitle} at ${userProfile.employment.employerName} (${userProfile.employment.yearsAtJob} years)
Location Preference: ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}
Max Budget: $${userProfile.location.maxBudget}
Property Type: ${userProfile.location.homeType}
Timeline: ${userProfile.location.timeframe}
First-time Buyer: ${userProfile.location.firstTimeBuyer ? 'Yes' : 'No'}
Risk Tolerance: ${preferences.riskTolerance || 'moderate'}

${marketContextInstruction}

**OUTPUT PREFIX: ANALYSIS_RESULT:**`;
  }

  /**
   * Generate fallback markdown content when AI fails
   * Enhanced with null-safety to prevent runtime errors
   */
  private generateFallbackMarkdown(input: PlanGenerationInput): string {
    const { userProfile, preferences } = input;
    const language = preferences.language || 'en';
    const isEnglish = language === 'en';

    // Safe numerical calculations with defaults
    const annualIncome = userProfile?.incomeDebt?.annualIncome || 50000;
    const monthlyIncome = annualIncome / 12;
    const monthlyDebts = userProfile?.incomeDebt?.monthlyDebts || 0;
    const downPaymentAmount = userProfile?.incomeDebt?.downPaymentAmount || 0;
    const maxMonthlyPayment = Math.max(0, monthlyIncome * 0.28 - monthlyDebts);
    const estimatedPrice = maxMonthlyPayment * 166; // Rough calculation

    return isEnglish ? `
## 🏠 Your Personalized Home Buying Analysis

### 💰 Financial Overview
- **Annual Income**: $${annualIncome.toLocaleString()}
- **Monthly Income**: $${monthlyIncome.toLocaleString()}
- **Current Monthly Debts**: $${monthlyDebts.toLocaleString()}
- **Available Down Payment**: $${downPaymentAmount.toLocaleString()}

### 🎯 Affordability Assessment
Based on your financial profile, here's what you can afford:

| Category | Amount |
|----------|--------|
| **Estimated Home Price** | $${Math.round(estimatedPrice).toLocaleString()} |
| **Recommended Monthly Payment** | $${Math.round(maxMonthlyPayment).toLocaleString()} |
| **Estimated Closing Costs** | $${Math.round(estimatedPrice * 0.03).toLocaleString()} |

### 🏆 Recommended Loan Programs
1. **${userProfile?.location?.firstTimeBuyer ? 'FHA Loan' : 'Conventional Loan'}**
   - Suitable for your buyer profile
   - Competitive interest rates
   - ${userProfile?.location?.firstTimeBuyer ? 'Low down payment options (3.5%)' : 'Standard down payment (5-20%)'}

### 📋 Action Plan
1. **Review Credit Report** - Check for errors and improve score if needed
2. **Get Pre-approved** - Obtain formal approval from lenders
3. **Find Real Estate Agent** - Work with local market expert
4. **Start House Hunting** - Focus on properties in your price range
5. **Make Competitive Offers** - Be prepared to act quickly

### 💡 Expert Tips
- **Get pre-approved first** - This strengthens your offers
- **Compare multiple lenders** - Rates and terms can vary significantly
- **Budget for closing costs** - Typically 2-5% of home price
- **Keep emergency funds** - Don't use all savings for down payment

### ⚠️ Important Notes
This analysis is automatically generated based on general guidelines. **Consult with a qualified mortgage advisor** for personalized recommendations based on current market conditions and your specific situation.
` : `
## 🏠 Tu Análisis Personalizado de Compra de Casa

### 💰 Resumen Financiero
- **Ingresos Anuales**: $${annualIncome.toLocaleString()}
- **Ingresos Mensuales**: $${monthlyIncome.toLocaleString()}
- **Deudas Mensuales Actuales**: $${monthlyDebts.toLocaleString()}
- **Enganche Disponible**: $${downPaymentAmount.toLocaleString()}

### 🎯 Evaluación de Capacidad
Basado en tu perfil financiero, esto es lo que puedes pagar:

| Categoría | Cantidad |
|-----------|----------|
| **Precio Estimado de Casa** | $${Math.round(estimatedPrice).toLocaleString()} |
| **Pago Mensual Recomendado** | $${Math.round(maxMonthlyPayment).toLocaleString()} |
| **Costos de Cierre Estimados** | $${Math.round(estimatedPrice * 0.03).toLocaleString()} |

### 🏆 Programas de Préstamo Recomendados
1. **${userProfile?.location?.firstTimeBuyer ? 'Préstamo FHA' : 'Préstamo Convencional'}**
   - Adecuado para tu perfil de comprador
   - Tasas de interés competitivas
   - ${userProfile?.location?.firstTimeBuyer ? 'Opciones de enganche bajo (3.5%)' : 'Enganche estándar (5-20%)'}

### 📋 Plan de Acción
1. **Revisar Reporte de Crédito** - Verificar errores y mejorar puntaje
2. **Obtener Pre-aprobación** - Conseguir aprobación formal de prestamistas
3. **Encontrar Agente Inmobiliario** - Trabajar con experto del mercado local
4. **Comenzar Búsqueda** - Enfocarse en propiedades en tu rango de precio
5. **Hacer Ofertas Competitivas** - Estar preparado para actuar rápidamente

### 💡 Consejos de Expertos
- **Obtén pre-aprobación primero** - Esto fortalece tus ofertas
- **Compara múltiples prestamistas** - Las tasas y términos pueden variar
- **Presupuesta para costos de cierre** - Típicamente 2-5% del precio de la casa
- **Mantén fondos de emergencia** - No uses todos los ahorros para el enganche

### ⚠️ Notas Importantes
Este análisis se genera automáticamente basado en pautas generales. **Consulta con un asesor hipotecario calificado** para recomendaciones personalizadas basadas en las condiciones actuales del mercado y tu situación específica.
`;
  }

  /**
   * Build the prompt for plan generation with enhanced template system
   */
  private buildPrompt(input: PlanGenerationInput, useGrounding: boolean): string {
    return this.generateTemplatedPrompt(input, 'structured', useGrounding);
  }

  /**
   * Build markdown-specific prompt with template system
   */
  private buildMarkdownPrompt(input: PlanGenerationInput, useGrounding: boolean): string {
    return this.generateTemplatedPrompt(input, 'markdown', useGrounding);
  }

  /**
   * Legacy structured prompt builder (fallback when templates unavailable)
   */
  private buildLegacyStructuredPrompt(input: PlanGenerationInput, useGrounding: boolean): string {
    const { userProfile, preferences } = input;
    const language = preferences.language;

    // Base prompt with structured output schema
    const basePrompt = language === 'es' ?
      this.getSpanishPromptTemplate() :
      this.getEnglishPromptTemplate();

    // Add market context for better structured output
    const marketContext = useGrounding ? `

**REAL-TIME MARKET DATA SEARCH:** Use Google Search to find and incorporate current information:
- Current mortgage rates (30-year fixed, FHA, VA, USDA rates) from major lenders
- Real estate market trends in ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}
- First-time homebuyer programs available in ${userProfile.location.preferredState} (with specific program names and requirements)
- Down payment assistance programs for ${userProfile.location.preferredCity} or ${userProfile.location.preferredState}
- Current lending standards and credit requirements for different loan types
- Local housing market data: median home prices, inventory levels, time on market

Include specific, actionable information with program names, contact details, and current rates/requirements.
` : '';

    return `${basePrompt}

**USER PROFILE:**
Income: $${userProfile.incomeDebt.annualIncome}/year
Monthly Debts: $${userProfile.incomeDebt.monthlyDebts}
Down Payment Available: $${userProfile.incomeDebt.downPaymentAmount}
Credit Score Range: ${userProfile.incomeDebt.creditScore}
Employment: ${userProfile.employment.jobTitle} at ${userProfile.employment.employerName} (${userProfile.employment.yearsAtJob} years)
Location Preference: ${userProfile.location.preferredCity}, ${userProfile.location.preferredState}
Max Budget: $${userProfile.location.maxBudget}
Property Type: ${userProfile.location.homeType}
Timeline: ${userProfile.location.timeframe}
First-time Buyer: ${userProfile.location.firstTimeBuyer ? 'Yes' : 'No'}
Risk Tolerance: ${preferences.riskTolerance || 'moderate'}

${marketContext}

**RESPONSE FORMAT:**
Return ONLY a valid JSON object that matches this exact schema structure. Do not include any text before or after the JSON.

{
  "id": "unique-plan-id",
  "userId": "user-id",
  "generatedAt": "ISO timestamp",
  "language": "${language}",
  "affordabilityEstimate": {
    "maxHomePrice": number,
    "recommendedPrice": number,
    "budgetBreakdown": {
      "downPayment": number,
      "monthlyPayment": number,
      "closingCosts": number,
      "emergencyFund": number,
      "totalRequired": number
    },
    "riskAssessment": {
      "riskLevel": "low|moderate|high",
      "factors": ["risk factor 1", "risk factor 2"],
      "recommendation": "detailed risk recommendation"
    },
    "timeframe": "immediate|3-months|6-months|12-months|2-years|5-years",
    "assumptions": ["assumption 1", "assumption 2"],
    "confidence": 0.85
  },
  "programRecommendations": [
    {
      "programType": "fha|va|usda|conventional|jumbo|first-time-buyer|down-payment-assistance",
      "name": "Program Name",
      "description": "Detailed program description",
      "eligibilityScore": 0.9,
      "requirements": ["requirement 1", "requirement 2"],
      "benefits": ["benefit 1", "benefit 2"],
      "costBenefit": {
        "upfrontCosts": number,
        "monthlySavings": number,
        "longTermValue": number,
        "breakEvenMonths": number,
        "netBenefit": number
      },
      "applicationSteps": ["step 1", "step 2"],
      "estimatedTimeline": "timeline description",
      "priority": "high|medium|low"
    }
  ],
  "actionPlan": {
    "overview": "Comprehensive action plan overview",
    "totalSteps": number,
    "estimatedDuration": "duration description",
    "phases": [
      {
        "name": "Phase Name",
        "description": "Phase description",
        "steps": [
          {
            "id": "step-id",
            "title": "Step Title",
            "description": "Detailed step description",
            "category": "preparation|application|documentation|financial|search|closing",
            "priority": "critical|high|medium|low",
            "estimatedTime": "time estimate",
            "dependencies": ["dependency-id"],
            "resources": ["resource 1"],
            "successCriteria": [
              {
                "metric": "metric name",
                "target": "target value",
                "timeframe": "timeframe",
                "measurable": true
              }
            ],
            "dueDate": "date",
            "completed": false
          }
        ]
      }
    ],
    "criticalPath": ["step-id-1", "step-id-2"],
    "riskMitigation": [
      {
        "risk": "risk description",
        "impact": "low|medium|high",
        "mitigation": "mitigation strategy"
      }
    ]
  },
  "confidence": 0.85,
  "lastUpdated": "ISO timestamp",
  "version": "1.0",
  "isValid": true,
  "validationErrors": []
}`;
  }

  /**
   * English prompt template
   */
  private getEnglishPromptTemplate(): string {
    return `You are an expert mortgage advisor and home buying consultant. Generate a comprehensive, personalized home buying plan based on the user's financial profile and preferences.

**IMPORTANT GUIDELINES:**
1. All financial calculations must be realistic and based on current market conditions
2. Consider debt-to-income ratios, credit scores, and employment stability
3. Recommend only programs the user is likely to qualify for
4. Provide actionable, specific steps with realistic timelines
5. Include risk assessments and contingency planning
6. Focus on the user's stated preferences and constraints
7. Ensure all recommendations are financially responsible`;
  }

  /**
   * Spanish prompt template
   */
  private getSpanishPromptTemplate(): string {
    return `Eres un asesor hipotecario experto y consultor de compra de vivienda. Genera un plan integral y personalizado para la compra de vivienda basado en el perfil financiero y las preferencias del usuario.

**PAUTAS IMPORTANTES:**
1. Todos los cálculos financieros deben ser realistas y basados en las condiciones actuales del mercado
2. Considera las relaciones deuda-ingresos, puntajes crediticios y estabilidad laboral
3. Recomienda solo programas para los que el usuario probablemente califique
4. Proporciona pasos específicos y accionables con cronogramas realistas
5. Incluye evaluaciones de riesgo y planificación de contingencias
6. Enfócate en las preferencias y restricciones declaradas por el usuario
7. Asegúrate de que todas las recomendaciones sean financieramente responsables`;
  }

  /**
   * Parse and validate Gemini response with structured output validation
   */
  private parseAndValidateResponse(
    response: string,
    input: PlanGenerationInput,
    isStructuredOutput: boolean = false
  ): PersonalizedPlan {
    try {
      let cleanResponse: string;
      let parsedResponse: any;

      if (isStructuredOutput) {
        // For structured output, the response should already be clean JSON
        cleanResponse = response.trim();
        console.log('📊 Processing structured output response (pre-validated JSON)');

        try {
          parsedResponse = JSON.parse(cleanResponse);
          console.log('✅ Structured output parsed successfully');
        } catch (parseError) {
          console.warn('⚠️ Structured output parsing failed, falling back to manual cleaning');
          // Fallback to manual cleaning if structured output somehow failed
          cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
          parsedResponse = JSON.parse(cleanResponse);
        }
      } else {
        // Legacy parsing with manual cleaning
        cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        console.log('📝 Processing legacy response with manual JSON extraction');

        try {
          parsedResponse = JSON.parse(cleanResponse);
        } catch (parseError) {
          throw new GeminiValidationError(
            'Failed to parse Gemini response as JSON',
            [`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`]
          );
        }
      }

      // Add required fields if missing
      if (!parsedResponse.id) {
        parsedResponse.id = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!parsedResponse.userId) {
        parsedResponse.userId = input.userProfile.contact.email;
      }
      if (!parsedResponse.generatedAt) {
        parsedResponse.generatedAt = new Date().toISOString();
      }
      if (!parsedResponse.lastUpdated) {
        parsedResponse.lastUpdated = new Date().toISOString();
      }
      if (!parsedResponse.version) {
        parsedResponse.version = '1.0';
      }

      // Validate with Zod schema
      const validatedPlan = PersonalizedPlanSchema.parse(parsedResponse);

      return validatedPlan;

    } catch (error) {
      if (error instanceof GeminiValidationError) {
        throw error;
      }

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as any;
        const validationErrors = zodError.issues?.map((issue: any) =>
          `${issue.path.join('.')}: ${issue.message}`
        ) || ['Unknown validation error'];

        console.error('🔴 Gemini output validation failed with errors:', validationErrors);
        console.error('📄 Raw response that failed validation:', response.substring(0, 1000) + '...');

        throw new GeminiValidationError(
          'Plan validation failed',
          validationErrors
        );
      }

      throw new GeminiValidationError(
        'Unknown validation error',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }

  /**
   * Generate fallback plan when Gemini API fails
   */
  private generateFallbackPlan(input: PlanGenerationInput): PersonalizedPlan {
    const { userProfile, preferences } = input;
    const language = preferences.language;

    // Calculate basic affordability
    const monthlyIncome = userProfile.incomeDebt.annualIncome / 12;
    const debtToIncomeRatio = userProfile.incomeDebt.monthlyDebts / monthlyIncome;
    const maxMonthlyPayment = Math.max(0, monthlyIncome * 0.28 - userProfile.incomeDebt.monthlyDebts);
    const maxHomePrice = Math.min(
      userProfile.location.maxBudget,
      maxMonthlyPayment * 12 * 4 // Rough estimate
    );

    const fallbackPlan: PersonalizedPlan = {
      id: `fallback-plan-${Date.now()}`,
      userId: userProfile.contact.email,
      generatedAt: new Date().toISOString(),
      language,
      affordabilityEstimate: {
        maxHomePrice: Math.round(maxHomePrice),
        recommendedPrice: Math.round(maxHomePrice * 0.8),
        budgetBreakdown: {
          downPayment: userProfile.incomeDebt.downPaymentAmount,
          monthlyPayment: Math.round(maxMonthlyPayment),
          closingCosts: Math.round(maxHomePrice * 0.03),
          emergencyFund: Math.round(monthlyIncome * 3),
          totalRequired: Math.round(
            userProfile.incomeDebt.downPaymentAmount +
            maxHomePrice * 0.03 +
            monthlyIncome * 3
          )
        },
        riskAssessment: {
          riskLevel: debtToIncomeRatio > 0.36 ? 'high' : debtToIncomeRatio > 0.28 ? 'moderate' : 'low',
          factors: [
            language === 'es'
              ? `Relación deuda-ingresos: ${(debtToIncomeRatio * 100).toFixed(1)}%`
              : `Debt-to-income ratio: ${(debtToIncomeRatio * 100).toFixed(1)}%`
          ],
          recommendation: language === 'es'
            ? 'Plan generado automáticamente. Consulte con un asesor para recomendaciones personalizadas.'
            : 'Automatically generated plan. Consult with an advisor for personalized recommendations.'
        },
        timeframe: 'immediate',
        assumptions: [
          language === 'es'
            ? 'Cálculos basados en estimaciones generales'
            : 'Calculations based on general estimates'
        ],
        confidence: 0.6
      },
      programRecommendations: [
        {
          programType: userProfile.location.firstTimeBuyer ? 'first-time-buyer' : 'conventional',
          name: language === 'es' ? 'Programa Convencional' : 'Conventional Loan Program',
          description: language === 'es'
            ? 'Préstamo hipotecario estándar con términos competitivos'
            : 'Standard mortgage loan with competitive terms',
          eligibilityScore: 0.7,
          requirements: [
            language === 'es' ? 'Verificación de ingresos' : 'Income verification'
          ],
          benefits: [
            language === 'es' ? 'Tasas competitivas' : 'Competitive rates'
          ],
          costBenefit: {
            upfrontCosts: Math.round(maxHomePrice * 0.03),
            monthlySavings: 0,
            longTermValue: 0,
            breakEvenMonths: 0,
            netBenefit: 0
          },
          applicationSteps: [
            language === 'es' ? 'Solicitar precalificación' : 'Apply for pre-qualification'
          ],
          estimatedTimeline: language === 'es' ? '30-45 días' : '30-45 days',
          priority: 'medium'
        }
      ],
      actionPlan: {
        overview: language === 'es'
          ? 'Plan básico generado automáticamente para la compra de vivienda.'
          : 'Basic automatically generated home buying plan.',
        totalSteps: 3,
        estimatedDuration: language === 'es' ? '60-90 días' : '60-90 days',
        phases: [
          {
            name: language === 'es' ? 'Preparación' : 'Preparation',
            description: language === 'es'
              ? 'Preparar documentación y finanzas'
              : 'Prepare documentation and finances',
            steps: [
              {
                id: 'prep-1',
                title: language === 'es' ? 'Revisar crédito' : 'Review credit',
                description: language === 'es'
                  ? 'Obtener y revisar reporte de crédito'
                  : 'Obtain and review credit report',
                category: 'preparation',
                priority: 'high',
                estimatedTime: language === 'es' ? '1 semana' : '1 week',
                dependencies: [],
                resources: [],
                successCriteria: [
                  {
                    metric: language === 'es' ? 'Reporte obtenido' : 'Report obtained',
                    target: language === 'es' ? 'Sí' : 'Yes',
                    timeframe: language === 'es' ? '1 semana' : '1 week',
                    measurable: true
                  }
                ],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                completed: false
              }
            ]
          }
        ],
        criticalPath: ['prep-1'],
        riskMitigation: [
          {
            risk: language === 'es'
              ? 'Plan generado automáticamente sin análisis detallado'
              : 'Automatically generated plan without detailed analysis',
            impact: 'medium',
            mitigation: language === 'es'
              ? 'Consultar con un asesor hipotecario profesional'
              : 'Consult with a professional mortgage advisor'
          }
        ]
      },
      confidence: 0.6,
      lastUpdated: new Date().toISOString(),
      version: '1.0-fallback',
      isValid: true,
      validationErrors: []
    };

    return fallbackPlan;
  }

  /**
   * Enhanced error classification for better retry decisions
   */
  private classifyError(error: any): GeminiError {
    // Network and connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return new GeminiError(
        `Network error: ${error.message}`,
        error.code,
        true,
        'NETWORK_ERROR'
      );
    }

    // HTTP status code based classification
    if (error.response?.status || error.status) {
      const status = error.response?.status || error.status;

      if (status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 60;
        return new GeminiError(
          'Rate limit exceeded',
          'RATE_LIMITED',
          true,
          'RATE_LIMIT',
          status,
          parseInt(retryAfter, 10)
        );
      }

      if (status === 401 || status === 403) {
        return new GeminiError(
          'Authentication failed',
          'AUTH_ERROR',
          false,
          'AUTHENTICATION_ERROR',
          status
        );
      }

      if (status >= 500) {
        return new GeminiError(
          `Server error: ${status}`,
          'SERVER_ERROR',
          true,
          'API_ERROR',
          status
        );
      }

      if (status >= 400) {
        return new GeminiError(
          `Client error: ${status}`,
          'CLIENT_ERROR',
          false,
          'VALIDATION_ERROR',
          status
        );
      }
    }

    // Timeout errors
    if (error.message?.includes('timeout') || error.code === 'REQUEST_TIMEOUT') {
      return new GeminiError(
        'Request timeout',
        'TIMEOUT',
        true,
        'TIMEOUT'
      );
    }

    // API specific errors
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return new GeminiError(
        'API quota exceeded',
        'QUOTA_EXCEEDED',
        true,
        'RATE_LIMIT'
      );
    }

    if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      return new GeminiError(
        'Content blocked by safety filters',
        'CONTENT_BLOCKED',
        false,
        'VALIDATION_ERROR'
      );
    }

    // Default classification
    return new GeminiError(
      error.message || 'Unknown API error',
      'UNKNOWN_ERROR',
      true,
      'API_ERROR'
    );
  }

  /**
   * Circuit breaker logic to prevent cascading failures
   */
  private checkCircuitBreaker(): boolean {
    const now = Date.now();

    switch (this.circuitBreakerState.state) {
      case 'OPEN':
        if (now >= this.circuitBreakerState.nextAttemptTime) {
          console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
          this.circuitBreakerState.state = 'HALF_OPEN';
          return true;
        }
        console.warn('⛔ Circuit breaker is OPEN, blocking request');
        throw new GeminiError(
          'Circuit breaker is open - too many recent failures',
          'CIRCUIT_BREAKER_OPEN',
          false,
          'API_ERROR'
        );

      case 'HALF_OPEN':
      case 'CLOSED':
        return true;

      default:
        return true;
    }
  }

  /**
   * Update circuit breaker state based on operation result
   */
  private updateCircuitBreaker(success: boolean): void {
    if (success) {
      if (this.circuitBreakerState.state === 'HALF_OPEN') {
        console.log('✅ Circuit breaker transitioning to CLOSED after successful request');
        this.circuitBreakerState.state = 'CLOSED';
      }
      this.circuitBreakerState.failures = 0;
    } else {
      this.circuitBreakerState.failures++;
      this.circuitBreakerState.lastFailureTime = Date.now();

      if (this.circuitBreakerState.failures >= this.retryConfig.circuitBreakerThreshold) {
        console.error(`🔴 Circuit breaker OPENING after ${this.circuitBreakerState.failures} failures`);
        this.circuitBreakerState.state = 'OPEN';
        this.circuitBreakerState.nextAttemptTime = Date.now() + this.retryConfig.circuitBreakerResetTime;
      }
    }
  }

  /**
   * Calculate adaptive backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number, error: GeminiError): number {
    let baseDelay = this.retryConfig.baseDelay;

    // Adaptive backoff based on error type
    if (this.retryConfig.adaptiveBackoff) {
      switch (error.errorType) {
        case 'RATE_LIMIT':
          // Use retry-after header if available, otherwise longer delay
          baseDelay = (error.retryAfter || 60) * 1000;
          break;
        case 'NETWORK_ERROR':
          // Longer delays for network issues
          baseDelay = this.retryConfig.baseDelay * 2;
          break;
        case 'TIMEOUT':
          // Moderate delays for timeouts
          baseDelay = this.retryConfig.baseDelay * 1.5;
          break;
        default:
          baseDelay = this.retryConfig.baseDelay;
      }
    }

    // Exponential backoff
    const exponentialDelay = baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);

    // Apply max delay limit
    const cappedDelay = Math.min(exponentialDelay, this.retryConfig.maxDelay);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * this.retryConfig.maxJitterMs;

    const finalDelay = cappedDelay + jitter;

    console.log(`⏱️ Backoff delay: ${finalDelay.toFixed(0)}ms (base: ${baseDelay}ms, attempt: ${attempt}, error: ${error.errorType})`);

    return finalDelay;
  }

  /**
   * Enhanced retry mechanism with exponential backoff and circuit breaker
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // Check circuit breaker before starting
    this.checkCircuitBreaker();

    let lastClassifiedError: GeminiError;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation();

        // Update circuit breaker on success
        this.updateCircuitBreaker(true);

        if (attempt > 0) {
          console.log(`✅ Operation succeeded after ${attempt + 1} attempts`);
        }

        return result;
      } catch (error) {
        // Classify the error for better retry decisions
        const classifiedError = error instanceof GeminiError ? error : this.classifyError(error);
        lastClassifiedError = classifiedError;

        // Update circuit breaker on failure
        this.updateCircuitBreaker(false);

        console.warn(`🔴 Attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1} failed: ${classifiedError.message} (type: ${classifiedError.errorType})`);

        // Don't retry validation errors or non-retryable errors
        if (error instanceof GeminiValidationError || !classifiedError.retryable) {
          console.error(`❌ Error is not retryable, failing immediately`);
          throw classifiedError;
        }

        // Don't retry on the last attempt
        if (attempt === this.retryConfig.maxRetries) {
          console.error(`❌ Max retries (${this.retryConfig.maxRetries}) exceeded`);
          break;
        }

        // Calculate delay with enhanced backoff
        const delay = this.calculateBackoffDelay(attempt, classifiedError);

        console.warn(`⏳ Retrying in ${delay.toFixed(0)}ms... (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Check circuit breaker before next attempt
        try {
          this.checkCircuitBreaker();
        } catch (circuitError) {
          console.error('❌ Circuit breaker prevented retry');
          throw circuitError;
        }
      }
    }

    throw lastClassifiedError!;
  }
}

/**
 * Factory function to create Gemini client with environment configuration
 */
export function createGeminiClient(
  customConfig?: Partial<GeminiConfig>,
  customRetryConfig?: Partial<EnhancedRetryConfig>,
  customStructuredConfig?: Partial<StructuredOutputConfig>,
  customPerformanceConfig?: Partial<PerformanceConfig>,
  customPromptConfig?: Partial<PromptConfig>
): GeminiPlanningClient {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY environment variable is required');
  }

  return new GeminiPlanningClient(
    { apiKey, ...customConfig },
    customRetryConfig,
    customStructuredConfig,
    customPerformanceConfig,
    customPromptConfig
  );
}