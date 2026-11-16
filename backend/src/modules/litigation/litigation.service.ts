/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Litigation Practice Module Service
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class LitigationService {
  /**
   * Retrieve or automatically initialize a LitigationCase for a given matterId
   */
  static async getLitigationCase(matterId: string) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    let litCase = await prisma.litigationCase.findUnique({
      where: { matterId },
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
            status: true,
            practiceArea: true,
            judge: true,
            courtName: true,
            nextCourtDate: true,
            client: { select: { id: true, name: true, clientNumber: true } },
          },
        },
        hearings: { orderBy: { hearingDate: 'asc' } },
        discoveryRequests: { orderBy: { dueDate: 'asc' } },
        pleadings: { orderBy: { createdAt: 'desc' } },
        trialNotebooks: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!litCase) {
      // Check if matter exists
      const matter = await prisma.matter.findUnique({ where: { id: matterId } });
      if (!matter) throw AppError.notFound('Matter not found');

      litCase = await prisma.litigationCase.create({
        data: {
          matterId,
          courtJurisdiction: 'State of Utah',
          courtName: matter.courtName || 'Third Judicial District Court, Salt Lake County',
          presidingJudge: matter.judge || undefined,
          litigationStage: 'Pre-Trial Discovery',
        },
        include: {
          matter: {
            select: {
              id: true,
              title: true,
              matterNumber: true,
              status: true,
              practiceArea: true,
              judge: true,
              courtName: true,
              nextCourtDate: true,
              client: { select: { id: true, name: true, clientNumber: true } },
            },
          },
          hearings: true,
          discoveryRequests: true,
          pleadings: true,
          trialNotebooks: true,
        },
      });
    }

    return litCase;
  }

  static async saveLitigationCase(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!matterId) throw AppError.badRequest('Matter ID is required');

    const updated = await prisma.litigationCase.upsert({
      where: { matterId },
      update: {
        courtJurisdiction: data.courtJurisdiction,
        courtName: data.courtName,
        caseDocketNumber: data.caseDocketNumber,
        presidingJudge: data.presidingJudge,
        juryDemand: data.juryDemand !== undefined ? Boolean(data.juryDemand) : undefined,
        litigationStage: data.litigationStage,
        filingDate: data.filingDate ? new Date(data.filingDate) : undefined,
        trialDate: data.trialDate ? new Date(data.trialDate) : undefined,
        discoveryCutoffDate: data.discoveryCutoffDate ? new Date(data.discoveryCutoffDate) : undefined,
        notes: data.notes,
      },
      create: {
        matterId,
        courtJurisdiction: data.courtJurisdiction || 'State of Utah',
        courtName: data.courtName || 'Third Judicial District Court',
        caseDocketNumber: data.caseDocketNumber,
        presidingJudge: data.presidingJudge,
        juryDemand: Boolean(data.juryDemand),
        litigationStage: data.litigationStage || 'Pre-Filing',
        filingDate: data.filingDate ? new Date(data.filingDate) : undefined,
        trialDate: data.trialDate ? new Date(data.trialDate) : undefined,
        discoveryCutoffDate: data.discoveryCutoffDate ? new Date(data.discoveryCutoffDate) : undefined,
        notes: data.notes,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'LITIGATION_CASE_UPDATED',
      resourceType: 'LITIGATION_CASE',
      resourceId: updated.id,
      details: { matterId, stage: updated.litigationStage },
    });

    return updated;
  }

  // Hearings
  static async getHearings(matterId: string) {
    const litCase = await this.getLitigationCase(matterId);
    return prisma.courtHearing.findMany({
      where: { litigationCaseId: litCase.id },
      orderBy: { hearingDate: 'asc' },
    });
  }

  static async createHearing(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.hearingType || !data.hearingDate) {
      throw AppError.badRequest('Hearing type and hearing date are required');
    }
    const litCase = await this.getLitigationCase(matterId);

    const hearing = await prisma.courtHearing.create({
      data: {
        litigationCaseId: litCase.id,
        hearingType: data.hearingType,
        hearingDate: new Date(data.hearingDate),
        courtroom: data.courtroom || null,
        judgeName: data.judgeName || litCase.presidingJudge || null,
        status: data.status || 'Scheduled',
        notes: data.notes || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'COURT_HEARING_CREATED',
      resourceType: 'COURT_HEARING',
      resourceId: hearing.id,
      details: { hearingType: hearing.hearingType, hearingDate: hearing.hearingDate },
    });

    return hearing;
  }

  // Discovery
  static async getDiscovery(matterId: string) {
    const litCase = await this.getLitigationCase(matterId);
    return prisma.discoveryRequest.findMany({
      where: { litigationCaseId: litCase.id },
      orderBy: { dueDate: 'asc' },
    });
  }

  static async createDiscovery(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.title || !data.category || !data.dueDate) {
      throw AppError.badRequest('Title, category, and due date are required');
    }
    const litCase = await this.getLitigationCase(matterId);

    const discovery = await prisma.discoveryRequest.create({
      data: {
        litigationCaseId: litCase.id,
        title: data.title,
        category: data.category,
        propoundingParty: data.propoundingParty || 'Plaintiff',
        respondingParty: data.respondingParty || 'Defendant',
        servedDate: data.servedDate ? new Date(data.servedDate) : null,
        dueDate: new Date(data.dueDate),
        status: data.status || 'Pending',
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        notes: data.notes || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'DISCOVERY_REQUEST_CREATED',
      resourceType: 'DISCOVERY_REQUEST',
      resourceId: discovery.id,
      details: { title: discovery.title, category: discovery.category },
    });

    return discovery;
  }

  // Pleadings
  static async getPleadings(matterId: string) {
    const litCase = await this.getLitigationCase(matterId);
    return prisma.pleadingRecord.findMany({
      where: { litigationCaseId: litCase.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createPleading(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.title || !data.pleadingType) {
      throw AppError.badRequest('Title and pleading type are required');
    }
    const litCase = await this.getLitigationCase(matterId);

    const pleading = await prisma.pleadingRecord.create({
      data: {
        litigationCaseId: litCase.id,
        title: data.title,
        pleadingType: data.pleadingType,
        filingParty: data.filingParty || 'Plaintiff',
        filedDate: data.filedDate ? new Date(data.filedDate) : null,
        responseDueDate: data.responseDueDate ? new Date(data.responseDueDate) : null,
        status: data.status || 'Draft',
        ecfDocketNumber: data.ecfDocketNumber || null,
        notes: data.notes || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PLEADING_RECORD_CREATED',
      resourceType: 'PLEADING_RECORD',
      resourceId: pleading.id,
      details: { title: pleading.title, type: pleading.pleadingType },
    });

    return pleading;
  }

  // Trial Notebook Items
  static async getTrialNotebook(matterId: string) {
    const litCase = await this.getLitigationCase(matterId);
    return prisma.trialNotebookItem.findMany({
      where: { litigationCaseId: litCase.id },
      orderBy: { orderIndex: 'asc' },
    });
  }

  static async createTrialNotebookItem(matterId: string, data: any, currentUser: AuthenticatedUser) {
    if (!data || !data.section || !data.title) {
      throw AppError.badRequest('Section and title are required');
    }
    const litCase = await this.getLitigationCase(matterId);

    const item = await prisma.trialNotebookItem.create({
      data: {
        litigationCaseId: litCase.id,
        section: data.section,
        title: data.title,
        description: data.description || null,
        admissibility: data.admissibility || 'Pending Stipulation',
        orderIndex: data.orderIndex || 0,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'TRIAL_NOTEBOOK_ITEM_CREATED',
      resourceType: 'TRIAL_NOTEBOOK_ITEM',
      resourceId: item.id,
      details: { section: item.section, title: item.title },
    });

    return item;
  }
}
