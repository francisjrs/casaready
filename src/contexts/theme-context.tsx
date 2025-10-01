'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'casaready-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get saved theme from localStorage
    const savedTheme = window.localStorage.getItem(storageKey) as Theme | 'system' | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
      return;
    }
    if (savedTheme === 'system') {
      window.localStorage.setItem(storageKey, 'light');
      setThemeState('light');
      document.cookie = `${storageKey}=light;path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      return;
    }

    window.localStorage.setItem(storageKey, defaultTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add new theme class
    root.classList.add(theme);

    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        theme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.cookie = `${storageKey}=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, [storageKey, theme]);

  const setTheme = (newTheme: Theme) => {
    const resolvedTheme = newTheme === 'system' ? 'light' : newTheme;
    setThemeState(resolvedTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, resolvedTheme);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${storageKey}=${resolvedTheme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme: theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
