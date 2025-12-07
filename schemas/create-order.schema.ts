import { z } from 'zod';
import { CreateProfileSchema } from './profile.schema';
import { InventoryRecord } from '../services/types/inventory.api.type';

export const OrderProfileSchema = CreateProfileSchema.extend({
  profile_id: z.uuid(),
  created_at: z.date(),
  updated_at: z.date()
}).omit({
  inventory_id: true
});

export const CreateOrderFormSchema = z.object({
  order_name: z.string().min(1, 'Order name is required'),
  buyer_id: z.uuid('Please select a buyer'),
  profile_ids: z.array(z.uuid()).min(0, 'Please select at least one profile'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  profit: z.number().min(0, 'Profit percentage must be >= 0'),
  order_number: z.string().optional(),
  burning_wastage_percent: z.number().min(0),

  // Internal use only fields
  orderProfiles: z.array(OrderProfileSchema).optional()
});

// Schema for updating individual order profiles (for API)
export const UpdateOrderProfileSchema = z.object({
  id: z.uuid().optional(), // Existing profile ID (if updating)
  profile_id: z.uuid().optional(), //keeping it optional so we can use the same schema for both update and create
  isNew: z.boolean().optional() // Flag to indicate new profile
});

// Update schema for form (uses profile_ids like create form)
export const UpdateOrderFormSchema = z.object({
  order_name: z.string().min(1).optional(),
  buyer_id: z.uuid().optional(),
  profiles: z.array(UpdateOrderProfileSchema).optional(),
  quantity: z.number().int().min(1).optional(),
  profit: z.number().min(0).optional(),
  burning_wastage_percent: z.number().min(0).optional()
});

export type UpdateOrderFormInput = z.infer<typeof UpdateOrderFormSchema>;
export type UpdateOrderAPIInput = z.infer<typeof UpdateOrderFormSchema>;
export type UpdateOrderProfileInput = z.infer<typeof UpdateOrderProfileSchema>;
export type OrderProfilesRecord = z.infer<typeof OrderProfileSchema> & {
  inventory: InventoryRecord;
};
export type CreateOrderFormInput = z.infer<typeof CreateOrderFormSchema>;
