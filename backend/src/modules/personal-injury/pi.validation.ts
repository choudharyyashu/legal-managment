import { z } from 'zod';

export const insurancePolicySchema = z.object({
  incidentId: z.string().uuid('Invalid incident UUID format').optional().nullable(),
  coverageType: z.string().max(50).default('Liability'),
  insuranceCompany: z.string().min(1, 'Insurance company name is required').max(200),
  policyNumber: z.string().max(100).optional().nullable(),
  claimNumber: z.string().max(100).optional().nullable(),
  adjusterName: z.string().max(150).optional().nullable(),
  adjusterPhone: z.string().max(50).optional().nullable(),
  adjusterEmail: z.string().email().max(150).optional().or(z.literal('')).nullable(),
  adjusterFax: z.string().max(50).optional().nullable(),
  insuredName: z.string().max(150).optional().nullable(),
  policyLimits: z.string().max(100).optional().nullable(),
  status: z.string().max(30).default('Active'),
});

export const incidentSchema = z.object({
  incidentDate: z.string().optional().nullable(),
  incidentTime: z.string().max(20).optional().nullable(),
  incidentLocation: z.string().max(255).optional().nullable(),
  accidentType: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  policeAgency: z.string().max(150).optional().nullable(),
  reportNumber: z.string().max(100).optional().nullable(),
  investigatingOfficer: z.string().max(150).optional().nullable(),
  liabilityAssessment: z.string().max(50).optional().nullable(),
  plaintiffFaultPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  adverseFaultPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  insurancePolicy: insurancePolicySchema.optional().nullable(),
});

export const medicalProviderSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required').max(200),
  providerType: z.string().max(100).optional().nullable(),
  facilityAddress: z.string().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  fax: z.string().max(50).optional().nullable(),
  email: z.string().email().max(150).optional().or(z.literal('')).nullable(),
  treatmentStartDate: z.string().optional().nullable(),
  treatmentEndDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  requestAuthorization: z.boolean().optional().default(true),
  requestRecords: z.boolean().optional().default(true),
});

export const markIncompleteSchema = z.object({
  deficiencyNotes: z.string().min(1, 'Deficiency explanation is required'),
  outstandingRecords: z.array(z.string()).optional().default([]),
  daysOverdue: z.coerce.number().int().positive().optional().default(30),
});

export const demandPackageSchema = z.object({
  demandTitle: z.string().min(1, 'Demand title is required').max(255),
  recipientCarrier: z.string().min(1, 'Recipient insurance carrier is required').max(200),
  claimNumber: z.string().max(100).optional().nullable(),
  insurancePolicyId: z.string().uuid('Invalid insurance policy UUID format').optional().nullable(),
  demandedAmount: z.union([z.number(), z.string()]).refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, 'Demanded amount must be a positive decimal value'),
  policyLimitAmount: z.union([z.number(), z.string()]).optional().nullable().refine((val) => {
    if (val === undefined || val === null || val === '') return true;
    const num = Number(val);
    return !isNaN(num) && num >= 0;
  }, 'Policy limit amount must be a non-negative decimal value'),
  isPolicyLimitDemand: z.boolean().optional().default(false),
  deadlineDate: z.string().min(1, 'Deadline date is required').refine((val) => !isNaN(Date.parse(val)), 'Invalid deadline date format'),
  status: z.string().max(50).optional().default('DRAFTING'),
  counterOfferAmount: z.union([z.number(), z.string()]).optional().nullable(),
  checklistState: z.record(z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
  emitDemandReady: z.boolean().optional().default(false),
});

export const signAuthorizationSchema = z.object({
  authorizationDocumentId: z
    .string({
      required_error: 'authorizationDocumentId is required',
      invalid_type_error: 'authorizationDocumentId must be a string',
    })
    .min(1, 'authorizationDocumentId cannot be empty'),
  signatureDate: z
    .string({
      required_error: 'signatureDate is required',
      invalid_type_error: 'signatureDate must be a string',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'signatureDate must be in YYYY-MM-DD format')
    .refine(
      (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d <= today;
      },
      {
        message: 'signatureDate cannot be in the future',
      }
    ),
  notes: z.string().max(1000).optional(),
});

export type SignAuthorizationInput = z.infer<typeof signAuthorizationSchema>;
