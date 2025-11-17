'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
import {
  CreateOrderFormSchema,
  OrderProfilesRecord,
  type CreateOrderFormInput
} from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { fetchOrderById, updateOrder } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { success, error as errorToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { OrderNumberDisplay } from './order-number-display';
import { BuyerProfileSection } from './buyer-profile-section';
import { SelectedProfilesAccordion } from './selected-profiles-accordion';
import { OrderSummary } from './order-summary';
import { OrderProfilesSection } from './order-profiles-section';
import { UpdateOrderInput } from '@/schemas/order.schema';

export function CreateOrderForm({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextOrderNumber, setNextOrderNumber] = useState<string | null>(null);
  const [isEditMode] = useState(!!orderId);
  const [originalOrderNumber, setOriginalOrderNumber] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<OrderProfilesRecord[]>([]);

  const initialProfileIdsRef = useRef<string[]>([]);

  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(CreateOrderFormSchema),
    defaultValues: {
      order_name: '',
      buyer_id: '',
      profile_ids: [],
      quantity: 1,
      profit: 0,
      burning_wastage_percent: 0,
      orderProfiles: []
    }
  });

  const orderProfiles = form.watch('orderProfiles') as OrderProfilesRecord[];
  const profileIds = form.watch('profile_ids');
  const selectedProfiles = useMemo(() => {
    return allProfiles
      .filter((p) => profileIds?.includes(p.id!))
      .map((p) => ({
        ...p,
        burning_weight: Number(p.burning_weight),
        total_weight: Number(p.total_weight),
        rate: Number(p.rate),
        face: Number(p.face),
        module: Number(p.module),
        ht_cost: Number(p.ht_cost),
        ht_rate: Number(p.ht_rate),
        cyn_grinding: Number(p.cyn_grinding),
        total: Number(p.total)
      }));
  }, [allProfiles, profileIds]);

  // Load existing order data in edit mode
  useEffect(() => {
    if (isEditMode && orderId) {
      const loadOrder = async () => {
        try {
          setIsLoading(true);
          const res = await fetchOrderById(orderId);
          const data = res?.data;
          if (data.success && data.data) {
            const order = data.data;
            setOriginalOrderNumber(order.order_number);

            if (order?.orderProfiles) {
              initialProfileIdsRef.current = order.orderProfiles.map((op) => op.id!);
            }

            form.reset({
              order_name: order.order_name || '',
              buyer_id: order.buyer_id || '',
              profile_ids: [],
              quantity: order.quantity,
              profit: parseFloat(order.profit_margin),
              burning_wastage_percent: parseFloat(order.burning_wastage_percent),
              orderProfiles: order?.orderProfiles?.map((orderProfile) => ({
                ...orderProfile,
                rate: Number(orderProfile.rate),
                materialTypeString: orderProfile.material,
                face: Number(orderProfile.face),
                module: Number(orderProfile.module),
                total_weight: Number(orderProfile.total_weight),
                ht_cost: Number(orderProfile.ht_cost),
                ht_rate: Number(orderProfile.ht_rate),
                cyn_grinding: Number(orderProfile.cyn_grinding),
                burning_weight: Number(orderProfile.burning_weight),
                total: Number(orderProfile.total)
              }))
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

  const handleRemoveProfile = (profileId: string) => {
    const orderProfiles = form.getValues('orderProfiles') || [];
    const updatedProfiles = orderProfiles.filter((profile) => profile.id! !== profileId);
    form.setValue('orderProfiles', updatedProfiles);
  };

  const handleProfileLoad = (profiles: OrderProfilesRecord[]) => {
    setAllProfiles(profiles);
  };

  const onSubmit = async (values: CreateOrderFormInput) => {
    try {
      setIsLoading(true);
      if (isEditMode && orderId) {

        // Edit mode: build update payload with profile changes

        const _selectedProfiles = selectedProfiles;
        const mergedProfiles = [...orderProfiles, ..._selectedProfiles];

        const selectedProfilesModified = mergedProfiles.map((p) => {
          if (!p.profile_id) {
            return {
              ...p,
              isNew: true
            };
          } else return p;
        });

        const updatePayload: UpdateOrderInput = {
          ...values,
          profiles: selectedProfilesModified
        };

        const res = await updateOrder(orderId, updatePayload);

        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to update order');
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

        if(selectedProfiles.length === 0) {
          form.setError('profile_ids', { message: 'At least one profile is required' });
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
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error('Form validation errors:', errors);
      })} className="space-y-8">
        {isEditMode && originalOrderNumber && (
          <OrderNumberDisplay orderNumber={originalOrderNumber} />
        )}
        {!isEditMode && nextOrderNumber && <OrderNumberDisplay orderNumber={nextOrderNumber} />}

        <BuyerProfileSection
          onProfilesLoad={handleProfileLoad}
          control={form.control}
          buyers={buyers}
          isLoading={isLoading}
        />

        <OrderProfilesSection
          selectedProfiles={orderProfiles}
          onRemoveProfile={handleRemoveProfile}
        />

        <SelectedProfilesAccordion profiles={selectedProfiles} selectedProfiles={orderProfiles} />

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
          orderProfiles={orderProfiles}
          selectedProfiles={selectedProfiles}
          control={form.control}
          setValue={form.setValue}
          buyers={buyers}
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
