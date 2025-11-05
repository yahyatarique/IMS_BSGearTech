import { z } from 'zod';

export const DashboardStatsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DashboardStatsQueryInput = z.infer<typeof DashboardStatsQuerySchema>;
