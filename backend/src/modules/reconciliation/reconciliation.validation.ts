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

