import { useRef, useSyncExternalStore } from 'react';

// Focus management utilities
export function useFocusManagement() {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const storeFocus = () => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  return { storeFocus, restoreFocus, trapFocus };
}

// Announcement utilities for screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// WCAG color contrast utilities
export const colorContrast = {
  // Check if text meets WCAG AA contrast requirements
  meetsAA: (foreground: string, background: string, fontSize: 'normal' | 'large' = 'normal') => {
    const contrast = calculateContrast(foreground, background);
    return fontSize === 'large' ? contrast >= 3 : contrast >= 4.5;
  },

  // Check if text meets WCAG AAA contrast requirements
  meetsAAA: (foreground: string, background: string, fontSize: 'normal' | 'large' = 'normal') => {
    const contrast = calculateContrast(foreground, background);
    return fontSize === 'large' ? contrast >= 4.5 : contrast >= 7;
  }
};

function calculateContrast(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  // Simplified luminance calculation
  // In a real implementation, you'd want to parse hex/rgb values properly
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Keyboard navigation utilities
export const keyboardUtils = {
  // Check if key is an action key (Enter or Space)
  isActionKey: (key: string) => key === 'Enter' || key === ' ',

  // Check if key is an escape key
  isEscapeKey: (key: string) => key === 'Escape',

  // Check if key is an arrow key
  isArrowKey: (key: string) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),

  // Handle roving tabindex for keyboard navigation
  handleRovingTabindex: (container: HTMLElement, currentIndex: number, direction: 'next' | 'prev') => {
    const focusableElements = Array.from(
      container.querySelectorAll('[role="tab"], [role="menuitem"], [role="option"]')
    ) as HTMLElement[];

    if (focusableElements.length === 0) return currentIndex;

    // Remove tabindex from all elements
    focusableElements.forEach(el => el.setAttribute('tabindex', '-1'));

    // Calculate new index
    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    // Set tabindex and focus on new element
    const newElement = focusableElements[newIndex];
    if (newElement) {
      newElement.setAttribute('tabindex', '0');
      newElement.focus();
    }

    return newIndex;
  }
};

// Custom hook for reduced motion preference
function useMediaQuery(query: string, fallback = false) {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQueryList = window.matchMedia(query);
    const handler = () => callback();
    mediaQueryList.addEventListener('change', handler);
    return () => mediaQueryList.removeEventListener('change', handler);
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return fallback;
    }
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

// Custom hook for high contrast preference
export function useHighContrast() {
  return useMediaQuery('(prefers-contrast: high)', false);
}

// Form validation announcements
export function announceFormError(fieldName: string, errorMessage: string) {
  const message = `Error in ${fieldName}: ${errorMessage}`;
  announceToScreenReader(message, 'assertive');
}

export function announceFormSuccess(message: string) {
  announceToScreenReader(message, 'polite');
}

// Live region for dynamic content updates
export function createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite') {
  let liveRegion = document.getElementById(id);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  return {
    announce: (message: string) => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    },
    clear: () => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }
  };
}
