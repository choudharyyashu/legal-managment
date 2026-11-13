import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateCalendarEventInput, UpdateCalendarEventInput } from './calendar.validation.js';
import { CalendarEventResponse, CalendarEventListQuery } from './calendar.types.js';

export class CalendarService {
  private static formatResponse(event: any): CalendarEventResponse {
    return {
      id: event.id,
      matterId: event.matterId || null,
      matterNumber: event.matter?.matterNumber || null,
      matterTitle: event.matter?.title || null,
      title: event.title,
      eventType: event.eventType,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      location: event.location || null,
      judge: event.judge || null,
      isCourtAppearance: event.isCourtAppearance,
      createdByUserId: event.createdByUserId,
      createdByName: event.creator?.name || null,
      createdAt: event.createdAt.toISOString(),
    };
  }

  static async getEvents(query: CalendarEventListQuery): Promise<CalendarEventResponse[]> {
    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.eventType) where.eventType = query.eventType;
    if (query.isCourtAppearance !== undefined) where.isCourtAppearance = query.isCourtAppearance;

    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) where.startTime.gte = new Date(query.startDate);
      if (query.endDate) where.startTime.lte = new Date(query.endDate);
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return events.map(this.formatResponse);
  }

  static async getEventById(id: string): Promise<CalendarEventResponse> {
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!event) {
      throw AppError.notFound(`Calendar event '${id}' not found.`, 'EVENT_NOT_FOUND');
    }
    return this.formatResponse(event);
  }

  static async createEvent(
    input: CreateCalendarEventInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<CalendarEventResponse> {
    if (input.matterId) {
      const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
      if (!matter) throw AppError.badRequest('Referenced matter not found.', 'MATTER_NOT_FOUND');
    }

    const created = await prisma.calendarEvent.create({
      data: {
        matterId: input.matterId,
        title: input.title,
        eventType: input.eventType,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        location: input.location,
        judge: input.judge,
        isCourtAppearance: input.isCourtAppearance,
        createdByUserId: context.userId,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'CALENDAR_EVENT_CREATED',
      resourceType: 'CALENDAR',
      resourceId: created.id,
      details: { title: input.title, eventType: input.eventType, startTime: input.startTime },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }

  static async updateEvent(
    id: string,
    input: UpdateCalendarEventInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<CalendarEventResponse> {
    const existing = await this.getEventById(id);

    const data: any = { ...input };
    if (input.startTime) data.startTime = new Date(input.startTime);
    if (input.endTime) data.endTime = new Date(input.endTime);

    const updated = await prisma.calendarEvent.update({
      where: { id: existing.id },
      data,
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'CALENDAR_EVENT_UPDATED',
      resourceType: 'CALENDAR',
      resourceId: updated.id,
      details: { title: updated.title },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async deleteEvent(
    id: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getEventById(id);

    await prisma.calendarEvent.delete({ where: { id: existing.id } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'CALENDAR_EVENT_DELETED',
      resourceType: 'CALENDAR',
      resourceId: existing.id,
      details: { title: existing.title },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}
