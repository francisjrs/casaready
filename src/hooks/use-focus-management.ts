'use client'

import { useEffect, useRef, useCallback } from 'react'
import { FocusManager } from '@/lib/utils/focus-management'

export function useFocusManagement() {
  const containerRef = useRef<HTMLElement>(null)

  /**
   * Focus the first input in the current step
   */
  const focusFirstInput = useCallback(() => {
    if (containerRef.current) {
      FocusManager.focusFirstInput(containerRef.current)
    }
  }, [])

  /**
   * Focus the first focusable element in the step
   */
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      FocusManager.focusFirst(containerRef.current)
    }
  }, [])

  /**
   * Handle keyboard navigation for the step
   */
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (containerRef.current) {
      FocusManager.handleStepKeyNavigation(event, containerRef.current)
    }
  }, [])

  /**
   * Announce content to screen readers
   */
  const announce = useCallback((message: string) => {
    FocusManager.announceToScreenReader(message)
  }, [])

  return {
    containerRef,
    focusFirstInput,
    focusFirst,
    handleKeyNavigation,
    announce
  }
}

export function useStepFocus() {
  const { containerRef, focusFirstInput, announce } = useFocusManagement()

  /**
   * Set up focus management when step loads
   */
  useEffect(() => {
    // Focus first input when step loads
    const timer = setTimeout(() => {
      focusFirstInput()
    }, 200)

    return () => clearTimeout(timer)
  }, [focusFirstInput])

  /**
   * Handle step completion announcement
   */
  const announceStepCompletion = useCallback((stepName: string) => {
    announce(`${stepName} completed. Moving to next step.`)
  }, [announce])

  /**
   * Handle validation error announcement
   */
  const announceValidationError = useCallback((errors: string[]) => {
    const errorMessage = `Validation errors: ${errors.join(', ')}`
    announce(errorMessage)
  }, [announce])

  return {
    containerRef,
    focusFirstInput,
    announceStepCompletion,
    announceValidationError
  }
}

export function useKeyboardNavigation() {
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, altKey } = event

    // Skip if user is typing in an input
    const activeElement = document.activeElement as HTMLElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true')
    ) {
      return
    }

    // Global keyboard shortcuts
    if (altKey) {
      switch (key) {
        case 'n':
        case 'N':
          // Alt + N: Skip to next button
          event.preventDefault()
          FocusManager.skipToNextButton()
          break
        case 'm':
        case 'M':
          // Alt + M: Skip to main content
          event.preventDefault()
          FocusManager.skipToMainContent()
          break
      }
    }

    // Ctrl/Cmd shortcuts for step navigation
    if ((ctrlKey || metaKey) && !altKey) {
      switch (key) {
        case 'ArrowLeft':
          // Previous step (will be handled by wizard)
          event.preventDefault()
          // Dispatch custom event for wizard to handle
          window.dispatchEvent(new CustomEvent('wizard:previous-step'))
          break
        case 'ArrowRight':
          // Next step (will be handled by wizard)
          event.preventDefault()
          // Dispatch custom event for wizard to handle
          window.dispatchEvent(new CustomEvent('wizard:next-step'))
          break
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [handleGlobalKeyDown])

  return {
    handleGlobalKeyDown
  }
}