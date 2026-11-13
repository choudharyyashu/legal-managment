import { Response, NextFunction } from 'express';
import { DocumentService } from './document.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class DocumentController {
  static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DocumentService.getDocuments(req.query as any);
      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.getDocumentByIdOrCode(req.params.id);
      res.status(200).json({
        success: true,
        data: { document },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.createDocument(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Document metadata record created with code ${document.documentCode}.`,
        data: { document },
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = await DocumentService.uploadVersion(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Document version '${version.versionLabel}' uploaded successfully.`,
        data: { version },
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { version, content } = await DocumentService.downloadDocument(req.params.id);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${version.fileName}"`);
      res.setHeader('X-Document-Version', version.versionLabel);
      res.setHeader('X-SHA256-Checksum', version.sha256Checksum);
      res.status(200).send(content);
    } catch (err) {
      next(err);
    }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await DocumentService.deleteDocument(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Document record deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
