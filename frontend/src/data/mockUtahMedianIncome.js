// Official Census Bureau Median Family Income Benchmarks for Utah
// Reference: Form 122A-1 / Form 122C-1 (U.S. Trustee Program) (DEMO / SIMULATED)

export const UTAH_MEDIAN_FAMILY_INCOME = [
  { householdSize: 1, annualMedian: 72140, monthlyMedian: 6011.67 },
  { householdSize: 2, annualMedian: 91220, monthlyMedian: 7601.67 },
  { householdSize: 3, annualMedian: 101850, monthlyMedian: 8487.50 },
  { householdSize: 4, annualMedian: 112450, monthlyMedian: 9370.83 },
  { householdSize: 5, annualMedian: 122350, monthlyMedian: 10195.83 },
  { householdSize: 6, annualMedian: 132250, monthlyMedian: 11020.83 },
  { householdSize: 7, annualMedian: 142150, monthlyMedian: 11845.83 },
  { householdSize: 8, annualMedian: 152050, monthlyMedian: 12670.83 }
];

export const getUtahMedianThreshold = (householdSize) => {
  const size = Math.max(1, Math.floor(householdSize || 1));
  if (size <= 8) {
    return UTAH_MEDIAN_FAMILY_INCOME.find(u => u.householdSize === size);
  }
  // Above 8 dependents: Add $9,900 per additional person per year
  const base8 = UTAH_MEDIAN_FAMILY_INCOME.find(u => u.householdSize === 8);
  const extraPeople = size - 8;
  const annual = base8.annualMedian + (extraPeople * 9900);
  return {
    householdSize: size,
    annualMedian: annual,
    monthlyMedian: annual / 12
  };
};

export const evaluateMeansTest = (householdSize, grossMonthlyIncome) => {
  const threshold = getUtahMedianThreshold(householdSize);
  const annualizedIncome = (grossMonthlyIncome || 0) * 12;
  const isBelowMedian = annualizedIncome <= threshold.annualMedian;

  return {
    householdSize,
    grossMonthlyIncome,
    annualizedIncome,
    medianAnnualThreshold: threshold.annualMedian,
    medianMonthlyThreshold: threshold.monthlyMedian,
    isBelowMedian,
    resultSummary: isBelowMedian
      ? 'Passed Utah Median Test: Chapter 7 Presumption of Abuse Does Not Arise'
      : 'Above Utah Median: Presumption of Abuse Form 122A-2 / 60-Month Commitment Required',
    applicableCommitmentPeriodMonths: isBelowMedian ? 36 : 60
  };
};

