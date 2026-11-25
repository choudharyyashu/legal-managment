import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  Award,
  Layers,
  RefreshCw,
  Check,
  Plus,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { immigrationService } from '../../../services/immigrationService';
import { createLegalDocumentPdf } from '../../../utils/pdfGenerator';

export function FilingPackageAssemblerModal({
  isOpen,
  onClose,
  immigrationCase,
  cases = [],
  onSelectCase,
  onOpenCreatePetition,
  onCaseSaved,
  onPackageCleared,
}) {
  const { addToast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [isAttorneyCleared, setIsAttorneyCleared] = useState(false);
  const [clearingAttorney, setClearingAttorney] = useState('');
  const [ethicsConfirmation, setEthicsConfirmation] = useState(false);
  const [showPrintCover, setShowPrintCover] = useState(false);
  const [savingCase, setSavingCase] = useState(false);

  const [formData, setFormData] = useState({
    beneficiaryName: '',
    dob: '',
    countryOfCitizenship: '',
    alienNumber: '',
    classOfAdmission: '',
    i94Number: '',
    lastEntryDate: '',
    petitionerName: '',
    currentAddress: '',
    category: '',
  });

  const [activeFormPreview, setActiveFormPreview] = useState('i130');

  useEffect(() => {
    if (!isOpen) return;
    setActiveStep(1);
    setShowPrintCover(false);
    setEthicsConfirmation(false);
    setIsAttorneyCleared(Boolean(immigrationCase?.filingPackage?.clearedByAttorney));
    setClearingAttorney(
      immigrationCase?.assignedAttorneyName || immigrationCase?.assignedAttorney || ''
    );
    setFormData({
      beneficiaryName:
        immigrationCase?.beneficiaryName && immigrationCase.beneficiaryName !== '—'
          ? immigrationCase.beneficiaryName
          : '',
      dob: immigrationCase?.beneficiaryDob || '',
      countryOfCitizenship: immigrationCase?.countryOfCitizenship || '',
      alienNumber:
        immigrationCase?.alienNumber && immigrationCase.alienNumber !== '—'
          ? immigrationCase.alienNumber
          : '',
      classOfAdmission: immigrationCase?.classOfAdmission || '',
      i94Number: immigrationCase?.i94Number || '',
      lastEntryDate: immigrationCase?.priorityDate || '',
      petitionerName:
        immigrationCase?.petitionerName && immigrationCase.petitionerName !== '—'
          ? immigrationCase.petitionerName
          : '',
      currentAddress: immigrationCase?.currentAddress || '',
      category: immigrationCase?.category || '',
    });
  }, [immigrationCase, isOpen]);

  if (!isOpen) return null;

  // Visible Empty / Case-Selection State when no petition is selected yet (fixes dead button on 0 petitions)
  if (!immigrationCase) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="USCIS Multi-Form Auto-Fill Studio"
        subtitle="Select or create an immigration petition to map fields across Forms G-28, I-130, I-485, I-765, and I-864"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[#202A35]">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                No Active Immigration Petition Selected
              </h4>
              <p className="text-xs text-amber-900 mt-1">
                Multi-Form Auto-Fill binds questionnaire values directly to an Immigration Matter record. Create a new petition or choose an existing immigration matter to begin.
              </p>
            </div>
          </div>

          {cases.length > 0 && (
            <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-2">
              <label className="font-bold text-[#06244B] block uppercase text-[11px]">
                Select Existing Immigration Matter
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const found = cases.find((c) => c.id === e.target.value);
                  if (found && onSelectCase) onSelectCase(found);
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white font-medium"
              >
                <option value="" disabled>
                  Choose an immigration petition...
                </option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.matterNumber} — {c.title} ({c.beneficiaryName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            {onOpenCreatePetition && (
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={onOpenCreatePetition}
                className="bg-[#A4432B] hover:bg-[#8B3824]"
              >
                Create New Immigration Petition
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  const pkg = immigrationCase.filingPackage || {
    packageId: `PKG-IMM-2026-${immigrationCase.matterNumber?.replace(/\D/g, '') || '01'}`,
    status: 'Draft Assembly',
    exhibitTabs: [
      { tab: 'Tab A', title: 'Form G-28 Notice of Entry of Appearance as Attorney of Record' },
      { tab: 'Tab B', title: 'Primary Petitions: Form I-130, Form I-485, and Form I-765' },
      { tab: 'Tab C', title: "Petitioner's Proof of U.S. Citizenship / Status" },
      { tab: 'Tab D', title: "Beneficiary's Civil Records & Certified Translations" },
      { tab: 'Tab E', title: 'Supporting Relationship / Employment Eligibility Evidence' },
      { tab: 'Tab F', title: 'Form I-864 Affidavit of Support & Financial Records' },
      { tab: 'Tab G', title: 'Form G-1145 E-Notification & Supporting Photographs' },
    ],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveToCase = async () => {
    const matterId = immigrationCase.matterId || immigrationCase.id;
    if (!matterId) return;
    setSavingCase(true);
    try {
      await immigrationService.saveImmigrationCase(matterId, {
        visaCategory: formData.category || immigrationCase.category,
        beneficiaryName: formData.beneficiaryName || undefined,
        alienRegistrationNum: formData.alienNumber || undefined,
        countryOfCitizenship: formData.countryOfCitizenship || undefined,
        classOfAdmission: formData.classOfAdmission || undefined,
        i94Number: formData.i94Number || undefined,
        priorityDate: formData.lastEntryDate || undefined,
      });
      addToast('Questionnaire fields saved to Immigration Case record.', 'success');
      if (onCaseSaved) await onCaseSaved();
    } catch (err) {
      addToast(err?.message || 'Could not persist questionnaire fields.', 'error');
    } finally {
      setSavingCase(false);
    }
  };

  const handleClearPackage = () => {
    if (!ethicsConfirmation) {
      addToast('Please confirm attorney review of statutory eligibility and attachments.', 'error');
      return;
    }
    setIsAttorneyCleared(true);
    if (onPackageCleared) {
      onPackageCleared(immigrationCase.id, clearingAttorney || 'Supervising Counsel');
    }
    addToast(
      `Package certified for filing review by ${clearingAttorney || 'Supervising Counsel'}.`,
      'success'
    );
  };

  const handleDownloadPdfPackage = () => {
    const lines = [
      'HEUGLY & BLUDWORTH, ATTORNEYS AT LAW',
      'IMMIGRATION FILING PACKAGE & FORM FIELD SUMMARY',
      '=========================================================================',
      `Matter Number: ${immigrationCase.matterNumber}`,
      `Package Reference: ${pkg.packageId}`,
      `Category: ${formData.category || 'Immigration Petition'}`,
      `Beneficiary: ${formData.beneficiaryName || 'Pending Entry'}`,
      `A-Number: ${formData.alienNumber || 'Pending'}`,
      `I-94 Record: ${formData.i94Number || 'Pending'}`,
      `Citizenship: ${formData.countryOfCitizenship || 'Pending'}`,
      `Petitioner / Sponsor: ${formData.petitionerName || 'Pending'}`,
      `Counsel: ${clearingAttorney || 'Assigned Counsel'}`,
      ' ',
      'INCLUDED FORMS & INDEXED EXHIBITS:',
      ...pkg.exhibitTabs.map((t) => `- ${t.tab}: ${t.title}`),
      ' ',
      'NOTE: Draft package prepared for attorney verification prior to USCIS submission.',
    ];

    const pdfBlob = createLegalDocumentPdf({
      title: `USCIS Filing Package - ${immigrationCase.matterNumber}`,
      draftCode: pkg.packageId,
      client: formData.beneficiaryName || immigrationCase.clientName || 'Client',
      matter: `${immigrationCase.matterNumber} - ${immigrationCase.title}`,
      attorney: clearingAttorney || 'Assigned Counsel',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      customBodyLines: lines,
    });

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${immigrationCase.matterNumber || 'IMM'}_Filing_Package.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    addToast('USCIS Filing Package PDF generated and downloaded.', 'success');
  };

  const beneficiaryParts = (formData.beneficiaryName || '').trim().split(/\s+/);
  const firstName = beneficiaryParts[0] || '—';
  const lastName = beneficiaryParts.length > 1 ? beneficiaryParts[beneficiaryParts.length - 1] : '—';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`USCIS Multi-Form Auto-Fill & Package Assembler: ${immigrationCase.matterNumber}`}
      subtitle={`Beneficiary: ${formData.beneficiaryName || 'Unassigned'} • Category: ${formData.category || 'General'}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 text-xs text-[#202A35]">
        {/* Operational Notice Banner */}
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-emerald-950">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Connected Multi-Form Auto-Fill:</strong> Fields map simultaneously across Forms G-28, I-130, I-485, I-765, and I-864 and save to the Immigration Case record.
            </span>
          </div>
          {cases.length > 1 && onSelectCase && (
            <select
              value={immigrationCase.id}
              onChange={(e) => {
                const found = cases.find((c) => c.id === e.target.value);
                if (found) onSelectCase(found);
              }}
              className="text-[11px] px-2 py-1 rounded border border-emerald-300 bg-white font-semibold"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.matterNumber} — {c.beneficiaryName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#D9D6CF] pb-3">
          {[
            { num: 1, label: '1. Multi-Form Auto-Fill', sub: 'Simultaneous Mapping' },
            { num: 2, label: '2. Indexed Exhibits', sub: 'Tabs A through G' },
            { num: 3, label: '3. Fee Schedule', sub: 'USCIS Filing Fees' },
            { num: 4, label: '4. Attorney Clearance', sub: 'Cover Page & PDF' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
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
                <RefreshCw className="w-4 h-4 text-emerald-700" />
                <span className="font-bold">Live Form Mapping Active:</span>
                <span className="text-[#667085]">
                  Updating any input syncs G-28, I-130, I-485, I-765, and I-864 previews.
                </span>
              </div>
              <Button
                size="xs"
                variant="primary"
                icon={Save}
                onClick={handleSaveToCase}
                disabled={savingCase}
              >
                {savingCase ? 'Saving...' : 'Save Fields to Case'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#06244B] border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>Intake Questionnaire Data</span>
                  <span className="text-[10px] text-[#A4432B] font-mono font-bold">CASE INPUT</span>
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <Input
                      label="Beneficiary Full Legal Name"
                      value={formData.beneficiaryName}
                      placeholder="Enter beneficiary full legal name"
                      onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                    />
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Mapped to: G-28 Pt 3 • I-130 Pt 4 • I-485 Pt 1 • I-765 Pt 2
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Alien # (A-Number)"
                      value={formData.alienNumber}
                      placeholder="A-###-###-###"
                      onChange={(e) => handleInputChange('alienNumber', e.target.value)}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Country of Citizenship"
                      value={formData.countryOfCitizenship}
                      placeholder="Country"
                      onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                    />
                    <Input
                      label="Current I-94 Record #"
                      value={formData.i94Number}
                      placeholder="11-char I-94 #"
                      onChange={(e) => handleInputChange('i94Number', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Priority / Entry Date"
                      type="date"
                      value={formData.lastEntryDate}
                      onChange={(e) => handleInputChange('lastEntryDate', e.target.value)}
                    />
                    <Input
                      label="Class of Admission"
                      value={formData.classOfAdmission}
                      placeholder="e.g. B-2, H-1B, F-1"
                      onChange={(e) => handleInputChange('classOfAdmission', e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Petitioner / Qualifying Sponsor"
                      value={formData.petitionerName}
                      placeholder="Petitioner / Sponsor name"
                      onChange={(e) => handleInputChange('petitionerName', e.target.value)}
                    />
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Mapped to: I-130 Pt 2 • I-864 Pt 1 • G-28 Pt 3
                    </span>
                  </div>

                  <Input
                    label="Residential Address"
                    value={formData.currentAddress}
                    placeholder="Street, City, State, ZIP"
                    onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-3 shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
                  <h4 className="font-bold text-xs uppercase text-[#06244B]">
                    Real-Time Populated Form Field Inspector
                  </h4>
                  <span className="text-[10px] text-[#667085]">Live Field Preview</span>
                </div>

                <div className="flex gap-1 overflow-x-auto text-xs pb-1">
                  {[
                    { id: 'i130', name: 'Form I-130' },
                    { id: 'i485', name: 'Form I-485' },
                    { id: 'i765', name: 'Form I-765' },
                    { id: 'g28', name: 'Form G-28' },
                    { id: 'i864', name: 'Form I-864' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFormPreview(f.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeFormPreview === f.id
                          ? 'bg-[#A4432B] text-white shadow-sm'
                          : 'bg-slate-100 text-[#06244B] hover:bg-slate-200'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-3.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs space-y-2 overflow-y-auto max-h-80">
                  {activeFormPreview === 'i130' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-130: PETITION FOR ALIEN RELATIVE
                      </div>
                      <div><strong>Part 2. Petitioner Legal Name:</strong> {formData.petitionerName || '—'}</div>
                      <div><strong>Part 4, Family Name:</strong> {lastName}</div>
                      <div><strong>Part 4, Given Name:</strong> {firstName}</div>
                      <div><strong>Part 4, Alien Registration #:</strong> {formData.alienNumber || '—'}</div>
                      <div><strong>Part 4, Date of Birth:</strong> {formData.dob || '—'}</div>
                      <div><strong>Part 4, Citizenship:</strong> {formData.countryOfCitizenship || '—'}</div>
                      <div><strong>Part 4, I-94 Number:</strong> {formData.i94Number || '—'}</div>
                      <div><strong>Part 4, Class of Admission:</strong> {formData.classOfAdmission || '—'}</div>
                    </div>
                  )}

                  {activeFormPreview === 'i485' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-485: APPLICATION TO ADJUST STATUS
                      </div>
                      <div><strong>Part 1, Alien Registration #:</strong> {formData.alienNumber || '—'}</div>
                      <div><strong>Part 1, Legal Name:</strong> {formData.beneficiaryName || '—'}</div>
                      <div><strong>Part 1, Physical Address:</strong> {formData.currentAddress || '—'}</div>
                      <div><strong>Part 1, Entry / Priority Date:</strong> {formData.lastEntryDate || '—'}</div>
                      <div><strong>Part 1, Current Status:</strong> {formData.classOfAdmission || '—'}</div>
                      <div><strong>Part 2, Category:</strong> {formData.category || '—'}</div>
                    </div>
                  )}

                  {activeFormPreview === 'i765' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-765: APPLICATION FOR EMPLOYMENT AUTHORIZATION
                      </div>
                      <div><strong>Part 2, Full Legal Name:</strong> {formData.beneficiaryName || '—'}</div>
                      <div><strong>Part 2, Alien Registration #:</strong> {formData.alienNumber || '—'}</div>
                      <div><strong>Part 2, Form I-94 Number:</strong> {formData.i94Number || '—'}</div>
                      <div><strong>Part 2, Citizenship:</strong> {formData.countryOfCitizenship || '—'}</div>
                    </div>
                  )}

                  {activeFormPreview === 'g28' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM G-28: NOTICE OF ENTRY OF APPEARANCE AS ATTORNEY
                      </div>
                      <div><strong>Part 1. Attorney Name:</strong> {clearingAttorney || 'Assigned Counsel'}</div>
                      <div><strong>Part 1, Law Firm:</strong> Heugly &amp; Bludworth, Attorneys at Law</div>
                      <div><strong>Part 3, Client Legal Name:</strong> {formData.beneficiaryName || '—'}</div>
                      <div><strong>Matter Reference:</strong> {immigrationCase.matterNumber}</div>
                    </div>
                  )}

                  {activeFormPreview === 'i864' && (
                    <div className="space-y-1.5 text-slate-800">
                      <div className="font-bold text-[#06244B] border-b pb-1">
                        FORM I-864: AFFIDAVIT OF SUPPORT
                      </div>
                      <div><strong>Part 1. Sponsor Legal Name:</strong> {formData.petitionerName || '—'}</div>
                      <div><strong>Part 2. Immigrant Principal:</strong> {formData.beneficiaryName || '—'}</div>
                      <div><strong>Part 2, Mailing Address:</strong> {formData.currentAddress || '—'}</div>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-center justify-between">
                  <span>Cross-form values synchronized with current questionnaire state.</span>
                  <span className="font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Synced
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Indexed Exhibit Tabs */}
        {activeStep === 2 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-2">
              <div>
                <h4 className="font-bold text-sm text-[#06244B]">
                  Indexed Exhibit Tabs (USCIS Submission Binder)
                </h4>
                <span className="text-xs text-[#667085]">
                  Organized packet structure for attorney verification before filing.
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border">
                {pkg.exhibitTabs.length} Tabs Configured
              </span>
            </div>

            <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                  <tr>
                    <th className="p-3 w-20">Tab ID</th>
                    <th className="p-3">Exhibit Description &amp; Evidentiary Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]">
                  {pkg.exhibitTabs.map((tab, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#A4432B] font-mono text-sm">{tab.tab}</td>
                      <td className="p-3 font-semibold text-[#06244B]">{tab.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: Filing Fee Schedule Reference */}
        {activeStep === 3 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#06244B]">
              USCIS Filing Fee Reference (Verify Current Fee Schedule Before Disbursement)
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-3">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <span className="font-bold text-[#06244B]">Form I-130 Petition for Alien Relative</span>
                <span className="font-mono text-[#06244B]">Per current USCIS G-1055 fee schedule</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <span className="font-bold text-[#06244B]">Form I-485 Application to Adjust Status</span>
                <span className="font-mono text-[#06244B]">Per current USCIS G-1055 fee schedule</span>
              </div>
              <div className="text-[11px] text-[#667085]">
                Disbursements require separate trust/operating approval in the Billing &amp; Trust module.
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Supervising Attorney Clearance & PDF Package Export */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
              <div>
                <h4 className="font-bold text-sm text-[#06244B] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#A4432B]" />
                  Supervising Attorney Clearance &amp; Package Export
                </h4>
                <span className="text-xs text-[#667085]">
                  Preparation does not file with USCIS. Attorney verification is required before dispatch.
                </span>
              </div>
              {isAttorneyCleared && (
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  CLEARED FOR DISPATCH
                </span>
              )}
            </div>

            {!isAttorneyCleared ? (
              <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-4">
                <Input
                  label="Certifying Attorney"
                  value={clearingAttorney}
                  placeholder="Enter supervising attorney name"
                  onChange={(e) => setClearingAttorney(e.target.value)}
                />
                <div className="flex items-start gap-2.5 p-3.5 bg-white rounded border border-[#D9D6CF]">
                  <input
                    type="checkbox"
                    id="ethicsCheck"
                    checked={ethicsConfirmation}
                    onChange={(e) => setEthicsConfirmation(e.target.checked)}
                    className="w-4 h-4 text-[#A4432B] rounded mt-0.5"
                  />
                  <label htmlFor="ethicsCheck" className="text-xs text-[#202A35] leading-relaxed cursor-pointer">
                    <strong>Attorney Review Confirmation:</strong> I have reviewed the mapped forms, eligibility criteria, and attached exhibit tabs for matter {immigrationCase.matterNumber}.
                  </label>
                </div>

                <Button
                  size="md"
                  variant="primary"
                  icon={ShieldCheck}
                  onClick={handleClearPackage}
                  className="w-full bg-[#A4432B] hover:bg-[#8B3824]"
                >
                  Mark Package Reviewed &amp; Ready for Export
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>PACKAGE CLEARED BY {clearingAttorney || 'SUPERVISING COUNSEL'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Printer}
                    onClick={() => setShowPrintCover(!showPrintCover)}
                  >
                    {showPrintCover ? 'Hide Cover Preview' : 'Preview Submission Cover'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Download}
                    onClick={handleDownloadPdfPackage}
                  >
                    Download Package (.PDF)
                  </Button>
                </div>
              </div>
            )}

            {showPrintCover && (
              <div className="p-4 bg-white border border-[#06244B] rounded-lg font-serif text-xs text-[#06244B] space-y-2">
                <div className="font-bold text-sm border-b pb-1">
                  SUBMISSION SUMMARY — {immigrationCase.matterNumber}
                </div>
                <div><strong>Petitioner:</strong> {formData.petitionerName || '—'}</div>
                <div><strong>Beneficiary:</strong> {formData.beneficiaryName || '—'} (A# {formData.alienNumber || '—'})</div>
                <div><strong>Category:</strong> {formData.category || '—'}</div>
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
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleDownloadPdfPackage}
            >
              Export Summary PDF
            </Button>
            {activeStep > 1 && (
              <Button size="sm" variant="outline" onClick={() => setActiveStep((prev) => prev - 1)}>
                &larr; Previous
              </Button>
            )}
            {activeStep < 4 ? (
              <Button size="sm" variant="primary" onClick={() => setActiveStep((prev) => prev + 1)}>
                Next &rarr;
              </Button>
            ) : (
              <Button size="sm" variant="primary" icon={CheckCircle2} onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
