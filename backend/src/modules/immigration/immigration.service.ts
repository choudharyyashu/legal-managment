/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Immigration Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class ImmigrationService {
  /**
   * Retrieve or automatically initialize an ImmigrationCase for a given matterId
   */
  static async getImmigrationCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let immCase = await prisma.immigrationCase.findUnique({
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
        receipts: { orderBy: { filingDate: 'desc' } },
        parties: { orderBy: { name: 'asc' } },
      },
    });

    if (!immCase) {
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      immCase = await prisma.immigrationCase.create({
        data: {
          matterId,
          visaCategory: 'Family-Based (AOS)',
          status: 'Preparation',
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
          receipts: true,
          parties: true,
        },
      });
    }

    return immCase;
  }

  static async saveImmigrationCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.immigrationCase.upsert({
      where: { matterId },
      update: {
        visaCategory: data.visaCategory,
        alienRegistrationNum: data.alienRegistrationNum,
        usCISOnlineAccountNum: data.usCISOnlineAccountNum,
        beneficiaryName: data.beneficiaryName,
        beneficiaryDob: data.beneficiaryDob ? new Date(data.beneficiaryDob) : undefined,
        countryOfCitizenship: data.countryOfCitizenship,
        countryOfBirth: data.countryOfBirth,
        currentImmigrationStatus: data.currentImmigrationStatus,
        classOfAdmission: data.classOfAdmission,
        i94Number: data.i94Number,
        priorityDate: data.priorityDate ? new Date(data.priorityDate) : undefined,
        status: data.status,
        notes: data.notes,
      },
      create: {
        matterId,
        visaCategory: data.visaCategory || 'Family-Based (AOS)',
        alienRegistrationNum: data.alienRegistrationNum,
        usCISOnlineAccountNum: data.usCISOnlineAccountNum,
        beneficiaryName: data.beneficiaryName,
        beneficiaryDob: data.beneficiaryDob ? new Date(data.beneficiaryDob) : undefined,
        countryOfCitizenship: data.countryOfCitizenship,
        countryOfBirth: data.countryOfBirth,
        currentImmigrationStatus: data.currentImmigrationStatus,
        classOfAdmission: data.classOfAdmission,
        i94Number: data.i94Number,
        priorityDate: data.priorityDate ? new Date(data.priorityDate) : undefined,
        status: data.status || 'Preparation',
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'IMMIGRATION_CASE_UPDATED',
      resourceType: 'IMMIGRATION_CASE',
      resourceId: updated.id,
      details: { matterId, visaCategory: updated.visaCategory, status: updated.status },
    });

    return updated;
  }

  // USCIS Receipts
  static async getReceipts(matterId: string) {
    const immCase = await this.getImmigrationCase(matterId);
    return prisma.uSCISReceiptRecord.findMany({
      where: { immigrationCaseId: immCase.id },
      orderBy: { filingDate: 'desc' },
    });
  }

  static async createReceipt(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.receiptNumber || !data.formType || !data.filingDate) {
      throw AppError.badRequest('Receipt number, form type, and filing date are required');
    }
    const immCase = await this.getImmigrationCase(matterId);

    const receipt = await prisma.uSCISReceiptRecord.create({
      data: {
        immigrationCaseId: immCase.id,
        receiptNumber: data.receiptNumber,
        formType: data.formType,
        filingDate: new Date(data.filingDate),
        noticeDate: data.noticeDate ? new Date(data.noticeDate) : null,
        serviceCenter: data.serviceCenter || null,
        currentStatus: data.currentStatus || 'Case Was Received',
        biometricsDate: data.biometricsDate ? new Date(data.biometricsDate) : null,
        rfeDueDate: data.rfeDueDate ? new Date(data.rfeDueDate) : null,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
        decisionDate: data.decisionDate ? new Date(data.decisionDate) : null,
        notes: data.notes || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'USCIS_RECEIPT_CREATED',
      resourceType: 'USCIS_RECEIPT',
      resourceId: receipt.id,
      details: { receiptNumber: receipt.receiptNumber, formType: receipt.formType },
    });

    return receipt;
  }

  // Parties
  static async getParties(matterId: string) {
    const immCase = await this.getImmigrationCase(matterId);
    return prisma.immigrationParty.findMany({
      where: { immigrationCaseId: immCase.id },
      orderBy: { name: 'asc' },
    });
  }

  static async createParty(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.name || !data.relationshipRole) {
      throw AppError.badRequest('Party name and relationship role are required');
    }
    const immCase = await this.getImmigrationCase(matterId);

    const party = await prisma.immigrationParty.create({
      data: {
        immigrationCaseId: immCase.id,
        name: data.name,
        relationshipRole: data.relationshipRole,
        citizenship: data.citizenship || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'IMMIGRATION_PARTY_CREATED',
      resourceType: 'IMMIGRATION_PARTY',
      resourceId: party.id,
      details: { name: party.name, role: party.relationshipRole },
    });

    return party;
  }
}
