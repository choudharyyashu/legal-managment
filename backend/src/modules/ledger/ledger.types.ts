export interface ChartOfAccountResponse {
  accountNumber: number;
  accountName: string;
  accountType: string;
  isActive: boolean;
  totalDebit?: number;
  totalCredit?: number;
  balance?: number;
}

export interface TrialBalanceItem {
  accountNumber: number;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalanceResponse {
  asOfDate: string;
  accounts: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  variance: number;
}

export interface JournalQueryInput {
  startDate?: string;
  endDate?: string;
  accountNumber?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GeneralLedgerEntryResponse {
  id: string;
  accountNumber: number;
  accountName?: string | null;
  debit: number;
  credit: number;
  matterId?: string | null;
  matterNumber?: string | null;
}

export interface GeneralLedgerJournalResponse {
  id: string;
  journalNumber: string;
  transactionDate: string;
  memo: string;
  createdByUserId: string;
  createdByName?: string | null;
  createdAt: string;
  totalDebit: number;
  totalCredit: number;
  entries?: GeneralLedgerEntryResponse[];
}

