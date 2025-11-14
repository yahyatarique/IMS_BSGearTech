'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProfileSchema, CreateProfileInput, ProfileType } from '@/schemas/profile.schema';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { fetchInventory } from '@/services/inventory';
import { InventoryRecord } from '@/services/types/inventory.api.type';

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProfileInput) => Promise<void>;
  profile?: ProfileRecord | null;
}

export function ProfileFormDialog({
  open,
  onOpenChange,
  onSubmit,
  profile
}: ProfileFormDialogProps) {
  const isEditMode = !!profile;
  const [inventoryItems, setInventoryItems] = useState<InventoryRecord[]>([]);

  const form = useForm<CreateProfileInput & { inventory_id?: string }>({
    resolver: zodResolver(CreateProfileSchema),
    defaultValues: {
      name: '',
      type: '0',
      material: undefined,
      material_rate: 0,
      outer_diameter_mm: 0,
      thickness_mm: 0,
      heat_treatment_rate: 0,
      heat_treatment_inefficacy_percent: 0,
      inventory_id: undefined
    }
  });

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await fetchInventory({ page: 1, limit: 10, material_type: 'all' });
        if (response.success && response.data) {
          setInventoryItems(response.data.inventory);
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
      }
    };
    loadInventory();
  }, []);

  useEffect(() => {
    if (profile && isEditMode) {
      form.reset({
        name: profile.name,
        type: profile.type,
        material: profile.material,
        material_rate: Number(profile.material_rate),
        outer_diameter_mm: Number(profile.outer_diameter_mm),
        thickness_mm: Number(profile.thickness_mm),
        heat_treatment_rate: Number(profile.heat_treatment_rate),
        heat_treatment_inefficacy_percent: Number(profile.heat_treatment_inefficacy_percent),
        inventory_id: profile.inventory_id
      });
    }
  }, [profile, form, isEditMode]);

  const handleSubmit = async (data: CreateProfileInput & { inventory_id?: string }) => {
    try {
      const [materialType] = data.material.split('/');
      const { material: _, ...rest } = data;
      const payload: CreateProfileInput = {
        ...rest,
        material: materialType as ProfileRecord['material'],
      };

      await onSubmit(payload);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const addInventoryId = (id: string) => {
    form.setValue('inventory_id', id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Profile' : 'Add New Profile'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update profile information below'
              : 'Enter profile information to create a new profile'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter profile name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Gear</SelectItem>
                        <SelectItem value="1">Pinion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialTypeString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const [materialType, id] = value.split('/');
                        field.onChange(value);

                        //save material in the
                        form.setValue('material', materialType as ProfileRecord['material']);
                        form.setValue('inventory_id', id);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={`${item.material_type}/${item.id}`}>
                            <div className="flex flex-col">
                              {item.material_type} (Qty: {item.quantity})
                              <span className="text-xs text-gray-900 dark:text-gray-400">
                                {Number(item.width)?.toFixed(2)}×{Number(item.height)?.toFixed(2)}mm
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4"></div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="material_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
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
                name="heat_treatment_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heat Treatment Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="outer_diameter_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outer Diameter (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
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
                name="thickness_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thickness (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
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
              name="heat_treatment_inefficacy_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heat Treatment Inefficacy (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Profile'
                  : 'Create Profile'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
