import { Response, NextFunction } from 'express';
import { LedgerService } from './ledger.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class LedgerController {
  static async getChartOfAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await LedgerService.getChartOfAccounts(req.query as any);
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTrialBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asOfDate = req.query.asOfDate as string | undefined;
      const trialBalance = await LedgerService.getTrialBalance(asOfDate);
      res.status(200).json({
        success: true,
        data: trialBalance,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await LedgerService.createAccount(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Chart of Account #${account.accountNumber} created successfully.`,
        data: { account },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJournals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await LedgerService.getJournals(req.query as any);
      res.status(200).json({
        success: true,
        data: result.journals,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJournalById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const journal = await LedgerService.getJournalById(req.params.id);
      res.status(200).json({
        success: true,
        data: { journal },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createJournal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const journal = await LedgerService.createJournal(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `General Ledger Journal ${journal.journalNumber} posted successfully.`,
        data: { journal },
      });
    } catch (err) {
      next(err);
    }
  }
}

