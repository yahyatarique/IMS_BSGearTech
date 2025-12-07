import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShieldCheck, UserCheck } from 'lucide-react'

interface UsersStatsProps {
  total: number
  active: number
  admins: number
  loading?: boolean
}

const statsConfig = [
  {
    title: 'Total Users',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500 dark:from-blue-500/30 dark:to-cyan-500/30',
    description: 'All registered accounts',
    key: 'total' as const,
  },
  {
    title: 'Active Users',
    icon: UserCheck,
    gradient: 'from-green-500 to-emerald-500 dark:from-green-500/30 dark:to-emerald-500/30',
    description: 'Currently active accounts',
    key: 'active' as const,
  },
  {
    title: 'Admins',
    icon: ShieldCheck,
    gradient: 'from-indigo-500 to-blue-600  dark:from-indigo-500/30 dark:to-blue-500/30',
    description: 'Currently active admins',
    key: 'admins' as const,
  },
]

export function UsersStats({ total, active, admins, loading }: UsersStatsProps) {
  const values = { total, active, admins }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statsConfig.map(({ title, icon: Icon, gradient, description, key }) => (
        <Card key={title} className="overflow-hidden border shadow-sm dark:border-slate-800">
          <div className={`h-1 bg-gradient-to-r ${gradient}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {title}
            </CardTitle>
            <div className={`rounded-md bg-gradient-to-br ${gradient} p-2`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">
              {loading ? '—' : values[key]}
            </div>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
