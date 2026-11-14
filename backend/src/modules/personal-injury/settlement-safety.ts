/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Settlement Immutability & Cross-Matter Safety Module
 *
 * Enforces business logic and integrity rules for:
 * 1. Settlement version immutability (prevent update/delete of finalized versions).
 * 2. Finalization transitions (ensuring attorney approval and client signatures).
 * 3. Cross-matter boundary protection (disbursement-to-subledger and lien-to-matter alignment).
 * 4. Exact Decimal sum reconciliation (Gross = Fee + Costs + Advances + Liens + Other + Net Client).
 */

import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';

export interface SettlementVersionFinancials {
  grossSettlementAmount: Prisma.Decimal | number | string;
  calculatedAttorneyFee: Prisma.Decimal | number | string;
  totalLitigationCosts: Prisma.Decimal | number | string;
  totalClientAdvances?: Prisma.Decimal | number | string;
  totalMedicalLiens: Prisma.Decimal | number | string;
  otherDeductions?: Prisma.Decimal | number | string;
  netClientRecovery: Prisma.Decimal | number | string;
}

export interface FinalizeSettlementInput {
  approvedByAttorneyId: string;
  approvedAt: Date | string;
  clientApprovalDate: Date | string;
  signedClosingStatementDocId?: string;
  clientApprovalEvidence?: string;
}

export class SettlementSafetyValidator {
  /**
   * Asserts that a settlement version is in a mutable state.
   * Rejects any update if the version is already immutable.
   */
  static assertVersionMutable(version: { isImmutable: boolean; versionStatus?: string; id?: string }): void {
    if (version.isImmutable) {
      throw AppError.badRequest(
        `Execution Blocked: Settlement version ${version.id || ''} is finalized and immutable. Modifications are prohibited.`,
        'SETTLEMENT_VERSION_IMMUTABLE'
      );
    }
  }

  /**
   * Asserts that a settlement version can be safely deleted.
   * Forbids deletion of finalized, approved, or executed versions.
   */
  static assertVersionDeletable(version: {
    isImmutable: boolean;
    versionStatus?: string;
    executionRecord?: any;
    id?: string;
  }): void {
    if (version.isImmutable) {
      throw AppError.badRequest(
        `Audit Violation: Finalized settlement version ${version.id || ''} cannot be deleted.`,
        'SETTLEMENT_VERSION_CANNOT_DELETE'
      );
    }
    if (version.executionRecord) {
      throw AppError.badRequest(
        `Audit Violation: Executed settlement version ${version.id || ''} cannot be deleted.`,
        'SETTLEMENT_ALREADY_EXECUTED'
      );
    }
    if (version.versionStatus === 'FINALIZED' || version.versionStatus === 'ATTORNEY_APPROVED') {
      throw AppError.badRequest(
        `Integrity Violation: Approved settlement version cannot be deleted. Transition to revised version instead.`,
        'SETTLEMENT_APPROVED_CANNOT_DELETE'
      );
    }
  }

  /**
   * Validates prerequisites for finalizing a settlement version and marking it immutable.
   * Ensures that attorney approval and client signature evidence are verified,
   * and that financial numbers are not altered during finalization.
   */
  static validateFinalizationTransition(
    currentVersion: {
      isImmutable: boolean;
      grossSettlementAmount: any;
      calculatedAttorneyFee: any;
      netClientRecovery: any;
    },
    input: FinalizeSettlementInput,
    updatedFinancials?: Partial<SettlementVersionFinancials>
  ): void {
    this.assertVersionMutable(currentVersion);

    if (!input.approvedByAttorneyId) {
      throw AppError.badRequest(
        'Finalization failed: An authorized attorney approval ID is required.',
        'MISSING_ATTORNEY_APPROVAL'
      );
    }

    if (!input.approvedAt) {
      throw AppError.badRequest(
        'Finalization failed: Valid attorney approval timestamp is required.',
        'MISSING_APPROVAL_TIMESTAMP'
      );
    }

    if (!input.clientApprovalDate) {
      throw AppError.badRequest(
        'Finalization failed: Client closing statement approval date is required.',
        'MISSING_CLIENT_APPROVAL_DATE'
      );
    }

    if (!input.signedClosingStatementDocId && !input.clientApprovalEvidence) {
      throw AppError.badRequest(
        'Finalization failed: A signed closing statement document or verifiable client evidence must be attached.',
        'MISSING_CLIENT_EVIDENCE'
      );
    }

    // Verify financial values are not altered during the finalization step
    if (updatedFinancials) {
      const grossCurrent = new Prisma.Decimal(currentVersion.grossSettlementAmount);
      const grossUpdated = new Prisma.Decimal(
        updatedFinancials.grossSettlementAmount ?? currentVersion.grossSettlementAmount
      );
      if (!grossCurrent.equals(grossUpdated)) {
        throw AppError.badRequest(
          'Security Violation: Financial figures cannot be modified during the finalization transition. Revise draft in a new version.',
          'CANNOT_MODIFY_FINANCIALS_AT_FINALIZATION'
        );
      }
    }
  }

  /**
   * Enforces cross-matter alignment between Settlement Disbursement and TrustSubLedger.
   */
  static validateCrossMatterSubledger(settlementMatterId: string, subLedgerMatterId: string): void {
    if (!settlementMatterId || !subLedgerMatterId || settlementMatterId !== subLedgerMatterId) {
      throw AppError.badRequest(
        `Integrity Violation: TrustSubLedger matter (${subLedgerMatterId}) does not match Settlement Disbursement matter (${settlementMatterId}).`,
        'CROSS_MATTER_SUBLEDGER_MISMATCH'
      );
    }
  }

  /**
   * Enforces cross-matter alignment between Settlement Disbursement and a Lien payoff.
   */
  static validateCrossMatterLien(settlementMatterId: string, lienMatterId: string, lienId: string): void {
    if (!settlementMatterId || !lienMatterId || settlementMatterId !== lienMatterId) {
      throw AppError.badRequest(
        `Integrity Violation: Lien ${lienId} belongs to Matter ${lienMatterId}, but disbursement is on Matter ${settlementMatterId}. Cross-matter lien payout is prohibited.`,
        'CROSS_MATTER_LIEN_MISMATCH'
      );
    }
  }

  /**
   * Validates exact mathematical reconciliation using arbitrary precision Decimal arithmetic.
   * Formula: Gross = Attorney Fee + Costs + Advances + Liens + Other Deductions + Client Net Recovery
   */
  static validateSettlementSum(params: {
    grossSettlementAmount: Prisma.Decimal | number | string;
    calculatedAttorneyFee: Prisma.Decimal | number | string;
    totalLitigationCosts: Prisma.Decimal | number | string;
    totalClientAdvances?: Prisma.Decimal | number | string;
    lienPayoffAmounts: (Prisma.Decimal | number | string)[];
    otherDeductions?: Prisma.Decimal | number | string;
    netClientRecovery: Prisma.Decimal | number | string;
  }): { isValid: boolean; totalAllocated: Prisma.Decimal; gross: Prisma.Decimal } {
    const gross = new Prisma.Decimal(params.grossSettlementAmount);
    const fee = new Prisma.Decimal(params.calculatedAttorneyFee);
    const costs = new Prisma.Decimal(params.totalLitigationCosts);
    const advances = new Prisma.Decimal(params.totalClientAdvances || 0);
    const other = new Prisma.Decimal(params.otherDeductions || 0);
    const netClient = new Prisma.Decimal(params.netClientRecovery);

    const totalLiens = params.lienPayoffAmounts.reduce<Prisma.Decimal>((acc, cur) => {
      return acc.plus(new Prisma.Decimal(cur));
    }, new Prisma.Decimal(0));

    const totalAllocated = fee.plus(costs).plus(advances).plus(totalLiens).plus(other).plus(netClient);

    if (!totalAllocated.equals(gross)) {
      throw AppError.badRequest(
        `Settlement Reconciliation Error: Total disbursements ($${totalAllocated.toFixed(2)}) do not match Gross Settlement ($${gross.toFixed(2)}).`,
        'SETTLEMENT_SUM_MISMATCH'
      );
    }

    return { isValid: true, totalAllocated, gross };
  }

  /**
   * Prepares payload for creating a new version while preserving the old version immutable and untouched.
   */
  static prepareNewDraftVersion(
    previousVersion: {
      settlementDisbursementId: string;
      grossSettlementAmount: any;
      contingencyFeePercentage: any;
      calculatedAttorneyFee: any;
      totalLitigationCosts: any;
      totalClientAdvances: any;
      totalMedicalLiens: any;
      otherDeductions: any;
      netClientRecovery: any;
    },
    newVersionNumber: number,
    createdByUserId: string
  ) {
    return {
      settlementDisbursementId: previousVersion.settlementDisbursementId,
      versionNumber: newVersionNumber,
      grossSettlementAmount: previousVersion.grossSettlementAmount,
      contingencyFeePercentage: previousVersion.contingencyFeePercentage,
      calculatedAttorneyFee: previousVersion.calculatedAttorneyFee,
      totalLitigationCosts: previousVersion.totalLitigationCosts,
      totalClientAdvances: previousVersion.totalClientAdvances,
      totalMedicalLiens: previousVersion.totalMedicalLiens,
      otherDeductions: previousVersion.otherDeductions,
      netClientRecovery: previousVersion.netClientRecovery,
      versionStatus: 'DRAFT',
      isImmutable: false,
      signedClosingStatementDocId: null,
      clientApprovalDate: null,
      clientApprovalEvidence: null,
      approvedByAttorneyId: null,
      approvedAt: null,
      createdByUserId,
    };
  }
}
