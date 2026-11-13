import { Response, NextFunction } from 'express';
import { BillingService } from './billing.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class BillingController {
  static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BillingService.getInvoices(req.query as any);
      res.status(200).json({
        success: true,
        data: result.invoices,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await BillingService.getInvoiceById(req.params.id);
      res.status(200).json({
        success: true,
        data: { invoice },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await BillingService.createInvoice(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Invoice generated successfully with number ${invoice.invoiceNumber}.`,
        data: { invoice },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await BillingService.updateStatus(req.params.id, req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        message: `Invoice status updated to '${invoice.status}'.`,
        data: { invoice },
      });
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BillingService.recordPayment(req.body, {
        userId: req.user!.id,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: `Payment of $${result.payment.amount} recorded against ${result.invoice.invoiceNumber}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await BillingService.getPayments();
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }
}
