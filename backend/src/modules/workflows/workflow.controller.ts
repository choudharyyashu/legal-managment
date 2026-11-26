import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { WorkflowService } from './workflow.service.js';

export class WorkflowController {
  static async getWorkflowStages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stages = await WorkflowService.getWorkflowStages(req.query as any);
      res.status(200).json({
        success: true,
        data: stages,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStageById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stage = await WorkflowService.getStageById(req.params.id);
      res.status(200).json({
        success: true,
        data: stage,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStageChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stage = await WorkflowService.updateStageChecklist(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(200).json({
        success: true,
        message: `Workflow stage '${stage.stageName}' checklist updated successfully.`,
        data: stage,
      });
    } catch (err) {
      next(err);
    }
  }

  static async addAutomationRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stage = await WorkflowService.addAutomationRule(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(201).json({
        success: true,
        message: 'New workflow automation rule created and saved to database.',
        data: stage,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMatterChecklistProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await WorkflowService.getMatterChecklistProgress(req.params.id);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleMatterChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await WorkflowService.toggleMatterChecklist(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
      });

      res.status(200).json({
        success: true,
        message: 'Matter checklist progress recorded in database.',
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  }
}
