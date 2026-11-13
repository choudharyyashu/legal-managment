import { Response, NextFunction } from 'express';
import { TaskService } from './task.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaskService.getTasks(req.query as any);
      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskByIdOrCode(req.params.id);
      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Task record created successfully with code ${task.taskCode}.`,
        data: { task },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Task '${task.taskCode}' updated successfully.`,
        data: { task },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateStatus(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Task '${task.taskCode}' status changed to '${task.status}'.`,
        data: { task },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Task record deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }
}
