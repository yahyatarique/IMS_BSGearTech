'use client';

import { Control, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import { CreateProfileInput } from '@/schemas/profile.schema';
import { Section } from '@/components/ui/section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ProcessesSectionProps {
  control: Control<CreateProfileInput & { inventory_id?: string }>;
  getValues: UseFormGetValues<CreateProfileInput & { inventory_id?: string }>;
  setValue: UseFormSetValue<CreateProfileInput & { inventory_id?: string }>;
}

export function ProcessesSection({ control, getValues, setValue }: ProcessesSectionProps) {
  const processes = useWatch({ control, name: 'processes' });

  return (
    <Section
      title="Additional Processes"
      variant="default"
      className="p-4 bg-slate-100 shadow-none"
    >
      {processes?.map((_, index) => (
        <div key={index} className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`processes.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Name</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MILLING">Milling</SelectItem>
                    <SelectItem value="GRINDING">Grinding</SelectItem>
                    <SelectItem value="DRILLING">Drilling</SelectItem>
                    <SelectItem value="TURNING">Turning</SelectItem>
                    <SelectItem value="HOBBING">Hobbing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`processes.${index}.cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Cost (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const current = getValues('processes') || [];
          setValue('processes', [...current, { name: '', cost: 0 }]);
        }}
      >
        Add Process
      </Button>
    </Section>
  );
}
