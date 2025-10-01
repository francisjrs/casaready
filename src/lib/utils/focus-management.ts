/**
 * Focus Management Utilities
 *
 * Provides utilities for managing focus in the wizard for keyboard navigation
 */

export class FocusManager {
  private static focusableElementsSelector =
    'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]):not(:disabled), [contenteditable]:not([contenteditable="false"])'

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableElementsSelector)
    ) as HTMLElement[]
  }

  /**
   * Get the first focusable element in a container
   */
  static getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container)
    return focusableElements.length > 0 ? focusableElements[0] : null
  }

  /**
   * Get the last focusable element in a container
   */
  static getLastFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container)
    return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null
  }

  /**
   * Focus the first focusable element in a container
   */
  static focusFirst(container: HTMLElement): boolean {
    const firstElement = this.getFirstFocusableElement(container)
    if (firstElement) {
      firstElement.focus()
      return true
    }
    return false
  }

  /**
   * Focus the next step's first input field
   */
  static focusFirstInput(container?: HTMLElement): boolean {
    const searchContainer = container || document.body
    const firstInput = searchContainer.querySelector('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)') as HTMLElement

    if (firstInput) {
      // Add a small delay to ensure the element is rendered
      setTimeout(() => {
        firstInput.focus()
      }, 100)
      return true
    }
    return false
  }

  /**
   * Trap focus within a container (useful for modals/overlays)
   */
  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab') return

    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Handle keyboard navigation within a step
   */
  static handleStepKeyNavigation(event: KeyboardEvent, container: HTMLElement): void {
    const { key, ctrlKey, metaKey } = event

    // Allow normal tab navigation
    if (key === 'Tab') {
      return // Let browser handle normal tab navigation
    }

    // Ctrl/Cmd + Arrow keys for step navigation (will be handled by wizard)
    if ((ctrlKey || metaKey) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      return // Let wizard handle this
    }

    // Arrow key navigation within form elements
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const activeElement = document.activeElement as HTMLElement
      const focusableElements = this.getFocusableElements(container)
      const currentIndex = focusableElements.indexOf(activeElement)

      if (currentIndex !== -1) {
        event.preventDefault()

        let nextIndex: number
        if (key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % focusableElements.length
        } else {
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
        }

        focusableElements[nextIndex].focus()
      }
    }
  }

  /**
   * Create a focus trap for a container
   */
  static createFocusTrap(container: HTMLElement) {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.trapFocus(container, event)
    }

    container.addEventListener('keydown', handleKeyDown)

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  /**
   * Announce content to screen readers
   */
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  /**
   * Skip to main content (for skip links)
   */
  static skipToMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"], #main-content') as HTMLElement
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /**
   * Skip to next step button
   */
  static skipToNextButton(): void {
    const nextButton = document.querySelector('[data-wizard-next], button[type="submit"]') as HTMLElement
    if (nextButton) {
      nextButton.focus()
      nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}