/**
 * Exit Intent Modal
 *
 * Captures abandoning users before they leave the wizard
 * Critical conversion recovery tool
 *
 * Triggers:
 * - Mouse moves toward close/back button (desktop)
 * - Rapid scroll to top (mobile)
 * - Only after Step 2 (user has invested time)
 * - Max once per session
 *
 * Features:
 * - Email/phone capture to send wizard link
 * - "Save progress" framing (less pushy than "don't leave")
 * - Incentive: "Get personalized homebuying tips"
 * - Z-modal layer, focus trap, escape key handling
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import { X, Mail, Phone, BookmarkPlus } from 'lucide-react'

interface ExitIntentModalProps {
  /** Current wizard step (only show after step 2) */
  currentStep: number
  /** Callback when user submits contact info */
  onCapture: (data: { email?: string; phone?: string }) => Promise<void>
  /** Callback when modal closes */
  onClose: () => void
  /** Additional className */
  className?: string
}

export function ExitIntentModal({
  currentStep,
  onCapture,
  onClose,
  className,
}: ExitIntentModalProps) {
  const { t, locale } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<'email' | 'phone'>('email')

  // Exit intent detection
  useEffect(() => {
    // Only show after step 2, once per session
    if (currentStep < 2 || hasShown) return

    const handleMouseLeave = (e: MouseEvent) => {
      // Desktop: Mouse moving to top of window (likely closing tab)
      if (e.clientY <= 10 && e.relatedTarget === null) {
        triggerModal()
      }
    }

    const handleScroll = () => {
      // Mobile: Rapid scroll to top (bounce effect, likely going back)
      if (window.scrollY < 50 && !hasShown) {
        const lastScroll = sessionStorage.getItem('lastScrollY')
        if (lastScroll && parseInt(lastScroll) > 200) {
          triggerModal()
        }
      }
      sessionStorage.setItem('lastScrollY', window.scrollY.toString())
    }

    const triggerModal = () => {
      if (!hasShown) {
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('exitIntentShown', 'true')
      }
    }

    // Check if already shown this session
    const shown = sessionStorage.getItem('exitIntentShown')
    if (shown) {
      setHasShown(true)
      return
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [currentStep, hasShown])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isVisible])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    onClose()
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (method === 'email' && !email) {
      setError(locale === 'es' ? 'Por favor ingresa tu correo electrónico' : 'Please enter your email')
      return
    }
    if (method === 'phone' && !phone) {
      setError(locale === 'es' ? 'Por favor ingresa tu número de teléfono' : 'Please enter your phone number')
      return
    }

    setIsSubmitting(true)

    try {
      await onCapture({
        email: method === 'email' ? email : undefined,
        phone: method === 'phone' ? phone : undefined,
      })
      handleClose()
    } catch (err) {
      setError(
        locale === 'es'
          ? 'Hubo un error. Por favor intenta de nuevo.'
          : 'There was an error. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  const title = locale === 'es'
    ? '¡Espera! No pierdas tu progreso'
    : 'Wait! Don\'t lose your progress'

  const subtitle = locale === 'es'
    ? 'Te enviaremos un enlace para continuar donde lo dejaste + consejos personalizados para compradores de vivienda'
    : 'We\'ll send you a link to continue where you left off + personalized homebuying tips'

  const emailLabel = locale === 'es' ? 'Correo electrónico' : 'Email address'
  const phoneLabel = locale === 'es' ? 'Número de teléfono' : 'Phone number'
  const submitText = locale === 'es' ? 'Guardar mi progreso' : 'Save my progress'
  const cancelText = locale === 'es' ? 'Continuar sin guardar' : 'Continue without saving'

  return (
    <div
      className={cn(
        // Overlay
        'fixed inset-0 bg-black/50 backdrop-blur-sm',
        'z-modal',
        'flex items-center justify-center',
        'p-md',
        // Animations
        'animate-fade-in',
        className
      )}
      onClick={(e) => {
        // Close on overlay click (not modal content)
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      {/* Modal Card */}
      <div
        className={cn(
          // Size & position
          'relative w-full max-w-md',
          // Styling
          'bg-white rounded-2xl shadow-2xl',
          'p-lg md:p-xl',
          // Animation
          'animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100
                     transition-colors
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-md">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
            <BookmarkPlus className="w-8 h-8 text-brand-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-lg">
          <h2
            id="exit-intent-title"
            className="text-2xl font-bold text-gray-900 mb-sm"
          >
            {title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Method selector */}
        <div className="flex gap-2 mb-md">
          <button
            onClick={() => setMethod('email')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
              'font-medium text-sm transition-all',
              method === 'email'
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Mail className="w-4 h-4" />
            {locale === 'es' ? 'Correo' : 'Email'}
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
              'font-medium text-sm transition-all',
              method === 'phone'
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Phone className="w-4 h-4" />
            {locale === 'es' ? 'Teléfono' : 'Phone'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {method === 'email' ? (
            <div>
              <label htmlFor="exit-email" className="sr-only">
                {emailLabel}
              </label>
              <input
                id="exit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={emailLabel}
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'border-2 border-gray-200',
                  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
                  'transition-colors',
                  'text-base' // Prevent iOS zoom
                )}
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label htmlFor="exit-phone" className="sr-only">
                {phoneLabel}
              </label>
              <input
                id="exit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={phoneLabel}
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'border-2 border-gray-200',
                  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
                  'transition-colors',
                  'text-base' // Prevent iOS zoom
                )}
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full px-6 py-4 rounded-lg',
              'bg-brand-600 hover:bg-brand-700',
              'text-white font-semibold',
              'shadow-lg hover:shadow-xl',
              'transition-all',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-touch'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {locale === 'es' ? 'Guardando...' : 'Saving...'}
              </span>
            ) : (
              submitText
            )}
          </button>

          {/* Cancel link */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700
                       transition-colors underline"
          >
            {cancelText}
          </button>
        </form>

        {/* Trust signals */}
        <div className="mt-lg pt-lg border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            {locale === 'es'
              ? 'Tu información está segura. No compartimos con terceros.'
              : 'Your information is safe. We never share with third parties.'}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage exit intent modal state
 */
export function useExitIntentModal(currentStep: number) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCapture = async (data: { email?: string; phone?: string }) => {
    // TODO: Implement actual API call to save progress + capture lead
    console.log('Exit intent capture:', data)

    // Send to CRM/email service
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        source: 'Exit Intent - Wizard',
        wizardStep: currentStep,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save progress')
    }
  }

  const handleClose = () => {
    setIsModalOpen(false)
  }

  return {
    isModalOpen,
    handleCapture,
    handleClose,
  }
}
