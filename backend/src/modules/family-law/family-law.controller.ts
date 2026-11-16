/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Family Law Controller
 */

import { Request, Response, NextFunction } from 'express';
import { FamilyLawService } from './family-law.service.js';

export class FamilyLawController {
  static async getFamilyLawCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await FamilyLawService.getFamilyLawCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveFamilyLawCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await FamilyLawService.saveFamilyLawCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await FamilyLawService.getOrders(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await FamilyLawService.createOrder(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
