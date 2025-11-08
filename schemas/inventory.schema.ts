import { z } from 'zod';

// Material type enum matching database enum
export const MaterialTypeEnum = z.enum(['CR-5', 'EN-9']);

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
});

// Update inventory schema (all fields optional)
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
});

// Inventory list query schema
export const InventoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  material_type: z.enum(['CR-5', 'EN-9', 'all']).default('CR-5').optional(),
  search: z.string().optional(),
});

// Infer TypeScript types from schemas
export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type InventoryListQuery = z.infer<typeof InventoryListQuerySchema>;
export type MaterialType = z.infer<typeof MaterialTypeEnum>;

