export interface ReconciliationStatusResponse {
  reconciliationMonth: string;
  bankStatementBalance: number;
  depositsInTransit: number;
  outstandingChecks: number;
  adjustedBankBalance: number;
  /**
   * Net debit–credit balance of all GeneralLedgerEntry rows for account 1010 in the period.
   * Returns 0 when glDataAvailable is false (no qualifying entries found).
   * Consumers MUST check glDataAvailable before treating this as a real balance.
   */
  glTrustLiabilityBalance: number;
  /**
   * True when at least one GeneralLedgerEntry for account 1010 was found and used to
   * calculate glTrustLiabilityBalance.  False means the GL has no entries for this account
   * and the reconciliation is INCOMPLETE — it cannot be declared balanced.
   */
  glDataAvailable: boolean;
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

