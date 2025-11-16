'use client';

import { Control } from 'react-hook-form';
import { CreateProfileInput } from '@/schemas/profile.schema';
import { Section } from '@/components/ui/section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface GearSpecificationsSectionProps {
  control: Control<CreateProfileInput & { inventory_id?: string }>;
}

export function GearSpecificationsSection({ control }: GearSpecificationsSectionProps) {
  return (
    <Section title="Gear Specifications" variant="default" className="p-4 bg-slate-100 shadow-none">
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
          name="no_of_teeth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. of Teeth</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="module"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="face"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Face</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.001"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="finish_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Finish Size</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 500x100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teeth cutting/grinding Rate (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );
}
