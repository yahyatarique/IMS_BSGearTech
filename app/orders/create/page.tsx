import type { Metadata } from 'next';

import { CreateOrderForm } from '@/components/pages/orders/components/create-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'BSGearTech IMS - Create Order',
  description: 'Create a new order for a buyer',
};

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
