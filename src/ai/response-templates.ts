import type { PersonalizedPlan, AffordabilityEstimate, ProgramRecommendation, ActionPlan } from '@/validators/planning-schemas';

/**
 * Bilingual response templates for rendering personalized plans
 * Supports English and Spanish with proper formatting and guardrails
 */

export interface TemplateConfig {
  language: 'en' | 'es';
  includeDisclaimer: boolean;
  formatCurrency: boolean;
  showConfidence: boolean;
}

const DEFAULT_CONFIG: TemplateConfig = {
  language: 'en',
  includeDisclaimer: true,
  formatCurrency: true,
  showConfidence: true
};

/**
 * Format currency values with proper localization
 */
function formatCurrency(amount: number, language: 'en' | 'es'): string {
  const locale = language === 'es' ? 'es-US' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentage values
 */
function formatPercentage(value: number, language: 'en' | 'es'): string {
  const locale = language === 'es' ? 'es-US' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

/**
 * Get localized text
 */
const getText = (key: string, language: 'en' | 'es'): string => {
  const texts = {
    en: {
      // Headers
      'plan.title': 'Your Personalized Home Buying Plan',
      'affordability.title': 'Affordability Assessment',
      'programs.title': 'Recommended Programs',
      'actions.title': 'Action Plan',

      // Affordability
      'affordability.maxPrice': 'Maximum Home Price',
      'affordability.recommended': 'Recommended Price Range',
      'affordability.downPayment': 'Down Payment Required',
      'affordability.monthlyPayment': 'Estimated Monthly Payment',
      'affordability.closingCosts': 'Closing Costs',
      'affordability.emergencyFund': 'Emergency Fund Needed',
      'affordability.totalRequired': 'Total Cash Required',
      'affordability.riskLevel': 'Risk Level',
      'affordability.confidence': 'Confidence Level',

      // Risk levels
      'risk.low': 'Low Risk',
      'risk.moderate': 'Moderate Risk',
      'risk.high': 'High Risk',

      // Programs
      'program.eligibility': 'Eligibility Score',
      'program.priority': 'Priority',
      'program.requirements': 'Requirements',
      'program.benefits': 'Benefits',
      'program.timeline': 'Estimated Timeline',
      'program.upfrontCosts': 'Upfront Costs',
      'program.monthlySavings': 'Monthly Savings',
      'program.netBenefit': 'Net Benefit',

      // Priority levels
      'priority.high': 'High Priority',
      'priority.medium': 'Medium Priority',
      'priority.low': 'Low Priority',

      // Action plan
      'actions.overview': 'Overview',
      'actions.duration': 'Estimated Duration',
      'actions.totalSteps': 'Total Steps',
      'actions.phases': 'Phases',
      'actions.criticalPath': 'Critical Path',
      'actions.riskMitigation': 'Risk Mitigation',

      // Step details
      'step.category': 'Category',
      'step.priority': 'Priority',
      'step.time': 'Estimated Time',
      'step.dependencies': 'Dependencies',
      'step.resources': 'Resources',
      'step.success': 'Success Criteria',
      'step.dueDate': 'Due Date',

      // Categories
      'category.preparation': 'Preparation',
      'category.application': 'Application',
      'category.documentation': 'Documentation',
      'category.financial': 'Financial',
      'category.search': 'Property Search',
      'category.closing': 'Closing',

      // Step priorities
      'stepPriority.critical': 'Critical',
      'stepPriority.high': 'High',
      'stepPriority.medium': 'Medium',
      'stepPriority.low': 'Low',

      // Disclaimers
      'disclaimer.title': 'Important Disclaimer',
      'disclaimer.text': '⚠️ This plan is for informational purposes only and should not be considered financial advice. Mortgage rates, programs, and requirements change frequently. Please consult with a licensed mortgage professional before making any financial decisions.',
      'disclaimer.confidence': 'This plan was generated with {confidence} confidence based on the information provided.',
      'disclaimer.updated': 'Last updated: {date}',

      // General
      'generated.at': 'Generated on',
      'version': 'Version',
      'contact.advisor': 'Contact a licensed advisor for personalized guidance',
      'learn.more': 'Learn More',
      'get.started': 'Get Started',
      'view.details': 'View Details'
    },
    es: {
      // Headers
      'plan.title': 'Tu Plan Personalizado para Comprar Casa',
      'affordability.title': 'Evaluación de Capacidad de Pago',
      'programs.title': 'Programas Recomendados',
      'actions.title': 'Plan de Acción',

      // Affordability
      'affordability.maxPrice': 'Precio Máximo de Vivienda',
      'affordability.recommended': 'Rango de Precio Recomendado',
      'affordability.downPayment': 'Pago Inicial Requerido',
      'affordability.monthlyPayment': 'Pago Mensual Estimado',
      'affordability.closingCosts': 'Costos de Cierre',
      'affordability.emergencyFund': 'Fondo de Emergencia Necesario',
      'affordability.totalRequired': 'Efectivo Total Requerido',
      'affordability.riskLevel': 'Nivel de Riesgo',
      'affordability.confidence': 'Nivel de Confianza',

      // Risk levels
      'risk.low': 'Riesgo Bajo',
      'risk.moderate': 'Riesgo Moderado',
      'risk.high': 'Riesgo Alto',

      // Programs
      'program.eligibility': 'Puntuación de Elegibilidad',
      'program.priority': 'Prioridad',
      'program.requirements': 'Requisitos',
      'program.benefits': 'Beneficios',
      'program.timeline': 'Cronograma Estimado',
      'program.upfrontCosts': 'Costos Iniciales',
      'program.monthlySavings': 'Ahorros Mensuales',
      'program.netBenefit': 'Beneficio Neto',

      // Priority levels
      'priority.high': 'Prioridad Alta',
      'priority.medium': 'Prioridad Media',
      'priority.low': 'Prioridad Baja',

      // Action plan
      'actions.overview': 'Resumen',
      'actions.duration': 'Duración Estimada',
      'actions.totalSteps': 'Pasos Totales',
      'actions.phases': 'Fases',
      'actions.criticalPath': 'Ruta Crítica',
      'actions.riskMitigation': 'Mitigación de Riesgos',

      // Step details
      'step.category': 'Categoría',
      'step.priority': 'Prioridad',
      'step.time': 'Tiempo Estimado',
      'step.dependencies': 'Dependencias',
      'step.resources': 'Recursos',
      'step.success': 'Criterios de Éxito',
      'step.dueDate': 'Fecha Límite',

      // Categories
      'category.preparation': 'Preparación',
      'category.application': 'Solicitud',
      'category.documentation': 'Documentación',
      'category.financial': 'Financiero',
      'category.search': 'Búsqueda de Propiedad',
      'category.closing': 'Cierre',

      // Step priorities
      'stepPriority.critical': 'Crítico',
      'stepPriority.high': 'Alto',
      'stepPriority.medium': 'Medio',
      'stepPriority.low': 'Bajo',

      // Disclaimers
      'disclaimer.title': 'Descargo de Responsabilidad Importante',
      'disclaimer.text': '⚠️ Este plan es solo para fines informativos y no debe considerarse asesoramiento financiero. Las tasas hipotecarias, programas y requisitos cambian frecuentemente. Por favor consulte con un profesional hipotecario licenciado antes de tomar cualquier decisión financiera.',
      'disclaimer.confidence': 'Este plan fue generado con {confidence} de confianza basado en la información proporcionada.',
      'disclaimer.updated': 'Última actualización: {date}',

      // General
      'generated.at': 'Generado el',
      'version': 'Versión',
      'contact.advisor': 'Contacta a un asesor licenciado para orientación personalizada',
      'learn.more': 'Aprende Más',
      'get.started': 'Comenzar',
      'view.details': 'Ver Detalles'
    }
  };

  return (texts[language] as any)[key] || key;
};

/**
 * Render affordability estimate as markdown
 */
export function renderAffordabilityEstimate(
  estimate: AffordabilityEstimate,
  config: Partial<TemplateConfig> = {}
): string {
  const { language, formatCurrency: shouldFormat, showConfidence } = { ...DEFAULT_CONFIG, ...config };
  const format = shouldFormat ? (amount: number) => formatCurrency(amount, language) : (amount: number) => `$${amount.toLocaleString()}`;

  return `## ${getText('affordability.title', language)}

### ${getText('affordability.maxPrice', language)}
**${format(estimate.maxHomePrice)}**

### ${getText('affordability.recommended', language)}
**${format(estimate.recommendedPrice)}**

### ${getText('affordability.title', language)}
| ${getText('affordability.downPayment', language)} | ${format(estimate.budgetBreakdown.downPayment)} |
|---|---|
| ${getText('affordability.monthlyPayment', language)} | ${format(estimate.budgetBreakdown.monthlyPayment)} |
| ${getText('affordability.closingCosts', language)} | ${format(estimate.budgetBreakdown.closingCosts)} |
| ${getText('affordability.emergencyFund', language)} | ${format(estimate.budgetBreakdown.emergencyFund)} |
| **${getText('affordability.totalRequired', language)}** | **${format(estimate.budgetBreakdown.totalRequired)}** |

### ${getText('affordability.riskLevel', language)}
**${getText(`risk.${estimate.riskAssessment.riskLevel}`, language)}**

${estimate.riskAssessment.recommendation}

**${language === 'es' ? 'Factores de Riesgo' : 'Risk Factors'}:**
${estimate.riskAssessment.factors.map(factor => `- ${factor}`).join('\n')}

${showConfidence ? `### ${getText('affordability.confidence', language)}
${formatPercentage(estimate.confidence, language)}` : ''}

**${language === 'es' ? 'Supuestos' : 'Assumptions'}:**
${estimate.assumptions.map(assumption => `- ${assumption}`).join('\n')}`;
}

/**
 * Render program recommendations as markdown
 */
export function renderProgramRecommendations(
  programs: ProgramRecommendation[],
  config: Partial<TemplateConfig> = {}
): string {
  const { language, formatCurrency: shouldFormat } = { ...DEFAULT_CONFIG, ...config };
  const format = shouldFormat ? (amount: number) => formatCurrency(amount, language) : (amount: number) => `$${amount.toLocaleString()}`;

  let markdown = `## ${getText('programs.title', language)}\n\n`;

  programs.forEach((program, index) => {
    markdown += `### ${index + 1}. ${program.name}
**${getText(`priority.${program.priority}`, language)}** | **${getText('program.eligibility', language)}: ${formatPercentage(program.eligibilityScore, language)}**

${program.description}

#### ${getText('program.requirements', language)}
${program.requirements.map(req => `- ${req}`).join('\n')}

#### ${getText('program.benefits', language)}
${program.benefits.map(benefit => `- ${benefit}`).join('\n')}

#### ${language === 'es' ? 'Análisis Costo-Beneficio' : 'Cost-Benefit Analysis'}
| | |
|---|---|
| ${getText('program.upfrontCosts', language)} | ${format(program.costBenefit.upfrontCosts)} |
| ${getText('program.monthlySavings', language)} | ${format(program.costBenefit.monthlySavings)} |
| ${getText('program.netBenefit', language)} | ${format(program.costBenefit.netBenefit)} |

#### ${language === 'es' ? 'Pasos de Solicitud' : 'Application Steps'}
${program.applicationSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}

**${getText('program.timeline', language)}:** ${program.estimatedTimeline}

---

`;
  });

  return markdown;
}

/**
 * Render action plan as markdown
 */
export function renderActionPlan(
  actionPlan: ActionPlan,
  config: Partial<TemplateConfig> = {}
): string {
  const { language } = { ...DEFAULT_CONFIG, ...config };

  let markdown = `## ${getText('actions.title', language)}

### ${getText('actions.overview', language)}
${actionPlan.overview}

**${getText('actions.totalSteps', language)}:** ${actionPlan.totalSteps}
**${getText('actions.duration', language)}:** ${actionPlan.estimatedDuration}

`;

  // Render phases
  markdown += `### ${getText('actions.phases', language)}\n\n`;

  actionPlan.phases.forEach((phase, phaseIndex) => {
    markdown += `#### ${phaseIndex + 1}. ${phase.name}
${phase.description}

`;

    phase.steps.forEach((step, stepIndex) => {
      const priorityIcon = step.priority === 'critical' ? '🔴' :
                          step.priority === 'high' ? '🟡' :
                          step.priority === 'medium' ? '🟢' : '⚪';

      markdown += `##### ${stepIndex + 1}. ${step.title} ${priorityIcon}
${step.description}

**${getText('step.category', language)}:** ${getText(`category.${step.category}`, language)}
**${getText('step.priority', language)}:** ${getText(`stepPriority.${step.priority}`, language)}
**${getText('step.time', language)}:** ${step.estimatedTime}
**${getText('step.dueDate', language)}:** ${new Date(step.dueDate).toLocaleDateString(language === 'es' ? 'es-US' : 'en-US')}

`;

      if (step.dependencies.length > 0) {
        markdown += `**${getText('step.dependencies', language)}:** ${step.dependencies.join(', ')}\n\n`;
      }

      if (step.resources.length > 0) {
        markdown += `**${getText('step.resources', language)}:**\n${step.resources.map(resource => `- ${resource}`).join('\n')}\n\n`;
      }

      markdown += `**${getText('step.success', language)}:**\n`;
      step.successCriteria.forEach(criteria => {
        markdown += `- ${criteria.metric}: ${criteria.target} (${criteria.timeframe})\n`;
      });
      markdown += '\n---\n\n';
    });
  });

  // Critical path
  if (actionPlan.criticalPath.length > 0) {
    markdown += `### ${getText('actions.criticalPath', language)}
${language === 'es' ? 'Pasos críticos que deben completarse en orden' : 'Critical steps that must be completed in order'}:

${actionPlan.criticalPath.map((stepId, index) => `${index + 1}. ${stepId}`).join('\n')}

`;
  }

  // Risk mitigation
  if (actionPlan.riskMitigation.length > 0) {
    markdown += `### ${getText('actions.riskMitigation', language)}

`;
    actionPlan.riskMitigation.forEach(risk => {
      const impactIcon = risk.impact === 'high' ? '🔴' : risk.impact === 'medium' ? '🟡' : '🟢';
      markdown += `#### ${risk.risk} ${impactIcon}
**${language === 'es' ? 'Impacto' : 'Impact'}:** ${getText(`risk.${risk.impact}`, language)}
**${language === 'es' ? 'Mitigación' : 'Mitigation'}:** ${risk.mitigation}

`;
    });
  }

  return markdown;
}

/**
 * Render complete personalized plan as markdown
 */
export function renderPersonalizedPlan(
  plan: PersonalizedPlan,
  config: Partial<TemplateConfig> = {}
): string {
  const { language, includeDisclaimer, showConfidence } = { ...DEFAULT_CONFIG, ...config };

  let markdown = `# ${getText('plan.title', language)}

**${getText('generated.at', language)}:** ${new Date(plan.generatedAt).toLocaleDateString(language === 'es' ? 'es-US' : 'en-US')}
**${getText('version', language)}:** ${plan.version}

`;

  if (showConfidence) {
    markdown += `**${getText('affordability.confidence', language)}:** ${formatPercentage(plan.confidence, language)}\n\n`;
  }

  // Render each section
  markdown += renderAffordabilityEstimate(plan.affordabilityEstimate, config) + '\n\n';
  markdown += renderProgramRecommendations(plan.programRecommendations, config) + '\n\n';
  markdown += renderActionPlan(plan.actionPlan, config) + '\n\n';

  // Add disclaimers with guardrails
  if (includeDisclaimer) {
    markdown += `## ${getText('disclaimer.title', language)}

${getText('disclaimer.text', language)}

${getText('disclaimer.confidence', language).replace('{confidence}', formatPercentage(plan.confidence, language))}

${getText('disclaimer.updated', language).replace('{date}', new Date(plan.lastUpdated).toLocaleDateString(language === 'es' ? 'es-US' : 'en-US'))}

---

**${getText('contact.advisor', language)}**

`;
  }

  return markdown;
}

/**
 * Render plan summary for quick overview
 */
export function renderPlanSummary(
  plan: PersonalizedPlan,
  config: Partial<TemplateConfig> = {}
): string {
  const { language, formatCurrency: shouldFormat } = { ...DEFAULT_CONFIG, ...config };
  const format = shouldFormat ? (amount: number) => formatCurrency(amount, language) : (amount: number) => `$${amount.toLocaleString()}`;

  const topProgram = plan.programRecommendations[0];
  const criticalSteps = plan.actionPlan.phases
    .flatMap(phase => phase.steps)
    .filter(step => step.priority === 'critical')
    .length;

  return `# ${language === 'es' ? 'Resumen del Plan' : 'Plan Summary'}

## ${language === 'es' ? 'Tu Capacidad de Compra' : 'Your Buying Power'}
- **${language === 'es' ? 'Precio Máximo' : 'Max Price'}:** ${format(plan.affordabilityEstimate.maxHomePrice)}
- **${language === 'es' ? 'Precio Recomendado' : 'Recommended Price'}:** ${format(plan.affordabilityEstimate.recommendedPrice)}
- **${language === 'es' ? 'Pago Mensual' : 'Monthly Payment'}:** ${format(plan.affordabilityEstimate.budgetBreakdown.monthlyPayment)}

## ${language === 'es' ? 'Programa Principal Recomendado' : 'Top Recommended Program'}
${topProgram ? `**${topProgram.name}** (${getText(`priority.${topProgram.priority}`, language)})
- ${getText('program.eligibility', language)}: ${formatPercentage(topProgram.eligibilityScore, language)}
- ${getText('program.timeline', language)}: ${topProgram.estimatedTimeline}` : (language === 'es' ? 'No hay programas disponibles en este momento.' : 'No programs available at this time.')}

## ${language === 'es' ? 'Próximos Pasos' : 'Next Steps'}
- **${plan.actionPlan.totalSteps}** ${language === 'es' ? 'pasos totales' : 'total steps'}
- **${criticalSteps}** ${language === 'es' ? 'pasos críticos' : 'critical steps'}
- **${plan.actionPlan.estimatedDuration}** ${language === 'es' ? 'duración estimada' : 'estimated duration'}

${plan.confidence < 0.7 ? `⚠️ ${language === 'es' ? 'Recomendamos consultar con un asesor para un análisis más detallado.' : 'We recommend consulting with an advisor for more detailed analysis.'}` : ''}`;
}

/**
 * Validate and sanitize plan data before rendering
 */
export function validatePlanForRendering(plan: PersonalizedPlan): {
  isValid: boolean;
  errors: string[];
  sanitizedPlan?: PersonalizedPlan;
} {
  const errors: string[] = [];

  // Check for required fields
  if (!plan.affordabilityEstimate) {
    errors.push('Missing affordability estimate');
  }

  if (!plan.programRecommendations || plan.programRecommendations.length === 0) {
    errors.push('No program recommendations found');
  }

  if (!plan.actionPlan) {
    errors.push('Missing action plan');
  }

  // Validate financial values
  if (plan.affordabilityEstimate) {
    if (plan.affordabilityEstimate.maxHomePrice <= 0) {
      errors.push('Invalid max home price');
    }
    if (plan.affordabilityEstimate.budgetBreakdown.monthlyPayment < 0) {
      errors.push('Invalid monthly payment');
    }
  }

  // Check confidence level
  if (plan.confidence < 0.5) {
    errors.push('Low confidence plan - may not be reliable');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize sensitive data (if any)
  const sanitizedPlan: PersonalizedPlan = {
    ...plan,
    userId: plan.userId.includes('@') ? plan.userId.replace(/(.{2}).*@/, '$1***@') : plan.userId
  };

  return { isValid: true, errors: [], sanitizedPlan };
}