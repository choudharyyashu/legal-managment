import { z } from 'zod';

export const CLIENT_TYPES = [
  'Organization',
  'Individual',
  'Trust / Estate',
  'Government / Public',
] as const;

export const CLIENT_STATUSES = ['Active', 'Prospective', 'Inactive'] as const;

export const createClientSchema = z.object({
  name: z.string().trim().min(2, 'Client name must be at least 2 characters').max(255),
  type: z.enum(CLIENT_TYPES).optional(),
  clientType: z.enum(CLIENT_TYPES).optional(),
  primaryContact: z.string().trim().max(255).optional().nullable(),
  email: z.string().trim().email('A valid email address is required'),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 characters').max(50),
  address: z.string().trim().optional().nullable(),
  assignedAttorneyId: z.string().uuid('Assigned attorney must be a valid UUID').optional().nullable(),
  status: z.enum(CLIENT_STATUSES).default('Active'),
  notes: z.string().trim().optional().nullable(),
  portalAccessEnabled: z.boolean().default(false),
}).refine((data) => data.type || data.clientType, {
  message: `Client type is required and must be one of: ${CLIENT_TYPES.join(', ')}`,
  path: ['clientType'],
});

export const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  type: z.enum(CLIENT_TYPES).optional(),
  clientType: z.enum(CLIENT_TYPES).optional(),
  primaryContact: z.string().trim().max(255).optional().nullable(),
  email: z.string().trim().email('A valid email address is required').optional(),
  phone: z.string().trim().min(5).max(50).optional(),
  address: z.string().trim().optional().nullable(),
  assignedAttorneyId: z.string().uuid('Assigned attorney must be a valid UUID').optional().nullable(),
  status: z.enum(CLIENT_STATUSES).optional(),
  notes: z.string().trim().optional().nullable(),
  portalAccessEnabled: z.boolean().optional(),
});

export const updateClientStatusSchema = z.object({
  status: z.enum(CLIENT_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${CLIENT_STATUSES.join(', ')}` }),
  }),
});

export const clientQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
  clientType: z.enum(CLIENT_TYPES).optional(),
  type: z.enum(CLIENT_TYPES).optional(),
  assignedAttorneyId: z.string().optional(),
  sortBy: z.enum(['name', 'clientNumber', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type UpdateClientStatusInput = z.infer<typeof updateClientStatusSchema>;
export type ClientQueryInput = z.infer<typeof clientQuerySchema>;

