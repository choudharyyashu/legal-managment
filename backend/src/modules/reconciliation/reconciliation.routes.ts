import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  liveReconciliationQuerySchema,
  submitReconciliationSchema,
  operatingReconciliationQuerySchema,
  saveOperatingDraftSchema,
  finalizeOperatingSchema,
} from './reconciliation.validation.js';

export const reconciliationRouter = Router();

reconciliationRouter.use(requireAuth);

// =========================================================================
// TRUST THREE-WAY RECONCILIATION ROUTES (ACCOUNT 2100 / 1020 / SUB-LEDGERS)
// =========================================================================

reconciliationRouter.get(
  '/status',
  requireAnyPermission(['trust:view', 'reports:financial_view']),
  validateRequest({ query: liveReconciliationQuerySchema }),
  ReconciliationController.getLiveStatus
);

reconciliationRouter.post(
  '/',
  requireAnyPermission(['trust:view', 'reports:financial_view']),
  validateRequest({ body: submitReconciliationSchema }),
  ReconciliationController.submitReconciliation
);

reconciliationRouter.get(
  '/history',
  requireAnyPermission(['trust:view', 'reports:financial_view']),
  ReconciliationController.getHistory
);

// =========================================================================
// OPERATING BANK RECONCILIATION ROUTES (ACCOUNT 1010)
// Strictly segregated from Trust Three-Way Reconciliation
// =========================================================================

reconciliationRouter.get(
  '/operating/status',
  requireAnyPermission(['billing:view', 'reports:financial_view', 'trust:view']),
  validateRequest({ query: operatingReconciliationQuerySchema }),
  ReconciliationController.getOperatingStatus
);

reconciliationRouter.post(
  '/operating/draft',
  requireAnyPermission(['billing:view', 'reports:financial_view', 'trust:view']),
  validateRequest({ body: saveOperatingDraftSchema }),
  ReconciliationController.saveOperatingDraft
);

reconciliationRouter.post(
  '/operating/finalize',
  requireAnyPermission(['billing:view', 'reports:financial_view', 'trust:view']),
  validateRequest({ body: finalizeOperatingSchema }),
  ReconciliationController.finalizeOperating
);

reconciliationRouter.get(
  '/operating/history',
  requireAnyPermission(['billing:view', 'reports:financial_view', 'trust:view']),
  ReconciliationController.getOperatingHistory
);


