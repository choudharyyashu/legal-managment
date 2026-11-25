import { z } from 'zod';

const optionalNullableString = z.string().trim().max(500).optional().nullable();
const optionalNullableText = z.string().trim().max(5000).optional().nullable();

export const createRelatedPartySchema = z
  .object({
    matterId: z.string().uuid().optional().nullable(),
    clientId: z.string().uuid().optional().nullable(),
    intakeId: z.string().uuid().optional().nullable(),
    name: z.string().trim().min(1, 'Party name is required').max(255),
    aliases: optionalNullableText,
    roleId: z.string().trim().min(1).max(50).default('opposing_party'),
    roleLabel: z.string().trim().max(100).optional(),
    firmName: optionalNullableString,
    contactPerson: optionalNullableString,
    email: z
      .string()
      .trim()
      .email('Invalid email format')
      .or(z.literal(''))
      .optional()
      .nullable(),
    phone: z.string().trim().max(50).optional().nullable(),
    address: optionalNullableText,
    serviceType: z.string().trim().max(150).optional().nullable(),
    notes: optionalNullableText,
  })
  .refine((data) => Boolean(data.matterId || data.clientId || data.intakeId), {
    message: 'At least one of matterId, clientId, or intakeId must be provided.',
    path: ['matterId'],
  });

export const updateRelatedPartySchema = z.object({
  matterId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  intakeId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1).max(255).optional(),
  aliases: optionalNullableText,
  roleId: z.string().trim().min(1).max(50).optional(),
  roleLabel: z.string().trim().max(100).optional(),
  firmName: optionalNullableString,
  contactPerson: optionalNullableString,
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .or(z.literal(''))
    .optional()
    .nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  address: optionalNullableText,
  serviceType: z.string().trim().max(150).optional().nullable(),
  notes: optionalNullableText,
});

export const listRelatedPartiesQuerySchema = z.object({
  matterId: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  intakeId: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const conflictSearchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Search query must be at least 2 characters').max(500),
  excludeIntakeId: z.string().trim().optional(),
  excludeClientId: z.string().trim().optional(),
  excludeMatterId: z.string().trim().optional(),
});
