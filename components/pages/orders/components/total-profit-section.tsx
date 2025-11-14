import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface TotalProfitSectionProps {
  control: Control<CreateOrderFormInput>;
}

export const TotalProfitSection = memo(({ control }: TotalProfitSectionProps) => {
  useWatch({ control, name: ['total_order_value', 'profit_margin', 'grand_total'] });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Total and Profit</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="total_order_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Order Value (INR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value?.toFixed(2)}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="profit_margin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profit Margin (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value?.toFixed(2)}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="grand_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grand Total (INR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} value={field.value?.toFixed(2)} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
});

TotalProfitSection.displayName = 'TotalProfitSection';
