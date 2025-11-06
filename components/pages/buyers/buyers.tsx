'use client';

import { useState, useEffect } from 'react';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { CreateBuyerInput, UpdateBuyerInput } from '@/schemas/buyer.schema';
import {
  fetchBuyers,
  createBuyer,
  updateBuyer,
  deleteBuyer,
  toggleBuyerStatus
} from '@/services/buyers';
import { BuyersCardGrid } from './components/buyers-card-grid';
import { BuyerDetailsDialog } from './components/buyer-details-dialog';
import { BuyerFormDialog } from './components/buyer-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import { success, error as errorToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/ui/page-wrapper';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredSearchQuery, setDeferredSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>(
    'all'
  );

  // Fetch buyers
  const loadBuyers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchBuyers({
        page: 1,
        limit: 10,
        status: statusFilter,
        search: deferredSearchQuery || undefined
      });

      if (response.success && response.data) {
        setBuyers(response.data.buyers);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load buyers'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDeferredSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    loadBuyers();
  }, [statusFilter, deferredSearchQuery]);

  // Handle create/update buyer
  const handleSubmit = async (data: CreateBuyerInput | UpdateBuyerInput) => {
    try {
      setIsSubmitting(true);
      if (selectedBuyer) {
        await updateBuyer(selectedBuyer.id, data);
        success({
          title: 'Success',
          description: 'Buyer updated successfully'
        });
      } else {
        await createBuyer(data as CreateBuyerInput);
        success({
          title: 'Success',
          description: 'Buyer created successfully'
        });
      }
      await loadBuyers();
      setIsDialogOpen(false);
      setSelectedBuyer(null);
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to save buyer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: BuyerRecord['status']) => {
    try {
      await toggleBuyerStatus(id, currentStatus);
      success({
        title: 'Success',
        description: 'Buyer status updated successfully'
      });
      await loadBuyers();
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to update status'
      });
    }
  };

  // Handle create new
  const handleCreateNew = () => {
    setIsDetailsDialogOpen(false); // Close details dialog if open
    setSelectedBuyer(null);
    setIsDialogOpen(true);
  };

  // Handle card click to show details
  const handleCardClick = (buyer: BuyerRecord) => {
    setSelectedBuyer(buyer);
    setIsDetailsDialogOpen(true);
  };

  // Handle edit from details dialog
  const handleEditFromDetails = (buyer: BuyerRecord) => {
    setIsDetailsDialogOpen(false);
    setSelectedBuyer(buyer);
    setIsDialogOpen(true);
  };

  // Handle toggle status from details
  const handleToggleStatusFromDetails = async (
    id: string,
    currentStatus: BuyerRecord['status']
  ) => {
    await handleToggleStatus(id, currentStatus);
    // Refresh selected buyer data
    const updatedBuyer = buyers.find((b) => b.id === id);
    if (updatedBuyer) {
      setSelectedBuyer(updatedBuyer);
    }
  };

  return (
    <PageWrapper
      title="Buyers Management"
      subtitle="Manage your buyer information and contacts"
      icon={Users}
      gradient="blue-cyan"
      headerActions={
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Buyer
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search buyers by name, org name, or GST..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
          }}
          className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Buyers Card Grid */}
      <BuyersCardGrid buyers={buyers} isLoading={isLoading} onCardClick={handleCardClick} />

      {/* Details Dialog */}
      <BuyerDetailsDialog
        buyer={selectedBuyer}
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedBuyer(null);
        }}
        onToggleStatus={handleToggleStatusFromDetails}
        onEdit={handleEditFromDetails}
      />

      {/* Form Dialog */}
      <BuyerFormDialog
        key={String(isDialogOpen)}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedBuyer(null);
        }}
        onSubmit={handleSubmit}
        buyer={selectedBuyer}
        isLoading={isSubmitting}
      />
    </PageWrapper>
  );
}
