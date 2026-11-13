export interface MissingFieldFlag {
  placeholderTag: string;
  sourceEntity: string;
  sourceField: string;
  reason: 'MISSING_DATA' | 'INVALID_FORMAT' | 'NULL_VALUE';
  description: string;
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
  missingFields: MissingFieldFlag[];
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
