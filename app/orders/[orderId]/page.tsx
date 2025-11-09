'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrderById } from '@/services/orders';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { 
  ShoppingCart, 
  Edit, 
  ArrowLeft, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Wrench,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { Badge } from '@/components/ui/badge';
import { OrderRecord } from '@/services/types/orders.api.type';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

const statusConfig: Record<OrderRecord['status'], {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  '0': {
    label: 'Pending',
    color: 'yellow',
    icon: Clock
  },
  '1': {
    label: 'Processing',
    color: 'blue',
    icon: RotateCcw
  },
  '2': {
    label: 'Completed',
    color: 'green',
    icon: CheckCircle2
  }
};

interface OrderDetailsProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailsPage({ params: { orderId } }: OrderDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const response = await fetchOrderById(orderId);
        if (response.success && response.data) {
          setOrder(response.data);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load order details'
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId, toast]);

  const handleEdit = () => {
    router.push(`/orders/create?orderId=${orderId}`);
  };

  if (isLoading) {
    return (
      <PageWrapper
        title="Order Details"
        subtitle="Loading..."
        icon={ShoppingCart}
        gradient="blue-cyan"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper
        title="Order Details"
        subtitle="Order not found"
        icon={ShoppingCart}
        gradient="blue-cyan"
      >
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            The order you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  const status = statusConfig[order.status];

  return (
    <PageWrapper
      title={`Order ${order.order_number}`}
      subtitle={order.buyer?.name ? `Order for ${order.buyer.name} ${order.buyer.org_name ? `(${order.buyer.org_name})` : ''}` : 'Order Details'}
      icon={ShoppingCart}
      gradient="blue-cyan"
      headerActions={
        <div className="flex items-center gap-4">
          <Badge 
            variant="outline" 
            className={cn(
              'text-base py-1.5 px-4 gap-2',
              `bg-${status.color}-500/10 text-${status.color}-700 dark:text-${status.color}-500 border-${status.color}-500/20`
            )}
          >
            <status.icon className="w-4 h-4" />
            {status.label}
          </Badge>
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Order
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Order Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Order Number</p>
                <p className="text-lg font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Created At</p>
                <p className="text-base">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
          </Card>

          {/* Buyer Info Card */}
          {order.buyer && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-500" />
                Buyer Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="text-base font-medium">{order.buyer.name}</p>
                </div>
                {order.buyer.org_name && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Organization</p>
                    <p className="text-base">{order.buyer.org_name}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* User Info Card */}
          {order.user && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-500" />
                Created By
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="text-base">{order.user.first_name} {order.user.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Username</p>
                  <p className="text-base">{order.user.username}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Middle Column - Technical Details */}
        <div className="space-y-6">
          {/* Specifications Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-500" />
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {order.teeth_count && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Teeth Count</p>
                  <p className="text-lg font-medium mt-1">{order.teeth_count}</p>
                </div>
              )}
              {order.module && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Module</p>
                  <p className="text-lg font-medium mt-1">{Number(order.module).toFixed(3)}</p>
                </div>
              )}
              {order.face && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Face</p>
                  <p className="text-lg font-medium mt-1">{Number(order.face).toFixed(3)}</p>
                </div>
              )}
              {order.weight && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Weight (kg)</p>
                  <p className="text-lg font-medium mt-1">{Number(order.weight).toFixed(3)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Process Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              Process Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Turning Rate</p>
                <p className="text-lg font-medium mt-1">{formatCurrency(order.turning_rate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Process Costs</p>
                <p className="text-lg font-medium mt-1">{formatCurrency(order.process_costs)}</p>
              </div>
            </div>
          </Card>

          {/* Material Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-500" />
              Material Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Material Cost</p>
                <p className="text-lg font-medium mt-1">{formatCurrency(order.material_cost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Heat Treatment Cost</p>
                <p className="text-lg font-medium mt-1">{formatCurrency(order.ht_cost)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Financial Summary */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-500" />
              Cost Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Material Cost</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(order.material_cost)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Process Costs</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(order.process_costs)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">HT Cost</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(order.ht_cost)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Turning Rate</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(order.turning_rate)}</p>
              </div>
            </div>
          </Card>

          {/* Value Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              Value Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Order Value</p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">
                  {formatCurrency(order.total_order_value)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Profit Margin</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {Number(order.profit_margin).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Grand Total</p>
                <p className="text-2xl font-bold mt-1">
                  <GradientText gradient="blue-cyan">
                    {formatCurrency(order.grand_total)}
                  </GradientText>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
