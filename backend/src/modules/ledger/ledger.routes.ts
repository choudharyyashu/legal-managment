import { Router } from 'express';
import { LedgerController } from './ledger.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createJournalSchema, createAccountSchema } from './ledger.validation.js';

export const ledgerRouter = Router();

ledgerRouter.use(requireAuth);

ledgerRouter.get(
  '/accounts',
  requireAnyPermission(['operating:view', 'trust:view', 'billing:overview_view']),
  LedgerController.getChartOfAccounts
);

ledgerRouter.post(
  '/accounts',
  requireAnyPermission(['invoices:manage', 'payments:record', 'billing:overview_view']),
  validateRequest({ body: createAccountSchema }),
  LedgerController.createAccount
);

ledgerRouter.get(
  '/journals',
  requireAnyPermission(['operating:view', 'trust:view', 'billing:overview_view']),
  LedgerController.getJournals
);

ledgerRouter.get(
  '/journals/:id',
  requireAnyPermission(['operating:view', 'trust:view', 'billing:overview_view']),
  LedgerController.getJournalById
);

ledgerRouter.post(
  '/journals',
  requireAnyPermission(['invoices:manage', 'payments:record', 'billing:overview_view']),
  validateRequest({ body: createJournalSchema }),
  LedgerController.createJournal
);

