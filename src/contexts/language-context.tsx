'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, translations, getNestedTranslation } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  // Load locale from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('casaready-locale') as Locale;
      if (savedLocale && ['en', 'es'].includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  // Save locale to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casaready-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
    if (typeof document !== 'undefined') {
      document.cookie = `casaready-locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  };

  // Translation function with value interpolation
  const t = (key: string, values?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(translations[locale], key);

    // Replace placeholders with values
    if (values && Object.keys(values).length > 0) {
      Object.entries(values).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), String(value));
      });
    }

    return translation;
  };

  // Check if locale is RTL (none of our supported locales are RTL, but keeping for extensibility)
  const isRTL = false; // Spanish and English are LTR

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.lang !== locale) {
        document.documentElement.lang = locale;
      }
      const desiredDir = isRTL ? 'rtl' : 'ltr';
      if (document.documentElement.dir !== desiredDir) {
        document.documentElement.dir = desiredDir;
      }
    }
  }, [locale, isRTL]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
