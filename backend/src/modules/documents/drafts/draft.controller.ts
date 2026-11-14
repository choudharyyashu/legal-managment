import { Response, NextFunction } from 'express';
import { DraftService } from './draft.service.js';
import { AuthenticatedRequest } from '../../auth/auth.types.js';

export class DraftController {
  static async validateDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DraftService.validateDraft(req.body, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async generateDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draft = await DraftService.generateDraft(req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Legal draft '${draft.draftCode}' generated successfully in DOCX format.`,
        data: { draft },
      });
    } catch (err) {
      next(err);
    }
  }

  static async convertDraftToPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draft = await DraftService.convertDraftToPdf(req.params.id, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Draft '${draft.draftCode}' converted to PDF successfully.`,
        data: { draft },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDrafts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DraftService.getDrafts(req.query as any, req.user!);
      res.status(200).json({
        success: true,
        data: result.drafts,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDraftById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draft = await DraftService.getDraftById(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: { draft },
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = (req.query.format as string) || 'docx';
      const { buffer, fileName, contentType, draftCode } = await DraftService.downloadDraft(
        req.params.id,
        format as 'docx' | 'pdf',
        req.user!
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('X-Draft-Code', draftCode);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  }

  static async createFollowUpTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await DraftService.createFollowUpTask(req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Follow-up task '${task.taskCode}' created successfully for missing document information.`,
        data: { task },
      });
    } catch (err) {
      next(err);
    }
  }

  static async approveDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.draftId || req.params.id;
      const result = await DraftService.approveDraft(draftId, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Draft '${result.draft.draftCode}' approved and finalized into legal document '${result.finalDocument.documentCode}'.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.draftId || req.params.id;
      const result = await DraftService.rejectDraft(draftId, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Draft '${result.draft.draftCode}' rejected. Correction task '${result.correctionTask.taskCode}' assigned.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendDraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.draftId || req.params.id;
      const result = await DraftService.sendDraft(draftId, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Approved document draft '${result.draft.draftCode}' successfully transmitted via ${result.transmission.channel}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

