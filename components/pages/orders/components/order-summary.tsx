import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { CreateOrderFormInput } from '@/schemas/create-order.schema';

interface OrderSummaryProps {
  control: Control<CreateOrderFormInput>;
  buyers: BuyerRecord[];
  selectedProfile: ProfileRecord | undefined;
  nextOrderNumber: string | null;
  orderId?: string | null;
}

export const OrderSummary = memo(({ control, buyers, selectedProfile, nextOrderNumber, orderId }: OrderSummaryProps) => {
  const [buyerId, finishWidth, finishHeight, teethCount, module, face, weight, materialCost, turningRate, teethCost, htCost, processes, totalOrderValue, profitMargin, grandTotal] = useWatch({
    control,
    name: ['buyer_id', 'finish_size.width', 'finish_size.height', 'teeth_count', 'module', 'face', 'weight', 'material_cost', 'turning_rate', 'teeth_cutting_grinding_cost', 'ht_cost', 'processes', 'total_order_value', 'profit_margin', 'grand_total']
  });

  return (
  <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-300 dark:border-slate-600">
    <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {nextOrderNumber && !orderId && (
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

        {selectedProfile && (
          <div>
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">Profile</p>
            <p className="text-sm font-medium mt-1">{selectedProfile.name}</p>
          </div>
        )}

        {finishWidth > 0 && finishHeight > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-2">Dimensions</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Width:</span>
                <p className="font-medium">{finishWidth} mm</p>
              </div>
              <div>
                <span className="text-muted-foreground">Height:</span>
                <p className="font-medium">{finishHeight} mm</p>
              </div>
            </div>
          </div>
        )}

        {(teethCount! > 0 || module! > 0 || face! > 0) && (
          <div className="pt-4 border-t">
            <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-2">Gear Specifications</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {teethCount! > 0 && (
                <div>
                  <span className="text-muted-foreground">Teeth:</span>
                  <p className="font-medium">{teethCount}</p>
                </div>
              )}
              {module! > 0 && (
                <div>
                  <span className="text-muted-foreground">Module:</span>
                  <p className="font-medium">{module}</p>
                </div>
              )}
              {face! > 0 && (
                <div>
                  <span className="text-muted-foreground">Face:</span>
                  <p className="font-medium">{face}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pl-6 border-l">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Weight</span>
          <span className="font-semibold">{(weight || 0)?.toFixed(2)} kg</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Material Cost</span>
          <span className="font-semibold">₹{(materialCost || 0)?.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Turning Rate</span>
          <span className="font-semibold">₹{(turningRate || 0)?.toFixed(2)}</span>
        </div>

        {teethCost > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">TC+TG Cost</span>
            <span className="font-semibold">₹{(teethCost || 0)?.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">HT Cost</span>
          <span className="font-semibold">₹{(htCost || 0)?.toFixed(2)}</span>
        </div>

        {processes?.length > 0 && processes.some((p: any) => p.rate > 0) && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Additional Processes</span>
            <span className="font-semibold">
              ₹{processes.reduce((sum: number, p: any) => sum + p.rate, 0)?.toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t flex justify-between items-center">
          <span className="text-lg font-semibold">Total Order Value</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            ₹{(totalOrderValue || 0)?.toFixed(2)}
          </span>
        </div>

        {profitMargin > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Profit Margin</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{profitMargin?.toFixed(2)}%</span>
          </div>
        )}

        <div className="pt-3 border-t bg-blue-50 dark:bg-blue-900/30 rounded px-4 py-3 flex justify-between items-center">
          <span className="font-semibold text-lg">Grand Total</span>
          <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
            ₹{(grandTotal || 0)?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </Card>
  );
});

OrderSummary.displayName = 'OrderSummary';
