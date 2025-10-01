'use client'

// Wizard progress storage and restoration functionality
export interface WizardProgress {
  currentStep: number
  completedSteps: Set<number>
  formData: Record<string, any>
  timestamp: number
  locale: 'en' | 'es'
  sessionId: string
  totalSteps: number
}

const STORAGE_KEY = 'casaready_wizard_progress'
const STORAGE_EXPIRY_HOURS = 24 // Progress expires after 24 hours

// Generate a unique session ID
function generateSessionId(): string {
  return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if progress has expired
function isProgressExpired(timestamp: number): boolean {
  const expiryTime = STORAGE_EXPIRY_HOURS * 60 * 60 * 1000 // Convert to milliseconds
  return Date.now() - timestamp > expiryTime
}

// Sanitize form data to remove sensitive information
function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data }

  // Remove sensitive fields
  const sensitiveKeys = ['ssn', 'socialSecurityNumber', 'bankAccount', 'creditCard', 'password']
  sensitiveKeys.forEach(key => {
    delete sanitized[key]
  })

  // Remove any keys that might contain credit card or SSN patterns
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key]
    if (typeof value === 'string') {
      // Remove values that look like SSNs (XXX-XX-XXXX) or credit cards
      if (/^\d{3}-\d{2}-\d{4}$/.test(value) || /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(value)) {
        delete sanitized[key]
      }
    }
  })

  return sanitized
}

// Save wizard progress to localStorage
export function saveWizardProgress(progress: Omit<WizardProgress, 'timestamp' | 'sessionId'>): boolean {
  try {
    if (typeof window === 'undefined') return false

    const sanitizedFormData = sanitizeFormData(progress.formData)

    const progressData: WizardProgress = {
      ...progress,
      formData: sanitizedFormData,
      timestamp: Date.now(),
      sessionId: generateSessionId()
    }

    // Convert Set to Array for JSON serialization
    const serializable = {
      ...progressData,
      completedSteps: Array.from(progressData.completedSteps)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))

    console.log('🔄 Wizard progress saved:', {
      step: progress.currentStep,
      completed: progress.completedSteps.size,
      dataKeys: Object.keys(sanitizedFormData)
    })

    return true
  } catch (error) {
    console.error('❌ Failed to save wizard progress:', error)
    return false
  }
}

// Load wizard progress from localStorage
export function loadWizardProgress(): WizardProgress | null {
  try {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Check if progress has expired
    if (isProgressExpired(parsed.timestamp)) {
      clearWizardProgress()
      console.log('⏰ Wizard progress expired and cleared')
      return null
    }

    // Convert Array back to Set
    const progress: WizardProgress = {
      ...parsed,
      completedSteps: new Set(parsed.completedSteps)
    }

    console.log('📂 Wizard progress loaded:', {
      step: progress.currentStep,
      completed: progress.completedSteps.size,
      age: Math.round((Date.now() - progress.timestamp) / 1000 / 60) + ' minutes'
    })

    return progress
  } catch (error) {
    console.error('❌ Failed to load wizard progress:', error)
    clearWizardProgress() // Clear corrupted data
    return null
  }
}

// Clear wizard progress from localStorage
export function clearWizardProgress(): void {
  try {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Wizard progress cleared')
  } catch (error) {
    console.error('❌ Failed to clear wizard progress:', error)
  }
}

// Check if saved progress exists
export function hasSavedProgress(): boolean {
  try {
    if (typeof window === 'undefined') return false

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false

    const parsed = JSON.parse(stored)
    return !isProgressExpired(parsed.timestamp)
  } catch (error) {
    return false
  }
}

// Get progress summary for display
export function getProgressSummary(): { step: number; totalSteps: number; completedCount: number; age: string } | null {
  const progress = loadWizardProgress()
  if (!progress) return null

  const ageMinutes = Math.round((Date.now() - progress.timestamp) / 1000 / 60)
  const ageDisplay = ageMinutes < 60
    ? `${ageMinutes} minutes ago`
    : `${Math.round(ageMinutes / 60)} hours ago`

  return {
    step: progress.currentStep,
    totalSteps: progress.totalSteps,
    completedCount: progress.completedSteps.size,
    age: ageDisplay
  }
}

// Merge saved progress with current wizard state
export function mergeWizardProgress(
  currentProgress: Partial<WizardProgress>,
  savedProgress: WizardProgress
): WizardProgress {
  return {
    currentStep: savedProgress.currentStep,
    completedSteps: new Set([
      ...Array.from(currentProgress.completedSteps || []),
      ...Array.from(savedProgress.completedSteps)
    ]),
    formData: {
      ...currentProgress.formData,
      ...savedProgress.formData
    },
    timestamp: savedProgress.timestamp,
    locale: savedProgress.locale,
    sessionId: savedProgress.sessionId,
    totalSteps: savedProgress.totalSteps
  }
}

// Auto-save functionality with debouncing
let autoSaveTimeout: NodeJS.Timeout | null = null

export function autoSaveProgress(
  progress: Omit<WizardProgress, 'timestamp' | 'sessionId'>,
  delay: number = 1000
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }

  autoSaveTimeout = setTimeout(() => {
    saveWizardProgress(progress)
  }, delay)
}

// Progress validation
export function validateProgress(progress: WizardProgress): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!progress.currentStep || progress.currentStep < 1) {
    errors.push('Invalid current step')
  }

  if (!progress.totalSteps || progress.totalSteps < 1) {
    errors.push('Invalid total steps')
  }

  if (progress.currentStep > progress.totalSteps) {
    errors.push('Current step exceeds total steps')
  }

  if (!progress.locale || !['en', 'es'].includes(progress.locale)) {
    errors.push('Invalid locale')
  }

  if (!progress.timestamp || isProgressExpired(progress.timestamp)) {
    errors.push('Progress has expired')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Create backup of progress before major changes
export function backupProgress(): string | null {
  try {
    const progress = loadWizardProgress()
    if (!progress) return null

    const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`
    const serializable = {
      ...progress,
      completedSteps: Array.from(progress.completedSteps)
    }

    localStorage.setItem(backupKey, JSON.stringify(serializable))
    return backupKey
  } catch (error) {
    console.error('❌ Failed to backup progress:', error)
    return null
  }
}

// Restore from backup
export function restoreFromBackup(backupKey: string): boolean {
  try {
    const backup = localStorage.getItem(backupKey)
    if (!backup) return false

    localStorage.setItem(STORAGE_KEY, backup)
    localStorage.removeItem(backupKey) // Clean up backup

    console.log('🔄 Progress restored from backup')
    return true
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error)
    return false
  }
}