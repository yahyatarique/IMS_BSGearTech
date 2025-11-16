import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderRecord } from '@/services/types/orders.api.type';
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Wrench,
  Flame,
  Package
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateOrderStatus } from '@/services/orders';
import { success as successToast, error as errorToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/enums/orders.enum';
import { calculateTeethCost } from '@/utils/calculationHelper';

const statusClasses: Record<OrderRecord['status'], string> = {
  '0': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  '1': 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20',
  '2': 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20'
};

const statusLabels: Record<OrderRecord['status'], string> = {
  '0': 'Pending',
  '1': 'Processing',
  '2': 'Completed'
};

interface OrderDetailsDialogProps {
  order: OrderRecord | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, newStatus: '0' | '1' | '2') => void;
}

export function OrderDetailsDialog({ order, open, onClose, onStatusUpdate }: OrderDetailsDialogProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status || isUpdatingStatus) return;

    try {
      setIsUpdatingStatus(true);
      const response = await updateOrderStatus(order.id, { status: newStatus as '0' | '1' | '2' });
      
      if (response.success) {
        successToast({
          title: 'Success',
          description: 'Order status updated successfully'
        });
        
        // Call the callback to update the parent component
        if (onStatusUpdate) {
          onStatusUpdate(order.id, newStatus as '0' | '1' | '2');
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to update order status'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
          <DialogDescription>View complete order information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Section */}
          <div className="flex items-start justify-between pb-4 border-b">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {order.order_number}
              </h3>
              {order.order_name && (
                <p className="text-md text-slate-700 dark:text-slate-300 mt-1 font-medium">
                  {order.order_name}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={cn('border', statusClasses[order.status])}>
                {statusLabels[order.status]}
              </Badge>
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ORDER_STATUS.PENDING}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.PENDING]}
                  </SelectItem>
                  <SelectItem value={ORDER_STATUS.PROCESSING}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING]}
                  </SelectItem>
                  <SelectItem value={ORDER_STATUS.COMPLETED}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buyer & User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {order.buyer && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Buyer Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {order.buyer.name}
                    </p>
                  </div>
                  {order.buyer.org_name && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Organization
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {order.buyer.org_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.user && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created By
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {order.user.first_name} {order.user.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Username
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {order.user.username}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Order Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Quantity
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  {order.quantity}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Total Order Value
                </p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">
                  ₹{Number(order.total_order_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Grand Total
                </p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">
                  ₹{Number(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Profit Margin
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {Number(order.profit_margin).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Burning Wastage */}
          {order.burning_wastage_percent !== undefined && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Burning Wastage
              </h4>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  Wastage Percentage
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                  {Number(order.burning_wastage_percent).toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          {/* Order Profiles */}
          {order.orderProfiles && order.orderProfiles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Profiles ({order.orderProfiles.length})
              </h4>
              <div className="space-y-4">
                {order.orderProfiles.map((profile, index) => {
                  // Calculate TC+TG cost for each profile
                  const tcTgCost = calculateTeethCost(
                    Number(profile.no_of_teeth),
                    Number(profile.module),
                    Number(profile.face),
                    Number(profile.rate)
                  );

                  return (
                  <div
                    key={profile.id}
                    className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white">
                          {profile.name}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {profile.type === '0' ? 'Internal' : 'External'} | {profile.material}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Profile #{index + 1}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Teeth</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {profile.no_of_teeth}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Module</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {Number(profile.module).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Face</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {Number(profile.face).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Rate</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          ₹{Number(profile.rate).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Burning Weight</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {Number(profile.burning_weight).toFixed(2)} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Weight</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {Number(profile.total_weight).toFixed(2)} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">HT Cost</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          ₹{Number(profile.ht_cost).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">TC+TG Cost</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          ₹{Number(tcTgCost).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Cyn Grinding</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          ₹{Number(profile.cyn_grinding).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {profile.processes && typeof profile.processes === 'object' && Object.keys(profile.processes).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Processes</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(profile.processes).map(([key, value]: [string, any]) => {
                            // Handle nested objects (e.g., {cost: 100, name: "Process Name"})
                            if (typeof value === 'object' && value !== null) {
                              const displayText = value.name || key;
                              const displayValue = value.cost !== undefined ? `₹${Number(value.cost).toFixed(2)}` : '';
                              return (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {displayText}{displayValue && `: ${displayValue}`}
                                </Badge>
                              );
                            }
                            // Handle simple values
                            return (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Profile Total
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{Number(profile.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
