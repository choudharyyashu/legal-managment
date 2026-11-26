import { z } from 'zod';

export const liveReconciliationQuerySchema = z.object({
  reconciliationMonth: z.string().regex(/^\d{4}-\d{2}$/, 'reconciliationMonth must be YYYY-MM format'),
  bankStatementBalance: z.coerce.number().nonnegative().default(0),
  depositsInTransit: z.coerce.number().nonnegative().default(0),
  outstandingChecks: z.coerce.number().nonnegative().default(0),
});

export const submitReconciliationSchema = z.object({
  reconciliationMonth: z.string().regex(/^\d{4}-\d{2}$/, 'reconciliationMonth must be YYYY-MM format'),
  bankStatementBalance: z.number().nonnegative(),
  depositsInTransit: z.number().nonnegative().default(0),
  outstandingChecks: z.number().nonnegative().default(0),
  auditCertificatePdfUrl: z.string().url().optional(),
});

export type SubmitReconciliationInput = z.infer<typeof submitReconciliationSchema>;
export type LiveReconciliationQuery = z.infer<typeof liveReconciliationQuerySchema>;

export const operatingReconciliationQuerySchema = z.object({
  reconciliationPeriod: z.string().regex(/^\d{4}-\d{2}$/, 'reconciliationPeriod must be YYYY-MM format'),
  statementEndingBalance: z.coerce.number().optional().nullable(),
  statementOpeningBalance: z.coerce.number().optional().nullable(),
  bookAdjustments: z.coerce.number().optional().default(0),
});

export const saveOperatingDraftSchema = z.object({
  reconciliationPeriod: z.string().regex(/^\d{4}-\d{2}$/, 'reconciliationPeriod must be YYYY-MM format'),
  statementOpeningBalance: z.number().optional().nullable(),
  statementEndingBalance: z.number().optional().nullable(),
  bookAdjustments: z.number().optional().default(0),
  clearedItemIds: z.array(z.string()).default([]),
});

export const finalizeOperatingSchema = z.object({
  reconciliationPeriod: z.string().regex(/^\d{4}-\d{2}$/, 'reconciliationPeriod must be YYYY-MM format'),
  statementOpeningBalance: z.number(),
  statementEndingBalance: z.number(),
  clearedItemIds: z.array(z.string()).default([]),
  certificationNotes: z.string().max(1000).optional(),
});

export type OperatingReconciliationQuery = z.infer<typeof operatingReconciliationQuerySchema>;
export type SaveOperatingDraftInput = z.infer<typeof saveOperatingDraftSchema>;
export type FinalizeOperatingInput = z.infer<typeof finalizeOperatingSchema>;


