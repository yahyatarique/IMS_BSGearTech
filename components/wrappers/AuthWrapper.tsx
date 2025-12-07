'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/services/auth'
import { tokenUtils } from '@/axios'

interface AuthWrapperProps {
  children: ReactNode
  requireAuth?: boolean
}

/**
 * AuthWrapper - Handles authentication state
 * @param children - Content to render for authenticated users
 * @param requireAuth - If true, redirects to login if not authenticated
 */
export function AuthWrapper({ children, requireAuth = true }: AuthWrapperProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser()
        if (response?.data?.user) {
          setIsAuthenticated(true)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        } else {
          throw new Error('Not authenticated')
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        // if (requireAuth) {
        //   localStorage.removeItem('userInfo')
        //   tokenUtils.clearTokens()
        //   router.push('/login')
        // }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
