/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communications Service - Enhanced for Priority 3
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';
import {
  CommunicationIngestionEngine,
  IngestCommunicationPayload,
  ReviewCommunicationInput,
} from './communication-ingestion.js';

export interface CreateCommunicationInput {
  clientId?: string;
  matterId?: string;
  type: string;
  subject: string;
  sender: string;
  recipient: string;
  summary: string;
  direction?: string;
  date?: string | Date;
  durationMinutes?: number;
  status?: string;
  sourceIdentifier?: string;
}

export class CommunicationService {
  static async getCommunications(
    filters: { matterId?: string; clientId?: string; type?: string; searchQuery?: string },
    currentUser: AuthenticatedUser
  ) {
    const where: any = {};
    if (filters.matterId) where.matterId = filters.matterId;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.type && filters.type !== 'ALL') where.type = filters.type;
    if (filters.searchQuery) {
      where.OR = [
        { subject: { contains: filters.searchQuery } },
        { summary: { contains: filters.searchQuery } },
        { sender: { contains: filters.searchQuery } },
        { recipient: { contains: filters.searchQuery } },
      ];
    }

    return prisma.communication.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, clientNumber: true } },
        matter: { select: { id: true, title: true, matterNumber: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  static async createCommunication(input: CreateCommunicationInput, currentUser: AuthenticatedUser) {
    const subject = input.subject?.trim();
    if (!subject) {
      throw AppError.badRequest('Subject line is required.');
    }

    const type = input.type?.trim() || 'Email';
    const sender = input.sender?.trim() || currentUser?.email || 'Firm Staff';
    const recipient = input.recipient?.trim() || 'Client';

    let validClientId: string | null = null;
    if (input.clientId) {
      const clientExists = await prisma.client.findUnique({ where: { id: input.clientId } });
      if (clientExists) validClientId = clientExists.id;
    }

    let validMatterId: string | null = null;
    if (input.matterId) {
      const matterExists = await prisma.matter.findUnique({ where: { id: input.matterId } });
      if (matterExists) validMatterId = matterExists.id;
    }

    const record = await prisma.communication.create({
      data: {
        clientId: validClientId,
        matterId: validMatterId,
        type,
        subject,
        sender,
        recipient,
        summary: input.summary || '',
        direction: input.direction || 'OUTBOUND',
        date: input.date ? new Date(input.date) : new Date(),
        durationMinutes: input.durationMinutes || null,
        status: input.status || 'Filed',
        sourceIdentifier: input.sourceIdentifier || null,
        createdById: currentUser?.id || null,
      },
      include: {
        client: { select: { id: true, name: true, clientNumber: true } },
        matter: { select: { id: true, title: true, matterNumber: true } },
      },
    });

    if (currentUser?.id) {
      await createAuditLog({
        userId: currentUser.id,
        userRole: currentUser.role,
        action: 'COMMUNICATION_LOGGED',
        resourceType: 'COMMUNICATION',
        resourceId: record.id,
        details: { subject: record.subject, type: record.type, matterId: record.matterId, clientId: record.clientId },
      });
    }

    return record;
  }

  static async getUnmatchedQueue(currentUser: AuthenticatedUser) {
    return prisma.unmatchedCommunication.findMany({
      where: { matchingStatus: 'Unmatched' },
      orderBy: { receivedAt: 'desc' },
    });
  }

  static async matchCommunication(
    id: string,
    target: { clientId?: string; matterId?: string; reviewNotes?: string },
    currentUser: AuthenticatedUser
  ) {
    const item = await prisma.unmatchedCommunication.findUnique({ where: { id } });
    if (!item) {
      throw AppError.notFound('Unmatched communication queue item not found.');
    }

    const comm = await prisma.communication.create({
      data: {
        clientId: target.clientId || null,
        matterId: target.matterId || null,
        type: item.type === 'email' ? 'Email' : (item.type === 'call' ? 'Phone Call' : 'Mobile Message'),
        subject: item.subject,
        sender: item.senderName + (item.senderEmail ? ` <${item.senderEmail}>` : ''),
        recipient: 'Firm Staff',
        summary: item.preview,
        date: item.receivedAt,
        status: 'Filed',
        createdById: currentUser.id,
      },
    });

    await prisma.unmatchedCommunication.update({
      where: { id },
      data: {
        matchingStatus: 'Matched',
        suggestedClientId: target.clientId || item.suggestedClientId,
        suggestedMatterId: target.matterId || item.suggestedMatterId,
        reviewNotes: target.reviewNotes || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'UNMATCHED_COMMUNICATION_MATCHED',
      resourceType: 'UNMATCHED_COMMUNICATION',
      resourceId: item.id,
      details: { matchedCommunicationId: comm.id, clientId: target.clientId, matterId: target.matterId },
    });

    return comm;
  }

  /**
   * Ingests a new incoming/outgoing communication from Outlook, VoIP, iPhone sync or SMS adapters.
   * Prevents duplicate ingestion using providerMessageId / sourceIdentifier.
   */
  static async ingestCommunication(
    payload: IngestCommunicationPayload,
    currentUser: AuthenticatedUser
  ) {
    if (!payload.content && !payload.subject) {
      throw AppError.badRequest('Communication content or subject is required.');
    }

    // Duplicate check if providerMessageId is provided
    if (payload.providerMessageId) {
      const existing = await prisma.communication.findFirst({
        where: { sourceIdentifier: payload.providerMessageId },
      });
      if (existing) {
        return { isDuplicate: true, communication: existing };
      }
      const existingQueue = await prisma.unmatchedCommunication.findFirst({
        where: { contactNumber: payload.providerMessageId },
      });
      if (existingQueue) {
        return { isDuplicate: true, queuedItem: existingQueue };
      }
    }

    // Candidate lookup for matching
    const activeMatters = await prisma.matter.findMany({
      where: { status: 'Active' },
      select: {
        id: true,
        matterNumber: true,
        client: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    const candidateList = activeMatters.map((m) => ({
      id: m.id,
      matterNumber: m.matterNumber,
      clientName: m.client?.name,
      clientPhone: m.client?.phone,
      clientEmail: m.client?.email,
    }));

    const matchEvaluation = CommunicationIngestionEngine.evaluateMatterMatch(
      payload.senderIdentifier || payload.recipientIdentifier,
      candidateList
    );

    let resolvedMatterId = payload.suggestedMatterId || null;
    let resolvedClientId = payload.suggestedClientId || null;

    if (!resolvedMatterId && matchEvaluation.status === 'EXACT_MATCH') {
      resolvedMatterId = matchEvaluation.matchedMatterId || null;
      const matchedM = activeMatters.find((m) => m.id === resolvedMatterId);
      if (matchedM?.client?.id) {
        resolvedClientId = matchedM.client.id;
      }
    }

    const typeLabel =
      payload.channel === 'PHONE_CALL' || payload.channel === 'VOIP'
        ? 'Phone Call'
        : payload.channel === 'SMS'
        ? 'Mobile Message'
        : 'Email';

    const durationMin = payload.durationSeconds ? Math.ceil(payload.durationSeconds / 60) : undefined;

    // If an exact matter match exists, file directly to Communications
    if (resolvedMatterId) {
      const comm = await prisma.communication.create({
        data: {
          clientId: resolvedClientId,
          matterId: resolvedMatterId,
          type: typeLabel,
          subject: payload.subject || `${typeLabel} with ${payload.senderName || payload.senderIdentifier}`,
          sender: payload.senderName ? `${payload.senderName} (${payload.senderIdentifier})` : payload.senderIdentifier,
          recipient: payload.recipientName ? `${payload.recipientName} (${payload.recipientIdentifier})` : payload.recipientIdentifier,
          summary: CommunicationIngestionEngine.sanitizePreview(payload.content),
          direction: payload.direction || 'INBOUND',
          date: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          durationMinutes: durationMin || null,
          status: 'Filed',
          sourceIdentifier: payload.providerMessageId || null,
          createdById: currentUser?.id || null,
        },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          client: { select: { id: true, name: true, clientNumber: true } },
        },
      });

      return { isDuplicate: false, status: 'FILED', communication: comm };
    }

    // Otherwise, place in Unmatched Queue for attorney/staff review
    const unmatched = await prisma.unmatchedCommunication.create({
      data: {
        type: payload.channel === 'OUTLOOK_EMAIL' ? 'email' : (payload.channel === 'PHONE_CALL' ? 'call' : 'message'),
        senderName: payload.senderName || payload.senderIdentifier,
        senderEmail: payload.senderIdentifier.includes('@') ? payload.senderIdentifier : null,
        contactNumber: payload.senderIdentifier.includes('@') ? null : payload.senderIdentifier,
        subject: payload.subject || `${typeLabel} from ${payload.senderName || payload.senderIdentifier}`,
        preview: CommunicationIngestionEngine.sanitizePreview(payload.content),
        receivedAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        matchingStatus: 'Unmatched',
        reviewNotes: matchEvaluation.reason,
      },
    });

    return { isDuplicate: false, status: 'QUEUED_UNMATCHED', queuedItem: unmatched };
  }

  /**
   * Reviews a communication and optionally records a billable time entry.
   * Strictly prevents duplicate billing entries for the same communication.
   */
  static async reviewAndRecordBilling(
    communicationId: string,
    review: ReviewCommunicationInput,
    currentUser: AuthenticatedUser
  ) {
    const comm = await prisma.communication.findUnique({
      where: { id: communicationId },
      include: { matter: true, client: true },
    });

    if (!comm) {
      throw AppError.notFound(`Communication '${communicationId}' not found.`);
    }

    const matterId = review.assignedMatterId || comm.matterId;
    if (review.isBillable && !matterId) {
      throw AppError.badRequest('Cannot record billable time entry without an assigned matter.');
    }

    // Update communication status
    const updatedComm = await prisma.communication.update({
      where: { id: communicationId },
      data: {
        matterId: matterId || undefined,
        clientId: review.assignedClientId || comm.clientId || undefined,
        status: review.status === 'APPROVED' ? 'Filed' : (review.status === 'REJECTED' ? 'Archived' : 'Pending Review'),
        durationMinutes: review.billableDurationMinutes || comm.durationMinutes,
      },
    });

    let createdTimeEntry = null;

    if (review.isBillable && review.status === 'APPROVED' && matterId) {
      // Check for duplicate billing entry for this communication
      const existingTimeEntry = await prisma.timeEntry.findFirst({
        where: {
          matterId,
          description: { contains: `[COMM_REF:${communicationId}]` },
        },
      });

      if (existingTimeEntry) {
        return {
          communication: updatedComm,
          billingStatus: 'ALREADY_BILLED',
          timeEntry: existingTimeEntry,
        };
      }

      const duration = review.billableDurationMinutes || comm.durationMinutes || 6;
      const { units } = CommunicationIngestionEngine.calculateBillingUnits(duration);
      const hours = units;

      const userRecord = await prisma.user.findUnique({ where: { id: currentUser.id } });
      const rate = review.billingRate || Number(userRecord?.billingRate || 350.0);

      createdTimeEntry = await prisma.timeEntry.create({
        data: {
          entryCode: `TE-${Date.now().toString().slice(-6)}`,
          matterId,
          userId: currentUser.id,
          date: new Date(),
          hours,
          rate,
          amount: hours * rate,
          activityType: 'CLIENT_COMMUNICATION',
          description: `[COMM_REF:${communicationId}] Client conference via ${comm.type}: ${comm.subject}. ${review.activityNotes || ''}`.trim(),
          isBillable: true,
          status: 'Submitted',
        },
      });
    }

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'COMMUNICATION_REVIEWED',
      resourceType: 'COMMUNICATION',
      resourceId: communicationId,
      details: {
        status: review.status,
        isBillable: review.isBillable,
        timeEntryId: createdTimeEntry?.id || null,
      },
    });

    return {
      communication: updatedComm,
      billingStatus: createdTimeEntry ? 'BILLED' : 'NOT_BILLED',
      timeEntry: createdTimeEntry,
    };
  }
}
