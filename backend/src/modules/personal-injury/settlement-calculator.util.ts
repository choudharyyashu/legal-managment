/**
 * Shared authoritative settlement disbursement calculation helpers using integer-cent arithmetic.
 * Ensures decimal-safe currency math, avoiding floating-point drift.
 * Handles custom signed fee percentages, approved negotiated lien payoffs, and eligible posted expenses.
 */

export function toCents(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100);
}

export function centsToDollars(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return Math.round(cents) / 100;
}

export function formatFeeRateDisplay(feeRate: number | string, feeRateOption: string = 'standard'): string {
  if (feeRateOption === 'exact') {
    return '1/3 (Exact)';
  }
  const numericRate = Number(feeRate);
  if (!Number.isFinite(numericRate)) return '0.00%';
  return `${numericRate.toFixed(2)}%`;
}

export function resolveEligibleExpenseCents(expense: any): number {
  if (!expense) return 0;
  if (expense.status) {
    const s = String(expense.status).toUpperCase();
    if (s === 'DRAFT' || s === 'VOID' || s === 'VOIDED' || s === 'REJECTED' || s === 'DELETED') {
      return 0;
    }
  }
  const amt = expense.amount !== undefined ? expense.amount : expense;
  return toCents(amt);
}

export function resolveApprovedLienCents(lien: any): number {
  if (!lien) return 0;
  if (lien.status) {
    const s = String(lien.status).toUpperCase();
    if (s === 'REJECTED' || s === 'DISPUTED' || s === 'VOID' || s === 'UNAPPROVED' || s === 'EXCLUDED') {
      return 0;
    }
  }
  if (lien.negotiatedAmount !== undefined && lien.negotiatedAmount !== null && Number(lien.negotiatedAmount) > 0) {
    return toCents(lien.negotiatedAmount);
  }
  if (lien.finalPayoffAmount !== undefined && lien.finalPayoffAmount !== null && Number(lien.finalPayoffAmount) > 0) {
    return toCents(lien.finalPayoffAmount);
  }
  if (lien.amount !== undefined && lien.amount !== null) {
    return toCents(lien.amount);
  }
  if (lien.originalAmount !== undefined && lien.originalAmount !== null) {
    return toCents(lien.originalAmount);
  }
  if (typeof lien === 'number' || typeof lien === 'string') {
    return toCents(lien);
  }
  return 0;
}

export interface CalculateSettlementParams {
  grossRecovery?: number | string;
  feeRate?: number | string;
  feeRateOption?: string;
  caseExpenses?: any[];
  medicalLiens?: any[];
  otherDeductions?: any[];
}

export function calculateSettlement({
  grossRecovery = 0,
  feeRate = 33.33,
  feeRateOption = 'standard',
  caseExpenses = [],
  medicalLiens = [],
  otherDeductions = [],
}: CalculateSettlementParams) {
  const grossCents = Math.max(0, toCents(grossRecovery));
  const numericRate = Number(feeRate);
  const safeRate = Number.isFinite(numericRate) ? Math.max(0, numericRate) : 0;

  const feeCents =
    feeRateOption === 'exact'
      ? Math.round(grossCents / 3)
      : Math.round((grossCents * safeRate) / 100);

  const seenExpenseIds = new Set<string>();
  const expensesCents = (caseExpenses || []).reduce((sum: number, item: any) => {
    if (item && item.id) {
      if (seenExpenseIds.has(item.id)) return sum;
      seenExpenseIds.add(item.id);
    }
    return sum + resolveEligibleExpenseCents(item);
  }, 0);

  const seenLienIds = new Set<string>();
  const liensCents = (medicalLiens || []).reduce((sum: number, item: any) => {
    if (item && item.id) {
      if (seenLienIds.has(item.id)) return sum;
      seenLienIds.add(item.id);
    }
    return sum + resolveApprovedLienCents(item);
  }, 0);

  const seenOtherIds = new Set<string>();
  const otherCents = (otherDeductions || []).reduce((sum: number, item: any) => {
    if (item && item.id) {
      if (seenOtherIds.has(item.id)) return sum;
      seenOtherIds.add(item.id);
    }
    return sum + toCents(item?.amount ?? item);
  }, 0);

  const totalNonFeeDeductionsCents = expensesCents + liensCents + otherCents;
  const totalDeductionsCents = feeCents + totalNonFeeDeductionsCents;
  const netClientCents = Math.max(0, grossCents - totalDeductionsCents);

  return {
    numericGross: centsToDollars(grossCents),
    contingencyFeePercentage: safeRate,
    contingencyFeeAmount: centsToDollars(feeCents),
    totalCaseExpenses: centsToDollars(expensesCents),
    totalMedicalLiens: centsToDollars(liensCents),
    totalOtherDeductions: centsToDollars(otherCents),
    totalNonFeeDeductions: centsToDollars(totalNonFeeDeductionsCents),
    totalDeductions: centsToDollars(totalDeductionsCents),
    netClientProceeds: centsToDollars(netClientCents),
    feeRateDisplay: formatFeeRateDisplay(safeRate, feeRateOption),
    feePercentageForStorage: feeRateOption === 'exact' ? 33.33 : safeRate,
    feeBasis: feeRateOption === 'exact' ? 'EXACT_ONE_THIRD' : 'PERCENTAGE',
  };
}
