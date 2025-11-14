'use client';

import { CreateOrderForm } from '@/components/pages/orders/components/create-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';

interface EditOrderPageProps {
  params: {
    orderId: string;
  };
}

export default function EditOrderPage({ params: { orderId } }: EditOrderPageProps) {
  return (
    <PageWrapper
      title="Update Order"
      subtitle="Update existing order details"
      icon={ShoppingCart}
      gradient="blue-cyan"
    >
      <CreateOrderForm orderId={orderId} />
    </PageWrapper>
  );
}
