'use client';

import { useEffect, useState } from 'react';
import { fetchOrderById } from '@/services/orders';
import type { OrderRecord } from '@/services/types/orders.api.type';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Flame,
  Package,
  Edit,
  Trash2,
  List
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { updateOrderStatus, deleteOrder } from '@/services/orders';
import { success as successToast, error as errorToast } from '@/hooks/use-toast';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/enums/orders.enum';
import { calculateTeethCost } from '@/utils/calculationHelper';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useRouter } from '@bprogress/next/app';

const statusClasses: Record<OrderRecord['status'], string> = {
  '0': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  '1': 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20',
  '2': 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20'
};

const statusLabels: Record<OrderRecord['status'], string> = {
  '0': 'Quotation',
  '1': 'Processing',
  '2': 'Completed'
};

interface OrderDetailsPageContentProps {
  orderId: string;
}

export function OrderDetailsPageContent({ orderId }: OrderDetailsPageContentProps) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const response = await fetchOrderById(orderId);
        if (response.data.success && response.data.data) {
          setOrder(response.data.data);
        }
        //eslint-disable-next-line
      } catch (error) {
        errorToast({
          title: 'Error',
          description: 'Failed to load order details'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status || isUpdatingStatus) return;

    try {
      setIsUpdatingStatus(true);
      const response = await updateOrderStatus(order.id, { status: newStatus as '0' | '1' | '2' });

      if (response.success) {
        successToast({
          title: 'Success',
          description: 'Order status updated successfully'
        });

        // Update local state
        setOrder({ ...order, status: newStatus as ORDER_STATUS });
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

  const handleEdit = () => {
    router.push(`/orders/details/${orderId}/edit`);
  };

  const handleDelete = async () => {
    if (!order) return;

    try {
      setIsDeleteLoading(true);
      const response = await deleteOrder(order.id);
      if (response.success) {
        successToast({
          title: 'Success',
          description: 'Order deleted successfully'
        });
        router.push('/orders');
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to delete order'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDeleteLoading(false);
    }
  };

  // Check if order can be edited (only in Quotation status)
  const canEdit = order?.status === ORDER_STATUS.PENDING;
  // Check if user can revert to Quotation (not allowed from Processing or Completed)
  const canRevertToQuotation = order?.status === ORDER_STATUS.PENDING;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between pb-4 border-b">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between pb-4 border-b">
        <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800  border border-green-200 dark:border-green-800">
          <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
            {order.order_number}
          </h3>
          {order.order_name && (
            <p className="text-md text-slate-700 dark:text-slate-300 mt-1 font-medium">
              {order.order_name}
            </p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Created: {formatDateTime(order.created_at)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated: {formatDateTime(order.updated_at)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
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
                {canRevertToQuotation && (
                  <SelectItem value={ORDER_STATUS.PENDING}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.PENDING]}
                  </SelectItem>
                )}
                <SelectItem value={ORDER_STATUS.PROCESSING}>
                  {ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING]}
                </SelectItem>
                <SelectItem value={ORDER_STATUS.COMPLETED}>
                  {ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleEdit} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Order Details & Buyer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg px-4 py-3 bg-slate-100 dark:bg-slate-900">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <List className="w-4 h-4" />
            Order Details
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Quantity
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
              {order.quantity}
            </p>
          </div>
        </div>

        {order.buyer && (
          <div className="rounded-lg px-4 py-3 bg-slate-100 dark:bg-slate-900">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Buyer Information
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Name
                </p>
                <p className="text-sm text-slate-900 dark:text-white mt-1">{order.buyer.name}</p>
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
      </div>

      {/* Created By */}
      {order.user && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Created By
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-sm text-slate-900 dark:text-white mt-1">{order.user.username}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Details */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Financial Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4  border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide ">
              Total Order Value
            </p>
            <p className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">
              ₹
              {Number(order.total_order_value).toLocaleString('en-IN', {
                minimumFractionDigits: 2
              })}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Grand Total (Total + Profit Margin)
            </p>
            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">
              ₹{Number(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                  Profit Margin
                </p>
              </div>
              <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                {Number(order.profit_margin).toFixed(2)}%
              </p>
            </div>
          </div>
          {order.burning_wastage_percent !== undefined && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  Burning Wastage
                </p>
              </div>
              {order.burning_wastage_kg !== undefined && (
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {Number(order.burning_wastage_kg).toFixed(2)} kg{' '}
                  <span className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    ({Number(order.burning_wastage_percent).toFixed(2)}%)
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Profiles */}
      {order.orderProfiles && order.orderProfiles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Profiles ({order.orderProfiles.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(500px,_2fr))] gap-6">
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
                  className="bg-slate-50 dark:bg-slate-800 p-4 w-full h-full rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex gap-2 items-start justify-center">
                        <h5 className="font-semibold text-slate-900 dark:text-white">
                          {profile.name} {profile.group_by ? `(${profile.group_by})` : ''}
                        </h5>

                        <span className="text-slate-700 border-slate-500/20 text-sm px-2 bg-blue-500/10 dark:text-blue-400 rounded-lg">
                          {profile.material}
                        </span>
                      </div>
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

                  {profile.processes &&
                    typeof profile.processes === 'object' &&
                    Object.keys(profile.processes).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Processes</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(profile.processes).map(([key, value]: [string, any]) => {
                            // Handle nested objects (e.g., {cost: 100, name: "Process Name"})
                            if (typeof value === 'object' && value !== null) {
                              const displayText = value.name || key;
                              const displayValue =
                                value.cost !== undefined ? `₹${Number(value.cost).toFixed(2)}` : '';
                              return (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {displayText}
                                  {displayValue && `: ${displayValue}`}
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
                      Total
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel={isDeleteLoading ? 'Deleting...' : "Delete"}
        variant="destructive"
      />
    </div>
  );
}
