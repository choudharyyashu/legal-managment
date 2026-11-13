import { z } from 'zod';

export const invoiceLineItemInputSchema = z.object({
  itemType: z.enum(['Time', 'Expense', 'FlatFee', 'Adjustment']),
  timeEntryId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional(),
  description: z.string().min(2),
  quantity: z.number().positive(),
  unitRate: z.number().nonnegative(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  matterId: z.string().uuid(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'issueDate must be YYYY-MM-DD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD'),
  notes: z.string().max(2000).optional(),
  lineItems: z.array(invoiceLineItemInputSchema).min(1, 'At least one line item is required'),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['Draft', 'Issued', 'Partially Paid', 'Paid', 'Void', 'Overdue']),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['Check', 'Credit Card', 'ACH / Wire', 'Trust Transfer', 'Cash']),
  destinationAccount: z.enum(['Operating Account (1000)', 'Trust Account (1010)']).default('Operating Account (1000)'),
  transactionReference: z.string().max(100).optional(),
  receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'receivedDate must be YYYY-MM-DD'),
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  clientId: z.string().optional(),
  matterId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
