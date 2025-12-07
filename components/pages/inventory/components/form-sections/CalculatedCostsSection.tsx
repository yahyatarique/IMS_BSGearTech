'use client';

import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { useEffect, useTransition } from 'react';
import { CreateProfileInput } from '@/schemas/profile.schema';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { Section } from '@/components/ui/section';
import { calculateProfileTotal, calculateMaterialCost } from '@/utils/calculationHelper';

interface CalculatedCostsSectionProps {
  control: Control<CreateProfileInput & { inventory_id?: string }>;
  setValue: UseFormSetValue<CreateProfileInput & { inventory_id?: string }>;
  selectedInventory: InventoryRecord | undefined;
}

export function CalculatedCostsSection({
  control,
  setValue,
  selectedInventory
}: CalculatedCostsSectionProps) {
  const [isPending, startTransition] = useTransition();
  const totalWeight = useWatch({ control, name: 'total_weight' });
  const tcTgCost = useWatch({ control, name: 'tcTGCost' });
  const htCost = useWatch({ control, name: 'ht_cost' });
  const cyn_grinding = useWatch({ control, name: 'cyn_grinding' });
  const total = useWatch({ control, name: 'total' });
  const processes = useWatch({ control, name: 'processes' });
  const burning_weight = useWatch({ control, name: 'burning_weight' });

  useEffect(() => {
    const totalMaterialCost = calculateMaterialCost(totalWeight, selectedInventory?.rate || 0);
    const totalCost = calculateProfileTotal(
      totalMaterialCost,
      tcTgCost,
      htCost,
      cyn_grinding,
      processes
    );
    startTransition(() => {
      setValue('total', Number(totalCost));
    });
    setValue('total', Number(totalCost));
  }, [totalWeight, selectedInventory?.rate, tcTgCost, htCost, cyn_grinding, processes, setValue]);

  return (
    <>
      <Section
        title="Calculated Costs"
        variant="default"
        childrenClassName="grid grid-cols-3 gap-4 space-y-0"
        className="p-4 bg-slate-100 shadow-none"
      >
        <div>
          <p className="text-sm font-medium mb-2">Burning Weight (kg)</p>
          <p className="text-base font-semibold">
            {Number(burning_weight).toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Total Weight (kg)</p>
          <p className="text-base font-semibold">{Number(totalWeight).toFixed(2)}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">HT Cost (₹)</p>
          <p className="text-base font-semibold">₹{Number(htCost).toFixed(2)}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">TC+TG Cost (₹)</p>
          <p className="text-base font-semibold">₹{Number(tcTgCost).toFixed(2)}</p>
        </div>
      </Section>

      <Section title="Total (₹)" variant="default" className="p-4 bg-slate-100 shadow-none">
        <div>
          <p className="text-2xl font-bold text-primary">
            ₹{isPending ? 'calculating...' : total.toFixed(2)}
          </p>
        </div>
      </Section>
    </>
  );
}
