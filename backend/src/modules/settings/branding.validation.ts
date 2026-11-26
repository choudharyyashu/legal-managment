import { z } from 'zod';

export const updateFirmBrandingSchema = z.object({
  firmName: z
    .string({ required_error: 'Firm name is required' })
    .trim()
    .min(2, 'Firm name must be at least 2 characters')
    .max(150, 'Firm name cannot exceed 150 characters'),
  tagline: z.string().max(200, 'Tagline cannot exceed 200 characters').optional().default(''),
  primaryPhone: z.string().max(50, 'Phone cannot exceed 50 characters').optional().default(''),
  primaryEmail: z
    .string()
    .trim()
    .email('Invalid email address format')
    .or(z.literal(''))
    .optional()
    .default(''),
  address: z.string().max(300, 'Address cannot exceed 300 characters').optional().default(''),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color')
    .optional()
    .default('#06244B'),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color')
    .optional()
    .default('#F5F0E5'),
  accentColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color')
    .optional()
    .default('#A4432B'),
});

export type UpdateFirmBrandingInput = z.infer<typeof updateFirmBrandingSchema>;
