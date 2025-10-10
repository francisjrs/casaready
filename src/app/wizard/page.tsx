'use client'

import Link from 'next/link'
import { InteractiveHomebuyerWizard } from '@/components/wizard/interactive-homebuyer-wizard'
import { Footer } from '@/components/layout/footer'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useLanguage } from '@/contexts/language-context'
import { WhatsAppBubbleWithContext } from '@/components/cta/whatsapp-bubble'
import { TrustBand } from '@/components/trust/trust-signals'

export default function WizardPage() {
  const { t } = useLanguage()

  return (
    <div className="bg-gradient-to-br from-white via-[#fff9f3] to-[#f8cfa2]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg rotate-6"></div>
                <div className="relative h-full w-full bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CR</span>
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
                CasaReady
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-brand-600 transition-colors font-medium"
              >
                {t('wizard.page.backToHome')}
              </Link>
              <LanguageToggle variant="ghost" size="default" />
            </nav>
          </div>
        </div>
      </header>

      {/* Trust Band - Social proof marquee */}
      <TrustBand />

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-brand-100 to-brand-200 border border-brand-300/50 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-brand-800">{t('wizard.page.badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('wizard.page.title')}{' '}
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                {t('wizard.page.titleHighlight')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t('wizard.page.subtitle')}
            </p>
          </div>

          {/* Wizard Component */}
          <InteractiveHomebuyerWizard />

          {/* Support Info */}
          <div className="mt-4 sm:mt-6 md:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              {t('wizard.supportTitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <a
                href="tel:+15124122352"
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-brand-600 hover:text-brand-700 transition-colors"
              >
                <svg className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('wizard.callUs')}
              </a>
              <a
                href="sms:+15124122352"
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-brand-600 hover:text-brand-700 transition-colors"
              >
                <svg className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('wizard.textUs')}
              </a>
              <button className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-brand-600 hover:text-brand-700 transition-colors">
                <svg className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('wizard.liveChat')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp Floating Bubble - Always visible conversion CTA */}
      <WhatsAppBubbleWithContext context="wizard" />

      <Footer />
    </div>
  )
}
