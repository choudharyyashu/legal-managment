import { Response, NextFunction } from 'express';
import { TemplateService } from './template.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class TemplateController {
  static async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TemplateService.getTemplates(req.query as any);
      res.status(200).json({
        success: true,
        data: result.templates,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTemplateById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await TemplateService.getTemplateByIdOrCode(req.params.id);
      res.status(200).json({
        success: true,
        data: { template },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await TemplateService.createTemplate(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Document template '${template.templateCode}' created successfully.`,
        data: { template },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await TemplateService.updateTemplate(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Template '${template.templateCode}' updated successfully.`,
        data: { template },
      });
    } catch (err) {
      next(err);
    }
  }

  static async setTemplateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await TemplateService.setTemplateStatus(req.params.id, req.body.isActive, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const statusWord = template.isActive ? 'activated' : 'deactivated';
      res.status(200).json({
        success: true,
        message: `Template '${template.templateCode}' ${statusWord} successfully.`,
        data: { template },
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = await TemplateService.uploadVersion(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Template version '${version.versionNumber}' uploaded successfully.`,
        data: { version },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTemplateVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await TemplateService.getTemplateVersions(req.params.id);
      res.status(200).json({
        success: true,
        data: { versions },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTemplateVersionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = await TemplateService.getTemplateVersionById(req.params.id, req.params.versionId);
      res.status(200).json({
        success: true,
        data: { version },
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadTemplateVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { buffer, fileName, versionNumber, sha256Checksum } =
        await TemplateService.downloadTemplateVersion(req.params.id, req.params.versionId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('X-Template-Version', versionNumber);
      res.setHeader('X-SHA256-Checksum', sha256Checksum);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  }

  static async getFieldMappings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mappings = await TemplateService.getFieldMappings(req.params.id, req.params.versionId);
      res.status(200).json({
        success: true,
        data: { mappings },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createFieldMapping(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mapping = await TemplateService.createFieldMapping(
        req.params.id,
        req.params.versionId,
        req.body,
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(201).json({
        success: true,
        message: `Field mapping for '${mapping.placeholderTag}' created successfully.`,
        data: { mapping },
      });
    } catch (err) {
      next(err);
    }
  }

  static async batchSaveFieldMappings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mappings = await TemplateService.batchSaveFieldMappings(
        req.params.id,
        req.params.versionId,
        req.body,
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: `${mappings.length} field mappings saved successfully.`,
        data: { mappings },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateFieldMapping(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const mapping = await TemplateService.updateFieldMapping(
        req.params.id,
        req.params.versionId,
        req.params.mappingId,
        req.body,
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: `Field mapping '${mapping.placeholderTag}' updated successfully.`,
        data: { mapping },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteFieldMapping(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await TemplateService.deleteFieldMapping(
        req.params.id,
        req.params.versionId,
        req.params.mappingId,
        {
          userId: req.user!.id,
          userRole: req.user!.role,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: 'Field mapping deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

