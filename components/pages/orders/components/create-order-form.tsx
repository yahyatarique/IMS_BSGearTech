'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { CreateOrderFormSchema, type CreateOrderFormInput } from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { fetchOrderById } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { success, error as errorToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { OrderNumberDisplay } from './order-number-display';
import { BuyerProfileSection } from './buyer-profile-section';
import { SelectedProfilesAccordion } from './selected-profiles-accordion';
import { OrderSummary } from './order-summary';

export function CreateOrderForm({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextOrderNumber, setNextOrderNumber] = useState<string | null>(null);
  const [isEditMode] = useState(!!orderId);
  const [originalOrderNumber, setOriginalOrderNumber] = useState<string | null>(null);
  const [initialProfileIds, setInitialProfileIds] = useState<string[]>([]);

  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(CreateOrderFormSchema),
    defaultValues: {
      order_name: '',
      buyer_id: '',
      profile_ids: [],
      quantity: 1,
      profit: 0,
      burning_wastage_percent: 0
    }
  });

  // Load existing order data in edit mode
  useEffect(() => {
    if (isEditMode && orderId) {
      const loadOrder = async () => {
        try {
          setIsLoading(true);
          const response = await fetchOrderById(orderId);
          if (response.success && response.data) {
            const order = response.data;
            setOriginalOrderNumber(order.order_number);

            const profileIds = order.orderProfiles?.map((op) => op.profile_id) || [];
            setInitialProfileIds(profileIds);

            form.reset({
              order_name: order.order_name || '',
              buyer_id: order.buyer_id || '',
              profile_ids: profileIds,
              quantity: order.quantity,
              profit: parseFloat(order.profit_margin),
              burning_wastage_percent: parseFloat(order.burning_wastage_percent)
            });
          }
        } catch (error: any) {
          errorToast({

            title: 'Error',
            description: error.message || 'Failed to load order'
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadOrder();
    }
  }, [isEditMode, orderId, form]);

  useEffect(() => {
    const loadBuyers = async () => {
      try {
        const buyersRes = await fetchBuyers({ page: 1, limit: 10, status: 'active' });
        if (buyersRes.success && buyersRes.data) {
          setBuyers(buyersRes.data.buyers);
        }
      } catch (error: any) {
        errorToast({
 
          title: 'Error',
          description: error.message || 'Failed to load buyers'
        });
      }
    };
    loadBuyers();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      const fetchNextOrderNumber = async () => {
        try {
          const response = await fetch('/api/orders?action=next-number');
          if (response.ok) {
            const data = await response.json();
            setNextOrderNumber(data.data.order_number);
          }
        } catch (error) {
          console.error('Failed to fetch next order number:', error);
        }
      };
      fetchNextOrderNumber();
    }
  }, [isEditMode]);

  const profileIds = form.watch('profile_ids');
  // const quantity = form.watch('quantity');
  // const profit = form.watch('profit');

  const selectedProfiles = useMemo(() => {
    return allProfiles.filter((p) => profileIds?.includes(p.id));
  }, [allProfiles, profileIds]);

  // const calculations = useMemo(() => {
  //   const profilesTotal = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);
  //   const total = profilesTotal * quantity;
  //   const grandTotal = total + (total * profit / 100);
  //   const burningWeightTotal = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.burning_weight || '0'), 0);
  //   const totalWeightSum = selectedProfiles.reduce((sum, p) => sum + parseFloat(p.total_weight || '0'), 0);
  //   const burningWastagePercent = totalWeightSum > 0 ? ((burningWeightTotal / totalWeightSum) * 100) : 0;

  //   return { profilesTotal, total, grandTotal, burningWeightTotal, burningWastagePercent };
  // }, [selectedProfiles, quantity, profit]);

  const onSubmit = async (values: CreateOrderFormInput) => {
    try {
      setIsLoading(true);

      if (isEditMode && orderId) {
        // Edit mode: build update payload with profile changes
        const currentProfileIds = values.profile_ids || [];
        const deletedProfileIds = initialProfileIds.filter(
          (id: string) => !currentProfileIds.includes(id)
        );
        const newProfileIds = currentProfileIds.filter(
          (id: string) => !initialProfileIds.includes(id)
        );
        const existingProfileIds = currentProfileIds.filter((id: string) =>
          initialProfileIds.includes(id)
        );

        // Get OrderProfile IDs for profiles we're keeping/updating
        const orderResponse = await fetchOrderById(orderId);
        const orderProfiles = orderResponse.data?.orderProfiles || [];

        const profiles = [
          // Mark deleted profiles
          ...deletedProfileIds.map((profile_id: string) => {
            const orderProfile = orderProfiles.find((op) => op.profile_id === profile_id);
            return {
              id: orderProfile?.id,
              profile_id,
              isDeleted: true
            };
          }),
          // Keep existing profiles
          ...existingProfileIds.map((profile_id: string) => {
            const orderProfile = orderProfiles.find((op) => op.profile_id === profile_id);
            return {
              id: orderProfile?.id,
              profile_id
            };
          }),
          // Mark new profiles
          ...newProfileIds.map((profile_id: string) => ({
            profile_id,
            isNew: true
          }))
        ];

        const updatePayload: any = {
          ...values,
          profiles
        };
        delete updatePayload.profile_ids; // Remove profile_ids as we're using profiles array
        delete updatePayload.order_number; // Don't update order number

        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update order');
        }

        success({ title: 'Success', description: 'Order updated successfully' });
        router.push('/orders');
      } else {
        // Create mode
        if (!values.order_number) {
          const response = await fetch('/api/orders?action=next-number');
          if (response.ok) {
            const data = await response.json();
            values.order_number = data.data.order_number;
          }
        }

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create order');
        }

        success({ title: 'Success', description: 'Order created successfully' });
        router.push('/orders');
      }
    } catch (error: any) {
      errorToast({
    
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} order`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isEditMode && originalOrderNumber && (
          <OrderNumberDisplay orderNumber={originalOrderNumber} />
        )}
        {!isEditMode && nextOrderNumber && <OrderNumberDisplay orderNumber={nextOrderNumber} />}

        <BuyerProfileSection
          control={form.control}
          buyers={buyers}
          isLoading={isLoading}
          onProfilesLoad={setAllProfiles}
        />

        <SelectedProfilesAccordion selectedProfiles={selectedProfiles} />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
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
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
          control={form.control}
          setValue={form.setValue}
          buyers={buyers}
          selectedProfiles={selectedProfiles}
          nextOrderNumber={nextOrderNumber}
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
