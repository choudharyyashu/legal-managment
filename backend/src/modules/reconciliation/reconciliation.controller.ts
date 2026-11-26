import { Response, NextFunction } from 'express';
import { ReconciliationService } from './reconciliation.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class ReconciliationController {
  static async getLiveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await ReconciliationService.calculateLiveStatus(req.query as any);
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitReconciliation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await ReconciliationService.submitReconciliation(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Three-Way Reconciliation for ${record.reconciliationMonth} recorded successfully. (Balanced: ${record.isBalanced ? 'YES' : 'NO'})`,
        data: { record },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await ReconciliationService.getHistory();
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================================================================
  // OPERATING RECONCILIATION CONTROLLER ENDPOINTS
  // =========================================================================

  static async getOperatingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await ReconciliationService.getOperatingReconciliationStatus(req.query as any);
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  static async saveOperatingDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await ReconciliationService.saveOperatingDraft(req.body, {
        userId: req.user!.id,
        userName: (req.user as any)?.name,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Draft bank reconciliation for ${req.body.reconciliationPeriod} saved successfully.`,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  static async finalizeOperating(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await ReconciliationService.finalizeOperating(req.body, {
        userId: req.user!.id,
        userName: (req.user as any)?.name,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Operating bank reconciliation for ${req.body.reconciliationPeriod} finalized and certified successfully.`,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOperatingHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await ReconciliationService.getOperatingHistory();
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }
}

