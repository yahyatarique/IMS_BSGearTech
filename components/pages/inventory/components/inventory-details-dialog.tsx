'use client';

import { Button } from '@/components/ui/button';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import {
  Edit,
  Trash2,
  Package,
  Weight,
  Ruler,
  FileText,
  Calendar,
  Layers,
  Clock,
  CheckCircle,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EntityDetailsDialog } from '@/components/ui/entity-details-dialog';
import { cn } from '@/lib/utils';

interface InventoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryRecord | null;
  onEdit: (inventory: InventoryRecord) => void;
  onDelete: (id: string) => Promise<void>;
}

export function InventoryDetailsDialog({
  open,
  onOpenChange,
  inventory,
  onEdit,
  onDelete
}: InventoryDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  if (!inventory) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(inventory.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const MATERIAL_STATUS: Record<string, { label: string; className: string }> = {
    'in-stock': {
      label: 'In Stock',
      className: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20'
    },
    'low-stock': {
      label: 'Low Stock',
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20'
    },
    'out-of-stock': {
      label: 'Out of Stock',
      className: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20'
    }
  };

  const quantityFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  });

  return (
    <>
      <EntityDetailsDialog
        open={open}
        onClose={() => onOpenChange(false)}
        isOperating={isDeleting}
        header={{
          title: 'Inventory Item Details',
          subtitle: 'View and manage inventory information'
        }}
        renderFooter={() => (
          <>
            <Button variant="outline" onClick={() => onEdit(inventory)} className="gap-2">
              <Edit className="h-4 w-4" />
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
        <div className="space-y-6">
          {/* Individual Item Details */}
          <div className="border-t pt-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Item Specific Details
            </h3>

            <div className="space-y-4 grid grid-cols-2">
              {/* Material Type */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Material Type
                </h4>
                <Badge variant="outline" className="text-base">
                  {inventory.material_type}
                </Badge>
              </div>

              {/* Material Weight */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Material Weight
                </h4>
                <p className="text-lg font-medium text-foreground">
                  {Number(inventory.material_weight).toFixed(2)} kg
                </p>
              </div>

              {/* Dimensions */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Dimensions
                </h4>
                <p className="text-lg font-medium text-foreground">
                  {Number(inventory.outer_diameter).toFixed(2)}mm OD ×{' '}
                  {Number(inventory.length).toFixed(2)}
                  mm L
                </p>
              </div>

              {/* Rate */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Rate (per kg)
                </h4>
                <p className="text-lg font-medium text-foreground">
                  ₹{Number(inventory.rate).toFixed(2)}
                </p>
              </div>

              {/* Total Cost */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Total Cost
                </h4>
                <p className="text-lg font-medium text-foreground">
                  ₹{(Number(inventory.rate) * Number(inventory.material_weight)).toFixed(2)}
                </p>
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t w-full col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timestamps
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium mb-1">Created</p>
                    <p>{new Date(inventory.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Updated</p>
                    <p>{new Date(inventory.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EntityDetailsDialog>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
