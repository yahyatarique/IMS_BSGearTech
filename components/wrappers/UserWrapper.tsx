'use client'

import { useEffect, useState, ReactNode } from 'react'
import { getCurrentUser } from '@/services/auth'
import { USER_ROLES } from '@/enums/users.enum'
import { User } from '@/services/types/auth.api.type'

interface UserWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  allowAdmins?: boolean
}

/**
 * UserWrapper - Only renders children for regular users (role '2')
 * @param children - Content to render for regular users
 * @param fallback - Optional content to render for non-users
 * @param allowAdmins - If true, also allows admin/super admin to see content
 */
export function UserWrapper({ children, fallback = null, allowAdmins = false }: UserWrapperProps) {
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Check localStorage first for cached user info
        const cachedUser = localStorage.getItem('userInfo')
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser)
          setUserInfo(parsed)
          setIsLoading(false)
          return
        }

        // Fetch from API if not cached
        const response = await getCurrentUser()
        if (response?.data?.user) {
          setUserInfo(response.data.user)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  if (isLoading) {
    return null // Or return a loading skeleton
  }

  // Check if user is a regular user
  const isRegularUser = userInfo?.role === USER_ROLES.USER
  const isAdmin = userInfo?.role === USER_ROLES.SUPER_ADMIN || userInfo?.role === USER_ROLES.ADMIN

  if (isRegularUser || (allowAdmins && isAdmin)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
