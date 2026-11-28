import {
  calculateSettlement,
  toCents,
  centsToDollars,
  resolveApprovedLienCents,
  resolveEligibleExpenseCents,
} from '../modules/personal-injury/settlement-calculator.util.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPriority2AcceptanceTests() {
  console.log('================================================================');
  console.log('LEGALPRO PRIORITY 2: SETTLEMENT CALCULATOR ACCEPTANCE SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // SCENARIO A:
  // Gross recovery: $100,000
  // Signed attorney fee: 30% ($30,000)
  // Original lien balance: $10,000
  // Approved negotiated lien payoff: $7,000
  // Posted filing expense: $400
  // Posted records expense: $600
  // Posted expert expense: $2,000
  //
  // Expected:
  // Gross: $100,000
  // Attorney fee: $30,000
  // Total posted expenses: $3,000
  // Approved lien payoff: $7,000 (NOT $10,000)
  // Client net: $60,000
  // -------------------------------------------------------------------------
  console.log('Test 1: Client Acceptance Scenario A...');
  const expensesA = [
    { id: 'exp-1', label: 'Filing Fee', amount: 400, status: 'POSTED' },
    { id: 'exp-2', label: 'Medical Records', amount: 600, status: 'POSTED' },
    { id: 'exp-3', label: 'Expert Witness', amount: 2000, status: 'POSTED' },
  ];
  const liensA = [
    {
      id: 'lien-1',
      holder: 'IHC Health Services',
      originalAmount: 10000,
      negotiatedAmount: 7000,
      status: 'APPROVED',
    },
  ];

  const resA = calculateSettlement({
    grossRecovery: 100000,
    feeRate: 30,
    caseExpenses: expensesA,
    medicalLiens: liensA,
  });

  console.log('   Results Scenario A:');
  console.log(`     - Gross: $${resA.numericGross.toLocaleString()}`);
  console.log(`     - Attorney Fee (${resA.feeRateDisplay}): $${resA.contingencyFeeAmount.toLocaleString()}`);
  console.log(`     - Total Posted Expenses: $${resA.totalCaseExpenses.toLocaleString()}`);
  console.log(`     - Approved Lien Payoff: $${resA.totalMedicalLiens.toLocaleString()}`);
  console.log(`     - Client Net: $${resA.netClientProceeds.toLocaleString()}`);

  assert(resA.numericGross === 100000, `Gross expected 100000, got ${resA.numericGross}`);
  assert(resA.contingencyFeeAmount === 30000, `Attorney fee expected 30000, got ${resA.contingencyFeeAmount}`);
  assert(resA.totalCaseExpenses === 3000, `Expenses expected 3000, got ${resA.totalCaseExpenses}`);
  assert(resA.totalMedicalLiens === 7000, `Lien payoff expected 7000, got ${resA.totalMedicalLiens}`);
  assert(resA.netClientProceeds === 60000, `Client net expected 60000, got ${resA.netClientProceeds}`);
  console.log('   ✓ Scenario A PASSED.\n');

  // -------------------------------------------------------------------------
  // SCENARIO B:
  // Change approved negotiated lien payoff from $7,000 to $6,500.
  //
  // Expected:
  // Attorney fee remains $30,000
  // Posted expenses remain $3,000
  // Lien deduction becomes $6,500
  // Client net becomes $60,500 (+$500 to client)
  // -------------------------------------------------------------------------
  console.log('Test 2: Client Acceptance Scenario B (Recalculation to $6,500 payoff)...');
  const liensB = [
    {
      id: 'lien-1',
      holder: 'IHC Health Services',
      originalAmount: 10000,
      negotiatedAmount: 6500, // renegotiated down to $6,500
      status: 'APPROVED',
    },
  ];

  const resB = calculateSettlement({
    grossRecovery: 100000,
    feeRate: 30,
    caseExpenses: expensesA,
    medicalLiens: liensB,
  });

  console.log('   Results Scenario B:');
  console.log(`     - Gross: $${resB.numericGross.toLocaleString()}`);
  console.log(`     - Attorney Fee: $${resB.contingencyFeeAmount.toLocaleString()}`);
  console.log(`     - Total Posted Expenses: $${resB.totalCaseExpenses.toLocaleString()}`);
  console.log(`     - Approved Lien Payoff: $${resB.totalMedicalLiens.toLocaleString()}`);
  console.log(`     - Client Net: $${resB.netClientProceeds.toLocaleString()}`);

  assert(resB.contingencyFeeAmount === 30000, `Attorney fee should remain 30000, got ${resB.contingencyFeeAmount}`);
  assert(resB.totalCaseExpenses === 3000, `Expenses should remain 3000, got ${resB.totalCaseExpenses}`);
  assert(resB.totalMedicalLiens === 6500, `Lien payoff expected 6500, got ${resB.totalMedicalLiens}`);
  assert(resB.netClientProceeds === 60500, `Client net expected 60500, got ${resB.netClientProceeds}`);
  assert(resB.netClientProceeds - resA.netClientProceeds === 500, 'Difference must equal exact $500 delta');
  console.log('   ✓ Scenario B PASSED.\n');

  // -------------------------------------------------------------------------
  // TEST 3: Duplicate Deduction Prevention (Exactly-Once Deductions)
  // -------------------------------------------------------------------------
  console.log('Test 3: Exactly-Once Deductions & Duplicate Prevention...');
  const duplicatedExpenses = [
    { id: 'exp-1', label: 'Filing Fee', amount: 400, status: 'POSTED' },
    { id: 'exp-1', label: 'Duplicate Filing Fee', amount: 400, status: 'POSTED' }, // Duplicate ID
    { id: 'exp-2', label: 'Deposition Transcript', amount: 800, status: 'POSTED' },
  ];
  const duplicatedLiens = [
    { id: 'lien-1', holder: 'Hospital', negotiatedAmount: 3000, status: 'APPROVED' },
    { id: 'lien-1', holder: 'Hospital (Re-query)', negotiatedAmount: 3000, status: 'APPROVED' }, // Duplicate ID
  ];

  const resDup = calculateSettlement({
    grossRecovery: 50000,
    feeRate: 33.33,
    caseExpenses: duplicatedExpenses,
    medicalLiens: duplicatedLiens,
  });

  assert(resDup.totalCaseExpenses === 1200, `Expenses should be 1200 (not 1600), got ${resDup.totalCaseExpenses}`);
  assert(resDup.totalMedicalLiens === 3000, `Lien should be 3000 (not 6000), got ${resDup.totalMedicalLiens}`);
  console.log('   ✓ Duplicate prevention PASSED.\n');

  // -------------------------------------------------------------------------
  // TEST 4: Status Filtering (Draft, Void, and Unapproved Exclusions)
  // -------------------------------------------------------------------------
  console.log('Test 4: Status-Based Filtering (Draft/Void/Rejected Exclusions)...');
  const mixedStatusExpenses = [
    { id: 'e1', label: 'Valid Posted Expense', amount: 500, status: 'POSTED' },
    { id: 'e2', label: 'Unposted Draft Expense', amount: 1500, status: 'DRAFT' },
    { id: 'e3', label: 'Voided Incurred Expense', amount: 2000, status: 'VOID' },
  ];
  const mixedStatusLiens = [
    { id: 'l1', holder: 'Approved Payoff', negotiatedAmount: 4000, status: 'APPROVED' },
    { id: 'l2', holder: 'Disputed Lien (Unapproved)', negotiatedAmount: 8000, status: 'DISPUTED' },
    { id: 'l3', holder: 'Rejected Lien', negotiatedAmount: 3000, status: 'REJECTED' },
  ];

  const resStatus = calculateSettlement({
    grossRecovery: 20000,
    feeRate: 25,
    caseExpenses: mixedStatusExpenses,
    medicalLiens: mixedStatusLiens,
  });

  assert(resStatus.totalCaseExpenses === 500, `Only posted expense should be included (500), got ${resStatus.totalCaseExpenses}`);
  assert(resStatus.totalMedicalLiens === 4000, `Only approved lien should be included (4000), got ${resStatus.totalMedicalLiens}`);
  console.log('   ✓ Status exclusions PASSED.\n');

  // -------------------------------------------------------------------------
  // TEST 5: Custom Signed Fee Rates (25%, 33.33%, Exact 1/3, 40%, 50%)
  // -------------------------------------------------------------------------
  console.log('Test 5: Custom Fee Agreements & Exact 1/3 Precision...');
  const resExactThird = calculateSettlement({ grossRecovery: 100000, feeRateOption: 'exact' });
  assert(resExactThird.contingencyFeeAmount === 33333.33, `1/3 of 100k should be 33333.33, got ${resExactThird.contingencyFeeAmount}`);
  assert(resExactThird.netClientProceeds === 66666.67, `Net client should be 66666.67, got ${resExactThird.netClientProceeds}`);

  const res40 = calculateSettlement({ grossRecovery: 100000, feeRate: 40 });
  assert(res40.contingencyFeeAmount === 40000, `40% of 100k should be 40000, got ${res40.contingencyFeeAmount}`);

  const res25 = calculateSettlement({ grossRecovery: 100000, feeRate: 25 });
  assert(res25.contingencyFeeAmount === 25000, `25% of 100k should be 25000, got ${res25.contingencyFeeAmount}`);
  console.log('   ✓ Custom fee options PASSED.\n');

  // -------------------------------------------------------------------------
  // TEST 6: Boundary Values (Zero, Negative, Empty)
  // -------------------------------------------------------------------------
  console.log('Test 6: Boundary Values...');
  const resZero = calculateSettlement({ grossRecovery: 0, feeRate: 30 });
  assert(resZero.numericGross === 0 && resZero.netClientProceeds === 0, 'Zero gross must yield zero proceeds');

  const resNegative = calculateSettlement({ grossRecovery: -10000, feeRate: 30 });
  assert(resNegative.numericGross === 0 && resNegative.netClientProceeds === 0, 'Negative gross must be clamped to zero');
  console.log('   ✓ Boundary values PASSED.\n');

  console.log('================================================================');
  console.log('ALL PRIORITY 2 ACCEPTANCE AND REGRESSION TESTS PASSED!');
  console.log('================================================================');
}

runPriority2AcceptanceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
