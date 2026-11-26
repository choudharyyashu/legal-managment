import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  CreateIntakeInput,
  UpdateIntakeInput,
  ClearConflictInput,
  ConvertToIntakeClientInput,
  ConvertToIntakeMatterInput,
} from './intake.validation.js';
import { IntakeResponse, IntakeListQuery } from './intake.types.js';
import { ClientService } from '../clients/client.service.js';
import { MatterService } from '../matters/matter.service.js';
import { RelatedPartyService, stripPiMetadataBlock } from '../related-parties/related-party.service.js';
import { normalizePracticeAreaId } from '../../utils/practiceAreaCanonical.js';
import { DocumentEventBus } from '../documents/events/event-bus.js';
import { DOCUMENT_EVENT } from '../documents/events/event.types.js';

export class IntakeService {
  private static async generateIntakeNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.intake.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `INT-${year}-${sequence}`;
      const existing = await prisma.intake.findUnique({ where: { intakeNumber: candidate } });
      if (!existing) return candidate;
    }
    return `INT-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static formatResponse(intake: any): IntakeResponse {
    return {
      id: intake.id,
      intakeNumber: intake.intakeNumber,
      prospectiveClient: intake.prospectiveClient,
      contactPerson: intake.contactPerson || null,
      email: intake.email,
      phone: intake.phone,
      practiceAreaId: intake.practiceAreaId || null,
      practiceAreaName: intake.practiceArea?.name || null,
      adverseParties: intake.adverseParties,
      matterSummary: intake.matterSummary,
      disputeAmount: Number(intake.disputeAmount || 0),
      jurisdictionVenue: intake.jurisdictionVenue || null,
      conflictStatus: intake.conflictStatus,
      reviewedByUserId: intake.reviewedByUserId || null,
      reviewedByName: intake.reviewedByUser?.name || null,
      reviewedAt: intake.reviewedAt?.toISOString() || null,
      conflictNotes: intake.conflictNotes || null,
      convertedToClient: intake.convertedToClient,
      convertedClientId: intake.convertedClientId || null,
      convertedClientNumber: intake.convertedClient?.clientNumber || null,
      convertedClientName: intake.convertedClient?.name || null,
      convertedMatterId: intake.convertedMatterId || null,
      convertedMatterNumber: intake.convertedMatter?.matterNumber || null,
      convertedMatterTitle: intake.convertedMatter?.title || null,
      createdAt: intake.createdAt instanceof Date ? intake.createdAt.toISOString() : intake.createdAt,
      updatedAt: intake.updatedAt instanceof Date ? intake.updatedAt.toISOString() : intake.updatedAt,
    };
  }

  static async getIntakes(query: IntakeListQuery): Promise<{ intakes: IntakeResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.conflictStatus) where.conflictStatus = query.conflictStatus;
    if (query.practiceAreaId) {
      where.practiceAreaId = normalizePracticeAreaId(query.practiceAreaId) || query.practiceAreaId;
    }
    if (query.search) {
      where.OR = [
        { prospectiveClient: { contains: query.search } },
        { intakeNumber: { contains: query.search } },
        { email: { contains: query.search } },
        { adverseParties: { contains: query.search } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.intake.count({ where }),
      prisma.intake.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          practiceArea: true,
          reviewedByUser: { select: { id: true, name: true } },
          convertedClient: { select: { id: true, clientNumber: true, name: true } },
          convertedMatter: { select: { id: true, matterNumber: true, title: true } },
        },
      }),
    ]);

    return {
      intakes: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getIntakeByIdOrNumber(idOrNumber: string): Promise<IntakeResponse> {
    const intake = await prisma.intake.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { intakeNumber: idOrNumber }],
      },
      include: {
        practiceArea: true,
        reviewedByUser: { select: { id: true, name: true } },
        convertedClient: { select: { id: true, clientNumber: true, name: true } },
        convertedMatter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    if (!intake) {
      throw AppError.notFound(`Intake record '${idOrNumber}' not found.`, 'INTAKE_NOT_FOUND');
    }
    return this.formatResponse(intake);
  }

  static async createIntake(
    input: CreateIntakeInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<IntakeResponse> {
    const intakeNumber = await this.generateIntakeNumber();
    const canonicalPracticeAreaId = normalizePracticeAreaId(input.practiceAreaId);

    const created = await prisma.intake.create({
      data: {
        intakeNumber,
        prospectiveClient: input.prospectiveClient,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        practiceAreaId: canonicalPracticeAreaId,
        adverseParties: input.adverseParties,
        matterSummary: input.matterSummary,
        disputeAmount: input.disputeAmount,
        jurisdictionVenue: input.jurisdictionVenue,
        conflictStatus: 'In Review',
      },
      include: { practiceArea: true },
    });

    // Run automated initial conflict search (flags matches vs Review Pending without auto-clearing)
    await this.runConflictCheck(created.id, context);

    // Emit INTAKE_PROSPECT_SAVED event for CAT-002 auto-drafting
    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
      {
        intakeId: created.id,
        prospectiveClient: input.prospectiveClient,
        practiceAreaId: canonicalPracticeAreaId,
        email: input.email,
        phone: input.phone,
        contactPerson: input.contactPerson,
        matterSummary: input.matterSummary,
      },
      {
        user: { id: context.userId, role: context.userRole, name: 'Intake Staff' } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_CREATED',
      resourceType: 'INTAKE',
      resourceId: created.id,
      details: {
        intakeNumber,
        prospectiveClient: input.prospectiveClient,
        practiceAreaId: canonicalPracticeAreaId,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.getIntakeByIdOrNumber(created.id);
  }

  static async updateIntake(
    id: string,
    input: UpdateIntakeInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<IntakeResponse> {
    const existing = await this.getIntakeByIdOrNumber(id);

    // If prospectiveClient or adverseParties changed, invalidate previous conflict clearance (Utah RPC 1.7 stale check)
    const partiesChanged =
      (input.prospectiveClient && input.prospectiveClient.trim() !== existing.prospectiveClient.trim()) ||
      (input.adverseParties && input.adverseParties.trim() !== existing.adverseParties.trim());

    const canonicalPracticeAreaId =
      input.practiceAreaId !== undefined
        ? normalizePracticeAreaId(input.practiceAreaId)
        : undefined;

    const updated = await prisma.intake.update({
      where: { id: existing.id },
      data: {
        ...input,
        ...(canonicalPracticeAreaId !== undefined ? { practiceAreaId: canonicalPracticeAreaId } : {}),
        ...(partiesChanged ? { conflictStatus: 'Not Started', reviewedByUserId: null, reviewedAt: null } : {}),
      },
      include: {
        practiceArea: true,
        reviewedByUser: true,
        convertedClient: { select: { id: true, clientNumber: true, name: true } },
        convertedMatter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_UPDATED',
      resourceType: 'INTAKE',
      resourceId: updated.id,
      details: { intakeNumber: updated.intakeNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async runConflictCheck(
    intakeId: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{
    hasConflicts: boolean;
    matches: any[];
    queriedTerms: string[];
    searchedCategories: any[];
    conflictStatus: string;
  }> {
    const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
    if (!intake) throw AppError.notFound('Intake record not found.');

    const scan = await RelatedPartyService.scanConflicts({
      names: [intake.prospectiveClient, intake.contactPerson, intake.adverseParties],
      emails: [intake.email],
      phones: [intake.phone],
      excludeIntakeId: intake.id,
    });

    const matches = scan.matches.map((m) => ({
      ...m,
      id: m.recordId,
      label: m.recordCode ? `${m.displayName} (${m.recordCode})` : m.displayName,
      queried: m.queriedTerm,
    }));

    const searchLogDelegate = (prisma as any).conflictSearchLog;
    if (searchLogDelegate?.create) {
      for (const m of scan.matches) {
        try {
          await searchLogDelegate.create({
            data: {
              intakeId: intake.id,
              queriedName: m.queriedTerm,
              matchedEntityType: m.entityType,
              matchedRecordId: m.recordId,
              searchedByUserId: context.userId,
            },
          });
        } catch {
          // Non-fatal if test mock only captures partial fields
        }
      }
    }

    // Automated search NEVER claims human clearance/completion without explicit attorney review
    const newStatus = scan.hasConflicts ? 'Conflict Identified' : 'In Review';

    await prisma.intake.update({
      where: { id: intake.id },
      data: {
        conflictStatus: newStatus,
        reviewedByUserId: null,
        reviewedAt: null,
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_CONFLICT_SCAN',
      resourceType: 'INTAKE',
      resourceId: intake.id,
      details: {
        intakeNumber: intake.intakeNumber,
        queriedTerms: scan.queriedTerms,
        matchCount: matches.length,
        searchedCategories: scan.searchedCategories,
        resultingStatus: newStatus,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    // Emit INTAKE_CONFLICT_SEARCH_COMPLETED event for CAT-003 auto-drafting
    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      {
        intakeId: intake.id,
        prospectiveClient: intake.prospectiveClient,
        queriedTerms: scan.queriedTerms,
        conflictStatus: newStatus,
        hasConflicts: scan.hasConflicts,
        matches,
        searchedByUserId: context.userId,
      },
      {
        user: { id: context.userId, role: context.userRole, name: 'Compliance Reviewer' } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    return {
      hasConflicts: scan.hasConflicts,
      matches,
      queriedTerms: scan.queriedTerms,
      searchedCategories: scan.searchedCategories,
      conflictStatus: newStatus,
    };
  }

  static async getConflictLogs(idOrNumber: string) {
    const intake = await this.getIntakeByIdOrNumber(idOrNumber);
    const [searchLogs, auditTrail, currentScan] = await Promise.all([
      prisma.conflictSearchLog
        .findMany({
          where: { intakeId: intake.id },
          include: { searchedByUser: { select: { id: true, name: true } } },
          orderBy: { searchedAt: 'desc' },
          take: 100,
        })
        .catch(() => []),
      prisma.auditLog
        .findMany({
          where: {
            resourceType: 'INTAKE',
            resourceId: intake.id,
            action: { in: ['INTAKE_CONFLICT_SCAN', 'INTAKE_CONFLICT_REVIEWED'] },
          },
          orderBy: { timestamp: 'desc' },
          take: 25,
        })
        .catch(() => []),
      RelatedPartyService.scanConflicts({
        names: [intake.prospectiveClient, intake.contactPerson, intake.adverseParties],
        emails: [intake.email],
        phones: [intake.phone],
        excludeIntakeId: intake.id,
      }),
    ]);

    return {
      intake,
      searchLogs: searchLogs.map((l: any) => ({
        id: l.id,
        queriedName: l.queriedName,
        matchedEntityType: l.matchedEntityType,
        matchedRecordId: l.matchedRecordId,
        searchedByName: l.searchedByUser?.name || null,
        searchedAt: l.searchedAt instanceof Date ? l.searchedAt.toISOString() : l.searchedAt,
      })),
      auditTrail: auditTrail.map((a: any) => ({
        id: a.id,
        action: a.action,
        userName: a.userName,
        details: a.details,
        timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : a.timestamp,
      })),
      liveMatches: currentScan.matches.map((m) => ({
        ...m,
        id: m.recordId,
        label: m.recordCode ? `${m.displayName} (${m.recordCode})` : m.displayName,
        queried: m.queriedTerm,
      })),
      queriedTerms: currentScan.queriedTerms,
      searchedCategories: currentScan.searchedCategories,
    };
  }

  static async clearConflict(
    id: string,
    input: ClearConflictInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<IntakeResponse> {
    const existing = await this.getIntakeByIdOrNumber(id);

    const statusMap: Record<string, string> = {
      REVIEW_COMPLETED: 'Review Completed',
      POTENTIAL_MATCH: 'Conflict Identified',
      NOT_SEARCHED: 'Not Started',
    };
    const resolvedStatus = statusMap[input.status] || input.status;

    const updated = await prisma.intake.update({
      where: { id: existing.id },
      data: {
        conflictStatus: resolvedStatus,
        conflictNotes: input.notes,
        reviewedByUserId: context.userId,
        reviewedAt: new Date(),
      },
      include: {
        practiceArea: true,
        reviewedByUser: true,
        convertedClient: { select: { id: true, clientNumber: true, name: true } },
        convertedMatter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_CONFLICT_REVIEWED',
      resourceType: 'INTAKE',
      resourceId: updated.id,
      details: { conflictStatus: resolvedStatus, notes: input.notes },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  private static isConflictClearedForConversion(status: string): boolean {
    return ['Cleared', 'Waiver Obtained', 'Review Completed', 'REVIEW_COMPLETED'].includes(status);
  }

  static async convertToClient(
    id: string,
    input: ConvertToIntakeClientInput,
    context: { userId: string; userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ client: any; intake: IntakeResponse }> {
    const intake = await this.getIntakeByIdOrNumber(id);

    if (intake.convertedToClient && intake.convertedClientId) {
      throw AppError.conflict('Intake has already been converted to a client.', 'ALREADY_CONVERTED');
    }

    if (!this.isConflictClearedForConversion(intake.conflictStatus)) {
      throw AppError.badRequest(
        `Cannot onboard client: Conflict status is '${intake.conflictStatus}'. Conflict review must be completed (Cleared, Review Completed, or Waiver Obtained) before client creation.`,
        'CONFLICT_NOT_CLEARED'
      );
    }

    const { cleanSummary } = stripPiMetadataBlock(intake.matterSummary);

    // Provision new client record using ClientService
    const client = await ClientService.createClient(
      {
        name: intake.prospectiveClient,
        type: input.clientType,
        primaryContact: intake.contactPerson || undefined,
        email: intake.email,
        phone: intake.phone,
        assignedAttorneyId: input.assignedAttorneyId || context.userId,
        status: 'Active',
        portalAccessEnabled: false,
        notes: `Converted from Intake ${intake.intakeNumber}.${cleanSummary ? ` Summary: ${cleanSummary}` : ''}`,
      },
      {
        userId: context.userId,
        userName: context.userName || 'Legal Staff',
        userRole: context.userRole,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    const updatedIntake = await prisma.intake.update({
      where: { id: intake.id },
      data: {
        convertedToClient: true,
        convertedClientId: client.id,
      },
      include: {
        practiceArea: true,
        reviewedByUser: true,
        convertedClient: { select: { id: true, clientNumber: true, name: true } },
        convertedMatter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    return { client, intake: this.formatResponse(updatedIntake) };
  }

  static async convertToMatter(
    id: string,
    input: ConvertToIntakeMatterInput,
    context: { userId: string; userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ matter: any; intake: IntakeResponse }> {
    const intake = await this.getIntakeByIdOrNumber(id);

    if (intake.convertedMatterId) {
      throw AppError.conflict(
        `Intake '${intake.intakeNumber}' has already been converted to a matter.`,
        'ALREADY_CONVERTED'
      );
    }

    if (!this.isConflictClearedForConversion(intake.conflictStatus)) {
      throw AppError.badRequest(
        `Cannot open matter: Conflict status is '${intake.conflictStatus}'. Conflict review must be completed before matter creation.`,
        'CONFLICT_NOT_CLEARED'
      );
    }

    let clientId = input.clientId || intake.convertedClientId;
    if (!clientId) {
      // Auto-create client first if needed
      const clientRes = await this.convertToClient(id, { clientType: 'Individual' }, context);
      clientId = clientRes.client.id;
    }

    const resolvedPracticeAreaId =
      normalizePracticeAreaId(input.practiceAreaId) ||
      normalizePracticeAreaId(intake.practiceAreaId) ||
      'pa-civ';

    const { cleanSummary } = stripPiMetadataBlock(intake.matterSummary);
    const defaultTitle =
      intake.adverseParties && intake.adverseParties.toLowerCase() !== 'none'
        ? `${intake.prospectiveClient} v. ${intake.adverseParties}`.slice(0, 250)
        : `${intake.prospectiveClient} - Legal Matter`;

    const matter = await MatterService.createMatter(
      {
        title: input.title?.trim() || defaultTitle,
        clientId: clientId as string,
        practiceAreaId: resolvedPracticeAreaId,
        responsibleAttorneyId: input.responsibleAttorneyId,
        assignedStaffId: input.assignedStaffId || undefined,
        billingType: input.billingType,
        hourlyRate: input.hourlyRate ?? undefined,
        flatFeeAmount: input.flatFeeAmount ?? undefined,
        contingencyPercentage: input.contingencyPercentage ?? undefined,
        budget: input.budget ?? Number(intake.disputeAmount || 0),
        status: input.status || 'Active',
        openDate: input.openDate,
        statuteOfLimitations: input.statuteOfLimitations ?? undefined,
        nextCourtDate: input.nextCourtDate ?? undefined,
        courtName: input.courtName !== undefined ? input.courtName : intake.jurisdictionVenue,
        judge: input.judge ?? undefined,
        caseDocketNumber: input.caseDocketNumber ?? undefined,
        assignedStaffRole: 'paralegal',
        isEthicalWallEnabled: input.isEthicalWallEnabled ?? false,
        ethicalWallExcludedRole: input.ethicalWallExcludedRole ?? undefined,
        description: input.description?.trim() || cleanSummary || intake.matterSummary,
      },
      {
        userId: context.userId,
        userName: context.userName || 'Legal Staff',
        userRole: context.userRole,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    const updatedIntake = await prisma.intake.update({
      where: { id: intake.id },
      data: {
        convertedToClient: true,
        convertedClientId: clientId as string,
        convertedMatterId: matter.id,
      },
      include: {
        practiceArea: true,
        reviewedByUser: true,
        convertedClient: { select: { id: true, clientNumber: true, name: true } },
        convertedMatter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    // Emit MATTER_CREATED_FROM_INTAKE event for CAT-010 auto-drafting
    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE,
      {
        intakeId: intake.id,
        intakeNumber: intake.intakeNumber,
        matterId: matter.id,
        matterNumber: matter.matterNumber,
        matterTitle: matter.title,
        clientId: clientId as string,
        clientName: intake.prospectiveClient,
        practiceAreaId: resolvedPracticeAreaId,
        responsibleAttorneyId: input.responsibleAttorneyId,
      },
      {
        user: { id: context.userId, role: context.userRole, name: context.userName || 'Responsible Attorney' } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    // Persist adverse parties / insurers into related_parties table when migrated (non-blocking)
    await RelatedPartyService.seedFromIntakeConversion({
      intake,
      clientId: clientId as string,
      matterId: matter.id,
      userId: context.userId,
    });

    // If Personal Injury, automatically extract structured intake data and save incident + trigger Document 096 Auto-Draft
    const isPI = resolvedPracticeAreaId === 'pa-pi';
    if (isPI && intake.matterSummary.includes('[PI_INTAKE_DATA:')) {
      try {
        const match = intake.matterSummary.match(/\[PI_INTAKE_DATA:\s*([\s\S]*?)\]/);
        if (match && match[1]) {
          const piData = JSON.parse(match[1]);
          const { PersonalInjuryService } = await import('../personal-injury/pi.service.js');
          await PersonalInjuryService.saveIncident(
            matter.id,
            {
              incidentDate: piData.accidentDate || undefined,
              accidentType: piData.accidentType || undefined,
              incidentLocation: piData.accidentLocation || undefined,
              description: piData.incidentDescription || cleanSummary || intake.matterSummary,
              notes: piData.additionalNotes || undefined,
              insurancePolicy: piData.insuranceCompany
                ? {
                    coverageType: 'Liability',
                    insuranceCompany: piData.insuranceCompany,
                    insuredName: piData.insuredName || undefined,
                    claimNumber: piData.claimNumber || undefined,
                    policyNumber: piData.policyNumber || undefined,
                    adjusterName: piData.adjusterName || undefined,
                    adjusterPhone: piData.adjusterPhone || undefined,
                    adjusterEmail: piData.adjusterEmail || undefined,
                    status: 'Active',
                  }
                : undefined,
            },
            {
              id: context.userId,
              name: context.userName || 'Responsible Attorney',
              email: 'attorney@firm.com',
              role: context.userRole,
            } as any,
            {
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
            }
          );
        }
      } catch (err: any) {
        console.warn('[IntakeService] Non-fatal error while triggering PI incident auto-draft on conversion:', err?.message);
      }
    }

    return { matter, intake: this.formatResponse(updatedIntake) };
  }

  static async bookConsultation(
    intakeId: string,
    data: {
      consultationDate: string;
      consultationTime?: string;
      location?: string;
      attorneyId?: string;
      preparationInstructions?: string;
      notes?: string;
    },
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ) {
    const intake = await this.getIntakeByIdOrNumber(intakeId);

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED,
      {
        intakeId: intake.id,
        matterId: intake.convertedMatterId || undefined,
        clientId: intake.convertedClientId || undefined,
        prospectiveClient: intake.prospectiveClient,
        consultationDate: data.consultationDate,
        consultationTime: data.consultationTime,
        location: data.location,
        attorneyId: data.attorneyId,
        preparationInstructions: data.preparationInstructions,
        notes: data.notes,
      },
      {
        user: { id: context.userId, role: context.userRole, name: 'Intake Staff' } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    return { success: true, intakeId: intake.id, consultationDate: data.consultationDate };
  }

  static async rescheduleConsultation(
    intakeId: string,
    data: {
      consultationDate: string;
      consultationTime?: string;
      location?: string;
      attorneyId?: string;
      rescheduleReason?: string;
      notes?: string;
    },
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ) {
    const intake = await this.getIntakeByIdOrNumber(intakeId);

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED,
      {
        intakeId: intake.id,
        matterId: intake.convertedMatterId || undefined,
        clientId: intake.convertedClientId || undefined,
        prospectiveClient: intake.prospectiveClient,
        consultationDate: data.consultationDate,
        consultationTime: data.consultationTime,
        location: data.location,
        attorneyId: data.attorneyId,
        rescheduleReason: data.rescheduleReason,
        notes: data.notes,
      },
      {
        user: { id: context.userId, role: context.userRole, name: 'Intake Staff' } as any,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    return { success: true, intakeId: intake.id, rescheduledDate: data.consultationDate };
  }
}
