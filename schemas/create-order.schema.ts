import { z } from 'zod';

export const ProcessType = z.enum([
  'MILLING',
  'FITTING',
  'KEYWAY',
  'HEAT_TREATMENT',
  'TEETH_CUTTING',
  'TEETH_GRINDING',
  'CYLINDRICAL_GRINDING',
  'INTERNAL_GRINDING'
]);

export const OrderProcessSchema = z.object({
  type: ProcessType,
  rate: z.number().min(0),
});

export const FinishSizeSchema = z.object({
  width: z.number().min(0),
  height: z.number().min(0),
});

export const CreateOrderFormSchema = z.object({
  buyer_id: z.string().uuid(),
  profile_id: z.string().uuid('Please select a profile'),
  order_number: z.string().optional(), // Will be auto-generated
  finish_size: FinishSizeSchema,
  turning_rate: z.number().min(0, 'Turning rate must be >= 0'),
  module: z.number().min(0, 'Module must be >= 0').optional(),
  face: z.number().min(0, 'Face must be >= 0').optional(),
  teeth_count: z.number().int().min(0, 'Teeth count must be >= 0').optional(),
  weight: z.number().min(0), // Will be calculated
  material_cost: z.number().min(0), // Will be calculated
  teeth_cutting_grinding_cost: z.number().min(0), // Will be calculated
  ht_cost: z.number().min(0), // Will be calculated
  processes: z.array(OrderProcessSchema).min(0).max(2),
  total_order_value: z.number().min(0), // Will be calculated
  profit_margin: z.number().min(0),
  grand_total: z.number().min(0), // Will be calculated
});

export type CreateOrderFormInput = z.infer<typeof CreateOrderFormSchema>;
export type ProcessTypeEnum = z.infer<typeof ProcessType>;