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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import {
  CreateInventorySchema,
  CreateInventoryInput,
  UpdateInventoryInput
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
  onSubmit
}: InventoryFormDialogProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      material_type: 'CR-5',
      width: 0,
      height: 0,
      quantity: 0
    }
  });

  useEffect(() => {
    if (inventory) {
      form.reset({
        material_type: inventory.material_type,
        width: Number(inventory.width),
        height: Number(inventory.height),
        quantity: Number(inventory.quantity)
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value === 'CR-5' ? 'CR-5' : 'EN-9'}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem
                          onClick={() => field.onChange('CR-5')}
                          className="cursor-pointer"
                        >
                          CR-5
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => field.onChange('EN-9')}
                          className="cursor-pointer"
                        >
                          EN-9
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight is calculated automatically based on dimensions */}
            <p className="text-sm text-muted-foreground">
              Material weight will be calculated automatically based on the dimensions.
            </p>

            {/* Width and Height */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="width"
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
                name="height"
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

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(parseInt(val, 10));
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
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
