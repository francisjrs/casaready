'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import { Locale } from '@/lib/i18n';

const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español'
};

const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸'
};

interface LanguageToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export function LanguageToggle({
  variant = 'ghost',
  size = 'default',
  showLabel = false
}: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-2 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label={t('accessibility.languageSelector')}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline-flex items-center gap-1">
            {localeFlags[locale]}
            {showLabel && (
              <span className="font-medium">
                {localeLabels[locale]}
              </span>
            )}
          </span>
          <span className="sr-only">
            {t('accessibility.currentLanguage')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {Object.entries(localeLabels).map(([localeKey, label]) => {
          const localeValue = localeKey as Locale;
          return (
            <DropdownMenuItem
              key={localeKey}
              onClick={() => handleLocaleChange(localeValue)}
              className={`flex items-center gap-2 cursor-pointer ${
                locale === localeValue ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : ''
              }`}
              disabled={locale === localeValue}
            >
              <span className="text-sm" aria-hidden="true">
                {localeFlags[localeValue]}
              </span>
              <span className="font-medium">{label}</span>
              {locale === localeValue && (
                <span className="sr-only">{t('accessibility.currentLanguage')}</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}