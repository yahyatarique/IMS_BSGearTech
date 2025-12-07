'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderFormSchema, OrderProfilesRecord, type CreateOrderFormInput } from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { createOrder, fetchNextOrderNumber } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { success, error as errorToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { OrderFormUI } from './order-form-ui';

export function CreateOrderForm() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextOrderNumber, setNextOrderNumber] = useState<string | null>(null);
    const [allProfiles, setAllProfiles] = useState<OrderProfilesRecord[]>([]);

  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(CreateOrderFormSchema),
    defaultValues: {
      order_name: '',
      buyer_id: '',
      profile_ids: [],
      quantity: 0,
      profit: 0,
      burning_wastage_percent: 0
    }
  });

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
    const loadNextOrderNumber = async () => {
      try {
        const data = await fetchNextOrderNumber();
        form.setValue('order_number', data.order_number);
        setNextOrderNumber(data.order_number);
      } catch (error) {
        console.error('Failed to fetch next order number:', error);
      }
    };
    loadNextOrderNumber();
  }, [form]);

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

  
    const handleProfileLoad = (profiles: OrderProfilesRecord[]) => {
      setAllProfiles(profiles);
    };

  const onSubmit = async (values: CreateOrderFormInput) => {
    console.log("🚀 ~ onSubmit ~ values:", values)
    debugger
    try {
      setIsLoading(true);

      if (!values.order_number) {
        const data = await fetchNextOrderNumber();
        values.order_number = data.order_number;
      }

      await createOrder(values);

      success({ title: 'Success', description: 'Order created successfully' });
      router.push('/orders');
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to create order'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderFormUI<CreateOrderFormInput>
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      buyers={buyers}
      isEditMode={false}
      orderNumber={nextOrderNumber || ''}
      orderProfiles={[]}
      selectedProfiles={selectedProfiles}
      onProfilesLoad={handleProfileLoad}
    />
  );
}
