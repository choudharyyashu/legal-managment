// Official Bankruptcy Schedules Ledger (A/B, D, E/F, I, J)
// Reference: Official Bankruptcy Forms 106A/B through 106J (DEMO / SIMULATED)

export const MOCK_BANKRUPTCY_SCHEDULES = {
  'BNK-2026-001': {
    caseId: 'BNK-2026-001',
    caseNumber: '26-20188-JTM',
    debtorName: 'Travis Scott Olsen',
    scheduleAB: [
      { id: 'ab-1', category: 'Real Property', description: 'Primary Residence: Single Family Home, West Jordan, UT', value: 395000, exemptAmount: 43300, law: 'Utah Code § 78B-5-501 (Homestead)' },
      { id: 'ab-2', category: 'Vehicles', description: '2019 Subaru Outback (112k miles)', value: 14200, exemptAmount: 3000, law: 'Utah Code § 78B-5-505(1)(b) (Motor Vehicle)' },
      { id: 'ab-3', category: 'Financial Accounts', description: 'America First Credit Union - Primary Checking', value: 850, exemptAmount: 850, law: 'Utah Code § 78B-5-505' },
      { id: 'ab-4', category: 'Household Goods', description: 'Basic household furniture, clothing, electronics', value: 3200, exemptAmount: 1000, law: 'Utah Code § 78B-5-505(1)(a)' },
      { id: 'ab-5', category: 'Retirement', description: 'Employer 401(k) Plan through Fidelity', value: 38400, exemptAmount: 38400, law: '11 U.S.C. § 522(b)(3)(C) (100% Exempt)' }
    ],
    scheduleD: [
      { id: 'd-1', creditor: 'Mountain America Credit Union', address: 'PO Box 2331, Sandy, UT 84091', accountNum: '****-4901', collateral: '2019 Subaru Outback', claimAmount: 11200, securedPortion: 11200, unsecuredPortion: 0 },
      { id: 'd-2', creditor: 'Select Portfolio Servicing', address: 'PO Box 65250, Salt Lake City, UT 84165', accountNum: '****-8812', collateral: 'Primary Residence West Jordan', claimAmount: 345000, securedPortion: 345000, unsecuredPortion: 0 }
    ],
    scheduleEF: [
      { id: 'ef-1', priority: 'Non-Priority General Unsecured', creditor: 'University of Utah Health Care', address: '50 North Medical Drive, Salt Lake City, UT 84132', accountNum: 'MED-89102', natureOfDebt: 'Hospital Surgery Inpatient Care', claimAmount: 34800, disputed: false },
      { id: 'ef-2', priority: 'Non-Priority General Unsecured', creditor: 'Intermountain Health Care', address: 'PO Box 410291, Salt Lake City, UT 84141', accountNum: 'IHC-44910', natureOfDebt: 'Emergency Physician Services', claimAmount: 14200, disputed: false },
      { id: 'ef-3', priority: 'Non-Priority General Unsecured', creditor: 'Chase Card Services', address: 'PO Box 15298, Wilmington, DE 19850', accountNum: '****-3109', natureOfDebt: 'Consumer Credit Card Purchases', claimAmount: 8950, disputed: false },
      { id: 'ef-4', priority: 'Non-Priority General Unsecured', creditor: 'Capital One Bank USA', address: 'PO Box 30285, Salt Lake City, UT 84130', accountNum: '****-6412', natureOfDebt: 'Revolving Credit Card Balance', claimAmount: 4500, disputed: false }
    ],
    scheduleI: {
      monthlyGrossWages: 5350,
      monthlyOvertime: 0,
      payrollDeductionTax: 920,
      payrollDeductionInsurance: 340,
      payrollDeduction401k: 250,
      totalMonthlyDeductions: 1510,
      netMonthlyTakeHomePay: 3840
    },
    scheduleJ: {
      rentOrMortgage: 2150,
      utilitiesElectricGas: 240,
      cellPhoneInternet: 160,
      foodAndGroceries: 580,
      clothingAndLaundry: 100,
      medicalAndPrescriptionOutPocket: 150,
      transportationGasMaintenance: 320,
      autoInsurance: 140,
      totalMonthlyLivingExpenses: 3840,
      netMonthlyDisposableIncome: 0
    }
  },
  'BNK-2026-002': {
    caseId: 'BNK-2026-002',
    caseNumber: '26-21045-KRA',
    debtorName: 'Brett Aaron Caldwell & Melissa Ann Caldwell',
    scheduleAB: [
      { id: 'ab-1', category: 'Real Property', description: 'Single Family Residence: South Jordan, UT 84095', value: 480000, exemptAmount: 86600, law: 'Utah Code § 78B-5-501 (Joint Homestead)' },
      { id: 'ab-2', category: 'Vehicles', description: '2021 Ford F-150 SuperCrew', value: 31000, exemptAmount: 3000, law: 'Utah Code § 78B-5-505(1)(b)' },
      { id: 'ab-3', category: 'Vehicles', description: '2018 Honda Odyssey EX-L', value: 16500, exemptAmount: 3000, law: 'Utah Code § 78B-5-505(1)(b)' },
      { id: 'ab-4', category: 'Financial Accounts', description: 'Zions Bank Joint Checking', value: 2400, exemptAmount: 1000, law: 'Utah Code § 78B-5-505' },
      { id: 'ab-5', category: 'Retirement', description: 'Utah Retirement Systems (URS) Pension', value: 84000, exemptAmount: 84000, law: 'Utah Code § 49-11-612 (Exempt)' }
    ],
    scheduleD: [
      { id: 'd-1', creditor: 'Pennymac Loan Services', address: 'PO Box 514387, Los Angeles, CA 90051', accountNum: '****-7718', collateral: 'South Jordan Residence', claimAmount: 358000, securedPortion: 358000, unsecuredPortion: 0 },
      { id: 'd-2', creditor: 'Ford Motor Credit Company', address: 'PO Box 6508, Carol Stream, IL 60197', accountNum: '****-4991', collateral: '2021 Ford F-150', claimAmount: 22000, securedPortion: 22000, unsecuredPortion: 0 },
      { id: 'd-3', creditor: 'Ally Financial', address: 'PO Box 9001951, Louisville, KY 40290', accountNum: '****-8102', collateral: '2018 Honda Odyssey', claimAmount: 8000, securedPortion: 8000, unsecuredPortion: 0 }
    ],
    scheduleEF: [
      { id: 'ef-1', priority: 'Priority Unsecured Claims (100% Repaid in Plan)', creditor: 'Internal Revenue Service (IRS)', address: 'Centralized Insolvency Operations, PO Box 7346, Philadelphia, PA 19101', accountNum: 'IRS-1040-2024', natureOfDebt: '2024 Form 1040 Federal Income Tax Deficiency', claimAmount: 6400, disputed: false },
      { id: 'ef-2', priority: 'Priority Unsecured Claims (100% Repaid in Plan)', creditor: 'Utah State Tax Commission', address: '210 North 1950 West, Salt Lake City, UT 84134', accountNum: 'TC-540-2024', natureOfDebt: 'State Income Tax Balance', claimAmount: 2000, disputed: false },
      { id: 'ef-3', priority: 'Non-Priority General Unsecured', creditor: 'Discover Financial Services', address: 'PO Box 30943, Salt Lake City, UT 84130', accountNum: '****-2910', natureOfDebt: 'Credit Card Purchases', claimAmount: 28400, disputed: false },
      { id: 'ef-4', priority: 'Non-Priority General Unsecured', creditor: 'American Express National Bank', address: 'PO Box 981540, El Paso, TX 79998', accountNum: '****-5501', natureOfDebt: 'Revolving Line of Credit', claimAmount: 32500, disputed: false },
      { id: 'ef-5', priority: 'Non-Priority General Unsecured', creditor: 'Synchrony Bank / Home Depot', address: 'PO Box 960061, Orlando, FL 32896', accountNum: '****-7719', natureOfDebt: 'Home Improvement Store Credit', claimAmount: 18900, disputed: false },
      { id: 'ef-6', priority: 'Non-Priority General Unsecured', creditor: 'Granite Credit Union Personal Loan', address: '3675 South 900 East, Salt Lake City, UT 84106', accountNum: 'LN-88910', natureOfDebt: 'Unsecured Consolidation Loan', claimAmount: 14400, disputed: false }
    ],
    scheduleI: {
      monthlyGrossWages: 10375,
      monthlyOvertime: 0,
      payrollDeductionTax: 2180,
      payrollDeductionInsurance: 720,
      payrollDeduction401k: 450,
      totalMonthlyDeductions: 3350,
      netMonthlyTakeHomePay: 7025
    },
    scheduleJ: {
      rentOrMortgage: 2480,
      utilitiesElectricGas: 320,
      cellPhoneInternet: 210,
      foodAndGroceries: 1150,
      clothingAndLaundry: 200,
      medicalAndPrescriptionOutPocket: 240,
      transportationGasMaintenance: 540,
      autoInsurance: 260,
      homeInsurancePropertyTaxEscrow: 480,
      totalMonthlyLivingExpenses: 6080,
      netMonthlyDisposableIncome: 945
    }
  }
};

export const getSchedulesByCaseId = (caseId) => MOCK_BANKRUPTCY_SCHEDULES[caseId] || null;

