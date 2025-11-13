import { memo } from 'react';
import { Control, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcessType, CreateOrderFormInput } from '@/schemas/create-order.schema';

interface ProcessesSectionProps {
  control: Control<CreateOrderFormInput>;
  getValues: UseFormGetValues<CreateOrderFormInput>;
  setValue: UseFormSetValue<CreateOrderFormInput>;
}

export const ProcessesSection = memo(({ control, getValues, setValue }: ProcessesSectionProps) => {
  const processes = useWatch({ control, name: 'processes' }) || [];

  return (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Additional Processes</h3>
    {processes.map((_, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <FormField
          control={control}
          name={`processes.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select process type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ProcessType.enum).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`processes.${index}.rate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Cost (INR)</FormLabel>
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
    ))}
    {processes.length < 2 && (
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const currentProcesses = getValues('processes');
          setValue('processes', [...currentProcesses, { type: ProcessType.enum.MILLING, rate: 0 }]);
        }}
      >
        Add Process
      </Button>
    )}
  </Card>
  );
});

ProcessesSection.displayName = 'ProcessesSection';
