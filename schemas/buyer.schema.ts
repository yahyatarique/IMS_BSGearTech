import { z } from 'zod';

// Contact details schema for JSONB field - at least one contact method required
const ContactDetailsSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'At least one contact method (email or phone) is required',
    path: ['email'],
  });

export type ContactDetails = z.infer<typeof ContactDetailsSchema>;

// Create buyer schema - name, contact_details, org_name, org_address, and status are mandatory
export const CreateBuyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact_details: ContactDetailsSchema,
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  tin_number: z.string().optional(),
  org_name: z.string().min(2, 'Organization name must be at least 2 characters'),
  org_address: z.string().min(5, 'Organization address must be at least 5 characters'),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
});

export type CreateBuyerInput = z.infer<typeof CreateBuyerSchema>;

// Update buyer schema (all fields optional for updates)
export const UpdateBuyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  contact_details: ContactDetailsSchema.optional(),
  gst_number: z.string().nullable().optional(),
  pan_number: z.string().nullable().optional(),
  tin_number: z.string().nullable().optional(),
  org_name: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  org_address: z.string().min(5, 'Organization address must be at least 5 characters').optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
});

export type UpdateBuyerInput = z.infer<typeof UpdateBuyerSchema>;

// Query params for listing buyers
export const BuyerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['active', 'inactive', 'blocked', 'all']).optional(),
  search: z.string().optional(),
});

export type BuyerListQuery = z.infer<typeof BuyerListQuerySchema>;
