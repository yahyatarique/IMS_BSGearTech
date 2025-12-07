import Link from 'next/link';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/pages/dashboard/components/dashboard-card';
import { fetchRecentBuyers } from '@/services/dashboard';
import { cn, formatDate } from '@/lib/utils';

const gradients = [
  'from-blue-500 to-cyan-500  dark:from-blue-500/30 dark:to-cyan-500/30',
  'from-sky-500 to-blue-600  dark:from-sky-500/30 dark:to-blue-500/30',
  'from-indigo-500 to-blue-500  dark:from-indigo-500/30 dark:to-blue-500/30',
  'from-cyan-500 to-teal-500  dark:from-cyan-500/30 dark:to-teal-500/30',
  'from-blue-600 to-indigo-600  dark:from-blue-500/30 dark:to-indigo-500/30',
];

const statusClasses: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-700 dark:text-gray-500 border-gray-500/20',
  blocked: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20',
};

function getStatusClass(status: string) {
  return statusClasses[status] ?? statusClasses.inactive;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export async function RecentBuyers() {
  const response = await fetchRecentBuyers({ limit: 5 });
  const buyers = response.data?.data ?? [];

  return (
    <DashboardCard
      title="Recent Buyers"
      description="Recently added customers"
      icon={Users}
      gradient="from-blue-500 to-cyan-500  dark:from-blue-500/30 dark:to-cyan-500/30"
      action={
        <Link
          href="/buyers"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          View All
        </Link>
      }
    >
      <div className="space-y-3">
        {buyers.length === 0 && (
          <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            No buyers have been added yet.
          </div>
        )}

        {buyers.map((buyer, index) => {
          const initials = getInitials(buyer.name);
          const gradient = gradients[index % gradients.length];
          const statusLabel = buyer.status?.charAt(0)?.toUpperCase() + buyer.status?.slice(1) || 'Unknown';
          const statusClass = getStatusClass(buyer.status);
          const addedDate = formatDate(buyer.addedDate);

          return (
            <div
              key={buyer.id}
              className="flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-sm font-semibold text-white shadow-md dark:border-slate-700',
                  gradient,
                )}
              >
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {buyer.name}
                  </p>
                  <Badge variant="outline" className={statusClass}>
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {buyer.company}
                </p>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {buyer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{buyer.email}</span>
                    </div>
                  )}
                  {buyer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{buyer.phone}</span>
                    </div>
                  )}
                  {buyer.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{buyer.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-sm font-semibold text-transparent">
                  {buyer.totalOrders} Orders
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Added {addedDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
