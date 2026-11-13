export interface TemplateVersionResponse {
  id: string;
  templateId: string;
  versionNumber: string;
  docxStorageKey: string;
  sha256Checksum: string;
  status: string;
  changeSummary: string | null;
  createdById: string;
  createdByName?: string | null;
  createdAt: string;
  fieldMappingsCount?: number;
}

export interface DocumentFieldMappingResponse {
  id: string;
  templateVersionId: string;
  placeholderTag: string;
  sourceEntity: string;
  sourceField: string;
  isRequired: boolean;
  defaultValue: string | null;
  formattingRule: string | null;
  conditionalExpression: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplateResponse {
  id: string;
  templateCode: string;
  templateName: string;
  description: string | null;
  practiceAreaId: string;
  practiceAreaCode?: string | null;
  practiceAreaName?: string | null;
  category: string;
  outputFormat: string;
  currentVersion: string;
  isActive: boolean;
  isSystemDefault: boolean;
  createdById: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: TemplateVersionResponse[];
  fieldMappings?: DocumentFieldMappingResponse[];
  draftsCount?: number;
}

export interface TemplateListQuery {
  page?: number;
  limit?: number;
  practiceAreaId?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
}

