/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Probate Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class ProbateService {
  static async getProbateCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let probateCase = await prisma.probateCase.findUnique({
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
        beneficiaries: { orderBy: { name: 'asc' } },
        assets: { orderBy: { assetType: 'asc' } },
      },
    });

    if (!probateCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      probateCase = await prisma.probateCase.create({
        data: {
          matterId,
          decedentName: matter.title || 'Estate Decedent',
          dateOfDeath: new Date(),
          countyJurisdiction: 'Salt Lake County',
          probateType: 'Informal Probate',
          status: 'Opened',
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
          beneficiaries: true,
          assets: true,
        },
      });
    }

    return probateCase;
  }

  static async saveProbateCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.probateCase.upsert({
      where: { matterId },
      update: {
        decedentName: data.decedentName,
        dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : undefined,
        countyJurisdiction: data.countyJurisdiction,
        courtCaseNumber: data.courtCaseNumber,
        probateType: data.probateType,
        hasWill: data.hasWill !== undefined ? Boolean(data.hasWill) : undefined,
        personalRepName: data.personalRepName,
        personalRepRole: data.personalRepRole,
        inventoryValue: data.inventoryValue !== undefined ? Number(data.inventoryValue) : undefined,
        status: data.status,
        noticeDeadline: data.noticeDeadline ? new Date(data.noticeDeadline) : undefined,
        notes: data.notes,
      },
      create: {
        matterId,
        decedentName: data.decedentName || 'Estate Decedent',
        dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : new Date(),
        countyJurisdiction: data.countyJurisdiction || 'Salt Lake County',
        courtCaseNumber: data.courtCaseNumber,
        probateType: data.probateType || 'Informal Probate',
        hasWill: data.hasWill !== undefined ? Boolean(data.hasWill) : true,
        personalRepName: data.personalRepName,
        personalRepRole: data.personalRepRole || 'Executor',
        inventoryValue: Number(data.inventoryValue) || 0,
        status: data.status || 'Opened',
        noticeDeadline: data.noticeDeadline ? new Date(data.noticeDeadline) : undefined,
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PROBATE_CASE_UPDATED',
      resourceType: 'PROBATE_CASE',
      resourceId: updated.id,
      details: { matterId, decedentName: updated.decedentName, status: updated.status },
    });

    return updated;
  }

  static async getBeneficiaries(matterId: string) {
    const probateCase = await this.getProbateCase(matterId);
    return prisma.probateBeneficiary.findMany({
      where: { probateCaseId: probateCase.id },
      orderBy: { name: 'asc' },
    });
  }

  static async createBeneficiary(matterId: string, data: any, currentUser: AuthenticatedUser) {
    const probateCase = await this.getProbateCase(matterId);
    if (!data.name || !data.relationship) {
      throw AppError.badRequest('Beneficiary name and relationship are required');
    }

    const item = await prisma.probateBeneficiary.create({
      data: {
        probateCaseId: probateCase.id,
        name: data.name,
        relationship: data.relationship,
        sharePercent: data.sharePercent !== undefined ? Number(data.sharePercent) : null,
        specificGift: data.specificGift || null,
        isNoticeSent: Boolean(data.isNoticeSent),
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PROBATE_BENEFICIARY_CREATED',
      resourceType: 'PROBATE_BENEFICIARY',
      resourceId: item.id,
      details: { name: item.name, relationship: item.relationship },
    });

    return item;
  }

  static async getAssets(matterId: string) {
    const probateCase = await this.getProbateCase(matterId);
    return prisma.probateAsset.findMany({
      where: { probateCaseId: probateCase.id },
      orderBy: { assetType: 'asc' },
    });
  }

  static async createAsset(matterId: string, data: any, currentUser: AuthenticatedUser) {
    const probateCase = await this.getProbateCase(matterId);
    if (!data.assetType || !data.description || data.estimatedValue === undefined) {
      throw AppError.badRequest('Asset type, description, and estimated value are required');
    }

    const item = await prisma.probateAsset.create({
      data: {
        probateCaseId: probateCase.id,
        assetType: data.assetType,
        description: data.description,
        estimatedValue: Number(data.estimatedValue),
        appraisalValue: data.appraisalValue !== undefined ? Number(data.appraisalValue) : null,
        isDisposed: Boolean(data.isDisposed),
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PROBATE_ASSET_CREATED',
      resourceType: 'PROBATE_ASSET',
      resourceId: item.id,
      details: { assetType: item.assetType, estimatedValue: Number(item.estimatedValue) },
    });

    return item;
  }
}
