import type { Metadata } from 'next';
import OrdersPage from '@/components/pages/orders/orders-page';

export const metadata: Metadata = {
  title: 'BsGearTech IMS - Orders',
  description: 'Orders System for BS GearTech',
};

export default function Orders() {
  return (
      <OrdersPage />
  );
}