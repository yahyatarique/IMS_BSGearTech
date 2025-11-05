'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { tokenUtils } from '@/axios'

export function Navigation() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      tokenUtils.clearTokens()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-xl font-bold">IMS BS GearTech</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
