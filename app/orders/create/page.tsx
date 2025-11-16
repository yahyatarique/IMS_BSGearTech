'use client';

import { CreateOrderForm } from '@/components/pages/orders/components/create-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';

export default function CreateOrderPage() {
  return (
    <PageWrapper
      title="Create Order"
      subtitle="Create a new order for a buyer"
      icon={ShoppingCart}
    
    >
      <CreateOrderForm />
    </PageWrapper>
  );
}
