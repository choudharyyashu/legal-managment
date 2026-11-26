export interface TrustTransactionResponse {
  id: string;
  trustSubLedgerId: string;
  transactionType: string;
  amount: number;
  runningBalance: number;
  sourceReference: string;
  authorizedByUserId: string;
  authorizedByName?: string | null;
  purpose: string;
  createdAt: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  clientName?: string | null;
}

export interface TrustSubLedgerResponse {
  id: string;
  ledgerCode: string;
  clientId: string;
  clientNumber?: string | null;
  clientName?: string | null;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  balance: number;
  lastAuditDate: string;
  createdAt: string;
  updatedAt: string;
  transactions?: TrustTransactionResponse[];
}

export interface TrustLedgerListQuery {
  page?: number;
  limit?: number;
  clientId?: string;
  matterId?: string;
}

export interface TrustTransactionListQuery {
  page?: number;
  limit?: number;
  offset?: number;
  month?: string;
  startDate?: string;
  endDate?: string;
  trustSubLedgerId?: string;
}


