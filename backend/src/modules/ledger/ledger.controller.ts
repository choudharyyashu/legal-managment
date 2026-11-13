import { Response, NextFunction } from 'express';
import { LedgerService } from './ledger.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class LedgerController {
  static async getChartOfAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await LedgerService.getChartOfAccounts();
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJournals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const journals = await LedgerService.getJournals();
      res.status(200).json({
        success: true,
        data: journals,
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

