import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateJournalInput, CreateAccountInput, ChartOfAccountQueryInput } from './ledger.validation.js';
import { ChartOfAccountResponse, GeneralLedgerJournalResponse, TrialBalanceResponse, JournalQueryInput } from './ledger.types.js';

export class LedgerService {
  private static async generateJournalNumber(client: any = prisma): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await client.generalLedgerJournal.count();
      const sequence = String(count + attempts).padStart(5, '0');
      const candidate = `GLJ-${year}-${sequence}`;
      const existing = await client.generalLedgerJournal.findUnique({ where: { journalNumber: candidate } });
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

  static async getChartOfAccounts(filter?: ChartOfAccountQueryInput): Promise<ChartOfAccountResponse[]> {
    const cutoff = filter?.asOfDate ? new Date(filter.asOfDate) : null;
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { accountNumber: 'asc' },
      include: {
        entries: {
          where: cutoff
            ? {
                journal: {
                  transactionDate: { lte: cutoff },
                },
              }
            : undefined,
          select: {
            debit: true,
            credit: true,
          },
        },
      },
    });

    return accounts.map((a) => {
      const totalDebit = a.entries.reduce((sum, e) => sum + Number(e.debit), 0);
      const totalCredit = a.entries.reduce((sum, e) => sum + Number(e.credit), 0);

      // Normal balance calculation:
      // Asset (1000s) & Expense (5000s): Debit - Credit
      // Liability (2000s), Equity (3000s), Revenue (4000s): Credit - Debit
      let balance = 0;
      if (a.accountType === 'Asset' || a.accountType === 'Expense') {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        accountNumber: a.accountNumber,
        accountName: a.accountName,
        accountType: a.accountType,
        isActive: a.isActive,
        totalDebit: Number(totalDebit.toFixed(2)),
        totalCredit: Number(totalCredit.toFixed(2)),
        balance: Number(balance.toFixed(2)),
      };
    });
  }

  static async getTrialBalance(asOfDate?: string): Promise<TrialBalanceResponse> {
    const accounts = await this.getChartOfAccounts(asOfDate ? { asOfDate } : undefined);

    let totalDebits = 0;
    let totalCredits = 0;

    const items = accounts.map((a) => {
      let debitBalance = 0;
      let creditBalance = 0;

      // In trial balance:
      // Net debit balance goes to debit column; net credit balance goes to credit column
      const net = (a.totalDebit || 0) - (a.totalCredit || 0);
      if (net > 0) {
        debitBalance = Number(net.toFixed(2));
      } else if (net < 0) {
        creditBalance = Number(Math.abs(net).toFixed(2));
      }

      totalDebits += debitBalance;
      totalCredits += creditBalance;

      return {
        accountNumber: a.accountNumber,
        accountName: a.accountName,
        accountType: a.accountType,
        debitBalance,
        creditBalance,
      };
    });

    totalDebits = Number(totalDebits.toFixed(2));
    totalCredits = Number(totalCredits.toFixed(2));
    const variance = Number(Math.abs(totalDebits - totalCredits).toFixed(2));
    const isBalanced = variance < 0.01;

    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      accounts: items,
      totalDebits,
      totalCredits,
      isBalanced,
      variance,
    };
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
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
    };
  }

  static async getJournals(query?: JournalQueryInput): Promise<{
    journals: GeneralLedgerJournalResponse[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const where: any = {};

    if (query?.startDate || query?.endDate) {
      where.transactionDate = {};
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate);
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate);
    }

    if (query?.accountNumber) {
      where.entries = {
        some: {
          accountNumber: Number(query.accountNumber),
        },
      };
    }

    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { journalNumber: { contains: term } },
        { memo: { contains: term } },
      ];
    }

    const page = query?.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 50;
    const skip = (page - 1) * limit;

    const [total, journals] = await Promise.all([
      prisma.generalLedgerJournal.count({ where }),
      prisma.generalLedgerJournal.findMany({
        where,
        skip,
        take: limit,
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
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      journals: journals.map(this.formatResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
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

  /**
   * Internal transactional helper for posting balanced General Ledger journals.
   * Can be executed within existing external Prisma transactions.
   */
  static async executePostJournal(
    input: CreateJournalInput,
    context: { userId: string; userRole?: string; ipAddress?: string; userAgent?: string },
    tx: any = prisma
  ): Promise<any> {
    // 1. Validate all referenced accounts exist in Chart of Accounts
    for (const entry of input.entries) {
      const account = await tx.chartOfAccount.findUnique({ where: { accountNumber: entry.accountNumber } });
      if (!account) {
        throw AppError.badRequest(`Chart of account #${entry.accountNumber} does not exist.`, 'INVALID_ACCOUNT');
      }
    }

    // 2. Validate strict double-entry balance (Debit == Credit within $0.001)
    const totalDebit = input.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = input.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) >= 0.001) {
      throw AppError.badRequest(
        `Unbalanced journal entry: Total debits ($${totalDebit.toFixed(2)}) must strictly equal total credits ($${totalCredit.toFixed(2)}).`,
        'UNBALANCED_JOURNAL_ENTRY'
      );
    }

    // 3. Generate journal number and insert journal record with lines
    const journalNumber = await this.generateJournalNumber(tx);

    const created = await tx.generalLedgerJournal.create({
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

    return created;
  }

  static async createJournal(
    input: CreateJournalInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<GeneralLedgerJournalResponse> {
    const created = await this.executePostJournal(input, context, prisma);

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'GENERAL_LEDGER_JOURNAL_POSTED',
      resourceType: 'ACCOUNTING',
      resourceId: created.id,
      details: { journalNumber: created.journalNumber, memo: input.memo, entriesCount: input.entries.length },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }
}

