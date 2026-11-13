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
}
