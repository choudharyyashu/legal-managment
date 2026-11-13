export interface ReconciliationStatusResponse {
  reconciliationMonth: string;
  bankStatementBalance: number;
  depositsInTransit: number;
  outstandingChecks: number;
  adjustedBankBalance: number;
  glTrustLiabilityBalance: number;
  clientSubledgersTotalBalance: number;
  reconciliationVariance: number;
  isBalanced: boolean;
  activeClientLedgersCount: number;
}

export interface ReconciliationRecordResponse {
  id: string;
  reconciliationMonth: string;
  bankStatementBalance: number;
  depositsInTransit: number;
  outstandingChecks: number;
  adjustedBankBalance: number;
  glTrustLiabilityBalance: number;
  clientSubledgersTotalBalance: number;
  reconciliationVariance: number;
  isBalanced: boolean;
  auditedByUserId: string;
  auditedByName?: string | null;
  reconciledAt: string;
}

