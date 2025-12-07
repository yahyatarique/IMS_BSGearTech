import { z } from 'zod';

export const CreateBurningWastageSchema = z.object({
  wastage_kg: z
    .number()
    .positive('Amount must be greater than 0 (disposal/sale only)')
    .min(0.01, 'Amount must be at least 0.01 kg'),
  date: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const UpdateBurningWastageSchema = z.object({
  wastage_kg: z
    .number()
    .positive('Amount must be greater than 0 (disposal/sale only)')
    .min(0.01, 'Amount must be at least 0.01 kg')
    .optional(),
  date: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export type CreateBurningWastageInput = z.infer<typeof CreateBurningWastageSchema>;
export type UpdateBurningWastageInput = z.infer<typeof UpdateBurningWastageSchema>;
