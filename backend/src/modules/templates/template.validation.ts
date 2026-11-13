import { z } from 'zod';

export const createTemplateSchema = z.object({
  templateCode: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_\-]+$/i, 'Template code must contain only alphanumeric characters, dashes, or underscores'),
  templateName: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  practiceAreaId: z.string().min(1).max(50),
  category: z.string().min(2).max(100),
  outputFormat: z.enum(['DOCX', 'PDF', 'BOTH']).default('DOCX'),
  isSystemDefault: z.boolean().default(false),
});

export const updateTemplateSchema = z.object({
  templateName: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional(),
  practiceAreaId: z.string().min(1).max(50).optional(),
  category: z.string().min(2).max(100).optional(),
  outputFormat: z.enum(['DOCX', 'PDF', 'BOTH']).optional(),
  isSystemDefault: z.boolean().optional(),
});

export const templateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const uploadTemplateVersionSchema = z.object({
  versionNumber: z
    .string()
    .min(2)
    .max(20)
    .regex(/^v?\d+(\.\d+)*$/i, 'Version must be formatted like v1.0 or 1.0')
    .optional(),
  fileName: z
    .string()
    .min(1)
    .max(255)
    .refine((name) => name.toLowerCase().endsWith('.docx'), 'File must have a .docx extension'),
  fileContentBase64: z.string().min(1, 'Base64 file content is required'),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Published'),
  changeSummary: z.string().max(2000).optional(),
});

export const templateQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  practiceAreaId: z.string().optional(),
  category: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
});

export const createFieldMappingSchema = z.object({
  placeholderTag: z
    .string()
    .min(2)
    .max(150)
    .regex(/^(\{\{)?([A-Za-z0-9_.]+(\[[0-9]+\])?)+(\}\})?$/, 'Placeholder tag format invalid (e.g. {{Client.Name}} or Client.Name)'),
  sourceEntity: z.enum([
    'Client',
    'Matter',
    'User',
    'ResponsibleAttorney',
    'Intake',
    'Court',
    'WorkflowStage',
    'CustomField',
  ]),
  sourceField: z.string().min(1).max(100),
  isRequired: z.boolean().default(true),
  defaultValue: z.string().max(255).optional(),
  formattingRule: z
    .enum([
      'UPPERCASE',
      'LOWERCASE',
      'TITLECASE',
      'DATE_LONG',
      'DATE_SHORT',
      'DATE_COURT',
      'CURRENCY_USD',
      'PHONE_STANDARD',
      'NONE',
    ])
    .optional(),
  conditionalExpression: z.string().max(255).optional(),
});

export const batchFieldMappingsSchema = z.object({
  mappings: z.array(createFieldMappingSchema).min(1, 'At least one field mapping is required'),
});

export const updateFieldMappingSchema = createFieldMappingSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type UploadTemplateVersionInput = z.infer<typeof uploadTemplateVersionSchema>;
export type CreateFieldMappingInput = z.infer<typeof createFieldMappingSchema>;
export type BatchFieldMappingsInput = z.infer<typeof batchFieldMappingsSchema>;
export type UpdateFieldMappingInput = z.infer<typeof updateFieldMappingSchema>;

