import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { NotificationService } from './notification.service.js';

export class NotificationController {
  static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.getPreferences(req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.updatePreferences(req.user!.id, req.body, {
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Notification preferences successfully saved.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.resetPreferences(req.user!.id, {
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Notification preferences reset to defaults.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
