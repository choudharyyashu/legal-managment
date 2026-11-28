export interface ClientPortalUser {
  id: string;
  clientId: string;
  email: string;
  name: string;
  clientNumber: string;
  role: 'client';
}

export interface ClientPortalAuthToken {
  token: string;
  expiresIn: string;
  client: ClientPortalUser;
}

export interface ClientPortalMatterSummary {
  id: string;
  matterNumber: string;
  title: string;
  practiceArea: string;
  status: string;
  responsibleAttorney: {
    id: string;
    name: string;
    email: string;
  } | null;
  openedDate: string;
  stageName: string;
}

export interface ClientPortalDocument {
  id: string;
  matterId: string;
  title: string;
  documentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  requiresSignature: boolean;
  isSigned: boolean;
  signedAt?: string;
  signedBy?: string;
}

export interface ClientPortalMessage {
  id: string;
  matterId: string;
  senderType: 'CLIENT' | 'ATTORNEY' | 'STAFF';
  senderName: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

export interface ClientPortalInvoiceSummary {
  id: string;
  invoiceNumber: string;
  matterNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE';
}

export interface ClientPortalSignaturePayload {
  documentId: string;
  signerName: string;
  signatureImageBase64?: string;
  ipAddress?: string;
  userAgent?: string;
}
