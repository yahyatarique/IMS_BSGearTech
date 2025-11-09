'use client';

import { ProfileRecord } from '@/services/types/profile.api.type';
import { Button } from '@/components/ui/button';
import { EntityDetailsDialog } from '@/components/ui/entity-details-dialog';
import { Package, IndianRupee, Ruler, Flame, Zap, Percent, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileRecord | null;
  onEdit: (profile: ProfileRecord) => void;
  onDelete: (id: string) => void;
}

const statusBadgeClassName = 'text-slate-700 border-slate-500/20 text-base px-4 py-2';

export function ProfileDetailsDialog({
  open,
  onOpenChange,
  profile,
  onEdit,
  onDelete
}: ProfileDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  if (!profile) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(profile.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <EntityDetailsDialog
        open={open}
        onClose={() => onOpenChange(false)}
        isOperating={isDeleting}
        leftSectionHeading={profile.name}
        header={{
          title: 'Profile Details',
          subtitle: 'View and manage profile information',
          status: [
            {
              label: (
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {profile.material}
                </span>
              ),
              value: 'material',
              className: `bg-slate-500/10 dark:text-slate-400 ${statusBadgeClassName}`
            },
            {
              label: `₹${Number(profile.material_rate).toFixed(2)}/unit`,
              value: 'rate',
              className: `bg-blue-500/10 dark:text-blue-400 ${statusBadgeClassName}`
            }
          ]
        }}
        renderFooter={() => (
          <>
            <Button variant="outline" onClick={() => onEdit(profile)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        )}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Cut Size Width (mm)
              </p>
              <p className="text-base font-medium text-foreground">
                {Number(profile.cut_size_width_mm).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Cut Size Height (mm)
              </p>
              <p className="text-base font-medium text-foreground">
                {Number(profile.cut_size_height_mm).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Burning Wastage %
              </p>
              <p className="text-base font-medium text-foreground">
                {Number(profile.burning_wastage_percent).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Heat Treatment Rate
              </p>
              <p className="text-base font-medium text-foreground">
                ₹{Number(profile.heat_treatment_rate).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Heat Treatment Inefficacy %
            </p>
            <p className="text-base font-medium text-foreground">
              {profile.heat_treatment_inefficacy_percent}%
            </p>
          </div>
        </div>
      </EntityDetailsDialog>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete Profile"
        description="Are you sure you want to delete this profile? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
