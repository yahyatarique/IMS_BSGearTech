'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderRecord } from '@/services/types/orders.api.type';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { fetchOrders } from '@/services/orders';
import { fetchBuyers } from '@/services/buyers';
import { OrdersCardGrid } from './components/orders-card-grid';
import { FILTER_VALUES, ORDER_STATUS, ORDER_STATUS_LABELS } from '@/enums/orders.enum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { error as errorToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@bprogress/next/app';
import { useInfinitePagination } from '@/hooks/use-infinite-pagination';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(FILTER_VALUES.ALL_BUYERS);
  const [isBuyersLoading, setIsBuyersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredSearchQuery, setDeferredSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ORDER_STATUS | FILTER_VALUES>(FILTER_VALUES.ALL_STATUS);

  const {
    items: orders,
    isLoading,
    isLoadingMore,
    hasMore,
    observerTarget,
    reset
  } = useInfinitePagination<OrderRecord, any>({
    fetchFn: fetchOrders,
    dataKey: 'orders',
    limit: 10
  });

  // Initialize buyer filter from query parameter
  useEffect(() => {
    const buyerIdFromUrl = searchParams.get('buyer_id');
    if (buyerIdFromUrl) {
      setSelectedBuyerId(buyerIdFromUrl);
    }
  }, [searchParams]);

  const loadBuyers = async () => {
    try {
      setIsBuyersLoading(true);
      const response = await fetchBuyers({ page: 1, limit: 10, status: 'active' });
      if (response.success && response.data) {
        setBuyers(response.data.buyers);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load buyers'
      });
    } finally {
      setIsBuyersLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDeferredSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const params: any = {
      buyer_id: selectedBuyerId === FILTER_VALUES.ALL_BUYERS ? undefined : selectedBuyerId,
      status: statusFilter === FILTER_VALUES.ALL_STATUS ? undefined : statusFilter as ORDER_STATUS,
      search: deferredSearchQuery || undefined
    };
    reset(params);
  }, [selectedBuyerId, statusFilter, deferredSearchQuery, reset]);

  const navigateToCreateOrder = () => {
    router.push('/orders/create');
  };

  return (
    <PageWrapper
      title="Orders Management"
      subtitle="View and manage buyer orders"
      icon={ShoppingCart}
      
      headerActions={
        <Button onClick={navigateToCreateOrder} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      }
    >
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Orders */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Buyer Filter */}
          <Select
            value={selectedBuyerId}
            onValueChange={setSelectedBuyerId}
            disabled={isBuyersLoading}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={isBuyersLoading ? 'Loading buyers...' : 'All Buyers'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_VALUES.ALL_BUYERS}>All Buyers</SelectItem>
              {buyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.name} {buyer.org_name ? `(${buyer.org_name})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as ORDER_STATUS | FILTER_VALUES)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_VALUES.ALL_STATUS}>All Status</SelectItem>
              <SelectItem value={ORDER_STATUS.PENDING}>{ORDER_STATUS_LABELS[ORDER_STATUS.PENDING]}</SelectItem>
              <SelectItem value={ORDER_STATUS.PROCESSING}>{ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING]}</SelectItem>
              <SelectItem value={ORDER_STATUS.COMPLETED}>{ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED]}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <GradientBorderCard key={i} className="h-[200px] animate-pulse">
              <div className="space-y-4 p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </GradientBorderCard>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <>
          <OrdersCardGrid 
            orders={orders} 
            isLoading={false}
          />
          
          {/* Loading more indicator */}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more orders...</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <GradientBorderCard className="text-center">
          <div className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Orders Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery || selectedBuyerId !== FILTER_VALUES.ALL_BUYERS || statusFilter !== FILTER_VALUES.ALL_STATUS
                ? 'Try adjusting your filters to see more orders.'
                : 'Start by creating your first order.'}
            </p>
          </div>
        </GradientBorderCard>
      )}
    </PageWrapper>
  );
}
