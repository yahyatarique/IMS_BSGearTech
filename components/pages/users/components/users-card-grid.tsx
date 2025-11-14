import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { UserRecord, UsersListMeta } from '@/services/types/users.api.type';
import { USER_ROLES } from '@/enums/users.enum';
import { UserCircle, Shield, Activity } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.USER]: 'User'
};

const statusClasses: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  suspended: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20'
};

function getStatusLabel(status: UserRecord['status']) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'suspended':
      return 'Suspended';
    default:
      return 'Unknown';
  }
}

interface UsersCardGridProps {
  users: UserRecord[];
  meta?: UsersListMeta;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentUserId?: string;
  onCardClick: (user: UserRecord) => void;
  onLoadMore: () => void;
}

function CardSkeleton() {
  return (
    <GradientBorderCard>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </GradientBorderCard>
  );
}

export function UsersCardGrid({
  users,
  meta,
  isLoading,
  isLoadingMore,
  currentUserId,
  onCardClick,
  onLoadMore
}: UsersCardGridProps) {
  // Event delegation handler - single handler for all cards
  const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cardElement = (event.target as HTMLElement).closest('[data-user-id]');
    if (!cardElement) return;

    const userId = cardElement.getAttribute('data-user-id');
    const user = users.find((u) => u.id === userId);
    if (user) {
      onCardClick(user);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <GradientBorderCard className="p-12 text-center">
        <UserCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Users Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          There are no users to display. Create your first user to get started.
        </p>
      </GradientBorderCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Grid with Event Delegation */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        onClick={handleGridClick}
      >
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;

          return (
            <GradientBorderCard
              key={user.id}
              data-user-id={user.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:scale-[1.02] ',
                {
                    'bg-primary-50/80 dark:bg-primary-900/10': isCurrentUser
                }
              )}
            >
              <div
                className={cn('space-y-4 p-6 ')}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                      @{user.username}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('border ml-2 flex-shrink-0', statusClasses[user.status])}
                  >
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Created {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                {isCurrentUser && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Your Account
                    </span>
                  </div>
                )}
              </div>
            </GradientBorderCard>
          );
        })}
      </div>

      {/* Load More Button */}
      {meta && meta.hasNext && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="min-w-[200px]"
          >
            {isLoadingMore ? 'Loading...' : `Load More (${meta.page} of ${meta.totalPages})`}
          </Button>
        </div>
      )}
    </div>
  );
}
