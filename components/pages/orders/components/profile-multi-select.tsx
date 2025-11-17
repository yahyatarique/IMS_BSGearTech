'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchProfiles } from '@/services/profiles';
import { ProfileRecord } from '@/services/types/profile.api.type';

interface ProfileMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  onProfilesLoad?: (profiles: ProfileRecord[]) => void;
  profiles?: ProfileRecord[];
}

export function ProfileMultiSelect({ value, onChange, onProfilesLoad, profiles: externalProfiles }: ProfileMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalProfiles, setInternalProfiles] = useState<ProfileRecord[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const profiles = externalProfiles || internalProfiles;

  const loadProfiles = useCallback(async (pageNum: number, searchTerm: string, reset = false) => {
    if (loading || externalProfiles) return; // Skip loading if external profiles provided
    setLoading(true);
    try {
      const res = await fetchProfiles({ page: pageNum, limit: 10, search: searchTerm });
      if (res.success && res.data) {
        const newProfiles = reset ? res.data.profiles : [...internalProfiles, ...res.data.profiles];
        setInternalProfiles(newProfiles);
        onProfilesLoad?.(newProfiles);
        setHasMore(res.data.meta.hasNext);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, internalProfiles, onProfilesLoad, externalProfiles]);

  useEffect(() => {
    loadProfiles(1, search, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      loadProfiles(page, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleProfile = (profileId: string) => {
    const newValue = value.includes(profileId)
      ? value.filter((id) => id !== profileId)
      : [...value, profileId];
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value.length > 0 ? `${value.length} profile(s) selected` : 'Select profiles'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent',
                value.includes(profile.id!) && 'bg-accent'
              )}
              onClick={() => toggleProfile(profile.id!)}
            >
              <div className={cn('w-4 h-4 border rounded flex items-center justify-center', value.includes(profile.id!) && 'bg-primary border-primary')}>
                {value.includes(profile.id!) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{profile.name}</span>
            </div>
          ))}
          {hasMore && <div ref={observerTarget} className="h-8 flex items-center justify-center text-sm text-muted-foreground">{loading ? 'Loading...' : ''}</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
