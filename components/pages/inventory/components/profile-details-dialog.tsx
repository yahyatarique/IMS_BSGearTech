'use client';

import { ProfileRecord } from '@/services/types/profile.api.type';
import { Button } from '@/components/ui/button';
import { EntityDetailsDialog } from '@/components/ui/entity-details-dialog';
import { IndianRupee, Pencil, Trash2, Settings } from 'lucide-react';
import { calculateTeethCost } from '@/utils/calculationHelper';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Section } from '@/components/ui/section';

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

  const tcTgCost = calculateTeethCost(
    Number(profile.no_of_teeth),
    Number(profile.module),
    Number(profile.face),
    Number(profile.rate)
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(String(profile.id || ''));
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
              label: profile.type === '0' ? 'Gear' : 'Pinion',
              value: 'type',
              className: `bg-slate-500/10 dark:text-slate-400 ${statusBadgeClassName}`
            },
            {
              label: profile.material,
              value: 'material',
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
        <div className="space-y-4">
          <Section
            title="Gear Specifications"
            variant="default"
            className="p-4 shadow-none bg-gray-100 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">No. of Teeth</p>
                <p className="text-base font-medium">{profile.no_of_teeth}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Module</p>
                <p className="text-base font-medium">{Number(profile.module)?.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Face</p>
                <p className="text-base font-medium">{profile.face}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Finish Size</p>
                <p className="text-base font-medium">{profile.finish_size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teeth Rate (₹)</p>
                <p className="text-base font-medium">₹{Number(profile.rate).toFixed(2)}</p>
              </div>
            </div>
          </Section>

          <Section
            title="Weight & Material"
            variant="default"
            className="p-4 shadow-none bg-gray-100 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Burning Weight (kg)</p>
                <p className="text-base font-medium">{Number(profile.burning_weight).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Weight (kg)</p>
                <p className="text-base font-medium">{Number(profile.total_weight).toFixed(2)}</p>
              </div>
            </div>
          </Section>

          <Section
            title="Cost Breakdown"
            variant="default"
            className="p-4 shadow-none bg-gray-100 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">HT Rate (₹)</p>
                <p className="text-base font-medium">₹{Number(profile.ht_rate).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HT Cost (₹)</p>
                <p className="text-base font-medium">₹{Number(profile.ht_cost).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TC+TG Cost (₹)</p>
                <p className="text-base font-medium">₹{Number(tcTgCost).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CYN/Grinding (₹)</p>
                <p className="text-base font-medium">₹{Number(profile.cyn_grinding).toFixed(2)}</p>
              </div>
            </div>
          </Section>

          {profile.processes && profile.processes.length > 0 && (
            <Section
              title="Additional Processes"
              variant="default"
              className="p-4 shadow-none bg-gray-100 dark:bg-slate-900/80"
              icon={Settings}
            >
              <div className="space-y-2">
                {profile.processes.map((process, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded"
                  >
                    <span className="text-sm font-medium">{process.name}</span>
                    <span className="text-sm font-semibold">
                      ₹{Number(process.cost).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section
            title="Total Cost"
            variant="default"
            className="p-4 shadow-none bg-gray-100 dark:bg-slate-900/80"
          >
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Total
              </p>
              <p className="text-2xl font-bold text-primary">₹{Number(profile.total).toFixed(2)}</p>
            </div>
          </Section>
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
