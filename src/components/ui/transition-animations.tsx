'use client'

import { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// Enhanced transition configurations
export const transitionConfig = {
  // Standard durations
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    extraSlow: 500
  },

  // Easing functions
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounceOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smoothOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
}

// Enhanced transition classes
export const transitionClasses = {
  // Base transition
  base: 'transition-all duration-200 ease-out',

  // Specific property transitions
  opacity: 'transition-opacity duration-200 ease-out',
  transform: 'transition-transform duration-200 ease-out',
  colors: 'transition-colors duration-200 ease-out',

  // Combined transitions
  fadeScale: 'transition-all duration-300 ease-out',
  slide: 'transition-all duration-300 ease-out',

  // Hardware acceleration
  gpu: 'transform-gpu will-change-transform',

  // Step-specific transitions
  stepEnter: 'transition-all duration-500 ease-out',
  stepExit: 'transition-all duration-300 ease-in'
}

// Step transition animation component
interface StepTransitionProps {
  children: ReactNode
  isVisible: boolean
  direction?: 'forward' | 'backward'
  className?: string
  style?: CSSProperties
}

export function StepTransition({
  children,
  isVisible,
  direction = 'forward',
  className = '',
  style = {}
}: StepTransitionProps) {
  const directionClasses = direction === 'forward'
    ? 'translate-x-0'
    : 'translate-x-0'

  const visibilityClasses = isVisible
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-4 scale-95'

  return (
    <div
      className={cn(
        transitionClasses.stepEnter,
        transitionClasses.gpu,
        directionClasses,
        visibilityClasses,
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

// Slide transition for step changes
interface SlideTransitionProps {
  children: ReactNode
  isActive: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
}

export function SlideTransition({
  children,
  isActive,
  direction = 'right',
  className = ''
}: SlideTransitionProps) {
  const directionClasses = {
    left: isActive ? 'translate-x-0' : '-translate-x-full',
    right: isActive ? 'translate-x-0' : 'translate-x-full',
    up: isActive ? 'translate-y-0' : '-translate-y-full',
    down: isActive ? 'translate-y-0' : 'translate-y-full'
  }

  return (
    <div
      className={cn(
        transitionClasses.slide,
        transitionClasses.gpu,
        'opacity-100',
        isActive ? 'opacity-100' : 'opacity-0',
        directionClasses[direction],
        className
      )}
    >
      {children}
    </div>
  )
}

// Fade transition component
interface FadeTransitionProps {
  children: ReactNode
  isVisible: boolean
  delay?: number
  duration?: keyof typeof transitionConfig.duration
  className?: string
}

export function FadeTransition({
  children,
  isVisible,
  delay = 0,
  duration = 'normal',
  className = ''
}: FadeTransitionProps) {
  const durationMs = transitionConfig.duration[duration]

  return (
    <div
      className={cn(
        'transition-opacity ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Scale transition for button interactions
interface ScaleTransitionProps {
  children: ReactNode
  isPressed?: boolean
  isHovered?: boolean
  className?: string
}

export function ScaleTransition({
  children,
  isPressed = false,
  isHovered = false,
  className = ''
}: ScaleTransitionProps) {
  const scaleClass = isPressed
    ? 'scale-95'
    : isHovered
    ? 'scale-105'
    : 'scale-100'

  return (
    <div
      className={cn(
        transitionClasses.transform,
        transitionClasses.gpu,
        scaleClass,
        className
      )}
    >
      {children}
    </div>
  )
}

// Progress bar animation
interface ProgressTransitionProps {
  progress: number
  className?: string
  animated?: boolean
}

export function ProgressTransition({
  progress,
  className = '',
  animated = true
}: ProgressTransitionProps) {
  return (
    <div
      className={cn(
        'h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full',
        animated && 'transition-all duration-700 ease-out',
        className
      )}
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  )
}

// Stagger animation for lists
interface StaggeredFadeInProps {
  children: ReactNode[]
  isVisible: boolean
  staggerDelay?: number
  className?: string
}

export function StaggeredFadeIn({
  children,
  isVisible,
  staggerDelay = 100,
  className = ''
}: StaggeredFadeInProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeTransition
          key={index}
          isVisible={isVisible}
          delay={index * staggerDelay}
          duration="normal"
        >
          {child}
        </FadeTransition>
      ))}
    </div>
  )
}

// Enhanced page transition
interface PageTransitionProps {
  children: ReactNode
  isLoading: boolean
  className?: string
}

export function PageTransition({
  children,
  isLoading,
  className = ''
}: PageTransitionProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Content */}
      <StepTransition
        isVisible={!isLoading}
        className="relative z-10"
      >
        {children}
      </StepTransition>

      {/* Loading overlay */}
      {isLoading && (
        <FadeTransition
          isVisible={isLoading}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center"
        >
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-brand-200"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-brand-600 absolute top-0 left-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-700">Loading...</p>
          </div>
        </FadeTransition>
      )}
    </div>
  )
}

// Smooth height transition
interface HeightTransitionProps {
  children: ReactNode
  className?: string
}

export function HeightTransition({
  children,
  className = ''
}: HeightTransitionProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}

// Spring animation for interactive elements
export const springConfig = {
  tension: 280,
  friction: 60,
  mass: 1
}

// CSS keyframes for custom animations
export const keyframes = {
  slideInFromRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },
  slideInFromLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },
  scaleIn: {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  },
  fadeInUp: {
    '0%': { transform: 'translateY(30px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  }
}