/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Immigration Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ImmigrationService } from './immigration.service.js';

export class ImmigrationController {
  static async getImmigrationCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.getImmigrationCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveImmigrationCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.saveImmigrationCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.getReceipts(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.createReceipt(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getParties(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.getParties(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createParty(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await ImmigrationService.createParty(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
