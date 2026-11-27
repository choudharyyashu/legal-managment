/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Document Automation Engine — Event-Driven Auto Draft Types (Phase 4)
 * Reference: Utah Rules of Professional Conduct (Utah RPC 1.1, 1.3, 1.4, 1.10)
 */

export const DOCUMENT_EVENT = {
  PI_ACCIDENT_SAVED: 'pi.accident.saved',
  PI_PROVIDER_ADDED: 'pi.provider.added',
  PI_MISSING_RECORDS: 'pi.missing.records',
  PI_DEMAND_READY: 'pi.demand.ready',
  PI_LIEN_PAYOFF_RECORDED: 'pi.lien_payoff.recorded',
  // Phase 3.A Approved Events
  INTAKE_CONSULTATION_BOOKED: 'intake.consultation.booked',
  INTAKE_CONSULTATION_RESCHEDULED: 'intake.consultation.rescheduled',
  INTAKE_PROSPECT_SAVED: 'intake.prospect.saved',
  INTAKE_CONFLICT_SEARCH_COMPLETED: 'intake.conflict_search.completed',
  MATTER_CREATED_FROM_INTAKE: 'matter.created_from_intake',
  EVICTION_CLOSURE_REVIEWED: 'evictions.closure.reviewed',
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

export interface DemandReadyPayload {
  matterId: string;
  demandPackageId?: string;
  settlementDemandId?: string;
  insuranceClaimId?: string;
  requestedBy?: string;
  demandTitle?: string;
  totalSpecialDamages?: number;
  totalGeneralDamages?: number;
  demandAmount?: number;
  policyLimit?: number;
  recipientCarrier?: string;
  claimNumber?: string;
  deadlineDate?: string;
  customOverrides?: Record<string, any>;
}

export interface ConsultationBookedPayload {
  intakeId: string;
  matterId?: string;
  clientId?: string;
  prospectiveClient?: string;
  consultationDate: string;
  consultationTime?: string;
  location?: string;
  attorneyId?: string;
  attorneyName?: string;
  preparationInstructions?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  customOverrides?: Record<string, any>;
}

export interface ConsultationRescheduledPayload extends ConsultationBookedPayload {
  previousConsultationDate?: string;
  rescheduleReason?: string;
  previousDraftId?: string;
  previousDraftCode?: string;
}

export interface ProspectSavedPayload {
  intakeId: string;
  matterId?: string;
  clientId?: string;
  prospectiveClient: string;
  practiceAreaId?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  adverseParties?: string;
  matterSummary?: string;
  customOverrides?: Record<string, any>;
}

export interface ConflictSearchCompletedPayload {
  intakeId: string;
  matterId?: string;
  clientId?: string;
  prospectiveClient?: string;
  queriedTerms: string[];
  conflictStatus: string;
  hasConflicts: boolean;
  matches: Array<{
    id?: string;
    entityType?: string;
    displayName?: string;
    queriedTerm?: string;
    status?: string;
  }>;
  searchedByUserId?: string;
  customOverrides?: Record<string, any>;
}

export interface MatterCreatedFromIntakePayload {
  intakeId: string;
  intakeNumber: string;
  matterId: string;
  matterNumber: string;
  matterTitle: string;
  clientId: string;
  clientName: string;
  practiceAreaId?: string;
  responsibleAttorneyId?: string;
  customOverrides?: Record<string, any>;
}

export interface EvictionClosureReviewedPayload {
  matterId: string;
  evictionCaseId?: string;
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;
  judgmentAmount: number;
  totalCollected: number;
  outstandingBalance: number;
  closureReviewNotes?: string;
  customOverrides?: Record<string, any>;
}

export interface LienPayoffPayload {
  matterId: string;
  lienId?: string;
  lienholderName: string;
  category?: string;
  assertedAmount?: number;
  agreedAmount: number;
  paymentInstructions?: string;
  releaseTerms?: string;
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

