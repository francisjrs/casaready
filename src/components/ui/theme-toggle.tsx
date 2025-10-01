'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'default',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const { t } = useLanguage();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      labelEs: 'Claro',
      icon: Sun
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      labelEs: 'Oscuro',
      icon: Moon
    }
  ];

  const currentThemeOption = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentThemeOption?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="gap-2 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label={t('accessibility.darkModeToggle')}
        >
          <CurrentIcon className="h-4 w-4" aria-hidden="true" />
          {showLabel && (
            <span className="hidden sm:inline font-medium">
              {currentThemeOption?.label}
            </span>
          )}
          <span className="sr-only">
            Current theme: {actualTheme}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-2 cursor-pointer ${
                isSelected ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : ''
              }`}
              disabled={isSelected}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">
                {option.label}
              </span>
              {isSelected && (
                <span className="sr-only">Currently selected</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple theme toggle button for quick switching between light/dark
export function SimpleThemeToggle({
  variant = 'ghost',
  size = 'default'
}: Omit<ThemeToggleProps, 'showLabel'>) {
  const { actualTheme, setTheme } = useTheme();
  const { t } = useLanguage();

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className="focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      aria-label={t('accessibility.darkModeToggle')}
    >
      {actualTheme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        Switch to {actualTheme === 'dark' ? 'light' : 'dark'} mode
      </span>
    </Button>
  );
}
