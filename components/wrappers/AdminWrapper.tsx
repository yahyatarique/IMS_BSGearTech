'use client'

import { useEffect, useState, ReactNode } from 'react'
import { getCurrentUser } from '@/services/auth'
import { USER_ROLES } from '@/enums/users.enum'
import { User } from '@/services/types/auth.api.type'

interface AdminWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  allowSuperAdminOnly?: boolean
}

/**
 * AdminWrapper - Only renders children for admin users (Super Admin or Admin roles)
 * @param children - Content to render for admin users
 * @param fallback - Optional content to render for non-admin users
 * @param allowSuperAdminOnly - If true, only Super Admin (role '0') can see content
 */
export function AdminWrapper({ children, fallback = null, allowSuperAdminOnly = false }: AdminWrapperProps) {
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

  // Check role-based access
  if (allowSuperAdminOnly) {
    if (userInfo?.role === USER_ROLES.SUPER_ADMIN) {
      return <>{children}</>
    }
  } else {
    // Allow both Super Admin and Admin
    if (userInfo?.role === USER_ROLES.SUPER_ADMIN || userInfo?.role === USER_ROLES.ADMIN) {
      return <>{children}</>
    }
  }

  return <>{fallback}</>
}
