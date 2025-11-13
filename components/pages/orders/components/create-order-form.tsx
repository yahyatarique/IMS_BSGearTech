'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CreateOrderFormSchema, type CreateOrderFormInput } from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { fetchOrderById } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { fetchProfiles } from '@/services/profiles';
import { ProfileRecord } from '@/services/types/profile.api.type';
import {
  calculateWeight,
  calculateMaterialCost,
  calculateTeethCost,
  calculateHTCost,
  calculateTotalOrderValue,
  calculateGrandTotal
} from '@/utils/calculationHelper';
import { OrderNumberDisplay } from './order-number-display';
import { BuyerProfileSection } from './buyer-profile-section';
import { ProfileDetailsDisplay } from './profile-details-display';
import { FinishSizeSection } from './finish-size-section';
import { GearSpecificationsSection } from './gear-specifications-section';
import { ProcessesSection } from './processes-section';
import { CalculatedValuesSection } from './calculated-values-section';
import { TotalProfitSection } from './total-profit-section';
import { OrderSummary } from './order-summary';

interface CreateOrderFormProps {
  orderId?: string | null;
}

export function CreateOrderForm({ orderId }: CreateOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!orderId);
  const [nextOrderNumber, setNextOrderNumber] = useState<string | null>(null);

  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(CreateOrderFormSchema),
    defaultValues: {
      processes: [],
      profit_margin: 0,
      finish_size: { width: 0, height: 0 },
      turning_rate: 0,
      material_cost: 0,
      teeth_cutting_grinding_cost: 0,
      ht_cost: 0,
      weight: 0,
      total_order_value: 0,
      grand_total: 0
    }
  });

  // Fetch buyers and profiles on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [buyersRes, profilesRes] = await Promise.all([
          fetchBuyers({ page: 1, limit: 10, status: 'active' }),
          fetchProfiles({ page: 1, limit: 10 })
        ]);

        if (buyersRes.success && buyersRes.data) {
          setBuyers(buyersRes.data.buyers);
        }
        if (profilesRes.success && profilesRes.data) {
          setProfiles(profilesRes.data.profiles);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load initial data'
        });
      }
    };
    loadInitialData();
  }, [toast]);

  // Fetch next order number for new orders
  useEffect(() => {
    if (!orderId) {
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
  }, [orderId]);

  // Load order data if editing
  useEffect(() => {
    const initializeForm = async () => {
      if (!orderId) {
        setIsInitializing(false);
        return;
      }

      try {
        const orderResponse = await fetchOrderById(orderId);
        if (orderResponse.success && orderResponse.data) {
          const order = orderResponse.data;
          form.reset({
            buyer_id: order.buyer_id || '',
            finish_size: {
              width: 0,
              height: 0
            },
            turning_rate: order.turning_rate,
            module: order.module,
            face: order.face,
            teeth_count: order.teeth_count,
            weight: order.weight,
            material_cost: order.material_cost,
            teeth_cutting_grinding_cost: 0,
            ht_cost: order.ht_cost,
            processes: [],
            total_order_value: order.total_order_value,
            profit_margin: order.profit_margin,
            grand_total: order.grand_total
          });
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load order'
        });
      } finally {
        setIsInitializing(false);
      }
    };
    initializeForm();
  }, [orderId, form, toast]);

  const profileId = form.watch('profile_id');
  const selectedProfile = profiles.find((p) => p.id === profileId);
  const teethCount = form.watch('teeth_count');
  const moduleValue = form.watch('module');
  const face = form.watch('face');
  const turningRate = form.watch('turning_rate');
  const materialCost = form.watch('material_cost');
  const teethCost = form.watch('teeth_cutting_grinding_cost');
  const htCost = form.watch('ht_cost');
  const profitMargin = form.watch('profit_margin');
  const processes = form.watch('processes');

  // Update calculations when profile changes
  useEffect(() => {
    if (selectedProfile) {
      // Set rates from profile
      const materialRate = Number(selectedProfile.material_rate);
      const htRate = Number(selectedProfile.heat_treatment_rate);

      const cutSizeOne = Number(selectedProfile.cut_size_width_mm);
      const cutSizeTwo = Number(selectedProfile.cut_size_height_mm);

      // Calculate weight if dimensions exist
      if (cutSizeOne && cutSizeTwo) {
        const weight = calculateWeight(cutSizeOne, cutSizeTwo);

        form.setValue('weight', Number(weight?.toFixed(5)));

        const materialCost = calculateMaterialCost(weight, materialRate);
        form.setValue('material_cost', Number(materialCost?.toFixed(5)));

        const htCost = calculateHTCost(weight, htRate);
        form.setValue('ht_cost', Number(htCost?.toFixed(5)));
      }
    }
  }, [selectedProfile, form]);

  // Update teeth cost when dependencies change
  useEffect(() => {
    if (teethCount && moduleValue && face && teethCount > 0 && moduleValue > 0 && face > 0) {
      const teethCost = calculateTeethCost(teethCount, moduleValue, face);
      form.setValue('teeth_cutting_grinding_cost', teethCost);
    }
  }, [teethCount, moduleValue, face, form]);

  const p = JSON.stringify(processes);

  // Update total values when dependencies change
  useEffect(() => {
    const totalOrderValue = calculateTotalOrderValue(
      Number(materialCost) || 0,
      Number(turningRate) || 0,
      Number(teethCost) || 0,
      Number(htCost) || 0,
      processes || []
    );
    form.setValue('total_order_value', totalOrderValue);

    if (profitMargin) {
      const gT = calculateGrandTotal(totalOrderValue, Number(profitMargin));
      form.setValue('grand_total', gT);
    } else {
      form.setValue('grand_total', totalOrderValue);
    }
  }, [materialCost, turningRate, teethCost, htCost, p, processes, profitMargin, form]);

  const onSubmit = async (values: CreateOrderFormInput) => {
    try {
      setIsLoading(true);

      // For new orders, fetch the next order number from the API
      if (!orderId && !values.order_number) {
        try {
          const response = await fetch('/api/orders?action=next-number');
          if (response.ok) {
            const data = await response.json();
            values.order_number = data.data.order_number;
          }
        } catch (error) {
          console.error('Failed to fetch next order number:', error);
          throw new Error('Failed to generate order number');
        }
      }

      const method = orderId ? 'PUT' : 'POST';
      const url = orderId ? `/api/orders/${orderId}` : '/api/orders';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save order');
      }

      toast({
        title: 'Success',
        description: orderId ? 'Order updated successfully' : 'Order created successfully'
      });

      router.push('/orders');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save order'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {nextOrderNumber && !orderId && <OrderNumberDisplay orderNumber={nextOrderNumber} />}

        <BuyerProfileSection
          control={form.control}
          buyers={buyers}
          profiles={profiles}
          isLoading={isLoading}
        />

        {selectedProfile && <ProfileDetailsDisplay profile={selectedProfile} />}

        <FinishSizeSection control={form.control} />

        <GearSpecificationsSection control={form.control} />

        <ProcessesSection
          control={form.control}
          getValues={form.getValues}
          setValue={form.setValue}
        />

        <CalculatedValuesSection control={form.control} />

        <TotalProfitSection control={form.control} />

        <OrderSummary
          control={form.control}
          buyers={buyers}
          selectedProfile={selectedProfile}
          nextOrderNumber={nextOrderNumber}
          orderId={orderId}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            Create Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
