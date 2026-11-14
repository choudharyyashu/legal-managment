export interface MissingFieldFlag {
  placeholderTag: string;
  sourceEntity: string;
  sourceField: string;
  reason: 'MISSING_DATA' | 'INVALID_FORMAT' | 'NULL_VALUE';
  description: string;
  isRequired?: boolean;
  sourceRecordType?: string;
  sourceRecordNavigationUrl?: string;
  suggestedTaskTitle?: string;
  suggestedTaskDescription?: string;
  suggestedPriority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DraftValidationResult {
  isValid: boolean;
  canGenerate: boolean;
  templateCode: string;
  templateName: string;
  versionNumber: string;
  matterNumber: string;
  clientName: string;
  totalFieldsCount: number;
  missingFieldsCount: number;
  missingRequiredCount: number;
  missingOptionalCount: number;
  missingFields: MissingFieldFlag[];
  optionalMissingFields: MissingFieldFlag[];
  resolvedPreview: Record<string, string | number | boolean>;
}

export interface DocumentDraftResponse {
  id: string;
  draftCode: string;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  clientId: string;
  clientNumber?: string | null;
  clientName?: string | null;
  templateId: string;
  templateCode?: string | null;
  templateName?: string | null;
  templateVersionId: string;
  versionNumber?: string | null;
  title: string;
  status: string;
  docxStorageKey: string | null;
  pdfStorageKey: string | null;
  hasPdf: boolean;
  missingFieldsFlags: MissingFieldFlag[];
  generatedByUserId: string;
  generatedByName?: string | null;
  reviewedByUserId: string | null;
  reviewedByName?: string | null;
  reviewedAt: string | null;
  hasManualEdits: boolean;
  isStale: boolean;
  finalDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftListQuery {
  page?: number;
  limit?: number;
  matterId?: string;
  clientId?: string;
  status?: string;
  search?: string;
}

export interface TransmissionEvidence {
  transmissionId: string;
  draftId?: string;
  documentId?: string | null;
  draftCode: string;
  versionLabel?: string;
  sha256Checksum?: string;
  channel: 'EMAIL' | 'PORTAL' | 'CERTIFIED_MAIL' | 'FAX' | 'MANUAL_HAND_DELIVERY';
  recipient: {
    name: string;
    email?: string;
    mailingAddress?: string;
    fax?: string;
    organization?: string;
  };
  sentByUserId: string;
  sentByName?: string | null;
  sentAt: string;
  sendStatus: 'SENT' | 'FAILED';
  deliveryStatus: 'PENDING_CONFIRMATION' | 'DELIVERED' | 'UNDELIVERED' | 'BOUNCED';
  notes?: string;
}

export interface DraftApprovalResult {
  draft: DocumentDraftResponse;
  finalDocument: any;
  completedTasksCount: number;
}

export interface DraftRejectionResult {
  draft: DocumentDraftResponse;
  correctionTask: any;
  rejectionReason: string;
}

export interface DraftSendResult {
  draft: DocumentDraftResponse;
  transmission: TransmissionEvidence;
}


