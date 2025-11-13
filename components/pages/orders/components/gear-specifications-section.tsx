import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface GearSpecificationsSectionProps {
  control: Control<CreateOrderFormInput>;
}

export const GearSpecificationsSection = memo(({ control }: GearSpecificationsSectionProps) => {
  useWatch({ control, name: ['turning_rate', 'module', 'face', 'teeth_count'] });

  return (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Gear Specifications</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="turning_rate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Turning Rate (₹) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
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
        control={control}
        name="module"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Module *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
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
        control={control}
        name="face"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Face *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
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
        control={control}
        name="teeth_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Teeth *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </Card>
  );
});

GearSpecificationsSection.displayName = 'GearSpecificationsSection';
