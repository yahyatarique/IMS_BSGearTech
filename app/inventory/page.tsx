import InventoryPage from '@/components/pages/inventory/inventory';
import { Suspense } from 'react';

export default function Inventory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryPage />
    </Suspense>
  );
}
