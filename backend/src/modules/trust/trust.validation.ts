import { z } from 'zod';

export const createTrustDepositSchema = z.object({
  matterId: z.string().uuid(),
  amount: z.number().positive('Deposit amount must be greater than zero'),
  sourceReference: z.string().min(2).max(100),
  purpose: z.string().min(3),
});

export const createTrustDisbursementSchema = z.object({
  matterId: z.string().uuid(),
  amount: z.number().positive('Disbursement amount must be greater than zero'),
  sourceReference: z.string().min(2).max(100),
  purpose: z.string().min(3),
  destinationAccount: z.string().default('Operating Account (1000)'),
});

export const trustLedgerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  clientId: z.string().optional(),
  matterId: z.string().optional(),
});

export type CreateTrustDepositInput = z.infer<typeof createTrustDepositSchema>;
export type CreateTrustDisbursementInput = z.infer<typeof createTrustDisbursementSchema>;
