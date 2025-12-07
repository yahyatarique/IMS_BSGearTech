import { memo } from 'react';
import { Card } from '@/components/ui/card';

interface OrderNumberDisplayProps {
  orderNumber: string;
}

export const OrderNumberDisplay = memo(({ orderNumber }: OrderNumberDisplayProps) => (
  <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
    <p className="text-sm text-muted-foreground mb-1">Order Number</p>
    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{orderNumber}</p>
  </Card>
));

OrderNumberDisplay.displayName = 'OrderNumberDisplay';
