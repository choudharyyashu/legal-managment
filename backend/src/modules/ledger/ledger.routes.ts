import { Router } from 'express';
import { LedgerController } from './ledger.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createJournalSchema } from './ledger.validation.js';

export const ledgerRouter = Router();

ledgerRouter.use(requireAuth);

ledgerRouter.get(
  '/accounts',
  requirePermission('billing:view'),
  LedgerController.getChartOfAccounts
);

ledgerRouter.get(
  '/journals',
  requirePermission('billing:view'),
  LedgerController.getJournals
);

ledgerRouter.get(
  '/journals/:id',
  requirePermission('billing:view'),
  LedgerController.getJournalById
);

ledgerRouter.post(
  '/journals',
  requirePermission('billing:edit'),
  validateRequest({ body: createJournalSchema }),
  LedgerController.createJournal
);

