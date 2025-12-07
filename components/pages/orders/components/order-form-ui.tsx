'use client';

import { UseFormReturn, FieldValues } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { OrderProfilesRecord } from '@/schemas/create-order.schema';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { OrderNumberDisplay } from './order-number-display';
import { BuyerProfileSection } from './buyer-profile-section';
import { SelectedProfilesAccordion } from './selected-profiles-accordion';
import { OrderSummary } from './order-summary';
import { OrderProfilesSection } from './order-profiles-section';

interface OrderFormUIProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => Promise<void>;
  isLoading: boolean;
  buyers: BuyerRecord[];
  isEditMode: boolean;
  orderNumber: string;
  orderProfiles: OrderProfilesRecord[];
  selectedProfiles: OrderProfilesRecord[];
  onRemoveProfile?: (profileId: string) => void;
  onProfilesLoad?: (profiles: OrderProfilesRecord[]) => void;
}

export function OrderFormUI<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  buyers,
  isEditMode,
  orderNumber,
  orderProfiles,
  selectedProfiles,
  onRemoveProfile,
  onProfilesLoad
}: OrderFormUIProps<T>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any, (errors) => {
          console.error('Form validation errors:', errors);
        })}
        className="space-y-8"
      >
        {orderNumber && <OrderNumberDisplay orderNumber={orderNumber} />}

        <BuyerProfileSection
          onProfilesLoad={onProfilesLoad}
          control={form.control as any}
          buyers={buyers}
          isLoading={isLoading}
        />

        {isEditMode && (
          <>
            <OrderProfilesSection
              selectedProfiles={orderProfiles}
              onRemoveProfile={onRemoveProfile}
            />
          </>
        )}

        <SelectedProfilesAccordion profiles={orderProfiles} selectedProfiles={selectedProfiles} />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control as any}
              name="order_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter order name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="profit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={parseFloat(String(field.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <OrderSummary
          orderProfiles={orderProfiles}
          selectedProfiles={selectedProfiles}
          control={form.control as any}
          setValue={form.setValue as any}
          buyers={buyers}
          nextOrderNumber={orderNumber}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Order'
              : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
