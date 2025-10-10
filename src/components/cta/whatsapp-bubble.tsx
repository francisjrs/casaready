/**
 * WhatsApp Floating CTA Bubble
 *
 * Persistent, always-visible WhatsApp contact button
 * Optimized for conversion and mobile UX
 *
 * Features:
 * - Highest z-index (tooltip layer) - never obscured
 * - Pulse animation to draw attention
 * - Mobile-optimized positioning (above nav bar)
 * - Desktop positioning (bottom-right corner)
 * - Accessible with proper ARIA labels
 * - Pre-filled message for better UX
 */

'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'

interface WhatsAppBubbleProps {
  /** Phone number in international format (e.g., "+15124122352") */
  phoneNumber?: string
  /** Pre-filled message */
  message?: string
  /** Show on all pages or only wizard */
  showOnAllPages?: boolean
  /** Additional className */
  className?: string
}

export function WhatsAppBubble({
  phoneNumber = '+15124122352',
  message,
  showOnAllPages = false,
  className,
}: WhatsAppBubbleProps) {
  const { t, locale } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)

  // Default messages by locale
  const defaultMessage = locale === 'es'
    ? 'Hola! Vi el formulario de CasaReady y me gustaría más información.'
    : 'Hi! I saw the CasaReady form and would like more information.'

  const finalMessage = message || defaultMessage

  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(finalMessage)}`

  // Accessibility label
  const ariaLabel = locale === 'es'
    ? 'Abrir WhatsApp para chatear con nosotros'
    : 'Open WhatsApp to chat with us'

  return (
    <>
      {/* Mobile: Positioned above bottom nav */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Base styles
          'group flex items-center justify-center',
          'touch-manipulation',

          // Size (touch-friendly)
          'w-14 h-14 md:w-16 md:h-16',

          // Positioning - Mobile (above nav bar)
          'fixed bottom-20 right-4',
          // Positioning - Desktop (bottom-right corner)
          'md:bottom-8 md:right-8',

          // Visual styling
          'bg-[#25D366] hover:bg-[#128C7E]',
          'rounded-full shadow-2xl',
          'border-4 border-white',
          'transition-all duration-300 ease-out',

          // Hover effects
          'hover:scale-110',
          'hover:shadow-[0_0_30px_rgba(37,211,102,0.6)]',

          // Z-index (highest - always visible)
          'z-tooltip',

          // Focus states
          'focus-visible:outline-none',
          'focus-visible:ring-4 focus-visible:ring-[#25D366]/50',
          'focus-visible:ring-offset-2',

          className
        )}
      >
        {/* Pulse animation ring */}
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-[#25D366]',
            'animate-ping opacity-75',
            isHovered && 'opacity-0'
          )}
          aria-hidden="true"
        />

        {/* WhatsApp icon */}
        <svg
          className="w-8 h-8 md:w-10 md:h-10 relative z-10 text-white drop-shadow-md"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>

        {/* Tooltip on hover (desktop only) */}
        {isHovered && (
          <span
            className="hidden md:block absolute right-full mr-4 px-4 py-2
                       bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap
                       shadow-xl animate-scale-in
                       before:content-[''] before:absolute before:left-full
                       before:top-1/2 before:-translate-y-1/2
                       before:border-8 before:border-transparent
                       before:border-l-gray-900"
          >
            {locale === 'es' ? '¡Chatea con nosotros!' : 'Chat with us!'}
          </span>
        )}
      </a>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" role="status">
        {locale === 'es'
          ? 'Botón de WhatsApp disponible en la esquina inferior derecha'
          : 'WhatsApp button available at bottom right corner'}
      </div>
    </>
  )
}

/**
 * WhatsApp Bubble with Custom Message for specific pages
 */
interface WhatsAppBubbleWithContextProps extends Omit<WhatsAppBubbleProps, 'message'> {
  /** Page context for customized message */
  context?: 'wizard' | 'results' | 'homepage' | 'contact'
}

export function WhatsAppBubbleWithContext({
  context = 'wizard',
  ...props
}: WhatsAppBubbleWithContextProps) {
  const { locale } = useLanguage()

  // Contextual messages
  const contextMessages = {
    wizard: {
      en: 'Hi! I\'m filling out the homebuyer wizard and have questions.',
      es: 'Hola! Estoy llenando el formulario y tengo preguntas.',
    },
    results: {
      en: 'Hi! I received my homebuyer report and would like to discuss next steps.',
      es: 'Hola! Recibí mi reporte y me gustaría discutir los próximos pasos.',
    },
    homepage: {
      en: 'Hi! I found CasaReady and would like to learn more about buying a home.',
      es: 'Hola! Encontré CasaReady y me gustaría aprender más sobre comprar una casa.',
    },
    contact: {
      en: 'Hi! I\'d like to speak with someone about home buying assistance.',
      es: 'Hola! Me gustaría hablar con alguien sobre ayuda para comprar una casa.',
    },
  }

  const message = contextMessages[context][locale]

  return <WhatsAppBubble {...props} message={message} />
}
