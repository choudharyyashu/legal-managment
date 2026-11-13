import { z } from 'zod';

export const createTimeEntrySchema = z.object({
  matterId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  hours: z.number().positive().max(24),
  rate: z.number().nonnegative().optional(),
  activityType: z.string().min(2).max(100),
  activityCode: z.string().max(50).optional(),
  description: z.string().min(5),
  isBillable: z.boolean().default(true),
});

export const updateTimeEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hours: z.number().positive().max(24).optional(),
  rate: z.number().nonnegative().optional(),
  activityType: z.string().min(2).max(100).optional(),
  activityCode: z.string().max(50).optional(),
  description: z.string().min(5).optional(),
  isBillable: z.boolean().optional(),
});

export const approveTimeEntrySchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  rejectionComment: z.string().max(1000).optional(),
});

export const timeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  matterId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type ApproveTimeEntryInput = z.infer<typeof approveTimeEntrySchema>;

