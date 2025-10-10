/**
 * Layout Primitive Components
 *
 * Reusable, composable layout building blocks that enforce
 * the CasaReady Design System spacing and structure rules.
 *
 * @see /src/lib/design-tokens.ts
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { SpacingScale, MaxWidth } from '@/lib/design-tokens'

/* ============================================================================
 * Stack - Flexbox container with consistent spacing
 * ============================================================================ */

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between children using design system scale */
  gap?: SpacingScale | number
  /** Stack direction */
  direction?: 'vertical' | 'horizontal'
  /** Alignment of children along main axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Alignment of children along cross axis */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Allow items to wrap */
  wrap?: boolean
  /** Semantic HTML element to render */
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer'
}

export function Stack({
  gap = 'md',
  direction = 'vertical',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  as: Component = 'div',
  className,
  children,
  ...props
}: StackProps) {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : `gap-${gap}`

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }

  return (
    <Component
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        gapClass,
        justifyMap[justify],
        alignMap[align],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/* ============================================================================
 * Container - Max-width wrapper with consistent padding
 * ============================================================================ */

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width constraint */
  maxWidth?: MaxWidth | 'full'
  /** Apply horizontal padding */
  padding?: boolean | SpacingScale
  /** Center the container */
  center?: boolean
  /** Semantic HTML element to render */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main'
}

export function Container({
  maxWidth = 'content',
  padding = true,
  center = true,
  as: Component = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  const maxWidthClass =
    maxWidth === 'full' ? 'max-w-full' : `max-w-${maxWidth}`

  const paddingClass =
    padding === true
      ? 'px-md'
      : padding === false
      ? ''
      : `px-${padding}`

  return (
    <Component
      className={cn(
        maxWidthClass,
        center && 'mx-auto',
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/* ============================================================================
 * Spacer - Responsive whitespace
 * ============================================================================ */

export interface SpacerProps {
  /** Size using design system scale */
  size?: SpacingScale
  /** Orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Additional className */
  className?: string
}

export function Spacer({
  size = 'md',
  orientation = 'vertical',
  className,
}: SpacerProps) {
  return (
    <div
      className={cn(
        orientation === 'vertical' ? `h-${size}` : `w-${size}`,
        orientation === 'vertical' ? 'w-full' : 'h-full',
        className
      )}
      aria-hidden="true"
    />
  )
}

/* ============================================================================
 * Grid - CSS Grid container with responsive columns
 * ============================================================================ */

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  /** Responsive column config */
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  /** Gap between grid items */
  gap?: SpacingScale
  /** Gap for rows (if different from gap) */
  gapY?: SpacingScale
  /** Gap for columns (if different from gap) */
  gapX?: SpacingScale
  /** Semantic HTML element */
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol'
}

export function Grid({
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = 'md',
  gapX,
  gapY,
  as: Component = 'div',
  className,
  children,
  ...props
}: GridProps) {
  const colsClass = `grid-cols-${cols}`
  const colsSmClass = colsSm ? `sm:grid-cols-${colsSm}` : ''
  const colsMdClass = colsMd ? `md:grid-cols-${colsMd}` : ''
  const colsLgClass = colsLg ? `lg:grid-cols-${colsLg}` : ''

  const gapClass = gap ? `gap-${gap}` : ''
  const gapXClass = gapX ? `gap-x-${gapX}` : ''
  const gapYClass = gapY ? `gap-y-${gapY}` : ''

  return (
    <Component
      className={cn(
        'grid',
        colsClass,
        colsSmClass,
        colsMdClass,
        colsLgClass,
        gapClass || (gapXClass && gapYClass) ? '' : gapClass,
        gapXClass,
        gapYClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/* ============================================================================
 * Section - Page section with consistent vertical rhythm
 * ============================================================================ */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical padding */
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  /** Background variant */
  variant?: 'default' | 'muted' | 'accent' | 'brand'
  /** Full bleed (no horizontal constraints) */
  fullBleed?: boolean
}

export function Section({
  spacing = 'lg',
  variant = 'default',
  fullBleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  const spacingMap = {
    none: '',
    sm: 'py-lg',
    md: 'py-xl',
    lg: 'py-2xl',
    xl: 'py-3xl',
  }

  const variantMap = {
    default: 'bg-background text-foreground',
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent text-accent-foreground',
    brand: 'bg-brand-50 text-brand-900',
  }

  return (
    <section
      className={cn(
        spacingMap[spacing],
        variantMap[variant],
        !fullBleed && 'w-full',
        className
      )}
      {...props}
    >
      {fullBleed ? children : <Container>{children}</Container>}
    </section>
  )
}

/* ============================================================================
 * Divider - Visual separator
 * ============================================================================ */

export interface DividerProps {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Spacing around divider */
  spacing?: SpacingScale
  /** Visual style */
  variant?: 'solid' | 'dashed' | 'dotted'
  /** Additional className */
  className?: string
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  variant = 'solid',
  className,
}: DividerProps) {
  const borderStyle = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'border-border',
        borderStyle[variant],
        orientation === 'horizontal'
          ? `w-full border-t my-${spacing}`
          : `h-full border-l mx-${spacing}`,
        className
      )}
    />
  )
}

/* ============================================================================
 * Center - Simple centering wrapper
 * ============================================================================ */

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Center text as well */
  text?: boolean
  /** Maximum width */
  maxWidth?: MaxWidth | 'full'
}

export function Center({
  text = false,
  maxWidth,
  className,
  children,
  ...props
}: CenterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        text && 'text-center',
        maxWidth && `max-w-${maxWidth} mx-auto`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ============================================================================
 * Box - Generic container with design system utilities
 * ============================================================================ */

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding using design system scale */
  p?: SpacingScale
  /** Padding X */
  px?: SpacingScale
  /** Padding Y */
  py?: SpacingScale
  /** Margin using design system scale */
  m?: SpacingScale
  /** Margin X */
  mx?: SpacingScale
  /** Margin Y */
  my?: SpacingScale
  /** Background color */
  bg?: 'background' | 'card' | 'muted' | 'accent' | 'brand'
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Semantic element */
  as?: 'div' | 'article' | 'section' | 'aside'
}

export function Box({
  p,
  px,
  py,
  m,
  mx,
  my,
  bg,
  rounded,
  shadow,
  as: Component = 'div',
  className,
  children,
  ...props
}: BoxProps) {
  return (
    <Component
      className={cn(
        p && `p-${p}`,
        px && `px-${px}`,
        py && `py-${py}`,
        m && `m-${m}`,
        mx && `mx-${mx}`,
        my && `my-${my}`,
        bg && `bg-${bg}`,
        rounded && `rounded-${rounded}`,
        shadow && shadow !== 'none' && `shadow-${shadow}`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
