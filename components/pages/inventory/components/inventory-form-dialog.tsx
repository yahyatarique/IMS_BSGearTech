'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  CreateInventorySchema,
  CreateInventoryInput,
  UpdateInventoryInput,
} from '@/schemas/inventory.schema';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { z } from 'zod';

// Form data type - quantity is optional with default
type InventoryFormData = z.input<typeof CreateInventorySchema>;

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryRecord | null;
  onSubmit: (data: CreateInventoryInput | UpdateInventoryInput) => Promise<void>;
}

export function InventoryFormDialog({
  open,
  onOpenChange,
  inventory,
  onSubmit,
}: InventoryFormDialogProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      material_type: 'CR-5',
      material_weight: 0,
      cut_size_width: 0,
      cut_size_height: 0,
      po_number: '',
    },
  });

  useEffect(() => {
    if (inventory) {
      form.reset({
        material_type: inventory.material_type,
        material_weight: Number(inventory.material_weight),
        cut_size_width: Number(inventory.cut_size_width),
        cut_size_height: Number(inventory.cut_size_height),
        po_number: inventory.po_number || '',
      });
    } else {
      form.reset({
        material_type: 'CR-5',
        material_weight: 0,
        cut_size_width: 0,
        cut_size_height: 0,
        po_number: '',
      });
    }
  }, [inventory, form]);

  const handleSubmit = async (data: InventoryFormData) => {
    await onSubmit(data as CreateInventoryInput);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inventory ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Material Type */}
            <FormField
              control={form.control}
              name="material_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="CR-5">CR-5</option>
                      <option value="EN-9">EN-9</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material Weight */}
            <FormField
              control={form.control}
              name="material_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter weight in kg"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cut Size - Width and Height */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cut_size_width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cut Size Width (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Width"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cut_size_height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cut Size Height (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Height"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PO Number */}
            <FormField
              control={form.control}
              name="po_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PO number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : inventory
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
