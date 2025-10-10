'use client'

import { useEffect, useState } from 'react'

interface AnimatedMetricCardProps {
  value: string
  label: string
  description: string
  color: 'green' | 'blue' | 'orange'
  icon: string
  delay?: number
}

export function AnimatedMetricCard({
  value,
  label,
  description,
  color,
  icon,
  delay = 0
}: AnimatedMetricCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Show confetti effect after card appears
      setTimeout(() => setShowConfetti(true), 300)
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 1500)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  const colorClasses = {
    green: {
      bg: 'from-green-50 to-emerald-50/50',
      border: 'border-green-200',
      text: 'text-green-700',
      gradient: 'from-green-700 to-emerald-700',
      desc: 'text-green-600',
      glow: 'shadow-green-200/50'
    },
    blue: {
      bg: 'from-blue-50 to-indigo-50/50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      gradient: 'from-blue-700 to-indigo-700',
      desc: 'text-blue-600',
      glow: 'shadow-blue-200/50'
    },
    orange: {
      bg: 'from-orange-50 to-amber-50/50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      gradient: 'from-orange-700 to-amber-700',
      desc: 'text-orange-600',
      glow: 'shadow-orange-200/50'
    }
  }

  const colors = colorClasses[color]

  return (
    <div
      className={`group relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-500 overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Animated background pulse */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${colors.border} rounded-full animate-confetti`}
              style={{
                left: `${20 + i * 10}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Icon with bounce animation */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-3xl animate-bounce-slow">{icon}</span>
          <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse`}></div>
        </div>

        <div className={`text-sm font-bold ${colors.text} mb-2 uppercase tracking-wider`}>
          {label}
        </div>

        {/* Animated number with gradient */}
        <div className={`text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-3 transition-all duration-700 ${
          isVisible ? 'scale-100' : 'scale-75'
        }`}>
          {value}
        </div>

        <div className={`text-xs ${colors.desc} font-medium`}>
          {description}
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  )
}
