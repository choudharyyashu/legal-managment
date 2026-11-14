import { z } from 'zod';

export const validateDraftInputSchema = z.object({
  matterId: z.string().min(1, 'Matter identifier is required'),
  templateId: z.string().min(1, 'Template identifier or code is required'),
  templateVersionId: z.string().uuid().optional(),
  customOverrides: z.record(z.string(), z.any()).optional(),
});

export const generateDraftInputSchema = z.object({
  matterId: z.string().min(1, 'Matter identifier is required'),
  templateId: z.string().min(1, 'Template identifier or code is required'),
  templateVersionId: z.string().uuid().optional(),
  title: z.string().min(2).max(255).optional(),
  allowIncomplete: z.boolean().default(false),
  customOverrides: z.record(z.string(), z.any()).optional(),
});

export const createFollowUpTaskSchema = z.object({
  matterId: z.string().min(1, 'Matter identifier is required'),
  missingField: z.object({
    placeholderTag: z.string(),
    sourceEntity: z.string(),
    sourceField: z.string(),
    description: z.string().optional(),
  }),
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional(),
  assignedToUserId: z.string().uuid().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be in YYYY-MM-DD format').optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('High'),
});

export const draftQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(['Draft', 'Under Review', 'Approved', 'Rejected', 'Sent', 'Finalized', 'Stale']).optional(),
  search: z.string().optional(),
});

export const approveDraftSchema = z.object({
  notes: z.string().max(1000).optional(),
  approvalEvidence: z.record(z.string(), z.any()).optional(),
});

export const rejectDraftSchema = z.object({
  rejectionReason: z
    .string({
      required_error: 'rejectionReason is required',
      invalid_type_error: 'rejectionReason must be a string',
    })
    .trim()
    .min(3, 'rejectionReason must be at least 3 characters')
    .max(1000, 'rejectionReason must not exceed 1000 characters'),
  notes: z.string().max(1000).optional(),
});

export const sendDraftSchema = z.object({
  recipient: z
    .object({
      name: z.string().min(1, 'Recipient name is required'),
      email: z.string().email('Invalid recipient email address').optional(),
      mailingAddress: z.string().optional(),
      fax: z.string().optional(),
      organization: z.string().optional(),
    })
    .refine((data) => Boolean(data.email || data.mailingAddress || data.fax), {
      message: 'Recipient must have at least one delivery destination (email, mailingAddress, or fax)',
    }),
  channel: z.enum(['EMAIL', 'PORTAL', 'CERTIFIED_MAIL', 'FAX', 'MANUAL_HAND_DELIVERY'], {
    errorMap: () => ({ message: 'Channel must be EMAIL, PORTAL, CERTIFIED_MAIL, FAX, or MANUAL_HAND_DELIVERY' }),
  }),
  notes: z.string().max(1000).optional(),
  idempotencyKey: z.string().optional(),
});

export type ValidateDraftInput = z.infer<typeof validateDraftInputSchema>;
export type GenerateDraftInput = z.infer<typeof generateDraftInputSchema>;
export type CreateFollowUpTaskInput = z.infer<typeof createFollowUpTaskSchema>;
export type DraftQueryInput = z.infer<typeof draftQuerySchema>;
export type ApproveDraftInput = z.infer<typeof approveDraftSchema>;
export type RejectDraftInput = z.infer<typeof rejectDraftSchema>;
export type SendDraftInput = z.infer<typeof sendDraftSchema>;
