import InventoryPage from '@/components/pages/inventory/inventory';
import { Suspense } from 'react';

export default function Inventory() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-full'>Loading...</div>}>
      <InventoryPage />
    </Suspense>
  );
}
