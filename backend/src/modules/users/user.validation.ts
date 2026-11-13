import { z } from 'zod';

export const VALID_ROLES = ['super_admin', 'attorney', 'paralegal', 'billing', 'supervisor'] as const;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required (minimum 2 characters)'),
  email: z.string().trim().email('Valid email address is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
  role: z.enum(VALID_ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${VALID_ROLES.join(', ')}` }),
  }),
  phone: z.string().trim().optional(),
  title: z.string().trim().optional(),
  initials: z.string().trim().max(10).optional(),
  department: z.string().trim().optional(),
  billingRate: z.coerce.number().min(0, 'Billing rate cannot be negative').default(0),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().nullable(),
  role: z.enum(VALID_ROLES).optional(),
  title: z.string().trim().optional().nullable(),
  initials: z.string().trim().max(10).optional(),
  department: z.string().trim().optional().nullable(),
  billingRate: z.coerce.number().min(0).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive'], {
    errorMap: () => ({ message: "Status must be either 'Active' or 'Inactive'" }),
  }),
});

export const userQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(VALID_ROLES).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;

