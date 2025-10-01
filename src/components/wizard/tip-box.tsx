'use client'

import { useWizard } from '@/lib/services'
import { AccessibleAlert, AccessibleText } from '@/components/ui/accessible-colors'
import { useLanguage } from '@/contexts/language-context'

interface TipBoxProps {
  children: React.ReactNode
  variant?: 'default' | 'info' | 'warning' | 'success'
  className?: string
}

const variantStyles = {
  default: {
    container: 'bg-blue-50 border border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800'
  },
  info: {
    container: 'bg-blue-50 border border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800'
  },
  warning: {
    container: 'bg-yellow-50 border border-yellow-200',
    icon: 'text-yellow-500',
    text: 'text-yellow-800'
  },
  success: {
    container: 'bg-green-50 border border-green-200',
    icon: 'text-green-500',
    text: 'text-green-800'
  }
}

export function TipBox({ children, variant = 'default', className = '' }: TipBoxProps) {
  const { t } = useLanguage()
  const { locale } = useWizard()

  // Map variants to AccessibleAlert variants
  const alertVariant = variant === 'warning' ? 'warning' : variant === 'success' ? 'success' : 'info'

  return (
    <AccessibleAlert
      variant={alertVariant}
      className={className}
    >
      <div className="flex items-start space-x-1">
        <span className="flex-shrink-0 mt-0.5" aria-hidden="true">💡</span>
        <div>
          <AccessibleText variant="info" size="sm" weight="medium" className="mr-1">
            {t('wizard.shared.tip')}
          </AccessibleText>
          <AccessibleText variant="info" size="sm" className="leading-relaxed">
            {children}
          </AccessibleText>
        </div>
      </div>
    </AccessibleAlert>
  )
}

interface InfoBoxProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function InfoBox({ children, title, className = '' }: InfoBoxProps) {
  return (
    <AccessibleAlert
      variant="info"
      title={title}
      className={className}
    >
      {children}
    </AccessibleAlert>
  )
}

interface WarningBoxProps {
  children: React.ReactNode
  className?: string
}

export function WarningBox({ children, className = '' }: WarningBoxProps) {
  return (
    <AccessibleAlert
      variant="warning"
      className={className}
    >
      {children}
    </AccessibleAlert>
  )
}