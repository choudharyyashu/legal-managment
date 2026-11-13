import { Response, NextFunction } from 'express';
import { CalendarService } from './calendar.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class CalendarController {
  static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await CalendarService.getEvents(req.query as any);
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEventById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.getEventById(req.params.id);
      res.status(200).json({
        success: true,
        data: { event },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.createEvent(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Calendar event created successfully.',
        data: { event },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await CalendarService.updateEvent(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Calendar event updated successfully.',
        data: { event },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await CalendarService.deleteEvent(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Calendar event deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

