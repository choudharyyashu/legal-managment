export interface ReconciliationStatusResponse {
  reconciliationMonth: string;
  bankStatementBalance: number;
  depositsInTransit: number;
  outstandingChecks: number;
  adjustedBankBalance: number;
  /**
   * Net balance of GeneralLedgerEntry rows for Pillar 2 control accounts:
   * Account 2100 (Client Trust Liability, credit-normal) or Account 1020 (IOLTA Trust Bank Asset, debit-normal).
   * Note: Account 1010 is strictly the Operating Cash Account and is excluded to prevent commingling.
   * Returns 0 when glDataAvailable is false (no qualifying entries found).
   * Consumers MUST check glDataAvailable before treating this as a real balance.
   */
  glTrustLiabilityBalance: number;
  /**
   * True when at least one GeneralLedgerEntry for trust accounts (2100/1020) was found and used to
   * calculate glTrustLiabilityBalance. False means the GL has no entries for trust accounts
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

