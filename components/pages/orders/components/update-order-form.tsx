'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OrderProfilesRecord,
  UpdateOrderFormInput,
  UpdateOrderFormSchema
} from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { fetchOrderById, updateOrder } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { success, error as errorToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { OrderFormUI } from './order-form-ui';

interface UpdateOrderFormProps {
  orderId: string;
}

export function UpdateOrderForm({ orderId }: UpdateOrderFormProps) {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalOrderNumber, setOriginalOrderNumber] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<OrderProfilesRecord[]>([]);

  const form = useForm<UpdateOrderFormInput>({
    resolver: zodResolver(UpdateOrderFormSchema),
    defaultValues: {
      order_name: '',
      buyer_id: '',
      profiles: [],
      quantity: 0,
      profit: 0,
      burning_wastage_percent: 0,
      orderProfiles: []
    }
  });

  const orderProfiles = form.watch('orderProfiles') as OrderProfilesRecord[];
  const profile_ids = form.watch('profile_ids');

  const selectedProfiles = useMemo(() => {
    return allProfiles
      .filter((p) => profile_ids?.includes(p.id!))
      .map((p) => ({
        ...p,
        burning_weight: Number(p.burning_weight),
        burning_wastage_percent: Number(p.burning_wastage_percentage),
        total_weight: Number(p.total_weight),
        rate: Number(p.rate),
        face: Number(p.face),
        module: Number(p.module),
        ht_cost: Number(p.ht_cost),
        ht_rate: Number(p.ht_rate),
        cyn_grinding: Number(p.cyn_grinding),
        total: Number(p.total)
      }));
  }, [allProfiles, profile_ids]);

  // Load existing order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const res = await fetchOrderById(orderId);
        const data = res?.data;
        if (data.success && data.data) {
          const order = data.data;
          setOriginalOrderNumber(order.order_number);

          form.reset({
            order_name: order.order_name || '',
            buyer_id: order.buyer_id || '',
            profiles: [],
            quantity: order.quantity,
            profit: parseFloat(order.profit_margin),
            burning_wastage_percent: parseFloat(order.burning_wastage_percent),
            orderProfiles: order?.orderProfiles?.map((orderProfile) => ({
              ...orderProfile,
              burning_wastage_percentage: Number(orderProfile.burning_wastage_percentage),
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
  }, [orderId, form]);

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

  const handleRemoveProfile = (profileId: string) => {
    const orderProfiles = form.getValues('orderProfiles') || [];
    const updatedProfiles = orderProfiles.filter((profile) => profile.id! !== profileId);
    form.setValue('orderProfiles', updatedProfiles);
  };

  const handleProfileLoad = (profiles: OrderProfilesRecord[]) => {
    setAllProfiles(profiles);
  };

  const onSubmit = async (values: UpdateOrderFormInput) => {
    try {
      setIsLoading(true);

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

      const updatePayload: UpdateOrderFormInput = {
        ...values,
        profiles: selectedProfilesModified
      };

      const res = await updateOrder(orderId, updatePayload);

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update order');
      }

      success({ title: 'Success', description: 'Order updated successfully' });
      router.push('/orders');
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to update order'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderFormUI
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      buyers={buyers}
      isEditMode={true}
      orderNumber={originalOrderNumber || ''}
      orderProfiles={orderProfiles}
      selectedProfiles={selectedProfiles}
      onRemoveProfile={handleRemoveProfile}
      onProfilesLoad={handleProfileLoad}
    />
  );
}
