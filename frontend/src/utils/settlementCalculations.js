/**
 * Shared settlement disbursement calculation helpers using integer-cent arithmetic.
 * Avoids floating-point drift and distinguishes exact 1/3 from 33.33%.
 */

export function toCents(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100);
}

export function centsToDollars(cents) {
  return Math.round(cents) / 100;
}

export function formatFeeRateDisplay(feeRate, feeRateOption = 'standard') {
  if (feeRateOption === 'exact') {
    return '1/3 (Exact)';
  }
  const numericRate = Number(feeRate);
  return `${(Number.isFinite(numericRate) ? numericRate : 0).toFixed(2)}%`;
}

/**
 * Calculates contingency attorney fee, deduction totals, and net client proceeds
 * with exact integer-cent precision.
 *
 * Fees are calculated on gross recovery.
 */
export function calculateSettlement({
  grossRecovery = 0,
  feeRate = 33.33,
  feeRateOption = 'standard',
  caseExpenses = [],
  medicalLiens = [],
  otherDeductions = [],
}) {
  const grossCents = toCents(grossRecovery);
  const numericRate = Number(feeRate);
  const safeRate = Number.isFinite(numericRate) ? numericRate : 0;

  const feeCents =
    feeRateOption === 'exact'
      ? Math.round(grossCents / 3)
      : Math.round((grossCents * safeRate) / 100);

  const expensesCents = (caseExpenses || []).reduce(
    (sum, item) => sum + toCents(item?.amount ?? item),
    0
  );
  const liensCents = (medicalLiens || []).reduce(
    (sum, item) => sum + toCents(item?.negotiatedAmount ?? item?.amount ?? item),
    0
  );
  const otherCents = (otherDeductions || []).reduce(
    (sum, item) => sum + toCents(item?.amount ?? item),
    0
  );

  const totalDeductionsCents = expensesCents + liensCents + otherCents;
  const netClientCents = Math.max(0, grossCents - feeCents - totalDeductionsCents);

  return {
    numericGross: centsToDollars(grossCents),
    contingencyFeeAmount: centsToDollars(feeCents),
    totalCaseExpenses: centsToDollars(expensesCents),
    totalMedicalLiens: centsToDollars(liensCents),
    totalOtherDeductions: centsToDollars(otherCents),
    totalNonFeeDeductions: centsToDollars(totalDeductionsCents),
    netClientProceeds: centsToDollars(netClientCents),
    feeRateDisplay: formatFeeRateDisplay(safeRate, feeRateOption),
    feePercentageForStorage: feeRateOption === 'exact' ? 33.33 : safeRate,
    feeBasis: feeRateOption === 'exact' ? 'EXACT_ONE_THIRD' : 'PERCENTAGE',
  };
}
