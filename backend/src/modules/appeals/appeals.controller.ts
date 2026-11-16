/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Appeals Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AppealsService } from './appeals.service.js';

export class AppealsController {
  static async getAppealsCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await AppealsService.getAppealsCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveAppealsCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await AppealsService.saveAppealsCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
