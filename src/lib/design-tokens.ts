/**
 * CasaReady Design System - Design Tokens
 *
 * Foundation for predictable, conversion-optimized layouts.
 * Based on 4-point spacing scale with responsive multipliers.
 *
 * @see LAYOUT_PHILOSOPHY.md for rationale
 */

export const designTokens = {
  /**
   * 4-point spacing scale
   * Base values scale with viewport using CSS variables
   */
  spacing: {
    xs: 'var(--spacing-xs)', // 3-5px - Tight elements (icons, badges)
    sm: 'var(--spacing-sm)', // 6-10px - Buttons, tags, compact spacing
    md: 'var(--spacing-md)', // 12-20px - Default card padding, standard gaps
    lg: 'var(--spacing-lg)', // 18-30px - Section padding, generous spacing
    xl: 'var(--spacing-xl)', // 24-40px - Major sections, important separation
    '2xl': 'var(--spacing-2xl)', // 36-60px - Hero sections, dramatic spacing
    '3xl': 'var(--spacing-3xl)', // 48-80px - Page-level spacing, maximum impact
  },

  /**
   * Responsive multipliers for spacing
   * Applied via CSS variables at breakpoints
   */
  spacingMultipliers: {
    mobile: 0.75, // Compact for smaller screens
    tablet: 1.0, // Baseline spacing
    desktop: 1.25, // More generous, luxury feel
  },

  /**
   * Maximum content widths
   * Optimized for readability and conversion focus
   */
  maxWidth: {
    content: '1280px', // Standard page content, full-width sections
    constrained: '896px', // Forms, narrow content, focused reading
    reading: '720px', // Long-form text, blog posts
    full: '100%', // Hero sections, maps, full-bleed images
  },

  /**
   * Layout heights and spacing
   * Dynamic values calculated at runtime
   */
  layout: {
    headerHeight: {
      mobile: '140px',
      tablet: '160px',
      desktop: '140px',
    },
    navHeight: {
      mobile: '72px', // Fixed bottom nav
      desktop: '80px', // Sticky bottom nav
    },
    trustBandHeight: '40px', // Optional trust signals band
    ctaSidebarWidth: '320px', // Desktop sticky CTA sidebar
  },

  /**
   * Z-index scale
   * Prevents overlap conflicts, maintains clear layering
   */
  zIndex: {
    base: 0, // Default content layer
    dropdown: 10, // Dropdowns, popovers
    sticky: 20, // Sticky elements (contact bars, value reminders)
    navigation: 30, // Fixed navigation (header, bottom nav)
    modal: 40, // Modals, overlays
    tooltip: 50, // Tooltips, highest priority UI
  },

  /**
   * Touch target sizes
   * WCAG AA compliant, optimized for mobile
   */
  touchTarget: {
    minimum: '44px', // iOS minimum
    comfortable: '48px', // Material Design standard
    generous: '56px', // Extra room for important CTAs
  },

  /**
   * Breakpoints - Content-specific
   * Named for purpose, not device
   */
  breakpoints: {
    // Standard breakpoints (align with Tailwind)
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',

    // Content-specific breakpoints
    'nav-horizontal': '500px', // Navigation switches to horizontal
    'footer-2col': '600px', // Footer becomes 2 columns
    'footer-4col': '950px', // Footer becomes 4 columns
    'wizard-desktop': '768px', // Wizard gets desktop layout
    'cta-sidebar': '1024px', // Desktop CTA sidebar appears
  },

  /**
   * Typography scale
   * Fluid sizing with clamp() for smooth scaling
   */
  typography: {
    // Font sizes using clamp() for fluid scaling
    sizes: {
      xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', // 12-14px
      sm: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)', // 14-16px
      base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', // 16-18px
      lg: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)', // 18-20px
      xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)', // 20-24px
      '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)', // 24-32px
      '3xl': 'clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)', // 30-40px
      '4xl': 'clamp(2.25rem, 1.75rem + 2vw, 3rem)', // 36-48px
      '5xl': 'clamp(3rem, 2rem + 4vw, 4rem)', // 48-64px
    },

    // Line heights for optimal readability
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
  },

  /**
   * Animation & Transitions
   * Respects prefers-reduced-motion
   */
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  /**
   * Border radius scale
   * Maintains consistent roundness
   */
  borderRadius: {
    sm: '0.25rem', // 4px - Subtle rounding
    md: '0.5rem', // 8px - Standard buttons
    lg: '0.75rem', // 12px - Cards
    xl: '1rem', // 16px - Large cards
    '2xl': '1.5rem', // 24px - Hero sections
    '3xl': '2rem', // 32px - Dramatic rounding
    full: '9999px', // Pills, circles
  },

  /**
   * Shadow scale
   * Creates depth hierarchy
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
} as const

/**
 * Helper type for spacing values
 */
export type SpacingScale = keyof typeof designTokens.spacing

/**
 * Helper type for max width values
 */
export type MaxWidth = keyof typeof designTokens.maxWidth

/**
 * Helper type for z-index layers
 */
export type ZIndexLayer = keyof typeof designTokens.zIndex

/**
 * Helper function to get z-index value
 */
export function getZIndex(layer: ZIndexLayer): number {
  return designTokens.zIndex[layer]
}

/**
 * Helper function to get spacing token
 */
export function getSpacing(scale: SpacingScale): string {
  return designTokens.spacing[scale]
}

/**
 * Helper function to get max width
 */
export function getMaxWidth(width: MaxWidth): string {
  return designTokens.maxWidth[width]
}

export default designTokens
