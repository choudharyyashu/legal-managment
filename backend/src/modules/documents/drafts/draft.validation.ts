import { z } from 'zod';

export const validateDraftInputSchema = z.object({
  matterId: z.string().min(1, 'Matter identifier is required'),
  templateId: z.string().min(1, 'Template identifier or code is required'),
  templateVersionId: z.string().uuid().optional(),
});

export const generateDraftInputSchema = z.object({
  matterId: z.string().min(1, 'Matter identifier is required'),
  templateId: z.string().min(1, 'Template identifier or code is required'),
  templateVersionId: z.string().uuid().optional(),
  title: z.string().min(2).max(255).optional(),
  allowIncomplete: z.boolean().default(false),
  customOverrides: z.record(z.string(), z.any()).optional(),
});

export const draftQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(['Draft', 'Under Review', 'Approved', 'Finalized', 'Stale']).optional(),
  search: z.string().optional(),
});

export type ValidateDraftInput = z.infer<typeof validateDraftInputSchema>;
export type GenerateDraftInput = z.infer<typeof generateDraftInputSchema>;
export type DraftQueryInput = z.infer<typeof draftQuerySchema>;

