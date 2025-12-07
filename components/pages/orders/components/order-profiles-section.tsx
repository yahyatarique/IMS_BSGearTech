import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { OrderProfilesRecord } from '../../../../schemas/create-order.schema';

interface OrderProfilesSectionProps {
  selectedProfiles: OrderProfilesRecord[];
  onRemoveProfile?: (profileId: string) => void;
}

export const OrderProfilesSection = memo(
  ({ selectedProfiles, onRemoveProfile }: OrderProfilesSectionProps) => {
    if (selectedProfiles.length === 0) {
      return null;
    }

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order Profiles</h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Selected profiles for this order ({selectedProfiles.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProfiles.map((profile) => (
              <Badge
                key={profile!.id}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                <span>{profile?.name} {profile?.group_by ? `(${profile?.group_by})` : ''}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProfile?.(profile.id!)}
                  className="hover:bg-destructive/20 rounded-full text-red-700 dark:text-red-400 p-0.5 transition-colors"
                  aria-label={`Remove ${profile.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    );
  }
);

OrderProfilesSection.displayName = 'OrderProfilesSection';
