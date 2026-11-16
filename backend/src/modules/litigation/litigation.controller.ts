/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Litigation Controller
 */

import { Request, Response, NextFunction } from 'express';
import { LitigationService } from './litigation.service.js';

export class LitigationController {
  static async getLitigationCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.getLitigationCase(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async saveLitigationCase(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.saveLitigationCase(matterId, req.body, (req as any).user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getHearings(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.getHearings(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createHearing(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.createHearing(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDiscovery(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.getDiscovery(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscovery(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.createDiscovery(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getPleadings(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.getPleadings(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createPleading(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.createPleading(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getTrialNotebook(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.getTrialNotebook(matterId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createTrialNotebookItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId } = req.params;
      const data = await LitigationService.createTrialNotebookItem(matterId, req.body, (req as any).user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
