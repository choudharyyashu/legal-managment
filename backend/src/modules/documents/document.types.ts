export interface DocumentVersionResponse {
  id: string;
  versionLabel: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number | string;
  s3StorageKey: string;
  sha256Checksum: string;
  uploadedByUserId: string;
  uploadedByName?: string | null;
  revisionNotes?: string | null;
  uploadedAt: string;
}

export interface DocumentResponse {
  id: string;
  documentCode: string;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  clientId: string;
  clientNumber?: string | null;
  clientName?: string | null;
  title: string;
  category: string;
  currentVersion: string;
  isPrivileged: boolean;
  privilegeType?: string | null;
  ocrContent?: string | null;
  batesNumberStart?: string | null;
  batesNumberEnd?: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: DocumentVersionResponse[];
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  matterId?: string;
  clientId?: string;
  category?: string;
  isPrivileged?: boolean;
  search?: string;
}
