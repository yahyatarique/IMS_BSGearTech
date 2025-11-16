import { z } from 'zod';

// Material type enum matching database enum
export const MaterialTypeEnum = z.enum(['CR-5', 'EN-9']);

// Create inventory schema
export const CreateInventorySchema = z.object({
  material_type: MaterialTypeEnum,
  material_weight: z
    .number()
    .positive('Material weight must be positive')
    .max(9999999.999, 'Material weight is too large')
    .optional()
    .or(z.literal("")),  // Allow empty string in form that will be handled by backend
  outer_diameter: z
    .number()
    .positive('Outer diameter must be positive')
    .max(999999.9999, 'Outer diameter is too large'),
  length: z
    .number()
    .positive('Length must be positive')
    .max(999999.9999, 'Length is too large'),
  rate: z
    .number()
    .min(0, 'Rate cannot be negative')
    .max(99999999.99, 'Rate is too large'),
    total_cost: z.number().min(0).optional()
});

// Update inventory schema (all fields optional)
export const UpdateInventorySchema = z.object({
  material_type: MaterialTypeEnum.optional(),
  material_weight: z
    .number()
    .positive('Material weight must be positive')
    .max(9999999.999, 'Material weight is too large')
    .optional(),
  outer_diameter: z
    .number()
    .positive('Outer diameter must be positive')
    .max(999999.9999, 'Outer diameter is too large')
    .optional(),
  length: z
    .number()
    .positive('Length must be positive')
    .max(999999.9999, 'Length is too large')
    .optional(),
  rate: z
    .number()
    .min(0, 'Rate cannot be negative')
    .max(99999999.99, 'Rate is too large')
    .optional(),
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

