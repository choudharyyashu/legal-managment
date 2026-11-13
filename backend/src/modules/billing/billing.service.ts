import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateInvoiceInput, UpdateInvoiceStatusInput, RecordPaymentInput } from './billing.validation.js';
import { InvoiceResponse, InvoiceListQuery, PaymentRecordResponse } from './billing.types.js';

export class BillingService {
  private static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.invoice.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `INV-${year}-${sequence}`;
      const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: candidate } });
      if (!existing) return candidate;
    }
    return `INV-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static async generatePaymentReference(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.paymentRecord.count();
      const sequence = String(count + attempts).padStart(5, '0');
      const candidate = `PAY-${year}-${sequence}`;
      const existing = await prisma.paymentRecord.findUnique({ where: { paymentReference: candidate } });
      if (!existing) return candidate;
    }
    return `PAY-${year}-${Date.now().toString().slice(-5)}`;
  }

  private static formatResponse(inv: any): InvoiceResponse {
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientNumber: inv.client?.clientNumber || null,
      clientName: inv.client?.name || null,
      matterId: inv.matterId,
      matterNumber: inv.matter?.matterNumber || null,
      matterTitle: inv.matter?.title || null,
      issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      balanceDue: Number(inv.balanceDue),
      status: inv.status,
      sentAt: inv.sentAt?.toISOString() || null,
      notes: inv.notes || null,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      lineItems: inv.lineItems
        ? inv.lineItems.map((li: any) => ({
            id: li.id,
            itemType: li.itemType,
            timeEntryId: li.timeEntryId || null,
            expenseId: li.expenseId || null,
            description: li.description,
            quantity: Number(li.quantity),
            unitRate: Number(li.unitRate),
            totalPrice: Number(li.totalPrice),
          }))
        : undefined,
      payments: inv.paymentRecords
        ? inv.paymentRecords.map((p: any) => ({
            id: p.id,
            paymentReference: p.paymentReference,
            invoiceId: p.invoiceId,
            clientId: p.clientId,
            amount: Number(p.amount),
            paymentMethod: p.paymentMethod,
            destinationAccount: p.destinationAccount,
            transactionReference: p.transactionReference || null,
            receivedDate: p.receivedDate.toISOString().split('T')[0],
            recordedByUserId: p.recordedByUserId,
            recordedByName: p.recordedByUser?.name || null,
            createdAt: p.createdAt.toISOString(),
          }))
        : undefined,
    };
  }

  static async getInvoices(query: InvoiceListQuery): Promise<{ invoices: InvoiceResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.matterId) where.matterId = query.matterId;
    if (query.status) where.status = query.status;

    const [total, records] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issueDate: 'desc' },
        include: {
          client: { select: { id: true, clientNumber: true, name: true } },
          matter: { select: { id: true, matterNumber: true, title: true } },
        },
      }),
    ]);

    return {
      invoices: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getInvoiceById(id: string): Promise<InvoiceResponse> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
        lineItems: true,
        paymentRecords: {
          include: { recordedByUser: { select: { id: true, name: true } } },
        },
      },
    });

    if (!invoice) {
      throw AppError.notFound(`Invoice '${id}' not found.`, 'INVOICE_NOT_FOUND');
    }
    return this.formatResponse(invoice);
  }

  static async createInvoice(
    input: CreateInvoiceInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<InvoiceResponse> {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw AppError.badRequest('Referenced client not found.', 'CLIENT_NOT_FOUND');

    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.badRequest('Referenced matter not found.', 'MATTER_NOT_FOUND');

    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate total amount from line items
    let calculatedTotal = 0;
    const preparedLineItems = input.lineItems.map((li) => {
      const totalPrice = Number((li.quantity * li.unitRate).toFixed(2));
      calculatedTotal += totalPrice;
      return {
        itemType: li.itemType,
        timeEntryId: li.timeEntryId,
        expenseId: li.expenseId,
        description: li.description,
        quantity: li.quantity,
        unitRate: li.unitRate,
        totalPrice,
      };
    });

    calculatedTotal = Number(calculatedTotal.toFixed(2));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: input.clientId,
        matterId: input.matterId,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        totalAmount: calculatedTotal,
        paidAmount: 0.0,
        balanceDue: calculatedTotal,
        status: 'Draft',
        notes: input.notes,
        lineItems: {
          create: preparedLineItems,
        },
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
        lineItems: true,
      },
    });

    // Mark referenced time entries and expenses as 'Billed'
    for (const li of input.lineItems) {
      if (li.timeEntryId) {
        await prisma.timeEntry.update({
          where: { id: li.timeEntryId },
          data: { status: 'Billed' },
        }).catch(() => {});
      }
      if (li.expenseId) {
        await prisma.expense.update({
          where: { id: li.expenseId },
          data: { status: 'Billed' },
        }).catch(() => {});
      }
    }

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INVOICE_GENERATED',
      resourceType: 'BILLING',
      resourceId: invoice.id,
      details: { invoiceNumber, totalAmount: calculatedTotal, matterNumber: matter.matterNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(invoice);
  }

  static async updateStatus(
    id: string,
    input: UpdateInvoiceStatusInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<InvoiceResponse> {
    const existing = await this.getInvoiceById(id);

    const updated = await prisma.invoice.update({
      where: { id: existing.id },
      data: { status: input.status },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
        lineItems: true,
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INVOICE_STATUS_UPDATED',
      resourceType: 'BILLING',
      resourceId: updated.id,
      details: { invoiceNumber: updated.invoiceNumber, status: input.status },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async recordPayment(
    input: RecordPaymentInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ payment: PaymentRecordResponse; invoice: InvoiceResponse }> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { client: true },
    });

    if (!invoice) throw AppError.notFound('Referenced invoice not found.', 'INVOICE_NOT_FOUND');

    if (Number(invoice.balanceDue) <= 0) {
      throw AppError.badRequest('This invoice is already fully paid.', 'INVOICE_ALREADY_PAID');
    }

    const paymentAmount = Number(input.amount.toFixed(2));
    const newPaidAmount = Number((Number(invoice.paidAmount) + paymentAmount).toFixed(2));
    const newBalanceDue = Math.max(0, Number((Number(invoice.totalAmount) - newPaidAmount).toFixed(2)));
    const newStatus = newBalanceDue === 0 ? 'Paid' : 'Partially Paid';

    const paymentReference = await this.generatePaymentReference();

    const payment = await prisma.paymentRecord.create({
      data: {
        paymentReference,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: paymentAmount,
        paymentMethod: input.paymentMethod,
        destinationAccount: input.destinationAccount,
        transactionReference: input.transactionReference,
        receivedDate: new Date(input.receivedDate),
        recordedByUserId: context.userId,
      },
      include: {
        recordedByUser: { select: { id: true, name: true } },
      },
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
      include: {
        client: { select: { id: true, clientNumber: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
        lineItems: true,
        paymentRecords: true,
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'PAYMENT_RECORDED',
      resourceType: 'BILLING',
      resourceId: payment.id,
      details: {
        paymentReference,
        amount: paymentAmount,
        invoiceNumber: invoice.invoiceNumber,
        newBalanceDue,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const paymentFormatted: PaymentRecordResponse = {
      id: payment.id,
      paymentReference: payment.paymentReference,
      invoiceId: payment.invoiceId,
      clientId: payment.clientId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      destinationAccount: payment.destinationAccount,
      transactionReference: payment.transactionReference || null,
      receivedDate: payment.receivedDate.toISOString().split('T')[0],
      recordedByUserId: payment.recordedByUserId,
      recordedByName: payment.recordedByUser?.name || null,
      createdAt: payment.createdAt.toISOString(),
    };

    return {
      payment: paymentFormatted,
      invoice: this.formatResponse(updatedInvoice),
    };
  }

  static async getPayments(): Promise<PaymentRecordResponse[]> {
    const payments = await prisma.paymentRecord.findMany({
      orderBy: { receivedDate: 'desc' },
      include: {
        invoice: { select: { id: true, invoiceNumber: true } },
        client: { select: { id: true, name: true } },
        recordedByUser: { select: { id: true, name: true } },
      },
    });

    return payments.map((p) => ({
      id: p.id,
      paymentReference: p.paymentReference,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice?.invoiceNumber || null,
      clientId: p.clientId,
      clientName: p.client?.name || null,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      destinationAccount: p.destinationAccount,
      transactionReference: p.transactionReference || null,
      receivedDate: p.receivedDate.toISOString().split('T')[0],
      recordedByUserId: p.recordedByUserId,
      recordedByName: p.recordedByUser?.name || null,
      createdAt: p.createdAt.toISOString(),
    }));
  }
}

