import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import {
  WorkflowStageResponse,
  WorkflowAutoTask,
  MatterChecklistProgress,
} from './workflow.types.js';
import {
  StageQueryInput,
  UpdateStageChecklistInput,
  AddChecklistItemInput,
  AddAutomationRuleInput,
  ToggleMatterChecklistInput,
} from './workflow.validation.js';

export class WorkflowService {
  /**
   * Retrieves all workflow stages directly from the permanent workflow_stages table in MySQL.
   */
  static async getWorkflowStages(query: StageQueryInput = {}): Promise<WorkflowStageResponse[]> {
    const where: any = {};
    if (query.practiceAreaId) {
      where.practiceAreaId = query.practiceAreaId;
    }

    const stages = await prisma.workflowStage.findMany({
      where,
      include: {
        practiceArea: {
          select: { id: true, name: true, code: true, brandColor: true },
        },
        _count: {
          select: { matters: true },
        },
      },
      orderBy: [{ practiceAreaId: 'asc' }, { stageOrder: 'asc' }],
    });

    return stages.map((s) => ({
      id: s.id,
      practiceAreaId: s.practiceAreaId,
      practiceAreaName: s.practiceArea?.name || 'General Practice',
      practiceAreaCode: s.practiceArea?.code || 'GEN',
      brandColor: s.practiceArea?.brandColor || '#06244B',
      stageName: s.stageName,
      stageCode: s.stageCode,
      stageOrder: s.stageOrder,
      requiredFields: Array.isArray(s.requiredFields) ? (s.requiredFields as string[]) : [],
      autoTasks: Array.isArray(s.autoTasks) ? (s.autoTasks as any as WorkflowAutoTask[]) : [],
      isActive: s.isActive,
      matterCount: s._count?.matters || 0,
    }));
  }

  /**
   * Retrieves a single workflow stage by ID from the database.
   */
  static async getStageById(stageId: string): Promise<WorkflowStageResponse> {
    const stage = await prisma.workflowStage.findUnique({
      where: { id: stageId },
      include: {
        practiceArea: {
          select: { id: true, name: true, code: true, brandColor: true },
        },
        _count: {
          select: { matters: true },
        },
      },
    });

    if (!stage) {
      throw AppError.notFound(`Workflow stage '${stageId}' not found in database.`);
    }

    return {
      id: stage.id,
      practiceAreaId: stage.practiceAreaId,
      practiceAreaName: stage.practiceArea?.name || 'General Practice',
      practiceAreaCode: stage.practiceArea?.code || 'GEN',
      brandColor: stage.practiceArea?.brandColor || '#06244B',
      stageName: stage.stageName,
      stageCode: stage.stageCode,
      stageOrder: stage.stageOrder,
      requiredFields: Array.isArray(stage.requiredFields) ? (stage.requiredFields as string[]) : [],
      autoTasks: Array.isArray(stage.autoTasks) ? (stage.autoTasks as any as WorkflowAutoTask[]) : [],
      isActive: stage.isActive,
      matterCount: stage._count?.matters || 0,
    };
  }

  /**
   * Updates master checklist items (requiredFields) on a workflow stage permanently in MySQL.
   */
  static async updateStageChecklist(
    stageId: string,
    input: UpdateStageChecklistInput,
    context: { userId: string; userRole: string }
  ): Promise<WorkflowStageResponse> {
    const existing = await prisma.workflowStage.findUnique({ where: { id: stageId } });
    if (!existing) {
      throw AppError.notFound(`Workflow stage '${stageId}' not found.`);
    }

    const updated = await prisma.workflowStage.update({
      where: { id: stageId },
      data: {
        requiredFields: input.requiredFields as any,
      },
      include: {
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
      },
    });

    return {
      id: updated.id,
      practiceAreaId: updated.practiceAreaId,
      practiceAreaName: updated.practiceArea?.name || 'General Practice',
      practiceAreaCode: updated.practiceArea?.code || 'GEN',
      brandColor: updated.practiceArea?.brandColor || '#06244B',
      stageName: updated.stageName,
      stageCode: updated.stageCode,
      stageOrder: updated.stageOrder,
      requiredFields: Array.isArray(updated.requiredFields) ? (updated.requiredFields as string[]) : [],
      autoTasks: Array.isArray(updated.autoTasks) ? (updated.autoTasks as any as WorkflowAutoTask[]) : [],
      isActive: updated.isActive,
    };
  }

  /**
   * Adds an automation rule to a stage's autoTasks permanently in MySQL.
   */
  static async addAutomationRule(
    stageId: string,
    input: AddAutomationRuleInput,
    context: { userId: string; userRole: string }
  ): Promise<WorkflowStageResponse> {
    const stage = await prisma.workflowStage.findUnique({ where: { id: stageId } });
    if (!stage) {
      throw AppError.notFound(`Workflow stage '${stageId}' not found.`);
    }

    const currentTasks = Array.isArray(stage.autoTasks) ? (stage.autoTasks as any[]) : [];
    const newRule: WorkflowAutoTask = {
      title: input.title.trim(),
      role: input.role.trim(),
      dueDays: input.dueDays,
      priority: input.priority,
    };

    const updated = await prisma.workflowStage.update({
      where: { id: stageId },
      data: {
        autoTasks: [...currentTasks, newRule] as any,
      },
      include: {
        practiceArea: { select: { id: true, name: true, code: true, brandColor: true } },
      },
    });

    return {
      id: updated.id,
      practiceAreaId: updated.practiceAreaId,
      practiceAreaName: updated.practiceArea?.name || 'General Practice',
      practiceAreaCode: updated.practiceArea?.code || 'GEN',
      brandColor: updated.practiceArea?.brandColor || '#06244B',
      stageName: updated.stageName,
      stageCode: updated.stageCode,
      stageOrder: updated.stageOrder,
      requiredFields: Array.isArray(updated.requiredFields) ? (updated.requiredFields as string[]) : [],
      autoTasks: Array.isArray(updated.autoTasks) ? (updated.autoTasks as any as WorkflowAutoTask[]) : [],
      isActive: updated.isActive,
    };
  }

  /**
   * Retrieves matter-specific checklist progress without mutating or overwriting master templates.
   */
  static async getMatterChecklistProgress(matterId: string): Promise<MatterChecklistProgress> {
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        practiceArea: true,
        currentStage: true,
        stageHistories: {
          orderBy: { transitionedAt: 'asc' },
        },
      },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${matterId}' not found.`);
    }

    const stages = await prisma.workflowStage.findMany({
      where: { practiceAreaId: matter.practiceAreaId },
      orderBy: { stageOrder: 'asc' },
    });

    // Collate all verified gatekeepers recorded across stage histories
    const verifiedGatekeepersByStage = new Map<string, Set<string>>();
    for (const h of matter.stageHistories) {
      const stageId = h.toStageId || h.fromStageId;
      if (stageId && Array.isArray(h.verifiedGatekeepers)) {
        if (!verifiedGatekeepersByStage.has(stageId)) {
          verifiedGatekeepersByStage.set(stageId, new Set());
        }
        for (const item of h.verifiedGatekeepers as string[]) {
          verifiedGatekeepersByStage.get(stageId)!.add(item);
        }
      }
    }

    let totalChecklistItems = 0;
    let totalCompletedItems = 0;

    const stagesProgress = stages.map((s) => {
      const isCurrent = s.id === matter.currentStageId;
      const reqFields = Array.isArray(s.requiredFields) ? (s.requiredFields as string[]) : [];
      const verifiedSet = verifiedGatekeepersByStage.get(s.id) || new Set<string>();

      // If matter has already advanced past this stage, completed items are verified
      const isPastStage = Boolean(matter.currentStage && s.stageOrder < matter.currentStage.stageOrder);
      const verifiedItems = isPastStage
        ? reqFields
        : reqFields.filter((f) => verifiedSet.has(f));

      totalChecklistItems += reqFields.length;
      totalCompletedItems += verifiedItems.length;

      return {
        stageId: s.id,
        stageName: s.stageName,
        stageCode: s.stageCode,
        stageOrder: s.stageOrder,
        isCurrent,
        requiredFields: reqFields,
        verifiedGatekeepers: verifiedItems,
        completedCount: verifiedItems.length,
        totalCount: reqFields.length,
        isStageComplete: reqFields.length > 0 && verifiedItems.length >= reqFields.length,
      };
    });

    const overallProgressPercent = totalChecklistItems > 0
      ? Math.round((totalCompletedItems / totalChecklistItems) * 100)
      : 0;

    return {
      matterId: matter.id,
      matterNumber: matter.matterNumber,
      matterTitle: matter.title,
      practiceAreaId: matter.practiceAreaId,
      practiceAreaName: matter.practiceArea?.name || 'General Practice',
      currentStageId: matter.currentStageId,
      currentStageName: matter.currentStage?.stageName || null,
      stages: stagesProgress,
      overallProgressPercent,
    };
  }

  /**
   * Toggles or updates an individual matter checklist gatekeeper record in matter_stage_histories.
   */
  static async toggleMatterChecklist(
    matterId: string,
    input: ToggleMatterChecklistInput,
    context: { userId: string; userRole: string }
  ): Promise<MatterChecklistProgress> {
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { currentStage: true },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${matterId}' not found.`);
    }

    const stageId = input.stageId || matter.currentStageId;
    if (!stageId) {
      throw AppError.badRequest('No stage specified and matter has no active currentStageId.');
    }

    // Find latest stage history record for this stage or create one
    let history = await prisma.matterStageHistory.findFirst({
      where: { matterId, toStageId: stageId },
      orderBy: { transitionedAt: 'desc' },
    });

    let gatekeepers: string[] = [];
    if (history && Array.isArray(history.verifiedGatekeepers)) {
      gatekeepers = [...(history.verifiedGatekeepers as string[])];
    }

    if (input.completed) {
      if (!gatekeepers.includes(input.itemText)) {
        gatekeepers.push(input.itemText);
      }
    } else {
      gatekeepers = gatekeepers.filter((item) => item !== input.itemText);
    }

    if (history) {
      await prisma.matterStageHistory.update({
        where: { id: history.id },
        data: { verifiedGatekeepers: gatekeepers as any },
      });
    } else {
      await prisma.matterStageHistory.create({
        data: {
          matterId,
          toStageId: stageId,
          transitionedByUserId: context.userId,
          verifiedGatekeepers: gatekeepers as any,
        },
      });
    }

    return this.getMatterChecklistProgress(matterId);
  }
}
