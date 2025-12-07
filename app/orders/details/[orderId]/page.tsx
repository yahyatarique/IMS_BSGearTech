'use client';

import { use } from 'react';
import { OrderDetailsPageContent } from '@/components/pages/orders/components/order-details-page-content';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { FileText } from 'lucide-react';

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = use(params);
  
  return (
    <PageWrapper 
      title="Order Details" 
      subtitle="View complete order information" 
      icon={FileText}
    >
      <OrderDetailsPageContent orderId={orderId} />
    </PageWrapper>
  );
}
