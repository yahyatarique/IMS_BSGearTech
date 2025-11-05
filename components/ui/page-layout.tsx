import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GradientBox } from '@/components/ui/gradient-box'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  gradient?: 'primary' | 'blue-cyan' | 'green' | 'orange' | 'purple-pink' | 'indigo-blue'
  action?: ReactNode
  backButton?: ReactNode
  className?: string
}

/**
 * PageHeader - Reusable page header with gradient title and optional icon
 */
export function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  gradient = 'primary',
  action,
  backButton,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {backButton}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <GradientBox 
              gradient={gradient}
              className="p-2 rounded-lg"
              variant="icon"
            >
              <Icon className="h-6 w-6 text-white" />
            </GradientBox>
          )}
          <div>
            <h1 className={cn(
              'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
              gradient === 'primary' && 'from-primary-600 to-cyan-500',
              gradient === 'blue-cyan' && 'from-blue-600 to-cyan-500',
              gradient === 'green' && 'from-green-500 to-emerald-500',
              gradient === 'orange' && 'from-orange-500 to-red-500',
              gradient === 'purple-pink' && 'from-purple-500 to-pink-500',
              gradient === 'indigo-blue' && 'from-indigo-500 to-blue-500',
            )}>
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}

interface GradientCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  gradient?: 'primary' | 'blue-cyan' | 'green' | 'orange' | 'purple-pink' | 'indigo-blue'
  children: ReactNode
  action?: ReactNode
  className?: string
}

/**
 * GradientCard - Reusable card with gradient top border and optional icon
 */
export function GradientCard({ 
  title, 
  description, 
  icon: Icon,
  gradient = 'primary',
  children,
  action,
  className
}: GradientCardProps) {
  const gradientClasses = {
    primary: 'from-primary-600 to-cyan-500',
    'blue-cyan': 'from-blue-600 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    'purple-pink': 'from-purple-500 to-pink-500',
    'indigo-blue': 'from-indigo-500 to-blue-500',
  }

  return (
    <Card className={cn('border shadow-lg bg-white dark:bg-slate-900', className)}>
      <div className={`h-1 bg-gradient-to-r ${gradientClasses[gradient]}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <GradientBox 
                gradient={gradient}
                className="p-2 rounded-lg"
                variant="icon"
              >
                <Icon className="h-5 w-5 text-white" />
              </GradientBox>
            )}
            <div>
              <CardTitle className="text-slate-900 dark:text-white">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
