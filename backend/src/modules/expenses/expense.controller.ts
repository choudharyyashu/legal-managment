import { Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class ExpenseController {
  static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ExpenseService.getExpenses(req.query as any);
      res.status(200).json({
        success: true,
        data: result.expenses,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getExpenseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.getExpenseById(req.params.id);
      res.status(200).json({
        success: true,
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.createExpense(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Expense logged successfully with code ${expense.expenseCode}.`,
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.updateExpense(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Expense '${expense.expenseCode}' updated successfully.`,
        data: { expense },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ExpenseService.deleteExpense(req.params.id, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
