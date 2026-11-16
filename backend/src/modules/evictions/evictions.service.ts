/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Evictions & Unlawful Detainer Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class EvictionsService {
  static async getEvictionsCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let evCase = await prisma.evictionsCase.findUnique({
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

    if (!evCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      evCase = await prisma.evictionsCase.create({
        data: {
          matterId,
          propertyAddress: '123 Main Street',
          tenantName: 'Tenant Respondent',
          landlordName: matter.title || 'Landlord Petitioner',
          monthlyRent: 1500.0,
          outstandingBalance: 1500.0,
          status: 'Notice Phase',
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

    return evCase;
  }

  static async saveEvictionsCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.evictionsCase.upsert({
      where: { matterId },
      update: {
        propertyAddress: data.propertyAddress,
        unitNumber: data.unitNumber,
        tenantName: data.tenantName,
        landlordName: data.landlordName,
        leaseStartDate: data.leaseStartDate ? new Date(data.leaseStartDate) : undefined,
        monthlyRent: data.monthlyRent !== undefined ? Number(data.monthlyRent) : undefined,
        outstandingBalance: data.outstandingBalance !== undefined ? Number(data.outstandingBalance) : undefined,
        noticeType: data.noticeType,
        noticeServedDate: data.noticeServedDate ? new Date(data.noticeServedDate) : undefined,
        summonsIssuedDate: data.summonsIssuedDate ? new Date(data.summonsIssuedDate) : undefined,
        occupancyHearingDate: data.occupancyHearingDate ? new Date(data.occupancyHearingDate) : undefined,
        writOfRestitutionDate: data.writOfRestitutionDate ? new Date(data.writOfRestitutionDate) : undefined,
        status: data.status,
        notes: data.notes,
      },
      create: {
        matterId,
        propertyAddress: data.propertyAddress || 'Property Address',
        unitNumber: data.unitNumber,
        tenantName: data.tenantName || 'Tenant',
        landlordName: data.landlordName || 'Landlord',
        leaseStartDate: data.leaseStartDate ? new Date(data.leaseStartDate) : undefined,
        monthlyRent: Number(data.monthlyRent) || 0,
        outstandingBalance: Number(data.outstandingBalance) || 0,
        noticeType: data.noticeType || '3-Day Notice to Pay or Quit',
        noticeServedDate: data.noticeServedDate ? new Date(data.noticeServedDate) : undefined,
        summonsIssuedDate: data.summonsIssuedDate ? new Date(data.summonsIssuedDate) : undefined,
        occupancyHearingDate: data.occupancyHearingDate ? new Date(data.occupancyHearingDate) : undefined,
        writOfRestitutionDate: data.writOfRestitutionDate ? new Date(data.writOfRestitutionDate) : undefined,
        status: data.status || 'Notice Phase',
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'EVICTIONS_CASE_UPDATED',
      resourceType: 'EVICTIONS_CASE',
      resourceId: updated.id,
      details: { matterId, property: updated.propertyAddress, status: updated.status },
    });

    return updated;
  }
}
