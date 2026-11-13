export interface ChartOfAccountResponse {
  accountNumber: number;
  accountName: string;
  accountType: string;
  isActive: boolean;
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

