import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { RelatedPartyService } from './related-party.service.js';

export class RelatedPartyController {
  static async listRelatedParties(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matterId = req.params.matterId || (req.query.matterId as string | undefined);
      const clientId = req.params.clientId || (req.query.clientId as string | undefined);
      const result = await RelatedPartyService.listRelatedParties(
        {
          matterId,
          clientId,
          intakeId: req.query.intakeId as string | undefined,
          roleId: req.query.roleId as string | undefined,
          search: req.query.search as string | undefined,
        },
        req.user
      );

      res.status(200).json({
        success: true,
        data: result.parties,
        meta: {
          total: result.parties.length,
          migrationPending: result.migrationPending,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async conflictSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query.q || '');
      const result = await RelatedPartyService.scanConflicts({
        rawQuery: q,
        excludeIntakeId: req.query.excludeIntakeId as string | undefined,
        excludeClientId: req.query.excludeClientId as string | undefined,
        excludeMatterId: req.query.excludeMatterId as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createRelatedParty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = {
        ...req.body,
        ...(req.params.matterId ? { matterId: req.params.matterId } : {}),
        ...(req.params.clientId ? { clientId: req.params.clientId } : {}),
      };
      const party = await RelatedPartyService.createRelatedParty(payload, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Related party added successfully.',
        data: { party },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRelatedParty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const party = await RelatedPartyService.updateRelatedParty(req.params.id, req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Related party updated successfully.',
        data: { party },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRelatedParty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await RelatedPartyService.deleteRelatedParty(req.params.id, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Related party removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
