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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

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

  const form = useForm<CreateProfileInput>({
    resolver: zodResolver(CreateProfileSchema),
    defaultValues: {
      name: '',
      type: '0',
      material: 'CR-5',
      material_rate: 0,
      cut_size_width_mm: 0,
      cut_size_height_mm: 0,
      burning_wastage_percent: 0,
      heat_treatment_rate: 0,
      heat_treatment_inefficacy_percent: 0
    }
  });


  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        type: profile.type,
        material: profile.material,
        material_rate: profile.material_rate,
        cut_size_width_mm: profile.cut_size_width_mm,
        cut_size_height_mm: profile.cut_size_height_mm,
        burning_wastage_percent: profile.burning_wastage_percent,
        heat_treatment_rate: profile.heat_treatment_rate,
        heat_treatment_inefficacy_percent: profile.heat_treatment_inefficacy_percent
      });
    } else {
      form.reset();
    }
  }, [profile, form]);

  const handleSubmit = async (data: CreateProfileInput) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by parent component
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
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="0">Gear</option>
                        <option value="1">Pinion</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="CR-5">CR-5</option>
                        <option value="EN-9">EN-9</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                name="cut_size_width_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cut Size Width (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                    
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cut_size_height_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cut Size Height (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                    
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                name="burning_wastage_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Burning Wastage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                    
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
