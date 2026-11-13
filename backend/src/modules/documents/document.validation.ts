import { z } from 'zod';

export const createDocumentSchema = z.object({
  matterId: z.string().uuid(),
  clientId: z.string().uuid(),
  title: z.string().min(2).max(255),
  category: z.enum(['Pleading', 'Motion', 'Discovery', 'Correspondence', 'Contract', 'Evidence', 'Court Order', 'Billing / Receipt', 'Other']),
  isPrivileged: z.boolean().default(false),
  privilegeType: z.string().max(100).optional(),
  batesNumberStart: z.string().max(50).optional(),
  batesNumberEnd: z.string().max(50).optional(),
});

export const uploadVersionSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(50),
  fileSizeBytes: z.union([z.number().positive(), z.string().regex(/^\d+$/)]),
  fileContentBase64: z.string().optional(),
  revisionNotes: z.string().max(2000).optional(),
});

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UploadVersionInput = z.infer<typeof uploadVersionSchema>;

