/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * External Integrations Controller (F05)
 */

import { Request, Response, NextFunction } from 'express';
import { IntegrationsService } from './integrations.service.js';
import { CosmolexBridgeService } from './cosmolex-bridge.service.js';
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

  static async getCosmolexStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await CosmolexBridgeService.getBoundaryStatus();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async stageCosmolexBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { entryIds } = req.body;
      const data = await CosmolexBridgeService.stageExportBatch(entryIds, {
        userId: user?.id || 'system',
        userName: user?.name || user?.email || 'Authorized Staff',
        userRole: user?.role || 'staff',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
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

  static async saveConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providerId = req.params.id as IntegrationProviderId;
      const user = (req as any).user;
      const data = await IntegrationsService.saveConfiguration(providerId, req.body, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providerId = req.params.id as IntegrationProviderId;
      const user = (req as any).user;
      const data = await IntegrationsService.disconnect(providerId, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
