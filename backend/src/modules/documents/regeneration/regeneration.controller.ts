/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Safe Document Regeneration Controller (Phase 6)
 */

import { Response, NextFunction } from 'express';
import { RegenerationService } from './regeneration.service.js';
import { AuthenticatedRequest } from '../../auth/auth.types.js';
import { AppError } from '../../../errors/AppError.js';

export class RegenerationController {
  static async detectChanges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matterId, changedEntity, changedFields, changeSummary } = req.body;
      if (!matterId || !changedEntity || !changedFields) {
        throw AppError.badRequest('matterId, changedEntity, and changedFields are required.');
      }

      const result = await RegenerationService.detectSourceChanges(
        { matterId, changedEntity, changedFields, changeSummary },
        req.user!,
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOutdatedDrafts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matterId = req.query.matterId as string | undefined;
      const drafts = await RegenerationService.getOutdatedDrafts(matterId, req.user!);

      res.status(200).json({
        success: true,
        data: drafts,
      });
    } catch (err) {
      next(err);
    }
  }

  static async generateCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.id;
      const customOverrides = req.body.customOverrides || {};

      const result = await RegenerationService.generateCandidateVersion(
        draftId,
        customOverrides,
        req.user!,
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(201).json({
        success: true,
        message: `Candidate version '${result.candidateDraftCode}' generated for review.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async compareVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: previousDraftId, candidateId } = req.params;
      const comparison = await RegenerationService.compareVersions(previousDraftId, candidateId, req.user!);

      res.status(200).json({
        success: true,
        data: comparison,
      });
    } catch (err) {
      next(err);
    }
  }

  static async acceptCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: previousDraftId, candidateId } = req.params;
      const result = await RegenerationService.acceptCandidateVersion(
        previousDraftId,
        candidateId,
        req.user!,
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(200).json({
        success: true,
        message: 'Candidate version accepted and promoted to active draft.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: previousDraftId, candidateId } = req.params;
      const { reason } = req.body;

      const result = await RegenerationService.rejectCandidateVersion(
        previousDraftId,
        candidateId,
        reason,
        req.user!,
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(200).json({
        success: true,
        message: 'Candidate version rejected. Previous version preserved.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async markManualEdits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.id;
      const { hasManualEdits } = req.body;

      if (typeof hasManualEdits !== 'boolean') {
        throw AppError.badRequest('hasManualEdits must be a boolean.');
      }

      const updated = await RegenerationService.markManualEdits(
        draftId,
        hasManualEdits,
        req.user!,
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

