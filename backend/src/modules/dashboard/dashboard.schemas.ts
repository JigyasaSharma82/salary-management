import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  country: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(1).max(100).optional(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, 'Currency must be a three-letter ISO code.').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type DashboardFilters = z.infer<typeof dashboardFilterSchema>;
