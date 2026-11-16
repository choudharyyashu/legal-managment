/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Appeals Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class AppealsService {
  static async getAppealsCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let appealsCase = await prisma.appealsCase.findUnique({
      where: { matterId },
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
            status: true,
            client: { select: { id: true, name: true, clientNumber: true } },
          },
        },
      },
    });

    if (!appealsCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      appealsCase = await prisma.appealsCase.create({
        data: {
          matterId,
          appellateCourt: 'Utah Court of Appeals',
          status: 'Notice Filed',
          appellantRole: 'Appellant',
        },
        include: {
          matter: {
            select: {
              id: true,
              title: true,
              matterNumber: true,
              status: true,
              client: { select: { id: true, name: true, clientNumber: true } },
            },
          },
        },
      });
    }

    return appealsCase;
  }

  static async saveAppealsCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.appealsCase.upsert({
      where: { matterId },
      update: {
        appellateCourt: data.appellateCourt,
        appellateDocketNumber: data.appellateDocketNumber,
        lowerCourtName: data.lowerCourtName,
        lowerCourtDocketNumber: data.lowerCourtDocketNumber,
        noticeOfAppealDate: data.noticeOfAppealDate ? new Date(data.noticeOfAppealDate) : undefined,
        recordDueDeadline: data.recordDueDeadline ? new Date(data.recordDueDeadline) : undefined,
        openingBriefDeadline: data.openingBriefDeadline ? new Date(data.openingBriefDeadline) : undefined,
        replyBriefDeadline: data.replyBriefDeadline ? new Date(data.replyBriefDeadline) : undefined,
        oralArgumentDate: data.oralArgumentDate ? new Date(data.oralArgumentDate) : undefined,
        status: data.status,
        appellantRole: data.appellantRole,
        notes: data.notes,
      },
      create: {
        matterId,
        appellateCourt: data.appellateCourt || 'Utah Court of Appeals',
        appellateDocketNumber: data.appellateDocketNumber,
        lowerCourtName: data.lowerCourtName,
        lowerCourtDocketNumber: data.lowerCourtDocketNumber,
        noticeOfAppealDate: data.noticeOfAppealDate ? new Date(data.noticeOfAppealDate) : undefined,
        recordDueDeadline: data.recordDueDeadline ? new Date(data.recordDueDeadline) : undefined,
        openingBriefDeadline: data.openingBriefDeadline ? new Date(data.openingBriefDeadline) : undefined,
        replyBriefDeadline: data.replyBriefDeadline ? new Date(data.replyBriefDeadline) : undefined,
        oralArgumentDate: data.oralArgumentDate ? new Date(data.oralArgumentDate) : undefined,
        status: data.status || 'Notice Filed',
        appellantRole: data.appellantRole || 'Appellant',
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'APPEALS_CASE_UPDATED',
      resourceType: 'APPEALS_CASE',
      resourceId: updated.id,
      details: { matterId, status: updated.status, docket: updated.appellateDocketNumber },
    });

    return updated;
  }
}
