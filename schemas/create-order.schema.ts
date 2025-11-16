import { z } from 'zod';

export const CreateOrderFormSchema = z.object({
  order_name: z.string().min(1, 'Order name is required'),
  buyer_id: z.string().uuid('Please select a buyer'),
  profile_ids: z.array(z.string().uuid()).min(1, 'Please select at least one profile'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  profit: z.number().min(0, 'Profit percentage must be >= 0'),
  order_number: z.string().optional(),
  burning_wastage_percent: z.number().min(0)
});

export type CreateOrderFormInput = z.infer<typeof CreateOrderFormSchema>;

// Schema for updating individual order profiles (for API)
export const UpdateOrderProfileSchema = z.object({
  id: z.string().uuid().optional(), // Existing profile ID (if updating)
  profile_id: z.string().uuid(),
  isNew: z.boolean().optional(), // Flag to indicate new profile
  isDeleted: z.boolean().optional(), // Flag to indicate profile should be deleted
});

// Update schema for API (with profiles array)
export const UpdateOrderAPISchema = z.object({
  order_name: z.string().min(1).optional(),
  buyer_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).optional(),
  profit: z.number().min(0).optional(),
  burning_wastage_percent: z.number().min(0).optional(),
  profiles: z.array(UpdateOrderProfileSchema).optional(), // Array of profile updates
});

// Update schema for form (uses profile_ids like create form)
export const UpdateOrderFormSchema = z.object({
  order_name: z.string().min(1).optional(),
  buyer_id: z.string().uuid().optional(),
  profile_ids: z.array(z.string().uuid()).optional(),
  quantity: z.number().int().min(1).optional(),
  profit: z.number().min(0).optional(),
  burning_wastage_percent: z.number().min(0).optional(),
});

export type UpdateOrderFormInput = z.infer<typeof UpdateOrderFormSchema>;
export type UpdateOrderAPIInput = z.infer<typeof UpdateOrderAPISchema>;
export type UpdateOrderProfileInput = z.infer<typeof UpdateOrderProfileSchema>;