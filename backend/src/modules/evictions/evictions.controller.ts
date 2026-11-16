/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Evictions Controller
 */

import { Request, Response, NextFunction } from 'express';
import { EvictionsService } from './evictions.service.js';

export class EvictionsController {
  static async getEvictionsCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await EvictionsService.getEvictionsCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveEvictionsCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await EvictionsService.saveEvictionsCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
