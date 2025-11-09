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
  ShoppingCart,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Wrench
} from 'lucide-react';

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
}

export function OrderDetailsDialog({ order, open, onClose }: OrderDetailsDialogProps) {
  if (!order) return null;

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
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <Badge variant="outline" className={cn('border', statusClasses[order.status])}>
              {statusLabels[order.status]}
            </Badge>
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

          {/* Financial Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Material Cost
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ₹{Number(order.material_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Process Costs
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ₹{Number(order.process_costs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  HT Cost
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ₹{Number(order.ht_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Turning Rate
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  ₹{Number(order.turning_rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Total Order Value
                </p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">
                  ₹{Number(order.total_order_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

          {/* Technical Specifications */}
          {(order.teeth_count || order.module || order.face || order.weight) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {order.teeth_count && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Teeth Count
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {order.teeth_count}
                    </p>
                  </div>
                )}
                {order.module && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Module
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {Number(order.module).toFixed(3)}
                    </p>
                  </div>
                )}
                {order.face && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Face
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {Number(order.face).toFixed(3)}
                    </p>
                  </div>
                )}
                {order.weight && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Weight (kg)
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {Number(order.weight).toFixed(3)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
