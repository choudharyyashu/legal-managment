import { z } from 'zod';

export const ledgerEntryInputSchema = z.object({
  accountNumber: z.number().int().positive(),
  debit: z.number().nonnegative().default(0),
  credit: z.number().nonnegative().default(0),
  matterId: z.string().uuid().optional(),
}).refine(data => data.debit > 0 || data.credit > 0, {
  message: 'Each entry must have either a debit or credit greater than zero',
});

export const createJournalSchema = z.object({
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'transactionDate must be YYYY-MM-DD'),
  memo: z.string().min(3).max(500),
  entries: z.array(ledgerEntryInputSchema).min(2, 'A journal must contain at least two entries'),
}).refine(data => {
  const totalDebit = data.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = data.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.001;
}, {
  message: 'Unbalanced journal entry: Total debits must strictly equal total credits.',
  path: ['entries'],
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

