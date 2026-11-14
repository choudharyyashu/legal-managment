/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Document Automation Engine — Event-Driven Auto Draft Types (Phase 4)
 * Reference: Utah Rules of Professional Conduct (Utah RPC 1.1, 1.3, 1.4, 1.10)
 */

export const DOCUMENT_EVENT = {
  PI_ACCIDENT_SAVED: 'pi.accident.saved',
  PI_PROVIDER_ADDED: 'pi.provider.added',
  PI_MISSING_RECORDS: 'pi.missing.records',
} as const;

export type DocumentEventType = typeof DOCUMENT_EVENT[keyof typeof DOCUMENT_EVENT];

export interface AccidentSavedPayload {
  matterId: string;
  incidentDate?: string;
  incidentTime?: string;
  incidentLocation?: string;
  accidentType?: string;
  description?: string;
  policeAgency?: string;
  reportNumber?: string;
  investigatingOfficer?: string;
  insuranceCompany?: string;
  claimNumber?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  liabilityAssessment?: string;
  witnesses?: Array<{ name: string; phone?: string; statement?: string }>;
  customOverrides?: Record<string, any>;
}

export interface ProviderAddedPayload {
  matterId: string;
  providerName: string;
  providerType?: string;
  facilityAddress?: string;
  phone?: string;
  fax?: string;
  email?: string;
  treatmentDates?: string;
  recordsStatus?: 'Requested' | 'Missing / Overdue' | 'Received' | 'Not Requested';
  requestAuthorization?: boolean;
  requestRecords?: boolean;
  customOverrides?: Record<string, any>;
}

export interface MissingRecordsPayload {
  matterId: string;
  providerName: string;
  requestDate?: string;
  daysOverdue?: number;
  outstandingRecords?: string[];
  lastFollowUpDate?: string;
  followUpNotes?: string;
  customOverrides?: Record<string, any>;
}

export interface AutoDraftTriggerResult {
  success: boolean;
  event: DocumentEventType;
  matterId: string;
  draftsCreated: Array<{
    id: string;
    draftCode: string;
    templateCode: string;
    templateName: string;
    title: string;
    missingFieldsCount: number;
    filePath: string;
  }>;
  skipped: Array<{
    templateCode?: string;
    reason: string;
  }>;
  errors: string[];
}

