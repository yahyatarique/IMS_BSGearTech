import { z } from 'zod';

export const DashboardStatsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const DashboardRecentOrdersQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional(),
});

export const DashboardRecentBuyersQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional(),
});

export const DashboardMaterialsQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional(),
});

export const DashboardProfileTypesQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional(),
});

export type DashboardStatsQueryInput = z.infer<typeof DashboardStatsQuerySchema>;
export type DashboardRecentOrdersQueryInput = z.infer<typeof DashboardRecentOrdersQuerySchema>;
export type DashboardRecentBuyersQueryInput = z.infer<typeof DashboardRecentBuyersQuerySchema>;
export type DashboardMaterialsQueryInput = z.infer<typeof DashboardMaterialsQuerySchema>;
export type DashboardProfileTypesQueryInput = z.infer<typeof DashboardProfileTypesQuerySchema>;
