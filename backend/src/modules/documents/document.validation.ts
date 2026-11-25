import { z } from 'zod';

export const createDocumentSchema = z.object({
  matterId: z.string().min(1, 'Matter ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  title: z.string().trim().min(1, 'Title must contain at least 1 character').max(255),
  category: z.enum([
    'Pleading',
    'Motion',
    'Discovery',
    'Correspondence',
    'Contract',
    'Evidence',
    'Court Order',
    'Billing / Receipt',
    'Engagement',
    'Personal Injury',
    'Civil Litigation',
    'Bankruptcy',
    'Immigration',
    'Probate',
    'Family Law',
    'Criminal Defense',
    'Appeals',
    'Landlord-Tenant',
    'Legal Draft',
    'Other',
  ]),
  isPrivileged: z.boolean().default(false),
  privilegeType: z.string().max(100).optional(),
  batesNumberStart: z.string().max(50).optional(),
  batesNumberEnd: z.string().max(50).optional(),
  ocrContent: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title must contain at least 1 character').max(255).optional(),
  category: z
    .enum([
      'Pleading',
      'Motion',
      'Discovery',
      'Correspondence',
      'Contract',
      'Evidence',
      'Court Order',
      'Billing / Receipt',
      'Engagement',
      'Personal Injury',
      'Civil Litigation',
      'Bankruptcy',
      'Immigration',
      'Probate',
      'Family Law',
      'Criminal Defense',
      'Appeals',
      'Landlord-Tenant',
      'Legal Draft',
      'Other',
    ])
    .optional(),
  isPrivileged: z.boolean().optional(),
  privilegeType: z.string().max(100).nullable().optional(),
  batesNumberStart: z.string().max(50).nullable().optional(),
  batesNumberEnd: z.string().max(50).nullable().optional(),
});

export const uploadVersionSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(120),
  fileSizeBytes: z.union([z.number().nonnegative(), z.string().regex(/^\d+$/)]).optional(),
  fileContentBase64: z.string().optional(),
  revisionNotes: z.string().max(2000).optional(),
});

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  category: z.string().optional(),
  isPrivileged: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  ocrSearch: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UploadVersionInput = z.infer<typeof uploadVersionSchema>;
