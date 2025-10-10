import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Neutral colors (60% of interface) - text, backgrounds, borders
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        },
        // PRIMARY: Brand Orange (10% of interface - CTAs, primary buttons, links, active states)
        brand: {
          50: '#fef7ed',
          100: '#fdefd5',
          200: '#fadcab',
          300: '#f6c176',
          400: '#f1a03f',
          500: '#e7851e',   // Main brand color
          600: '#d76c14',
          700: '#b35213',
          800: '#904216',
          900: '#763815',
          950: '#401b09'
        },
        // SECONDARY: Blue (part of 30% - info badges, secondary actions, trust indicators)
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',   // Secondary brand color
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a',
          950: '#172554'
        },
        // SEMANTIC: Success (green for confirmations, positive actions)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        // SEMANTIC: Warning (amber for caution states)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        },
        // SEMANTIC: Error (red for errors, destructive actions)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        // SEMANTIC: Info (cyan for informational messages)
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0284c7',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#164e63',
          950: '#083344'
        }
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      },
      spacing: {
        // 8px base unit system for consistent mobile-first spacing
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px  (base unit)
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px (2x base)
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px (3x base)
        8: '2rem',      // 32px (4x base)
        10: '2.5rem',   // 40px (5x base)
        12: '3rem',     // 48px (6x base)
        16: '4rem',     // 64px (8x base)
        18: '4.5rem',   // 72px
        20: '5rem',     // 80px (10x base)
        24: '6rem',     // 96px (12x base)
        88: '22rem',
        112: '28rem',
        128: '32rem',
        // Design System - Responsive spacing tokens
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        // Touch target sizes
        'touch-min': 'var(--touch-minimum)',
        'touch': 'var(--touch-comfortable)',
        'touch-lg': 'var(--touch-generous)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        // Design System - Content widths
        content: 'var(--max-width-content)',
        constrained: 'var(--max-width-constrained)',
      },
      height: {
        header: 'var(--header-height)',
        nav: 'var(--nav-height)',
        'trust-band': 'var(--trust-band-height)',
      },
      width: {
        'cta-sidebar': 'var(--cta-sidebar-width)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        navigation: 'var(--z-navigation)',
        modal: 'var(--z-modal)',
        tooltip: 'var(--z-tooltip)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      screens: {
        xs: '475px',
        // Content-specific breakpoints (named for purpose, not device)
        'nav-horizontal': '500px',    // Navigation switches to horizontal layout
        'footer-2col': '600px',       // Footer becomes 2 columns
        'footer-4col': '950px',       // Footer becomes 4 columns
        'wizard-desktop': '768px',    // Wizard gets desktop layout
        'cta-sidebar': '1024px',      // Desktop CTA sidebar appears
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ]
}

export default config