/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Criminal Controller
 */

import { Request, Response, NextFunction } from 'express';
import { CriminalService } from './criminal.service.js';

export class CriminalController {
  static async getCriminalCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await CriminalService.getCriminalCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveCriminalCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await CriminalService.saveCriminalCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getCharges(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await CriminalService.getCharges(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await CriminalService.createCharge(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
