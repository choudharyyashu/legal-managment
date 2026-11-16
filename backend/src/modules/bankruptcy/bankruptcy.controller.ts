/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Bankruptcy Controller
 */

import { Request, Response, NextFunction } from 'express';
import { BankruptcyService } from './bankruptcy.service.js';

export class BankruptcyController {
  static async getBankruptcyCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.getBankruptcyCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveBankruptcyCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.saveBankruptcyCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getCreditors(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.getCreditors(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createCreditor(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.createCreditor(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.getSchedules(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createScheduleItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await BankruptcyService.createScheduleItem(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
