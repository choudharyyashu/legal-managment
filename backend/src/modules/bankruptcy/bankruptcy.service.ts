/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Bankruptcy Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class BankruptcyService {
  /**
   * Retrieve or automatically initialize a BankruptcyCase for a given matterId
   */
  static async getBankruptcyCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let bkCase = await prisma.bankruptcyCase.findUnique({
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
        creditors: { orderBy: { creditorName: 'asc' } },
        schedules: { orderBy: { scheduleCode: 'asc' } },
      },
    });

    if (!bkCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      bkCase = await prisma.bankruptcyCase.create({
        data: {
          matterId,
          chapter: 'Chapter 7',
          courtDistrict: 'District of Utah',
          courtDivision: 'Salt Lake City',
          debtorType: 'Individual',
          status: 'Pre-Filing',
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
          creditors: true,
          schedules: true,
        },
      });
    }

    return bkCase;
  }

  static async saveBankruptcyCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.bankruptcyCase.upsert({
      where: { matterId },
      update: {
        chapter: data.chapter,
        caseNumber: data.caseNumber,
        courtDistrict: data.courtDistrict,
        courtDivision: data.courtDivision,
        assignedJudge: data.assignedJudge,
        trusteeName: data.trusteeName,
        debtorType: data.debtorType,
        filingDate: data.filingDate ? new Date(data.filingDate) : undefined,
        meeting341Date: data.meeting341Date ? new Date(data.meeting341Date) : undefined,
        confirmationDate: data.confirmationDate ? new Date(data.confirmationDate) : undefined,
        dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
        status: data.status,
        householdSize: data.householdSize !== undefined ? Number(data.householdSize) : undefined,
        monthlyGrossIncome: data.monthlyGrossIncome !== undefined ? Number(data.monthlyGrossIncome) : undefined,
        meansTestStatus: data.meansTestStatus,
        totalSecuredDebt: data.totalSecuredDebt !== undefined ? Number(data.totalSecuredDebt) : undefined,
        totalUnsecuredDebt: data.totalUnsecuredDebt !== undefined ? Number(data.totalUnsecuredDebt) : undefined,
        totalPriorityDebt: data.totalPriorityDebt !== undefined ? Number(data.totalPriorityDebt) : undefined,
        totalAssets: data.totalAssets !== undefined ? Number(data.totalAssets) : undefined,
        notes: data.notes,
      },
      create: {
        matterId,
        chapter: data.chapter || 'Chapter 7',
        caseNumber: data.caseNumber,
        courtDistrict: data.courtDistrict || 'District of Utah',
        courtDivision: data.courtDivision || 'Salt Lake City',
        assignedJudge: data.assignedJudge,
        trusteeName: data.trusteeName,
        debtorType: data.debtorType || 'Individual',
        filingDate: data.filingDate ? new Date(data.filingDate) : undefined,
        meeting341Date: data.meeting341Date ? new Date(data.meeting341Date) : undefined,
        confirmationDate: data.confirmationDate ? new Date(data.confirmationDate) : undefined,
        dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
        status: data.status || 'Pre-Filing',
        householdSize: Number(data.householdSize) || 1,
        monthlyGrossIncome: Number(data.monthlyGrossIncome) || 0,
        meansTestStatus: data.meansTestStatus,
        totalSecuredDebt: Number(data.totalSecuredDebt) || 0,
        totalUnsecuredDebt: Number(data.totalUnsecuredDebt) || 0,
        totalPriorityDebt: Number(data.totalPriorityDebt) || 0,
        totalAssets: Number(data.totalAssets) || 0,
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'BANKRUPTCY_CASE_UPDATED',
      resourceType: 'BANKRUPTCY_CASE',
      resourceId: updated.id,
      details: { matterId, chapter: updated.chapter, status: updated.status },
    });

    return updated;
  }

  // Creditors
  static async getCreditors(matterId: string) {
    const bkCase = await this.getBankruptcyCase(matterId);
    return prisma.bankruptcyCreditor.findMany({
      where: { bankruptcyCaseId: bkCase.id },
      orderBy: { creditorName: 'asc' },
    });
  }

  static async createCreditor(matterId: string, data: any, currentUser: AuthenticatedUser) {
    const bkCase = await this.getBankruptcyCase(matterId);
    if (!data.creditorName || !data.claimType || data.claimAmount === undefined) {
      throw AppError.badRequest('Creditor name, claim type, and claim amount are required');
    }

    const creditor = await prisma.bankruptcyCreditor.create({
      data: {
        bankruptcyCaseId: bkCase.id,
        creditorName: data.creditorName,
        claimType: data.claimType,
        accountNumber: data.accountNumber || null,
        claimAmount: Number(data.claimAmount),
        collateralDescription: data.collateralDescription || null,
        collateralValue: data.collateralValue !== undefined ? Number(data.collateralValue) : null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        isNoticeOnly: Boolean(data.isNoticeOnly),
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'BANKRUPTCY_CREDITOR_CREATED',
      resourceType: 'BANKRUPTCY_CREDITOR',
      resourceId: creditor.id,
      details: { creditorName: creditor.creditorName, claimAmount: Number(creditor.claimAmount) },
    });

    return creditor;
  }

  // Schedules
  static async getSchedules(matterId: string) {
    const bkCase = await this.getBankruptcyCase(matterId);
    return prisma.bankruptcyScheduleItem.findMany({
      where: { bankruptcyCaseId: bkCase.id },
      orderBy: { scheduleCode: 'asc' },
    });
  }

  static async createScheduleItem(matterId: string, data: any, currentUser: AuthenticatedUser) {
    const bkCase = await this.getBankruptcyCase(matterId);
    if (!data.scheduleCode || !data.description || data.valueAmount === undefined) {
      throw AppError.badRequest('Schedule code, description, and value amount are required');
    }

    const item = await prisma.bankruptcyScheduleItem.create({
      data: {
        bankruptcyCaseId: bkCase.id,
        scheduleCode: data.scheduleCode,
        description: data.description,
        valueAmount: Number(data.valueAmount),
        exemptAmount: data.exemptAmount !== undefined ? Number(data.exemptAmount) : 0,
        statutoryExemptionLaw: data.statutoryExemptionLaw || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'BANKRUPTCY_SCHEDULE_CREATED',
      resourceType: 'BANKRUPTCY_SCHEDULE',
      resourceId: item.id,
      details: { scheduleCode: item.scheduleCode, valueAmount: Number(item.valueAmount) },
    });

    return item;
  }
}
