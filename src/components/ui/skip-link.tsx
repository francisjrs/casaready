'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  className?: string;
}

export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  const { t } = useLanguage();

  return (
    <a
      href={href}
      className={cn(
        // Visually hidden until focused
        'absolute left-4 top-4 z-[9999]',
        'transform -translate-y-full',
        'bg-brand-600 text-white px-4 py-2 rounded-md',
        'text-sm font-medium',
        'transition-transform duration-150',
        'focus:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        'hover:bg-brand-700',
        className
      )}
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}