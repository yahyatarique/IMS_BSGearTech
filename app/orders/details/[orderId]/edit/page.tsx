import type { Metadata } from 'next';

import { UpdateOrderForm } from '@/components/pages/orders/components/update-order-form';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ShoppingCart } from 'lucide-react';

interface EditOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export const generateMetadata = (): Metadata => {
  return {
    title: `BSGearTech IMS - Edit Order`,
    description: 'Update existing order details'
  };
};

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { orderId } = await params;

  return (
    <PageWrapper title="Update Order" subtitle="Update existing order details" icon={ShoppingCart}>
      <UpdateOrderForm orderId={orderId} />
    </PageWrapper>
  );
}
