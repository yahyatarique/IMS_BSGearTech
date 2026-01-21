import { z } from 'zod';
import { MATERIALS } from '../enums/material.enum';

// Profile type enum
// 0 = Gear, 1 = Pinion
export const ProfileTypeEnum = z.enum(['0', '1']);

// Material enum
export const ProfileMaterialEnum = z.enum(MATERIALS);

export const Processes = z.object({
  name: z.string().min(1, 'Process name is required').max(255, 'Process name is too long'),
  cost: z
    .number()
    .nonnegative('Process cost must be non-negative')
    .max(99999999.99, 'Process cost is too large')
});

// Create profile schema
export const CreateProfileSchema = z.object({
  //when updating, id is required
  id: z.uuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  type: ProfileTypeEnum,
  material: ProfileMaterialEnum,
  materialTypeString: z
    .string()
    .min(1, 'Material is required')
    .min(1, 'Material is required')
    .max(255, 'Material type string is too long'),
  no_of_teeth: z.number().int().positive('Number of teeth must be positive'),
  rate: z.number().positive('Rate must be positive').max(99999999.99, 'Rate is too large'),
  face: z.number().positive('Face must be positive').max(9999999.999, 'Face is too large'),
  module: z.number().positive('Module must be positive').max(9999999.999, 'Module is too large'),
  finish_size: z.string().min(1, 'Finish size is required').max(255, 'Finish size is too long'),
  burning_weight: z
    .number()
    .nonnegative('Burning weight must be non-negative')
    .max(99999999.99, 'Burning weight is too large'),
  total_weight: z
    .number()
    .nonnegative('Total weight must be non-negative')
    .max(99999999.99, 'Total weight is too large'),
  ht_cost: z
    .number()
    .nonnegative('HT cost must be non-negative')
    .max(99999999.99, 'HT cost is too large'),
  ht_rate: z
    .number()
    .nonnegative('HT rate must be non-negative')
    .max(99999999.99, 'HT rate is too large'),
  processes: z.array(Processes).optional(),
  cyn_grinding: z
    .number()
    .nonnegative('CYN/Grinding must be non-negative')
    .max(99999999.99, 'CYN/Grinding is too large'),
  total: z
    .number()
    .nonnegative('Total must be non-negative')
    .max(99999999.99, 'Total is too large'),
  tcTGCost: z
    .number()
    .nonnegative('Teeth cutting and grinding cost must be non-negative')
    .max(99999999.99, 'Teeth cutting and grinding cost is too large')
    .optional(),
  inventory_id: z.uuid('Material is required'),
  group_by: z.string().max(100, 'Key is too long').optional(),
  burning_wastage_percentage: z
    .number()
    .max(100, 'Burning wastage percentage cannot exceed 100')
    .optional()
});

// Update profile schema (all fields optional)
export const UpdateProfileSchema = CreateProfileSchema.partial();

// Profile list query schema
export const ProfileListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: ProfileTypeEnum.or(z.literal('all')).default('all').optional(),
  material: ProfileMaterialEnum.or(z.literal('all')).default('all').optional(),
  search: z.string().optional()
});

// Infer TypeScript types
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ProfileListQuery = z.infer<typeof ProfileListQuerySchema>;
export type ProfileType = z.infer<typeof ProfileTypeEnum>;
export type ProfileMaterial = z.infer<typeof ProfileMaterialEnum>;
export type Process = z.infer<typeof Processes>;
