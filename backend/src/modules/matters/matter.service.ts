import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  CreateMatterInput,
  UpdateMatterInput,
  UpdateMatterStatusInput,
  AssignStaffInput,
  MatterQueryInput,
} from './matter.validation.js';
import { MatterResponse, MatterStaffResponse } from './matter.types.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export class MatterService {
  /**
   * Helper to parse Ethical Wall metadata from matter description.
   * Format: [ETHICAL_WALL:ENABLED:Excluded=Paralegal Staff]\n{cleanDescription}
   */
  public static parseEthicalWall(description: string | null): {
    isEthicalWallEnabled: boolean;
    ethicalWallExcludedRole: string | null;
    cleanDescription: string | null;
  } {
    if (!description) {
      return { isEthicalWallEnabled: false, ethicalWallExcludedRole: null, cleanDescription: null };
    }

    const match = description.match(/^\[ETHICAL_WALL:ENABLED(?::Excluded=([^\]]+))?\]\r?\n?/);
    if (match) {
      const excludedRole = match[1] || 'Non-Assigned Personnel';
      const clean = description.replace(match[0], '').trim() || null;
      return {
        isEthicalWallEnabled: true,
        ethicalWallExcludedRole: excludedRole,
        cleanDescription: clean,
      };
    }

    return {
      isEthicalWallEnabled: false,
      ethicalWallExcludedRole: null,
      cleanDescription: description,
    };
  }

  /**
   * Helper to serialize Ethical Wall metadata into description field.
   */
  public static serializeEthicalWall(
    cleanDescription: string | null | undefined,
    isEnabled: boolean,
    excludedRole?: string | null
  ): string | null {
    const desc = cleanDescription?.trim() || '';
    if (!isEnabled) {
      return desc || null;
    }
    const roleTag = excludedRole?.trim() || 'Non-Assigned Personnel';
    return `[ETHICAL_WALL:ENABLED:Excluded=${roleTag}]\n${desc}`.trim();
  }

  /**
   * Concurrency-safe unique matter number generator.
   * Format: {YY}-{PA_CODE}-{SEQUENCE} (e.g., 26-CIV-0101, 26-PI-0102)
   */
  public static async generateMatterNumber(practiceAreaCode: string): Promise<string> {
    const currentYearShort = String(new Date().getFullYear()).slice(-2);
    const prefix = `${currentYearShort}-${practiceAreaCode.toUpperCase()}-`;

    const latestMatter = await prisma.matter.findFirst({
      where: { matterNumber: { startsWith: prefix } },
      orderBy: { matterNumber: 'desc' },
      select: { matterNumber: true },
    });

    let nextSeq = 101;
    if (latestMatter?.matterNumber) {
      const parts = latestMatter.matterNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;

    while (await prisma.matter.findUnique({ where: { matterNumber: candidate } })) {
      nextSeq++;
      candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }

    return candidate;
  }

  /**
   * Validates whether a user has authorized access to a matter under Utah RPC 1.6 & RPC 1.10 Ethical Walls.
   */
  public static isUserAuthorizedForMatter(
    matter: any,
    user: AuthenticatedUser
  ): boolean {
    // 1. Super Admin has firm-wide supervisory authority (Utah RPC 5.1)
    if (user.role === 'super_admin') {
      return true;
    }

    // 2. Lead Responsible Attorney always has access
    if (matter.responsibleAttorneyId === user.id) {
      return true;
    }

    const { isEthicalWallEnabled, ethicalWallExcludedRole } = this.parseEthicalWall(matter.description);

    // 3. If NO ethical wall is enabled, any authenticated user with matters:view is authorized
    if (!isEthicalWallEnabled) {
      return true;
    }

    // 4. When Ethical Wall IS enabled:
    // Check if user is explicitly assigned in MatterStaffAssignment
    const assignments: any[] = matter.staffAssignments || [];
    const assignment = assignments.find((sa) => sa.userId === user.id);

    if (!assignment) {
      // User is completely unassigned on an ethical wall matter -> DENIED
      return false;
    }

    // If an excluded category is defined (e.g. "Paralegal Staff" or role match)
    if (ethicalWallExcludedRole) {
      const lowerExcluded = ethicalWallExcludedRole.toLowerCase();
      if (lowerExcluded.includes('paralegal') && user.role === 'paralegal') {
        return false;
      }
      if (lowerExcluded.includes('attorney') && user.role === 'attorney' && matter.responsibleAttorneyId !== user.id) {
        return false;
      }
    }

    return true;
  }

  /**
   * Formats raw Prisma matter record into consistent frontend MatterResponse
   */
  public static formatMatter(raw: any): MatterResponse {
    const { isEthicalWallEnabled, ethicalWallExcludedRole, cleanDescription } =
      this.parseEthicalWall(raw.description);

    const assignedStaff: MatterStaffResponse[] = (raw.staffAssignments || []).map((sa: any) => ({
      userId: sa.user?.id || sa.userId,
      userCode: sa.user?.userCode || 'USR-xxx',
      name: sa.user?.name || 'Assigned Staff',
      role: sa.user?.role || 'staff',
      title: sa.user?.title || null,
      assignmentRole: sa.assignmentRole,
      assignedAt: sa.assignedAt,
    }));

    return {
      id: raw.id,
      matterNumber: raw.matterNumber,
      clientId: raw.clientId,
      clientName: raw.client?.name || 'Client Entity',
      clientNumber: raw.client?.clientNumber,
      title: raw.title,
      practiceAreaId: raw.practiceAreaId,
      practiceAreaName: raw.practiceArea?.name || 'Practice Area',
      practiceAreaCode: raw.practiceArea?.code || 'GEN',
      practiceAreaColor: raw.practiceArea?.brandColor,
      currentStageId: raw.currentStageId || null,
      status: raw.status,
      responsibleAttorneyId: raw.responsibleAttorneyId,
      responsibleAttorneyName: raw.responsibleAttorney?.name || 'Lead Counsel',
      billingType: raw.billingType,
      hourlyRate: raw.hourlyRate !== null ? Number(raw.hourlyRate) : null,
      flatFeeAmount: raw.flatFeeAmount !== null ? Number(raw.flatFeeAmount) : null,
      contingencyPercentage: raw.contingencyPercentage !== null ? Number(raw.contingencyPercentage) : null,
      budget: Number(raw.budget || 0),
      openDate: raw.openDate instanceof Date ? raw.openDate.toISOString().split('T')[0] : raw.openDate,
      closeDate: raw.closeDate instanceof Date ? raw.closeDate.toISOString().split('T')[0] : raw.closeDate,
      statuteOfLimitations: raw.statuteOfLimitations instanceof Date
        ? raw.statuteOfLimitations.toISOString().split('T')[0]
        : raw.statuteOfLimitations,
      nextCourtDate: raw.nextCourtDate ? new Date(raw.nextCourtDate).toISOString() : null,
      courtName: raw.courtName || null,
      judge: raw.judge || null,
      caseDocketNumber: raw.caseDocketNumber || null,
      description: cleanDescription,
      isEthicalWallEnabled,
      ethicalWallExcludedRole,
      assignedStaff,
      taskCount: raw._count?.tasks || 0,
      documentCount: raw._count?.documents || 0,
      timeEntryCount: raw._count?.timeEntries || 0,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  /**
   * Retrieves paginated list of matters with search, filtering, and Ethical Wall screening
   */
  static async getMatters(
    query: MatterQueryInput,
    currentUser: AuthenticatedUser
  ): Promise<{
    matters: MatterResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      search,
      clientId,
      practiceAreaId,
      responsibleAttorneyId,
      status,
      billingType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (practiceAreaId) where.practiceAreaId = practiceAreaId;
    if (responsibleAttorneyId) where.responsibleAttorneyId = responsibleAttorneyId;
    if (status) where.status = status;
    if (billingType) where.billingType = billingType;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { matterNumber: { contains: search } },
        { courtName: { contains: search } },
        { caseDocketNumber: { contains: search } },
        { client: { name: { contains: search } } },
      ];
    }

    // -------------------------------------------------------------------------
    // ETHICAL WALL LIST SCREENING (Utah RPC 1.10)
    // Non-super_admins must not see or count matters from which they are screened
    // -------------------------------------------------------------------------
    if (currentUser.role !== 'super_admin') {
      where.AND = [
        {
          OR: [
            // Matter does NOT have Ethical Wall enabled
            { description: { not: { contains: '[ETHICAL_WALL:ENABLED' } } },
            { description: null },
            // OR user is the responsible attorney
            { responsibleAttorneyId: currentUser.id },
            // OR user is explicitly assigned
            { staffAssignments: { some: { userId: currentUser.id } } },
          ],
        },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else if (sortBy === 'matterNumber') {
      orderBy.matterNumber = sortOrder;
    } else if (sortBy === 'openDate') {
      orderBy.openDate = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [total, rawMatters] = await Promise.all([
      prisma.matter.count({ where }),
      prisma.matter.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          client: { select: { id: true, clientNumber: true, name: true } },
          practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
          responsibleAttorney: { select: { id: true, name: true, title: true, role: true } },
          staffAssignments: {
            include: {
              user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
            },
          },
          _count: {
            select: { tasks: true, documents: true, timeEntries: true },
          },
        },
      }),
    ]);

    // Extra runtime safety filter
    const visibleMatters = rawMatters.filter((m) => this.isUserAuthorizedForMatter(m, currentUser));
    const formatted = visibleMatters.map((m) => this.formatMatter(m));

    return {
      matters: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves single matter by UUID or matterNumber with Ethical Wall gatekeeper
   */
  static async getMatterByIdOrNumber(
    idOrNumber: string,
    currentUser: AuthenticatedUser
  ): Promise<MatterResponse> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

    const matter = await prisma.matter.findFirst({
      where: isUuid ? { id: idOrNumber } : { matterNumber: idOrNumber },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
        responsibleAttorney: { select: { id: true, name: true, title: true, role: true } },
        staffAssignments: {
          include: {
            user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
          },
        },
        _count: {
          select: { tasks: true, documents: true, timeEntries: true },
        },
      },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${idOrNumber}' was not found.`, 'MATTER_NOT_FOUND');
    }

    // Enforce Ethical Wall
    if (!this.isUserAuthorizedForMatter(matter, currentUser)) {
      throw AppError.forbidden(
        'Access denied: You are screened from this matter under firm ethical boundaries (Utah RPC 1.10).',
        'ETHICAL_WALL_RESTRICTION'
      );
    }

    return this.formatMatter(matter);
  }

  /**
   * Opens / Creates a new legal matter
   */
  static async createMatter(
    input: CreateMatterInput,
    creatorContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<MatterResponse> {
    // 1. Verify Client existence & active state
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
      select: { id: true, clientNumber: true, name: true, status: true },
    });

    if (!client) {
      throw AppError.notFound('Client entity not found.', 'CLIENT_NOT_FOUND');
    }
    if (client.status === 'Inactive') {
      throw AppError.badRequest(
        `Cannot open a matter for inactive client '${client.name}'. Please reactivate client first.`,
        'CLIENT_INACTIVE'
      );
    }

    // 2. Verify Practice Area
    const practiceArea = await prisma.practiceArea.findUnique({
      where: { id: input.practiceAreaId },
      select: { id: true, name: true, code: true, brandColor: true },
    });

    if (!practiceArea) {
      throw AppError.badRequest(`Practice Area '${input.practiceAreaId}' does not exist.`, 'INVALID_PRACTICE_AREA');
    }

    // 3. Verify Responsible Attorney
    const attorney = await prisma.user.findUnique({
      where: { id: input.responsibleAttorneyId },
      select: { id: true, name: true, role: true, status: true },
    });

    if (!attorney || attorney.status !== 'Active') {
      throw AppError.badRequest('Assigned lead attorney is invalid or inactive.', 'INVALID_ATTORNEY');
    }

    // 4. Resolve secondary staff IDs if provided
    const staffIdsToAssign: string[] = [];
    if (input.assignedStaffId) {
      staffIdsToAssign.push(input.assignedStaffId);
    }
    if (Array.isArray(input.assignedStaffIds)) {
      for (const sid of input.assignedStaffIds) {
        if (!staffIdsToAssign.includes(sid)) {
          staffIdsToAssign.push(sid);
        }
      }
    }

    // Verify staff IDs
    for (const sid of staffIdsToAssign) {
      const staffUser = await prisma.user.findUnique({ where: { id: sid }, select: { id: true, status: true } });
      if (!staffUser || staffUser.status !== 'Active') {
        throw AppError.badRequest(`Assigned staff user '${sid}' is invalid or inactive.`, 'INVALID_STAFF');
      }
    }

    // 5. Serialize Ethical Wall metadata into description
    const serializedDescription = this.serializeEthicalWall(
      input.description,
      input.isEthicalWallEnabled,
      input.ethicalWallExcludedRole
    );

    // 6. Concurrency-safe matter number generation with retry loop
    let attempts = 0;
    let newMatter: any = null;

    while (attempts < 3) {
      try {
        const matterNumber = await this.generateMatterNumber(practiceArea.code);

        newMatter = await prisma.$transaction(async (tx) => {
          const m = await tx.matter.create({
            data: {
              matterNumber,
              clientId: client.id,
              title: input.title.trim(),
              practiceAreaId: practiceArea.id,
              status: input.status,
              responsibleAttorneyId: attorney.id,
              billingType: input.billingType,
              hourlyRate: input.billingType === 'Hourly' ? input.hourlyRate : null,
              flatFeeAmount: input.billingType === 'Flat Fee' ? input.flatFeeAmount : null,
              contingencyPercentage: input.billingType === 'Contingency' ? input.contingencyPercentage : null,
              budget: input.budget || 0,
              openDate: input.openDate ? new Date(input.openDate) : new Date(),
              statuteOfLimitations: input.statuteOfLimitations ? new Date(input.statuteOfLimitations) : null,
              nextCourtDate: input.nextCourtDate ? new Date(input.nextCourtDate) : null,
              courtName: input.courtName?.trim() || null,
              judge: input.judge?.trim() || null,
              caseDocketNumber: input.caseDocketNumber?.trim() || null,
              description: serializedDescription,
            },
          });

          // Insert staff assignments
          for (const sid of staffIdsToAssign) {
            await tx.matterStaffAssignment.create({
              data: {
                matterId: m.id,
                userId: sid,
                assignmentRole: input.assignedStaffRole || 'paralegal',
              },
            });
          }

          return tx.matter.findUnique({
            where: { id: m.id },
            include: {
              client: { select: { id: true, clientNumber: true, name: true } },
              practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
              responsibleAttorney: { select: { id: true, name: true, title: true, role: true } },
              staffAssignments: {
                include: {
                  user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
                },
              },
            },
          });
        });

        break;
      } catch (err: any) {
        attempts++;
        if (err.code === 'P2002' && attempts < 3) {
          continue;
        }
        throw err;
      }
    }

    if (!newMatter) {
      throw AppError.internal('Failed to generate unique matter record.');
    }

    await createAuditLog({
      userId: creatorContext.userId,
      userName: creatorContext.userName,
      userRole: creatorContext.userRole,
      action: 'MATTER_CREATED',
      resourceType: 'MATTER',
      resourceId: newMatter.id,
      details: {
        matterNumber: newMatter.matterNumber,
        title: newMatter.title,
        clientName: client.name,
        practiceArea: practiceArea.name,
        billingType: newMatter.billingType,
        isEthicalWallEnabled: input.isEthicalWallEnabled,
      },
      ipAddress: creatorContext.ipAddress,
      userAgent: creatorContext.userAgent,
    });

    return this.formatMatter(newMatter);
  }

  /**
   * Updates an existing matter
   */
  static async updateMatter(
    idOrNumber: string,
    input: UpdateMatterInput,
    updaterUser: AuthenticatedUser,
    updaterContext: { ipAddress?: string; userAgent?: string }
  ): Promise<MatterResponse> {
    const existing = await this.getMatterByIdOrNumber(idOrNumber, updaterUser);

    // Verify practiceArea if changing
    if (input.practiceAreaId && input.practiceAreaId !== existing.practiceAreaId) {
      const pa = await prisma.practiceArea.findUnique({ where: { id: input.practiceAreaId } });
      if (!pa) throw AppError.badRequest('Invalid practice area ID.', 'INVALID_PRACTICE_AREA');
    }

    // Verify attorney if changing
    if (input.responsibleAttorneyId && input.responsibleAttorneyId !== existing.responsibleAttorneyId) {
      const att = await prisma.user.findUnique({ where: { id: input.responsibleAttorneyId } });
      if (!att || att.status !== 'Active') throw AppError.badRequest('Invalid or inactive lead attorney.', 'INVALID_ATTORNEY');
    }

    // Maintain or update ethical wall serialized tag
    let updatedDescription: string | null | undefined = undefined;
    if (input.description !== undefined || input.isEthicalWallEnabled !== undefined || input.ethicalWallExcludedRole !== undefined) {
      const isEnabled = input.isEthicalWallEnabled !== undefined ? input.isEthicalWallEnabled : existing.isEthicalWallEnabled;
      const excluded = input.ethicalWallExcludedRole !== undefined ? input.ethicalWallExcludedRole : existing.ethicalWallExcludedRole;
      const cleanDesc = input.description !== undefined ? input.description : existing.description;
      updatedDescription = this.serializeEthicalWall(cleanDesc, isEnabled, excluded);
    }

    const updated = await prisma.matter.update({
      where: { id: existing.id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.practiceAreaId !== undefined ? { practiceAreaId: input.practiceAreaId } : {}),
        ...(input.responsibleAttorneyId !== undefined ? { responsibleAttorneyId: input.responsibleAttorneyId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.billingType !== undefined ? { billingType: input.billingType } : {}),
        ...(input.hourlyRate !== undefined ? { hourlyRate: input.hourlyRate } : {}),
        ...(input.flatFeeAmount !== undefined ? { flatFeeAmount: input.flatFeeAmount } : {}),
        ...(input.contingencyPercentage !== undefined ? { contingencyPercentage: input.contingencyPercentage } : {}),
        ...(input.budget !== undefined ? { budget: input.budget } : {}),
        ...(input.courtName !== undefined ? { courtName: input.courtName?.trim() || null } : {}),
        ...(input.judge !== undefined ? { judge: input.judge?.trim() || null } : {}),
        ...(input.caseDocketNumber !== undefined ? { caseDocketNumber: input.caseDocketNumber?.trim() || null } : {}),
        ...(input.statuteOfLimitations !== undefined ? { statuteOfLimitations: input.statuteOfLimitations ? new Date(input.statuteOfLimitations) : null } : {}),
        ...(input.nextCourtDate !== undefined ? { nextCourtDate: input.nextCourtDate ? new Date(input.nextCourtDate) : null } : {}),
        ...(updatedDescription !== undefined ? { description: updatedDescription } : {}),
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
        responsibleAttorney: { select: { id: true, name: true, title: true, role: true } },
        staffAssignments: {
          include: {
            user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
          },
        },
      },
    });

    await createAuditLog({
      userId: updaterUser.id,
      userName: updaterUser.email,
      userRole: updaterUser.role,
      action: 'MATTER_UPDATED',
      resourceType: 'MATTER',
      resourceId: updated.id,
      details: {
        matterNumber: updated.matterNumber,
        changes: input,
      },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return this.formatMatter(updated);
  }

  /**
   * Updates matter status / workflow stage
   */
  static async updateMatterStatus(
    idOrNumber: string,
    input: UpdateMatterStatusInput,
    updaterUser: AuthenticatedUser,
    updaterContext: { ipAddress?: string; userAgent?: string }
  ): Promise<MatterResponse> {
    const existing = await this.getMatterByIdOrNumber(idOrNumber, updaterUser);

    const isConcluding = input.status === 'Concluded';

    const updated = await prisma.matter.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        ...(input.currentStageId !== undefined ? { currentStageId: input.currentStageId } : {}),
        closeDate: isConcluding ? new Date() : (existing.status === 'Concluded' ? null : undefined),
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
        responsibleAttorney: { select: { id: true, name: true, title: true, role: true } },
        staffAssignments: {
          include: {
            user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
          },
        },
      },
    });

    await createAuditLog({
      userId: updaterUser.id,
      userName: updaterUser.email,
      userRole: updaterUser.role,
      action: 'MATTER_STATUS_UPDATED',
      resourceType: 'MATTER',
      resourceId: updated.id,
      details: {
        matterNumber: updated.matterNumber,
        previousStatus: existing.status,
        newStatus: input.status,
      },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return this.formatMatter(updated);
  }

  /**
   * Assigns staff member to matter
   */
  static async assignStaff(
    idOrNumber: string,
    input: AssignStaffInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<MatterStaffResponse[]> {
    const matter = await this.getMatterByIdOrNumber(idOrNumber, currentUser);

    const staffUser = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, userCode: true, name: true, role: true, title: true, status: true },
    });

    if (!staffUser || staffUser.status !== 'Active') {
      throw AppError.badRequest('Assigned staff user was not found or is inactive.', 'INVALID_STAFF');
    }

    // Check duplicate assignment
    const existingAssignment = await prisma.matterStaffAssignment.findUnique({
      where: {
        uq_matter_staff: {
          matterId: matter.id,
          userId: input.userId,
        },
      },
    });

    if (existingAssignment) {
      throw AppError.conflict(
        `User '${staffUser.name}' is already assigned to matter '${matter.matterNumber}'.`,
        'DUPLICATE_STAFF_ASSIGNMENT'
      );
    }

    const newAssignment = await prisma.matterStaffAssignment.create({
      data: {
        matterId: matter.id,
        userId: input.userId,
        assignmentRole: input.assignmentRole,
      },
      include: {
        user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userName: currentUser.email,
      userRole: currentUser.role,
      action: 'MATTER_STAFF_ASSIGNED',
      resourceType: 'MATTER',
      resourceId: matter.id,
      details: {
        matterNumber: matter.matterNumber,
        assignedUserId: staffUser.id,
        assignedUserName: staffUser.name,
        role: input.assignmentRole,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const allAssignments = await prisma.matterStaffAssignment.findMany({
      where: { matterId: matter.id },
      include: {
        user: { select: { id: true, userCode: true, name: true, role: true, title: true } },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return allAssignments.map((sa) => ({
      userId: sa.user.id,
      userCode: sa.user.userCode,
      name: sa.user.name,
      role: sa.user.role,
      title: sa.user.title,
      assignmentRole: sa.assignmentRole,
      assignedAt: sa.assignedAt,
    }));
  }

  /**
   * Removes staff assignment from matter
   */
  static async removeStaff(
    idOrNumber: string,
    targetUserId: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ message: string }> {
    const matter = await this.getMatterByIdOrNumber(idOrNumber, currentUser);

    const assignment = await prisma.matterStaffAssignment.findUnique({
      where: {
        uq_matter_staff: {
          matterId: matter.id,
          userId: targetUserId,
        },
      },
      include: { user: { select: { name: true } } },
    });

    if (!assignment) {
      throw AppError.notFound('Staff assignment not found on this matter.', 'ASSIGNMENT_NOT_FOUND');
    }

    await prisma.matterStaffAssignment.delete({
      where: { id: assignment.id },
    });

    await createAuditLog({
      userId: currentUser.id,
      userName: currentUser.email,
      userRole: currentUser.role,
      action: 'MATTER_STAFF_REMOVED',
      resourceType: 'MATTER',
      resourceId: matter.id,
      details: {
        matterNumber: matter.matterNumber,
        removedUserId: targetUserId,
        removedUserName: assignment.user?.name,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { message: `Staff member removed from matter ${matter.matterNumber}.` };
  }
}

