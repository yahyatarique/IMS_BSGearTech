'use client';

import { useCallback, useEffect, useMemo, useState, MouseEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { USER_ROLES } from '@/enums/users.enum';
import { fetchUsers, updateUser, deleteUser } from '@/services/users';
import type { UserRecord, UsersListMeta } from '@/services/types/users.api.type';
import { UsersStats } from '@/components/pages/users/components/users-stats';
import { UsersCardGrid } from '@/components/pages/users/components/users-card-grid';
import { UserDetailsDialog } from '@/components/pages/users/components/user-details-dialog';
import { UserFormDialog } from '@/components/pages/users/components/user-form-dialog';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserCircle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

const USERS_PAGE_SIZE = 10;

interface UserInfo {
  id: string;
  username: string;
  role: string;
  first_name: string;
  last_name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [meta, setMeta] = useState<UsersListMeta | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const responseBody = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        const description = responseBody?.message ?? responseBody?.error ?? fallbackMessage;

        if (status === 401) {
          toast({
            title: 'Unauthorized',
            description: 'Please sign in again to continue.',
            variant: 'destructive'
          });
          router.push('/login');
          return;
        }

        if (status === 403) {
          toast({
            title: 'Access denied',
            description: 'You do not have permission to view this resource.',
            variant: 'destructive'
          });
          router.push('/');
          return;
        }

        toast({ title: 'Request failed', description, variant: 'destructive' });
        return;
      }

      toast({ title: 'Request failed', description: fallbackMessage, variant: 'destructive' });
    },
    [router, toast]
  );

  const loadUsers = useCallback(
    async (options?: { page?: number; append?: boolean; silent?: boolean }) => {
      const page = options?.page ?? 1;
      const append = options?.append ?? false;
      const silent = options?.silent ?? false;

      if (append) {
        setIsLoadingMore(true);
      } else if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetchUsers({ page, pageSize: USERS_PAGE_SIZE });
        const payload = response.data?.data;
        const items = payload?.items ?? [];
        const metaData = payload?.meta ?? null;

        setMeta(metaData);

        setUsers((prev) => {
          if (append) {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = items.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          }

          return items;
        });
      } catch (error) {
        handleApiError(error, 'Failed to load users.');
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    const cachedUser = localStorage.getItem('userInfo');

    if (!cachedUser) {
      router.push('/login');
      setIsCheckingAuth(false);
      return;
    }

    try {
      const parsedUser: UserInfo = JSON.parse(cachedUser);

      if (parsedUser.role !== USER_ROLES.SUPER_ADMIN && parsedUser.role !== USER_ROLES.ADMIN) {
        toast({
          title: 'Unauthorized',
          description: "You don't have permission to access the users area.",
          variant: 'destructive'
        });
        router.push('/');
        setIsCheckingAuth(false);
        return;
      }

      setCurrentUser(parsedUser);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Failed to parse cached user info', error);
      localStorage.removeItem('userInfo');
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (isAuthorized) {
      loadUsers({ page: 1 });
    }
  }, [isAuthorized, loadUsers]);

  const handleRefresh: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    loadUsers({ page: 1, silent: true });
  };

  const handleToggleStatus = async (id: string, status: UserRecord['status']) => {
    try {
      const previousUser = users.find((user) => user.id === id);
      const response = await updateUser(id, { status });
      const updatedUser = response.data?.data;

      if (updatedUser) {
        setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));
        setMeta((prev) => {
          if (!prev || !previousUser) {
            return prev;
          }

          const nextCounts = { ...prev.counts };
          const wasAdmin =
            previousUser.role === USER_ROLES.ADMIN || previousUser.role === USER_ROLES.SUPER_ADMIN;
          const isAdmin =
            updatedUser.role === USER_ROLES.ADMIN || updatedUser.role === USER_ROLES.SUPER_ADMIN;

          if (previousUser.status === 'active' && updatedUser.status !== 'active') {
            nextCounts.active = Math.max(0, nextCounts.active - 1);
          } else if (previousUser.status !== 'active' && updatedUser.status === 'active') {
            nextCounts.active += 1;
          }

          if (wasAdmin && !isAdmin) {
            nextCounts.admins = Math.max(0, nextCounts.admins - 1);
          } else if (!wasAdmin && isAdmin) {
            nextCounts.admins += 1;
          }

          return {
            ...prev,
            counts: nextCounts
          };
        });
      }

      toast({
        title: 'User updated',
        description: `User status changed to ${status}.`,
        variant: 'success'
      });
    } catch (error) {
      handleApiError(error, 'Failed to update user status.');
    }
  };

  const handleDelete = async (id: string) => {
    setUserToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      setMeta((prev) => {
        if (!prev) {
          return prev;
        }

        const deletedUser = users.find((user) => user.id === userToDelete);
        const nextCounts = { ...prev.counts };

        if (deletedUser) {
          if (deletedUser.status === 'active') {
            nextCounts.active = Math.max(0, nextCounts.active - 1);
          }

          if (
            deletedUser.role === USER_ROLES.ADMIN ||
            deletedUser.role === USER_ROLES.SUPER_ADMIN
          ) {
            nextCounts.admins = Math.max(0, nextCounts.admins - 1);
          }
        }

        const totalItems = Math.max(0, prev.totalItems - 1);
        const pageSize = prev.pageSize || USERS_PAGE_SIZE;
        const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
        const currentPage = Math.min(prev.page, totalPages === 0 ? 1 : totalPages);

        return {
          ...prev,
          page: currentPage,
          totalItems,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
          counts: {
            ...nextCounts,
            total: Math.max(0, prev.counts.total - 1)
          }
        };
      });
      
      setUserToDelete(null);
      
      toast({
        title: 'User deleted',
        description: 'The user account has been removed.',
        variant: 'success'
      });
    } catch (error) {
      handleApiError(error, 'Failed to delete user.');
    }
  };

  const stats = useMemo(() => {
    if (meta?.counts) {
      return meta.counts;
    }

    const total = users.length;
    const active = users.filter((user: UserRecord) => user.status === 'active').length;
    const admins = users.filter(
      (user: UserRecord) => user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN
    ).length;

    return { total, active, admins };
  }, [meta, users]);

  const handleLoadMore = useCallback(() => {
    if (!meta || !meta.hasNext || isLoadingMore) {
      return;
    }

    loadUsers({ page: meta.page + 1, append: true });
  }, [isLoadingMore, loadUsers, meta]);

  const handleCardClick = (user: UserRecord) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleToggleStatusFromDetails = async (id: string, status: UserRecord['status']) => {
    await handleToggleStatus(id, status);
    // Refresh selected user data
    const updatedUser = users.find((u) => u.id === id);
    if (updatedUser) {
      setSelectedUser(updatedUser);
    }
  };

  const handleDeleteFromDetails = async (id: string) => {
    await handleDelete(id);
    setSelectedUser(null);
  };

  const handleEditFromDetails = () => {
    // Close details dialog when edit is initiated
    // The user will open edit dialog from details dialog
    loadUsers({ page: meta?.page ?? 1, silent: true });
  };

  if (isCheckingAuth) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="User Management"
      subtitle="Manage system users and their permissions"
      icon={UserCircle}
      gradient="blue-cyan"
      headerActions={
        <>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </Button>
          <UserFormDialog onSuccess={() => loadUsers({ page: 1, silent: true })} />
        </>
      }
    >
      <UsersStats
          total={stats.total}
          active={stats.active}
          admins={stats.admins}
          loading={isLoading && users.length === 0}
        />
        <UsersCardGrid
          users={users}
          meta={meta ?? undefined}
          isLoading={isLoading && users.length === 0}
          isLoadingMore={isLoadingMore}
          currentUserId={currentUser?.id}
          onCardClick={handleCardClick}
        onLoadMore={handleLoadMore}
      />

      <UserDetailsDialog
        user={selectedUser}
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedUser(null);
        }}
        currentUserId={currentUser?.id}
        onToggleStatus={handleToggleStatusFromDetails}
        onDelete={handleDeleteFromDetails}
        onEdit={handleEditFromDetails}
      />

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  );
}