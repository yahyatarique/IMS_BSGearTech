import { memo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { CreateOrderFormInput, OrderProfilesRecord } from '@/schemas/create-order.schema';
import { ProfileMultiSelect } from './profile-multi-select';

interface BuyerProfileSectionProps {
  control: Control<CreateOrderFormInput>;
  buyers: BuyerRecord[];
  isLoading: boolean;
  onProfilesLoad: (profiles: OrderProfilesRecord[]) => void;
}

export const BuyerProfileSection = memo(
  ({ control, buyers, isLoading, onProfilesLoad }: BuyerProfileSectionProps) => {
    useWatch({ control, name: ['buyer_id', 'profile_ids'] });

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Buyer & Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="buyer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchaser Name *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No buyers found.{' '}
                        <Link href="/buyers" className="text-primary hover:underline">
                          Add Buyer
                        </Link>
                      </div>
                    ) : (
                      buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id}>
                          {buyer.name} {buyer.org_name ? `(${buyer.org_name})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="profile_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profiles *</FormLabel>
                <FormControl>
                  <ProfileMultiSelect
                    onProfilesLoad={onProfilesLoad}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    );
  }
);

BuyerProfileSection.displayName = 'BuyerProfileSection';
