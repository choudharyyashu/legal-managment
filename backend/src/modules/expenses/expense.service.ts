import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateExpenseInput, UpdateExpenseInput } from './expense.validation.js';
import { ExpenseResponse, ExpenseListQuery } from './expense.types.js';

export class ExpenseService {
  private static async generateExpenseCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.expense.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `EXP-${year}-${sequence}`;
      const existing = await prisma.expense.findUnique({ where: { expenseCode: candidate } });
      if (!existing) return candidate;
    }
    return `EXP-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static formatResponse(exp: any): ExpenseResponse {
    return {
      id: exp.id,
      expenseCode: exp.expenseCode,
      matterId: exp.matterId,
      matterNumber: exp.matter?.matterNumber || null,
      matterTitle: exp.matter?.title || null,
      incurredByUserId: exp.incurredByUserId,
      incurredByName: exp.incurredByUser?.name || null,
      date: exp.date.toISOString().split('T')[0],
      category: exp.category,
      amount: Number(exp.amount),
      vendorName: exp.vendorName || null,
      receiptDocumentId: exp.receiptDocumentId || null,
      isBillable: exp.isBillable,
      status: exp.status,
      createdAt: exp.createdAt.toISOString(),
    };
  }

  static async getExpenses(query: ExpenseListQuery): Promise<{ expenses: ExpenseResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.incurredByUserId) where.incurredByUserId = query.incurredByUserId;
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    const [total, records] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          incurredByUser: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      expenses: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getExpenseById(id: string): Promise<ExpenseResponse> {
    const exp = await prisma.expense.findUnique({
      where: { id },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        incurredByUser: { select: { id: true, name: true } },
      },
    });

    if (!exp) {
      throw AppError.notFound(`Expense '${id}' not found.`, 'EXPENSE_NOT_FOUND');
    }
    return this.formatResponse(exp);
  }

  static async createExpense(
    input: CreateExpenseInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ExpenseResponse> {
    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.badRequest('Referenced matter not found.', 'MATTER_NOT_FOUND');

    const expenseCode = await this.generateExpenseCode();

    const created = await prisma.expense.create({
      data: {
        expenseCode,
        matterId: input.matterId,
        incurredByUserId: context.userId,
        date: new Date(input.date),
        category: input.category,
        amount: input.amount,
        vendorName: input.vendorName,
        receiptDocumentId: input.receiptDocumentId,
        isBillable: input.isBillable,
        status: 'Unbilled',
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        incurredByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'EXPENSE_CREATED',
      resourceType: 'BILLING',
      resourceId: created.id,
      details: { expenseCode, amount: input.amount, matterNumber: matter.matterNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }

  static async updateExpense(
    id: string,
    input: UpdateExpenseInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ExpenseResponse> {
    const existing = await this.getExpenseById(id);

    if (existing.status === 'Billed') {
      throw AppError.badRequest('Billed expenses cannot be modified.', 'EXPENSE_LOCKED');
    }

    const updated = await prisma.expense.update({
      where: { id: existing.id },
      data: {
        ...input,
        date: input.date ? new Date(input.date) : undefined,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        incurredByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'EXPENSE_UPDATED',
      resourceType: 'BILLING',
      resourceId: updated.id,
      details: { expenseCode: updated.expenseCode, amount: updated.amount },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async deleteExpense(
    id: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getExpenseById(id);

    if (existing.status === 'Billed') {
      throw AppError.badRequest('Billed expenses cannot be deleted.', 'EXPENSE_LOCKED');
    }

    await prisma.expense.delete({ where: { id: existing.id } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'EXPENSE_DELETED',
      resourceType: 'BILLING',
      resourceId: existing.id,
      details: { expenseCode: existing.expenseCode },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}
