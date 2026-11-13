import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateTrustDepositInput, CreateTrustDisbursementInput } from './trust.validation.js';
import { TrustSubLedgerResponse, TrustTransactionResponse, TrustLedgerListQuery } from './trust.types.js';

export class TrustService {
  private static async generateLedgerCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.trustSubLedger.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `TRU-${year}-${sequence}`;
      const existing = await prisma.trustSubLedger.findUnique({ where: { ledgerCode: candidate } });
      if (!existing) return candidate;
    }
    return `TRU-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static formatResponse(ledger: any): TrustSubLedgerResponse {
    return {
      id: ledger.id,
      ledgerCode: ledger.ledgerCode,
      clientId: ledger.clientId,
      clientNumber: ledger.client?.clientNumber || null,
      clientName: ledger.client?.name || null,
      matterId: ledger.matterId,
      matterNumber: ledger.matter?.matterNumber || null,
      matterTitle: ledger.matter?.title || null,
      balance: Number(ledger.balance),
      lastAuditDate: ledger.lastAuditDate.toISOString().split('T')[0],
      createdAt: ledger.createdAt.toISOString(),
      updatedAt: ledger.updatedAt.toISOString(),
      transactions: ledger.transactions
        ? ledger.transactions.map((t: any) => ({
            id: t.id,
            trustSubLedgerId: t.trustSubLedgerId,
            transactionType: t.transactionType,
            amount: Number(t.amount),
            runningBalance: Number(t.runningBalance),
            sourceReference: t.sourceReference,
            authorizedByUserId: t.authorizedByUserId,
            authorizedByName: t.authorizedByUser?.name || null,
            purpose: t.purpose,
            createdAt: t.createdAt.toISOString(),
          }))
        : undefined,
    };
  }

  static async getOrCreateSubLedger(matterId: string): Promise<any> {
    const matter = await prisma.matter.findUnique({ where: { id: matterId }, include: { client: true } });
    if (!matter) throw AppError.notFound('Referenced matter not found.', 'MATTER_NOT_FOUND');

    let subLedger = await prisma.trustSubLedger.findUnique({ where: { matterId } });
    if (!subLedger) {
      const ledgerCode = await this.generateLedgerCode();
      subLedger = await prisma.trustSubLedger.create({
        data: {
          ledgerCode,
          clientId: matter.clientId,
          matterId,
          balance: 0.0,
          lastAuditDate: new Date(),
        },
      });
    }
    return subLedger;
  }

  static async getLedgers(query: TrustLedgerListQuery): Promise<{ ledgers: TrustSubLedgerResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.matterId) where.matterId = query.matterId;

    const [total, records] = await Promise.all([
      prisma.trustSubLedger.count({ where }),
      prisma.trustSubLedger.findMany({
        where,
        skip,
        take: limit,
        orderBy: { balance: 'desc' },
        include: {
          client: { select: { id: true, clientNumber: true, name: true } },
          matter: { select: { id: true, matterNumber: true, title: true } },
        },
      }),
    ]);

    return {
      ledgers: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLedgerByIdOrMatter(idOrMatterId: string): Promise<TrustSubLedgerResponse> {
    const ledger = await prisma.trustSubLedger.findFirst({
      where: {
        OR: [{ id: idOrMatterId }, { matterId: idOrMatterId }, { ledgerCode: idOrMatterId }],
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { authorizedByUser: { select: { id: true, name: true } } },
        },
      },
    });

    if (!ledger) {
      throw AppError.notFound(`Trust sub-ledger '${idOrMatterId}' not found.`, 'TRUST_LEDGER_NOT_FOUND');
    }
    return this.formatResponse(ledger);
  }

  static async depositToTrust(
    input: CreateTrustDepositInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ transaction: TrustTransactionResponse; ledger: TrustSubLedgerResponse }> {
    const subLedger = await this.getOrCreateSubLedger(input.matterId);

    const depositAmount = Number(input.amount.toFixed(2));
    const newBalance = Number((Number(subLedger.balance) + depositAmount).toFixed(2));

    const transaction = await prisma.trustTransaction.create({
      data: {
        trustSubLedgerId: subLedger.id,
        transactionType: 'Deposit',
        amount: depositAmount,
        runningBalance: newBalance,
        sourceReference: input.sourceReference,
        authorizedByUserId: context.userId,
        purpose: input.purpose,
      },
      include: {
        authorizedByUser: { select: { id: true, name: true } },
      },
    });

    const updatedLedger = await prisma.trustSubLedger.update({
      where: { id: subLedger.id },
      data: {
        balance: newBalance,
        lastAuditDate: new Date(),
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'IOLTA_DEPOSIT_RECORDED',
      resourceType: 'TRUST_ACCOUNTING',
      resourceId: transaction.id,
      details: {
        amount: depositAmount,
        newBalance,
        ledgerCode: updatedLedger.ledgerCode,
        sourceReference: input.sourceReference,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const formattedTx: TrustTransactionResponse = {
      id: transaction.id,
      trustSubLedgerId: transaction.trustSubLedgerId,
      transactionType: transaction.transactionType,
      amount: Number(transaction.amount),
      runningBalance: Number(transaction.runningBalance),
      sourceReference: transaction.sourceReference,
      authorizedByUserId: transaction.authorizedByUserId,
      authorizedByName: transaction.authorizedByUser?.name || null,
      purpose: transaction.purpose,
      createdAt: transaction.createdAt.toISOString(),
    };

    return {
      transaction: formattedTx,
      ledger: this.formatResponse(updatedLedger),
    };
  }

  static async disburseFromTrust(
    input: CreateTrustDisbursementInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ transaction: TrustTransactionResponse; ledger: TrustSubLedgerResponse }> {
    const subLedger = await this.getOrCreateSubLedger(input.matterId);

    const disburseAmount = Number(input.amount.toFixed(2));
    const currentBalance = Number(subLedger.balance);

    // Utah RPC 1.15 Strict Negative Balance Guard
    if (currentBalance < disburseAmount) {
      throw AppError.badRequest(
        `Insufficient trust funds: Ledger balance is $${currentBalance.toFixed(2)}, cannot disburse $${disburseAmount.toFixed(2)}. Utah RPC 1.15 strictly prohibits negative client trust balances.`,
        'INSUFFICIENT_TRUST_FUNDS'
      );
    }

    const newBalance = Number((currentBalance - disburseAmount).toFixed(2));

    const transaction = await prisma.trustTransaction.create({
      data: {
        trustSubLedgerId: subLedger.id,
        transactionType: 'Disbursement',
        amount: disburseAmount,
        runningBalance: newBalance,
        sourceReference: input.sourceReference,
        authorizedByUserId: context.userId,
        purpose: input.purpose,
      },
      include: {
        authorizedByUser: { select: { id: true, name: true } },
      },
    });

    const updatedLedger = await prisma.trustSubLedger.update({
      where: { id: subLedger.id },
      data: {
        balance: newBalance,
        lastAuditDate: new Date(),
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'IOLTA_DISBURSEMENT_RECORDED',
      resourceType: 'TRUST_ACCOUNTING',
      resourceId: transaction.id,
      details: {
        amount: disburseAmount,
        newBalance,
        ledgerCode: updatedLedger.ledgerCode,
        purpose: input.purpose,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const formattedTx: TrustTransactionResponse = {
      id: transaction.id,
      trustSubLedgerId: transaction.trustSubLedgerId,
      transactionType: transaction.transactionType,
      amount: Number(transaction.amount),
      runningBalance: Number(transaction.runningBalance),
      sourceReference: transaction.sourceReference,
      authorizedByUserId: transaction.authorizedByUserId,
      authorizedByName: transaction.authorizedByUser?.name || null,
      purpose: transaction.purpose,
      createdAt: transaction.createdAt.toISOString(),
    };

    return {
      transaction: formattedTx,
      ledger: this.formatResponse(updatedLedger),
    };
  }

  static async getTransactions(): Promise<TrustTransactionResponse[]> {
    const transactions = await prisma.trustTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        authorizedByUser: { select: { id: true, name: true } },
      },
    });

    return transactions.map((t) => ({
      id: t.id,
      trustSubLedgerId: t.trustSubLedgerId,
      transactionType: t.transactionType,
      amount: Number(t.amount),
      runningBalance: Number(t.runningBalance),
      sourceReference: t.sourceReference,
      authorizedByUserId: t.authorizedByUserId,
      authorizedByName: t.authorizedByUser?.name || null,
      purpose: t.purpose,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}

