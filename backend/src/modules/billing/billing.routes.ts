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
  requirePermission('billing:view'),
  validateRequest({ query: invoiceQuerySchema }),
  BillingController.getInvoices
);

billingRouter.get(
  '/invoices/:id',
  requirePermission('billing:view'),
  BillingController.getInvoiceById
);

billingRouter.post(
  '/invoices',
  requirePermission('billing:edit'),
  validateRequest({ body: createInvoiceSchema }),
  BillingController.createInvoice
);

billingRouter.patch(
  '/invoices/:id/status',
  requirePermission('billing:edit'),
  validateRequest({ body: updateInvoiceStatusSchema }),
  BillingController.updateStatus
);

billingRouter.post(
  '/payments',
  requirePermission('billing:edit'),
  validateRequest({ body: recordPaymentSchema }),
  BillingController.recordPayment
);

billingRouter.get(
  '/payments',
  requirePermission('billing:view'),
  BillingController.getPayments
);

