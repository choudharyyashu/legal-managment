/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Controller
 */

import { Request, Response, NextFunction } from 'express';
import { PersonalInjuryService } from './pi.service.js';
import {
  incidentSchema,
  medicalProviderSchema,
  markIncompleteSchema,
} from './pi.validation.js';

export class PersonalInjuryController {
  static async getIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const data = await PersonalInjuryService.getIncident(matterId, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async saveIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = incidentSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.saveIncident(matterId, validated, user, context);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const data = await PersonalInjuryService.getProviders(matterId, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async addProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId } = req.params;
      const user = (req as any).user;
      const validated = medicalProviderSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.addProvider(matterId, validated, user, context);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async markRecordsIncomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const validated = markIncompleteSchema.parse(req.body);
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await PersonalInjuryService.markRecordsIncomplete(id, validated, user, context);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
