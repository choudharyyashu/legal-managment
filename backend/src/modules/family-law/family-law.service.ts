/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Family Law Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';
import { DocumentEventBus } from '../documents/events/event-bus.js';

export class FamilyLawService {
  static async getFamilyLawCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let famCase = await prisma.familyLawCase.findUnique({
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
        orders: { orderBy: { entryDate: 'desc' } },
      },
    });

    if (!famCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      famCase = await prisma.familyLawCase.create({
        data: {
          matterId,
          caseType: 'Divorce / Dissolution',
          status: 'Filing Pending',
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
          orders: true,
        },
      });
    }

    return famCase;
  }

  static async saveFamilyLawCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.familyLawCase.upsert({
      where: { matterId },
      update: {
        caseType: data.caseType,
        courtDocketNumber: data.courtDocketNumber,
        marriageDate: data.marriageDate ? new Date(data.marriageDate) : undefined,
        separationDate: data.separationDate ? new Date(data.separationDate) : undefined,
        hasMinorChildren: data.hasMinorChildren !== undefined ? Boolean(data.hasMinorChildren) : undefined,
        custodyArrangement: data.custodyArrangement,
        monthlyChildSupport: data.monthlyChildSupport !== undefined ? Number(data.monthlyChildSupport) : undefined,
        monthlyAlimony: data.monthlyAlimony !== undefined ? Number(data.monthlyAlimony) : undefined,
        status: data.status,
        mediationDate: data.mediationDate ? new Date(data.mediationDate) : undefined,
        notes: data.notes,
      },
      create: {
        matterId,
        caseType: data.caseType || 'Divorce / Dissolution',
        courtDocketNumber: data.courtDocketNumber,
        marriageDate: data.marriageDate ? new Date(data.marriageDate) : undefined,
        separationDate: data.separationDate ? new Date(data.separationDate) : undefined,
        hasMinorChildren: Boolean(data.hasMinorChildren),
        custodyArrangement: data.custodyArrangement,
        monthlyChildSupport: Number(data.monthlyChildSupport) || 0,
        monthlyAlimony: Number(data.monthlyAlimony) || 0,
        status: data.status || 'Filing Pending',
        mediationDate: data.mediationDate ? new Date(data.mediationDate) : undefined,
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'FAMILY_LAW_CASE_UPDATED',
      resourceType: 'FAMILY_LAW_CASE',
      resourceId: updated.id,
      details: { matterId, caseType: updated.caseType, status: updated.status },
    });

    DocumentEventBus.emitAsync('catalog.family_matter_opened', { matterId }, { user: currentUser });

    return updated;
  }

  static async getOrders(matterId: string) {
    const famCase = await this.getFamilyLawCase(matterId);
    return prisma.familyLawOrder.findMany({
      where: { familyLawCaseId: famCase.id },
      orderBy: { entryDate: 'desc' },
    });
  }

  static async createOrder(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.orderTitle || !data.orderType) {
      throw AppError.badRequest('Order title and order type are required');
    }
    const famCase = await this.getFamilyLawCase(matterId);

    const order = await prisma.familyLawOrder.create({
      data: {
        familyLawCaseId: famCase.id,
        orderTitle: data.orderTitle,
        orderType: data.orderType,
        entryDate: data.entryDate ? new Date(data.entryDate) : null,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        signedByJudge: data.signedByJudge || null,
        status: data.status || 'Active',
        summaryTerms: data.summaryTerms || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'FAMILY_LAW_ORDER_CREATED',
      resourceType: 'FAMILY_LAW_ORDER',
      resourceId: order.id,
      details: { title: order.orderTitle, type: order.orderType },
    });

    return order;
  }
}
