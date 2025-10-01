'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { useFocusManagement } from '@/lib/accessibility';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  restoreFocus = true,
  className
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { storeFocus, restoreFocus: restore, trapFocus } = useFocusManagement();

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the currently focused element
    if (restoreFocus) {
      storeFocus();
    }

    // Set up focus trap
    const cleanup = trapFocus(containerRef.current);

    // Focus the first focusable element
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      cleanup();
      if (restoreFocus) {
        restore();
      }
    };
  }, [active, restoreFocus, storeFocus, restore, trapFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}