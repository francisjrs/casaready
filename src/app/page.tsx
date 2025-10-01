'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroFormComponent } from '@/components/hero-form'
import { Footer } from '@/components/layout/footer'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useLanguage } from '@/contexts/language-context'

export default function HomePage() {
  const { t, locale } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [focusedCard, setFocusedCard] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle mobile menu keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent background scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleHeroFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      annualIncome: parseIncomeRange(formData.get('annualIncome') as string),
      source: 'Hero Form',
      page: 'Home Page',
      campaign: 'AI Home Buying Assistant',
      language: locale
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitSuccess(true)
        // Reset form
        e.currentTarget.reset()
      } else {
        setSubmitError(result.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const parseIncomeRange = (range: string): number | undefined => {
    if (!range || range === 'Select income range') return undefined

    const ranges = {
      '$30,000 - $50,000': 40000,
      '$50,000 - $75,000': 62500,
      '$75,000 - $100,000': 87500,
      '$100,000 - $150,000': 125000,
      '$150,000+': 200000
    }

    return ranges[range as keyof typeof ranges]
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-[#fff9f3] to-[#f8cfa2]">
      {/* Floating Header with Glass Morphism */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/images/Logo_horizontal.png"
                alt="Sully Ruiz Real Estate - Keller Williams Austin NW"
                width={300}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
                {t('pages.home.nav.features')}
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
                {t('pages.home.nav.howItWorks')}
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
                {t('pages.home.nav.testimonials')}
              </a>
              <LanguageToggle variant="ghost" size="default" />
            </nav>

            {/* Mobile Menu Button with Better Touch Target */}
            <button
              className="md:hidden p-3 text-gray-700 hover:text-brand-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t('pages.home.nav.closeMenu') : t('pages.home.nav.openMenu')}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu with Enhanced UX */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={menuRef}
              className="mt-2 bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-6 md:hidden relative z-50"
            >
              <nav className="flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('pages.home.nav.features')}
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('pages.home.nav.howItWorks')}
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('pages.home.nav.testimonials')}
                </a>
                <div className="py-2 min-h-[44px] flex items-center">
                  <LanguageToggle variant="ghost" size="default" />
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 pt-20 sm:pt-24" style={{ scrollPaddingTop: '120px' }}>
        {/* Hero Section with Modern Design */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-brand-200/40 to-brand-300/40 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-brand-400/30 to-brand-500/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brand-100 to-brand-200 border border-brand-300/50">
                  <span className="text-sm font-medium text-brand-800">{t('pages.home.header.badge')}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {t('pages.home.header.title')}{' '}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 bg-clip-text text-transparent">
                      {t('pages.home.header.titleHighlight')}
                    </span>
                    <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-brand-600 to-brand-800 rounded-full"></div>
                  </span>{' '}
                  {t('pages.home.header.titleSuffix')}
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  {t('pages.home.header.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/wizard"
                  className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[48px] text-center"
                >
                  <span className="relative z-10">{t('pages.home.header.ctaPrimary')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-700 to-brand-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <button
                  onClick={() => {
                    const element = document.getElementById('how-it-works')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-brand-400 hover:text-brand-700 transition-all duration-300 min-h-[48px]"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">{t('pages.home.header.ctaSecondary')}</span>
                  <span className="sm:hidden">{t('pages.home.header.ctaSecondaryMobile')}</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-brand-700">{t('pages.home.stats.families')}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('pages.home.stats.familiesLabel')}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-brand-700">{t('pages.home.stats.experience')}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('pages.home.stats.experienceLabel')}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-brand-700">{t('pages.home.stats.languages')}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('pages.home.stats.languagesLabel')}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Sully's Photo & Form */}
            <div className="relative">
              {/* Sully's Professional Headshot */}
              <div className="mb-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/50">
                    <Image
                      src="/images/sully-headshot.jpeg"
                      alt="Sully Ruiz - Your Austin Real Estate Expert"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-brand-600 text-white p-2 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('pages.home.hero.sullyTitle')}</h3>
                  <p className="text-sm text-gray-600 mb-2">{t('pages.home.hero.sullyCompany')}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-brand-600 font-medium">
                    <span>{t('pages.home.hero.sullyBadge')}</span>
                    <span>•</span>
                    <span>{t('pages.home.hero.sullyLanguages')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl p-6 sm:p-8 pb-10 sm:pb-12">
                <div className="mb-6">
                  <h3 id="hero-form" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('pages.home.hero.formTitle')}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{t('pages.home.hero.formSubtitle')}</p>
                </div>

{submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pages.home.hero.successTitle')}</h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('pages.home.hero.successMessage')}</p>
                    <Link
                      href="/wizard"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300"
                    >
                      {t('pages.home.hero.successCta')}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <HeroFormComponent
                    onSubmit={handleHeroFormSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                  />

                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with 2025 Design */}
        <section id="features" className="py-24 bg-white mt-16" style={{ scrollMarginTop: '120px' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-brand-100 to-brand-200 border border-brand-300/50 mb-6">
                <span className="text-sm font-medium text-brand-800">{t('pages.home.features.badge')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('pages.home.features.title')}{' '}
                <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                  {t('pages.home.features.titleHighlight')}
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pages.home.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🏠",
                  title: t('pages.home.features.firstTime.title'),
                  description: t('pages.home.features.firstTime.description')
                },
                {
                  icon: "💼",
                  title: t('pages.home.features.itin.title'),
                  description: t('pages.home.features.itin.description')
                },
                {
                  icon: "🌎",
                  title: t('pages.home.features.bilingual.title'),
                  description: t('pages.home.features.bilingual.description')
                },
                {
                  icon: "📈",
                  title: t('pages.home.features.marketAnalysis.title'),
                  description: t('pages.home.features.marketAnalysis.description')
                },
                {
                  icon: "🤝",
                  title: t('pages.home.features.negotiation.title'),
                  description: t('pages.home.features.negotiation.description')
                },
                {
                  icon: "🏢",
                  title: t('pages.home.features.network.title'),
                  description: t('pages.home.features.network.description')
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  onMouseEnter={() => setFocusedCard(index)}
                  onMouseLeave={() => setFocusedCard(null)}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl transition-opacity duration-300 -z-10 ${
                    focusedCard === index ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-gradient-to-br from-brand-50 to-brand-100" style={{ scrollMarginTop: '120px' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('pages.home.howItWorks.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pages.home.howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: t('pages.home.howItWorks.step1.title'),
                  description: t('pages.home.howItWorks.step1.description')
                },
                {
                  step: "02",
                  title: t('pages.home.howItWorks.step2.title'),
                  description: t('pages.home.howItWorks.step2.description')
                },
                {
                  step: "03",
                  title: t('pages.home.howItWorks.step3.title'),
                  description: t('pages.home.howItWorks.step3.description')
                }
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-brand-600 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl">
                      {item.step}
                    </div>
                    {index < 2 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-brand-300 to-brand-400"></div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/wizard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {t('pages.home.howItWorks.cta')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust Section */}
        <section id="testimonials" className="py-24 bg-white" style={{ scrollMarginTop: '120px' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('pages.home.testimonials.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('pages.home.testimonials.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  quote: t('pages.home.testimonials.maria.quote'),
                  author: t('pages.home.testimonials.maria.author'),
                  role: t('pages.home.testimonials.maria.role'),
                  location: t('pages.home.testimonials.maria.location')
                },
                {
                  quote: t('pages.home.testimonials.james.quote'),
                  author: t('pages.home.testimonials.james.author'),
                  role: t('pages.home.testimonials.james.role'),
                  location: t('pages.home.testimonials.james.location')
                },
                {
                  quote: t('pages.home.testimonials.sarah.quote'),
                  author: t('pages.home.testimonials.sarah.author'),
                  role: t('pages.home.testimonials.sarah.role'),
                  location: t('pages.home.testimonials.sarah.location')
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg">
                  <div className="text-brand-500 mb-4">
                    {"★".repeat(5)}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('pages.home.finalCta.title')}
            </h2>
            <p className="text-xl text-brand-100 mb-10 max-w-3xl mx-auto">
              {t('pages.home.finalCta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wizard"
                className="inline-flex items-center px-8 py-4 bg-white text-brand-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {t('pages.home.finalCta.ctaPrimary')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-brand-700 transition-all duration-300">
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('pages.home.finalCta.ctaSecondary')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
