export interface ExpenseResponse {
  id: string;
  expenseCode: string;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  incurredByUserId: string;
  incurredByName?: string | null;
  date: string;
  category: string;
  amount: number;
  vendorName?: string | null;
  receiptDocumentId?: string | null;
  isBillable: boolean;
  status: string;
  createdAt: string;
}

export interface ExpenseListQuery {
  page?: number;
  limit?: number;
  matterId?: string;
  incurredByUserId?: string;
  status?: string;
  category?: string;
}
