import { ShoppingCart, Users, Package } from 'lucide-react';
import { fetchDashboardStats } from '../../services/dashboard';

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
  const res = await fetchDashboardStats();

  const {orders, buyers, products} = res.data?.data


  const cards = [
    {
      title: 'Total Orders',
      value: orders.total,
      gradient: 'from-blue-500 to-cyan-500',
      trend: orders.percentageChange,
      isPositive: orders.isPositive,
      description: 'From all time',
      Icon: ShoppingCart
    },
    {
      title: 'Active Buyers',
      value: buyers.total,
      gradient: 'from-indigo-500 to-blue-500',
      trend: buyers.percentageChange,
      isPositive: buyers.isPositive,
      description: 'Registered customers',
      Icon: Users
    },
    {
      title: 'Total Products',
      value: products.total,
      gradient: 'from-green-500 to-emerald-500',
      trend: products.percentageChange,
      isPositive: products.isPositive,
      description: 'Tracked order profiles',
      Icon: Package
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {cards.map(({ title, value, Icon, gradient, trend, isPositive, description }) => (
        <div
          key={title}
          className="overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 rounded-xl"
        >
          <div className={`h-2 bg-gradient-to-r ${gradient}`} />
          <div className="flex items-center justify-between px-6 py-4 pb-3">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(value)}
              </p>
              {description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p>
              )}
              <p className="text-xs mt-2">
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
            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
