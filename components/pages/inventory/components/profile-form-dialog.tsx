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
import { useEffect, useState } from 'react';
import { fetchMaterialDimensions } from '@/services/inventory';
import { error as errorToast } from '@/hooks/use-toast';

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
  const [availableDimensions, setAvailableDimensions] = useState<
    Array<{
      width: number;
      height: number;
      available_count: number;
    }>
  >([]);
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);

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
        material_rate: Number(profile.material_rate),
        cut_size_width_mm: Number(profile.cut_size_width_mm),
        cut_size_height_mm: Number(profile.cut_size_height_mm),
        burning_wastage_percent: Number(profile.burning_wastage_percent),
        heat_treatment_rate: Number(profile.heat_treatment_rate),
        heat_treatment_inefficacy_percent: Number(profile.heat_treatment_inefficacy_percent)
      });
    } else {
      form.reset();
    }
  }, [profile, form]);

  // Fetch material dimensions when material type changes
  const loadMaterialDimensions = async (materialType: 'CR-5' | 'EN-9') => {
    setIsLoadingDimensions(true);
    try {
      const res = await fetchMaterialDimensions(materialType);
      if (res.data.success && res.data) {
        setAvailableDimensions(res.data?.data?.dimensions || []);

        // If there's only one dimension available, auto-populate the fields
        if (res.data.data.dimensions?.length === 1) {
          const dim = res.data.data.dimensions[0];
          form.setValue('cut_size_width_mm', dim.width);
          form.setValue('cut_size_height_mm', dim.height);
        }
      }
    } catch (error: any) {
      console.error('Error loading material dimensions:', error);
      errorToast({
        title: 'Error',
        description: 'Failed to load available dimensions for this material'
      });
      setAvailableDimensions([]);
    } finally {
      setIsLoadingDimensions(false);
    }
  };

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
                        onChange={(e) => {
                          field.onChange(e);
                          const materialType = e.target.value as 'CR-5' | 'EN-9';
                          loadMaterialDimensions(materialType);
                        }}
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
                    <FormLabel>
                      Cut Size Width (mm)
                      {isLoadingDimensions && (
                        <span className="text-xs text-muted-foreground"> (Loading...)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      {availableDimensions.length > 0 ? (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="">Select width</option>
                          {availableDimensions
                            .map((dim) => dim.width)
                            .filter((value, index, self) => self.indexOf(value) === index)
                            .map((width) => (
                              <option key={width} value={width}>
                                {width} mm
                              </option>
                            ))}
                        </select>
                      ) : (
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
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
                    <FormLabel>
                      Cut Size Height (mm)
                      {isLoadingDimensions && (
                        <span className="text-xs text-muted-foreground"> (Loading...)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      {availableDimensions.length > 0 ? (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="">Select height</option>
                          {availableDimensions
                            .map((dim) => dim.height)
                            .filter((value, index, self) => self.indexOf(value) === index)
                            .map((height) => (
                              <option key={height} value={height}>
                                {height} mm
                              </option>
                            ))}
                        </select>
                      ) : (
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {availableDimensions.length > 0 && (
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-900">
                <p className="font-medium mb-1">Available dimensions from inventory:</p>
                <div className="flex flex-wrap gap-2">
                  {availableDimensions.map((dim, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        form.setValue('cut_size_width_mm', dim.width);
                        form.setValue('cut_size_height_mm', dim.height);
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {dim.width} × {dim.height} mm ({dim.available_count} available)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableDimensions.length === 0 && !isLoadingDimensions && (
              <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
                <p className="font-medium mb-1">
                  No available dimensions found in inventory for the selected material.
                </p>
                <p>You can still enter custom dimensions.</p>
              </div>
            )}

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
