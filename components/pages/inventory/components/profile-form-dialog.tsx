'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProfileSchema, CreateProfileInput } from '@/schemas/profile.schema';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { fetchInventory } from '@/services/inventory';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import {
  BasicInformationSection,
  GearSpecificationsSection,
  CostBreakdownSection,
  ProcessesSection,
  CalculatedCostsSection
} from './form-sections';

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
      group_by: '',
      type: '0',
      material: undefined,
      no_of_teeth: 0,
      rate: 0,
      face: 0,
      module: 0,
      finish_size: '',
      burning_weight: 0,
      total_weight: 0,
      ht_cost: 0,
      ht_rate: 0,
      processes: undefined,
      cyn_grinding: 0,
      total: 0,
      inventory_id: undefined,
      tcTGCost: 0
    }
  });

  const selectedInventoryId = form.watch('inventory_id');
  const selectedInventory = inventoryItems.find((item) => item.id === selectedInventoryId);

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
        group_by: profile.group_by || '',
        type: profile.type,
        material: profile.material,
        materialTypeString: `${profile.material}/${profile.inventory_id}`,
        no_of_teeth: Number(profile.no_of_teeth),
        rate: Number(profile.rate),
        face: Number(profile.face),
        module: Number(profile.module),
        finish_size: profile.finish_size,
        burning_weight: Number(profile.burning_weight),
        total_weight: Number(profile.total_weight),
        ht_cost: Number(profile.ht_cost),
        ht_rate: Number(profile.ht_rate),
        processes: profile.processes,
        cyn_grinding: Number(profile.cyn_grinding),
        total: Number(profile.total),
        tcTGCost: 0,
        inventory_id: profile.inventory_id
      });
    }
  }, [profile, form, isEditMode]);

  const handleSubmit = async (data: CreateProfileInput & { inventory_id?: string }) => {
    try {
      const [materialType] = data.material.split('/');

      //eslint-disable-next-line
      const { material: _, ...rest } = data;
      const payload: CreateProfileInput = {
        ...rest,
        material: materialType as ProfileRecord['material']
      };

      await onSubmit(payload);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Form Submission Error:', error);
    }
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            <BasicInformationSection
              control={form.control}
              setValue={form.setValue}
              inventoryItems={inventoryItems}
            />

            <GearSpecificationsSection control={form.control} />

            <CostBreakdownSection
              control={form.control}
              setValue={form.setValue}
              selectedInventory={selectedInventory}
            />

            <ProcessesSection
              control={form.control}
              getValues={form.getValues}
              setValue={form.setValue}
            />
            
            <CalculatedCostsSection
              control={form.control}
              setValue={form.setValue}
              selectedInventory={selectedInventory}
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
