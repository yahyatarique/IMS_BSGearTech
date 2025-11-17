import { Badge } from '@/components/ui/badge';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OrderRecord } from '@/services/types/orders.api.type';
import { ShoppingCart, User, Building2, Calendar,  Edit, Trash2 } from 'lucide-react';

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

interface OrdersCardGridProps {
  orders: OrderRecord[];
  isLoading: boolean;
  onCardClick: (order: OrderRecord) => void;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}

function CardSkeleton() {
  return (
    <GradientBorderCard>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </GradientBorderCard>
  );
}

export function OrdersCardGrid({ orders, isLoading, onCardClick, onEdit, onDelete }: OrdersCardGridProps) {
  const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    
    const cardElement = (event.target as HTMLElement).closest('[data-order-id]');
    if (!cardElement) return;

    const orderId = cardElement.getAttribute('data-order-id');
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      onCardClick(order);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <GradientBorderCard className="text-center">
        <div className="py-12 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Orders Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            There are no orders to display. Create your first order to get started.
          </p>
        </div>
      </GradientBorderCard>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        onClick={handleGridClick}
      >
        {orders.map((order) => (
          <GradientBorderCard
            key={order.id}
            data-order-id={order.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="space-y-4 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {order.order_number}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn('border ml-2 flex-shrink-0', statusClasses[order.status])}
                >
                  {statusLabels[order.status]}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Buyer Info */}
                {order.buyer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {order.buyer.name}
                    </span>
                  </div>
                )}

                {/* User Info */}
                {order.user && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {order.user.first_name} {order.user.last_name}
                    </span>
                  </div>
                )}

                {/* Financial Info */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Grand Total:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{Number(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Total Value:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{Number(order.total_order_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Profit Margin:</span>
                    <span className="font-semibold text-green-600 dark:text-green-500">
                      {Number(order.profit_margin).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-base font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(order.id);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 py-3 text-base font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(order.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </GradientBorderCard>
        ))}
      </div>
    </div>
  );
}
