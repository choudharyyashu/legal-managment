/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Safe Document Regeneration & Change Propagation Types (Phase 6)
 * Reference: Utah Rules of Professional Conduct (Utah RPC 1.1, 1.3, 1.4, 1.10)
 */

export interface FieldDiffItem {
  field: string;
  sourceEntity: string;
  previousValue: any;
  currentValue: any;
  changeType: 'MODIFIED' | 'ADDED' | 'REMOVED' | 'UNCHANGED';
}

export interface DocumentDiffComparison {
  previousDraftId: string;
  previousDraftCode: string;
  candidateDraftId: string;
  candidateDraftCode: string;
  matterId: string;
  matterNumber: string;
  templateCode: string;
  hasManualEdits: boolean;
  manualEditsWarning?: string;
  sourceChangesDetected: boolean;
  changedFieldsCount: number;
  changedFields: FieldDiffItem[];
  recommendation: 'REVIEW_MANUAL_EDITS' | 'SAFE_TO_ACCEPT' | 'NO_CHANGES_DETECTED';
}

export interface DetectChangesInput {
  matterId: string;
  changedEntity: 'Client' | 'Matter' | 'Incident' | 'Insurance' | 'MedicalProvider' | 'MedicalRecords';
  changedFields: Record<string, any>;
  changeSummary?: string;
}

export interface CandidateGenerationResult {
  previousDraftId: string;
  previousDraftCode: string;
  candidateDraftId: string;
  candidateDraftCode: string;
  comparison: DocumentDiffComparison;
}

