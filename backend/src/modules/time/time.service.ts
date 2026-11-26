import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ApproveTimeEntryInput,
  ReviewSlotQueryInput,
  MarkSlotReviewedInput,
  ReviewFlagQueryInput,
  UpdateReviewFlagStatusInput,
} from './time.validation.js';
import {
  TimeEntryResponse,
  TimeEntryListQuery,
  SuggestedBillingResponse,
  ReviewSlotResponse,
  IdleFlagResponse,
  OverlapFlagResponse,
  ReviewFlagsResponse,
} from './time.types.js';

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
    const matter = await prisma.matter.findFirst({
      where: {
        OR: [
          { id: input.matterId },
          { matterNumber: input.matterId },
        ],
      },
    });
    if (!matter) throw AppError.badRequest('Referenced matter was not found.', 'MATTER_NOT_FOUND');

    const user = await prisma.user.findUnique({ where: { id: context.userId } });
    if (!user) throw AppError.unauthorized('User not found.');

    const rate = input.rate !== undefined ? input.rate : Number(user.billingRate || matter.hourlyRate || 0);
    const amount = Number((input.hours * rate).toFixed(2));
    const entryCode = await this.generateEntryCode();

    const created = await prisma.timeEntry.create({
      data: {
        entryCode,
        matterId: matter.id,
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

  public static readonly MOUNTAIN_TIME_REVIEW_SLOTS = [
    {
      id: 'slot-noon',
      label: 'Noon Review Slot',
      scheduledTime: '12:00 PM MT (Noon)',
      timezone: 'Mountain Time (MT)',
      windowDescription: 'Morning passive email, call, and drafting sweep (8:00 AM – 12:00 PM MT)',
    },
    {
      id: 'slot-4pm',
      label: '4 PM Review Slot',
      scheduledTime: '4:00 PM MT',
      timezone: 'Mountain Time (MT)',
      windowDescription: 'Mid-afternoon court conferences, document edits, and VoIP call sweep',
    },
    {
      id: 'slot-6pm',
      label: '6 PM Review Slot',
      scheduledTime: '6:00 PM MT',
      timezone: 'Mountain Time (MT)',
      windowDescription: 'End-of-day billing capture reconciliation & unmatched communication check',
    },
    {
      id: 'slot-9pm',
      label: '9 PM Review Slot',
      scheduledTime: '9:00 PM MT',
      timezone: 'Mountain Time (MT)',
      windowDescription: 'Final evening Mountain Time wrap-up & pre-ledger lock',
    },
  ];

  public static getMountainTimeDate(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  public static getMountainTimeDayRange(dateStr: string): { startUtc: Date; endUtc: Date } {
    const testDate = new Date(`${dateStr}T12:00:00Z`);
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', timeZoneName: 'shortOffset' });
    const part = fmt.formatToParts(testDate).find((p) => p.type === 'timeZoneName')?.value || 'GMT-7';
    const match = part.match(/GMT([+-])(\d+)(?::(\d+))?/);
    let offsetStr = '-07:00';
    if (match) {
      const sign = match[1];
      const hours = match[2].padStart(2, '0');
      const mins = (match[3] || '00').padStart(2, '0');
      offsetStr = `${sign}${hours}:${mins}`;
    }

    const startUtc = new Date(`${dateStr}T00:00:00.000${offsetStr}`);
    const endUtc = new Date(`${dateStr}T23:59:59.999${offsetStr}`);
    return { startUtc, endUtc };
  }

  static async getReviewSlots(query: ReviewSlotQueryInput): Promise<ReviewSlotResponse[]> {
    const targetDate = query.date || this.getMountainTimeDate();
    const { startUtc, endUtc } = this.getMountainTimeDayRange(targetDate);

    const [reviewLogs, pendingCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          resourceType: 'TIME_REVIEW_SLOT',
          action: 'TIME_REVIEW_SLOT_COMPLETED',
          timestamp: {
            gte: startUtc,
            lte: endUtc,
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.timeEntry.count({
        where: {
          date: new Date(targetDate),
          status: 'Submitted',
        },
      }),
    ]);

    const completedSlotsMap = new Map<string, any>();
    for (const log of reviewLogs) {
      const slotId = log.resourceId || (log.details as any)?.slotId;
      if (slotId && !completedSlotsMap.has(slotId)) {
        completedSlotsMap.set(slotId, log);
      }
    }

    return this.MOUNTAIN_TIME_REVIEW_SLOTS.map((slot) => {
      const completedLog = completedSlotsMap.get(slot.id);
      if (completedLog) {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Denver',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(completedLog.timestamp);

        return {
          id: slot.id,
          label: slot.label,
          scheduledTime: slot.scheduledTime,
          timezone: slot.timezone,
          reviewStatus: 'Completed',
          pendingSuggestions: 0,
          lastReviewedTime: `Reviewed at ${timeStr} MT by ${completedLog.userName}`,
          windowDescription: slot.windowDescription,
          reviewedByUserName: completedLog.userName,
          reviewedAt: completedLog.timestamp.toISOString(),
        };
      }

      return {
        id: slot.id,
        label: slot.label,
        scheduledTime: slot.scheduledTime,
        timezone: slot.timezone,
        reviewStatus: 'Pending',
        pendingSuggestions: pendingCount,
        lastReviewedTime: 'Pending Review',
        windowDescription: slot.windowDescription,
        reviewedByUserName: null,
        reviewedAt: null,
      };
    });
  }

  static async markReviewSlotCompleted(
    slotId: string,
    input: MarkSlotReviewedInput,
    context: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; isAlreadyCompleted: boolean; message: string; slot: ReviewSlotResponse }> {
    const validSlotIds = this.MOUNTAIN_TIME_REVIEW_SLOTS.map((s) => s.id);
    if (!validSlotIds.includes(slotId)) {
      throw AppError.badRequest(`Invalid review slot ID '${slotId}'. Valid slots: ${validSlotIds.join(', ')}`);
    }

    const targetDate = input.date || this.getMountainTimeDate();
    const { startUtc, endUtc } = this.getMountainTimeDayRange(targetDate);

    // Prevent duplicate review completion records (Requirement 6)
    const existing = await prisma.auditLog.findFirst({
      where: {
        resourceType: 'TIME_REVIEW_SLOT',
        action: 'TIME_REVIEW_SLOT_COMPLETED',
        resourceId: slotId,
        timestamp: {
          gte: startUtc,
          lte: endUtc,
        },
      },
    });

    let completionLog = existing;
    let isAlreadyCompleted = true;

    if (!existing) {
      completionLog = await prisma.auditLog.create({
        data: {
          userId: context.userId,
          userName: context.userName,
          userRole: context.userRole,
          action: 'TIME_REVIEW_SLOT_COMPLETED',
          resourceType: 'TIME_REVIEW_SLOT',
          resourceId: slotId,
          details: {
            slotId,
            targetDate,
            timezone: 'America/Denver',
            completedAt: new Date().toISOString(),
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
      isAlreadyCompleted = false;
    }

    const slotConfig = this.MOUNTAIN_TIME_REVIEW_SLOTS.find((s) => s.id === slotId)!;
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(completionLog!.timestamp);

    const slotResponse: ReviewSlotResponse = {
      id: slotConfig.id,
      label: slotConfig.label,
      scheduledTime: slotConfig.scheduledTime,
      timezone: slotConfig.timezone,
      reviewStatus: 'Completed',
      pendingSuggestions: 0,
      lastReviewedTime: `Reviewed at ${timeStr} MT by ${completionLog!.userName}`,
      windowDescription: slotConfig.windowDescription,
      reviewedByUserName: completionLog!.userName,
      reviewedAt: completionLog!.timestamp.toISOString(),
    };

    return {
      success: true,
      isAlreadyCompleted,
      message: isAlreadyCompleted
        ? `Review slot '${slotConfig.label}' was already marked as completed for ${targetDate}.`
        : `Review slot '${slotConfig.label}' marked as completed.`,
      slot: slotResponse,
    };
  }

  static async getReviewFlags(
    query: ReviewFlagQueryInput,
    context: { userId: string; userRole: string }
  ): Promise<ReviewFlagsResponse> {
    const targetDate = query.date || this.getMountainTimeDate();

    // Query time entries for the target date
    const entries = await prisma.timeEntry.findMany({
      where: {
        date: new Date(targetDate),
        ...(query.slotId ? {} : {}),
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Requirement 7: Generate overlap flags ONLY when actual start and end timestamps establish overlapping time intervals.
    // Do NOT classify total daily hours above eight as overlapping entries.
    // Parse time range format if explicitly recorded in description (e.g. "14:00-15:30" or "2:00 PM – 3:30 PM")
    const timeRangeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\s*(?:–|-|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;

    const parseToMinutes = (hStr: string, mStr: string, ampmStr?: string): number => {
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (ampmStr) {
        const isPm = ampmStr.toUpperCase() === 'PM';
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
      }
      return h * 60 + m;
    };

    const intervalEntries: { entry: any; startMin: number; endMin: number; rangeStr: string }[] = [];
    let intervalDataAvailable = false;

    for (const e of entries) {
      const match = (e.description || '').match(timeRangeRegex);
      if (match) {
        intervalDataAvailable = true;
        const startMin = parseToMinutes(match[1], match[2], match[3]);
        const endMin = parseToMinutes(match[4], match[5], match[6] || match[3]);
        if (endMin > startMin) {
          intervalEntries.push({
            entry: e,
            startMin,
            endMin,
            rangeStr: match[0],
          });
        }
      }
    }

    const overlapFlags: OverlapFlagResponse[] = [];

    // Group intervals by user to detect collisions
    const userIntervals = new Map<string, typeof intervalEntries>();
    for (const item of intervalEntries) {
      const uId = item.entry.userId;
      if (!userIntervals.has(uId)) userIntervals.set(uId, []);
      userIntervals.get(uId)!.push(item);
    }

    for (const [userId, uItems] of userIntervals.entries()) {
      for (let i = 0; i < uItems.length; i++) {
        for (let j = i + 1; j < uItems.length; j++) {
          const a = uItems[i];
          const b = uItems[j];
          // True interval overlap condition: startA < endB && startB < endA
          if (a.startMin < b.endMin && b.startMin < a.endMin) {
            const overlapStart = Math.max(a.startMin, b.startMin);
            const overlapEnd = Math.min(a.endMin, b.endMin);
            const overlapMins = overlapEnd - overlapStart;

            overlapFlags.push({
              id: `OVL-${a.entry.id}-${b.entry.id}`,
              slotId: query.slotId || 'slot-6pm',
              userId,
              userName: a.entry.user?.name || 'Staff Member',
              date: targetDate,
              overlapDuration: `${overlapMins} mins overlap`,
              reason: `Simultaneous active time logs detected across matters ${a.entry.matter?.matterNumber || 'Matter 1'} and ${b.entry.matter?.matterNumber || 'Matter 2'} during the same time interval.`,
              reviewNote: '',
              status: 'Pending',
              entries: [
                {
                  id: a.entry.id,
                  matterNumber: a.entry.matter?.matterNumber || 'Matter 1',
                  matterTitle: a.entry.matter?.title || 'Matter Title',
                  timeRange: a.rangeStr,
                  hours: Number(a.entry.hours),
                },
                {
                  id: b.entry.id,
                  matterNumber: b.entry.matter?.matterNumber || 'Matter 2',
                  matterTitle: b.entry.matter?.title || 'Matter Title',
                  timeRange: b.rangeStr,
                  hours: Number(b.entry.hours),
                },
              ],
            });
          }
        }
      }
    }

    // Requirement 8: Generate idle flags ONLY when reliable inactivity evidence exists.
    // Do NOT fabricate idle periods from differences between actual and billable durations.
    // Inactivity telemetry is not currently stored in the database.
    const idleFlags: IdleFlagResponse[] = [];

    return {
      idleFlags,
      overlapFlags,
      metadata: {
        targetDate,
        timezone: 'Mountain Time (America/Denver)',
        intervalDataAvailable,
        inactivityTelemetryAvailable: false,
      },
    };
  }

  static async updateReviewFlagStatus(
    flagId: string,
    input: UpdateReviewFlagStatusInput,
    context: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; flagId: string; status: string; reviewNote?: string | null }> {
    // Requirement 10: Keep flag resolution separate from formal time-entry approval and rejection workflows.
    await createAuditLog({
      userId: context.userId,
      userName: context.userName,
      userRole: context.userRole,
      action: 'TIME_REVIEW_FLAG_RESOLVED',
      resourceType: 'TIME_REVIEW_FLAG',
      resourceId: flagId,
      details: {
        flagId,
        status: input.status,
        reviewNote: input.reviewNote || null,
        resolvedAt: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      success: true,
      flagId,
      status: input.status,
      reviewNote: input.reviewNote || null,
    };
  }
}

