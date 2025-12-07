import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: ReactNode
  className?: string
  gradient?: 'primary' | 'blue-cyan' | 'green' | 'orange' | 'custom'
  customGradient?: string
}

/**
 * GradientText - Reusable gradient text component
 */
export function GradientText({ 
  children, 
  className, 
  gradient = 'primary',
  customGradient 
}: GradientTextProps) {
  const gradientClasses = {
    primary: 'from-primary-600 to-cyan-500',
    'blue-cyan': 'from-blue-600 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    custom: customGradient
  }

  return (
    <span className={cn(
      'bg-gradient-to-r bg-clip-text text-transparent font-bold',
      gradientClasses[gradient],
      className
    )}>
      {children}
    </span>
  )
}
