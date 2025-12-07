'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle } from 'lucide-react';

export type StatusOption = {
  value: string;
  label: string;
  description?: string;
  variant?: 'default' | 'warning' | 'destructive';
};

interface ChangeStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newStatus: string) => Promise<void>;
  currentStatus: string;
  statusOptions: StatusOption[];
  title?: string;
  description?: string;
  entityName?: string;
}

export function ChangeStatusDialog({
  open,
  onClose,
  onConfirm,
  currentStatus,
  statusOptions,
  title = 'Change Status',
  description = 'Select a new status for this item',
  entityName = 'item',
}: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedStatus);
      onClose();
    } catch (error) {
      console.log('handleConfirm ~ error:', error);
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = statusOptions.find((opt) => opt.value === selectedStatus);
  const isChanged = selectedStatus !== currentStatus;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && newOpen === false && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                    selectedStatus === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      {option.label}
                      {option.value === currentStatus && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">(Current)</span>
                      )}
                    </Label>
                    {option.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {isChanged && selectedOption && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-medium">Confirm Status Change</p>
                <p className="text-xs mt-0.5">
                  The {entityName} status will be changed to <strong>{selectedOption.label}</strong>
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !isChanged}
          >
            {isSubmitting ? 'Updating...' : isChanged ? 'Update Status' : 'No Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
