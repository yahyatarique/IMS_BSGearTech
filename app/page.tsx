import { Suspense } from 'react';
import StatsSection from '@/components/dashboard/stats-section';
import StatsSectionSkeleton from '@/components/dashboard/stats-section-skeleton';
import { StatsSectionBoundary } from '@/components/dashboard/stats-section-boundary';
import RecentOrders from '@/components/pages/dashboard/components/recent-orders';
import RecentOrdersSkeleton from '@/components/pages/dashboard/components/recent-orders-skeleton';
import { RecentOrdersBoundary } from '@/components/pages/dashboard/components/recent-orders-boundary';
import { RecentBuyers } from '@/components/pages/dashboard/components/recent-buyers';
import RecentBuyersSkeleton from '@/components/pages/dashboard/components/recent-buyers-skeleton';
import { RecentBuyersBoundary } from '@/components/pages/dashboard/components/recent-buyers-boundary';
import { MaterialsAndProfiles } from '@/components/pages/dashboard/components/materials-and-profiles';

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
            Here's what's happening with your inventory today
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
        <MaterialsAndProfiles />
      </main>
    </div>
  );
}
