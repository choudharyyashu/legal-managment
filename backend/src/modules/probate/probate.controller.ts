/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Probate Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ProbateService } from './probate.service.js';

export class ProbateController {
  static async getProbateCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.getProbateCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveProbateCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.saveProbateCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getBeneficiaries(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.getBeneficiaries(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createBeneficiary(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.createBeneficiary(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.getAssets(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ProbateService.createAsset(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
