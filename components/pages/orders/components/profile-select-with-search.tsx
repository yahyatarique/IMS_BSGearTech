'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fetchProfiles } from '@/services/profiles';
import { ProfileRecord } from '@/services/types/profile.api.type';

interface ProfileSelectWithSearchProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ProfileSelectWithSearch({ value, onChange }: ProfileSelectWithSearchProps) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadProfiles = useCallback(async (pageNum: number, searchTerm: string, reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetchProfiles({
        page: pageNum,
        limit: 20,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setProfiles(prev => reset ? response.data!.profiles : [...prev, ...response.data!.profiles]);
        setHasMore(response.data.meta.hasNext);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    loadProfiles(1, search, true);
    setPage(1);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadProfiles(nextPage, search);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, page, search, loadProfiles]);

  const toggleProfile = (profileId: string) => {
    const newValue = value.includes(profileId)
      ? value.filter(id => id !== profileId)
      : [...value, profileId];
    onChange(newValue);
  };

  const selectedProfiles = profiles.filter(p => value.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white dark:bg-slate-800"
        >
          {value.length === 0
            ? 'Select profiles...'
            : `${value.length} profile${value.length > 1 ? 's' : ''} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search profiles..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No profiles found.</CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={() => toggleProfile(profile.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(profile.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{profile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {profile.type === '0' ? 'Gear' : 'Pinion'} • {profile.inventory?.material_type || 'N/A'}
                    </span>
                  </div>
                </CommandItem>
              ))}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
