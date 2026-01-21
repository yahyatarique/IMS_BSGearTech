'use client';

import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { CreateProfileInput } from '@/schemas/profile.schema';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { Section } from '@/components/ui/section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { calculateBurningWeight, calculateHTCost, calculateTeethCost } from '@/utils/calculationHelper';

interface CostBreakdownSectionProps {
  control: Control<CreateProfileInput & { inventory_id?: string }>;
  setValue: UseFormSetValue<CreateProfileInput & { inventory_id?: string }>;
  selectedInventory: InventoryRecord | undefined;
}

export function CostBreakdownSection({ control, setValue, selectedInventory }: CostBreakdownSectionProps) {
  const profileType = useWatch({ control, name: 'type' });
  const burningWeight = useWatch({ control, name: 'burning_weight' });
  const burningPercent = useWatch({ control, name: 'burning_wastage_percentage' });
  const totalWeight = useWatch({ control, name: 'total_weight' });
  const htRate = useWatch({ control, name: 'ht_rate' });
  const teeth = useWatch({ control, name: 'no_of_teeth' });
  const modules = useWatch({ control, name: 'module' });
  const faces = useWatch({ control, name: 'face' });
  const teethRate = useWatch({ control, name: 'rate' });

  useEffect(() => {
    // Calculate burning weight only for type '0'(Gears) profiles
    if (selectedInventory && profileType === '0') {
      const materialWeight = Number(selectedInventory.material_weight);
      const burning = calculateBurningWeight(materialWeight, burningPercent);
      setValue('burning_weight', Number(burning));
    } else {
      setValue('burning_weight', 0);
    }
  }, [selectedInventory, profileType, setValue, burningPercent]);

  useEffect(() => {
    if (selectedInventory) {
      const materialWeight = Number(selectedInventory.material_weight);
      const total = materialWeight + burningWeight;
      setValue('total_weight', Number(total));
    } else {
      setValue('total_weight', 0);
    }
  }, [selectedInventory, burningWeight, setValue]);

  useEffect(() => {
    const htCost = calculateHTCost(totalWeight, htRate);
    setValue('ht_cost', Number(htCost));
  }, [totalWeight, htRate, setValue]);

  useEffect(() => {
    const tcTgCost = calculateTeethCost(
      Number(teeth) || 0,
      Number(modules) || 0,
      Number(faces) || 0,
      Number(teethRate) || 0
    );
    setValue('tcTGCost', Number(tcTgCost));
  }, [teeth, modules, faces, teethRate, setValue]);

  return (
    <Section title="Cost Breakdown" variant="default" className="p-4 bg-slate-100 shadow-none">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="ht_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HT Rate (₹)</FormLabel>
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
        <FormField
          control={control}
          name="cyn_grinding"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CYN/Grinding (₹)</FormLabel>
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
    </Section>
  );
}
