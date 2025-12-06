
import { Package } from 'lucide-react';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Skeleton } from '@/components/ui/skeleton';

const InventoryLoading = () => {
  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Manage your profiles and inventory items"
      icon={Package}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-36" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
              <Skeleton className="h-5 w-1/3 mb-3" />
              <Skeleton className="h-36 w-full mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default InventoryLoading;