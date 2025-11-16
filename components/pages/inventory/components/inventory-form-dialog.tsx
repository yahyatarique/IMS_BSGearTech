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
  FormMessage
} from '@/components/ui/form';
import {
  CreateInventorySchema,
  CreateInventoryInput,
  UpdateInventoryInput
} from '@/schemas/inventory.schema';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { calculateCylindricalWeight } from '../../../../utils/material-calculations';

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
  onSubmit
}: InventoryFormDialogProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      material_type: 'CR-5',
      outer_diameter: 0,
      length: 0,
      rate: 0,
      material_weight: 0,
      total_cost: 0
    }
  });

  const rate = form.watch('rate');
  const outer_diameter = form.watch('outer_diameter');
  const length = form.watch('length');

  useEffect(() => {
    const totalWeight = calculateCylindricalWeight(outer_diameter, length);
    const totalCost = rate * totalWeight;

    form.setValue('material_weight', totalWeight || 0);
    form.setValue('total_cost', totalCost || 0);
  }, [rate, outer_diameter, length, form]);

  useEffect(() => {
    if (inventory) {
      form.reset({
        material_type: inventory.material_type,
        outer_diameter: Number(inventory.outer_diameter),
        length: Number(inventory.length),
        rate: Number(inventory.rate)
      });
    }
  }, [inventory, form]);

  const handleSubmit = async (data: InventoryFormData) => {
    try {
      const validatedData = CreateInventorySchema.parse(data);

      await onSubmit(validatedData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Form Submission Error:', error);
    }
  };

  const onCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{inventory ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        {field.value === 'CR-5' ? 'CR-5' : 'EN-9'}
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="CR-5" className="cursor-pointer">
                          CR-5
                        </SelectItem>
                        <SelectItem value="EN-9" className="cursor-pointer">
                          EN-9
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight is calculated automatically based on dimensions */}
            <p className="text-sm text-muted-foreground">
              Material weight will be calculated automatically based on the dimensions.
            </p>

            {/* Outer_diameter and Length */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="outer_diameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outer Diameter (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Outer Diameter"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(parseFloat(val));
                        }}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val)) {
                            field.onChange(0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Length"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (per kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter rate"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate and Material Weight */}
            <div className="grid grid-cols-2 gap-4">
              {/* Material Weight */}
              <FormField
                name="material_weight"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={Number(field.value)?.toFixed(2)}
                        type="number"
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Rate  */}
              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (Rate × Weight)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={Number(field.value)?.toFixed(2)}
                        type="number"
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {form.formState.isSubmitting ? 'Saving...' : inventory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
