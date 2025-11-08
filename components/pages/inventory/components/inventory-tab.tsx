'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryRecord } from '@/services/types/inventory.api.type';
import { fetchInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/services/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Package, Ruler, FileText, Eye } from 'lucide-react';
import { error as errorToast, success as successToast } from '@/hooks/use-toast';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { InventoryDetailsDialog } from './inventory-details-dialog';
import { InventoryFormDialog } from './inventory-form-dialog';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

export function InventoryTab() {
  const [inventoryItems, setInventoryItems] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<InventoryRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryRecord | null>(null);
  const [materialFilter, setMaterialFilter] = useState<'all' | 'CR-5' | 'EN-9'>('all');

  // Fetch all inventory items
  const loadInventoryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchInventory({ 
        material_type: materialFilter,
        limit: 100,
        page: 1,
        search: searchQuery,
      });

      if (response.success && response.data) {
        setInventoryItems(response.data.inventory);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load inventory items',
      });
    } finally {
      setIsLoading(false);
    }
  }, [materialFilter, searchQuery]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      loadInventoryItems();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadInventoryItems]);

  // Handle inventory item click
  const handleInventoryItemClick = (item: InventoryRecord) => {
    setSelectedInventory(item);
    setIsDetailsDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (inventory: InventoryRecord) => {
    setEditingInventory(inventory);
    setIsDetailsDialogOpen(false);
    setIsFormDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteInventoryItem(id);
      if (response.success) {
        successToast({
          title: 'Success',
          description: 'Inventory item deleted successfully',
        });
        setIsDetailsDialogOpen(false);
        loadInventoryItems();
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to delete inventory item',
      });
    }
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: CreateInventoryInput | UpdateInventoryInput) => {
    try {
      if (editingInventory) {
        // Update existing inventory item
        const response = await updateInventoryItem(editingInventory.id, data as UpdateInventoryInput);
        if (response.success) {
          successToast({
            title: 'Success',
            description: 'Inventory item updated successfully',
          });
        }
      } else {
        // Create new inventory item
        const response = await createInventoryItem(data as CreateInventoryInput);
        if (response.success) {
          successToast({
            title: 'Success',
            description: 'Inventory item created successfully',
          });
        }
      }
      
      setIsFormDialogOpen(false);
      setEditingInventory(null);
      loadInventoryItems();
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || `Failed to ${editingInventory ? 'update' : 'create'} inventory item`,
      });
      throw error; // Re-throw to let form handle the error state
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={materialFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialFilter('all')}
            >
              All
            </Button>
            <Button
              variant={materialFilter === 'CR-5' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialFilter('CR-5')}
            >
              CR-5
            </Button>
            <Button
              variant={materialFilter === 'EN-9' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialFilter('EN-9')}
            >
              EN-9
            </Button>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PO number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button 
          className="gap-2" 
          onClick={() => {
            setEditingInventory(null);
            setIsFormDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      {/* Inventory Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : inventoryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? `No inventory items found for "${searchQuery}"` : 'No inventory items found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {inventoryItems.map((item) => (
            <GradientBorderCard
              key={item.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
              onClick={() => handleInventoryItemClick(item)}
            >
              <div className="p-5 space-y-4">
                {/* Header with Material Type */}
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-sm font-semibold">
                    {item.material_type}
                  </Badge>
                </div>

                {/* Main Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Weight</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Number(item.material_weight).toFixed(2)} kg
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Ruler className="h-4 w-4" />
                      <span className="font-medium">Dimensions</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-right">
                      {Number(item.cut_size_width).toFixed(2)} × {Number(item.cut_size_height).toFixed(2)} mm
                    </span>
                  </div>

                  {item.po_number && (
                    <div className="flex items-start justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">PO Number</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.po_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* View Details - Bottom Right */}
                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </span>
                </div>
              </div>
            </GradientBorderCard>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <InventoryDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        inventory={selectedInventory}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InventoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        inventory={editingInventory}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
