import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface FinishSizeSectionProps {
  control: Control<CreateOrderFormInput>;
}

export const FinishSizeSection = memo(({ control }: FinishSizeSectionProps) => {
  useWatch({ control, name: ['finish_size.width', 'finish_size.height'] });

  return (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Finish Size</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="finish_size.width"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outer Diameter (mm) *</FormLabel>
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
        name="finish_size.height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thickness (mm) *</FormLabel>
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
    </div>
  </Card>
  );
});

FinishSizeSection.displayName = 'FinishSizeSection';
