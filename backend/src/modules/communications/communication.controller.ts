/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communications Controller
 */

import { Request, Response, NextFunction } from 'express';
import { CommunicationService } from './communication.service.js';

export class CommunicationController {
  static async getCommunications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { matterId, clientId, type, search } = req.query;
      const data = await CommunicationService.getCommunications(
        {
          matterId: matterId ? String(matterId) : undefined,
          clientId: clientId ? String(clientId) : undefined,
          type: type ? String(type) : undefined,
          searchQuery: search ? String(search) : undefined,
        },
        user
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createCommunication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await CommunicationService.createCommunication(req.body, user);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getUnmatchedQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await CommunicationService.getUnmatchedQueue(user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async matchCommunication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const data = await CommunicationService.matchCommunication(id, req.body, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
