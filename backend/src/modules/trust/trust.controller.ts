import { Response, NextFunction } from 'express';
import { TrustService } from './trust.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class TrustController {
  static async getLedgers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TrustService.getLedgers(req.query as any);
      res.status(200).json({
        success: true,
        data: result.ledgers,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLedgerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ledger = await TrustService.getLedgerByIdOrMatter(req.params.id);
      res.status(200).json({
        success: true,
        data: { ledger },
      });
    } catch (err) {
      next(err);
    }
  }

  static async depositToTrust(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TrustService.depositToTrust(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `IOLTA Trust Deposit of $${result.transaction.amount} recorded successfully.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async disburseFromTrust(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TrustService.disburseFromTrust(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `IOLTA Trust Disbursement of $${result.transaction.amount} recorded successfully.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await TrustService.getTransactions();
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (err) {
      next(err);
    }
  }
}
