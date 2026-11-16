/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communications Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

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
  static async getCommunications(filters: { matterId?: string; clientId?: string; type?: string; searchQuery?: string }, currentUser: AuthenticatedUser) {
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
    if (!input.subject || !input.type || !input.sender || !input.recipient) {
      throw AppError.badRequest('Subject, communication type, sender, and recipient are required.');
    }

    const record = await prisma.communication.create({
      data: {
        clientId: input.clientId || null,
        matterId: input.matterId || null,
        type: input.type,
        subject: input.subject,
        sender: input.sender,
        recipient: input.recipient,
        summary: input.summary || '',
        direction: input.direction || 'OUTBOUND',
        date: input.date ? new Date(input.date) : new Date(),
        durationMinutes: input.durationMinutes || null,
        status: input.status || 'Filed',
        sourceIdentifier: input.sourceIdentifier || null,
        createdById: currentUser.id,
      },
      include: {
        client: { select: { id: true, name: true, clientNumber: true } },
        matter: { select: { id: true, title: true, matterNumber: true } },
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'COMMUNICATION_LOGGED',
      resourceType: 'COMMUNICATION',
      resourceId: record.id,
      details: { subject: record.subject, type: record.type, matterId: record.matterId, clientId: record.clientId },
    });

    return record;
  }

  static async getUnmatchedQueue(currentUser: AuthenticatedUser) {
    return prisma.unmatchedCommunication.findMany({
      where: { matchingStatus: 'Unmatched' },
      orderBy: { receivedAt: 'desc' },
    });
  }

  static async matchCommunication(id: string, target: { clientId?: string; matterId?: string; reviewNotes?: string }, currentUser: AuthenticatedUser) {
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
}
