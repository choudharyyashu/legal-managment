import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  liveReconciliationQuerySchema,
  submitReconciliationSchema,
} from './reconciliation.validation.js';

export const reconciliationRouter = Router();

reconciliationRouter.use(requireAuth);

reconciliationRouter.get(
  '/status',
  requirePermission('billing:view'),
  validateRequest({ query: liveReconciliationQuerySchema }),
  ReconciliationController.getLiveStatus
);

reconciliationRouter.post(
  '/',
  requirePermission('billing:edit'),
  validateRequest({ body: submitReconciliationSchema }),
  ReconciliationController.submitReconciliation
);

reconciliationRouter.get(
  '/history',
  requirePermission('billing:view'),
  ReconciliationController.getHistory
);
