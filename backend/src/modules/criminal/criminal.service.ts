/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Criminal Defense Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class CriminalService {
  static async getCriminalCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let crimCase = await prisma.criminalCase.findUnique({
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
        charges: { orderBy: { countNumber: 'asc' } },
      },
    });

    if (!crimCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      crimCase = await prisma.criminalCase.create({
        data: {
          matterId,
          defendantName: matter.title || 'Defendant',
          courtJurisdiction: 'State of Utah, Third District Court',
          custodyStatus: 'Released on Bail',
          status: 'Arraignment Scheduled',
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
          charges: true,
        },
      });
    }

    return crimCase;
  }

  static async saveCriminalCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.criminalCase.upsert({
      where: { matterId },
      update: {
        defendantName: data.defendantName,
        courtJurisdiction: data.courtJurisdiction,
        caseDocketNumber: data.caseDocketNumber,
        presidingJudge: data.presidingJudge,
        prosecutingAgency: data.prosecutingAgency,
        bailAmount: data.bailAmount !== undefined ? Number(data.bailAmount) : undefined,
        custodyStatus: data.custodyStatus,
        arraignmentDate: data.arraignmentDate ? new Date(data.arraignmentDate) : undefined,
        preliminaryHearingDate: data.preliminaryHearingDate ? new Date(data.preliminaryHearingDate) : undefined,
        trialDate: data.trialDate ? new Date(data.trialDate) : undefined,
        status: data.status,
        notes: data.notes,
      },
      create: {
        matterId,
        defendantName: data.defendantName || 'Defendant',
        courtJurisdiction: data.courtJurisdiction || 'State of Utah, Third District Court',
        caseDocketNumber: data.caseDocketNumber,
        presidingJudge: data.presidingJudge,
        prosecutingAgency: data.prosecutingAgency,
        bailAmount: Number(data.bailAmount) || 0,
        custodyStatus: data.custodyStatus || 'Released on Bail',
        arraignmentDate: data.arraignmentDate ? new Date(data.arraignmentDate) : undefined,
        preliminaryHearingDate: data.preliminaryHearingDate ? new Date(data.preliminaryHearingDate) : undefined,
        trialDate: data.trialDate ? new Date(data.trialDate) : undefined,
        status: data.status || 'Arraignment Scheduled',
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'CRIMINAL_CASE_UPDATED',
      resourceType: 'CRIMINAL_CASE',
      resourceId: updated.id,
      details: { matterId, status: updated.status },
    });

    return updated;
  }

  static async getCharges(matterId: string) {
    const crimCase = await this.getCriminalCase(matterId);
    return prisma.criminalCharge.findMany({
      where: { criminalCaseId: crimCase.id },
      orderBy: { countNumber: 'asc' },
    });
  }

  static async createCharge(matterId: string, data: any, currentUser: AuthenticatedUser) {
    const crimCase = await this.getCriminalCase(matterId);
    if (!data.statuteCode || !data.chargeTitle || !data.severityClass) {
      throw AppError.badRequest('Statute code, charge title, and severity class are required');
    }

    const charge = await prisma.criminalCharge.create({
      data: {
        criminalCaseId: crimCase.id,
        countNumber: Number(data.countNumber) || 1,
        statuteCode: data.statuteCode,
        chargeTitle: data.chargeTitle,
        severityClass: data.severityClass,
        plea: data.plea || 'Not Guilty',
        disposition: data.disposition || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'CRIMINAL_CHARGE_CREATED',
      resourceType: 'CRIMINAL_CHARGE',
      resourceId: charge.id,
      details: { title: charge.chargeTitle, statute: charge.statuteCode },
    });

    return charge;
  }
}
