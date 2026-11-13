import { Response, NextFunction } from 'express';
import { ClientService } from './client.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class ClientController {
  static async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ClientService.getClients(req.query as any);
      res.status(200).json({
        success: true,
        data: result.clients,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getClientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await ClientService.getClientByIdOrNumber(req.params.id);
      res.status(200).json({
        success: true,
        data: { client },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getClientMatters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matters = await ClientService.getClientMatters(req.params.id);
      res.status(200).json({
        success: true,
        data: { matters },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await ClientService.createClient(req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Client record created successfully with ID ${client.clientNumber}.`,
        data: { client },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await ClientService.updateClient(req.params.id, req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Client record '${client.clientNumber}' updated successfully.`,
        data: { client },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await ClientService.setClientStatus(req.params.id, req.body.status, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Client status changed to '${client.status}'.`,
        data: { client },
      });
    } catch (err) {
      next(err);
    }
  }
}
