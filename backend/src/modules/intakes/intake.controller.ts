import { Response, NextFunction } from 'express';
import { IntakeService } from './intake.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class IntakeController {
  static async getIntakes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IntakeService.getIntakes(req.query as any);
      res.status(200).json({
        success: true,
        data: result.intakes,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getIntakeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const intake = await IntakeService.getIntakeByIdOrNumber(req.params.id);
      res.status(200).json({
        success: true,
        data: { intake },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createIntake(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const intake = await IntakeService.createIntake(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Prospective intake registered with ID ${intake.intakeNumber}.`,
        data: { intake },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateIntake(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const intake = await IntakeService.updateIntake(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Intake '${intake.intakeNumber}' updated successfully.`,
        data: { intake },
      });
    } catch (err) {
      next(err);
    }
  }

  static async runConflictCheck(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IntakeService.runConflictCheck(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: result.hasConflicts
          ? `Conflict Identified: Found ${result.matches.length} prospective adverse match(es).`
          : 'Conflict Clearance Scan Complete: Zero adverse entity matches identified.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async clearConflict(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const intake = await IntakeService.clearConflict(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Intake conflict status updated to '${intake.conflictStatus}'.`,
        data: { intake },
      });
    } catch (err) {
      next(err);
    }
  }

  static async convertToClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IntakeService.convertToClient(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Intake successfully converted to new client record '${result.client.clientNumber}'.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async convertToMatter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IntakeService.convertToMatter(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Intake successfully converted to new legal matter '${result.matter.matterNumber}'.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

