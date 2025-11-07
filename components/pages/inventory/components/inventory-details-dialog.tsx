'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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

  const materialInfo = inventory.materialInfo;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span>Inventory Item Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Material Summary Section */}
          {materialInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-[#bbeaed] dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {materialInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Material Type: {materialInfo.material}
                  </p>
                </div>
                <Badge
                  className={cn('flex-shrink-0', MATERIAL_STATUS[materialInfo.status]?.className)}
                >
                  {MATERIAL_STATUS[materialInfo.status]?.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Package className="h-3 w-3" />
                    <span>Total Stock</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {quantityFormatter.format(materialInfo.stock)} {materialInfo.unit}
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {quantityFormatter.format(materialInfo.pendingDelivery)} {materialInfo.unit}
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Available</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {quantityFormatter.format(materialInfo.stock - materialInfo.pendingDelivery)}{' '}
                    {materialInfo.unit}
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Layers className="h-3 w-3" />
                    <span>Profiles</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {materialInfo.profileCount}
                  </p>
                </div>
              </div>
            </div>
          )}

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

              {/* Cut Size */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Cut Size (Width × Height)
                </h4>
                <p className="text-lg font-medium text-foreground">
                  {Number(inventory.cut_size_width).toFixed(2)} ×{' '}
                  {Number(inventory.cut_size_height).toFixed(2)} mm
                </p>
              </div>

              {/* PO Number */}
              {inventory.po_number && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PO Number
                  </h4>
                  <p className="text-lg font-medium text-foreground">{inventory.po_number}</p>
                </div>
              )}

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
        
      <DialogFooter>
        <div className="flex justify-end gap-2 pt-4 w-full border-t">
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
        </div>
      </DialogFooter>
      </DialogContent>
      

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
    </Dialog>
  );
}
