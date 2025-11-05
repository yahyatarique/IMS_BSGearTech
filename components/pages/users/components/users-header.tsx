"use client"

import { MouseEventHandler } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserPlus, RefreshCw } from 'lucide-react'

interface UsersHeaderProps {
  onRefresh: MouseEventHandler<HTMLButtonElement>
  isRefreshing: boolean
}

export function UsersHeader({ onRefresh, isRefreshing }: UsersHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage system users and their permissions</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4" />
          {isRefreshing ? 'Refreshing' : 'Refresh'}
        </Button>
        <Button className="gap-2" onClick={() => router.push('/users/create')}>
          <UserPlus className="h-4 w-4" />
          Create New User
        </Button>
      </div>
    </div>
  )
}
