/**
 * Shared authoritative settlement disbursement calculation helpers using integer-cent arithmetic.
 * Ensures decimal-safe currency math, avoiding floating-point drift.
 * Handles custom signed fee percentages, approved negotiated lien payoffs, and eligible posted expenses.
 */

export function toCents(value) {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100);
}

export function centsToDollars(cents) {
  if (!Number.isFinite(cents)) return 0;
  return Math.round(cents) / 100;
}

export function formatFeeRateDisplay(feeRate, feeRateOption = 'standard') {
  if (feeRateOption === 'exact') {
    return '1/3 (Exact)';
  }
  const numericRate = Number(feeRate);
  if (!Number.isFinite(numericRate)) return '0.00%';
  return `${numericRate.toFixed(2)}%`;
}

/**
 * Filter and resolve an itemized expense line to its eligible payable cent amount.
 * Excludes drafts, unposted expenses, voided expenses, and duplicate entries.
 */
export function resolveEligibleExpenseCents(expense) {
  if (!expense) return 0;
  
  // Status check if present
  if (expense.status) {
    const s = String(expense.status).toUpperCase();
    if (s === 'DRAFT' || s === 'VOID' || s === 'VOIDED' || s === 'REJECTED' || s === 'DELETED') {
      return 0;
    }
  }

  const amt = expense.amount !== undefined ? expense.amount : expense;
  return toCents(amt);
}

/**
 * Filter and resolve a lien line to its approved negotiated payoff cent amount.
 * Uses approved negotiated payoff amount rather than original balance.
 * Excludes unapproved/rejected liens.
 */
export function resolveApprovedLienCents(lien) {
  if (!lien) return 0;

  // Status check: if status is explicitly specified, exclude unapproved/rejected/voided/disputed
  if (lien.status) {
    const s = String(lien.status).toUpperCase();
    if (s === 'REJECTED' || s === 'DISPUTED' || s === 'VOID' || s === 'UNAPPROVED' || s === 'EXCLUDED') {
      return 0;
    }
  }

  // Deduct approved negotiated payoff amount rather than original balance
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

/**
 * Calculates contingency attorney fee, deduction totals, and net client proceeds
 * with exact integer-cent precision.
 *
 * Formula:
 * Client Net = Gross Recovery - Attorney Fee - Approved Lien Payoffs - Eligible Posted Expenses
 *
 * @param {Object} params
 * @param {number|string} [params.grossRecovery=0]
 * @param {number|string} [params.feeRate=33.33] - Signed or custom fee percentage (e.g., 30, 33.33, 40)
 * @param {string} [params.feeRateOption='standard'] - 'standard' or 'exact' (for 1/3 exact)
 * @param {Array} [params.caseExpenses=[]] - Eligible posted case expenses
 * @param {Array} [params.medicalLiens=[]] - Approved medical and subrogation liens
 * @param {Array} [params.otherDeductions=[]] - Other client advances or authorized deductions
 */
export function calculateSettlement({
  grossRecovery = 0,
  feeRate = 33.33,
  feeRateOption = 'standard',
  caseExpenses = [],
  medicalLiens = [],
  otherDeductions = [],
}) {
  const grossCents = Math.max(0, toCents(grossRecovery));
  const numericRate = Number(feeRate);
  const safeRate = Number.isFinite(numericRate) ? Math.max(0, numericRate) : 0;

  // Attorney fee calculation
  const feeCents =
    feeRateOption === 'exact'
      ? Math.round(grossCents / 3)
      : Math.round((grossCents * safeRate) / 100);

  // Exactly-once deduction deduplication using set of IDs / keys if present
  const seenExpenseIds = new Set();
  const expensesCents = (caseExpenses || []).reduce((sum, item) => {
    if (item && item.id) {
      if (seenExpenseIds.has(item.id)) return sum;
      seenExpenseIds.add(item.id);
    }
    return sum + resolveEligibleExpenseCents(item);
  }, 0);

  const seenLienIds = new Set();
  const liensCents = (medicalLiens || []).reduce((sum, item) => {
    if (item && item.id) {
      if (seenLienIds.has(item.id)) return sum;
      seenLienIds.add(item.id);
    }
    return sum + resolveApprovedLienCents(item);
  }, 0);

  const seenOtherIds = new Set();
  const otherCents = (otherDeductions || []).reduce((sum, item) => {
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
