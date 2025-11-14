import { z } from 'zod';
import { MATERIALS } from '../enums/material.enum';

// Profile type enum
// 0 = Gear, 1 = Pinion
export const ProfileTypeEnum = z.enum(['0', '1']);

// Material enum
export const ProfileMaterialEnum = z.enum(MATERIALS);

// Create profile schema
export const CreateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  type: ProfileTypeEnum,
  material: ProfileMaterialEnum,
  materialTypeString: z.string().min(1, 'Material type string is required').max(255, 'Material type string is too long'),
  material_rate: z
    .number()
    .nonnegative('Material rate must be non-negative')
    .max(99999999.9999, 'Material rate is too large'),
  outer_diameter_mm: z
    .number()
    .positive('Outer diameter must be positive')
    .max(999999.9999, 'Outer diameter is too large'),
  thickness_mm: z
    .number()
    .positive('Thickness must be positive')
    .max(999999.9999, 'Thickness is too large'),
  heat_treatment_rate: z
    .number()
    .nonnegative('Heat treatment rate must be non-negative')
    .max(99999999.9999, 'Heat treatment rate is too large'),
  heat_treatment_inefficacy_percent: z
    .number()
    .nonnegative('Heat treatment inefficacy percent must be non-negative')
    .max(100, 'Heat treatment inefficacy percent cannot exceed 100%'),
  inventory_id: z.uuid().optional(),
});

// Update profile schema (all fields optional)
export const UpdateProfileSchema = CreateProfileSchema.partial();

// Profile list query schema
export const ProfileListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: ProfileTypeEnum.or(z.literal('all')).default('all').optional(),
  material: ProfileMaterialEnum.or(z.literal('all')).default('all').optional(),
  search: z.string().optional(),
});

// Infer TypeScript types
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ProfileListQuery = z.infer<typeof ProfileListQuerySchema>;
export type ProfileType = z.infer<typeof ProfileTypeEnum>;
export type ProfileMaterial = z.infer<typeof ProfileMaterialEnum>;
