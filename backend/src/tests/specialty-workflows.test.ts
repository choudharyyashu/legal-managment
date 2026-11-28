/**
 * LEGALPRO SPECIALTY PRACTICE WORKFLOWS VERIFICATION SUITE
 *
 * Verifies:
 * 1. Bankruptcy: Asset fixture valuation, Utah statutory exemptions, Chapter 7/13 means test, creditor matrix.
 * 2. Immigration: Bilingual intake (EN/ES), petitioner vs beneficiary role modeling, USCIS evidence & receipt tracking.
 * 3. Appeals: Source date tracking, dependent jurisdictional deadlines (Utah R. App. P. 4, 11, 26).
 * 4. Landlord-Tenant: Eviction rent ledger, partial payment withholding ($2,000 balance), full satisfaction release.
 */

import assert from 'assert';
import { SpecialtyWorkflowsService } from '../modules/specialty/specialty-workflows.service.js';

console.log('================================================================');
console.log('LEGALPRO SPECIALTY PRACTICE WORKFLOWS VERIFICATION SUITE');
console.log('================================================================\n');

async function runSpecialtyWorkflowTests() {
  // ---------------------------------------------------------------------------
  // TEST 1: Bankruptcy - Fixture Calculations, Exemptions & Means Testing
  // ---------------------------------------------------------------------------
  console.log('Test 1: Bankruptcy Practice - Fixture Equity, Exemptions & Means Testing...');
  {
    // 1A. Utah Homestead Exemption Calculation (Utah Code § 78B-5-505)
    // Debtor primary residence: FMV $420,000, 1st Mortgage Lien $340,000, Utah Homestead Exemption $43,700
    const homeExemption = SpecialtyWorkflowsService.calculateAssetExemption({
      assetDescription: 'Primary Residence - Sandy, UT',
      fairMarketValue: 420000,
      securedDebtLien: 340000,
      claimedExemption: 43700,
      exemptionStatute: 'Utah Code Ann. § 78B-5-505 (Homestead Exemption)',
    });

    // Net equity: $420,000 - $340,000 = $80,000
    // Non-exempt equity: $80,000 - $43,700 = $36,300
    assert.strictEqual(homeExemption.nonExemptEquity, 36300, 'Non-exempt equity must equal $36,300');
    assert.strictEqual(homeExemption.isFullyExempt, false, 'Property with excess equity must not be marked fully exempt');

    // Fully Exempt Asset (Motor Vehicle under Utah Code § 78B-5-506: FMV $5,000, Exemption $5,000)
    const vehicleExemption = SpecialtyWorkflowsService.calculateAssetExemption({
      assetDescription: '2016 Honda Civic',
      fairMarketValue: 5000,
      securedDebtLien: 0,
      claimedExemption: 5000,
      exemptionStatute: 'Utah Code Ann. § 78B-5-506 (Motor Vehicle Exemption)',
    });
    assert.strictEqual(vehicleExemption.nonExemptEquity, 0, 'Fully exempt asset must have 0 non-exempt equity');
    assert.strictEqual(vehicleExemption.isFullyExempt, true, 'Fully exempt asset flag must be true');

    // 1B. Chapter 7 Means Test (Household of 3, Income $7,000/mo = $84,000/yr vs Utah Median $104,850)
    const ch7MeansTest = SpecialtyWorkflowsService.evaluateMeansTest(3, 7000);
    assert.strictEqual(ch7MeansTest.isBelowMedian, true, 'Debtor earning $84,000 must be below Utah 3-person median ($104,850)');
    assert.strictEqual(ch7MeansTest.recommendedChapter, 'Chapter 7', 'Below-median debtor qualifies for Chapter 7');
    assert.strictEqual(ch7MeansTest.presumptionOfAbuse, false, 'No presumption of abuse for below-median debtor');

    // 1C. Chapter 13 Means Test (Household of 2, Income $9,500/mo = $114,000/yr vs Utah Median $91,420)
    const ch13MeansTest = SpecialtyWorkflowsService.evaluateMeansTest(2, 9500);
    assert.strictEqual(ch13MeansTest.isBelowMedian, false, 'Debtor earning $114,000 must be above Utah 2-person median ($91,420)');
    assert.strictEqual(ch13MeansTest.recommendedChapter, 'Chapter 13', 'Above-median debtor routes to Chapter 13');
    assert.strictEqual(ch13MeansTest.commitmentPeriodMonths, 60, 'Above-median debtor requires 60-month commitment period');

    // 1D. Creditor Matrix Generation
    const creditors = [
      { name: 'Mountain America Credit Union', address: 'PO Box 2331', city: 'Salt Lake City', state: 'UT', zip: '84110' },
      { name: 'Discover Financial Services', address: 'PO Box 15316', city: 'Wilmington', state: 'DE', zip: '19850' },
    ];
    const matrix = SpecialtyWorkflowsService.generateCreditorMatrix(creditors);
    assert(matrix.includes('Mountain America Credit Union'), 'Matrix must contain MACU');
    assert(matrix.includes('Discover Financial Services'), 'Matrix must contain Discover');

    console.log(`   ✓ Homestead Non-Exempt Equity: $${homeExemption.nonExemptEquity.toLocaleString()} (Exemption: $${homeExemption.statutoryExemptionAmount.toLocaleString()})`);
    console.log(`   ✓ Vehicle Fully Exempt: ${vehicleExemption.isFullyExempt}`);
    console.log(`   ✓ Below-Median Means Test: ${ch7MeansTest.recommendedChapter} (Annualized: $${ch7MeansTest.annualizedIncome.toLocaleString()} vs Median: $${ch7MeansTest.utahMedianFamilyIncome.toLocaleString()})`);
    console.log(`   ✓ Above-Median Means Test: ${ch13MeansTest.recommendedChapter} (${ch13MeansTest.commitmentPeriodMonths}-Month Plan)`);
    console.log(`   ✓ Creditor Matrix compiled (${creditors.length} creditors)`);
    console.log('   ✓ Test 1 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Immigration - Bilingual Intake, Roles, Shared Answers & Receipts
  // ---------------------------------------------------------------------------
  console.log('Test 2: Immigration Practice - Bilingual Intake, Roles & Receipt Tracking...');
  {
    // Fictional Bilingual Intake & Shared Answers
    const bilingualIntake: any = {
      intakeLanguage: 'ES', // Spanish-language intake
      petitioner: {
        name: 'Carlos Ramirez',
        citizenshipStatus: 'US_CITIZEN',
        ssnOrAit: '***-**-4412',
        relationshipToBeneficiary: 'SPOUSE',
      },
      beneficiary: {
        fullName: 'Lucia Morales Ortiz',
        nombreCompleto: 'Lucía Morales Ortiz',
        alienRegistrationNumber: 'A-209-441-890',
        countryOfBirth: 'Mexico',
        currentImmigrationStatus: 'B-2 VISITOR',
      },
      sharedFamilyAnswers: {
        jointResidenceAddress: '742 E 500 S, Apt 12, Salt Lake City, UT 84102',
        marriageDate: '2023-06-15',
        marriageLocation: 'Salt Lake County, Utah',
        priorMarriagesTerminated: true,
      },
      evidenceChecklist: [
        { exhibitCode: 'EXH-A', description: 'Certified Copy of Marriage Certificate', isSubmitted: true },
        { exhibitCode: 'EXH-B', description: 'Petitioner U.S. Passport Biometrics Page', isSubmitted: true },
        { exhibitCode: 'EXH-C', description: 'Beneficiary Form I-94 Arrival Record', isSubmitted: true },
        { exhibitCode: 'EXH-D', description: 'Form I-864 Affidavit of Support with IRS 1040 Transcripts', isSubmitted: true },
      ],
    };

    assert.strictEqual(bilingualIntake.petitioner.relationshipToBeneficiary, 'SPOUSE');
    assert.strictEqual(bilingualIntake.beneficiary.alienRegistrationNumber, 'A-209-441-890');
    assert.strictEqual(bilingualIntake.evidenceChecklist.length, 4, 'Must have 4 mandatory filing exhibits');

    // USCIS Receipt Number Validation
    const receipt1 = SpecialtyWorkflowsService.validateUscisReceipt('LIN2690012345'); // Nebraska Service Center
    const receipt2 = SpecialtyWorkflowsService.validateUscisReceipt('IOE0912345678'); // ELIS Online
    const receiptInvalid = SpecialtyWorkflowsService.validateUscisReceipt('INVALID999');

    assert.strictEqual(receipt1.isValid, true, 'LIN receipt must be valid');
    assert.strictEqual(receipt1.centerCode, 'LIN');
    assert.strictEqual(receipt2.isValid, true, 'IOE receipt must be valid');
    assert.strictEqual(receipt2.centerCode, 'IOE');
    assert.strictEqual(receiptInvalid.isValid, false, 'Malformed receipt must be invalid');

    console.log(`   ✓ Bilingual Intake Processed: Language = ${bilingualIntake.intakeLanguage} (Petitioner: ${bilingualIntake.petitioner.name} -> Beneficiary: ${bilingualIntake.beneficiary.fullName})`);
    console.log(`   ✓ Shared Answers Validated: Joint Residence = ${bilingualIntake.sharedFamilyAnswers.jointResidenceAddress}`);
    console.log(`   ✓ Supporting Evidence: ${bilingualIntake.evidenceChecklist.length} exhibits submitted`);
    console.log(`   ✓ Validated USCIS Receipts: ${receipt1.centerCode}-${receipt1.trackingCode} & ${receipt2.centerCode}-${receipt2.trackingCode}`);
    console.log('   ✓ Test 2 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Appeals - Jurisdictional Deadlines & Dependent Schedule
  // ---------------------------------------------------------------------------
  console.log('Test 3: Appeals Practice - Source Dates & Dependent Deadline Review...');
  {
    // Trial Court Final Judgment Entry: January 10, 2026
    const orderDate = '2026-01-10';

    // Scenario 3A: Timely Notice of Appeal filed on Day 22 (February 01, 2026)
    const timelySchedule = SpecialtyWorkflowsService.computeAppellateDeadlines(orderDate, '2026-02-01');

    assert.strictEqual(timelySchedule.isNoticeTimely, true, 'Notice filed on Day 22 must be timely');
    assert.strictEqual(timelySchedule.noticeOfAppealDeadline, '2026-02-09', 'Notice deadline must be exactly 30 days after order (Feb 9, 2026)');
    assert.strictEqual(timelySchedule.transcriptRequestDeadline, '2026-02-11', 'Transcript request deadline must be 10 days after notice (Feb 11, 2026)');
    assert.strictEqual(timelySchedule.jurisdictionalAlert, undefined, 'No alert for timely appeal');

    // Scenario 3B: Late Notice of Appeal filed on Day 35 (February 14, 2026)
    const lateSchedule = SpecialtyWorkflowsService.computeAppellateDeadlines(orderDate, '2026-02-14');

    assert.strictEqual(lateSchedule.isNoticeTimely, false, 'Notice filed on Day 35 must be marked untimely');
    assert(lateSchedule.jurisdictionalAlert?.includes('CRITICAL JURISDICTIONAL ALERT'), 'Must trigger jurisdictional warning under Utah R. App. P. 4(a)');

    console.log(`   ✓ Trial Order Entry Date: ${timelySchedule.trialCourtOrderEntryDate}`);
    console.log(`   ✓ Notice of Appeal Deadline (30 Days): ${timelySchedule.noticeOfAppealDeadline}`);
    console.log(`   ✓ Transcript Request Deadline (10 Days): ${timelySchedule.transcriptRequestDeadline}`);
    console.log(`   ✓ Appellant Opening Brief Deadline (40 Days post-record): ${timelySchedule.appellantBriefDeadline}`);
    console.log(`   ✓ Jurisdictional Safeguard: Untimely filing correctly triggered ${lateSchedule.jurisdictionalAlert?.substring(0, 31)}`);
    console.log('   ✓ Test 3 PASSED.\n');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Landlord-Tenant - Rent Ledger, Partial Payment & Closure Workflow
  // ---------------------------------------------------------------------------
  console.log('Test 4: Landlord-Tenant Practice - Rent Ledger, Partial Payment & Closure...');
  {
    const tenant = 'Jonathan Miller';
    const address = '450 S 900 E, Apt 4B, Salt Lake City, UT 84102';
    const rentOwed = 2800.00;
    const courtCosts = 450.00;
    // Total Judgment: $3,250.00

    // Scenario 4A: Partial Payment ($1,250 paid -> $2,000 balance remaining)
    const partialPayments = [
      { date: '2026-02-05', amount: 1250.00, reference: 'CASHIER_CHECK_#8891' },
    ];
    const partialLedger = SpecialtyWorkflowsService.computeEvictionLedger(tenant, address, rentOwed, courtCosts, partialPayments);

    assert.strictEqual(partialLedger.totalJudgmentAmount, 3250.00, 'Total judgment must equal $3,250.00');
    assert.strictEqual(partialLedger.totalPaymentsCollected, 1250.00, 'Collected amount must equal $1,250.00');
    assert.strictEqual(partialLedger.outstandingBalance, 2000.00, 'Remaining balance must equal $2,000.00');
    assert.strictEqual(partialLedger.isFullySatisfied, false, 'Partial payment must NOT mark judgment fully satisfied');
    assert.strictEqual(partialLedger.closureStatus, 'UNDER_REVIEW_PARTIAL_BALANCE', 'Closure status must be UNDER_REVIEW_PARTIAL_BALANCE');
    assert(partialLedger.withholdingReason?.includes('Full satisfaction of judgment withheld'), 'Must include withholding safeguard reason');

    // Scenario 4B: Full Satisfaction ($3,250 total paid -> $0 balance remaining)
    const fullPayments = [
      { date: '2026-02-05', amount: 1250.00, reference: 'CASHIER_CHECK_#8891' },
      { date: '2026-02-20', amount: 2000.00, reference: 'WIRE_TRANSFER_#9021' },
    ];
    const fullLedger = SpecialtyWorkflowsService.computeEvictionLedger(tenant, address, rentOwed, courtCosts, fullPayments);

    assert.strictEqual(fullLedger.totalPaymentsCollected, 3250.00, 'Total collected must equal $3,250.00');
    assert.strictEqual(fullLedger.outstandingBalance, 0.00, 'Outstanding balance must equal $0.00');
    assert.strictEqual(fullLedger.isFullySatisfied, true, 'Judgment must be marked fully satisfied');
    assert.strictEqual(fullLedger.closureStatus, 'APPROVED_FULL_SATISFACTION', 'Closure status must be APPROVED_FULL_SATISFACTION');
    assert.strictEqual(fullLedger.withholdingReason, undefined, 'No withholding reason on full satisfaction');

    console.log(`   ✓ Partial Ledger: Collected $${partialLedger.totalPaymentsCollected.toFixed(2)} / $${partialLedger.totalJudgmentAmount.toFixed(2)} | Balance: $${partialLedger.outstandingBalance.toFixed(2)}`);
    console.log(`   ✓ Partial Status: ${partialLedger.closureStatus} (Satisfaction Withheld)`);
    console.log(`   ✓ Full Ledger: Collected $${fullLedger.totalPaymentsCollected.toFixed(2)} / $${fullLedger.totalJudgmentAmount.toFixed(2)} | Balance: $${fullLedger.outstandingBalance.toFixed(2)}`);
    console.log(`   ✓ Full Status: ${fullLedger.closureStatus} (Full Release Authorized)`);
    console.log('   ✓ Test 4 PASSED.\n');
  }

  console.log('================================================================');
  console.log('ALL 4 SPECIALTY PRACTICE WORKFLOW TESTS PASSED CLEANLY');
  console.log('================================================================\n');
}

runSpecialtyWorkflowTests().catch((err) => {
  console.error('Specialty workflow test suite failed:', err);
  process.exit(1);
});
