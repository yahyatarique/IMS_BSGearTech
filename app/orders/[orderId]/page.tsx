'use client';

import { use } from 'react';
import { CreateOrderForm } from '@/components/pages/orders/components/create-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';

interface EditOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const { orderId } = use(params);
  
  return (
    <PageWrapper title="Update Order" subtitle="Update existing order details" icon={ShoppingCart}>
      <CreateOrderForm orderId={orderId} />
    </PageWrapper>
  );
}
