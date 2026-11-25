import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/auth.types.js';
import { AutomationCatalogService } from './automation-catalog.service.js';
import { AppError } from '../../../errors/AppError.js';

export class AutomationController {
  static async listAutomations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AutomationCatalogService.listAutomations(req.query as any);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = AutomationCatalogService.getSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAutomationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await AutomationCatalogService.getAutomationById(req.params.catalogId);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  static async materializeCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { practiceAreaId, limit } = req.body || {};
      const result = await AutomationCatalogService.materializeCatalog(req.user!.id, {
        practiceAreaId,
        limit: limit ? Number(limit) : undefined,
      });
      res.status(200).json({
        success: true,
        message: `Materialized ${result.totalProcessed} automation templates (${result.createdCount} created, ${result.existingCount} already registered).`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async triggerAutomation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId, customOverrides } = req.body || {};
      if (!matterId) {
        throw AppError.badRequest('matterId is required to trigger a document automation.', 'MATTER_ID_REQUIRED');
      }

      const result = await AutomationCatalogService.triggerAutomation(
        req.params.catalogId,
        matterId,
        req.user!,
        customOverrides || {},
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(result.isDuplicate ? 200 : 201).json({
        success: true,
        message: result.isDuplicate
          ? `Active draft '${result.draft.draftCode}' already exists for ${result.automation.catalogId}.`
          : `Automation ${result.automation.catalogId} generated draft '${result.draft.draftCode}'.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
