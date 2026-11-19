import { z } from 'zod';

export const createExpenseSchema = z.object({
  matterId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  category: z.string().min(1).max(100),
  amount: z.number().positive(),
  vendorName: z.string().max(255).optional(),
  receiptDocumentId: z.string().uuid().optional(),
  isBillable: z.boolean().default(true),
});

export const updateExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  vendorName: z.string().max(255).optional(),
  receiptDocumentId: z.string().uuid().optional(),
  isBillable: z.boolean().optional(),
  status: z.enum(['Unbilled', 'Billed', 'Reimbursed']).optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  matterId: z.string().optional(),
  incurredByUserId: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

