import React, { useState, useEffect } from 'react';
import {
  X,
  Landmark,
  Users,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  Plus,
  Flame,
  Scale,
  Printer,
  Building2,
  ClipboardList
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { AddCreditorModal } from './AddCreditorModal';
import { ChapterSelectorModal } from './ChapterSelectorModal';
import { EmergencyFilingModal } from './EmergencyFilingModal';
import { PostFilingAdminTab } from './PostFilingAdminTab';
import { MOCK_BANKRUPTCY_SCHEDULES } from '../../../data/mockBankruptcySchedules';
import {
  getDefaultDistrictAndFormDetails,
  getDefaultPostFilingAdmin,
} from '../../../data/mockBankruptcyCases';
import { Link } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export function BankruptcyCaseDrawer({ isOpen, onClose, bankruptcyCase, onUpdateCase }) {
  const [activeTab, setActiveTab] = useState('debtor'); // 'debtor', 'schedules', 'means', 'sec521', 'plan', 'postFiling'
  const [currentCase, setCurrentCase] = useState(bankruptcyCase);

  useEffect(() => {
    setCurrentCase(bankruptcyCase);
    if (!isOpen) {
      setActiveTab('debtor');
    }
  }, [bankruptcyCase, isOpen]);
  const [isAddCreditorOpen, setIsAddCreditorOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSec521CertOpen, setIsSec521CertOpen] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !currentCase) return null;

  const districtAndFormDetails =
    currentCase.districtAndFormDetails || getDefaultDistrictAndFormDetails(currentCase.chapter);
  const postFilingAdmin =
    currentCase.postFilingAdmin || getDefaultPostFilingAdmin(currentCase);

  const handleUpdatePostFiling = (updatedPostFilingAdmin) => {
    const updated = {
      ...currentCase,
      postFilingAdmin: updatedPostFilingAdmin,
    };
    setCurrentCase(updated);
    if (onUpdateCase) onUpdateCase(updated);
  };

  const schedules = MOCK_BANKRUPTCY_SCHEDULES[currentCase.id] || MOCK_BANKRUPTCY_SCHEDULES['BNK-2026-001'];
  const debtorProfile = currentCase.debtorProfile || {
    ssnMasked: '***-**-4912',
    phone: '(801) 555-0819',
    email: 'debtor@slcmail.org',
    address: '6840 South 1300 West, West Jordan, UT 84084',
    county: 'Salt Lake County (Proper Venue)',
    taxFilingStatus: 'Single',
    employer: 'Commercial Freight Logistics',
    yearsEmployed: 4.0,
  };

  const prior = currentCase.priorFilings || {
    hasPriorFilings: false,
    isEightYearBarSatisfied: true,
    notes: 'No prior filings on record within the last 8 years.'
  };

  const docs = currentCase.statutoryDocs || [
    { id: 'doc-1', title: 'Pre-Filing Certificate of Credit Counseling', status: 'Verified & Filed', date: '2026-02-10', required: true },
    { id: 'doc-2', title: 'Payment Advices / Pay Stubs (Last 60 Days)', status: 'Verified & Admitted', date: '2026-02-12', required: true },
    { id: 'doc-3', title: 'Federal Tax Returns (2024 & 2025 Form 1040)', status: 'Verified & Admitted', date: '2026-02-14', required: true },
    { id: 'doc-4', title: 'Bank Account Statements (Past 60 Days)', status: 'Verified & Admitted', date: '2026-02-14', required: true },
    { id: 'doc-5', title: 'Financial Management Course Certificate', status: 'Completed & Filed', date: '2026-03-10', required: true }
  ];

  const handleToggleDocStatus = (docId) => {
    setCurrentCase(prev => ({
      ...prev,
      statutoryDocs: (prev.statutoryDocs || docs).map(d =>
        d.id === docId ? { ...d, status: d.status === 'Verified & Filed' ? 'Pending Review' : 'Verified & Filed' } : d
      )
    }));
    addToast('Section 521 document verification status updated.', 'info');
  };

  const handleAddCreditor = (newCreditor) => {
    schedules.scheduleEF.unshift(newCreditor);
    addToast(`Creditor ${newCreditor.creditor} added to Schedule E/F!`, 'success');
  };

  const handleSelectChapter = (newChapter) => {
    const updated = {
      ...currentCase,
      chapter: newChapter,
      filingType: newChapter === 'Chapter 13' ? 'Wage Earner Adjustment' : 'Liquidation'
    };
    setCurrentCase(updated);
    if (onUpdateCase) onUpdateCase(updated);
  };

  const handleConfirmEmergency = (caseId, deadline, reason) => {
    const updated = {
      ...currentCase,
      emergencyFiling: true,
      status: 'Emergency Filing (14-Day Deficiency Window)',
      deficiencyDeadline: deadline,
      notes: `Emergency petition executed: ${reason}. Full schedules due ${deadline}.`
    };
    setCurrentCase(updated);
    if (onUpdateCase) onUpdateCase(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#06244B] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded font-bold">
                {currentCase.caseNumber}
              </span>
              <span className="text-xs bg-[#A4432B] px-2 py-0.5 rounded font-semibold">
                {currentCase.chapter}
              </span>
              {currentCase.emergencyFiling && (
                <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold text-white flex items-center gap-1">
                  <Flame className="w-3 h-3" /> 14-Day Emergency Clock
                </span>
              )}
              <span className="text-xs text-amber-300 font-medium">
                [DEMO SIMULATION]
              </span>
            </div>
            <h2 className="text-base font-bold mt-1 text-white truncate max-w-2xl">
              {currentCase.debtorName} {currentCase.jointDebtorName !== 'None (Individual)' ? `& ${currentCase.jointDebtorName}` : ''}
            </h2>
            <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
              <span>Venue: <strong>{districtAndFormDetails.courtDistrict} ({districtAndFormDetails.courtDivision})</strong></span>
              <span>Judge: <strong>{currentCase.assignedJudge}</strong></span>
              <span>Trustee: <strong>{currentCase.trusteeName}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 bg-[#F5F0E5] border-b border-[#D9D6CF] overflow-x-auto text-xs">
          {[
            { id: 'debtor', label: '1. Debtor & Census', icon: Users },
            { id: 'schedules', label: '2. Schedules A-J & Creditors', icon: FileSpreadsheet },
            { id: 'means', label: '3. Means-Test & Exemptions', icon: Calculator },
            { id: 'sec521', label: '4. Sec 521 Docs & Emergency Clock', icon: ShieldCheck },
            { id: 'plan', label: '5. Chapter Plan & 341 Milestones', icon: Landmark },
            { id: 'postFiling', label: '6. Post-Filing Administration', icon: ClipboardList },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#A4432B] text-[#A4432B] bg-white'
                    : 'border-transparent text-[#667085] hover:text-[#06244B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#202A35]">
          {/* District & Form Edition Details Card */}
          <div className="bg-white border border-[#D9D6CF] rounded-lg p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#06244B]" />
                <span className="font-bold text-xs uppercase tracking-wide text-[#06244B]">
                  District &amp; Form Edition Details
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Last Verified: {districtAndFormDetails.lastVerifiedDate}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Bankruptcy Court District</span>
                <span className="font-semibold text-[#06244B]">{districtAndFormDetails.courtDistrict}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Court Division</span>
                <span className="font-semibold text-[#202A35]">{districtAndFormDetails.courtDivision}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Applicable Form Number</span>
                <span className="font-mono font-semibold text-[#06244B]">{districtAndFormDetails.applicableFormNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Form Edition</span>
                <span className="font-semibold text-[#202A35]">{districtAndFormDetails.formEdition}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Form Edition Date</span>
                <span className="font-mono font-semibold text-[#202A35]">{districtAndFormDetails.formEditionDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Last Verified Date</span>
                <span className="font-mono font-semibold text-emerald-800">{districtAndFormDetails.lastVerifiedDate}</span>
              </div>
            </div>
          </div>

          {/* Tab 1: Debtor Profile & Census */}
          {activeTab === 'debtor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase text-[#06244B]">Primary Debtor Profile</span>
                    <span className="bg-[#06244B] text-white px-1.5 py-0.5 rounded text-[10px]">Petitioner</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Legal Name:</strong> {currentCase.debtorName}</div>
                    <div><strong>SSN (Masked):</strong> {debtorProfile.ssnMasked}</div>
                    <div><strong>Address:</strong> {debtorProfile.address}</div>
                    <div><strong>County Venue:</strong> {debtorProfile.county}</div>
                    <div><strong>Filing Status:</strong> {debtorProfile.taxFilingStatus}</div>
                    <div><strong>Employer:</strong> {debtorProfile.employer}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase text-[#06244B]">Joint Debtor / Spouse</span>
                    <span className="bg-[#A4432B] text-white px-1.5 py-0.5 rounded text-[10px]">
                      {currentCase.jointDebtorName !== 'None (Individual)' ? 'Co-Debtor' : 'Single Debtor'}
                    </span>
                  </div>
                  {currentCase.jointDebtorProfile ? (
                    <div className="space-y-1 text-xs">
                      <div><strong>Joint Debtor:</strong> {currentCase.jointDebtorProfile.name}</div>
                      <div><strong>SSN:</strong> {currentCase.jointDebtorProfile.ssnMasked}</div>
                      <div><strong>Employer:</strong> {currentCase.jointDebtorProfile.employer}</div>
                      <div><strong>Years Employed:</strong> {currentCase.jointDebtorProfile.yearsEmployed} yrs</div>
                    </div>
                  ) : (
                    <div className="p-3 text-[#667085] italic text-center">
                      Individual filing. No joint debtor spouse participating in petition.
                    </div>
                  )}
                </div>
              </div>

              {/* Household Census & 8-Year Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] space-y-2">
                  <span className="font-bold text-xs uppercase text-[#06244B] block">Household Census Roster</span>
                  <div className="flex justify-between items-center p-2 bg-[#F5F0E5] rounded">
                    <span>Total Household Size:</span>
                    <span className="font-bold text-sm text-[#06244B]">{currentCase.householdSize} Persons</span>
                  </div>
                  <p className="text-[11px] text-[#667085]">
                    Used to index against Utah Census Bureau Median Family Income tables under Form 122.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2">
                  <span className="font-bold text-xs uppercase text-emerald-950 block flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    8-Year Prior Discharge Bar Check (11 U.S.C. § 727)
                  </span>
                  <div className="text-xs text-emerald-950">
                    <div><strong>Prior Filings:</strong> {prior.hasPriorFilings ? `${prior.priorChapter} (${prior.priorFilingDate})` : 'None'}</div>
                    <div><strong>Statutory Bar Status:</strong> <span className="font-bold text-emerald-700">Satisfied (Eligible for Discharge) ✓</span></div>
                    <div className="text-[11px] text-emerald-800 mt-1 italic">{prior.notes}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Schedules A-J & Creditors */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-2">
                <div>
                  <h4 className="font-bold text-sm text-[#06244B]">
                    Bankruptcy Schedules Ledger (A/B, D, E/F, I, J)
                  </h4>
                  <span className="text-xs text-[#667085]">
                    Verified real property, secured claims, general unsecured debt, and monthly budget.
                  </span>
                </div>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsAddCreditorOpen(true)}>
                  Add Creditor
                </Button>
              </div>

              {/* Financial Meters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Schedule A/B Assets:</span>
                  <span className="text-base font-bold text-[#06244B] mt-1 block">
                    ${schedules.scheduleAB.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Schedule D Secured:</span>
                  <span className="text-base font-bold text-red-700 mt-1 block">
                    ${schedules.scheduleD.reduce((sum, item) => sum + item.claimAmount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Schedule E/F Unsecured:</span>
                  <span className="text-base font-bold text-amber-700 mt-1 block">
                    ${schedules.scheduleEF.reduce((sum, item) => sum + item.claimAmount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Net Cash Flow (I - J):</span>
                  <span className="text-base font-bold text-emerald-700 mt-1 block">
                    ${schedules.scheduleJ.netMonthlyDisposableIncome?.toLocaleString() || 0}/mo
                  </span>
                </div>
              </div>

              {/* Creditors List */}
              <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                    <tr>
                      <th className="p-2.5">Creditor Name &amp; Notice Address</th>
                      <th className="p-2.5">Schedule</th>
                      <th className="p-2.5">Account #</th>
                      <th className="p-2.5">Nature of Debt</th>
                      <th className="p-2.5 text-right">Claim Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9D6CF]">
                    {schedules.scheduleD.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-[#06244B]">
                          {item.creditor}
                          <span className="block text-[10px] text-[#667085] font-normal">{item.address}</span>
                        </td>
                        <td className="p-2.5 text-red-700 font-bold">Schedule D (Secured)</td>
                        <td className="p-2.5 font-mono">{item.accountNum}</td>
                        <td className="p-2.5">{item.collateral}</td>
                        <td className="p-2.5 text-right font-bold text-red-700">${item.claimAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {schedules.scheduleEF.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-[#06244B]">
                          {item.creditor}
                          <span className="block text-[10px] text-[#667085] font-normal">{item.address}</span>
                        </td>
                        <td className="p-2.5 text-amber-700 font-bold">Schedule E/F</td>
                        <td className="p-2.5 font-mono">{item.accountNum}</td>
                        <td className="p-2.5">{item.natureOfDebt}</td>
                        <td className="p-2.5 text-right font-bold text-[#06244B]">${item.claimAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Means-Test & Exemptions */}
          {activeTab === 'means' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-2">
                  <h4 className="font-bold text-sm text-[#06244B]">
                    Form 122 Means-Test &amp; Presumption of Abuse Determination
                  </h4>
                  <Link to="/bankruptcy/means-test">
                    <Button size="sm" variant="outline" icon={Calculator}>
                      Open Full Means-Test Tool
                    </Button>
                  </Link>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold block">Status: {currentCase.meansTestStatus}</span>
                    <span>Annual Income: ${currentCase.annualGrossIncome.toLocaleString()} | Utah Family of {currentCase.householdSize} Median: $91,220</span>
                  </div>
                  <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    PASSED TEST ✓
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-2">
                  <h4 className="font-bold text-sm text-[#06244B]">
                    Utah Statutory Property Exemptions (Utah Code § 78B-5-501)
                  </h4>
                  <Link to="/bankruptcy/exemptions">
                    <Button size="sm" variant="outline" icon={Landmark}>
                      Open Exemptions Tool
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] text-[#667085] uppercase font-bold block">Primary Homestead:</span>
                    <span className="font-bold text-emerald-700 text-sm mt-1 block">
                      {currentCase.jointDebtorName !== 'None (Individual)' ? '$86,600 (Joint Spouses)' : '$43,300 (Single)'}
                    </span>
                    <span className="text-[10px] text-[#667085]">Utah Code § 78B-5-501</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] text-[#667085] uppercase font-bold block">Motor Vehicle:</span>
                    <span className="font-bold text-emerald-700 text-sm mt-1 block">
                      {currentCase.jointDebtorName !== 'None (Individual)' ? '$6,000 (Two Vehicles)' : '$3,000 (One Vehicle)'}
                    </span>
                    <span className="text-[10px] text-[#667085]">Utah Code § 78B-5-505(1)(b)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] text-[#667085] uppercase font-bold block">401(k) / ERISA:</span>
                    <span className="font-bold text-emerald-700 text-sm mt-1 block">100% Exempt</span>
                    <span className="text-[10px] text-[#667085]">11 U.S.C. § 522(b)(3)(C)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Sec 521 Docs & Emergency Clock */}
          {activeTab === 'sec521' && (
            <div className="space-y-4">
              {/* Emergency Filing Status Banner */}
              {currentCase.emergencyFiling ? (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg space-y-2 text-xs text-red-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Flame className="w-5 h-5 text-red-600" />
                      <span>EMERGENCY PETITION: 14-DAY DEFICIENCY WINDOW ACTIVE</span>
                    </div>
                    <span className="bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded text-[10px]">
                      DEFICIENCY DEADLINE: {currentCase.deficiencyDeadline}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    Automatic stay is actively halting garnishments. Full Schedules A-J and Form 122 must be uploaded to the court docket before the 14-day statutory clock expires.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#06244B] block">Emergency 'Bare-Bones' Fast-Track:</span>
                    <span className="text-[11px] text-[#667085]">Trigger immediate automatic stay (§ 362) against sheriff auctions.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Flame}
                    className="text-red-700 hover:bg-red-50"
                    onClick={() => setIsEmergencyModalOpen(true)}
                  >
                    File Emergency Petition
                  </Button>
                </div>
              )}

              {/* Section 521 Checklist */}
              <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-[#F5F0E5] border-b border-[#D9D6CF] font-bold text-[#06244B] flex items-center justify-between">
                  <span>11 U.S.C. § 521 Statutory Document Compliance Checklist</span>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Printer}
                    onClick={() => setIsSec521CertOpen(true)}
                    className="text-xs bg-white text-[#06244B]"
                  >
                    Trustee Compliance Certificate
                  </Button>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-[#D9D6CF]">
                    {docs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-[#06244B]">{doc.title}</td>
                        <td className="p-3 font-mono text-[11px] text-[#667085]">{doc.certNumber || 'Attached'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              doc.status.includes('Verified') || doc.status.includes('Completed')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleDocStatus(doc.id)}
                            className="text-xs font-semibold text-[#A4432B] hover:underline"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Plan & 341 Milestones */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-2">
                <div>
                  <h4 className="font-bold text-sm text-[#06244B]">
                    Chapter Formulation &amp; Statutory Court Calendar
                  </h4>
                  <span className="text-xs text-[#667085]">
                    Current Relief: <strong>{currentCase.chapter}</strong> ({currentCase.filingType})
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" icon={Scale} onClick={() => setIsChapterModalOpen(true)}>
                    Change Chapter
                  </Button>
                  <Link to="/bankruptcy/creditor-matrix">
                    <Button size="sm" variant="primary" icon={FileText}>
                      Generate Creditor Matrix
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Chapter 13 Plan Breakdown (if Ch 13) */}
              {currentCase.chapter === 'Chapter 13' && (
                <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-3">
                  <span className="font-bold text-xs uppercase text-[#06244B] block">Chapter 13 Repayment Plan Modeling</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
                      <span className="text-[10px] text-[#667085] uppercase font-bold block">Monthly Trustee Payment:</span>
                      <span className="text-xl font-bold text-[#06244B] mt-1 block">${currentCase.monthlyPlanPayment?.toLocaleString()}/mo</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                      <span className="text-[10px] text-[#667085] uppercase font-bold block">Plan Commitment Period:</span>
                      <span className="text-xl font-bold text-[#A4432B] mt-1 block">{currentCase.planTermMonths} Months</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-300">
                      <span className="text-[10px] text-emerald-900 uppercase font-bold block">Unsecured Dividend %:</span>
                      <span className="text-xl font-bold text-emerald-700 mt-1 block">{currentCase.projectedDividendPercent}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Statutory Milestones Grid */}
              <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-3">
                <span className="font-bold text-xs uppercase text-[#06244B] block">Court Docket Milestones</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Section 341 Meeting of Creditors:</span>
                    <div className="font-bold text-sm text-[#06244B]">{currentCase.meeting341Date}</div>
                    <div className="text-[11px] text-[#667085]">{currentCase.meeting341Status}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Discharge / Confirmation Date:</span>
                    <div className="font-bold text-sm text-[#06244B]">{currentCase.dischargeDate || currentCase.confirmationHearingDate || 'Pending'}</div>
                    <div className="text-[11px] text-[#667085]">District of Utah Clerk of Court</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Post-Filing Administration */}
          {activeTab === 'postFiling' && (
            <PostFilingAdminTab
              currentCase={currentCase}
              postFilingAdmin={postFilingAdmin}
              onUpdatePostFiling={handleUpdatePostFiling}
              addToast={addToast}
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#D9D6CF] flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Case File
          </Button>
          <div className="text-[11px] text-[#667085]">
            Lead Counsel: <strong>{currentCase.assignedAttorneyName}</strong> | Paralegal: <strong>{currentCase.assignedParalegalName}</strong>
          </div>
        </div>
      </div>

      {/* Auxiliary Modals */}
      <AddCreditorModal
        isOpen={isAddCreditorOpen}
        onClose={() => setIsAddCreditorOpen(false)}
        onAddCreditor={handleAddCreditor}
      />

      <ChapterSelectorModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        currentChapter={currentCase.chapter}
        onSelectChapter={handleSelectChapter}
      />

      <EmergencyFilingModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        bankruptcyCase={currentCase}
        onConfirmEmergencyFiling={handleConfirmEmergency}
      />

      {/* Section 521 Compliance Certificate Modal */}
      {isSec521CertOpen && (
        <Modal
          isOpen={isSec521CertOpen}
          onClose={() => setIsSec521CertOpen(false)}
          title="Attorney Certificate of 11 U.S.C. § 521 Compliance"
          subtitle={`Case No: ${currentCase.caseNumber} • In re: ${currentCase.debtorName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg font-serif space-y-3">
              <div className="text-center border-b border-slate-300 pb-2">
                <div className="font-bold text-xs uppercase tracking-wider text-[#06244B]">
                  United States Bankruptcy Court
                </div>
                <div className="text-xs text-slate-700">District of Utah — Salt Lake City Division</div>
              </div>

              <div className="flex justify-between text-xs py-1">
                <div>
                  <strong>In re:</strong> {currentCase.debtorName}
                  {currentCase.jointDebtorName !== 'None (Individual)' ? ` & ${currentCase.jointDebtorName}` : ''}
                  <div className="text-[11px] text-slate-600">Debtor(s)</div>
                </div>
                <div className="text-right">
                  <div><strong>Case No:</strong> {currentCase.caseNumber}</div>
                  <div><strong>Chapter:</strong> {currentCase.chapter}</div>
                  <div><strong>Trustee:</strong> {currentCase.trusteeName}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>CERTIFICATION OF COUNSEL PURSUANT TO 11 U.S.C. § 521(a)(1)(B)(iv) &amp; LOCAL RULE 1007-1:</strong>
                </p>
                <p>
                  The undersigned attorney of record hereby certifies that:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>
                    Copies of all payment advices, pay stubs, and other evidence of payment received by the Debtor from all employers within 60 days before the petition date have been collected, verified, and transmitted to the Standing Trustee.
                  </li>
                  <li>
                    A true and correct copy of the Debtor's federal income tax return for the most recent pre-petition tax year was provided to the Trustee at least 7 days prior to the Section 341 Meeting of Creditors in accordance with § 521(e)(2)(A)(i).
                  </li>
                  <li>
                    The Debtor completed pre-petition credit counseling from an approved United States Trustee provider within 180 days prior to filing under 11 U.S.C. § 109(h).
                  </li>
                </ol>
                <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
                  <div>
                    <div><strong>Attorney:</strong> {currentCase.assignedAttorneyName}</div>
                    <div className="text-[11px] text-slate-500">Utah State Bar ID #14902</div>
                    <div className="text-[11px] text-slate-500">Heugly &amp; Bludworth Attorneys at Law</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-800 font-bold">/s/ {currentCase.assignedAttorneyName}</div>
                    <div className="text-[10px] text-slate-500">Electronically Verified • {new Date().toISOString().split('T')[0]}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSec521CertOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  window.print();
                  addToast('Certificate sent to system print dialog.', 'info');
                }}
              >
                Print Official Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

