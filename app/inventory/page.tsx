import InventoryPage from '@/components/pages/inventory/inventory';
import { Suspense } from 'react';
import InventoryLoading from './loading';

export default function Inventory() {
  return (
    <Suspense fallback={<InventoryLoading />}>
      <InventoryPage />
    </Suspense>
  );
}
