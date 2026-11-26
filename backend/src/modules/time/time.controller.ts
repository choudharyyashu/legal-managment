import { Response, NextFunction } from 'express';
import { TimeService } from './time.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class TimeController {
  static async getTimeEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TimeService.getTimeEntries(req.query as any);
      res.status(200).json({
        success: true,
        data: result.entries,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTimeEntryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeService.getTimeEntryById(req.params.id);
      res.status(200).json({
        success: true,
        data: { entry },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeService.createTimeEntry(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Time entry logged successfully with code ${entry.entryCode}.`,
        data: { entry },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeService.updateTimeEntry(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Time entry '${entry.entryCode}' updated successfully.`,
        data: { entry },
      });
    } catch (err) {
      next(err);
    }
  }

  static async approveTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeService.approveTimeEntry(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Time entry status set to '${entry.status}'.`,
        data: { entry },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSuggestedBilling(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await TimeService.getSuggestedBilling();
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  static async convertSuggestedBilling(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await TimeService.convertSuggestedBilling(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Suggested billing item converted to active time entry.',
        data: { entry },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTimeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await TimeService.deleteTimeEntry(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Time entry deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReviewSlots(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slots = await TimeService.getReviewSlots(req.query as any);
      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (err) {
      next(err);
    }
  }

  static async markReviewSlotCompleted(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TimeService.markReviewSlotCompleted(req.params.id, req.body, {
        userId: req.user!.id,
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.slot,
        isAlreadyCompleted: result.isAlreadyCompleted,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReviewFlags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flags = await TimeService.getReviewFlags(req.query as any, {
        userId: req.user!.id,
        userRole: req.user!.role,
      });
      res.status(200).json({
        success: true,
        data: flags,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateReviewFlagStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TimeService.updateReviewFlagStatus(req.params.id, req.body, {
        userId: req.user!.id,
        userName: (req.user as any)?.name || req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.status(200).json({
        success: true,
        message: 'Review flag status updated successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

