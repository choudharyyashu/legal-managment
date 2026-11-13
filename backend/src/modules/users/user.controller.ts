import { Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UserService.getUsers(req.query as any);
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'User account created successfully.',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'User account updated successfully.',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.setUserStatus(req.params.id, req.body.status, {
        userId: req.user!.id,
        userName: req.user!.email,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `User status changed to ${req.body.status}.`,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

