'use client';

import { CreateOrderForm } from '@/components/pages/orders/components/create-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CreateOrderPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isUpdate = !!orderId;

  return (
    <PageWrapper
      title={isUpdate ? 'Update Order' : 'Create Order'}
      subtitle={isUpdate ? 'Update existing order details' : 'Create a new order for a buyer'}
      icon={ShoppingCart}
      gradient="blue-cyan"
    >
      <CreateOrderForm orderId={orderId} />
    </PageWrapper>
  );
}
