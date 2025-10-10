/**
 * Trust Signal Components
 *
 * Social proof, testimonials, and credibility indicators
 * Strategically placed to reduce friction and build confidence
 *
 * Components:
 * - TrustBand: Scrolling marquee of trust signals (below header)
 * - TestimonialSnippet: Quick quote cards
 * - SocialProofStats: Number-based credibility
 * - CredentialBadges: Certifications, affiliations
 */

'use client'

import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import { Star, Users, Home, Award, Shield } from 'lucide-react'

/* ============================================================================
 * Trust Band - Scrolling marquee of trust signals
 * ============================================================================ */

interface TrustItem {
  icon: React.ComponentType<{ className?: string }>
  text: string
  textEs: string
}

const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  {
    icon: Star,
    text: '4.9/5 from 127 happy homebuyers',
    textEs: '4.9/5 de 127 compradores satisfechos',
  },
  {
    icon: Award,
    text: 'Keller Williams Top Producer 2024',
    textEs: 'Productor Principal de Keller Williams 2024',
  },
  {
    icon: Users,
    text: 'Bilingual service - Servicio en Español',
    textEs: 'Servicio bilingüe - English & Spanish',
  },
  {
    icon: Home,
    text: '$47M+ in homes sold',
    textEs: '$47M+ en casas vendidas',
  },
  {
    icon: Shield,
    text: 'ITIN & first-time buyer specialist',
    textEs: 'Especialista en ITIN y compradores primerizos',
  },
]

interface TrustBandProps {
  items?: TrustItem[]
  className?: string
}

export function TrustBand({ items = DEFAULT_TRUST_ITEMS, className }: TrustBandProps) {
  const { locale } = useLanguage()

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50',
        'border-b border-brand-200',
        'overflow-hidden',
        'py-sm',
        className
      )}
      role="complementary"
      aria-label={locale === 'es' ? 'Señales de confianza' : 'Trust signals'}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item, index) => {
          const Icon = item.icon
          const text = locale === 'es' ? item.textEs : item.text

          return (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-lg text-sm font-medium text-brand-800"
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{text}</span>
              {index < items.length * 2 - 1 && (
                <span className="mx-lg text-brand-300" aria-hidden="true">
                  •
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================================
 * Social Proof Stats - Number-based credibility
 * ============================================================================ */

interface Stat {
  value: string
  label: string
  labelEs: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SocialProofStatsProps {
  stats?: Stat[]
  variant?: 'horizontal' | 'grid'
  className?: string
}

const DEFAULT_STATS: Stat[] = [
  {
    value: '500+',
    label: 'Families helped',
    labelEs: 'Familias ayudadas',
    icon: Users,
  },
  {
    value: '4.9/5',
    label: 'Client satisfaction',
    labelEs: 'Satisfacción del cliente',
    icon: Star,
  },
  {
    value: '$47M+',
    label: 'Homes sold',
    labelEs: 'Casas vendidas',
    icon: Home,
  },
  {
    value: '15+',
    label: 'Years experience',
    labelEs: 'Años de experiencia',
    icon: Award,
  },
]

export function SocialProofStats({
  stats = DEFAULT_STATS,
  variant = 'horizontal',
  className,
}: SocialProofStatsProps) {
  const { locale } = useLanguage()

  return (
    <div
      className={cn(
        variant === 'horizontal' && 'flex flex-wrap justify-center gap-lg',
        variant === 'grid' && 'grid grid-cols-2 md:grid-cols-4 gap-md',
        className
      )}
      role="complementary"
      aria-label={locale === 'es' ? 'Prueba social' : 'Social proof'}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const label = locale === 'es' ? stat.labelEs : stat.label

        return (
          <div
            key={index}
            className="text-center p-md bg-white rounded-lg shadow-sm border border-gray-100"
          >
            {Icon && (
              <div className="flex justify-center mb-sm">
                <Icon className="w-6 h-6 text-brand-600" aria-hidden="true" />
              </div>
            )}
            <div className="text-3xl font-bold text-brand-700 mb-xs">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================================
 * Testimonial Snippet - Quick quote card
 * ============================================================================ */

interface Testimonial {
  quote: string
  quoteEs: string
  author: string
  location: string
  rating?: number
}

interface TestimonialSnippetProps {
  testimonial: Testimonial
  variant?: 'card' | 'inline'
  className?: string
}

export function TestimonialSnippet({
  testimonial,
  variant = 'card',
  className,
}: TestimonialSnippetProps) {
  const { locale } = useLanguage()
  const quote = locale === 'es' ? testimonial.quoteEs : testimonial.quote

  if (variant === 'inline') {
    return (
      <blockquote
        className={cn(
          'border-l-4 border-brand-500 pl-md py-sm',
          'bg-brand-50 rounded-r-lg',
          className
        )}
      >
        <p className="text-gray-700 italic mb-sm">"{quote}"</p>
        <footer className="text-sm text-gray-600">
          — {testimonial.author}, {testimonial.location}
        </footer>
      </blockquote>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md border border-gray-100',
        'p-lg',
        className
      )}
    >
      {/* Rating stars */}
      {testimonial.rating && (
        <div className="flex gap-1 mb-sm" aria-label={`${testimonial.rating} stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i < testimonial.rating!
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 mb-md leading-relaxed">
        "{quote}"
      </blockquote>

      {/* Author */}
      <footer className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
          <span className="text-brand-700 font-semibold">
            {testimonial.author.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{testimonial.author}</div>
          <div className="text-sm text-gray-600">{testimonial.location}</div>
        </div>
      </footer>
    </div>
  )
}

/* ============================================================================
 * Credential Badges - Certifications, affiliations
 * ============================================================================ */

interface Credential {
  name: string
  icon?: React.ComponentType<{ className?: string }>
  imageUrl?: string
}

interface CredentialBadgesProps {
  credentials?: Credential[]
  className?: string
}

const DEFAULT_CREDENTIALS: Credential[] = [
  {
    name: 'Keller Williams',
    icon: Home,
  },
  {
    name: 'TREC Licensed',
    icon: Shield,
  },
  {
    name: 'ITIN Specialist',
    icon: Award,
  },
]

export function CredentialBadges({
  credentials = DEFAULT_CREDENTIALS,
  className,
}: CredentialBadgesProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-md justify-center', className)}
      role="complementary"
      aria-label="Professional credentials"
    >
      {credentials.map((cred, index) => {
        const Icon = cred.icon

        return (
          <div
            key={index}
            className="inline-flex items-center gap-2 px-md py-sm
                       bg-white rounded-lg border border-gray-200
                       text-sm font-medium text-gray-700"
          >
            {Icon && <Icon className="w-4 h-4 text-brand-600" aria-hidden="true" />}
            {cred.imageUrl && (
              <img
                src={cred.imageUrl}
                alt=""
                className="w-4 h-4 object-contain"
                aria-hidden="true"
              />
            )}
            <span>{cred.name}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================================
 * Progress Milestone - Mid-funnel encouragement
 * ============================================================================ */

interface ProgressMilestoneProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressMilestone({
  currentStep,
  totalSteps,
  className,
}: ProgressMilestoneProps) {
  const { locale } = useLanguage()

  // Only show at halfway point
  const isHalfway = currentStep === Math.ceil(totalSteps / 2)
  if (!isHalfway) return null

  const title = locale === 'es' ? '¡Excelente progreso!' : 'Great progress!'
  const subtitle =
    locale === 'es'
      ? 'Ya estás a mitad de camino. Más de 500 familias completaron este formulario.'
      : 'You\'re halfway there! Over 500 families have completed this form.'

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-green-50 to-emerald-50',
        'border border-green-200 rounded-xl',
        'p-lg text-center',
        'animate-slide-in-left',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Celebration icon */}
      <div className="text-4xl mb-sm">🎉</div>

      <h3 className="text-xl font-bold text-gray-900 mb-sm">{title}</h3>
      <p className="text-gray-700 mb-md">{subtitle}</p>

      {/* Value preview */}
      <div className="bg-white rounded-lg p-md border border-green-200">
        <p className="text-sm font-medium text-gray-900 mb-xs">
          {locale === 'es' ? 'Tu reporte incluirá:' : 'Your report will include:'}
        </p>
        <ul className="text-sm text-gray-700 space-y-1 text-left max-w-xs mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>
              {locale === 'es'
                ? 'Programas de asistencia para el pago inicial'
                : 'Down payment assistance programs'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>
              {locale === 'es'
                ? 'Prestamistas amigables con ITIN'
                : 'ITIN-friendly lenders'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>
              {locale === 'es'
                ? 'Vecindarios optimizados por presupuesto'
                : 'Budget-optimized neighborhoods'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>
              {locale === 'es'
                ? 'Subvenciones para compradores primerizos'
                : 'First-time buyer grants'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

/* ============================================================================
 * CSS for marquee animation
 * Add to globals.css:
 *
 * @keyframes marquee {
 *   0% { transform: translateX(0); }
 *   100% { transform: translateX(-50%); }
 * }
 *
 * .animate-marquee {
 *   animation: marquee 30s linear infinite;
 * }
 *
 * .animate-marquee:hover {
 *   animation-play-state: paused;
 * }
 * ============================================================================ */
