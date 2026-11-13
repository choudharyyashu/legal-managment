import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateJournalInput, CreateAccountInput } from './ledger.validation.js';
import { ChartOfAccountResponse, GeneralLedgerJournalResponse } from './ledger.types.js';

export class LedgerService {
  private static async generateJournalNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.generalLedgerJournal.count();
      const sequence = String(count + attempts).padStart(5, '0');
      const candidate = `GLJ-${year}-${sequence}`;
      const existing = await prisma.generalLedgerJournal.findUnique({ where: { journalNumber: candidate } });
      if (!existing) return candidate;
    }
    return `GLJ-${year}-${Date.now().toString().slice(-5)}`;
  }

  private static formatResponse(j: any): GeneralLedgerJournalResponse {
    let totalDebit = 0;
    let totalCredit = 0;

    const entries = j.entries
      ? j.entries.map((e: any) => {
          const debit = Number(e.debit);
          const credit = Number(e.credit);
          totalDebit += debit;
          totalCredit += credit;
          return {
            id: e.id,
            accountNumber: e.accountNumber,
            accountName: e.account?.accountName || null,
            debit,
            credit,
            matterId: e.matterId || null,
            matterNumber: e.matter?.matterNumber || null,
          };
        })
      : undefined;

    return {
      id: j.id,
      journalNumber: j.journalNumber,
      transactionDate: j.transactionDate.toISOString().split('T')[0],
      memo: j.memo,
      createdByUserId: j.createdByUserId,
      createdByName: j.createdByUser?.name || null,
      createdAt: j.createdAt.toISOString(),
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
      entries,
    };
  }

  static async getChartOfAccounts(): Promise<ChartOfAccountResponse[]> {
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { accountNumber: 'asc' },
    });
    return accounts.map((a) => ({
      accountNumber: a.accountNumber,
      accountName: a.accountName,
      accountType: a.accountType,
      isActive: a.isActive,
    }));
  }

  static async createAccount(
    input: CreateAccountInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ChartOfAccountResponse> {
    const existing = await prisma.chartOfAccount.findUnique({
      where: { accountNumber: input.accountNumber },
    });
    if (existing) {
      throw AppError.conflict(`Chart of Account #${input.accountNumber} already exists.`, 'ACCOUNT_NUMBER_EXISTS');
    }

    const created = await prisma.chartOfAccount.create({
      data: {
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        accountType: input.accountType,
        isActive: input.isActive !== false,
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'CHART_OF_ACCOUNT_CREATED',
      resourceType: 'FINANCIAL',
      resourceId: String(created.accountNumber),
      details: { accountNumber: created.accountNumber, accountName: created.accountName, accountType: created.accountType },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accountNumber: created.accountNumber,
      accountName: created.accountName,
      accountType: created.accountType,
      isActive: created.isActive,
    };
  }

  static async getJournals(): Promise<GeneralLedgerJournalResponse[]> {
    const journals = await prisma.generalLedgerJournal.findMany({
      orderBy: { transactionDate: 'desc' },
      include: {
        createdByUser: { select: { id: true, name: true } },
        entries: {
          include: {
            account: { select: { accountName: true } },
            matter: { select: { matterNumber: true } },
          },
        },
      },
    });

    return journals.map(this.formatResponse);
  }

  static async getJournalById(id: string): Promise<GeneralLedgerJournalResponse> {
    const journal = await prisma.generalLedgerJournal.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, name: true } },
        entries: {
          include: {
            account: { select: { accountName: true } },
            matter: { select: { matterNumber: true } },
          },
        },
      },
    });

    if (!journal) {
      throw AppError.notFound(`Journal '${id}' not found.`, 'JOURNAL_NOT_FOUND');
    }
    return this.formatResponse(journal);
  }

  static async createJournal(
    input: CreateJournalInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<GeneralLedgerJournalResponse> {
    // Validate accounts exist
    for (const entry of input.entries) {
      const account = await prisma.chartOfAccount.findUnique({ where: { accountNumber: entry.accountNumber } });
      if (!account) {
        throw AppError.badRequest(`Chart of account ${entry.accountNumber} does not exist.`, 'INVALID_ACCOUNT');
      }
    }

    const journalNumber = await this.generateJournalNumber();

    const created = await prisma.generalLedgerJournal.create({
      data: {
        journalNumber,
        transactionDate: new Date(input.transactionDate),
        memo: input.memo,
        createdByUserId: context.userId,
        entries: {
          create: input.entries.map((e) => ({
            accountNumber: e.accountNumber,
            debit: e.debit || 0.0,
            credit: e.credit || 0.0,
            matterId: e.matterId,
          })),
        },
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
        entries: {
          include: {
            account: { select: { accountName: true } },
            matter: { select: { matterNumber: true } },
          },
        },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'GENERAL_LEDGER_JOURNAL_POSTED',
      resourceType: 'ACCOUNTING',
      resourceId: created.id,
      details: { journalNumber, memo: input.memo, entriesCount: input.entries.length },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }
}

