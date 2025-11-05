'use client';

import { useRouter, usePathname } from 'next/navigation';
import { logout, getCurrentUser } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { tokenUtils } from '@/axios';
import { AdminWrapper } from '@/components/wrappers';
import {
  Home,
  ShoppingCart,
  Users,
  Package,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserPlus,
  UserCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { USER_ROLES } from '@/enums/users.enum';
import { User } from '../services/types/auth.api.type';
import Link from 'next/link';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Buyers', href: '/buyers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
];

const adminNavItems = [{ name: 'Users', href: '/users', icon: UserCircle }];

export function AppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // First check localStorage for cached user info
        const cachedUser = localStorage.getItem('userInfo');
        if (cachedUser) {
          setUserInfo(JSON.parse(cachedUser));
        }

        // Then fetch fresh data from API
        const response = await getCurrentUser();
        if (response?.data?.user) {
          setUserInfo(response.data.user);
          // Update localStorage with fresh data
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // If token is invalid, clear cache and redirect to login
        if (error instanceof Error) {
          localStorage.removeItem('userInfo');
          tokenUtils.clearTokens();
          router.push('/login');
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('userInfo');
      tokenUtils.clearTokens();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => pathname === href;

  // Check if user is admin (role '0' or '1')
  const isAdmin = userInfo?.role === USER_ROLES.SUPER_ADMIN || userInfo?.role === USER_ROLES.ADMIN;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userInfo) return '?';
    const firstInitial = userInfo.first_name?.charAt(0) || '';
    const lastInitial = userInfo.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || userInfo.username?.charAt(0).toUpperCase() || '?';
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (!userInfo) return 'Loading...';
    switch (userInfo.role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case USER_ROLES.ADMIN:
        return 'Admin';
      case USER_ROLES.USER:
        return 'User';
      default:
        return 'Unknown';
    }
  };

  // Get full name
  const getFullName = () => {
    if (!userInfo) return 'Loading...';
    return `${userInfo.first_name} ${userInfo.last_name}`.trim() || userInfo.username;
  };

  return (
    <>
      {/* Topbar with gradient */}
      <nav className='sticky top-0 z-50 border-b bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-sm'>
        <div className='mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-6'>
          <div className='flex min-w-0 flex-1 items-center gap-4 lg:gap-6 xl:gap-8'>
            <div className='flex shrink-0 items-center gap-2'>
              <Link
                href='/'
                className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center'>
                <Home className='h-5 w-5 text-white' />
              </Link>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent'>
                BS GearTech IMS
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap lg:flex xl:gap-3'>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    variant='ghost'
                    onClick={() => router.push(item.href)}
                    className={`gap-2 text-gray-300 hover:text-white transition-all ${
                      active ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20' : 'hover:bg-white/5'
                    }`}
                    size='sm'>
                    <Icon className='h-4 w-4' />
                    {item.name}
                  </Button>
                );
              })}

              {/* Admin-only navigation items */}
              <AdminWrapper>
                {adminNavItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href) || pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant='ghost'
                      onClick={() => router.push(item.href)}
                      className={`gap-2 text-gray-300 hover:text-white transition-all ${
                        active ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20' : 'hover:bg-white/5'
                      }`}
                      size='sm'>
                      <Icon className='h-4 w-4' />
                      {item.name}
                    </Button>
                  );
                })}
              </AdminWrapper>
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-3 sm:gap-4'>
            {/* User Avatar with Dropdown */}
            {!isLoadingUser && userInfo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='hidden md:flex items-center gap-3 hover:bg-white/5'>
                    <Avatar className='h-8 w-8 border-2 border-blue-400'>
                      <AvatarFallback className='bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-sm'>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-sm text-left'>
                      <p className='text-white font-medium'>{getFullName()}</p>
                      <p className='text-gray-400 text-xs'>{getRoleDisplay()}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className='gap-2 cursor-pointer'>
                    <UserCircle className='h-4 w-4' />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className='gap-2 cursor-pointer text-red-600 focus:text-red-600'>
                    <LogOut className='h-4 w-4' />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden text-white'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg'>
            <div className='mx-auto w-full max-w-screen-2xl px-4 py-4 space-y-2'>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    variant='ghost'
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start gap-2 text-gray-300 hover:text-white ${
                      active ? '!bg-white/10 hover:!bg-white/30 text-white border border-white/20' : 'hover:bg-white/5'
                    }`}>
                    <Icon className='h-4 w-4' />
                    {item.name}
                  </Button>
                );
              })}

              {/* Admin-only navigation items */}
              <AdminWrapper>
                {adminNavItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href) || pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant='ghost'
                      onClick={() => {
                        router.push(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start gap-2 text-gray-300 hover:text-white ${
                        active ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20' : 'hover:bg-white/5'
                      }`}>
                      <Icon className='h-4 w-4' />
                      {item.name}
                    </Button>
                  );
                })}
              </AdminWrapper>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
