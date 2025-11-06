import InventoryPage from '@/components/pages/inventory/inventory';
import { AuthWrapper } from '@/components/wrappers';

export default function Inventory() {
  return (
    <AuthWrapper>
      <InventoryPage />
    </AuthWrapper>
  );
}
