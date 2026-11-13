import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Lock,
  Download,
  DollarSign,
  Award,
  Layers,
  RefreshCw,
  Eye,
  Check,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function FilingPackageAssemblerModal({ isOpen, onClose, immigrationCase, onPackageCleared }) {
  const { addToast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [isAttorneyCleared, setIsAttorneyCleared] = useState(immigrationCase?.filingPackage?.clearedByAttorney || false);
  const [clearingAttorney, setClearingAttorney] = useState(immigrationCase?.assignedAttorneyName || 'Sarah Jenkins, Esq.');
  const [ethicsConfirmation, setEthicsConfirmation] = useState(false);
  const [showPrintCover, setShowPrintCover] = useState(false);

  // Multi-Form Auto-Fill Questionnaire State (Docketwise Single-Source-of-Truth)
  const [formData, setFormData] = useState({
    beneficiaryName: immigrationCase?.beneficiaryName || 'Maria Santos Gomez',
    maidenName: 'Maria Santos Rivera',
    dob: '1994-08-22',
    cob: 'Guadalajara, Jalisco, Mexico',
    countryOfCitizenship: 'Mexico',
    alienNumber: immigrationCase?.alienNumber || 'A-214-890-123',
    ssnMasked: '***-**-3829',
    classOfAdmission: 'B-2 Visitor for Pleasure',
    i94Number: '92837482910',
    lastEntryDate: '2025-06-15',
    portOfEntry: 'Salt Lake City International Airport (SLC)',
    petitionerName: immigrationCase?.petitionerName || 'David Aaron Santos',
    petitionerCitizenship: 'U.S. Citizen by Birth (Utah Birth Certificate #142-92-0081)',
    petitionerDob: '1992-04-10',
    petitionerSsn: '***-**-5910',
    marriageDate: '2024-11-18',
    marriagePlace: 'Salt Lake City, Utah',
    currentAddress: '742 South 1100 East, Salt Lake City, UT 84102',
    category: immigrationCase?.category || 'Immediate Relative (Spouse of USC)',
  });

  const [activeFormPreview, setActiveFormPreview] = useState('i130'); // 'g28', 'i130', 'i485', 'i765', 'i864'

  if (!immigrationCase) return null;

  const pkg = immigrationCase.filingPackage || {
    packageId: `PKG-IMM-2026-${immigrationCase.matterNumber?.replace(/\D/g, '') || '01'}`,
    status: 'Paralegal Assembled',
    g28Executed: true,
    checkVoucherAmount: 1975,
    exhibitTabs: [
      { tab: 'Tab A', title: 'Form G-28 Notice of Entry of Appearance as Attorney of Record', status: 'Verified' },
      { tab: 'Tab B', title: 'Primary Petitions: Form I-130, Form I-485, and Form I-765', status: 'Verified' },
      { tab: 'Tab C', title: "Petitioner's Proof of U.S. Citizenship (Certified Utah Birth Certificate)", status: 'Verified' },
      { tab: 'Tab D', title: "Beneficiary's Civil Records (Mexican Birth Certificate with Certified English Translation)", status: 'Verified' },
      { tab: 'Tab E', title: 'Evidence of Bona Fide Marriage (Certified Marriage Certificate, Joint Lease, Joint Bank Statements, Photos)', status: 'Verified' },
      { tab: 'Tab F', title: 'Form I-864 Affidavit of Support with Sponsor 2023-2025 IRS Tax Transcripts & W-2s', status: 'Verified' },
      { tab: 'Tab G', title: 'Form G-1145 E-Notification & Two (2) Passport-Style Photographs (DHS Specifications)', status: 'Verified' }
    ]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearPackage = () => {
    if (!ethicsConfirmation) {
      addToast('Please confirm attorney review of statutory eligibility and attachments.', 'error');
      return;
    }
    setIsAttorneyCleared(true);
    if (onPackageCleared) {
      onPackageCleared(immigrationCase.id, clearingAttorney);
    }
    addToast(
      `Package officially certified by ${clearingAttorney}! Locked for USCIS dispatch.`,
      'success'
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`USCIS Multi-Form Auto-Fill & Package Assembler: ${immigrationCase.matterNumber}`}
      subtitle={`Beneficiary: ${formData.beneficiaryName} • Category: ${formData.category}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 text-xs text-[#202A35]">
        {/* Simulation Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>[DEMO SIMULATION] Docketwise-Engineered Multi-Form Auto-Fill:</strong> Changes to questionnaire inputs map simultaneously across Forms G-28, I-130, I-485, I-765, and I-864 without duplicate data entry.
            </span>
          </div>
          <span className="font-bold bg-amber-200 px-2 py-0.5 rounded text-[10px]">PROTOTYPE</span>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-4 gap-2 border-b border-[#D9D6CF] pb-3">
          {[
            { num: 1, label: '1. Multi-Form Auto-Fill', sub: 'Simultaneous Mapping' },
            { num: 2, label: '2. Indexed Exhibits', sub: 'Tabs A through G' },
            { num: 3, label: '3. Fee Vouchers', sub: 'Trust Disbursement' },
            { num: 4, label: '4. Attorney Clearance', sub: 'Cover Page & Export' },
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`p-2.5 rounded-lg text-left transition-all border ${
                activeStep === s.num
                  ? 'bg-[#06244B] border-[#06244B] text-white font-bold shadow-sm'
                  : 'bg-slate-50 border-[#D9D6CF] text-[#667085] hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="text-[10px] uppercase opacity-80">{s.label}</div>
              <div className="text-xs truncate">{s.sub}</div>
            </button>
          ))}
        </div>

        {/* STEP 1: Multi-Form Simultaneous Auto-Fill Mapping */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F5F0E5] p-3 rounded-lg border border-[#D9D6CF]">
              <div className="flex items-center gap-2 text-[#06244B]">
                <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin-slow" />
                <span className="font-bold">Docketwise Auto-Fill Active:</span>
                <span className="text-[#667085]">
                  Updating any field updates 5 core USCIS forms simultaneously.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <Check className="w-3 h-3" /> 5 Forms Synchronized (0 Errors)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Shared Client Questionnaire Fields */}
              <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>Intake Questionnaire Data (Single Source of Truth)</span>
                  <span className="text-[10px] text-[#A4432B] font-mono font-bold">CLIENT INPUT</span>
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <Input
                      label="Beneficiary Full Legal Name"
                      value={formData.beneficiaryName}
                      onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                    />
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Mapped to: G-28 Pt 3 • I-130 Pt 4 • I-485 Pt 1 • I-765 Pt 2
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        label="Alien # (A-Number)"
                        value={formData.alienNumber}
                        onChange={(e) => handleInputChange('alienNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        label="Country of Citizenship"
                        value={formData.countryOfCitizenship}
                        onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Current I-94 Record #"
                        value={formData.i94Number}
                        onChange={(e) => handleInputChange('i94Number', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        label="Most Recent Entry Date"
                        type="date"
                        value={formData.lastEntryDate}
                        onChange={(e) => handleInputChange('lastEntryDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Class of Admission"
                        value={formData.classOfAdmission}
                        onChange={(e) => handleInputChange('classOfAdmission', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Petitioner / Qualifying Sponsor"
                      value={formData.petitionerName}
                      onChange={(e) => handleInputChange('petitionerName', e.target.value)}
                    />
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Mapped to: I-130 Pt 2 • I-864 Pt 1 • G-28 Pt 3
                    </span>
                  </div>

                  <div>
                    <Input
                      label="Joint Residential Address"
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Target Form Preview */}
              <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-3 shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
                  <h4 className="font-bold text-xs uppercase text-[#06244B]">
                    Real-Time Populated Form Field Inspector
                  </h4>
                  <span className="text-[10px] text-[#667085]">Previewing Auto-Fill</span>
                </div>

                {/* Form Selector Tabs */}
                <div className="flex gap-1 overflow-x-auto text-xs pb-1">
                  {[
                    { id: 'i130', name: 'Form I-130' },
                    { id: 'i485', name: 'Form I-485' },
                    { id: 'i765', name: 'Form I-765' },
                    { id: 'g28', name: 'Form G-28' },
                    { id: 'i864', name: 'Form I-864' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFormPreview(f.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                        activeFormPreview === f.id
                          ? 'bg-[#A4432B] text-white shadow-sm'
                          : 'bg-slate-100 text-[#06244B] hover:bg-slate-200'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* Preview Box */}
                <div className="flex-1 p-3.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs space-y-2 overflow-y-auto max-h-80">
                  {activeFormPreview === 'i130' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-130: PETITION FOR ALIEN RELATIVE (EDITION 04/01/24)
                      </div>
                      <div><strong>Part 1. Relationship:</strong> 1.a. Spouse</div>
                      <div><strong>Part 2. Petitioner Legal Name:</strong> {formData.petitionerName}</div>
                      <div><strong>Part 2, Item 13.a. Citizenship:</strong> {formData.petitionerCitizenship}</div>
                      <div><strong>Part 4, Item 4.a. Beneficiary Family Name:</strong> {formData.beneficiaryName.split(' ').slice(-1)[0]}</div>
                      <div><strong>Part 4, Item 4.b. Beneficiary Given Name:</strong> {formData.beneficiaryName.split(' ')[0]}</div>
                      <div><strong>Part 4, Item 10. Alien Registration Number:</strong> {formData.alienNumber}</div>
                      <div><strong>Part 4, Item 11. Date of Birth:</strong> {formData.dob}</div>
                      <div><strong>Part 4, Item 13. Country of Birth:</strong> {formData.cob}</div>
                      <div><strong>Part 4, Item 46.a. Date of Arrival:</strong> {formData.lastEntryDate}</div>
                      <div><strong>Part 4, Item 46.b. I-94 Arrival Number:</strong> {formData.i94Number}</div>
                      <div><strong>Part 4, Item 46.c. Class of Admission:</strong> {formData.classOfAdmission}</div>
                    </div>
                  )}

                  {activeFormPreview === 'i485' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-485: APPLICATION TO ADJUST STATUS (EDITION 04/01/24)
                      </div>
                      <div><strong>Part 1, Item 1.a. Alien Registration #:</strong> {formData.alienNumber}</div>
                      <div><strong>Part 1, Item 2. Social Security Number:</strong> {formData.ssnMasked}</div>
                      <div><strong>Part 1, Item 3. Legal Name:</strong> {formData.beneficiaryName}</div>
                      <div><strong>Part 1, Item 7. Physical Address:</strong> {formData.currentAddress}</div>
                      <div><strong>Part 1, Item 22. Date of Last Entry:</strong> {formData.lastEntryDate}</div>
                      <div><strong>Part 1, Item 23. Port of Entry:</strong> {formData.portOfEntry}</div>
                      <div><strong>Part 1, Item 24. Current Status:</strong> {formData.classOfAdmission}</div>
                      <div><strong>Part 2, Item 1. Filing Category:</strong> Immediate Relative (INA § 201(b))</div>
                    </div>
                  )}

                  {activeFormPreview === 'i765' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-765: APPLICATION FOR EMPLOYMENT AUTHORIZATION
                      </div>
                      <div><strong>Part 1. Reason for Applying:</strong> 1.a. Initial permission to accept employment</div>
                      <div><strong>Part 2, Item 1. Full Legal Name:</strong> {formData.beneficiaryName}</div>
                      <div><strong>Part 2, Item 8. Alien Registration #:</strong> {formData.alienNumber}</div>
                      <div><strong>Part 2, Item 21.a. Form I-94 Number:</strong> {formData.i94Number}</div>
                      <div><strong>Part 2, Item 27. Eligibility Category:</strong> (c)(9) Adjustment Applicant</div>
                    </div>
                  )}

                  {activeFormPreview === 'g28' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM G-28: NOTICE OF ENTRY OF APPEARANCE AS ATTORNEY
                      </div>
                      <div><strong>Part 1. Attorney Name:</strong> {clearingAttorney}</div>
                      <div><strong>Part 1, Item 3. Law Practice:</strong> Heugly &amp; Bludworth, Attorneys at Law</div>
                      <div><strong>Part 1, Item 6. Utah State Bar Number:</strong> 14902</div>
                      <div><strong>Part 3, Item 1. Client Legal Name:</strong> {formData.beneficiaryName}</div>
                      <div><strong>Part 3, Item 4. Client Entity:</strong> Beneficiary / Adjustment Applicant</div>
                    </div>
                  )}

                  {activeFormPreview === 'i864' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-864: AFFIDAVIT OF SUPPORT UNDER SECTION 213A
                      </div>
                      <div><strong>Part 1. Sponsor Legal Name:</strong> {formData.petitionerName}</div>
                      <div><strong>Part 2. Immigrant Principal:</strong> {formData.beneficiaryName}</div>
                      <div><strong>Part 3. Household Size:</strong> 2 (Sponsor + Spouse Beneficiary)</div>
                      <div><strong>Part 5. 125% Poverty Line Benchmark:</strong> $25,550 (Sponsor Income: $92,500 ✓)</div>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-center justify-between">
                  <span>Cross-form field integrity certified by Heugly &amp; Bludworth engine.</span>
                  <span className="font-bold">100% Synced ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Indexed Exhibit Tabs & Evidentiary Binder */}
        {activeStep === 2 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-2">
              <div>
                <h4 className="font-bold text-sm text-[#06244B]">
                  Two-Column Statutory Indexed Exhibit Tabs (USCIS Submission Binder)
                </h4>
                <span className="text-xs text-[#667085]">
                  Tabbed according to USCIS Adjudicator's Field Manual (AFM) packaging standards.
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                7 of 7 Tabs Compliant ✓
              </span>
            </div>

            <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                  <tr>
                    <th className="p-3 w-20">Tab ID</th>
                    <th className="p-3">Exhibit Description &amp; Evidentiary Category</th>
                    <th className="p-3">Requirement Basis</th>
                    <th className="p-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]">
                  {pkg.exhibitTabs.map((tab, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#A4432B] font-mono text-sm">{tab.tab}</td>
                      <td className="p-3 font-semibold text-[#06244B]">
                        {tab.title}
                      </td>
                      <td className="p-3 text-[#667085] text-[11px]">
                        {idx === 0 && '8 CFR § 292.4(a)'}
                        {idx === 1 && '8 CFR § 245.2 Concurrent Filing'}
                        {idx === 2 && '8 CFR § 204.1(g)(1)'}
                        {idx === 3 && '8 CFR § 103.2(b)(3) Translation'}
                        {idx === 4 && '8 CFR § 204.2(a)(1)(i)(B)'}
                        {idx === 5 && '8 CFR § 213a.2(a)(1)'}
                        {idx === 6 && 'Form Instructions Part 8'}
                      </td>
                      <td className="p-3 text-right">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Indexed &amp; Verified ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: Statutory Filing Fee Vouchers */}
        {activeStep === 3 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#06244B]">
              Statutory USCIS Filing Fee Vouchers &amp; Client Trust Disbursement
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-3">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <div>
                  <span className="font-bold text-[#06244B]">Form I-130 Petition for Alien Relative:</span>
                  <span className="text-[11px] text-[#667085] block">Payable to: U.S. Department of Homeland Security</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#06244B]">$535.00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <div>
                  <span className="font-bold text-[#06244B]">Form I-485 Application to Register Permanent Residence / Adjust Status:</span>
                  <span className="text-[11px] text-[#667085] block">Includes mandatory biometrics services fee</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#06244B]">$1,440.00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <div>
                  <span className="font-bold text-[#06244B]">Form I-765 (EAD) &amp; Form I-131 (Advance Parole):</span>
                  <span className="text-[11px] text-[#667085] block">Concurrent adjustment applicant discount tier</span>
                </div>
                <span className="font-mono font-semibold text-[#667085]">$0.00</span>
              </div>
              <div className="pt-2 flex justify-between items-center font-bold text-base text-[#06244B]">
                <span>Total Statutory Check Voucher:</span>
                <span className="text-[#A4432B] font-mono text-lg">$1,975.00</span>
              </div>
              <div className="p-3 bg-white rounded border border-[#D9D6CF] text-xs space-y-1">
                <div className="flex justify-between text-[#06244B]">
                  <span>Trust Account Drawn On:</span>
                  <strong>Heugly &amp; Bludworth Client Trust / IOLTA Account (Chase #****4912)</strong>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Client Dedicated Trust Balance:</span>
                  <strong>$15,000.00 Available (Sufficient Funds Confirmed ✓)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Supervising Attorney Clearance & Full Submission Package */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
              <div>
                <h4 className="font-bold text-sm text-[#06244B] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#A4432B]" />
                  Supervising Attorney Clearance Gate &amp; Formal Submission Cover
                </h4>
                <span className="text-xs text-[#667085]">
                  Formal certification required under Utah Rules of Professional Conduct (RPC 1.1 &amp; 5.3).
                </span>
              </div>
              {isAttorneyCleared && (
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  CERTIFIED FOR FILING
                </span>
              )}
            </div>

            {isAttorneyCleared ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>PACKAGE OFFICIALLY CERTIFIED &amp; LOCKED FOR USCIS DISPATCH</span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    LOCKED
                  </span>
                </div>
                <p className="text-emerald-950 text-xs leading-relaxed">
                  Supervising attorney <strong>{clearingAttorney}</strong> has reviewed the petition, G-28 appearance, 7 indexed exhibit tabs, and verified the $1,975 trust disbursement. The formal legal submission cover letter and table of contents are ready for courier dispatch.
                </p>
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Printer}
                    onClick={() => setShowPrintCover(!showPrintCover)}
                    className="bg-[#06244B] hover:bg-[#0B356D]"
                  >
                    {showPrintCover ? 'Hide Full Submission Package' : 'View / Print USCIS Submission Package'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                    Supervising &amp; Certifying Attorney
                  </label>
                  <select
                    value={clearingAttorney}
                    onChange={(e) => setClearingAttorney(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
                  >
                    <option value="Sarah Jenkins, Esq.">Sarah Jenkins, Esq. (Immigration Lead Partner • Bar #14902)</option>
                    <option value="Thomas Bludworth, Esq.">Thomas Bludworth, Esq. (Managing Partner • Bar #11204)</option>
                    <option value="Eleanor Heugly, Esq.">Eleanor Heugly, Esq. (Senior Partner • Bar #08491)</option>
                  </select>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-white rounded border border-[#D9D6CF]">
                  <input
                    type="checkbox"
                    id="ethicsCheck"
                    checked={ethicsConfirmation}
                    onChange={(e) => setEthicsConfirmation(e.target.checked)}
                    className="w-4 h-4 text-[#A4432B] rounded mt-0.5 focus:ring-[#A4432B]"
                  />
                  <label htmlFor="ethicsCheck" className="text-xs text-[#202A35] leading-relaxed cursor-pointer">
                    <strong>Attorney Attestation (8 CFR § 292.1 &amp; Utah RPC 5.3):</strong> I certify that I have supervised the preparation of Forms G-28, I-130, I-485, I-765, and I-864; verified the foreign national's statutory eligibility; inspected the 7 indexed exhibit tabs and translations; and authorized the $1,975 filing fee check voucher payable to the U.S. Department of Homeland Security.
                  </label>
                </div>

                <Button
                  size="md"
                  variant="primary"
                  icon={ShieldCheck}
                  onClick={handleClearPackage}
                  className="w-full bg-[#A4432B] hover:bg-[#8B3824]"
                >
                  Certify &amp; Clear Immigration Package for Filing
                </Button>
              </div>
            )}

            {/* Complete USCIS Submission Package & Cover Letter */}
            {showPrintCover && (
              <div className="p-6 bg-white border border-[#06244B] rounded-lg shadow-lg space-y-4 font-serif text-xs text-[#06244B] max-h-96 overflow-y-auto">
                <div className="text-center border-b-2 border-[#06244B] pb-3 space-y-0.5">
                  <div className="font-bold text-base tracking-wider">HEUGLY &amp; BLUDWORTH, ATTORNEYS AT LAW</div>
                  <div className="text-[11px] font-sans text-slate-600">
                    175 South Main Street, Suite 900 • Salt Lake City, Utah 84111 • (801) 555-0100
                  </div>
                  <div className="text-[10px] font-sans text-[#A4432B] font-bold">IMMIGRATION &amp; NATIONALITY LAW PRACTICE GROUP</div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div><strong>Delivery Method:</strong> VIA FEDEX PRIORITY OVERNIGHT (Tracking: 7749 2018 9012)</div>
                  </div>
                  <div className="text-right">
                    <div><strong>Filing Location:</strong></div>
                    <div>USCIS Chicago Lockbox / Attn: FBAS</div>
                    <div>131 South Dearborn - 3rd Floor</div>
                    <div>Chicago, IL 60603-5517</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-300 space-y-1">
                  <div><strong>RE: CONCURRENT FORM I-130 &amp; FORM I-485 ADJUSTMENT OF STATUS PACKAGE</strong></div>
                  <div><strong>Petitioner:</strong> {formData.petitionerName} (U.S. Citizen Spouse)</div>
                  <div><strong>Beneficiary:</strong> {formData.beneficiaryName} (A# {formData.alienNumber})</div>
                  <div><strong>Matter Reference:</strong> {immigrationCase.matterNumber}</div>
                </div>

                <p className="leading-relaxed">
                  Dear Adjudications Officer:
                  Please accept for filing the enclosed Form G-28 Notice of Entry of Appearance and one-step concurrent adjustment of status application submitted pursuant to 8 U.S.C. § 1255(a) and 8 CFR § 245.2.
                </p>

                <div className="border border-slate-300 rounded p-3 space-y-1.5 bg-slate-50 font-sans text-xs">
                  <div className="font-bold text-[#06244B]">TABLE OF CONTENTS &amp; INDEXED EXHIBIT BINDER:</div>
                  <div className="grid grid-cols-1 gap-1 text-[11px]">
                    <div><strong>• Check Voucher:</strong> $535.00 (Form I-130) + $1,440.00 (Form I-485) = $1,975.00 Total DHS Fee</div>
                    <div><strong>• Tab A:</strong> Form G-28 Notice of Appearance as Attorney of Record</div>
                    <div><strong>• Tab B:</strong> Form I-130, Form I-485, and Form I-765 with Original Signatures</div>
                    <div><strong>• Tab C:</strong> Petitioner's Proof of U.S. Citizenship (Certified Utah Birth Certificate)</div>
                    <div><strong>• Tab D:</strong> Beneficiary's Birth Certificate with Certified English Translation and Form I-94 Record</div>
                    <div><strong>• Tab E:</strong> Certified Marriage Certificate, Joint Apartment Lease, and Joint Bank Account Statements</div>
                    <div><strong>• Tab F:</strong> Form I-864 Affidavit of Support with Sponsor W-2s and IRS Tax Transcripts</div>
                    <div><strong>• Tab G:</strong> Form G-1145 E-Notification and Two (2) Passport-Style Photographs</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 flex justify-between items-end">
                  <div>
                    <div>Respectfully submitted,</div>
                    <div className="font-bold mt-3 text-sm">{clearingAttorney}</div>
                    <div className="text-[11px] text-slate-600">Utah State Bar ID #14902</div>
                    <div className="text-[11px] text-slate-600">Counsel for Petitioner and Beneficiary</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Printer}
                      onClick={() => {
                        window.print();
                        addToast('Document sent to system print dialog.', 'info');
                      }}
                    >
                      Print Package
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Download}
                      onClick={() => {
                        addToast('Submission Package (.pdf) downloaded!', 'success');
                      }}
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-[#D9D6CF] flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {activeStep > 1 && (
              <Button size="sm" variant="outline" onClick={() => setActiveStep(prev => prev - 1)}>
                &larr; Previous Step
              </Button>
            )}
            {activeStep < 4 ? (
              <Button size="sm" variant="primary" onClick={() => setActiveStep(prev => prev + 1)}>
                Next Step &rarr;
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                onClick={onClose}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
