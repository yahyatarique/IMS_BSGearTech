import { z } from 'zod';
import { ORDER_STATUS } from '@/enums/orders.enum';
import { CreateProfileSchema } from './profile.schema';

export const CreateOrderSchema = z.object({
  order_number: z.string().min(1, 'Order number is required'),
  buyer_id: z.string().uuid().optional(),
  status: z.enum(ORDER_STATUS).default(ORDER_STATUS.PENDING),
  grand_total: z.number().min(0).default(0),
  material_cost: z.number().min(0).default(0),
  process_costs: z.number().min(0).default(0),
  turning_rate: z.number().min(0).default(0),
  teeth_count: z.number().int().positive().optional(),
  module: z.number().positive().optional(),
  face: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  ht_cost: z.number().min(0).default(0),
  total_order_value: z.number().min(0).default(0),
  profit_margin: z.number().min(0).default(0),
  user_id: z.string().uuid().optional(),
  profiles: CreateProfileSchema.extend({ profile_id: z.uuid(), isNew: z.boolean().optional()  }).array().optional()
});

export const UpdateOrderSchema = CreateOrderSchema.partial();

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
