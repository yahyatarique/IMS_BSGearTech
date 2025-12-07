'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export function StatCard({ title, value, icon: Icon, gradient, trend, description }: StatCardProps) {
  return (
    <Card className="overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p className="text-xs mt-1">
            <span className={trend.isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-slate-600 dark:text-slate-400"> from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface DashboardCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  gradient?: string
  children: ReactNode
  action?: ReactNode
}

export function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  gradient = 'from-blue-500 to-cyan-500',
  children,
  action
}: DashboardCardProps) {
  return (
    <Card className="border shadow-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{title}</CardTitle>
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
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
