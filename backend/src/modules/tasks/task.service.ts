import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './task.validation.js';
import { TaskResponse, TaskListQuery } from './task.types.js';

export class TaskService {
  private static async generateTaskCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.task.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `TSK-${year}-${sequence}`;
      const existing = await prisma.task.findUnique({ where: { taskCode: candidate } });
      if (!existing) return candidate;
    }
    return `TSK-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static formatResponse(task: any): TaskResponse {
    return {
      id: task.id,
      taskCode: task.taskCode,
      matterId: task.matterId,
      matterNumber: task.matter?.matterNumber || null,
      matterTitle: task.matter?.title || null,
      title: task.title,
      description: task.description || null,
      assignedToUserId: task.assignedToUserId,
      assignedToName: task.assignee?.name || null,
      createdByUserId: task.createdByUserId,
      createdByName: task.creator?.name || null,
      dueDate: task.dueDate.toISOString().split('T')[0],
      priority: task.priority,
      status: task.status,
      completedAt: task.completedAt?.toISOString() || null,
      reminderSetting: task.reminderSetting || null,
      urcpRuleReference: task.urcpRuleReference || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  static async getTasks(query: TaskListQuery): Promise<{ tasks: TaskResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.assignedToUserId) where.assignedToUserId = query.assignedToUserId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { taskCode: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'dueDate']: query.sortOrder || 'asc' },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          assignee: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      tasks: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTaskByIdOrCode(idOrCode: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        OR: [{ id: idOrCode }, { taskCode: idOrCode }],
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      throw AppError.notFound(`Task '${idOrCode}' not found.`, 'TASK_NOT_FOUND');
    }
    return this.formatResponse(task);
  }

  static async createTask(
    input: CreateTaskInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TaskResponse> {
    // Validate matter exists
    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.badRequest('Referenced legal matter was not found.', 'MATTER_NOT_FOUND');

    // Validate assignee exists
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToUserId } });
    if (!assignee || assignee.status !== 'Active') {
      throw AppError.badRequest('Assigned staff member is invalid or inactive.', 'INVALID_ASSIGNEE');
    }

    const taskCode = await this.generateTaskCode();

    const created = await prisma.task.create({
      data: {
        taskCode,
        matterId: input.matterId,
        title: input.title,
        description: input.description,
        assignedToUserId: input.assignedToUserId,
        createdByUserId: context.userId,
        dueDate: new Date(input.dueDate),
        priority: input.priority,
        reminderSetting: input.reminderSetting,
        urcpRuleReference: input.urcpRuleReference,
        status: 'Not Started',
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TASK_CREATED',
      resourceType: 'TASK',
      resourceId: created.id,
      details: { taskCode, title: input.title, matterNumber: matter.matterNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }

  static async updateTask(
    id: string,
    input: UpdateTaskInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TaskResponse> {
    const existing = await this.getTaskByIdOrCode(id);

    const data: any = { ...input };
    if (input.dueDate) data.dueDate = new Date(input.dueDate);
    if (input.status === 'Completed' && existing.status !== 'Completed') {
      data.completedAt = new Date();
    }

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data,
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TASK_UPDATED',
      resourceType: 'TASK',
      resourceId: updated.id,
      details: { taskCode: updated.taskCode, title: updated.title },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async updateStatus(
    id: string,
    input: UpdateTaskStatusInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TaskResponse> {
    const existing = await this.getTaskByIdOrCode(id);

    const completedAt = input.status === 'Completed' ? new Date() : null;

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        completedAt,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TASK_STATUS_UPDATED',
      resourceType: 'TASK',
      resourceId: updated.id,
      details: { taskCode: updated.taskCode, status: input.status },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async deleteTask(
    id: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getTaskByIdOrCode(id);

    await prisma.task.delete({ where: { id: existing.id } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TASK_DELETED',
      resourceType: 'TASK',
      resourceId: existing.id,
      details: { taskCode: existing.taskCode, title: existing.title },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}
