/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Domain Types
 */

export interface IncidentInput {
  incidentDate?: string | null;
  incidentTime?: string | null;
  incidentLocation?: string | null;
  accidentType?: string | null;
  description?: string | null;
  policeAgency?: string | null;
  reportNumber?: string | null;
  investigatingOfficer?: string | null;
  liabilityAssessment?: string | null;
  plaintiffFaultPercentage?: number | null;
  adverseFaultPercentage?: number | null;
  notes?: string | null;
  insurancePolicy?: InsurancePolicyInput | null;
}

export interface InsurancePolicyInput {
  coverageType?: string | null;
  insuranceCompany: string;
  policyNumber?: string | null;
  claimNumber?: string | null;
  adjusterName?: string | null;
  adjusterPhone?: string | null;
  adjusterEmail?: string | null;
  adjusterFax?: string | null;
  insuredName?: string | null;
  policyLimits?: string | null;
  status?: string | null;
}

export interface MedicalProviderInput {
  providerName: string;
  providerType?: string | null;
  facilityAddress?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  treatmentStartDate?: string | null;
  treatmentEndDate?: string | null;
  notes?: string | null;
  requestAuthorization?: boolean | null;
  requestRecords?: boolean | null;
}

export interface MarkIncompleteInput {
  deficiencyNotes: string;
  outstandingRecords?: string[];
  daysOverdue?: number;
}
