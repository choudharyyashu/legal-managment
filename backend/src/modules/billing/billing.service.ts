import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { LedgerService } from '../ledger/ledger.service.js';
import { CreateInvoiceInput, UpdateInvoiceStatusInput, RecordPaymentInput } from './billing.validation.js';
import { InvoiceResponse, InvoiceListQuery, PaymentRecordResponse } from './billing.types.js';

export class BillingService {
  private static async generateInvoiceNumber(client: any = prisma): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await client.invoice.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `INV-${year}-${sequence}`;
      const existing = await client.invoice.findUnique({ where: { invoiceNumber: candidate } });
      if (!existing) return candidate;
    }
    return `INV-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static async generatePaymentReference(client: any = prisma): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await client.paymentRecord.count();
      const sequence = String(count + attempts).padStart(5, '0');
      const candidate = `PAY-${year}-${sequence}`;
      const existing = await client.paymentRecord.findUnique({ where: { paymentReference: candidate } });
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
    if (!client) throw AppError.notFound('Referenced client not found.', 'CLIENT_NOT_FOUND');

    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.notFound('Referenced matter not found.', 'MATTER_NOT_FOUND');

    if (matter.clientId !== input.clientId) {
      throw AppError.badRequest('Referenced matter does not belong to the specified client.', 'MATTER_CLIENT_MISMATCH');
    }

    // Extract all referenced time entry and expense IDs
    const rawTimeIds = input.lineItems
      .map((li) => li.timeEntryId)
      .filter((id): id is string => Boolean(id));
    if (new Set(rawTimeIds).size !== rawTimeIds.length) {
      throw AppError.badRequest(
        'Duplicate time entry references found within the same invoice request.',
        'DUPLICATE_TIME_ENTRY_IN_REQUEST'
      );
    }

    const rawExpIds = input.lineItems
      .map((li) => li.expenseId)
      .filter((id): id is string => Boolean(id));
    if (new Set(rawExpIds).size !== rawExpIds.length) {
      throw AppError.badRequest(
        'Duplicate expense references found within the same invoice request.',
        'DUPLICATE_EXPENSE_IN_REQUEST'
      );
    }

    // Perform validation, concurrency locking, invoice creation, and billing status updates in an atomic transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Time entries validation and concurrency locking
      if (rawTimeIds.length > 0) {
        // Concurrency row lock: prevent race conditions from concurrent invoice requests
        await tx.$queryRaw`
          SELECT id FROM time_entries WHERE id IN (${Prisma.join(rawTimeIds)}) FOR UPDATE
        `;

        const dbTimeEntries = await tx.timeEntry.findMany({
          where: { id: { in: rawTimeIds } },
        });

        if (dbTimeEntries.length !== rawTimeIds.length) {
          const foundIds = new Set(dbTimeEntries.map((t) => t.id));
          const missingId = rawTimeIds.find((id) => !foundIds.has(id));
          throw AppError.notFound(`Time entry '${missingId}' not found.`, 'TIME_ENTRY_NOT_FOUND');
        }

        for (const te of dbTimeEntries) {
          // Cross-matter boundary check
          if (te.matterId !== input.matterId) {
            throw AppError.badRequest(
              `Time entry '${te.entryCode || te.id}' belongs to a different matter. Cross-matter billing is prohibited.`,
              'TIME_ENTRY_MATTER_MISMATCH'
            );
          }

          // Billable check
          if (!te.isBillable) {
            throw AppError.badRequest(
              `Time entry '${te.entryCode || te.id}' is marked as non-billable and cannot be invoiced.`,
              'TIME_ENTRY_NOT_BILLABLE'
            );
          }

          // Status & Approval checks
          if (te.status === 'Billed' || te.status === 'Invoiced') {
            throw AppError.conflict(
              `Time entry '${te.entryCode || te.id}' has already been billed.`,
              'TIME_ENTRY_ALREADY_BILLED'
            );
          }

          if (te.status === 'Submitted') {
            throw AppError.badRequest(
              `Time entry '${te.entryCode || te.id}' has status 'Submitted'. Only approved time entries can be invoiced.`,
              'TIME_ENTRY_NOT_APPROVED'
            );
          }

          if (te.status === 'Rejected') {
            throw AppError.badRequest(
              `Time entry '${te.entryCode || te.id}' has been rejected and cannot be invoiced.`,
              'TIME_ENTRY_REJECTED'
            );
          }

          if (te.status !== 'Approved' && te.status !== 'Exported') {
            throw AppError.badRequest(
              `Time entry '${te.entryCode || te.id}' cannot be invoiced with status '${te.status}'.`,
              'TIME_ENTRY_INVALID_STATUS'
            );
          }

          // Check if already allocated to any active (non-void/non-cancelled) invoice
          const existingAllocation = await tx.invoiceLineItem.findFirst({
            where: {
              timeEntryId: te.id,
              invoice: {
                status: { notIn: ['Void', 'Cancelled'] },
              },
            },
            include: { invoice: { select: { invoiceNumber: true, status: true } } },
          });

          if (existingAllocation) {
            throw AppError.conflict(
              `Time entry '${te.entryCode || te.id}' is already allocated to active invoice ${existingAllocation.invoice.invoiceNumber} (${existingAllocation.invoice.status}).`,
              'TIME_ENTRY_ALREADY_ALLOCATED'
            );
          }
        }
      }

      // 2. Expenses validation and concurrency locking
      if (rawExpIds.length > 0) {
        // Concurrency row lock
        await tx.$queryRaw`
          SELECT id FROM expenses WHERE id IN (${Prisma.join(rawExpIds)}) FOR UPDATE
        `;

        const dbExpenses = await tx.expense.findMany({
          where: { id: { in: rawExpIds } },
        });

        if (dbExpenses.length !== rawExpIds.length) {
          const foundIds = new Set(dbExpenses.map((e) => e.id));
          const missingId = rawExpIds.find((id) => !foundIds.has(id));
          throw AppError.notFound(`Expense '${missingId}' not found.`, 'EXPENSE_NOT_FOUND');
        }

        for (const exp of dbExpenses) {
          // Cross-matter boundary check
          if (exp.matterId !== input.matterId) {
            throw AppError.badRequest(
              `Expense '${exp.expenseCode || exp.id}' belongs to a different matter. Cross-matter billing is prohibited.`,
              'EXPENSE_MATTER_MISMATCH'
            );
          }

          // Billable check
          if (!exp.isBillable) {
            throw AppError.badRequest(
              `Expense '${exp.expenseCode || exp.id}' is marked as non-billable and cannot be invoiced.`,
              'EXPENSE_NOT_BILLABLE'
            );
          }

          // Status check
          if (exp.status === 'Billed' || exp.status === 'Invoiced') {
            throw AppError.conflict(
              `Expense '${exp.expenseCode || exp.id}' has already been billed.`,
              'EXPENSE_ALREADY_BILLED'
            );
          }

          if (exp.status === 'Rejected') {
            throw AppError.badRequest(
              `Expense '${exp.expenseCode || exp.id}' has been rejected and cannot be invoiced.`,
              'EXPENSE_REJECTED'
            );
          }

          // Check if already allocated to any active invoice
          const existingAllocation = await tx.invoiceLineItem.findFirst({
            where: {
              expenseId: exp.id,
              invoice: {
                status: { notIn: ['Void', 'Cancelled'] },
              },
            },
            include: { invoice: { select: { invoiceNumber: true, status: true } } },
          });

          if (existingAllocation) {
            throw AppError.conflict(
              `Expense '${exp.expenseCode || exp.id}' is already allocated to active invoice ${existingAllocation.invoice.invoiceNumber} (${existingAllocation.invoice.status}).`,
              'EXPENSE_ALREADY_ALLOCATED'
            );
          }
        }
      }

      // 3. Prepare line items and calculate total amount
      let calculatedTotal = 0;
      const preparedLineItems = input.lineItems.map((li) => {
        const totalPrice = Number((li.quantity * li.unitRate).toFixed(2));
        if (li.itemType === 'Adjustment') {
          calculatedTotal -= totalPrice;
        } else {
          calculatedTotal += totalPrice;
        }
        return {
          itemType: li.itemType,
          timeEntryId: li.timeEntryId || null,
          expenseId: li.expenseId || null,
          description: li.description,
          quantity: li.quantity,
          unitRate: li.unitRate,
          totalPrice,
        };
      });

      calculatedTotal = Math.max(0, Number(calculatedTotal.toFixed(2)));

      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // 4. Create invoice record
      const createdInvoice = await tx.invoice.create({
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

      // 5. Update time entries to 'Billed' (no silent catch, transaction rollback on failure)
      for (const tid of rawTimeIds) {
        await tx.timeEntry.update({
          where: { id: tid },
          data: { status: 'Billed' },
        });
      }

      // 6. Update expenses to 'Billed' (no silent catch, transaction rollback on failure)
      for (const eid of rawExpIds) {
        await tx.expense.update({
          where: { id: eid },
          data: { status: 'Billed' },
        });
      }

      return createdInvoice;
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INVOICE_GENERATED',
      resourceType: 'BILLING',
      resourceId: invoice.id,
      details: { invoiceNumber: invoice.invoiceNumber, totalAmount: Number(invoice.totalAmount), matterNumber: matter.matterNumber },
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

    // Terminal status guards
    if ((existing.status === 'Void' || existing.status === 'Cancelled') && input.status !== existing.status) {
      throw AppError.badRequest(
        `Invoice ${existing.invoiceNumber} is in terminal status '${existing.status}' and cannot be transitioned to '${input.status}'.`,
        'INVOICE_TERMINAL_STATUS'
      );
    }

    const isTransitioningToVoidOrCancelled = input.status === 'Void' || input.status === 'Cancelled';

    if (isTransitioningToVoidOrCancelled) {
      if (existing.status === 'Paid') {
        throw AppError.badRequest(
          `Paid invoice ${existing.invoiceNumber} cannot be voided or cancelled. Reverse payments first.`,
          'INVOICE_PAID_CANNOT_VOID'
        );
      }
      if (Number(existing.paidAmount) > 0) {
        throw AppError.badRequest(
          `Invoice ${existing.invoiceNumber} has payments of $${Number(existing.paidAmount).toFixed(2)} and cannot be voided or cancelled without reversing payments.`,
          'INVOICE_PARTIALLY_PAID_CANNOT_VOID'
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: existing.id },
        data: {
          status: input.status,
          ...(isTransitioningToVoidOrCancelled ? { balanceDue: 0.0 } : {}),
        },
        include: {
          client: { select: { id: true, clientNumber: true, name: true } },
          matter: { select: { id: true, matterNumber: true, title: true } },
          lineItems: true,
        },
      });

      // If transitioning to Issued and no receivable GL journal exists yet, establish it
      if (input.status === 'Issued') {
        const existingArJournal = await tx.generalLedgerEntry.findFirst({
          where: {
            accountNumber: 1200,
            matterId: inv.matterId,
            journal: {
              memo: { contains: inv.invoiceNumber },
            },
          },
        });
        if (!existingArJournal) {
          await LedgerService.executePostJournal(
            {
              transactionDate: inv.issueDate.toISOString().split('T')[0],
              memo: `Invoice Issuance - ${inv.invoiceNumber}`,
              entries: [
                {
                  accountNumber: 1200, // Accounts Receivable
                  debit: Number(inv.totalAmount),
                  credit: 0.0,
                  matterId: inv.matterId,
                },
                {
                  accountNumber: 4000, // Legal Fee Revenue
                  debit: 0.0,
                  credit: Number(inv.totalAmount),
                  matterId: inv.matterId,
                },
              ],
            },
            { userId: context.userId },
            tx
          );
        }
      }

      // When voided or cancelled, reverse the receivable if it was established
      if (isTransitioningToVoidOrCancelled) {
        const existingArJournal = await tx.generalLedgerEntry.findFirst({
          where: {
            accountNumber: 1200,
            matterId: inv.matterId,
            journal: {
              memo: { contains: inv.invoiceNumber },
            },
          },
        });
        if (existingArJournal) {
          await LedgerService.executePostJournal(
            {
              transactionDate: new Date().toISOString().split('T')[0],
              memo: `Invoice Void Reversal - ${inv.invoiceNumber}`,
              entries: [
                {
                  accountNumber: 4000, // Reverse Revenue
                  debit: Number(inv.totalAmount),
                  credit: 0.0,
                  matterId: inv.matterId,
                },
                {
                  accountNumber: 1200, // Reverse Accounts Receivable
                  debit: 0.0,
                  credit: Number(inv.totalAmount),
                  matterId: inv.matterId,
                },
              ],
            },
            { userId: context.userId },
            tx
          );
        }
      }

      // When voided or cancelled, release the billed time entries and expenses back to unbilled/approved
      if (isTransitioningToVoidOrCancelled && inv.lineItems) {
        for (const li of inv.lineItems) {
          if (li.timeEntryId) {
            await tx.timeEntry.update({
              where: { id: li.timeEntryId },
              data: { status: 'Approved' },
            });
          }
          if (li.expenseId) {
            await tx.expense.update({
              where: { id: li.expenseId },
              data: { status: 'Unbilled' },
            });
          }
        }
      }

      return inv;
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'INVOICE_STATUS_UPDATED',
      resourceType: 'BILLING',
      resourceId: updated.id,
      details: { invoiceNumber: updated.invoiceNumber, previousStatus: existing.status, newStatus: input.status },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async recordPayment(
    input: RecordPaymentInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ payment: PaymentRecordResponse; invoice: InvoiceResponse }> {
    const paymentAmount = new Prisma.Decimal(input.amount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    if (paymentAmount.lessThanOrEqualTo(0) || paymentAmount.isNaN()) {
      throw AppError.badRequest('Payment amount must be a positive number.', 'INVALID_PAYMENT_AMOUNT');
    }

    const { payment, updatedInvoice, paymentReference } = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          client: true,
          matter: true,
        },
      });

      if (!invoice) throw AppError.notFound('Referenced invoice not found.', 'INVOICE_NOT_FOUND');

      if (input.clientId && invoice.clientId !== input.clientId) {
        throw AppError.badRequest('Referenced invoice does not belong to the specified client.', 'INVOICE_CLIENT_MISMATCH');
      }

      if (invoice.status === 'Void' || invoice.status === 'Cancelled') {
        throw AppError.badRequest(`Cannot record payment against ${invoice.status.toLowerCase()} invoice.`, 'INVOICE_VOID');
      }

      const balanceDueDecimal = new Prisma.Decimal(invoice.balanceDue);
      if (balanceDueDecimal.lessThanOrEqualTo(0)) {
        throw AppError.badRequest('This invoice is already fully paid.', 'INVOICE_ALREADY_PAID');
      }

      // Prevent overpayment
      if (paymentAmount.greaterThan(balanceDueDecimal)) {
        throw AppError.badRequest(
          `Payment amount ($${paymentAmount.toFixed(2)}) exceeds invoice balance due ($${balanceDueDecimal.toFixed(2)}). Overpayments are prohibited.`,
          'PAYMENT_EXCEEDS_BALANCE'
        );
      }

      // Requirement 5: Verify existing accounting basis and establish receivable on GL if not already established
      const existingArJournal = await tx.generalLedgerEntry.findFirst({
        where: {
          accountNumber: 1200,
          matterId: invoice.matterId,
          journal: {
            memo: { contains: invoice.invoiceNumber },
          },
        },
      });

      if (!existingArJournal) {
        await LedgerService.executePostJournal(
          {
            transactionDate: invoice.issueDate.toISOString().split('T')[0],
            memo: `Invoice Issuance - ${invoice.invoiceNumber}`,
            entries: [
              {
                accountNumber: 1200, // Accounts Receivable
                debit: Number(invoice.totalAmount),
                credit: 0.0,
                matterId: invoice.matterId,
              },
              {
                accountNumber: 4000, // Legal Fee Revenue
                debit: 0.0,
                credit: Number(invoice.totalAmount),
                matterId: invoice.matterId,
              },
            ],
          },
          { userId: context.userId },
          tx
        );
      }

      const paymentRef = await this.generatePaymentReference(tx);

      // Handle Trust Transfer vs Operating Cash payment
      if (input.paymentMethod === 'Trust Transfer') {
        // Requirement 6: Verify trust funds belong to correct client & matter, are available, and authorized
        const subLedger = await tx.trustSubLedger.findUnique({
          where: { matterId: invoice.matterId },
        });

        if (!subLedger || subLedger.clientId !== invoice.clientId) {
          throw AppError.badRequest(
            `No trust sub-ledger found for matter ${invoice.matter?.matterNumber || invoice.matterId}. Trust Transfer requires dedicated client trust funds.`,
            'TRUST_LEDGER_NOT_FOUND'
          );
        }

        // Exclusive row lock on client trust sub-ledger to prevent overdraft race conditions
        const lockedRows = await tx.$queryRaw<{ id: string; balance: any }[]>`
          SELECT id, balance FROM trust_sub_ledgers WHERE id = ${subLedger.id} FOR UPDATE
        `;
        const currentTrustBal = new Prisma.Decimal(lockedRows[0]?.balance ?? subLedger.balance);

        // Requirement 7: Prevent negative trust balances
        if (currentTrustBal.lessThan(paymentAmount)) {
          throw AppError.badRequest(
            `Insufficient trust funds: Available trust balance is $${currentTrustBal.toFixed(2)}, cannot disburse $${paymentAmount.toFixed(2)} to satisfy invoice. Utah RPC 1.15 strictly prohibits negative client trust balances.`,
            'INSUFFICIENT_TRUST_FUNDS'
          );
        }

        const newTrustBal = currentTrustBal.minus(paymentAmount);

        // Deduct from client trust sub-ledger
        await tx.trustSubLedger.update({
          where: { id: subLedger.id },
          data: {
            balance: newTrustBal.toNumber(),
            lastAuditDate: new Date(),
          },
        });

        // Record Trust Transaction
        await tx.trustTransaction.create({
          data: {
            trustSubLedgerId: subLedger.id,
            transactionType: 'Disbursement',
            amount: paymentAmount.toNumber(),
            runningBalance: newTrustBal.toNumber(),
            sourceReference: paymentRef,
            authorizedByUserId: context.userId,
            purpose: `Earned fee trust transfer to operating for invoice ${invoice.invoiceNumber}`,
          },
        });

        // Requirement 4: Balanced 4-legged General Ledger journal entry for Trust Transfer
        // Debit 2100 - Client Trust Liability ($X)
        // Credit 1020 - IOLTA Trust Bank ($X)
        // Debit 1010 - Operating Cash ($X)
        // Credit 1200 - Accounts Receivable ($X)
        await LedgerService.executePostJournal(
          {
            transactionDate: input.receivedDate,
            memo: `Trust Transfer Fee Payment - ${invoice.invoiceNumber} (${paymentRef})`,
            entries: [
              {
                accountNumber: 2100, // Client Trust Liability (Debit reduces liability)
                debit: paymentAmount.toNumber(),
                credit: 0.0,
                matterId: invoice.matterId,
              },
              {
                accountNumber: 1020, // IOLTA Trust Bank (Credit reduces trust bank)
                debit: 0.0,
                credit: paymentAmount.toNumber(),
                matterId: invoice.matterId,
              },
              {
                accountNumber: 1010, // Operating Cash (Debit increases operating cash)
                debit: paymentAmount.toNumber(),
                credit: 0.0,
                matterId: invoice.matterId,
              },
              {
                accountNumber: 1200, // Accounts Receivable (Credit satisfies receivable)
                debit: 0.0,
                credit: paymentAmount.toNumber(),
                matterId: invoice.matterId,
              },
            ],
          },
          { userId: context.userId },
          tx
        );
      } else {
        // Direct non-trust operating receipt (Check, Credit Card, ACH, Cash)
        // Debit 1010 - Operating Cash
        // Credit 1200 - Accounts Receivable
        await LedgerService.executePostJournal(
          {
            transactionDate: input.receivedDate,
            memo: `Invoice Payment (${input.paymentMethod}) - ${invoice.invoiceNumber} (${paymentRef})`,
            entries: [
              {
                accountNumber: 1010, // Operating Cash (Debit increases cash)
                debit: paymentAmount.toNumber(),
                credit: 0.0,
                matterId: invoice.matterId,
              },
              {
                accountNumber: 1200, // Accounts Receivable (Credit satisfies receivable)
                debit: 0.0,
                credit: paymentAmount.toNumber(),
                matterId: invoice.matterId,
              },
            ],
          },
          { userId: context.userId },
          tx
        );
      }

      // Create Payment Record
      const paymentRec = await tx.paymentRecord.create({
        data: {
          paymentReference: paymentRef,
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          amount: paymentAmount.toNumber(),
          paymentMethod: input.paymentMethod,
          destinationAccount: input.paymentMethod === 'Trust Transfer' ? 'Operating Account (1010)' : input.destinationAccount,
          transactionReference: input.transactionReference,
          receivedDate: new Date(input.receivedDate),
          recordedByUserId: context.userId,
        },
        include: {
          recordedByUser: { select: { id: true, name: true } },
        },
      });

      // Update Invoice paidAmount, balanceDue, and status
      const newPaidAmount = new Prisma.Decimal(invoice.paidAmount).plus(paymentAmount);
      const newBalanceDue = Prisma.Decimal.max(new Prisma.Decimal(0), new Prisma.Decimal(invoice.totalAmount).minus(newPaidAmount));
      const newStatus = newBalanceDue.equals(0) ? 'Paid' : 'Partially Paid';

      const updatedInv = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount.toNumber(),
          balanceDue: newBalanceDue.toNumber(),
          status: newStatus,
        },
        include: {
          client: { select: { id: true, clientNumber: true, name: true } },
          matter: { select: { id: true, matterNumber: true, title: true } },
          lineItems: true,
          paymentRecords: true,
        },
      });

      return { payment: paymentRec, updatedInvoice: updatedInv, paymentReference: paymentRef };
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'PAYMENT_RECORDED',
      resourceType: 'BILLING',
      resourceId: payment.id,
      details: {
        paymentReference,
        amount: paymentAmount.toNumber(),
        paymentMethod: input.paymentMethod,
        invoiceNumber: updatedInvoice.invoiceNumber,
        newBalanceDue: Number(updatedInvoice.balanceDue),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    if (input.paymentMethod === 'Trust Transfer') {
      await createAuditLog({
        userId: context.userId,
        userRole: context.userRole,
        action: 'IOLTA_DISBURSEMENT_RECORDED',
        resourceType: 'TRUST_ACCOUNTING',
        resourceId: payment.id,
        details: {
          paymentReference,
          amount: paymentAmount.toNumber(),
          purpose: `Earned fee trust transfer to operating for invoice ${updatedInvoice.invoiceNumber}`,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }

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

