/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * External Integrations Controller (F05)
 */

import { Request, Response, NextFunction } from 'express';
import { IntegrationsService } from './integrations.service.js';
import { IntegrationProviderId } from './integrations.types.js';

export class IntegrationsController {
  static getStatuses(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = IntegrationsService.getStatuses();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providerId = req.params.id as IntegrationProviderId;
      const data = await IntegrationsService.testConnection(providerId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providerId = req.params.id as IntegrationProviderId;
      const data = await IntegrationsService.disconnect(providerId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
