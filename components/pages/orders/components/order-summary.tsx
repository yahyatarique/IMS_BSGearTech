import { memo, useMemo, useEffect } from 'react';
import { Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface OrderSummaryProps {
  control: Control<CreateOrderFormInput>;
  setValue: UseFormSetValue<CreateOrderFormInput>;
  buyers: BuyerRecord[];
  selectedProfiles: ProfileRecord[];
  nextOrderNumber: string | null;
}

export const OrderSummary = memo(({ control, setValue, buyers, selectedProfiles, nextOrderNumber }: OrderSummaryProps) => {
  const [buyerId, orderName, quantity, profit] = useWatch({
    control,
    name: ['buyer_id', 'order_name', 'quantity', 'profit']
  });

  const calculations = useMemo(() => {
    const profilesTotal = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);
    const total = profilesTotal * (quantity || 1);
    const grandTotal = total + (total * (profit || 0) / 100);
    const burningWeightTotal = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.burning_weight || '0'), 0);
    const totalWeightSum = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.total_weight || '0'), 0);
    const burningWastagePercent = totalWeightSum > 0 ? ((burningWeightTotal / totalWeightSum) * 100) : 0;

    return { profilesTotal, total, grandTotal, burningWeightTotal, burningWastagePercent };
  }, [selectedProfiles, quantity, profit]);

  // Update form value when burning wastage percent changes
  useEffect(() => {
    setValue('burning_wastage_percent', calculations.burningWastagePercent);
  }, [calculations.burningWastagePercent, setValue]);

  return (
  <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-300 dark:border-slate-600">
    <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {nextOrderNumber && (
          <div className="pb-4 border-b">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">Order Number</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{nextOrderNumber}</p>
          </div>
        )}

        {buyerId && (
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">Purchaser</p>
            <p className="text-sm font-medium mt-1">{buyers.find((b) => b.id === buyerId)?.name}</p>
          </div>
        )}

        {orderName && (
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">Order Name</p>
            <p className="text-sm font-medium mt-1">{orderName}</p>
          </div>
        )}

        {selectedProfiles.length > 0 && (
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">Profiles</p>
            <p className="text-sm font-medium mt-1">{selectedProfiles.length} profile(s) selected</p>
          </div>
        )}
      </div>

      <div className="space-y-3 pl-6 border-l">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Profiles Total</span>
          <span className="font-semibold">₹{calculations.profilesTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <span className="font-semibold">{quantity || 1}</span>
        </div>

        <div className="pt-3 border-t flex justify-between items-center">
          <span className="text-lg font-semibold">Total (Profiles × Quantity)</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            ₹{calculations.total.toFixed(2)}
          </span>
        </div>

        {profit > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Profit ({profit}%)</span>
            <span className="font-semibold text-green-600 dark:text-green-400">₹{(calculations.grandTotal - calculations.total).toFixed(2)}</span>
          </div>
        )}

        <div className="pt-3 border-t bg-blue-50 dark:bg-blue-900/30 rounded px-4 py-3 flex justify-between items-center">
          <span className="font-semibold text-lg">Grand Total</span>
          <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
            ₹{calculations.grandTotal.toFixed(2)}
          </span>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Burning Weight Total</span>
            <span className="font-semibold">{calculations.burningWeightTotal.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Burning Wastage</span>
            <span className="font-semibold">{calculations.burningWastagePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
  );
});

OrderSummary.displayName = 'OrderSummary';
