import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface CalculatedValuesSectionProps {
  control: Control<CreateOrderFormInput>;
}

export const CalculatedValuesSection = memo(({ control }: CalculatedValuesSectionProps) => {
  useWatch({ control, name: ['weight', 'material_cost', 'teeth_cutting_grinding_cost', 'ht_cost', 'burning_wastage_percent'] });

  return (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Calculated Values</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (kg)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="material_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Material Cost (INR)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="teeth_cutting_grinding_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>TC+TG Cost (INR)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ht_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HT Cost (INR)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="burning_wastage_percent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Burning Wastage (%)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </Card>
  );
});

CalculatedValuesSection.displayName = 'CalculatedValuesSection';
