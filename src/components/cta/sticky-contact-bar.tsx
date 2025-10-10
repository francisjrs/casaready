/**
 * Sticky Contact Bar
 *
 * Appears below header, provides multiple contact options
 * Creates urgency and accessibility for mobile + desktop
 *
 * Layout Strategy:
 * - z-sticky (20) - below modal, above content
 * - Fixed to top, below header
 * - Responsive: Full bar on desktop, icon bar on mobile
 * - Bilingual support
 */

'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import { Phone, MessageSquare, Mail } from 'lucide-react'

interface ContactOption {
  type: 'phone' | 'sms' | 'whatsapp' | 'email'
  label: string
  labelEs: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  primary?: boolean
}

interface StickyContactBarProps {
  /** Show contact bar */
  visible?: boolean
  /** Custom contact options */
  contactOptions?: ContactOption[]
  /** Additional className */
  className?: string
}

const DEFAULT_CONTACT_OPTIONS: ContactOption[] = [
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    labelEs: 'WhatsApp',
    href: 'https://wa.me/15124122352?text=Hi!%20I%20need%20help%20with%20homebuying',
    icon: MessageSquare,
    primary: true,
  },
  {
    type: 'phone',
    label: 'Call Now',
    labelEs: 'Llamar',
    href: 'tel:+15124122352',
    icon: Phone,
  },
  {
    type: 'sms',
    label: 'Text Us',
    labelEs: 'Enviar SMS',
    href: 'sms:+15124122352',
    icon: MessageSquare,
  },
  {
    type: 'email',
    label: 'Email',
    labelEs: 'Correo',
    href: 'mailto:realtor@sullyruiz.com',
    icon: Mail,
  },
]

export function StickyContactBar({
  visible = true,
  contactOptions = DEFAULT_CONTACT_OPTIONS,
  className,
}: StickyContactBarProps) {
  const { locale } = useLanguage()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!visible) return null

  const messageText = locale === 'es'
    ? '¿Preguntas? Estamos aquí para ayudarte en Inglés y Español'
    : 'Questions? We\'re here to help in English & Español'

  return (
    <aside
      className={cn(
        // Positioning
        'fixed top-[var(--header-height)] left-0 right-0',
        'z-sticky',

        // Visual styling
        'bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50',
        'border-b border-brand-300/50',
        'shadow-md',

        // Animation
        'transform transition-transform duration-300 ease-in-out',
        isCollapsed && '-translate-y-full',

        className
      )}
      aria-label={locale === 'es' ? 'Barra de contacto' : 'Contact bar'}
    >
      <div className="container mx-auto px-md py-sm">
        <div className="flex items-center justify-between gap-md">
          {/* Message - Hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm md:text-base text-brand-900 font-medium">
              💬 {messageText}
            </span>
          </div>

          {/* Contact buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
            {contactOptions.map((option) => {
              const Icon = option.icon
              const label = locale === 'es' ? option.labelEs : option.label

              return (
                <a
                  key={option.type}
                  href={option.href}
                  className={cn(
                    // Base styles
                    'inline-flex items-center justify-center gap-2',
                    'touch-manipulation',
                    'transition-all duration-200',

                    // Size
                    'px-3 py-2 sm:px-4 sm:py-2',
                    'min-h-touch-min',

                    // Visual
                    'rounded-lg',
                    'font-medium text-sm',

                    // Primary variant (WhatsApp)
                    option.primary && [
                      'bg-[#25D366] text-white',
                      'hover:bg-[#128C7E]',
                      'shadow-md hover:shadow-lg',
                      'scale-100 hover:scale-105',
                    ],

                    // Secondary variants
                    !option.primary && [
                      'bg-white text-brand-700',
                      'border border-brand-300',
                      'hover:bg-brand-50',
                      'hover:border-brand-400',
                    ],

                    // Focus states
                    'focus-visible:outline-none',
                    'focus-visible:ring-2',
                    option.primary
                      ? 'focus-visible:ring-[#25D366]/50'
                      : 'focus-visible:ring-brand-500/50',
                    'focus-visible:ring-offset-2'
                  )}
                  aria-label={`${label} - ${option.href}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {/* Show label on tablet+ */}
                  <span className="hidden md:inline">{label}</span>
                  {/* Show label on mobile for primary only */}
                  {option.primary && (
                    <span className="inline md:hidden">{label}</span>
                  )}
                </a>
              )
            })}
          </div>

          {/* Collapse button - Desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center
                       w-8 h-8 rounded-full
                       text-brand-600 hover:bg-brand-200/50
                       transition-colors
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={
              isCollapsed
                ? locale === 'es'
                  ? 'Mostrar barra de contacto'
                  : 'Show contact bar'
                : locale === 'es'
                ? 'Ocultar barra de contacto'
                : 'Hide contact bar'
            }
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-300',
                isCollapsed && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expand hint when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute left-1/2 -translate-x-1/2 top-full
                     px-4 py-1 bg-brand-500 text-white text-xs rounded-b-lg
                     shadow-md hover:bg-brand-600 transition-colors
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label={locale === 'es' ? 'Expandir' : 'Expand'}
        >
          {locale === 'es' ? 'Contacto' : 'Contact'} ▼
        </button>
      )}
    </aside>
  )
}

/**
 * Sticky Contact Bar with scroll behavior
 * Hides on scroll down, shows on scroll up
 */
export function StickyContactBarAutoHide(props: StickyContactBarProps) {
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Handle scroll
  useState(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show if scrolling up, hide if scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })

  return <StickyContactBar {...props} visible={visible} />
}
