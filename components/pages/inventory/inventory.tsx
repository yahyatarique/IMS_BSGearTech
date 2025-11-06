'use client';

import { PageWrapper } from '@/components/ui/page-wrapper';
import { Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilesTab } from './components/profiles-tab';
import { InventoryTab } from './components/inventory-tab';

export default function InventoryPage() {
  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Manage your profiles and inventory items"
      icon={Package}
      gradient="blue-cyan"
    >
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles" className="mt-6">
          <ProfilesTab />
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
