import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

type ThemePreference = 'light' | 'dark'
type LocalePreference = 'en' | 'es'

type CookieStore = Awaited<ReturnType<typeof cookies>>
type HeaderStore = Awaited<ReturnType<typeof headers>>

function resolveInitialLocale(cookieStore: CookieStore, headerStore: HeaderStore): LocalePreference {
  const localeCookie = cookieStore.get('casaready-locale')?.value
  if (localeCookie === 'es' || localeCookie === 'en') {
    return localeCookie
  }

  const acceptLanguage = headerStore.get('accept-language')?.toLowerCase() ?? ''
  if (acceptLanguage.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

function resolveInitialTheme(cookieStore: CookieStore): ThemePreference {
  const themeCookie = cookieStore.get('casaready-theme')?.value as ThemePreference | undefined
  if (themeCookie === 'dark' || themeCookie === 'light') {
    return themeCookie
  }
  if (themeCookie === 'system') {
    return 'light'
  }

  return 'light'
}

function resolvedThemeClass(theme: ThemePreference): 'dark' | 'light' {
  return theme === 'dark' ? 'dark' : 'light'
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'CasaReady - Smart Home Management Platform',
    template: '%s | CasaReady'
  },
  description: 'Comprehensive home management platform for modern living. Organize, maintain, and optimize your home with smart tools and automation.',
  keywords: [
    'home management',
    'smart home',
    'property management',
    'home automation',
    'real estate',
    'property maintenance'
  ],
  authors: [{ name: 'CasaReady Team' }],
  creator: 'CasaReady',
  metadataBase: new URL('https://casaready.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-ES': '/es'
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://casaready.com',
    title: 'CasaReady - Smart Home Management Platform',
    description: 'Comprehensive home management platform for modern living. Organize, maintain, and optimize your home with smart tools and automation.',
    siteName: 'CasaReady'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CasaReady - Smart Home Management Platform',
    description: 'Comprehensive home management platform for modern living. Organize, maintain, and optimize your home with smart tools and automation.',
    creator: '@casaready'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'verification_token_here',
    yandex: 'verification_token_here'
  }
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const initialLocale = resolveInitialLocale(cookieStore, headerStore)
  const initialTheme = resolveInitialTheme(cookieStore)
  const themeClass = resolvedThemeClass(initialTheme)

  return (
    <html lang={initialLocale} className={themeClass}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers initialLocale={initialLocale} defaultTheme={initialTheme}>
            <div className="min-h-screen bg-background text-foreground">
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
