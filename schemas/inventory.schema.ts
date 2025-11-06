import { z } from 'zod';

// Material type enum matching database enum
export const MaterialTypeEnum = z.enum(['CR-5', 'EN-9']);

// Inventory status enum
export const InventoryStatusEnum = z.enum(['available', 'reserved', 'used', 'damaged']);

// Create inventory schema
export const CreateInventorySchema = z.object({
  material_type: MaterialTypeEnum,
  material_weight: z
    .number()
    .positive('Material weight must be positive')
    .max(9999999.999, 'Material weight is too large'),
  cut_size_width: z
    .number()
    .positive('Width must be positive')
    .max(999999.9999, 'Width is too large'),
  cut_size_height: z
    .number()
    .positive('Height must be positive')
    .max(999999.9999, 'Height is too large'),
  po_number: z.string().max(100, 'PO number is too long').optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .default(1),
  status: InventoryStatusEnum.default('available'),
  location: z.string().max(255, 'Location is too long').optional(),
  notes: z.string().optional()
});

// Update inventory schema (all fields optional except id)
export const UpdateInventorySchema = z.object({
  material_type: MaterialTypeEnum.optional(),
  material_weight: z
    .number()
    .positive('Material weight must be positive')
    .max(9999999.999, 'Material weight is too large')
    .optional(),
  cut_size_width: z
    .number()
    .positive('Width must be positive')
    .max(999999.9999, 'Width is too large')
    .optional(),
  cut_size_height: z
    .number()
    .positive('Height must be positive')
    .max(999999.9999, 'Height is too large')
    .optional(),
  po_number: z.string().max(100, 'PO number is too long').optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .optional(),
  status: InventoryStatusEnum.optional(),
  location: z.string().max(255, 'Location is too long').optional(),
  notes: z.string().optional()
});

// Infer TypeScript types from schemas
export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type MaterialType = z.infer<typeof MaterialTypeEnum>;
export type InventoryStatus = z.infer<typeof InventoryStatusEnum>;
