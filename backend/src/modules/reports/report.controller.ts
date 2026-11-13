import { Response, NextFunction } from 'express';
import { ReportService } from './report.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class ReportController {
  static async getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await ReportService.getDashboardSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getArAging(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ar = await ReportService.getArAging();
      res.status(200).json({
        success: true,
        data: ar,
      });
    } catch (err) {
      next(err);
    }
  }
}

