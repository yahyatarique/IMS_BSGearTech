'use client';

import { useState, useEffect } from 'react';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { CreateProfileInput, UpdateProfileInput } from '@/schemas/profile.schema';
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from '@/services/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, IndianRupee,  Eye } from 'lucide-react';
import { success, error as errorToast } from '@/hooks/use-toast';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Badge } from '@/components/ui/badge';
import { ProfileFormDialog } from './profile-form-dialog';
import { ProfileDetailsDialog } from './profile-details-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { createPortal } from 'react-dom';

export function ProfilesTab() {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch profiles
  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
        search: searchQuery || undefined
      };
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      const response = await fetchProfiles(params);

      if (response.success && response.data) {
        setProfiles(response.data.profiles);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load profiles'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProfiles();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, searchQuery]);

  // Handle card click
  const handleCardClick = (profile: ProfileRecord) => {
    setSelectedProfile(profile);
    setIsDetailsDialogOpen(true);
  };

  // Handle create/update
  const handleSubmit = async (data: CreateProfileInput | UpdateProfileInput) => {
    try {
      if (selectedProfile) {
        await updateProfile(selectedProfile.id, data);
        success({ title: 'Success', description: 'Profile updated successfully' });
      } else {
        await createProfile(data as CreateProfileInput);
        success({ title: 'Success', description: 'Profile created successfully' });
      }
      await loadProfiles();
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
      await loadProfiles();
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="0">Gear</option>
            <option value="1">Pinion</option>
          </select>
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
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  {profile.name}
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

                <div className="flex items-start justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-medium">Total</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    ₹{Number(profile.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* View Details - Bottom Right */}
              <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </span>
              </div>
            </GradientBorderCard>
          ))}
        </div>
      )}

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
