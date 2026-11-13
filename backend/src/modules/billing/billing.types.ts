export interface InvoiceLineItemResponse {
  id: string;
  itemType: string;
  timeEntryId?: string | null;
  expenseId?: string | null;
  description: string;
  quantity: number;
  unitRate: number;
  totalPrice: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientNumber?: string | null;
  clientName?: string | null;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  sentAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems?: InvoiceLineItemResponse[];
  payments?: PaymentRecordResponse[];
}

export interface PaymentRecordResponse {
  id: string;
  paymentReference: string;
  invoiceId: string;
  invoiceNumber?: string | null;
  clientId: string;
  clientName?: string | null;
  amount: number;
  paymentMethod: string;
  destinationAccount: string;
  transactionReference?: string | null;
  receivedDate: string;
  recordedByUserId: string;
  recordedByName?: string | null;
  createdAt: string;
}

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  clientId?: string;
  matterId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
