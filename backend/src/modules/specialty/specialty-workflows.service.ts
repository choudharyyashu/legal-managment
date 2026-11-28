/**
 * LEGALPRO SPECIALTY PRACTICE WORKFLOW ENGINES
 *
 * Implements:
 * 1. Bankruptcy: Fixture & asset exemption calculation (Utah Homestead § 78B-5-505),
 *    Means-test eligibility (Chapter 7 vs 13), creditor matrix compilation, filing package packaging.
 * 2. Immigration: Bilingual intake (EN/ES), petitioner vs beneficiary roles, shared answers,
 *    USCIS evidence checklist, receipt number validation (LIN/WAC/IOE).
 * 3. Appeals: Source date tracking, dependent jurisdictional deadline engine (Utah R. App. P. 4, 11, 26).
 * 4. Landlord-Tenant: Utah 3-day pay-or-quit notice, partial payment rent ledger, satisfaction withholding.
 */

export interface BankruptcyFixtureCalculation {
  assetDescription: string;
  fairMarketValue: number;
  securedDebtLien: number;
  statutoryExemptionAmount: number;
  exemptionStatute: string;
  nonExemptEquity: number;
  isFullyExempt: boolean;
}

export interface BankruptcyMeansTestResult {
  debtorHouseholdSize: number;
  monthlyGrossIncome: number;
  annualizedIncome: number;
  utahMedianFamilyIncome: number;
  isBelowMedian: boolean;
  presumptionOfAbuse: boolean;
  recommendedChapter: 'Chapter 7' | 'Chapter 13';
  commitmentPeriodMonths: 36 | 60;
}

export interface ImmigrationBilingualIntake {
  intakeLanguage: 'EN' | 'ES';
  petitioner: {
    name: string;
    citizenshipStatus: 'US_CITIZEN' | 'LPR';
    ssnOrAit: string;
    relationshipToBeneficiary: string;
  };
  beneficiary: {
    fullName: string;
    nombreCompleto?: string;
    alienRegistrationNumber?: string;
    countryOfBirth: string;
    currentImmigrationStatus: string;
  };
  sharedFamilyAnswers: {
    jointResidenceAddress: string;
    marriageDate?: string;
    marriageLocation?: string;
    priorMarriagesTerminated: boolean;
  };
  evidenceChecklist: Array<{ exhibitCode: string; description: string; isSubmitted: boolean }>;
}

export interface AppealsDeadlineSchedule {
  trialCourtOrderEntryDate: string;
  noticeOfAppealDeadline: string; // 30 days
  transcriptRequestDeadline: string; // 10 days after notice
  recordTransmissionEstimate: string;
  appellantBriefDeadline: string; // 40 days after record
  appelleeBriefDeadline: string; // 30 days after appellant brief
  isNoticeTimely: boolean;
  jurisdictionalAlert?: string;
}

export interface LandlordTenantRentLedger {
  tenantName: string;
  propertyAddress: string;
  judgmentRentOwed: number;
  courtCostsAndFees: number;
  totalJudgmentAmount: number;
  paymentsReceived: Array<{ date: string; amount: number; reference: string }>;
  totalPaymentsCollected: number;
  outstandingBalance: number;
  isFullySatisfied: boolean;
  closureStatus: 'UNDER_REVIEW_PARTIAL_BALANCE' | 'APPROVED_FULL_SATISFACTION';
  withholdingReason?: string;
}

export class SpecialtyWorkflowsService {
  /**
   * Utah 2026 Median Family Income Benchmarks (U.S. Trustee Program)
   */
  private static readonly UTAH_MEDIAN_INCOME: Record<number, number> = {
    1: 72540,
    2: 91420,
    3: 104850,
    4: 119600,
    5: 129500,
  };

  /**
   * 1. Bankruptcy: Fixture & Exemption Equity Calculator
   */
  static calculateAssetExemption(input: {
    assetDescription: string;
    fairMarketValue: number;
    securedDebtLien: number;
    claimedExemption: number;
    exemptionStatute?: string;
  }): BankruptcyFixtureCalculation {
    const fmv = Number(input.fairMarketValue || 0);
    const lien = Number(input.securedDebtLien || 0);
    const exemption = Number(input.claimedExemption || 0);

    const netEquity = Math.max(0, fmv - lien);
    const nonExemptEquity = Math.max(0, netEquity - exemption);

    return {
      assetDescription: input.assetDescription,
      fairMarketValue: fmv,
      securedDebtLien: lien,
      statutoryExemptionAmount: exemption,
      exemptionStatute: input.exemptionStatute || 'Utah Code Ann. § 78B-5-505',
      nonExemptEquity: Math.round(nonExemptEquity * 100) / 100,
      isFullyExempt: nonExemptEquity === 0,
    };
  }

  /**
   * 1b. Bankruptcy: Chapter 7 / Chapter 13 Means Test Calculator
   */
  static evaluateMeansTest(householdSize: number, monthlyGrossIncome: number): BankruptcyMeansTestResult {
    const size = Math.max(1, Math.min(5, householdSize));
    const monthly = Number(monthlyGrossIncome || 0);
    const annualized = monthly * 12;
    const median = this.UTAH_MEDIAN_INCOME[size] || 119600;

    const isBelowMedian = annualized <= median;

    return {
      debtorHouseholdSize: size,
      monthlyGrossIncome: monthly,
      annualizedIncome: annualized,
      utahMedianFamilyIncome: median,
      isBelowMedian,
      presumptionOfAbuse: !isBelowMedian,
      recommendedChapter: isBelowMedian ? 'Chapter 7' : 'Chapter 13',
      commitmentPeriodMonths: isBelowMedian ? 36 : 60,
    };
  }

  /**
   * 1c. Bankruptcy: Creditor Matrix Format Generator
   */
  static generateCreditorMatrix(creditors: Array<{ name: string; address: string; city: string; state: string; zip: string }>): string {
    return creditors
      .map((c) => `${c.name.trim()}\n${c.address.trim()}\n${c.city.trim()}, ${c.state.trim()} ${c.zip.trim()}`)
      .join('\n\n');
  }

  /**
   * 2. Immigration: USCIS 13-Character Receipt Number Validator
   */
  static validateUscisReceipt(receiptNumber: string): { isValid: boolean; centerCode: string; trackingCode: string } {
    const clean = (receiptNumber || '').trim().toUpperCase();
    const regex = /^(LIN|WAC|EAC|SRC|NBC|IOE|MSC)\d{10}$/;

    if (!regex.test(clean)) {
      return { isValid: false, centerCode: '', trackingCode: '' };
    }

    return {
      isValid: true,
      centerCode: clean.substring(0, 3),
      trackingCode: clean.substring(3),
    };
  }

  /**
   * 3. Appeals: Jurisdictional Deadline Calculator (Utah Rules of Appellate Procedure)
   */
  static computeAppellateDeadlines(orderDateStr: string, actualNoticeFilingDateStr?: string): AppealsDeadlineSchedule {
    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) {
      throw new Error(`Invalid order date: ${orderDateStr}`);
    }

    // Notice of appeal deadline: strictly 30 days after entry of judgment (Utah R. App. P. 4(a))
    const noticeDeadline = new Date(orderDate);
    noticeDeadline.setDate(noticeDeadline.getDate() + 30);

    // Transcript request: 10 days after filing notice of appeal (Utah R. App. P. 11(e))
    const noticeFilingDate = actualNoticeFilingDateStr ? new Date(actualNoticeFilingDateStr) : noticeDeadline;
    const transcriptDeadline = new Date(noticeFilingDate);
    transcriptDeadline.setDate(transcriptDeadline.getDate() + 10);

    // Record on appeal estimated filing: ~30 days after transcript designation
    const recordTransmission = new Date(transcriptDeadline);
    recordTransmission.setDate(recordTransmission.getDate() + 30);

    // Appellant brief deadline: 40 days after record filed (Utah R. App. P. 26(a))
    const appellantBriefDeadline = new Date(recordTransmission);
    appellantBriefDeadline.setDate(appellantBriefDeadline.getDate() + 40);

    // Appellee brief deadline: 30 days after service of appellant brief
    const appelleeBriefDeadline = new Date(appellantBriefDeadline);
    appelleeBriefDeadline.setDate(appelleeBriefDeadline.getDate() + 30);

    const isNoticeTimely = actualNoticeFilingDateStr
      ? new Date(actualNoticeFilingDateStr).getTime() <= noticeDeadline.getTime()
      : true;

    return {
      trialCourtOrderEntryDate: orderDate.toISOString().split('T')[0],
      noticeOfAppealDeadline: noticeDeadline.toISOString().split('T')[0],
      transcriptRequestDeadline: transcriptDeadline.toISOString().split('T')[0],
      recordTransmissionEstimate: recordTransmission.toISOString().split('T')[0],
      appellantBriefDeadline: appellantBriefDeadline.toISOString().split('T')[0],
      appelleeBriefDeadline: appelleeBriefDeadline.toISOString().split('T')[0],
      isNoticeTimely,
      jurisdictionalAlert: isNoticeTimely
        ? undefined
        : 'CRITICAL JURISDICTIONAL ALERT: Notice of Appeal was filed beyond the mandatory 30-day jurisdictional limit of Utah R. App. P. 4(a). Immediate Rule 4(c) motion for extension required.',
    };
  }

  /**
   * 4. Landlord-Tenant: Eviction Rent Ledger & Satisfaction Withholding
   */
  static computeEvictionLedger(
    tenantName: string,
    propertyAddress: string,
    rentOwed: number,
    courtCosts: number,
    payments: Array<{ date: string; amount: number; reference: string }>
  ): LandlordTenantRentLedger {
    const totalJudgment = Number(rentOwed || 0) + Number(courtCosts || 0);
    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Math.max(0, totalJudgment - totalCollected);
    const isSatisfied = outstanding === 0;

    return {
      tenantName,
      propertyAddress,
      judgmentRentOwed: rentOwed,
      courtCostsAndFees: courtCosts,
      totalJudgmentAmount: totalJudgment,
      paymentsReceived: payments,
      totalPaymentsCollected: totalCollected,
      outstandingBalance: Math.round(outstanding * 100) / 100,
      isFullySatisfied: isSatisfied,
      closureStatus: isSatisfied ? 'APPROVED_FULL_SATISFACTION' : 'UNDER_REVIEW_PARTIAL_BALANCE',
      withholdingReason: isSatisfied
        ? undefined
        : `Outstanding balance of $${outstanding.toFixed(2)} remains unpaid. Full satisfaction of judgment withheld pursuant to Utah Code § 78B-5-201.`,
    };
  }
}
