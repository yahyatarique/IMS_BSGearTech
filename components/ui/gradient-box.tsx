import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientBoxProps {
  children: ReactNode
  className?: string
  gradient?: 'primary' | 'blue-cyan' | 'green' | 'orange' | 'purple-pink' | 'indigo-blue' | 'custom'
  customGradient?: string
  variant?: 'background' | 'border' | 'icon'
}

/**
 * GradientBox - Reusable gradient background/border component
 */
export function GradientBox({ 
  children, 
  className, 
  gradient = 'primary',
  customGradient,
  variant = 'background'
}: GradientBoxProps) {
  const gradientClasses = {
    primary: 'from-primary-600 to-cyan-500',
    'blue-cyan': 'from-blue-600 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    'purple-pink': 'from-purple-500 to-pink-500',
    'indigo-blue': 'from-indigo-500 to-blue-500',
    custom: customGradient || 'from-blue-600 to-cyan-500'
  }

  const variantClasses = {
    background: `bg-gradient-to-br ${gradientClasses[gradient]}`,
    border: `bg-gradient-to-r ${gradientClasses[gradient]}`,
    icon: `bg-gradient-to-br ${gradientClasses[gradient]}`
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  )
}
