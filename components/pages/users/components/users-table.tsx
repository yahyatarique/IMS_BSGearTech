import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserRecord, UsersListMeta } from '@/services/types/users.api.type';
import { USER_ROLES } from '@/enums/users.enum';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { EditUserDialog } from './edit-user-dialog';

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

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  year: 'numeric',
  month: 'short',
  day: '2-digit'
});

interface UsersTableProps {
  users: UserRecord[];
  meta?: UsersListMeta;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentUserId?: string;
  onToggleStatus: (id: string, status: UserRecord['status']) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
  onEdit?: () => void;
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export function UsersTable({
  users,
  meta,
  isLoading,
  isLoadingMore,
  currentUserId,
  onToggleStatus,
  onDelete,
  onLoadMore,
  onEdit
}: UsersTableProps) {
  if (isLoading) {
    return (
      <GradientBorderCard gradient="blue-cyan">
        <div className="rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="px-6 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableSkeleton />
            </Table>
          </div>
        </div>
      </GradientBorderCard>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No users found. Create a new user to get started.
      </div>
    );
  }

  return (
    <GradientBorderCard gradient="blue-cyan">
      <div className="rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const createdDate = dateFormatter.format(new Date(user.created_at));
                const isSelf = currentUserId === user.id;
                const nextStatus = user.status === 'active' ? 'inactive' : 'active';

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {user.first_name} {user.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {ROLE_LABELS[user.role] ?? 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border',
                          statusClasses[user.status] ??
                            'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                        )}
                      >
                        {getStatusLabel(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                      {createdDate}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <EditUserDialog user={user} onSuccess={onEdit} disabled={isSelf} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(user.id, nextStatus)}
                        disabled={isSelf}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                        disabled={isSelf}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {meta?.hasNext && (
          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <Button onClick={onLoadMore} disabled={isLoadingMore} className="w-full">
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
