'use client';

import { useState, useEffect } from 'react';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { CreateProfileInput, UpdateProfileInput } from '@/schemas/profile.schema';
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from '@/services/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, IndianRupee, Eye, Layers, Calendar, Loader2 } from 'lucide-react';
import { success, error as errorToast } from '@/hooks/use-toast';
import { useInfinitePagination } from '@/hooks/use-infinite-pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Badge } from '@/components/ui/badge';
import { ProfileFormDialog } from './profile-form-dialog';
import { ProfileDetailsDialog } from './profile-details-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { createPortal } from 'react-dom';
import { Section } from '@/components/ui/section';
import { formatDate } from '../../../../lib/utils';

export function ProfilesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const {
    items: profiles,
    isLoading,
    isLoadingMore,
    hasMore,
    observerTarget,
    reset
  } = useInfinitePagination<ProfileRecord, any>({
    fetchFn: fetchProfiles,
    dataKey: 'profiles',
    limit: 10
  });

  // Reset on filter/search change
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params: any = {
        search: searchQuery || undefined
      };
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      reset(params);
    }, 300);
    return () => clearTimeout(timeout);
  }, [typeFilter, searchQuery, reset]);

  // Handle card click
  const handleCardClick = (profile: ProfileRecord) => {
    setSelectedProfile(profile);
    setIsDetailsDialogOpen(true);
  };

  // Handle create/update
  const handleSubmit = async (data: CreateProfileInput | UpdateProfileInput) => {
    try {
      if (selectedProfile && selectedProfile?.id) {
        await updateProfile(selectedProfile.id, data);
        success({ title: 'Success', description: 'Profile updated successfully' });
      } else {
        await createProfile(data as CreateProfileInput);
        success({ title: 'Success', description: 'Profile created successfully' });
      }
      const params: any = { search: searchQuery || undefined };
      if (typeFilter !== 'all') params.type = typeFilter;
      await reset(params);
      setIsDialogOpen(false);
      setSelectedProfile(null);
    } catch (error: any) {
      errorToast({ title: 'Error', description: error.message || 'Failed to save profile' });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      success({ title: 'Success', description: 'Profile deleted successfully' });
      const params: any = { search: searchQuery || undefined };
      if (typeFilter !== 'all') params.type = typeFilter;
      await reset(params);
      setIsDetailsDialogOpen(false);
      setSelectedProfile(null);
    } catch (error: any) {
      errorToast({ title: 'Error', description: error.message || 'Failed to delete profile' });
    }
  };

  // Handle edit
  const handleEdit = (profile: ProfileRecord) => {
    setSelectedProfile(profile);
    setIsDetailsDialogOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="0">Gear</SelectItem>
              <SelectItem value="1">Pinion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setSelectedProfile(null);
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      {/* Profiles Grid */}
      <Section
        title="Profiles"
        description="Manage your inventory profiles"
        variant="gradient"
        icon={Layers}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No profiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <GradientBorderCard
                key={profile.id}
                gradient="none"
                className="hover:shadow-lg p-5 space-y-4 transition-all duration-300 cursor-pointer group relative"
                onClick={() => handleCardClick(profile)}
              >
                {/* Header with Profile Name */}
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-sm font-semibold">
                    {profile.name} {profile.group_by ? `(${profile.group_by})` : ''}
                  </Badge>
                </div>

                {/* Main Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Teeth</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profile.no_of_teeth}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Face</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profile.face}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Finish Size</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-right">
                      {profile.finish_size}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Processes</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {profile.processes?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-sm pt-2 mt-0">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-medium">Total</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      ₹{Number(profile.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatDate(profile!.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatDate(profile.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details - Bottom Right */}
                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button className="group" variant={'ghost'}>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </span>
                  </Button>
                </div>
              </GradientBorderCard>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {!isLoading && hasMore && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more profiles...</span>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Dialogs */}
      {createPortal(
        <ProfileFormDialog
          key={String(isDialogOpen)}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          profile={selectedProfile}
          onSubmit={handleSubmit}
        />,
        document.body
      )}

      {createPortal(
        <ProfileDetailsDialog
          key={String(isDetailsDialogOpen)}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          profile={selectedProfile}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />,
        document.body
      )}
    </div>
  );
}
