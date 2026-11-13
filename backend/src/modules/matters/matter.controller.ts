import { Response, NextFunction } from 'express';
import { MatterService } from './matter.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class MatterController {
  /**
   * GET /api/v1/matters
   * Paginated listing with search, filtering, and Ethical Wall screening
   */
  static async getMatters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MatterService.getMatters(req.query as any, req.user!);
      res.status(200).json({
        success: true,
        data: result.matters,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/matters/:id
   * Detail by UUID or matterNumber with Ethical Wall enforcement
   */
  static async getMatterById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matter = await MatterService.getMatterByIdOrNumber(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: { matter },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/matters
   * Creates a new legal matter
   */
  static async createMatter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matter = await MatterService.createMatter(req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Matter '${matter.matterNumber}' created successfully.`,
        data: { matter },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/matters/:id
   * Updates an existing legal matter
   */
  static async updateMatter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matter = await MatterService.updateMatter(req.params.id, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Matter '${matter.matterNumber}' updated successfully.`,
        data: { matter },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/matters/:id/status
   * Updates status and stage of a matter
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matter = await MatterService.updateMatterStatus(req.params.id, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Matter '${matter.matterNumber}' status changed to '${matter.status}'.`,
        data: { matter },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/matters/:id/staff
   * Assigns staff member to matter
   */
  static async assignStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignedStaff = await MatterService.assignStaff(req.params.id, req.body, req.user!, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Staff member assigned to matter successfully.',
        data: { assignedStaff },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/matters/:id/staff/:userId
   * Removes staff member assignment from matter
   */
  static async removeStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MatterService.removeStaff(
        req.params.id,
        req.params.userId,
        req.user!,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
}

