import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  DollarSign,
  FileText,
  User,
  Users,
  Building,
  Car,
  Home,
  FileCheck,
  Flame,
  Info
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

// Utah Median Income By Household Size (Form 122 Census Data 2026)
const UTAH_MEDIAN_INCOME = {
  1: 72400,
  2: 91220,
  3: 104800,
  4: 118600,
  5: 128500,
  6: 138400,
  7: 148300,
  8: 158200
};

export function DebtorIntakeWizardModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Debtor & Joint Debtor Demographics
  const [debtorName, setDebtorName] = useState('');
  const [ssnLast4, setSsnLast4] = useState('');
  const [phone, setPhone] = useState('(801) 555-');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Salt Lake City');
  const [state, setState] = useState('UT');
  const [zipCode, setZipCode] = useState('84101');
  const [county, setCounty] = useState('Salt Lake County');
  const [isJointFiling, setIsJointFiling] = useState(false);
  const [jointDebtorName, setJointDebtorName] = useState('');
  const [jointSsnLast4, setJointSsnLast4] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [employer, setEmployer] = useState('');
  const [yearsEmployed, setYearsEmployed] = useState(3.0);

  // Step 2: Income, Census & Means-Test
  const [householdSize, setHouseholdSize] = useState(2);
  const [debtorMonthlyGross, setDebtorMonthlyGross] = useState(4500);
  const [spouseMonthlyGross, setSpouseMonthlyGross] = useState(1200);
  const [targetChapter, setTargetChapter] = useState('Chapter 7');

  // Step 3: Real & Personal Property Assets
  const [homesteadValue, setHomesteadValue] = useState(380000);
  const [mortgageBalance, setMortgageBalance] = useState(340000);
  const [vehicleValue, setVehicleValue] = useState(14000);
  const [vehicleLien, setVehicleLien] = useState(9000);
  const [bankCash, setBankCash] = useState(3200);
  const [retirementValue, setRetirementValue] = useState(45000);
  const [personalProperty, setPersonalProperty] = useState(5500);

  // Step 4: Creditor Schedules
  const [priorityDebt, setPriorityDebt] = useState(0);
  const [unsecuredDebt, setUnsecuredDebt] = useState(42000);
  const [isEmergencyFiling, setIsEmergencyFiling] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('Imminent Bank Account Garnishment / Sheriff Sale');

  // Step 5: Section 521 Statutory Checklist
  const [hasCreditCounseling, setHasCreditCounseling] = useState(true);
  const [ccCertNumber, setCcCertNumber] = useState('CC-UT-2026-98124');
  const [hasPayStubs60Days, setHasPayStubs60Days] = useState(true);
  const [hasTaxReturns2Years, setHasTaxReturns2Years] = useState(true);
  const [hasBankStatements60Days, setHasBankStatements60Days] = useState(true);
  const [hasAffidavitSigned, setHasAffidavitSigned] = useState(true);

  // Computed Values
  const totalMonthlyGross = Number(debtorMonthlyGross) + (isJointFiling ? Number(spouseMonthlyGross) : 0);
  const annualizedIncome = totalMonthlyGross * 12;
  const utahMedian = UTAH_MEDIAN_INCOME[Math.min(householdSize, 8)] || 118600;
  const isBelowMedian = annualizedIncome <= utahMedian;

  // Real estate equity & exemptions
  const realEstateEquity = Math.max(0, Number(homesteadValue) - Number(mortgageBalance));
  const utahHomesteadCap = isJointFiling ? 86600 : 43300; // Utah Code § 78B-5-501
  const exemptRealEstate = Math.min(realEstateEquity, utahHomesteadCap);
  const nonExemptRealEstate = Math.max(0, realEstateEquity - exemptRealEstate);

  // Vehicle equity & exemptions
  const vehicleEquity = Math.max(0, Number(vehicleValue) - Number(vehicleLien));
  const utahVehicleCap = isJointFiling ? 6000 : 3000; // Utah Code § 78B-5-505
  const exemptVehicle = Math.min(vehicleEquity, utahVehicleCap);
  const nonExemptVehicle = Math.max(0, vehicleEquity - exemptVehicle);

  // Total secured debt
  const totalSecuredDebt = Number(mortgageBalance) + Number(vehicleLien);
  const totalAssets = Number(homesteadValue) + Number(vehicleValue) + Number(bankCash) + Number(retirementValue) + Number(personalProperty);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1 && !debtorName.trim()) {
      alert('Please enter primary debtor full legal name.');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!debtorName.trim()) {
      alert('Please enter primary debtor name.');
      return;
    }

    const newCase = {
      id: `BNK-2026-${Date.now().toString().slice(-4)}`,
      caseNumber: `26-2${Math.floor(1000 + Math.random() * 9000)}-${targetChapter === 'Chapter 13' ? 'KRA' : 'JTM'}`,
      debtorName,
      jointDebtorName: isJointFiling && jointDebtorName ? jointDebtorName : 'None (Individual)',
      chapter: targetChapter,
      filingType: targetChapter === 'Chapter 13' ? (isJointFiling ? 'Joint Wage Earner Adjustment' : 'Wage Earner Adjustment') : 'Individual Liquidation',
      filingDate: new Date().toISOString().split('T')[0],
      courtVenue: `United States Bankruptcy Court, District of Utah (${county})`,
      assignedJudge: targetChapter === 'Chapter 13' ? 'Hon. Kevin R. Anderson' : 'Hon. Joel T. Marker',
      trusteeName: targetChapter === 'Chapter 13' ? 'Lon A. Jenkins, Standing Chapter 13 Trustee' : 'D. Ray Strong, Standing Ch. 7 Trustee',
      meeting341Date: new Date(Date.now() + 32 * 86400000).toISOString().split('T')[0],
      meeting341Status: 'Scheduled (Via Zoom Video Conference)',
      claimsBarDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      dischargeDate: targetChapter === 'Chapter 7' ? new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0] : null,
      householdSize: Number(householdSize),
      annualGrossIncome: annualizedIncome,
      meansTestStatus: isBelowMedian ? 'Below Utah Median (Passed Form 122A-1)' : 'Above Median (Form 122A-2 Rebuttal)',
      totalAssets,
      totalSecuredDebt,
      totalPriorityDebt: Number(priorityDebt),
      totalUnsecuredDebt: Number(unsecuredDebt),
      status: isEmergencyFiling ? 'Emergency Filing (14-Day Deficiency)' : 'In Progress',
      emergencyFiling: isEmergencyFiling,
      deficiencyDeadline: isEmergencyFiling ? new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] : null,
      creditCounselingFiled: hasCreditCounseling,
      financialManagementFiled: false,
      assignedAttorneyId: 'usr-2',
      assignedAttorneyName: 'Thomas Bludworth, Esq.',
      assignedParalegalId: 'usr-4',
      assignedParalegalName: 'Marcus Vance',
      notes: isEmergencyFiling ? `Emergency petition filed: ${emergencyReason}` : 'Comprehensive Chapter petition intake completed.',
      debtorProfile: {
        ssnMasked: `***-**-${ssnLast4 || '4410'}`,
        phone,
        email: email || 'debtor@clientportal.legal',
        address: `${streetAddress || '100 South State St'}, ${city}, ${state} ${zipCode}`,
        county: `${county} (Proper Venue Under 28 U.S.C. § 1408)`,
        taxFilingStatus: maritalStatus,
        employer: employer || 'Private Sector Professional',
        yearsEmployed: Number(yearsEmployed)
      },
      jointDebtorProfile: isJointFiling && jointDebtorName ? {
        name: jointDebtorName,
        ssnMasked: `***-**-${jointSsnLast4 || '8831'}`,
        employer: 'Healthcare Services',
        yearsEmployed: 2.5
      } : null,
      statutoryDocs: [
        { id: 'doc-1', title: 'Pre-Filing Certificate of Credit Counseling (11 U.S.C. § 109(h))', status: hasCreditCounseling ? 'Verified & Filed' : 'Deficient / Pending', date: new Date().toISOString().split('T')[0], certNumber: ccCertNumber, required: true },
        { id: 'doc-2', title: 'Payment Advices / Pay Stubs (Last 60 Days)', status: hasPayStubs60Days ? 'Verified & Admitted' : 'Pending', date: new Date().toISOString().split('T')[0], required: true },
        { id: 'doc-3', title: 'Federal Tax Returns (Past 2 Years Form 1040)', status: hasTaxReturns2Years ? 'Verified & Admitted' : 'Pending', date: new Date().toISOString().split('T')[0], required: true },
        { id: 'doc-4', title: 'Bank Account Statements (Past 60 Days)', status: hasBankStatements60Days ? 'Verified & Admitted' : 'Pending', date: new Date().toISOString().split('T')[0], required: true },
        { id: 'doc-5', title: 'Debtor Verified Declaration of Schedules', status: hasAffidavitSigned ? 'Executed & Filed' : 'Unsigned', date: new Date().toISOString().split('T')[0], required: true }
      ]
    };

    onComplete(newCase);
    onClose();
  };

  const steps = [
    { num: 1, title: 'Demographics & Venue', icon: User },
    { num: 2, title: 'Income & Means-Test', icon: DollarSign },
    { num: 3, title: 'Assets & Exemptions', icon: Home },
    { num: 4, title: 'Creditors & Liabilities', icon: Landmark },
    { num: 5, title: 'Sec 521 & ECF Review', icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex items-center justify-center p-4 transition-opacity">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#06244B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#D9D6CF]">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Structured Debtor Intake &amp; Means-Test Wizard</h3>
                <span className="text-[10px] font-bold bg-[#A4432B] px-2 py-0.5 rounded text-white uppercase tracking-wider">
                  FRBP Form 101/122
                </span>
              </div>
              <p className="text-xs text-slate-300">
                U.S. Bankruptcy Court, District of Utah • Step-by-step statutory qualification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Navigation Indicator */}
        <div className="grid grid-cols-5 border-b border-[#D9D6CF] bg-[#F5F0E5] text-xs">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-3 flex items-center gap-2 text-left border-b-2 transition-all ${
                  isCurrent
                    ? 'border-[#A4432B] bg-white text-[#A4432B] font-bold shadow-sm'
                    : isCompleted
                    ? 'border-emerald-600 bg-white/60 text-emerald-800 font-semibold'
                    : 'border-transparent text-[#667085] hover:bg-white/40'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-[#A4432B] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </div>
                <div className="hidden sm:block truncate">
                  <div className="text-[10px] uppercase tracking-wider opacity-75">Step {s.num}</div>
                  <div className="truncate font-medium">{s.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Wizard Step Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-[#202A35]">
          {/* STEP 1: Debtor & Joint Debtor Demographics */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-blue-900">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Venue &amp; Jurisdiction (28 U.S.C. § 1408):</strong> Debtor must have resided, had principal place of business, or principal assets in the District of Utah for 180 days prior to filing.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#A4432B]" /> Primary Debtor Information
                  </h4>
                  <div>
                    <Input
                      label="Primary Debtor Full Legal Name *"
                      value={debtorName}
                      onChange={(e) => setDebtorName(e.target.value)}
                      placeholder="e.g. Rachel Lynn Walker"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="SSN (Last 4 Digits)"
                      value={ssnLast4}
                      onChange={(e) => setSsnLast4(e.target.value)}
                      placeholder="e.g. 4410"
                      maxLength={4}
                    />
                    <Input
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(801) 555-0100"
                    />
                  </div>
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rachel.walker@clientmail.org"
                    />
                  </div>
                  <div>
                    <Input
                      label="Street Address"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 1420 East 3900 South"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <Input
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled
                    />
                    <Input
                      label="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                        Utah County Venue
                      </label>
                      <select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                      >
                        <option value="Salt Lake County">Salt Lake County</option>
                        <option value="Utah County">Utah County (Provo/Orem)</option>
                        <option value="Davis County">Davis County</option>
                        <option value="Weber County">Weber County (Ogden)</option>
                        <option value="Washington County">Washington County (St. George)</option>
                        <option value="Cache County">Cache County (Logan)</option>
                        <option value="Summit County">Summit County</option>
                        <option value="Tooele County">Tooele County</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                        Marital Status
                      </label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                      >
                        <option value="Single">Single / Unmarried</option>
                        <option value="Married Filing Jointly">Married Filing Jointly</option>
                        <option value="Married Filing Separately">Married Filing Separately</option>
                        <option value="Divorced">Divorced / Legally Separated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h4 className="font-bold text-xs uppercase text-[#06244B] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#A4432B]" /> Joint Debtor / Spouse
                    </h4>
                    <label className="flex items-center gap-1 text-xs cursor-pointer font-semibold text-[#A4432B]">
                      <input
                        type="checkbox"
                        checked={isJointFiling}
                        onChange={(e) => setIsJointFiling(e.target.checked)}
                        className="rounded border-[#D9D6CF] text-[#A4432B] focus:ring-[#A4432B]"
                      />
                      <span>Joint Petition</span>
                    </label>
                  </div>

                  {isJointFiling ? (
                    <div className="space-y-3">
                      <div>
                        <Input
                          label="Joint Debtor Full Legal Name *"
                          value={jointDebtorName}
                          onChange={(e) => setJointDebtorName(e.target.value)}
                          placeholder="e.g. David Mark Walker"
                          required={isJointFiling}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Joint SSN (Last 4 Digits)"
                          value={jointSsnLast4}
                          onChange={(e) => setJointSsnLast4(e.target.value)}
                          placeholder="e.g. 8831"
                          maxLength={4}
                        />
                        <Input
                          label="Spouse Monthly Gross ($)"
                          type="number"
                          value={spouseMonthlyGross}
                          onChange={(e) => setSpouseMonthlyGross(Number(e.target.value))}
                        />
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px]">
                        <strong>Joint Spousal Filing Benefits:</strong> Doubles the Utah homestead exemption to <strong>$86,600</strong> and motor vehicle exemption to <strong>$6,000</strong> under Utah Code § 78B-5-501.
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-[#667085] space-y-2">
                      <Users className="w-8 h-8 mx-auto text-slate-300" />
                      <p>Single individual debtor petition selected.</p>
                      <p className="text-[11px] text-slate-400">
                        Check "Joint Petition" above if both spouses are co-petitioners filing under 11 U.S.C. § 302.
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <h5 className="font-bold text-[11px] uppercase text-[#06244B]">Primary Debtor Employment</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Employer Name"
                        value={employer}
                        onChange={(e) => setEmployer(e.target.value)}
                        placeholder="e.g. Intermountain Health"
                      />
                      <Input
                        label="Years at Employer"
                        type="number"
                        step="0.5"
                        value={yearsEmployed}
                        onChange={(e) => setYearsEmployed(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Income, Census & Means Test */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-950">
                <Landmark className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Form 122 Means-Test Screening (11 U.S.C. § 707(b)(7)):</strong> Compare debtor’s annualized Current Monthly Income (CMI) against Utah median family income based on household size.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5">
                    1. Household Census
                  </h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                      Household Family Size
                    </label>
                    <select
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-bold text-[#06244B]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                        <option key={size} value={size}>
                          {size} Person{size > 1 ? 's' : ''} (Utah Median: ${UTAH_MEDIAN_INCOME[size]?.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Primary Debtor Monthly Gross ($)"
                      type="number"
                      value={debtorMonthlyGross}
                      onChange={(e) => setDebtorMonthlyGross(Number(e.target.value))}
                      required
                    />
                  </div>
                  {isJointFiling && (
                    <div>
                      <Input
                        label="Joint Debtor / Spouse Monthly Gross ($)"
                        type="number"
                        value={spouseMonthlyGross}
                        onChange={(e) => setSpouseMonthlyGross(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <div className="p-2.5 bg-white rounded border border-[#D9D6CF] space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Total Monthly Gross:</span>
                      <strong>${totalMonthlyGross.toLocaleString()}/mo</strong>
                    </div>
                    <div className="flex justify-between text-xs text-[#06244B]">
                      <span>Annualized CMI:</span>
                      <strong className="text-sm font-bold">${annualizedIncome.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-4 shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-[#D9D6CF] pb-1.5 flex justify-between items-center">
                    <span>2. Utah Median Family Comparison (Form 122A-1)</span>
                    <span className="font-mono text-[11px] text-[#667085]">
                      Utah Threshold: ${utahMedian.toLocaleString()}
                    </span>
                  </h4>

                  <div className={`p-4 rounded-lg border ${
                    isBelowMedian
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {isBelowMedian ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>BELOW UTAH MEDIAN — CHAPTER 7 PRESUMPTION OF ABUSE DOES NOT ARISE</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <span>ABOVE UTAH MEDIAN — FORM 122A-2 MEANS-TEST OR CHAPTER 13 REQUIRED</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed">
                      {isBelowMedian
                        ? `Debtor annualized gross income ($${annualizedIncome.toLocaleString()}) is below the Utah median family income ($${utahMedian.toLocaleString()}) for a household of ${householdSize}. Debtor qualifies for expedited Chapter 7 liquidation without expense deductions.`
                        : `Debtor annualized gross income ($${annualizedIncome.toLocaleString()}) exceeds the Utah median ($${utahMedian.toLocaleString()}). Debtor must submit full IRS National and Local expense deductions or execute a 60-month Chapter 13 repayment plan.`
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                      Designate Target Bankruptcy Chapter
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { ch: 'Chapter 7', label: 'Chapter 7 (Liquidation)', sub: 'Fast 90-120 day debt elimination' },
                        { ch: 'Chapter 13', label: 'Chapter 13 (Wage Earner)', sub: '3-5 year cure plan for arrears' },
                        { ch: 'Chapter 11', label: 'Chapter 11 (Subchapter V)', sub: 'Small business reorganization' }
                      ].map(opt => (
                        <div
                          key={opt.ch}
                          onClick={() => setTargetChapter(opt.ch)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            targetChapter === opt.ch
                              ? 'border-[#A4432B] bg-[#F5F0E5]/60 text-[#06244B]'
                              : 'border-[#D9D6CF] bg-white hover:border-slate-400'
                          }`}
                        >
                          <div className="font-bold text-xs">{opt.label}</div>
                          <div className="text-[10px] text-[#667085] mt-0.5">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Assets, Property & Utah Exemptions */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg flex items-center justify-between text-xs">
                <div>
                  <strong className="text-[#06244B]">Utah Statutory Property Exemptions (Utah Code § 78B-5-501 &amp; § 505):</strong>
                  <span className="text-[#667085] block">Utah is an 'opt-out' state; debtors must claim state exemptions.</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#A4432B]">Homestead: ${utahHomesteadCap.toLocaleString()}</span>
                  <span className="text-[#667085] text-[10px] block">Motor Vehicle: ${utahVehicleCap.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real Property */}
                <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-3 shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-[#D9D6CF] pb-1.5 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-[#A4432B]" /> Real Property (Primary Residence)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Fair Market Value ($)"
                      type="number"
                      value={homesteadValue}
                      onChange={(e) => setHomesteadValue(Number(e.target.value))}
                    />
                    <Input
                      label="Mortgage Payoff ($)"
                      type="number"
                      value={mortgageBalance}
                      onChange={(e) => setMortgageBalance(Number(e.target.value))}
                    />
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-[#D9D6CF] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Net Real Estate Equity:</span>
                      <strong>${realEstateEquity.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Utah Homestead Exemption Applied:</span>
                      <strong>-${exemptRealEstate.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                      <span className={nonExemptRealEstate > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                        Non-Exempt Trustee Exposure:
                      </span>
                      <span>${nonExemptRealEstate.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Motor Vehicles & Cash */}
                <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-3 shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-[#D9D6CF] pb-1.5 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#A4432B]" /> Vehicles &amp; Liquid Funds
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Vehicle Fair Market Value ($)"
                      type="number"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(Number(e.target.value))}
                    />
                    <Input
                      label="Auto Loan Payoff ($)"
                      type="number"
                      value={vehicleLien}
                      onChange={(e) => setVehicleLien(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Cash &amp; Bank Checking/Savings ($)"
                      type="number"
                      value={bankCash}
                      onChange={(e) => setBankCash(Number(e.target.value))}
                    />
                    <Input
                      label="401(k) / IRA (100% Exempt) ($)"
                      type="number"
                      value={retirementValue}
                      onChange={(e) => setRetirementValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-[#D9D6CF] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Vehicle Net Equity:</span>
                      <strong>${vehicleEquity.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Utah Vehicle Exemption Applied:</span>
                      <strong>-${exemptVehicle.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                      <span className={nonExemptVehicle > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                        Non-Exempt Vehicle Exposure:
                      </span>
                      <span>${nonExemptVehicle.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Creditors & Liabilities */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5">
                    Schedule D - Secured
                  </h4>
                  <div className="text-xl font-bold text-[#06244B]">
                    ${totalSecuredDebt.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#667085]">
                    Compiled from Real Estate Mortgage ($ {mortgageBalance.toLocaleString()}) and Auto Liens ($ {vehicleLien.toLocaleString()}).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5">
                    Schedule E - Priority Unsecured
                  </h4>
                  <Input
                    label="Taxes &amp; Domestic Support ($)"
                    type="number"
                    value={priorityDebt}
                    onChange={(e) => setPriorityDebt(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-[#667085]">
                    Non-dischargeable tax claims to IRS/Utah State Tax Commission or DSO obligations.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5">
                    Schedule F - General Unsecured
                  </h4>
                  <Input
                    label="Credit Cards &amp; Medical Debt ($)"
                    type="number"
                    value={unsecuredDebt}
                    onChange={(e) => setUnsecuredDebt(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-[#667085]">
                    Dischargeable unsecured consumer credit, hospital bills, and promissory notes.
                  </p>
                </div>
              </div>

              {/* Emergency Fast-Track Section */}
              <div className={`p-4 rounded-lg border ${
                isEmergencyFiling
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-white border-[#D9D6CF]'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${isEmergencyFiling ? 'text-red-600' : 'text-[#667085]'}`} />
                    <div>
                      <span className="font-bold text-sm block">
                        Emergency 'Bare-Bones' Fast-Track Filing (14-Day Deficiency Window)
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        Files Voluntary Petition + Creditor Matrix to invoke immediate 11 U.S.C. § 362 Automatic Stay.
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-red-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergencyFiling}
                      onChange={(e) => setIsEmergencyFiling(e.target.checked)}
                      className="rounded border-[#D9D6CF] text-red-600 focus:ring-red-600 w-4 h-4"
                    />
                    <span>TRIGGER EMERGENCY STAY</span>
                  </label>
                </div>

                {isEmergencyFiling && (
                  <div className="space-y-2 pt-2 border-t border-red-200">
                    <label className="block text-[11px] font-semibold text-red-900 uppercase">
                      Exigent Emergency Circumstance
                    </label>
                    <select
                      value={emergencyReason}
                      onChange={(e) => setEmergencyReason(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-red-300 bg-white font-medium"
                    >
                      <option value="Imminent Bank Account Garnishment">Imminent Bank Account Garnishment</option>
                      <option value="Foreclosure Sale Scheduled in < 48 Hours">Foreclosure Sale Scheduled in &lt; 48 Hours</option>
                      <option value="Vehicle Repossession in Progress">Vehicle Repossession in Progress</option>
                      <option value="Eviction Lockout / Sheriff Writ of Restitution">Eviction Lockout / Sheriff Writ of Restitution</option>
                    </select>
                    <div className="text-[11px] text-red-800">
                      * Note: Counsel has <strong>14 calendar days</strong> from petition filing to upload full Schedules A-J, Form 122, and Statement of Financial Affairs to prevent automatic dismissal.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Section 521 Statutory Checklist & ECF Transmission */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-3 bg-[#06244B] text-white flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    11 U.S.C. § 521 Mandatory Filing Requirements Checklist
                  </div>
                  <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                    UTAH DISTRICT LOCAL RULE 1007
                  </span>
                </div>

                <div className="p-4 space-y-3 divide-y divide-[#D9D6CF]">
                  <label className="flex items-start gap-3 cursor-pointer pt-2 first:pt-0">
                    <input
                      type="checkbox"
                      checked={hasCreditCounseling}
                      onChange={(e) => setHasCreditCounseling(e.target.checked)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#06244B]">
                        1. Pre-Petition Credit Counseling Certificate (11 U.S.C. § 109(h))
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Debtor must complete counseling from an approved agency within 180 days prior to filing.
                      </div>
                      {hasCreditCounseling && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">Agency Cert #:</span>
                          <input
                            type="text"
                            value={ccCertNumber}
                            onChange={(e) => setCcCertNumber(e.target.value)}
                            className="text-[10px] p-1 font-mono border border-[#D9D6CF] rounded bg-white w-48"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={hasPayStubs60Days}
                      onChange={(e) => setHasPayStubs60Days(e.target.checked)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#06244B]">
                        2. Payment Advices / Pay Stubs for Last 60 Days (§ 521(a)(1)(B)(iv))
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Copies of all payment advices or other evidence of payment received within 60 days before petition date.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={hasTaxReturns2Years}
                      onChange={(e) => setHasTaxReturns2Years(e.target.checked)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#06244B]">
                        3. Federal Income Tax Returns (Past 2 Years) (§ 521(e)(2))
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Most recent tax year return must be transmitted to trustee at least 7 days before § 341 meeting.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={hasBankStatements60Days}
                      onChange={(e) => setHasBankStatements60Days(e.target.checked)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#06244B]">
                        4. Bank Account Statements (Past 60 Days Pre-Petition)
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Includes checking, savings, money market, and electronic payment processor accounts (Venmo/PayPal).
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={hasAffidavitSigned}
                      onChange={(e) => setHasAffidavitSigned(e.target.checked)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#06244B]">
                        5. Debtor Declaration &amp; Attorney Electronic Signature (FRBP 1008)
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Debtor verification under penalty of perjury for Voluntary Petition Form 101.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Official Court ECF Transmission Notice */}
              <div className="p-4 bg-[#F5F0E5] border border-[#D9D6CF] rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#06244B] font-bold">
                  <Landmark className="w-4 h-4 text-[#A4432B]" />
                  <span>OFFICIAL COURT CM/ECF TRANSMISSION NOTICE</span>
                </div>
                <p className="text-[#202A35] leading-relaxed">
                  This system compiles, validates, and packages debtor schedules and the creditor matrix in strict compliance with the Federal Rules of Bankruptcy Procedure (FRBP) and District of Utah Local Rules. The final electronic filing submission must be executed through the official CM/ECF court portal by counsel of record.
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#667085] pt-1">
                  <span>Venue: District of Utah (Salt Lake City)</span>
                  <span>Chapter: {targetChapter}</span>
                  <span>Total Liabilities: ${(totalSecuredDebt + priorityDebt + unsecuredDebt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="p-4 bg-slate-50 border-t border-[#D9D6CF] flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={currentStep === 1 ? onClose : handleBack}
            icon={currentStep > 1 ? ChevronLeft : undefined}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous Step'}
          </Button>

          <div className="text-xs text-[#667085]">
            Step <span className="font-bold text-[#06244B]">{currentStep}</span> of 5
          </div>

          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              Next Step &rarr;
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleSubmit}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              Complete Intake &amp; Open Docket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

