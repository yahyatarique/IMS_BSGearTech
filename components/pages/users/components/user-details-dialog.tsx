import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import type { UserRecord } from '@/services/types/users.api.type';
import { USER_ROLES } from '@/enums/users.enum';
import { Mail, Calendar, Shield, Activity } from 'lucide-react';
import { UserFormDialog } from './user-form-dialog';
import { ChangeStatusDialog, StatusOption } from '@/components/ui/change-status-dialog';
import { EntityDetailsDialog } from '@/components/ui/entity-details-dialog';

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.SUPE_OPS]: 'Supe Ops'
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

const USER_STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'active',
    label: 'Active',
    description: 'User can access the system normally',
    variant: 'default'
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'User account is disabled but can be reactivated',
    variant: 'warning'
  },
  {
    value: 'suspended',
    label: 'Suspended',
    description: 'User account is temporarily blocked',
    variant: 'destructive'
  }
];

interface UserDetailsDialogProps {
  user: UserRecord | null;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
  onToggleStatus: (id: string, status: UserRecord['status']) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
}

export function UserDetailsDialog({
  user,
  open,
  onClose,
  currentUserId,
  onToggleStatus,
  onDelete,
  onEdit
}: UserDetailsDialogProps) {
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const isCurrentUser = user.id === currentUserId;
  const canModify = !isCurrentUser;

  const handleStatusChange = async (newStatus: string) => {
    await onToggleStatus(user.id, newStatus as UserRecord['status']);
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(user.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    onEdit();
    onClose();
  };

  const isOperating = isDeleting;

  return (
    <>
      <EntityDetailsDialog
        leftSectionHeading={user.first_name + user.last_name}
        leftSectionSubheading={'@' + user.username}
        open={open}
        onClose={onClose}
        isOperating={isOperating}
        childContClassName='pb-4 px-1'
        header={{
          title: 'User Details',
          subtitle: 'View and manage user information',
          status: [
            {
              label: getStatusLabel(user.status),
              value: user.status,
              className: statusClasses[user.status]
            },
            {
              label: ROLE_LABELS[user.role] || user.role,
              value: user.role,
              className: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400'
            }
          ]
        }}
        renderFooter={
          canModify
            ? () => (
                <>
                  <UserFormDialog user={user} onSuccess={handleEditSuccess} />
                  <Button
                    variant="outline"
                    onClick={() => setIsChangeStatusOpen(true)}
                    disabled={isOperating}
                  >
                    Change Status
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isOperating}>
                    {isDeleting ? 'Deleting...' : 'Delete User'}
                  </Button>
                </>
              )
            : undefined
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Role
                </p>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {getStatusLabel(user.status)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Created
                </p>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDateTime(user.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  User ID
                </p>
                <p className="text-xs text-slate-900 dark:text-white mt-1 font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {isCurrentUser && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This is your account. You cannot modify your own user settings here.
            </p>
          </div>
        )}
      </EntityDetailsDialog>

      <ChangeStatusDialog
        open={isChangeStatusOpen}
        onClose={() => setIsChangeStatusOpen(false)}
        onConfirm={handleStatusChange}
        currentStatus={user.status}
        statusOptions={USER_STATUS_OPTIONS}
        title="Change User Status"
        description="Select a new status for this user account"
        entityName="user"
      />
    </>
  );
}
