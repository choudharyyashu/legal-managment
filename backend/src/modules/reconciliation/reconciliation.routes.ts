import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  liveReconciliationQuerySchema,
  submitReconciliationSchema,
} from './reconciliation.validation.js';

export const reconciliationRouter = Router();

reconciliationRouter.use(requireAuth);

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

