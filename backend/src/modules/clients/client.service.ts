import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  CreateClientInput,
  UpdateClientInput,
  ClientQueryInput,
} from './client.validation.js';
import { ClientResponse, ClientStatus } from './client.types.js';

export class ClientService {
  /**
   * Concurrency-safe unique client number generator.
   * Format: CLI-1001, CLI-1002, etc.
   */
  public static async generateClientNumber(): Promise<string> {
    // Find highest existing client number starting with CLI-
    const latestClient = await prisma.client.findFirst({
      where: { clientNumber: { startsWith: 'CLI-' } },
      orderBy: { clientNumber: 'desc' },
      select: { clientNumber: true },
    });

    let nextNumber = 1001;
    if (latestClient?.clientNumber) {
      const match = latestClient.clientNumber.match(/^CLI-(\d+)$/);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed)) {
          nextNumber = parsed + 1;
        }
      }
    }

    let candidate = `CLI-${nextNumber}`;

    // Extra safety: loop check if candidate already exists
    while (await prisma.client.findUnique({ where: { clientNumber: candidate } })) {
      nextNumber++;
      candidate = `CLI-${nextNumber}`;
    }

    return candidate;
  }

  /**
   * Formats raw Prisma client entity into consistent frontend-ready ClientResponse
   */
  public static formatClient(raw: any): ClientResponse {
    const totalMatters = raw._count?.matters !== undefined
      ? raw._count.matters
      : Array.isArray(raw.matters)
      ? raw.matters.length
      : 0;

    return {
      id: raw.id,
      clientNumber: raw.clientNumber,
      name: raw.name,
      type: raw.clientType,
      clientType: raw.clientType,
      primaryContact: raw.primaryContact || null,
      email: raw.email,
      phone: raw.phone,
      address: raw.address || null,
      assignedAttorneyId: raw.assignedAttorneyId || null,
      assignedAttorneyName: raw.assignedAttorney?.name || null,
      status: raw.status,
      notes: raw.notes || null,
      portalAccessEnabled: raw.portalAccessEnabled || false,
      totalMatters,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  /**
   * Retrieves paginated list of clients with search, filtering, and sorting
   */
  static async getClients(query: ClientQueryInput): Promise<{
    clients: ClientResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      search,
      status,
      clientType,
      type,
      assignedAttorneyId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const resolvedType = clientType || type;
    if (resolvedType) {
      where.clientType = resolvedType;
    }

    if (assignedAttorneyId) {
      where.assignedAttorneyId = assignedAttorneyId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { clientNumber: { contains: search } },
        { email: { contains: search } },
        { primaryContact: { contains: search } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'clientNumber') {
      orderBy.clientNumber = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [total, rawClients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedAttorney: {
            select: { id: true, name: true, title: true, role: true },
          },
          _count: {
            select: { matters: true },
          },
        },
      }),
    ]);

    const clients = rawClients.map((c) => this.formatClient(c));

    return {
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves single client by UUID or clientNumber
   */
  static async getClientByIdOrNumber(idOrNumber: string): Promise<ClientResponse> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

    const client = await prisma.client.findFirst({
      where: isUuid
        ? { id: idOrNumber }
        : { clientNumber: idOrNumber },
      include: {
        assignedAttorney: {
          select: { id: true, name: true, title: true, role: true },
        },
        _count: {
          select: { matters: true },
        },
      },
    });

    if (!client) {
      throw AppError.notFound(`Client '${idOrNumber}' was not found.`, 'CLIENT_NOT_FOUND');
    }

    return this.formatClient(client);
  }

  /**
   * Retrieves matters for a specific client
   */
  static async getClientMatters(clientIdOrNumber: string): Promise<any[]> {
    const client = await this.getClientByIdOrNumber(clientIdOrNumber);

    const matters = await prisma.matter.findMany({
      where: { clientId: client.id },
      include: {
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
        responsibleAttorney: { select: { id: true, name: true, title: true } },
        _count: {
          select: { tasks: true, timeEntries: true, documents: true },
        },
      },
      orderBy: { openDate: 'desc' },
    });

    return matters.map((m) => ({
      id: m.id,
      matterNumber: m.matterNumber,
      title: m.title,
      status: m.status,
      billingType: m.billingType,
      budget: Number(m.budget),
      openDate: m.openDate,
      practiceArea: m.practiceArea,
      responsibleAttorney: m.responsibleAttorney,
      taskCount: m._count?.tasks || 0,
      documentCount: m._count?.documents || 0,
      timeEntryCount: m._count?.timeEntries || 0,
    }));
  }

  /**
   * Creates a new client record
   */
  static async createClient(
    input: CreateClientInput,
    creatorContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ClientResponse> {
    const resolvedType = input.type || input.clientType;
    if (!resolvedType) {
      throw AppError.badRequest('Client type is required.', 'CLIENT_TYPE_REQUIRED');
    }

    // Validate assigned attorney if provided
    if (input.assignedAttorneyId) {
      const attorney = await prisma.user.findUnique({
        where: { id: input.assignedAttorneyId },
        select: { id: true, name: true, role: true, status: true },
      });

      if (!attorney || attorney.status !== 'Active') {
        throw AppError.badRequest(
          'Assigned attorney account was not found or is currently inactive.',
          'INVALID_ATTORNEY'
        );
      }
    }

    // Generate unique clientNumber with collision retry mechanism
    let attempts = 0;
    let newClient: any = null;

    while (attempts < 3) {
      try {
        const clientNumber = await this.generateClientNumber();

        newClient = await prisma.client.create({
          data: {
            clientNumber,
            name: input.name.trim(),
            clientType: resolvedType,
            primaryContact: input.primaryContact?.trim() || null,
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            address: input.address?.trim() || null,
            assignedAttorneyId: input.assignedAttorneyId || null,
            status: input.status || 'Active',
            notes: input.notes?.trim() || null,
            portalAccessEnabled: input.portalAccessEnabled || false,
          },
          include: {
            assignedAttorney: {
              select: { id: true, name: true, title: true, role: true },
            },
          },
        });
        break; // Successfully created
      } catch (err: any) {
        attempts++;
        if (err.code === 'P2002' && attempts < 3) {
          // Unique constraint violation on clientNumber, retry with new number
          continue;
        }
        throw err;
      }
    }

    if (!newClient) {
      throw AppError.internal('Failed to generate unique client record after multiple attempts.');
    }

    await createAuditLog({
      userId: creatorContext.userId,
      userName: creatorContext.userName,
      userRole: creatorContext.userRole,
      action: 'CLIENT_CREATED',
      resourceType: 'CLIENT',
      resourceId: newClient.id,
      details: {
        clientNumber: newClient.clientNumber,
        name: newClient.name,
        clientType: newClient.clientType,
        status: newClient.status,
        assignedAttorneyId: newClient.assignedAttorneyId,
      },
      ipAddress: creatorContext.ipAddress,
      userAgent: creatorContext.userAgent,
    });

    return this.formatClient(newClient);
  }

  /**
   * Updates an existing client record
   */
  static async updateClient(
    idOrNumber: string,
    input: UpdateClientInput,
    updaterContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ClientResponse> {
    const existing = await this.getClientByIdOrNumber(idOrNumber);

    // Validate attorney if updating assigned attorney
    if (input.assignedAttorneyId) {
      const attorney = await prisma.user.findUnique({
        where: { id: input.assignedAttorneyId },
        select: { id: true, name: true, status: true },
      });

      if (!attorney || attorney.status !== 'Active') {
        throw AppError.badRequest(
          'Assigned attorney account was not found or is currently inactive.',
          'INVALID_ATTORNEY'
        );
      }
    }

    const resolvedType = input.type || input.clientType;

    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(resolvedType !== undefined ? { clientType: resolvedType } : {}),
        ...(input.primaryContact !== undefined ? { primaryContact: input.primaryContact?.trim() || null } : {}),
        ...(input.email !== undefined ? { email: input.email.trim().toLowerCase() } : {}),
        ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
        ...(input.address !== undefined ? { address: input.address?.trim() || null } : {}),
        ...(input.assignedAttorneyId !== undefined ? { assignedAttorneyId: input.assignedAttorneyId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
        ...(input.portalAccessEnabled !== undefined ? { portalAccessEnabled: input.portalAccessEnabled } : {}),
      },
      include: {
        assignedAttorney: {
          select: { id: true, name: true, title: true, role: true },
        },
        _count: {
          select: { matters: true },
        },
      },
    });

    await createAuditLog({
      userId: updaterContext.userId,
      userName: updaterContext.userName,
      userRole: updaterContext.userRole,
      action: 'CLIENT_UPDATED',
      resourceType: 'CLIENT',
      resourceId: updated.id,
      details: {
        clientNumber: updated.clientNumber,
        changes: input,
      },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return this.formatClient(updated);
  }

  /**
   * Updates only client status (Active, Prospective, Inactive)
   */
  static async setClientStatus(
    idOrNumber: string,
    status: ClientStatus,
    updaterContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<ClientResponse> {
    const existing = await this.getClientByIdOrNumber(idOrNumber);

    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: { status },
      include: {
        assignedAttorney: {
          select: { id: true, name: true, title: true, role: true },
        },
        _count: {
          select: { matters: true },
        },
      },
    });

    await createAuditLog({
      userId: updaterContext.userId,
      userName: updaterContext.userName,
      userRole: updaterContext.userRole,
      action: 'CLIENT_STATUS_UPDATED',
      resourceType: 'CLIENT',
      resourceId: updated.id,
      details: {
        clientNumber: updated.clientNumber,
        previousStatus: existing.status,
        newStatus: status,
      },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return this.formatClient(updated);
  }
}
