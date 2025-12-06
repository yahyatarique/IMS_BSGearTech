'use client';

import { useMemo } from 'react';
import {  useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { Package, Layers, Warehouse, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilesTab } from './components/profiles-tab';
import { InventoryTab } from './components/inventory-tab';
import { BurningWastagePageContent } from '@/components/pages/burning-wastage/burning-wastage-page-content';
import { useRouter } from '@bprogress/next/app';

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calculate active tab from URL parameters
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === 'materials') return 'inventory';
    if (tab === 'profiles') return 'profiles';
    if (tab === 'wastage') return 'wastage';
    return 'inventory';
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Map internal tab values to URL-friendly names
    let tabParam = 'materials';
    if (value === 'profiles') tabParam = 'profiles';
    if (value === 'wastage') tabParam = 'wastage';
    newSearchParams.set('tab', tabParam);

    // Update URL without page refresh
    router.replace(`/inventory?${newSearchParams.toString()}`);
  };

  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Manage your profiles and inventory items"
      icon={Package}
    
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="wastage" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Burning Wastage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="profiles" className="mt-6">
          <ProfilesTab />
        </TabsContent>
        <TabsContent value="wastage" className="mt-6">
          <BurningWastagePageContent />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
