import { Router } from 'express';
import { TrustController } from './trust.controller.js';
import { requireAuth, requirePermission, requireAnyPermission } from '../../middleware/auth.js';
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
  requirePermission('trust:view'),
  validateRequest({ query: trustLedgerQuerySchema }),
  TrustController.getLedgers
);

trustRouter.get(
  '/ledgers/:id',
  requirePermission('trust:view'),
  TrustController.getLedgerById
);

trustRouter.post(
  '/deposits',
  requireAnyPermission(['payments:record', 'trust:view']),
  validateRequest({ body: createTrustDepositSchema }),
  TrustController.depositToTrust
);

trustRouter.post(
  '/disbursements',
  requireAnyPermission(['invoices:manage', 'payments:record', 'trust:view']),
  validateRequest({ body: createTrustDisbursementSchema }),
  TrustController.disburseFromTrust
);

trustRouter.get(
  '/transactions',
  requirePermission('trust:view'),
  TrustController.getTransactions
);

