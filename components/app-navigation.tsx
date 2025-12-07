'use client';

import {  usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminWrapper } from '@/components/wrappers';
import {
  ShoppingCart,
  Users,
  Package,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { USER_ROLES } from '@/enums/users.enum';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from '@bprogress/next/app';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Buyers', href: '/buyers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package }
];

const adminNavItems = [{ name: 'Users', href: '/users', icon: UserCircle }];

export function AppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logout: handleLogout } = useAuth();

  const isActive = (href: string) => pathname === href;

  // // Check if user is admin (role '0' or '1')
  // const isAdmin = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.ADMIN;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return (
      `${firstInitial}${lastInitial}`.toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'
    );
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (!user) return 'Loading...';
    switch (user.role) {
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
    if (!user) return 'Loading...';
    return `${user.first_name} ${user.last_name}`.trim() || user.username;
  };

  return (
    <>
      {/* Topbar with gradient */}
      <nav className="sticky top-0 z-50 border-b bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6 xl:gap-8">
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/"
                className="h-8 w-[150px] block"
              >
                <Image
                  src="/images/logo/bs_geartech_logo.png"
                  alt="BS GearTech Logo"
                  width={150}
                  height={40}
                  unoptimized
                  unselectable="on"
                  className="h-8"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden min-w-0 flex-1 items-center gap-2 whitespace-nowrap lg:flex xl:gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => router.push(item.href)}
                    className={`gap-2 text-gray-300 hover:text-white transition-all ${
                      active
                        ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20'
                        : 'hover:bg-white/5'
                    }`}
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}

              {/* Admin-only navigation items */}
              <AdminWrapper allowSuperAdminOnly={true}>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href) || pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => router.push(item.href)}
                      className={`gap-2 text-gray-300 hover:text-white transition-all ${
                        active
                          ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20'
                          : 'hover:bg-white/5'
                      }`}
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  );
                })}
              </AdminWrapper>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {/* User Avatar with Dropdown */}
            {!isLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-white/5">
                    <Avatar className="h-8 w-8 border-2 border-blue-400 dark:border-blue-400/50">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-600/30 dark:to-cyan-500/30 text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-left hidden md:block">
                      <p className="text-white font-medium">{getFullName()}</p>
                      <p className="text-gray-400 text-xs">{getRoleDisplay()}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="gap-2 cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme Toggle - Desktop Only */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg animate-in slide-in-from-top-2 duration-200">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start gap-2 text-gray-300 hover:text-white ${
                      active
                        ? '!bg-white/10 hover:!bg-white/30 text-white border border-white/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}

              {/* Admin-only navigation items */}
              <AdminWrapper allowSuperAdminOnly={true}>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href) || pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => {
                        router.push(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start gap-2 text-gray-300 hover:text-white ${
                        active
                          ? '!bg-white/10 text-white border hover:!bg-white/30 border-white/20'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  );
                })}
              </AdminWrapper>

              {/* Theme Toggle in Mobile Menu */}
              <div className="pt-2 border-t border-white/10">
                <ThemeToggle variant="cycle" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
