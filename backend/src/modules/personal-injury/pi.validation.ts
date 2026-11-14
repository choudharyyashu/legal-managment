import { z } from 'zod';

export const insurancePolicySchema = z.object({
  coverageType: z.string().max(50).default('Liability'),
  insuranceCompany: z.string().min(1, 'Insurance company name is required').max(200),
  policyNumber: z.string().max(100).optional(),
  claimNumber: z.string().max(100).optional(),
  adjusterName: z.string().max(150).optional(),
  adjusterPhone: z.string().max(50).optional(),
  adjusterEmail: z.string().email().max(150).optional().or(z.literal('')),
  adjusterFax: z.string().max(50).optional(),
  insuredName: z.string().max(150).optional(),
  policyLimits: z.string().max(100).optional(),
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
