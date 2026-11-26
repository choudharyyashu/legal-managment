import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { SubmitReconciliationInput, LiveReconciliationQuery } from './reconciliation.validation.js';
import { ReconciliationStatusResponse, ReconciliationRecordResponse } from './reconciliation.types.js';

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
}

