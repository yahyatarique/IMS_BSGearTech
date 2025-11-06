import { z } from 'zod';

/**
 * Schema for creating a new order-inventory record
 * Links an order with inventory items and tracks usage
 */
export const CreateOrderInventorySchema = z.object({
  order_id: z.string().uuid('Invalid order ID format'),
  inventory_id: z.string().uuid('Invalid inventory ID format'),
  quantity_used: z.number().int().positive('Quantity must be a positive integer'),
  weight_used: z.number().positive('Weight must be positive').optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  reserved_at: z.string().datetime().or(z.date()).optional().nullable(),
  used_at: z.string().datetime().or(z.date()).optional().nullable(),
});

/**
 * Schema for updating an existing order-inventory record
 * All fields optional to allow partial updates
 */
export const UpdateOrderInventorySchema = z.object({
  quantity_used: z.number().int().positive('Quantity must be a positive integer').optional(),
  weight_used: z.number().positive('Weight must be positive').optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  reserved_at: z.string().datetime().or(z.date()).optional().nullable(),
  used_at: z.string().datetime().or(z.date()).optional().nullable(),
});

/**
 * Schema for order-inventory query filters
 */
export const OrderInventoryFiltersSchema = z.object({
  order_id: z.string().uuid().optional(),
  inventory_id: z.string().uuid().optional(),
  reserved_after: z.string().datetime().or(z.date()).optional(),
  used_after: z.string().datetime().or(z.date()).optional(),
});

// Type exports
export type CreateOrderInventoryInput = z.infer<typeof CreateOrderInventorySchema>;
export type UpdateOrderInventoryInput = z.infer<typeof UpdateOrderInventorySchema>;
export type OrderInventoryFilters = z.infer<typeof OrderInventoryFiltersSchema>;
