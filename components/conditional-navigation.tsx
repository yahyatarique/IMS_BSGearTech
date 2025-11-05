'use client'

import { usePathname } from 'next/navigation'
import { AppNavigation } from './app-navigation'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Don't show navigation on auth pages
  const shouldShowNav = !AUTH_ROUTES.includes(pathname)
  
  if (!shouldShowNav) {
    return null
  }
  
  return <AppNavigation />
}
