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
      convertedMatterId: intake.convertedMatterId || null,
      createdAt: intake.createdAt.toISOString(),
      updatedAt: intake.updatedAt.toISOString(),
    };
  }

  static async getIntakes(query: IntakeListQuery): Promise<{ intakes: IntakeResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.conflictStatus) where.conflictStatus = query.conflictStatus;
    if (query.practiceAreaId) where.practiceAreaId = query.practiceAreaId;
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

    const created = await prisma.intake.create({
      data: {
        intakeNumber,
        prospectiveClient: input.prospectiveClient,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        practiceAreaId: input.practiceAreaId,
        adverseParties: input.adverseParties,
        matterSummary: input.matterSummary,
        disputeAmount: input.disputeAmount,
        jurisdictionVenue: input.jurisdictionVenue,
        conflictStatus: 'In Review',
      },
      include: { practiceArea: true },
    });

    // Run automated initial conflict search
    await this.runConflictCheck(created.id, context);

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_CREATED',
      resourceType: 'INTAKE',
      resourceId: created.id,
      details: { intakeNumber, prospectiveClient: input.prospectiveClient },
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

    const updated = await prisma.intake.update({
      where: { id: existing.id },
      data: {
        ...input,
      },
      include: { practiceArea: true, reviewedByUser: true },
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
  ): Promise<{ hasConflicts: boolean; matches: any[] }> {
    const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
    if (!intake) throw AppError.notFound('Intake record not found.');

    const searchTokens = [intake.prospectiveClient, ...intake.adverseParties.split(/[,;\n]+/)].map((t) => t.trim()).filter(Boolean);

    const matches: any[] = [];

    for (const token of searchTokens) {
      if (token.length < 3) continue;

      // 1. Search clients
      const matchedClients = await prisma.client.findMany({
        where: {
          OR: [{ name: { contains: token } }, { primaryContact: { contains: token } }],
        },
        select: { id: true, name: true, clientNumber: true },
      });

      for (const c of matchedClients) {
        matches.push({ entityType: 'Client', id: c.id, label: `${c.name} (${c.clientNumber})`, queried: token });
        await prisma.conflictSearchLog.create({
          data: {
            intakeId: intake.id,
            queriedName: token,
            matchedEntityType: 'Client',
            matchedRecordId: c.id,
            searchedByUserId: context.userId,
          },
        });
      }

      // 2. Search matters
      const matchedMatters = await prisma.matter.findMany({
        where: {
          title: { contains: token },
        },
        select: { id: true, title: true, matterNumber: true },
      });

      for (const m of matchedMatters) {
        matches.push({ entityType: 'Matter', id: m.id, label: `${m.title} (${m.matterNumber})`, queried: token });
        await prisma.conflictSearchLog.create({
          data: {
            intakeId: intake.id,
            queriedName: token,
            matchedEntityType: 'Matter',
            matchedRecordId: m.id,
            searchedByUserId: context.userId,
          },
        });
      }
    }

    const hasConflicts = matches.length > 0;
    const newStatus = hasConflicts ? 'Conflict Identified' : 'Cleared';

    await prisma.intake.update({
      where: { id: intake.id },
      data: { conflictStatus: newStatus },
    });

    return { hasConflicts, matches };
  }

  static async clearConflict(
    id: string,
    input: ClearConflictInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<IntakeResponse> {
    const existing = await this.getIntakeByIdOrNumber(id);

    const updated = await prisma.intake.update({
      where: { id: existing.id },
      data: {
        conflictStatus: input.status,
        conflictNotes: input.notes,
        reviewedByUserId: context.userId,
        reviewedAt: new Date(),
      },
      include: { practiceArea: true, reviewedByUser: true },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INTAKE_CONFLICT_REVIEWED',
      resourceType: 'INTAKE',
      resourceId: updated.id,
      details: { conflictStatus: input.status, notes: input.notes },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async convertToClient(
    id: string,
    input: ConvertToIntakeClientInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ client: any; intake: IntakeResponse }> {
    const intake = await this.getIntakeByIdOrNumber(id);

    if (intake.convertedToClient && intake.convertedClientId) {
      throw AppError.conflict('Intake has already been converted to a client.', 'ALREADY_CONVERTED');
    }

    // Provision new client record using ClientService
    const client = await ClientService.createClient(
      {
        name: intake.prospectiveClient,
        type: input.clientType,
        primaryContact: intake.contactPerson || undefined,
        email: intake.email,
        phone: intake.phone,
        assignedAttorneyId: input.assignedAttorneyId || context.userId,
        notes: `Converted from Intake ${intake.intakeNumber}. Summary: ${intake.matterSummary}`,
      },
      context
    );

    const updatedIntake = await prisma.intake.update({
      where: { id: intake.id },
      data: {
        convertedToClient: true,
        convertedClientId: client.id,
      },
      include: { practiceArea: true, reviewedByUser: true },
    });

    return { client, intake: this.formatResponse(updatedIntake) };
  }

  static async convertToMatter(
    id: string,
    input: ConvertToIntakeMatterInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ matter: any; intake: IntakeResponse }> {
    const intake = await this.getIntakeByIdOrNumber(id);

    let clientId = input.clientId || intake.convertedClientId;
    if (!clientId) {
      // Auto-create client first if needed
      const clientRes = await this.convertToClient(id, { clientType: 'Individual' }, context);
      clientId = clientRes.client.id;
    }

    const matter = await MatterService.createMatter(
      {
        title: `${intake.prospectiveClient} - Legal Matter`,
        clientId,
        practiceAreaId: intake.practiceAreaId || 'pa-civ',
        responsibleAttorneyId: input.responsibleAttorneyId,
        billingType: input.billingType,
        hourlyRate: input.hourlyRate,
        flatFeeAmount: input.flatFeeAmount,
        contingencyPercentage: input.contingencyPercentage,
        description: intake.matterSummary,
      },
      context
    );

    const updatedIntake = await prisma.intake.update({
      where: { id: intake.id },
      data: {
        convertedMatterId: matter.id,
      },
      include: { practiceArea: true, reviewedByUser: true },
    });

    return { matter, intake: this.formatResponse(updatedIntake) };
  }
}
