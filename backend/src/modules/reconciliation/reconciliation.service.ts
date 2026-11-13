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
    // 1. Calculate sum of all active client trust sub-ledgers
    const subLedgers = await prisma.trustSubLedger.findMany({ select: { balance: true } });
    const clientSubledgersTotalBalance = subLedgers.reduce((sum, l) => sum + Number(l.balance), 0);

    // 2. Calculate GL Trust Liability Balance (Account 1010 IOLTA or 2100 Trust Liability)
    // Query GeneralLedgerEntry for account 1010
    const glEntries = await prisma.generalLedgerEntry.findMany({
      where: { accountNumber: 1010 },
      select: { debit: true, credit: true },
    });
    const glTrustLiabilityBalance = glEntries.reduce((sum, e) => sum + (Number(e.debit) - Number(e.credit)), 0);

    // Fall back to client subledgers if no journals posted yet to ensure baseline consistency
    const effectiveGlBalance = glEntries.length > 0 ? glTrustLiabilityBalance : clientSubledgersTotalBalance;

    // 3. Calculate adjusted bank balance
    const bankBalance = Number(query.bankStatementBalance || 0);
    const inTransit = Number(query.depositsInTransit || 0);
    const outstanding = Number(query.outstandingChecks || 0);
    const adjustedBankBalance = Number((bankBalance + inTransit - outstanding).toFixed(2));

    const reconciliationVariance = Number((adjustedBankBalance - clientSubledgersTotalBalance).toFixed(2));
    const isBalanced = Math.abs(reconciliationVariance) < 0.01 && Math.abs(adjustedBankBalance - effectiveGlBalance) < 0.01;

    return {
      reconciliationMonth: query.reconciliationMonth,
      bankStatementBalance: Number(bankBalance.toFixed(2)),
      depositsInTransit: Number(inTransit.toFixed(2)),
      outstandingChecks: Number(outstanding.toFixed(2)),
      adjustedBankBalance,
      glTrustLiabilityBalance: Number(effectiveGlBalance.toFixed(2)),
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
