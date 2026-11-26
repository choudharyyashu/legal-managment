import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  SubmitReconciliationInput,
  LiveReconciliationQuery,
  OperatingReconciliationQuery,
  SaveOperatingDraftInput,
  FinalizeOperatingInput,
} from './reconciliation.validation.js';
import {
  ReconciliationStatusResponse,
  ReconciliationRecordResponse,
  OperatingReconciliationStatusResponse,
  OperatingReconciliationHistoryResponse,
  OperatingReconciliationItem,
} from './reconciliation.types.js';

export class ReconciliationService {
  private static formatRecord(rec: any): ReconciliationRecordResponse {
    return {
      id: rec.id,
      reconciliationMonth: rec.reconciliationMonth,
      bankStatementBalance: Number(rec.bankStatementBalance),
      depositsInTransit: Number(rec.depositsInTransit),
      outstandingChecks: Number(rec.outstandingChecks),
      adjustedBankBalance: Number(rec.adjustedBankBalance),
      glTrustLiabilityBalance: Number(rec.glTrustLiabilityBalance),
      clientSubledgersTotalBalance: Number(rec.clientSubledgersTotalBalance),
      reconciliationVariance: Number(rec.reconciliationVariance),
      isBalanced: rec.isBalanced,
      auditedByUserId: rec.auditedByUserId,
      auditedByName: rec.auditedByUser?.name || null,
      reconciledAt: rec.reconciledAt.toISOString(),
    };
  }

  static async calculateLiveStatus(query: LiveReconciliationQuery): Promise<ReconciliationStatusResponse> {
    // 1. Calculate sum of all active client trust sub-ledgers (Pillar 3)
    const subLedgers = await prisma.trustSubLedger.findMany({ select: { balance: true } });
    const clientSubledgersTotalBalance = subLedgers.reduce((sum, l) => sum + Number(l.balance), 0);

    // 2. Calculate GL Trust Liability Balance from Pillar 2 control accounts (Account 2100 Client Trust Liability, or Account 1020 IOLTA Trust Bank)
    //    We deliberately DO NOT query Operating Account 1010 to prevent commingling or operating expense contamination.
    //    We deliberately DO NOT fall back to clientSubledgersTotalBalance when GL entries are absent.
    //    An empty GL is a data-availability problem, not a balanced state.
    const glWhere: any = { accountNumber: { in: [2100, 1020] } };
    if (query.reconciliationMonth && /^\d{4}-\d{2}$/.test(query.reconciliationMonth)) {
      const [year, month] = query.reconciliationMonth.split('-').map(Number);
      const cutoffDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      glWhere.journal = { transactionDate: { lte: cutoffDate } };
    }

    const glEntries = await prisma.generalLedgerEntry.findMany({
      where: glWhere,
      select: { accountNumber: true, debit: true, credit: true },
    });

    const liabilityEntries = glEntries.filter((e) => e.accountNumber === 2100);
    const assetEntries = glEntries.filter((e) => e.accountNumber === 1020);
    const glDataAvailable = liabilityEntries.length > 0 || assetEntries.length > 0;

    // Account 2100 is Client Trust Liability (credit-normal: credit increases, debit decreases).
    // Account 1020 is IOLTA Trust Bank Asset (debit-normal: debit increases, credit decreases).
    let glTrustLiabilityBalance = 0;
    if (liabilityEntries.length > 0) {
      glTrustLiabilityBalance = Number(
        liabilityEntries.reduce((sum, e) => sum + (Number(e.credit) - Number(e.debit)), 0).toFixed(2)
      );
    } else if (assetEntries.length > 0) {
      glTrustLiabilityBalance = Number(
        assetEntries.reduce((sum, e) => sum + (Number(e.debit) - Number(e.credit)), 0).toFixed(2)
      );
    }

    // 3. Calculate adjusted bank balance (Pillar 1)
    const bankBalance = Number(query.bankStatementBalance || 0);
    const inTransit = Number(query.depositsInTransit || 0);
    const outstanding = Number(query.outstandingChecks || 0);
    const adjustedBankBalance = Number((bankBalance + inTransit - outstanding).toFixed(2));

    // 4. Variance: Adjusted Bank vs Client Sub-Ledgers (primary three-way check)
    const reconciliationVariance = Number((adjustedBankBalance - clientSubledgersTotalBalance).toFixed(2));

    // 5. isBalanced requires ALL THREE pillars to match within $0.01 tolerance.
    //    If GL data is unavailable the reconciliation is INCOMPLETE and cannot be declared balanced,
    //    regardless of whether the variance between Bank and Client Ledgers happens to be zero.
    const bankMatchesClientLedger = Math.abs(reconciliationVariance) < 0.01;
    const bankMatchesGl = glDataAvailable && Math.abs(adjustedBankBalance - glTrustLiabilityBalance) < 0.01;
    const glMatchesClientLedger = glDataAvailable && Math.abs(glTrustLiabilityBalance - clientSubledgersTotalBalance) < 0.01;
    const isBalanced = bankMatchesClientLedger && bankMatchesGl && glMatchesClientLedger;

    return {
      reconciliationMonth: query.reconciliationMonth,
      bankStatementBalance: Number(bankBalance.toFixed(2)),
      depositsInTransit: Number(inTransit.toFixed(2)),
      outstandingChecks: Number(outstanding.toFixed(2)),
      adjustedBankBalance,
      glTrustLiabilityBalance,
      glDataAvailable,
      clientSubledgersTotalBalance: Number(clientSubledgersTotalBalance.toFixed(2)),
      reconciliationVariance,
      isBalanced,
      activeClientLedgersCount: subLedgers.length,
    };
  }

  static async submitReconciliation(
    input: SubmitReconciliationInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ReconciliationRecordResponse> {
    const liveStatus = await this.calculateLiveStatus(input);

    const record = await prisma.threeWayReconciliation.upsert({
      where: { reconciliationMonth: input.reconciliationMonth },
      create: {
        reconciliationMonth: input.reconciliationMonth,
        bankStatementBalance: liveStatus.bankStatementBalance,
        depositsInTransit: liveStatus.depositsInTransit,
        outstandingChecks: liveStatus.outstandingChecks,
        adjustedBankBalance: liveStatus.adjustedBankBalance,
        glTrustLiabilityBalance: liveStatus.glTrustLiabilityBalance,
        clientSubledgersTotalBalance: liveStatus.clientSubledgersTotalBalance,
        reconciliationVariance: liveStatus.reconciliationVariance,
        isBalanced: liveStatus.isBalanced,
        auditedByUserId: context.userId,
        auditCertificatePdfUrl: input.auditCertificatePdfUrl,
      },
      update: {
        bankStatementBalance: liveStatus.bankStatementBalance,
        depositsInTransit: liveStatus.depositsInTransit,
        outstandingChecks: liveStatus.outstandingChecks,
        adjustedBankBalance: liveStatus.adjustedBankBalance,
        glTrustLiabilityBalance: liveStatus.glTrustLiabilityBalance,
        clientSubledgersTotalBalance: liveStatus.clientSubledgersTotalBalance,
        reconciliationVariance: liveStatus.reconciliationVariance,
        isBalanced: liveStatus.isBalanced,
        auditedByUserId: context.userId,
        auditCertificatePdfUrl: input.auditCertificatePdfUrl,
        reconciledAt: new Date(),
      },
      include: {
        auditedByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'THREE_WAY_RECONCILIATION_AUDITED',
      resourceType: 'TRUST_ACCOUNTING',
      resourceId: record.id,
      details: {
        reconciliationMonth: record.reconciliationMonth,
        isBalanced: record.isBalanced,
        variance: liveStatus.reconciliationVariance,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatRecord(record);
  }

  static async getHistory(): Promise<ReconciliationRecordResponse[]> {
    const records = await prisma.threeWayReconciliation.findMany({
      orderBy: { reconciliationMonth: 'desc' },
      include: {
        auditedByUser: { select: { id: true, name: true } },
      },
    });
    return records.map(this.formatRecord);
  }

  // =========================================================================
  // OPERATING BANK RECONCILIATION METHODS (ACCOUNT 1010)
  // Strictly segregated from Trust Three-Way Reconciliation
  // =========================================================================

  static async getOperatingReconciliationStatus(
    query: OperatingReconciliationQuery,
    clearedItemIdsOverride?: string[]
  ): Promise<OperatingReconciliationStatusResponse> {
    const period = query.reconciliationPeriod;
    const [year, month] = period.split('-').map(Number);
    // Period cutoff: last second of the target month
    const cutoffDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // 1. Fetch GL Account 1010 entries up to cutoffDate
    const glEntries = await prisma.generalLedgerEntry.findMany({
      where: {
        accountNumber: 1010,
        journal: { transactionDate: { lte: cutoffDate } },
      },
      include: {
        journal: { select: { id: true, journalNumber: true, transactionDate: true, memo: true } },
        account: { select: { accountName: true } },
      },
      orderBy: { journal: { transactionDate: 'desc' } },
    });

    const glDataAvailable = glEntries.length > 0;
    let totalDebit = 0;
    let totalCredit = 0;
    glEntries.forEach((e) => {
      totalDebit += Number(e.debit);
      totalCredit += Number(e.credit);
    });
    // Independent GL 1010 Book Balance (Asset account: Debits - Credits) through cutoff date
    const gl1010BookBalance = Number((totalDebit - totalCredit).toFixed(2));
    const bookAdjustments = Number(query.bookAdjustments) || 0;
    const adjustedBookBalance = Number((gl1010BookBalance + bookAdjustments).toFixed(2));

    // External Statement Balances: Do NOT assume missing statement balance is zero (Requirement 6)
    const statementOpening: number | null =
      query.statementOpeningBalance !== undefined && query.statementOpeningBalance !== null
        ? Number(query.statementOpeningBalance)
        : null;

    const statementEnding: number | null =
      query.statementEndingBalance !== undefined && query.statementEndingBalance !== null
        ? Number(query.statementEndingBalance)
        : null;

    const clearedItemSet: Set<string> = clearedItemIdsOverride ? new Set(clearedItemIdsOverride) : new Set();

    // 2. Classify items on or before cutoff date and compute cleared & uncleared stats
    let clearedInflows = 0;
    let clearedOutflows = 0;
    let depositsInTransit = 0;
    let outstandingChecks = 0;

    const items: OperatingReconciliationItem[] = glEntries.map((e) => {
      const debitVal = Number(e.debit);
      const creditVal = Number(e.credit);
      const isDeposit = debitVal > 0;
      const amt = isDeposit ? debitVal : creditVal;
      const id = `${e.journal.journalNumber}-${e.id}`;
      const isCleared = clearedItemSet.has(id) || clearedItemSet.has(e.id) || clearedItemSet.has(e.journal.id);

      if (isCleared) {
        if (isDeposit) clearedInflows += amt;
        else clearedOutflows += amt;
      } else {
        if (isDeposit) depositsInTransit += amt;
        else outstandingChecks += amt;
      }

      return {
        id,
        journalId: e.journalId,
        date: e.journal.transactionDate.toISOString().split('T')[0],
        description: e.journal.memo || 'Operating Cash Entry',
        type: isDeposit ? 'Credit' : 'Debit',
        amount: amt,
        cleared: isCleared,
      };
    });

    clearedInflows = Number(clearedInflows.toFixed(2));
    clearedOutflows = Number(clearedOutflows.toFixed(2));
    depositsInTransit = Number(depositsInTransit.toFixed(2));
    outstandingChecks = Number(outstandingChecks.toFixed(2));
    const clearedNetActivity = Number((clearedInflows - clearedOutflows).toFixed(2));

    const clearedBookBalance =
      statementOpening !== null ? Number((statementOpening + clearedNetActivity).toFixed(2)) : null;

    // 3. Independent Reconciliation Equation:
    // Adjusted Bank Balance = Ending Statement Balance + Valid Deposits in Transit - Valid Outstanding Payments
    // Final Reconciliation Variance = Adjusted Bank Balance - Independently Calculated GL Book Balance
    let adjustedBankBalance: number | null = null;
    let reconciliationVariance: number | null = null;
    let isBalanced = false;

    if (statementEnding !== null) {
      adjustedBankBalance = Number((statementEnding + depositsInTransit - outstandingChecks).toFixed(2));
      reconciliationVariance = Number((adjustedBankBalance - adjustedBookBalance).toFixed(2));
      isBalanced =
        Math.abs(reconciliationVariance) < 0.01 &&
        glDataAvailable &&
        statementEnding !== null &&
        statementOpening !== null;
    }

    return {
      reconciliationPeriod: period,
      cutoffDate: cutoffDate.toISOString().split('T')[0],
      statementOpeningBalance: statementOpening,
      statementEndingBalance: statementEnding,
      gl1010BookBalance,
      bookAdjustments,
      adjustedBookBalance,
      glDataAvailable,
      clearedInflows,
      clearedOutflows,
      clearedNetActivity,
      clearedBookBalance,
      depositsInTransit,
      outstandingChecks,
      adjustedBankBalance,
      reconciliationVariance,
      isBalanced,
      isFinalized: false,
      databasePersistenceAvailable: false,
      finalizedAt: null,
      finalizedBy: null,
      items,
    };
  }

  static async saveOperatingDraft(
    input: SaveOperatingDraftInput,
    context: { userId: string; userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<OperatingReconciliationStatusResponse> {
    const authorizedRoles = ['super_admin', 'attorney', 'supervisor', 'billing'];
    if (!authorizedRoles.includes(context.userRole)) {
      throw AppError.forbidden('You do not have permission to manage bank reconciliations.', 'FORBIDDEN');
    }

    // Compute live reconciliation status in-memory without abusing AuditLog as pseudo-storage (Requirement 1)
    const liveStatus = await this.getOperatingReconciliationStatus(
      {
        reconciliationPeriod: input.reconciliationPeriod,
        statementOpeningBalance: input.statementOpeningBalance,
        statementEndingBalance: input.statementEndingBalance,
        bookAdjustments: input.bookAdjustments,
      },
      input.clearedItemIds
    );

    return liveStatus;
  }

  static async finalizeOperating(
    input: FinalizeOperatingInput,
    context: { userId: string; userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<OperatingReconciliationStatusResponse> {
    const certifierRoles = ['super_admin', 'attorney', 'supervisor'];
    if (!certifierRoles.includes(context.userRole)) {
      throw AppError.forbidden(
        'Only supervising counsel, partners, or system administrators may certify bank reconciliations under Utah RPC 1.15 standards.',
        'UNAUTHORIZED_CERTIFICATION'
      );
    }

    // Requirement 7: If permanent database persistence is unavailable, disable final certification
    // with an accurate database-support-required message. Do not display fake success.
    throw AppError.badRequest(
      'Operating bank reconciliation final certification is currently unavailable: A dedicated database model (OperatingBankReconciliation) is required for permanent audit certification persistence. Database migrations are restricted in this environment.',
      'DATABASE_SUPPORT_REQUIRED'
    );
  }

  static async getOperatingHistory(): Promise<OperatingReconciliationHistoryResponse[]> {
    // Permanent operating reconciliation history requires dedicated OperatingBankReconciliation database model
    return [];
  }
}

