'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReducedMotion, useHighContrast, colorContrast } from '@/lib/accessibility';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';

interface AccessibilityTestProps {
  className?: string;
}

export function AccessibilityTest({ className }: AccessibilityTestProps) {
  const [focusTest, setFocusTest] = useState(false);
  const [keyboardTest, setKeyboardTest] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();
  const { locale } = useLanguage();
  const { actualTheme } = useTheme();

  const contrastTests = [
    {
      name: 'Brand Primary on White',
      foreground: '#e7851e',
      background: '#ffffff',
      meetsAA: colorContrast.meetsAA('#e7851e', '#ffffff'),
      meetsAAA: colorContrast.meetsAAA('#e7851e', '#ffffff')
    },
    {
      name: 'Brand Primary on Dark',
      foreground: '#e7851e',
      background: '#1f2937',
      meetsAA: colorContrast.meetsAA('#e7851e', '#1f2937'),
      meetsAAA: colorContrast.meetsAAA('#e7851e', '#1f2937')
    },
    {
      name: 'Text on Background',
      foreground: actualTheme === 'dark' ? '#ffffff' : '#000000',
      background: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
      meetsAA: colorContrast.meetsAA(
        actualTheme === 'dark' ? '#ffffff' : '#000000',
        actualTheme === 'dark' ? '#1f2937' : '#ffffff'
      ),
      meetsAAA: colorContrast.meetsAAA(
        actualTheme === 'dark' ? '#ffffff' : '#000000',
        actualTheme === 'dark' ? '#1f2937' : '#ffffff'
      )
    }
  ];

  const handleKeyboardNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setKeyboardTest(true);
      setTimeout(() => setKeyboardTest(false), 2000);
    }
  };

  return (
    <div className={`p-6 border rounded-lg bg-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Accessibility Test Component</h3>

      {/* User Preferences Detection */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">User Preferences</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${prefersReducedMotion ? 'bg-success-500' : 'bg-warning-500'}`} />
            <span>Reduced Motion: {prefersReducedMotion ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${prefersHighContrast ? 'bg-success-500' : 'bg-info-500'}`} />
            <span>High Contrast: {prefersHighContrast ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500" />
            <span>Language: {locale.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span>Theme: {actualTheme}</span>
          </div>
        </div>
      </div>

      {/* Color Contrast Tests */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Color Contrast Compliance</h4>
        <div className="space-y-2">
          {contrastTests.map((test, index) => (
            <div key={index} className="p-3 border rounded text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{test.name}</span>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${test.meetsAA ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'}`}>
                    AA: {test.meetsAA ? 'Pass' : 'Fail'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${test.meetsAAA ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'}`}>
                    AAA: {test.meetsAAA ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: test.background,
                  color: test.foreground
                }}
              >
                Sample text for contrast testing
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Management Test */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Focus Management</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onFocus={() => setFocusTest(true)}
            onBlur={() => setFocusTest(false)}
            className="focus-ring"
          >
            Focus Test Button
          </Button>
          {focusTest && (
            <span className="text-sm text-success-600 self-center">
              ✓ Focus indicator visible
            </span>
          )}
        </div>
      </div>

      {/* Keyboard Navigation Test */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Keyboard Navigation</h4>
        <div
          className="p-3 border rounded cursor-pointer focus-ring"
          tabIndex={0}
          onKeyDown={handleKeyboardNavigation}
          role="button"
          aria-label="Press Enter or Space to test keyboard navigation"
        >
          <span className="text-sm">
            Tab to focus, then press Enter or Space
          </span>
          {keyboardTest && (
            <div className="mt-2 text-sm text-success-600">
              ✓ Keyboard activation successful
            </div>
          )}
        </div>
      </div>

      {/* Screen Reader Test */}
      <div className="space-y-4">
        <h4 className="font-medium">Screen Reader Testing</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="sr-only">This text is only visible to screen readers</span>
            <span>Visible text with hidden context</span>
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-label="Status message area"
            className="p-2 border rounded bg-muted"
          >
            <span>Status: Ready for testing</span>
          </div>
          <div
            role="alert"
            aria-live="assertive"
            className="p-2 border rounded bg-warning-50 text-warning-800"
          >
            Alert: This is a test alert message
          </div>
        </div>
      </div>
    </div>
  );
}