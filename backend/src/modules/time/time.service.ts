import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateTimeEntryInput, UpdateTimeEntryInput, ApproveTimeEntryInput } from './time.validation.js';
import { TimeEntryResponse, TimeEntryListQuery, SuggestedBillingResponse } from './time.types.js';

export class TimeService {
  private static async generateEntryCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.timeEntry.count();
      const sequence = String(count + attempts).padStart(5, '0');
      const candidate = `TE-${year}-${sequence}`;
      const existing = await prisma.timeEntry.findUnique({ where: { entryCode: candidate } });
      if (!existing) return candidate;
    }
    return `TE-${year}-${Date.now().toString().slice(-5)}`;
  }

  private static formatResponse(entry: any): TimeEntryResponse {
    return {
      id: entry.id,
      entryCode: entry.entryCode,
      matterId: entry.matterId,
      matterNumber: entry.matter?.matterNumber || null,
      matterTitle: entry.matter?.title || null,
      userId: entry.userId,
      userName: entry.user?.name || null,
      date: entry.date.toISOString().split('T')[0],
      hours: Number(entry.hours),
      rate: Number(entry.rate),
      amount: Number(entry.amount),
      activityType: entry.activityType,
      activityCode: entry.activityCode || null,
      description: entry.description,
      isBillable: entry.isBillable,
      status: entry.status,
      approvedByUserId: entry.approvedByUserId || null,
      approvedByName: entry.approver?.name || null,
      approvedAt: entry.approvedAt?.toISOString() || null,
      rejectionComment: entry.rejectionComment || null,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  static async getTimeEntries(query: TimeEntryListQuery): Promise<{ entries: TimeEntryResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [total, records] = await Promise.all([
      prisma.timeEntry.count({ where }),
      prisma.timeEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          user: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      entries: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTimeEntryById(id: string): Promise<TimeEntryResponse> {
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    if (!entry) {
      throw AppError.notFound(`Time entry '${id}' not found.`, 'TIME_ENTRY_NOT_FOUND');
    }
    return this.formatResponse(entry);
  }

  static async createTimeEntry(
    input: CreateTimeEntryInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TimeEntryResponse> {
    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.badRequest('Referenced matter was not found.', 'MATTER_NOT_FOUND');

    const user = await prisma.user.findUnique({ where: { id: context.userId } });
    if (!user) throw AppError.unauthorized('User not found.');

    const rate = input.rate !== undefined ? input.rate : Number(user.billingRate || matter.hourlyRate || 0);
    const amount = Number((input.hours * rate).toFixed(2));
    const entryCode = await this.generateEntryCode();

    const created = await prisma.timeEntry.create({
      data: {
        entryCode,
        matterId: input.matterId,
        userId: context.userId,
        date: new Date(input.date),
        hours: input.hours,
        rate,
        amount,
        activityType: input.activityType,
        activityCode: input.activityCode,
        description: input.description,
        isBillable: input.isBillable,
        status: 'Submitted',
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TIME_ENTRY_CREATED',
      resourceType: 'BILLING',
      resourceId: created.id,
      details: { entryCode, hours: input.hours, amount, matterNumber: matter.matterNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }

  static async updateTimeEntry(
    id: string,
    input: UpdateTimeEntryInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TimeEntryResponse> {
    const existing = await this.getTimeEntryById(id);

    if (existing.status === 'Billed') {
      throw AppError.badRequest('Billed time entries cannot be modified.', 'TIME_ENTRY_LOCKED');
    }

    const hours = input.hours !== undefined ? input.hours : existing.hours;
    const rate = input.rate !== undefined ? input.rate : existing.rate;
    const amount = Number((hours * rate).toFixed(2));

    const updated = await prisma.timeEntry.update({
      where: { id: existing.id },
      data: {
        ...input,
        date: input.date ? new Date(input.date) : undefined,
        amount,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TIME_ENTRY_UPDATED',
      resourceType: 'BILLING',
      resourceId: updated.id,
      details: { entryCode: updated.entryCode, amount },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async approveTimeEntry(
    id: string,
    input: ApproveTimeEntryInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TimeEntryResponse> {
    const existing = await this.getTimeEntryById(id);

    const updated = await prisma.timeEntry.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        approvedByUserId: context.userId,
        approvedAt: new Date(),
        rejectionComment: input.rejectionComment,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        user: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: `TIME_ENTRY_${input.status.toUpperCase()}`,
      resourceType: 'BILLING',
      resourceId: updated.id,
      details: { entryCode: updated.entryCode, status: input.status },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async getSuggestedBilling(): Promise<SuggestedBillingResponse[]> {
    const items = await prisma.suggestedBillingCapture.findMany({
      where: { isConverted: false, isDismissed: false },
      orderBy: { date: 'desc' },
      include: { matter: { select: { id: true, matterNumber: true } } },
    });

    return items.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceIdentifier: item.sourceIdentifier,
      matterId: item.matterId || null,
      matterNumber: item.matter?.matterNumber || null,
      date: item.date.toISOString().split('T')[0],
      actualDurationSeconds: item.actualDurationSeconds,
      suggestedHours: Number(item.suggestedHours),
      matchConfidence: item.matchConfidence,
      activityDescription: item.activityDescription,
      detectedRate: item.detectedRate ? Number(item.detectedRate) : null,
      isConverted: item.isConverted,
      convertedTimeEntryId: item.convertedTimeEntryId || null,
      isDismissed: item.isDismissed,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  static async convertSuggestedBilling(
    suggestedId: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TimeEntryResponse> {
    const suggested = await prisma.suggestedBillingCapture.findUnique({ where: { id: suggestedId } });
    if (!suggested || suggested.isConverted) {
      throw AppError.notFound('Suggested billing record not found or already converted.');
    }

    if (!suggested.matterId) {
      throw AppError.badRequest('Suggested billing item must be associated with a matter before conversion.');
    }

    const timeEntry = await this.createTimeEntry(
      {
        matterId: suggested.matterId,
        date: suggested.date.toISOString().split('T')[0],
        hours: Number(suggested.suggestedHours),
        activityType: suggested.sourceType,
        description: suggested.activityDescription,
        isBillable: true,
      },
      context
    );

    await prisma.suggestedBillingCapture.update({
      where: { id: suggested.id },
      data: {
        isConverted: true,
        convertedTimeEntryId: timeEntry.id,
      },
    });

    return timeEntry;
  }

  static async deleteTimeEntry(
    id: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getTimeEntryById(id);

    if (existing.status === 'Billed') {
      throw AppError.badRequest('Billed time entries cannot be deleted.', 'TIME_ENTRY_LOCKED');
    }

    await prisma.timeEntry.delete({ where: { id: existing.id } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TIME_ENTRY_DELETED',
      resourceType: 'BILLING',
      resourceId: existing.id,
      details: { entryCode: existing.entryCode },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}

