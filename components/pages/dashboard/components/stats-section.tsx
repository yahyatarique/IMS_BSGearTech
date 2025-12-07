import { ShoppingCart, Users, Flame } from 'lucide-react';
import { fetchDashboardStats } from '@/services/dashboard';
import { DashboardCard } from '@/components/pages/dashboard/components/dashboard-card';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatNumber(value: number): string {
  if (value >= 1000) {
    return numberFormatter.format(value);
  }
  return value.toString();
}

function formatTrend(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

export default async function StatsSection() {
  const response = await fetchDashboardStats();

  if (!response.data) {
    return null;
  }
  
  const { orders, buyers, burningWastage } = response.data.data;

  const cards = [
    {
      title: 'Total Orders',
      value: orders.total,
      gradient: 'from-blue-500 to-cyan-500 dark:from-blue-500/30 dark:to-cyan-500/30',
      trend: orders.percentageChange,
      isPositive: orders.isPositive,
      description: 'From all time',
      Icon: ShoppingCart,
    },
    {
      title: 'Active Buyers',
      value: buyers.total,
      gradient: 'from-indigo-500 to-blue-500  dark:from-indigo-500/30 dark:to-blue-500/30',
      trend: buyers.percentageChange,
      isPositive: buyers.isPositive,
      description: 'Registered customers',
      Icon: Users,
    },
    {
      title: 'Total Burning Wastage',
      value: burningWastage.total,
      gradient: 'from-orange-500 to-red-500  dark:from-orange-500/30 dark:to-red-500/30',
      trend: burningWastage.percentageChange,
      isPositive: burningWastage.isPositive,
      description: 'From completed orders (kg)',
      Icon: Flame,
    },
  ];

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ title, value, Icon, gradient, trend, isPositive, description }) => (
        <DashboardCard
          key={title}
          title={title}
          gradient={gradient}
          icon={Icon}
          showContentDivider={false}
          headerClassName="px-6 pb-2 pt-5"
          contentClassName="px-6 pb-6 pt-0"
        >
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(value)}
            </p>
            {description && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{description}</p>
            )}
            <p className="mt-2 text-xs">
              <span
                className={
                  isPositive
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'
                }
              >
                {isPositive ? '↑' : '↓'} {formatTrend(trend)}
              </span>
              <span className="text-slate-600 dark:text-slate-400"> from last month</span>
            </p>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
