'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ProcessType,
  CreateOrderFormSchema,
  type CreateOrderFormInput
} from '@/schemas/create-order.schema';
import { fetchBuyers } from '@/services/buyers';
import { fetchOrderById } from '@/services/orders';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CreateOrderFormProps {
  orderId?: string | null;
}

export function CreateOrderForm({ orderId }: CreateOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!orderId);

  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(CreateOrderFormSchema),
    defaultValues: {
      processes: [],
      profit_margin: 0,
      material_rate: 0,
      ht_rate: 0
    }
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setIsInitializing(true);
        if (orderId) {
          const orderResponse = await fetchOrderById(orderId);
          if (orderResponse.success && orderResponse.data) {
            const order = orderResponse.data;
            // Populate form with order data
            form.reset({
              buyer_id: order.buyer_id,
              order_number: order.order_number,
              finish_size: {
                // width: order.width || 0,
                width: 0,
                height: 0
              },
              turning_rate: order.turning_rate,
              module: order.module,
              face: order.face,
              teeth_count: order.teeth_count,
              weight: order.weight,
              material_cost: order.material_cost,
              //   teeth_cutting_grinding_cost: order.teeth_cutting_grinding_cost,
              teeth_cutting_grinding_cost: 0,
              ht_cost: order.ht_cost,
              //   processes: order.processes || [],
              processes: [],
              total_order_value: order.total_order_value,
              profit_margin: order.profit_margin,
              grand_total: order.grand_total,
              //   material_rate: order.material_rate || 0,
              material_rate: 0,
              //   ht_rate: order.ht_rate || 0,
              ht_rate: 0
            });
          }
        }

        // Load buyers
        const buyersResponse = await fetchBuyers({ page: 1, limit: 100, status: 'active' });
        if (buyersResponse.success && buyersResponse.data) {
          setBuyers(buyersResponse.data.buyers);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to initialize form'
        });
      } finally {
        setIsInitializing(false);
      }
    };
    initializeForm();
  }, [toast, orderId, form]);

  const calculateWeight = (width: number, height: number) => {
    return (Math.pow(width, 2) * height) / 0.16202;
  };

  const calculateMaterialCost = (weight: number, materialRate: number) => {
    return weight * materialRate;
  };

  const calculateTeethCost = (teethCount: number, module: number, face: number, rate: number) => {
    return teethCount * module * face * rate;
  };

  const calculateHTCost = (weight: number, htRate: number) => {
    return weight * 0.75 * htRate; // 75% of weight (100% - 25%)
  };

  const calculateTotalOrderValue = (values: CreateOrderFormInput) => {
    const { material_cost, turning_rate, teeth_cutting_grinding_cost, ht_cost, processes } = values;

    return (
      material_cost +
      turning_rate +
      teeth_cutting_grinding_cost +
      ht_cost +
      processes.reduce((sum, process) => sum + process.rate, 0)
    );
  };

  const calculateGrandTotal = (totalOrderValue: number, profitMargin: number) => {
    return totalOrderValue * (1 + profitMargin / 100);
  };

  const onSubmit = async (values: CreateOrderFormInput) => {
    try {
      setIsLoading(true);
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
        throw new Error('Failed to save order');
      }

      toast({
        title: 'Success',
        description: orderId ? 'Order updated successfully' : 'Order created successfully'
      });

      // Redirect to orders list
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

  // Watch form values for calculations
  const width = form.watch('finish_size.width');
  const height = form.watch('finish_size.height');
  const materialRate = form.watch('material_rate');
  const teethCount = form.watch('teeth_count');
  const moduleValue = form.watch('module');
  const face = form.watch('face');
  const htRate = form.watch('ht_rate');
  const totalOrderValue = form.watch('total_order_value');
  const profitMargin = form.watch('profit_margin');

  // Update calculated values when dependencies change
  useEffect(() => {
    if (width && height) {
      const weight = calculateWeight(width, height);
      form.setValue('weight', weight);

      if (materialRate) {
        const materialCost = calculateMaterialCost(weight, materialRate);
        form.setValue('material_cost', materialCost);
      }

      if (htRate) {
        const htCost = calculateHTCost(weight, htRate);
        form.setValue('ht_cost', htCost);
      }
    }
  }, [width, height, materialRate, htRate, form]);

  useEffect(() => {
    if (teethCount && moduleValue && face) {
      const teethCost = calculateTeethCost(teethCount, moduleValue, face, 100); // Default rate of 100 INR
      form.setValue('teeth_cutting_grinding_cost', teethCost);
    }
  }, [teethCount, moduleValue, face, form]);

  // Watch values for total calculations
  const materialCost = form.watch('material_cost');
  const turningRate = form.watch('turning_rate');
  const teethCuttingGrindingCost = form.watch('teeth_cutting_grinding_cost');
  const htCost = form.watch('ht_cost');
  const processes = form.watch('processes');

  useEffect(() => {
    const values = form.getValues();
    const total = calculateTotalOrderValue(values);
    form.setValue('total_order_value', total);

    if (profitMargin) {
      const grandTotal = calculateGrandTotal(total, profitMargin);
      form.setValue('grand_total', grandTotal);
    }
  }, [materialCost, turningRate, teethCuttingGrindingCost, htCost, processes, profitMargin, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Buyer Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
          <FormField
            control={form.control}
            name="buyer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchaser</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name} {buyer.org_name ? `(${buyer.org_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Order Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="finish_size.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finish_size.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turning_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turning Rate (INR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="face"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Face</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teeth_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Teeth</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Material and Treatment Rates */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Material and Treatment Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="material_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Rate (INR/kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ht_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heat Treatment Rate (INR/kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Processes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Processes</h3>
          {form.watch('processes').map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <FormField
                control={form.control}
                name={`processes.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select process type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProcessType.enum).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`processes.${index}.rate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Cost (INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {form.watch('processes').length < 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const processes = form.getValues('processes');
                form.setValue('processes', [
                  ...processes,
                  { type: ProcessType.enum.MILLING, rate: 0 }
                ]);
              }}
            >
              Add Process
            </Button>
          )}
        </Card>

        {/* Calculated Values */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Calculated Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Cost (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teeth_cutting_grinding_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TC+TG Cost (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ht_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HT Cost (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Total and Profit */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Total and Profit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="total_order_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Order Value (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profit_margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit Margin (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grand_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grand Total (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            Create Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
