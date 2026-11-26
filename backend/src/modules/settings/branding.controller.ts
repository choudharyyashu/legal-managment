import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { BrandingService } from './branding.service.js';

export class BrandingController {
  static async getFirmBranding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branding = await BrandingService.getFirmBranding();
      res.status(200).json({
        success: true,
        data: branding,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateFirmBranding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branding = await BrandingService.updateFirmBranding(req.body, {
        userId: req.user!.id,
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Firm branding and letterhead configuration saved successfully.',
        data: branding,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetFirmBranding(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const branding = await BrandingService.resetFirmBranding({
        userId: req.user!.id,
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Firm branding reset to official Utah Law defaults.',
        data: branding,
      });
    } catch (err) {
      next(err);
    }
  }
}
