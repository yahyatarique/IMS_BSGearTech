'use client';

import { Control, UseFormSetValue } from 'react-hook-form';
import { CreateProfileInput } from '@/schemas/profile.schema';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { Section } from '@/components/ui/section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInformationSectionProps {
  control: Control<CreateProfileInput & { inventory_id?: string }>;
  setValue: UseFormSetValue<CreateProfileInput & { inventory_id?: string }>;
  inventoryItems: InventoryRecord[];
}

export function BasicInformationSection({
  control,
  setValue,
  inventoryItems
}: BasicInformationSectionProps) {
  return (
    <Section title="Basic Information" variant="default" className="p-4 bg-slate-100 shadow-none">
      <FormField
        control={control}
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
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Gear</SelectItem>
                  <SelectItem value="1">Pinion</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="materialTypeString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  const [materialType, id] = value.split('/');
                  field.onChange(value);
                  setValue('material', materialType as ProfileRecord['material']);
                  setValue('inventory_id', id);
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={`${item.material_type}/${item.id}`}>
                      <div className="flex flex-col">
                        {item.material_type} (₹ {item.rate})
                        <span className="text-xs text-gray-900 dark:text-gray-400">
                          {Number(item.outer_diameter)?.toFixed(2)}×
                          {Number(item.length)?.toFixed(2)}mm ({item.material_weight}kg)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );
}
