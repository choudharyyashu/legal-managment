import { z } from 'zod';

export const MATTER_STATUSES = [
  'Active',
  'In Discovery',
  'Trial Prep',
  'On Hold',
  'Concluded',
] as const;

export const BILLING_TYPES = ['Hourly', 'Flat Fee', 'Contingency'] as const;

export const createMatterSchema = z.object({
  title: z.string().trim().min(2, 'Matter title / caption is required').max(255),
  clientId: z.string().uuid('A valid client UUID is required'),
  practiceAreaId: z.string().min(1, 'Practice Area is required'),
  responsibleAttorneyId: z.string().uuid('A valid lead attorney UUID is required'),
  assignedStaffId: z.string().uuid().optional().nullable(),
  assignedStaffIds: z.array(z.string().uuid()).optional(),
  assignedStaffRole: z.string().trim().max(50).default('paralegal'),
  status: z.enum(MATTER_STATUSES).default('Active'),
  billingType: z.enum(BILLING_TYPES, {
    errorMap: () => ({ message: `Billing type must be one of: ${BILLING_TYPES.join(', ')}` }),
  }),
  hourlyRate: z.coerce.number().min(0).optional().nullable(),
  flatFeeAmount: z.coerce.number().min(0).optional().nullable(),
  contingencyPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  budget: z.coerce.number().min(0).default(0),
  openDate: z.string().optional(),
  statuteOfLimitations: z.string().optional().nullable(),
  nextCourtDate: z.string().optional().nullable(),
  courtName: z.string().trim().max(255).optional().nullable(),
  judge: z.string().trim().max(150).optional().nullable(),
  caseDocketNumber: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  isEthicalWallEnabled: z.boolean().default(false),
  ethicalWallExcludedRole: z.string().trim().max(100).optional().nullable(),
}).refine(
  (data) => {
    if (data.billingType === 'Hourly' && (data.hourlyRate === undefined || data.hourlyRate === null)) {
      return false;
    }
    if (data.billingType === 'Flat Fee' && (data.flatFeeAmount === undefined || data.flatFeeAmount === null)) {
      return false;
    }
    return true;
  },
  {
    message: 'Hourly billing requires an hourly rate; Flat-fee billing requires a flat fee amount.',
    path: ['billingType'],
  }
);

export const updateMatterSchema = z.object({
  title: z.string().trim().min(2).max(255).optional(),
  practiceAreaId: z.string().min(1).optional(),
  responsibleAttorneyId: z.string().uuid().optional(),
  status: z.enum(MATTER_STATUSES).optional(),
  billingType: z.enum(BILLING_TYPES).optional(),
  hourlyRate: z.coerce.number().min(0).optional().nullable(),
  flatFeeAmount: z.coerce.number().min(0).optional().nullable(),
  contingencyPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  budget: z.coerce.number().min(0).optional(),
  statuteOfLimitations: z.string().optional().nullable(),
  nextCourtDate: z.string().optional().nullable(),
  courtName: z.string().trim().max(255).optional().nullable(),
  judge: z.string().trim().max(150).optional().nullable(),
  caseDocketNumber: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  isEthicalWallEnabled: z.boolean().optional(),
  ethicalWallExcludedRole: z.string().trim().max(100).optional().nullable(),
}).refine(
  (data) => {
    if (data.billingType === 'Hourly' && data.hourlyRate === null) {
      return false;
    }
    if (data.billingType === 'Flat Fee' && data.flatFeeAmount === null) {
      return false;
    }
    return true;
  },
  {
    message: 'Hourly billing cannot have a null rate; Flat-fee billing cannot have a null fee amount.',
    path: ['billingType'],
  }
);

export const updateMatterStatusSchema = z.object({
  status: z.enum(MATTER_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${MATTER_STATUSES.join(', ')}` }),
  }),
  currentStageId: z.string().optional().nullable(),
});

export const assignStaffSchema = z.object({
  userId: z.string().uuid('A valid user UUID is required'),
  assignmentRole: z.string().trim().min(2, 'Assignment role must be at least 2 characters').max(50).default('paralegal'),
});

export const matterQuerySchema = z.object({
  search: z.string().trim().optional(),
  clientId: z.string().optional(),
  practiceAreaId: z.string().optional(),
  responsibleAttorneyId: z.string().optional(),
  status: z.enum(MATTER_STATUSES).optional(),
  billingType: z.enum(BILLING_TYPES).optional(),
  sortBy: z.enum(['openDate', 'title', 'matterNumber', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateMatterInput = z.infer<typeof createMatterSchema>;
export type UpdateMatterInput = z.infer<typeof updateMatterSchema>;
export type UpdateMatterStatusInput = z.infer<typeof updateMatterStatusSchema>;
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;
export type MatterQueryInput = z.infer<typeof matterQuerySchema>;

