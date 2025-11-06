'use client';

import { useState, useEffect } from 'react';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/services/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { success, error as errorToast } from '@/hooks/use-toast';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

export function InventoryTab() {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch inventory
  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetchInventory({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        setInventory(response.data.inventory);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load inventory',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadInventory();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No inventory items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item) => (
            <GradientBorderCard
              key={item.id}
              className="cursor-pointer p-4 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{item.material_type}</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Weight: {item.material_weight} kg</p>
                  <p>
                    Cut Size: {item.cut_size_width} × {item.cut_size_height} mm
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  {item.po_number && <p>PO: {item.po_number}</p>}
                </div>
              </div>
            </GradientBorderCard>
          ))}
        </div>
      )}
    </div>
  );
}
