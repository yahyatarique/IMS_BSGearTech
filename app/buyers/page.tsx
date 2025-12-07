import type { Metadata } from 'next';
import BuyersPage from '@/components/pages/buyers/buyers';

export const metadata: Metadata = {
  title: 'BSGearTech IMS - Buyers',
  description: 'Buyers System for BS GearTech',
};

export default function Buyers() {
  return (
      <BuyersPage />
  );
}
