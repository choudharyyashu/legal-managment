import { Router } from 'express';
import { BillingController } from './billing.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  recordPaymentSchema,
  invoiceQuerySchema,
} from './billing.validation.js';

export const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.get(
  '/invoices',
  requirePermission('invoices:view'),
  validateRequest({ query: invoiceQuerySchema }),
  BillingController.getInvoices
);

billingRouter.get(
  '/invoices/:id',
  requirePermission('invoices:view'),
  BillingController.getInvoiceById
);

billingRouter.post(
  '/invoices',
  requirePermission('invoices:create'),
  validateRequest({ body: createInvoiceSchema }),
  BillingController.createInvoice
);

billingRouter.patch(
  '/invoices/:id/status',
  requirePermission('invoices:manage'),
  validateRequest({ body: updateInvoiceStatusSchema }),
  BillingController.updateStatus
);

billingRouter.post(
  '/payments',
  requirePermission('payments:record'),
  validateRequest({ body: recordPaymentSchema }),
  BillingController.recordPayment
);

billingRouter.get(
  '/payments',
  requirePermission('payments:view'),
  BillingController.getPayments
);

