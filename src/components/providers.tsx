'use client';

import React, { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Locale } from '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
  initialLocale?: Locale;
  defaultTheme?: 'dark' | 'light' | 'system';
}

export function Providers({
  children,
  initialLocale,
  defaultTheme = 'system'
}: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <LanguageProvider initialLocale={initialLocale}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}