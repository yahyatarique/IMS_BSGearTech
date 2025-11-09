'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Package, Layers, Warehouse } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilesTab } from './components/profiles-tab';
import { InventoryTab } from './components/inventory-tab';

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calculate active tab from URL parameters
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === 'materials') return 'inventory';
    if (tab === 'profiles') return 'profiles';
    return 'inventory';
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Map internal tab values to URL-friendly names
    const tabParam = value === 'inventory' ? 'materials' : 'profiles';
    newSearchParams.set('tab', tabParam);

    // Update URL without page refresh
    router.replace(`/inventory?${newSearchParams.toString()}`);
  };

  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Manage your profiles and inventory items"
      icon={Package}
      gradient="blue-cyan"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="profiles" className="mt-6">
          <ProfilesTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
