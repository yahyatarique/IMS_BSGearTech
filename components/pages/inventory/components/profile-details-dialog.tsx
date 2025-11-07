'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Package, IndianRupee, Ruler, Flame, Zap, Percent } from 'lucide-react';

interface ProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileRecord | null;
  onEdit: (profile: ProfileRecord) => void;
  onDelete: (id: string) => void;
}

export function ProfileDetailsDialog({
  open,
  onOpenChange,
  profile,
  onEdit,
  onDelete,
}: ProfileDetailsDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{profile.name}</span>
          </DialogTitle>
          <DialogDescription>Profile Details</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Material
              </p>
              <p className="text-base font-medium text-foreground">{profile.material}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Material Rate
              </p>
              <p className="text-base font-medium text-foreground">₹{Number(profile.material_rate).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Cut Size Width (mm)
              </p>
              <p className="text-base font-medium text-foreground">{Number(profile.cut_size_width_mm).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Cut Size Height (mm)
              </p>
              <p className="text-base font-medium text-foreground">{Number(profile.cut_size_height_mm).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Burning Wastage %
              </p>
              <p className="text-base font-medium text-foreground">{Number(profile.burning_wastage_percent).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Heat Treatment Rate
              </p>
              <p className="text-base font-medium text-foreground">₹{Number(profile.heat_treatment_rate).toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Heat Treatment Inefficacy %
            </p>
            <p className="text-base font-medium text-foreground">{profile.heat_treatment_inefficacy_percent}%</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onEdit(profile)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(profile.id)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
