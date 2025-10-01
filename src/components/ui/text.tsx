'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface TextProps {
  tKey: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  className?: string;
  fallback?: string;
  values?: Record<string, string | number>;
  role?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  id?: string;
  htmlFor?: string;
  children?: React.ReactNode;
}

export function Text({
  tKey,
  as: Component = 'span',
  className,
  fallback,
  values = {},
  children,
  ...rest
}: TextProps) {
  const { t } = useLanguage();

  let text = t(tKey);

  // Use fallback if translation not found
  if (text === tKey && fallback) {
    text = fallback;
  }

  // Replace placeholders with values
  if (Object.keys(values).length > 0) {
    text = Object.entries(values).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
      text
    );
  }

  return <Component className={className} {...rest}>{children || text}</Component>;
}

// Specialized text components for common use cases
interface HeadingProps extends Omit<TextProps, 'as'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export function Heading({ level, size, className, ...props }: HeadingProps) {
  const Component = `h${level}` as const;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  const defaultSizes = {
    1: '4xl',
    2: '3xl',
    3: '2xl',
    4: 'xl',
    5: 'lg',
    6: 'base'
  } as const;

  const textSize = size || defaultSizes[level];

  return (
    <Text
      {...props}
      as={Component}
      className={cn(
        'font-bold text-foreground tracking-tight',
        sizeClasses[textSize],
        className
      )}
    />
  );
}

interface ParagraphProps extends Omit<TextProps, 'as'> {
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'muted' | 'subtle';
}

export function Paragraph({ size = 'base', variant = 'default', className, ...props }: ParagraphProps) {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    subtle: 'text-muted-foreground/80'
  };

  return (
    <Text
      {...props}
      as="p"
      className={cn(
        'leading-relaxed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LabelProps extends Omit<TextProps, 'as'> {
  required?: boolean;
  htmlFor?: string;
}

export function Label({ required, htmlFor, className, ...props }: LabelProps) {
  return (
    <Text
      {...props}
      as="label"
      className={cn(
        'text-sm font-medium text-foreground',
        className
      )}
      {...(htmlFor && { htmlFor })}
    >
      {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
    </Text>
  );
}

// Helper component for error messages
interface ErrorTextProps extends Omit<TextProps, 'as'> {
  show?: boolean;
}

export function ErrorText({ show = true, className, ...props }: ErrorTextProps) {
  if (!show) return null;

  return (
    <Text
      {...props}
      as="span"
      className={cn(
        'text-sm text-destructive font-medium',
        className
      )}
      role="alert"
      aria-live="polite"
    />
  );
}

// Helper component for success messages
interface SuccessTextProps extends Omit<TextProps, 'as'> {
  show?: boolean;
}

export function SuccessText({ show = true, className, ...props }: SuccessTextProps) {
  if (!show) return null;

  return (
    <Text
      {...props}
      as="span"
      className={cn(
        'text-sm text-success-600 font-medium',
        className
      )}
      role="status"
      aria-live="polite"
    />
  );
}

// Helper component for help text
export function HelpText({ className, ...props }: Omit<TextProps, 'as'>) {
  return (
    <Text
      {...props}
      as="span"
      className={cn(
        'text-sm text-muted-foreground',
        className
      )}
    />
  );
}