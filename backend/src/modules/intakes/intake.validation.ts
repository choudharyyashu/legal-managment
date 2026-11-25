import { z } from 'zod';

export const createIntakeSchema = z.object({
  prospectiveClient: z.string().min(2).max(255),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(50),
  practiceAreaId: z.string().max(50).optional(),
  adverseParties: z.string().min(2),
  matterSummary: z.string().min(5),
  disputeAmount: z.coerce.number().nonnegative().optional().default(0),
  jurisdictionVenue: z.string().max(255).optional(),
});

export const updateIntakeSchema = z.object({
  prospectiveClient: z.string().min(2).max(255).optional(),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(50).optional(),
  practiceAreaId: z.string().max(50).optional(),
  adverseParties: z.string().min(2).optional(),
  matterSummary: z.string().min(5).optional(),
  disputeAmount: z.coerce.number().nonnegative().optional(),
  jurisdictionVenue: z.string().max(255).optional(),
});

export const clearConflictSchema = z.object({
  status: z.enum([
    'Cleared',
    'Conflict Identified',
    'Waiver Obtained',
    'In Review',
    'NOT_SEARCHED',
    'POTENTIAL_MATCH',
    'REVIEW_COMPLETED',
    'Not Started',
    'Review Completed',
  ]),
  notes: z.string().min(3),
});

export const convertToIntakeClientSchema = z.object({
  assignedAttorneyId: z.string().uuid().optional(),
  clientType: z.enum(['Organization', 'Individual', 'Trust / Estate', 'Government / Public']).default('Individual'),
});

export const convertToIntakeMatterSchema = z.object({
  clientId: z.string().uuid().optional(),
  responsibleAttorneyId: z.string().uuid(),
  assignedStaffId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(2).max(255).optional(),
  practiceAreaId: z.string().trim().max(50).optional(),
  status: z.enum(['Active', 'In Discovery', 'Trial Prep', 'On Hold', 'Concluded']).optional(),
  billingType: z.enum(['Hourly', 'Flat Fee', 'Contingency']),
  hourlyRate: z.coerce.number().positive().optional().nullable(),
  flatFeeAmount: z.coerce.number().positive().optional().nullable(),
  contingencyPercentage: z.coerce.number().positive().max(100).optional().nullable(),
  budget: z.coerce.number().min(0).optional(),
  openDate: z.string().optional(),
  statuteOfLimitations: z.string().optional().nullable(),
  nextCourtDate: z.string().optional().nullable(),
  courtName: z.string().trim().max(255).optional().nullable(),
  judge: z.string().trim().max(150).optional().nullable(),
  caseDocketNumber: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  isEthicalWallEnabled: z.boolean().optional(),
  ethicalWallExcludedRole: z.string().trim().max(100).optional().nullable(),
});

export const intakeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  conflictStatus: z.string().optional(),
  practiceAreaId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'prospectiveClient', 'intakeNumber', 'conflictStatus']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateIntakeInput = z.infer<typeof createIntakeSchema>;
export type UpdateIntakeInput = z.infer<typeof updateIntakeSchema>;
export type ClearConflictInput = z.infer<typeof clearConflictSchema>;
export type ConvertToIntakeClientInput = z.infer<typeof convertToIntakeClientSchema>;
export type ConvertToIntakeMatterInput = z.infer<typeof convertToIntakeMatterSchema>;
