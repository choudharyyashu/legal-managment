import { Response, NextFunction } from 'express';
import { DocumentService } from './document.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { AppError } from '../../errors/AppError.js';

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

  static async getStorageStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await DocumentService.getStorageStats();
      res.status(200).json({
        success: true,
        data: stats,
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

  static async uploadNewDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const body = req.body || {};

      if (!file && !body.fileContentBase64) {
        throw AppError.badRequest('A file attachment or base64 payload is required.', 'FILE_REQUIRED');
      }

      const result = await DocumentService.createAndUploadDocument(
        {
          matterId: body.matterId,
          clientId: body.clientId,
          title: body.title || file?.originalname || 'Uploaded Document',
          category: body.category || 'Other',
          isPrivileged: body.isPrivileged === true || body.isPrivileged === 'true',
          privilegeType: body.privilegeType,
          revisionNotes: body.revisionNotes,
          fileName: file?.originalname || body.fileName || 'document.bin',
          fileType: file?.mimetype || body.fileType || 'application/octet-stream',
          fileBuffer: file?.buffer,
          fileContentBase64: body.fileContentBase64,
        },
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(201).json({
        success: true,
        message: `Document '${result.document.documentCode}' uploaded and indexed with OCR.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const body = req.body || {};

      const version = await DocumentService.uploadVersion(
        req.params.id,
        {
          fileName: file?.originalname || body.fileName || 'revision.bin',
          fileType: file?.mimetype || body.fileType || 'application/octet-stream',
          fileSizeBytes: file?.size ?? body.fileSizeBytes,
          fileContentBase64: body.fileContentBase64,
          revisionNotes: body.revisionNotes,
        },
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
        file?.buffer
      );

      res.status(201).json({
        success: true,
        message: `Document version '${version.versionLabel}' uploaded successfully.`,
        data: { version },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await DocumentService.getVersions(req.params.id);
      res.status(200).json({
        success: true,
        data: { versions },
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const versionId = req.params.versionId || (req.query.versionId as string | undefined);
      const { version, content } = await DocumentService.downloadDocument(req.params.id, versionId);
      res.setHeader('Content-Type', version.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${version.fileName}"`);
      res.setHeader('X-Document-Version', version.versionLabel);
      res.setHeader('X-SHA256-Checksum', version.sha256Checksum);
      res.status(200).send(content);
    } catch (err) {
      next(err);
    }
  }

  static async restoreVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = await DocumentService.restoreVersion(req.params.id, req.params.versionId, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.status(201).json({
        success: true,
        message: `Historical version restored as new version '${version.versionLabel}'.`,
        data: { version },
      });
    } catch (err) {
      next(err);
    }
  }

  static async runOcrExtraction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const versionId = (req.body?.versionId as string | undefined) || (req.query.versionId as string | undefined);
      const result = await DocumentService.runOcrExtraction(req.params.id, versionId, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.status(200).json({
        success: true,
        message: `OCR & entity extraction completed (${result.extraction.method}).`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOcrDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DocumentService.getOcrDetails(req.params.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyIntegrity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DocumentService.verifyDocumentIntegrity(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const document = await DocumentService.updateDocumentMetadata(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Document '${document.documentCode}' metadata updated.`,
        data: { document },
      });
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
