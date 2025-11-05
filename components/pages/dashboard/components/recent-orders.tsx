import type { ComponentType } from 'react';
import Link from 'next/link';
import { ShoppingCart, Clock, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchRecentOrders } from '@/services/dashboard';
import { DashboardCard } from '@/components/pages/dashboard/components/dashboard-card';

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  '0': {
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
    icon: Clock,
  },
  '1': {
    label: 'Processing',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20',
    icon: ShoppingCart,
  },
  '2': {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
    icon: CheckCircle2,
  },
  '3': {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20',
    icon: XCircle,
  },
  '4': {
    label: 'On Hold',
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    icon: PauseCircle,
  },
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function resolveStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['0'];
}

export default async function RecentOrders() {
  const response = await fetchRecentOrders({ limit: 5 });
  const orders = response.data?.data ?? [];

  return (
    <DashboardCard
      title="Recent Orders"
      description="Latest orders placed by buyers"
      icon={ShoppingCart}
      gradient="from-blue-500 to-cyan-500"
      action={
        <Link
          href="#"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          View All
        </Link>
      }
    >
      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            No orders have been placed yet.
          </div>
        )}

        {orders.map((order) => {
          const statusInfo = resolveStatusConfig(order.status);
          const StatusIcon = statusInfo.icon;
          const buyerName = order.buyer?.name ?? 'Unknown buyer';
          const buyerCompany = order.buyer?.company ?? '—';
          const formattedAmount = currencyFormatter.format(order.amount);
          const formattedDate = dateFormatter.format(new Date(order.date));

          return (
            <div
              key={order.id}
              className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {order.orderNumber}
                  </p>
                  <Badge className={statusInfo.className}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{buyerName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{buyerCompany}</p>
              </div>
              <div className="text-right">
                <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-sm font-semibold text-transparent">
                  {formattedAmount}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
