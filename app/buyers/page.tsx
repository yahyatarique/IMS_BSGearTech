import BuyersPage from '@/components/pages/buyers/buyers';
import { AuthWrapper } from '@/components/wrappers';

export default function Buyers() {
  return (
    <AuthWrapper>
      <BuyersPage />
    </AuthWrapper>
  );
}
