/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Document Workflow: Tasks, Reminders & Automation Engine (Sub-Stage E)
 *
 * Implements automated tasks, reminder calculations, statutory turnaround tracking,
 * and retry-safe event handling for:
 * 1. 096 - Letter of Representation
 * 2. 112 - Medical Authorization
 * 3. 113 - Medical Records Request
 * 4. 116 - Incomplete Medical Records Follow-up
 * 5. 140 - Personal Injury Demand Letter & Package
 *
 * Enforces Utah RPC 1.1 (Competence), Utah RPC 1.3 (Diligence),
 * and Utah RPC 1.10 (Ethical Wall Screening).
 */

import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { TaskService } from '../tasks/task.service.js';
import { MatterService } from '../matters/matter.service.js';
import { AuthenticatedUser } from '../auth/auth.types.js';

export interface WorkflowTaskResult {
  task: any;
  isDuplicate: boolean;
  workflow: '096' | '112' | '113' | '116' | '140' | 'GENERAL';
  idempotencyKey: string;
}

export interface ReminderCalculationResult {
  taskId: string;
  taskCode: string;
  title: string;
  dueDate: string;
  reminderSetting: string;
  triggerDate: string;
  isTriggerDue: boolean;
  isAlreadyTriggered: boolean;
  assignedToUserId: string;
  matterId: string;
}

export class PIWorkflowAutomationService {
  /**
   * Helper: Calculates the exact reminder trigger Date based on task due date and reminderSetting.
   * Standard legal practice schedule:
   * - "Same day": trigger on dueDate at 09:00 local/UTC
   * - "1 day prior": dueDate minus 1 day (09:00)
   * - "2 days prior": dueDate minus 2 days (09:00)
   * - "3 days prior": dueDate minus 3 days (09:00)
   * - "1 week prior" / "7 days prior": dueDate minus 7 days (09:00)
   */
  static calculateReminderTriggerDate(dueDate: Date | string, reminderSetting: string | null | undefined): Date {
    const baseDate = new Date(dueDate);
    baseDate.setHours(9, 0, 0, 0);

    const setting = (reminderSetting || '1 day prior').toLowerCase().trim();

    if (setting === 'same day') {
      return baseDate;
    }
    if (setting === '2 days prior') {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - 2);
      return d;
    }
    if (setting === '3 days prior') {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - 3);
      return d;
    }
    if (setting === '1 week prior' || setting === '7 days prior') {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - 7);
      return d;
    }

    // Default: '1 day prior'
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 1);
    return d;
  }

  /**
   * Creates a workflow task idempotently.
   * Checks if an open (non-completed) task already exists on this Matter with the specified idempotency key.
   * If exists, returns the existing task without duplicate insertion.
   */
  static async createIdempotentWorkflowTask(
    params: {
      matterId: string;
      title: string;
      description: string;
      assignedToUserId: string;
      dueDate: Date | string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      reminderSetting?: string;
      urcpRuleReference?: string;
      workflow: '096' | '112' | '113' | '116' | '140' | 'GENERAL';
      idempotencyKey: string;
    },
    context: {
      userId: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<WorkflowTaskResult> {
    const keyTag = `[IDEMPOTENCY_KEY: ${params.idempotencyKey}]`;

    // 1. Check for existing open task
    const existing = await prisma.task.findFirst({
      where: {
        matterId: params.matterId,
        status: { not: 'Completed' },
        OR: [
          { description: { contains: keyTag } },
          { title: params.title },
        ],
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    if (existing) {
      return {
        task: existing,
        isDuplicate: true,
        workflow: params.workflow,
        idempotencyKey: params.idempotencyKey,
      };
    }

    // 2. Format Due Date YYYY-MM-DD
    const dueDateStr = typeof params.dueDate === 'string'
      ? params.dueDate.split('T')[0]
      : params.dueDate.toISOString().split('T')[0];

    // 3. Create task via TaskService
    const taskInput = {
      matterId: params.matterId,
      assignedToUserId: params.assignedToUserId,
      title: params.title,
      description: `${params.description}\n\n${keyTag}`,
      dueDate: dueDateStr,
      priority: params.priority,
      reminderSetting: params.reminderSetting || '1 day prior',
      urcpRuleReference: params.urcpRuleReference,
    };

    const created = await TaskService.createTask(taskInput, context);

    // 4. Audit Log
    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'WORKFLOW_TASK_AUTOMATION_CREATED',
      resourceType: 'TASK',
      resourceId: created.id,
      details: {
        taskCode: created.taskCode,
        workflow: params.workflow,
        idempotencyKey: params.idempotencyKey,
        matterId: params.matterId,
        title: params.title,
        dueDate: dueDateStr,
        priority: params.priority,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      task: created,
      isDuplicate: false,
      workflow: params.workflow,
      idempotencyKey: params.idempotencyKey,
    };
  }

  /**
   * Workflow 1: Letter of Representation (096)
   * Creates review task for auto-drafted Letter of Representation to insurance carrier.
   */
  static async onRepresentationDraftGenerated(
    matter: any,
    draft: any,
    insuranceCarrier: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<WorkflowTaskResult> {
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // 2 business days review window

    return this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Review Document Draft: Letter of Representation - ${insuranceCarrier}`,
        description: `Auto-generated draft '${draft.draftCode}' (Template 096: Letter of Representation) requires attorney review and approval before transmission to ${insuranceCarrier}.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'High',
        reminderSetting: '1 day prior',
        workflow: '096',
        idempotencyKey: `DRAFT_REVIEW_${draft.draftCode}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );
  }

  /**
   * Workflow 2: Medical Authorization (112)
   * Creates staff task to obtain signed HIPAA authorization when medical records are initiated without client signature.
   */
  static async onMissingAuthorizationDetected(
    matter: any,
    recordRequest: any,
    providerName: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<WorkflowTaskResult> {
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 calendar days to obtain client signature

    return this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Obtain Signed Medical Authorization: ${providerName}`,
        description: `Medical record request '${recordRequest.requestCode}' for provider '${providerName}' requires a signed Medical Authorization (Template 112) from the client before transmission is legally permitted under HIPAA & Utah RPC 1.1.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'High',
        reminderSetting: '2 days prior',
        workflow: '112',
        idempotencyKey: `OBTAIN_AUTH_${recordRequest.requestCode}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );
  }

  /**
   * Workflow 2 -> 3 Transition: Authorization Signature Recorded
   * Automatically resolves "Obtain Signed Authorization" task and creates task to transmit request packet to provider.
   */
  static async onAuthorizationSigned(
    matter: any,
    recordRequest: any,
    providerName: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ resolvedTaskCount: number; transmissionTask: WorkflowTaskResult }> {
    // 1. Resolve any open "Obtain Signed Authorization" task for this request
    const authKeyTag = `[IDEMPOTENCY_KEY: OBTAIN_AUTH_${recordRequest.requestCode}]`;
    const openTasks = await prisma.task.findMany({
      where: {
        matterId: matter.id,
        status: { not: 'Completed' },
        description: { contains: authKeyTag },
      },
    });

    let resolvedCount = 0;
    for (const t of openTasks) {
      await prisma.task.update({
        where: { id: t.id },
        data: {
          status: 'Completed',
          completedAt: new Date(),
        },
      });
      resolvedCount++;
      await createAuditLog({
        userId: currentUser.id,
        userRole: currentUser.role,
        action: 'WORKFLOW_TASK_AUTO_COMPLETED',
        resourceType: 'TASK',
        resourceId: t.id,
        details: {
          taskCode: t.taskCode,
          reason: 'Client medical authorization signature evidence recorded',
          requestId: recordRequest.id,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }

    // 2. Create task to transmit records request now that authorization is signed
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // 2 business days to transmit packet

    const transmissionTask = await this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Transmit Medical Records Request: ${providerName}`,
        description: `Authorization signature verified for request '${recordRequest.requestCode}'. Transmit request packet and signed authorization (Template 112/113) to provider '${providerName}'.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'High',
        reminderSetting: '1 day prior',
        workflow: '113',
        idempotencyKey: `TRANSMIT_REQ_${recordRequest.requestCode}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    return {
      resolvedTaskCount: resolvedCount,
      transmissionTask,
    };
  }

  /**
   * Workflow 3: Medical Records Request (113)
   * Enforces transmission readiness: Medical record request CANNOT be transmitted or marked ready to send without signed authorization.
   */
  static validateTransmissionReadiness(recordRequest: {
    authorizationSigned: boolean;
    authorizationDocumentId?: string | null;
    requestCode: string;
  }): void {
    if (!recordRequest.authorizationSigned || !recordRequest.authorizationDocumentId) {
      throw AppError.badRequest(
        `Medical record request '${recordRequest.requestCode}' cannot be marked ready to send or transmitted without a valid signed authorization. Obtain client signature first.`,
        'AUTHORIZATION_REQUIRED'
      );
    }
  }

  /**
   * Workflow 3: Medical Records Statutory Turnaround Tracker
   * When records request is transmitted, schedules a 30-day statutory response follow-up.
   */
  static async onRecordsRequestTransmitted(
    matter: any,
    recordRequest: any,
    providerName: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<WorkflowTaskResult> {
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30-day statutory medical provider turnaround

    return this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Follow-up on Medical Records Delivery: ${providerName}`,
        description: `Medical records request '${recordRequest.requestCode}' was transmitted to '${providerName}'. Provider has 30 statutory days to produce complete medical and billing records.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'Medium',
        reminderSetting: '3 days prior',
        workflow: '113',
        idempotencyKey: `DELIVERY_FOLLOWUP_${recordRequest.requestCode}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );
  }

  /**
   * Workflow 4: Incomplete Medical Records Follow-up (116)
   * Creates actionable staff task when medical records packet is marked incomplete or deficient.
   */
  static async onIncompleteRecordsFollowUpRequired(
    matter: any,
    recordRequest: any,
    providerName: string,
    deficiencyNotes: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<WorkflowTaskResult> {
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5); // 5 business days to cure deficiency

    return this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Follow-up on Incomplete Medical Records: ${providerName}`,
        description: `Records received from '${providerName}' for request '${recordRequest.requestCode}' are DEFICIENT.\nDeficiency Notes: "${deficiencyNotes}"\n\nReview Document 116 follow-up draft and issue formal deficiency notice to medical provider.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'High',
        reminderSetting: '1 day prior',
        workflow: '116',
        idempotencyKey: `INCOMPLETE_FOLLOWUP_${recordRequest.requestCode}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );
  }

  /**
   * Workflow 5: PI Demand Letter (140)
   * Creates high-priority Demand Review task for responsible attorney when demand draft becomes ready.
   */
  static async onDemandDraftReady(
    matter: any,
    demandPackage: any,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<WorkflowTaskResult> {
    const assigneeId = matter.responsibleAttorneyId || currentUser.id;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 business days demand review window

    const amountFormatted = demandPackage.demandedAmount
      ? Number(demandPackage.demandedAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : 'N/A';

    const deadlineDateFormatted = demandPackage.deadlineDate && !isNaN(new Date(demandPackage.deadlineDate).getTime())
      ? new Date(demandPackage.deadlineDate).toISOString().split('T')[0]
      : 'N/A';

    return this.createIdempotentWorkflowTask(
      {
        matterId: matter.id,
        title: `Review PI Demand Package & Demand Letter: ${demandPackage.demandTitle}`,
        description: `Personal Injury Demand Package '${demandPackage.demandTitle}' is ready for attorney review.\n- Demanded Amount: ${amountFormatted}\n- Carrier: ${demandPackage.recipientCarrier}\n- Claim Number: ${demandPackage.claimNumber || 'N/A'}\n- Policy Limit Demand: ${demandPackage.isPolicyLimitDemand ? 'YES' : 'NO'}\n- Response Deadline: ${deadlineDateFormatted}\n\nReview Template 140 draft, supporting medical specials ledgers, and execute approval.`,
        assignedToUserId: assigneeId,
        dueDate,
        priority: 'Critical',
        reminderSetting: '1 day prior',
        workflow: '140',
        idempotencyKey: `DEMAND_REVIEW_${demandPackage.id}`,
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );
  }

  /**
   * Evaluates and processes all scheduled reminders across active tasks.
   * Guarantees persistent multi-instance deduplication via AuditLog without requiring schema migrations.
   */
  static async processScheduledReminders(
    params: {
      asOfDate?: Date | string;
      matterId?: string;
    },
    context: {
      userId: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{
    processedCount: number;
    triggeredReminders: ReminderCalculationResult[];
  }> {
    const asOf = params.asOfDate ? new Date(params.asOfDate) : new Date();

    const where: any = {
      status: { in: ['Not Started', 'In Progress'] },
    };
    if (params.matterId) where.matterId = params.matterId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    const triggeredReminders: ReminderCalculationResult[] = [];

    for (const task of tasks) {
      if (!task.reminderSetting || task.reminderSetting.toLowerCase() === 'none') {
        continue;
      }

      const triggerDate = this.calculateReminderTriggerDate(task.dueDate, task.reminderSetting);
      const isDue = asOf >= triggerDate;

      if (!isDue) {
        continue;
      }

      const dueDateStr = task.dueDate.toISOString().split('T')[0];
      const reminderDedupeKey = `REMINDER_${task.id}_${dueDateStr}_${task.reminderSetting}`;

      // Persistent check via AuditLog to ensure no duplicate reminders are fired
      const audits = await prisma.auditLog.findMany({
        where: {
          resourceType: 'TASK',
          resourceId: task.id,
          action: 'TASK_REMINDER_TRIGGERED',
        },
      });

      const alreadyFired = audits.some((a) => {
        const d = a.details as any;
        return (
          d &&
          (d.dedupeKey === reminderDedupeKey ||
            (d.dueDate === dueDateStr && d.reminderSetting === task.reminderSetting))
        );
      });

      if (alreadyFired) {
        continue; // Already triggered persistently
      }

      // Record persistent reminder event
      await createAuditLog({
        userId: context.userId,
        userRole: context.userRole,
        action: 'TASK_REMINDER_TRIGGERED',
        resourceType: 'TASK',
        resourceId: task.id,
        details: {
          dedupeKey: reminderDedupeKey,
          taskCode: task.taskCode,
          matterId: task.matterId,
          title: task.title,
          dueDate: dueDateStr,
          reminderSetting: task.reminderSetting,
          triggeredAt: asOf.toISOString(),
          assignedToUserId: task.assignedToUserId,
          assignedToName: task.assignee?.name || null,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      triggeredReminders.push({
        taskId: task.id,
        taskCode: task.taskCode,
        title: task.title,
        dueDate: dueDateStr,
        reminderSetting: task.reminderSetting,
        triggerDate: triggerDate.toISOString().split('T')[0],
        isTriggerDue: true,
        isAlreadyTriggered: true,
        assignedToUserId: task.assignedToUserId,
        matterId: task.matterId,
      });
    }

    return {
      processedCount: tasks.length,
      triggeredReminders,
    };
  }

  /**
   * Identifies overdue tasks, updates their status to 'Overdue', and logs observable escalation events.
   */
  static async processOverdueTasks(
    params: {
      asOfDate?: Date | string;
      matterId?: string;
    },
    context: {
      userId: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{
    evaluatedCount: number;
    escalatedCount: number;
    escalatedTasks: any[];
  }> {
    const asOf = params.asOfDate ? new Date(params.asOfDate) : new Date();
    // Compare date boundary (midnight)
    const asOfDateOnly = new Date(asOf.toISOString().split('T')[0]);

    const where: any = {
      status: { in: ['Not Started', 'In Progress'] },
      dueDate: { lt: asOfDateOnly },
    };
    if (params.matterId) where.matterId = params.matterId;

    const overdueTasks = await prisma.task.findMany({
      where,
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    const escalated: any[] = [];

    for (const task of overdueTasks) {
      const updated = await prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'Overdue',
        },
      });

      const daysOverdue = Math.ceil(
        (asOfDateOnly.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      await createAuditLog({
        userId: context.userId,
        userRole: context.userRole,
        action: 'TASK_OVERDUE_ESCALATION',
        resourceType: 'TASK',
        resourceId: task.id,
        details: {
          taskCode: task.taskCode,
          matterId: task.matterId,
          title: task.title,
          dueDate: task.dueDate.toISOString().split('T')[0],
          daysOverdue,
          escalatedAt: asOf.toISOString(),
          assignedToUserId: task.assignedToUserId,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      escalated.push({
        ...updated,
        daysOverdue,
      });
    }

    return {
      evaluatedCount: overdueTasks.length,
      escalatedCount: escalated.length,
      escalatedTasks: escalated,
    };
  }

  /**
   * Retrieves all tasks and workflow status for a specific legal Matter.
   * Strictly enforces Utah RPC 1.10 Ethical Wall screening via MatterService.
   */
  static async getMatterWorkflowTasks(
    matterId: string,
    currentUser: AuthenticatedUser
  ): Promise<{
    matter: any;
    totalTasks: number;
    tasksByWorkflow: Record<string, any[]>;
    overdueTasksCount: number;
    pendingRemindersCount: number;
  }> {
    // 1. Enforce ethical wall and access control
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    // 2. Fetch all tasks for this Matter
    const tasks = await prisma.task.findMany({
      where: { matterId: matter.id },
      orderBy: { dueDate: 'asc' },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    let overdueCount = 0;
    let pendingRemindersCount = 0;

    const tasksByWorkflow: Record<string, any[]> = {
      '096': [],
      '112': [],
      '113': [],
      '116': [],
      '140': [],
      'GENERAL': [],
    };

    for (const t of tasks) {
      const dueDateStr = t.dueDate.toISOString().split('T')[0];
      const dueDate = new Date(dueDateStr);
      const isOverdue = t.status !== 'Completed' && dueDate < today;
      if (isOverdue) overdueCount++;

      let workflowCategory: '096' | '112' | '113' | '116' | '140' | 'GENERAL' = 'GENERAL';
      if (t.description?.includes('096') || t.title.includes('Letter of Representation')) workflowCategory = '096';
      else if (t.description?.includes('112') || t.title.includes('Medical Authorization')) workflowCategory = '112';
      else if (t.description?.includes('113') || t.title.includes('Medical Records Request') || t.title.includes('Delivery')) workflowCategory = '113';
      else if (t.description?.includes('116') || t.title.includes('Incomplete Medical Records')) workflowCategory = '116';
      else if (t.description?.includes('140') || t.title.includes('Demand Package') || t.title.includes('Demand Letter')) workflowCategory = '140';

      const reminderTriggerDate = this.calculateReminderTriggerDate(t.dueDate, t.reminderSetting);
      const reminderTriggerDateStr = reminderTriggerDate.toISOString().split('T')[0];
      const reminderIsDue = t.status !== 'Completed' && new Date() >= reminderTriggerDate;
      if (reminderIsDue) pendingRemindersCount++;

      const enrichedTask = {
        id: t.id,
        taskCode: t.taskCode,
        title: t.title,
        description: t.description,
        assignedToUserId: t.assignedToUserId,
        assigneeName: t.assignee?.name || null,
        dueDate: dueDateStr,
        priority: t.priority,
        status: t.status,
        reminderSetting: t.reminderSetting,
        reminderTriggerDate: reminderTriggerDateStr,
        isOverdue,
        workflowCategory,
      };

      tasksByWorkflow[workflowCategory].push(enrichedTask);
    }

    return {
      matter: {
        id: matter.id,
        matterNumber: matter.matterNumber,
        title: matter.title,
      },
      totalTasks: tasks.length,
      tasksByWorkflow,
      overdueTasksCount: overdueCount,
      pendingRemindersCount,
    };
  }
}
