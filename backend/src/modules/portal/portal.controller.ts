import { Request, Response, NextFunction } from 'express';
import { ClientPortalService } from './portal.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class ClientPortalController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, accessCode } = req.body;
      const result = await ClientPortalService.authenticateClient(email, accessCode);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: req.user });
    } catch (err) {
      next(err);
    }
  }

  static async getMatters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const matters = await ClientPortalService.getAuthorizedMatters(clientId);
      res.json({ success: true, data: matters });
    } catch (err) {
      next(err);
    }
  }

  static async getMatterDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const matter = await ClientPortalService.getMatterDetail(clientId, req.params.matterId);
      res.json({ success: true, data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async getMatterDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const docs = await ClientPortalService.getMatterDocuments(clientId, req.params.matterId);
      res.json({ success: true, data: docs });
    } catch (err) {
      next(err);
    }
  }

  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const doc = await ClientPortalService.uploadDocument(clientId, req.params.matterId, req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async getMatterMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const messages = await ClientPortalService.getMatterMessages(clientId, req.params.matterId);
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  static async sendMatterMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const message = await ClientPortalService.sendMatterMessage(clientId, req.params.matterId, req.body.body);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }

  static async signDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const result = await ClientPortalService.signDocument(clientId, {
        documentId: req.params.documentId || req.body.documentId,
        signerName: req.body.signerName,
        signatureImageBase64: req.body.signatureImageBase64,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const invoices = await ClientPortalService.getClientInvoices(clientId);
      res.json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.id || (req.user as any)?.clientId;
      const payments = await ClientPortalService.getClientPayments(clientId);
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  }
}
