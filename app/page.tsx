import { Suspense } from 'react';
import StatsSection from '@/components/pages/dashboard/components/stats-section';
import StatsSectionSkeleton from '@/components/pages/dashboard/components/stats-section-skeleton';
import { StatsSectionBoundary } from '@/components/pages/dashboard/components/stats-section-boundary';
import RecentOrders from '@/components/pages/dashboard/components/recent-orders';
import RecentOrdersSkeleton from '@/components/pages/dashboard/components/recent-orders-skeleton';
import { RecentOrdersBoundary } from '@/components/pages/dashboard/components/recent-orders-boundary';
import { RecentBuyers } from '@/components/pages/dashboard/components/recent-buyers';
import RecentBuyersSkeleton from '@/components/pages/dashboard/components/recent-buyers-skeleton';
import { RecentBuyersBoundary } from '@/components/pages/dashboard/components/recent-buyers-boundary';
import { MaterialsAndProfiles } from '@/components/pages/dashboard/components/materials-and-profiles';
import { MateraiAndProfilesBoundary } from '../components/pages/dashboard/components/materials-and-profiles-boundary';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
            Welcome back, Admin
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your inventory today
          </p>
        </div>

        {/* Stats Grid */}
        <StatsSectionBoundary>
          <Suspense fallback={<StatsSectionSkeleton />}>
            <StatsSection />
          </Suspense>
        </StatsSectionBoundary>

        {/* Recent Orders Section */}
        <div className="mb-8">
          <RecentOrdersBoundary>
            <Suspense fallback={<RecentOrdersSkeleton />}>
              <RecentOrders />
            </Suspense>
          </RecentOrdersBoundary>
        </div>

        {/* Recent Buyers Section */}
        <div className="mb-8">
          <RecentBuyersBoundary>
            <Suspense fallback={<RecentBuyersSkeleton />}>
              <RecentBuyers />
            </Suspense>
          </RecentBuyersBoundary>
        </div>

        {/* Materials and Profiles Section */}
        <MateraiAndProfilesBoundary>
          <MaterialsAndProfiles />
        </MateraiAndProfilesBoundary>
      </main>
    </div>
  );
}
