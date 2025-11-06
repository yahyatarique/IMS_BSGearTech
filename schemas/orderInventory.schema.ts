import { z } from 'zod';

/**
 * Material type enum matching inventory
 */
export const MaterialTypeEnum = z.enum(['CR-5', 'EN-9']);

/**
 * Schema for creating a new order-inventory record
 * Stores denormalized inventory data for historical tracking
 */
export const CreateOrderInventorySchema = z.object({
  order_id: z.string().uuid('Invalid order ID format'),
  material_type: MaterialTypeEnum,
  material_weight: z.number().positive('Material weight must be positive'),
  cut_size_width: z.number().positive('Cut size width must be positive'),
  cut_size_height: z.number().positive('Cut size height must be positive'),
  po_number: z.string().trim().max(100).optional().nullable(),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  weight_used: z.number().positive('Weight must be positive').optional().nullable(),
  location: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  reserved_at: z.string().datetime().or(z.date()).optional().nullable(),
  used_at: z.string().datetime().or(z.date()).optional().nullable(),
});

/**
 * Schema for updating an existing order-inventory record
 * All fields optional to allow partial updates
 */
export const UpdateOrderInventorySchema = z.object({
  material_type: MaterialTypeEnum.optional(),
  material_weight: z.number().positive('Material weight must be positive').optional(),
  cut_size_width: z.number().positive('Cut size width must be positive').optional(),
  cut_size_height: z.number().positive('Cut size height must be positive').optional(),
  po_number: z.string().trim().max(100).optional().nullable(),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
  weight_used: z.number().positive('Weight must be positive').optional().nullable(),
  location: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  reserved_at: z.string().datetime().or(z.date()).optional().nullable(),
  used_at: z.string().datetime().or(z.date()).optional().nullable(),
});

/**
 * Schema for order-inventory query filters
 */
export const OrderInventoryFiltersSchema = z.object({
  order_id: z.string().uuid().optional(),
  material_type: MaterialTypeEnum.optional(),
  po_number: z.string().optional(),
  reserved_after: z.string().datetime().or(z.date()).optional(),
  used_after: z.string().datetime().or(z.date()).optional(),
});

// Type exports
export type CreateOrderInventoryInput = z.infer<typeof CreateOrderInventorySchema>;
export type UpdateOrderInventoryInput = z.infer<typeof UpdateOrderInventorySchema>;
export type OrderInventoryFilters = z.infer<typeof OrderInventoryFiltersSchema>;
