import { Router } from 'express';
import { TrustController } from './trust.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createTrustDepositSchema,
  createTrustDisbursementSchema,
  trustLedgerQuerySchema,
} from './trust.validation.js';

export const trustRouter = Router();

trustRouter.use(requireAuth);

trustRouter.get(
  '/ledgers',
  requirePermission('billing:view'),
  validateRequest({ query: trustLedgerQuerySchema }),
  TrustController.getLedgers
);

trustRouter.get(
  '/ledgers/:id',
  requirePermission('billing:view'),
  TrustController.getLedgerById
);

trustRouter.post(
  '/deposits',
  requirePermission('billing:edit'),
  validateRequest({ body: createTrustDepositSchema }),
  TrustController.depositToTrust
);

trustRouter.post(
  '/disbursements',
  requirePermission('billing:edit'),
  validateRequest({ body: createTrustDisbursementSchema }),
  TrustController.disburseFromTrust
);

trustRouter.get(
  '/transactions',
  requirePermission('billing:view'),
  TrustController.getTransactions
);

