/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Domain Types
 */

export interface IncidentInput {
  incidentDate?: string;
  incidentTime?: string;
  incidentLocation?: string;
  accidentType?: string;
  description?: string;
  policeAgency?: string;
  reportNumber?: string;
  investigatingOfficer?: string;
  liabilityAssessment?: string;
  plaintiffFaultPercentage?: number;
  adverseFaultPercentage?: number;
  notes?: string;
  insurancePolicy?: InsurancePolicyInput;
}

export interface InsurancePolicyInput {
  coverageType?: string;
  insuranceCompany: string;
  policyNumber?: string;
  claimNumber?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  adjusterFax?: string;
  insuredName?: string;
  policyLimits?: string;
  status?: string;
}

export interface MedicalProviderInput {
  providerName: string;
  providerType?: string;
  facilityAddress?: string;
  phone?: string;
  fax?: string;
  email?: string;
  treatmentStartDate?: string;
  treatmentEndDate?: string;
  notes?: string;
  requestAuthorization?: boolean;
  requestRecords?: boolean;
}

export interface MarkIncompleteInput {
  deficiencyNotes: string;
  outstandingRecords?: string[];
  daysOverdue?: number;
}
