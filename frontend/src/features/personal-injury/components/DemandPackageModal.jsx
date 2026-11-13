import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { CheckSquare, Square, Eye, FileText, Printer, ShieldCheck } from 'lucide-react';

export function DemandPackageModal({ isOpen, onClose, onSave, demandPackage, cases = [] }) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [formData, setFormData] = useState({
    matterId: '',
    matterTitle: '',
    demandAmount: 350000,
    policyLimitsDemand: false,
    datePrepared: '',
    responseDeadline: '',
    carrierRecipient: '',
    packageStatus: 'In Progress (Ready for Partner Review)',
    attorneyReviewStatus: 'Under Partner Review',
    checklist: {
      incidentReport: true,
      liabilityEvidence: true,
      witnessStatements: true,
      medicalRecords: true,
      medicalBills: true,
      lostWageDocuments: true,
      insuranceInformation: true,
      medicalChronology: true,
      supportingPhotographs: true,
      otherSupportingEvidence: false,
    },
    narrative: '',
  });

  useEffect(() => {
    if (demandPackage) {
      setFormData({
        matterId: demandPackage.matterId || cases[0]?.id || '',
        matterTitle: demandPackage.matterTitle || '',
        demandAmount: demandPackage.demandAmount || 350000,
        policyLimitsDemand: demandPackage.policyLimitsDemand || false,
        datePrepared: demandPackage.datePrepared || '',
        responseDeadline: demandPackage.responseDeadline || '',
        carrierRecipient: demandPackage.carrierRecipient || '',
        packageStatus: demandPackage.packageStatus || 'In Progress',
        attorneyReviewStatus: demandPackage.attorneyReviewStatus || 'Under Partner Review',
        checklist: demandPackage.checklist || {
          incidentReport: true,
          liabilityEvidence: true,
          witnessStatements: true,
          medicalRecords: true,
          medicalBills: true,
          lostWageDocuments: true,
          insuranceInformation: true,
          medicalChronology: true,
          supportingPhotographs: true,
          otherSupportingEvidence: false,
        },
        narrative: demandPackage.narrative || '',
      });
    } else {
      setFormData({
        matterId: cases[0]?.id || '',
        matterTitle: cases[0]?.matterTitle || '',
        demandAmount: 250000,
        policyLimitsDemand: false,
        datePrepared: new Date().toISOString().split('T')[0],
        responseDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        carrierRecipient: 'Travelers Commercial Property & Casualty (Attn: Cynthia Vance)',
        packageStatus: 'Drafting Package',
        attorneyReviewStatus: 'Draft',
        checklist: {
          incidentReport: true,
          liabilityEvidence: true,
          witnessStatements: false,
          medicalRecords: true,
          medicalBills: true,
          lostWageDocuments: false,
          insuranceInformation: true,
          medicalChronology: true,
          supportingPhotographs: true,
          otherSupportingEvidence: false,
        },
        narrative: 'RE: Formal Settlement Demand Under Utah Law\n\nPlease find attached the comprehensive damages dossier regarding the subject collision...',
      });
    }
  }, [demandPackage, cases, isOpen]);

  const toggleChecklistItem = (key) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const checklistItems = [
    { key: 'incidentReport', label: '1. Incident / Police Crash Report & Citations' },
    { key: 'liabilityEvidence', label: '2. Liability Evidence (Scene Photos, Traffic Cam Video)' },
    { key: 'witnessStatements', label: '3. Signed Witness Statements & Transcribed Interviews' },
    { key: 'medicalRecords', label: '4. Complete Certified Medical Records (ER, Surgery, PT)' },
    { key: 'medicalBills', label: '5. Itemized Medical Bills Ledger & Statutory Lien Notices' },
    { key: 'lostWageDocuments', label: '6. Verified Lost Wage Documentation (HR Letter & W-2s)' },
    { key: 'insuranceInformation', label: '7. Certified Dec Sheets & Policy Limits Confirmations' },
    { key: 'medicalChronology', label: '8. Professional Forensic Medical Chronology' },
    { key: 'supportingPhotographs', label: '9. Property Damage & Injury / Scarring Photographs' },
    { key: 'otherSupportingEvidence', label: '10. Expert Biomechanical / Reconstruction Reports' },
  ];

  const completedCount = Object.values(formData.checklist).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / checklistItems.length) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMatter = cases.find(c => c.id === formData.matterId);

    const savedRecord = {
      id: demandPackage?.id || `DMD-${Date.now()}`,
      matterId: formData.matterId,
      matterTitle: selectedMatter?.matterTitle || formData.matterTitle,
      demandAmount: Number(formData.demandAmount),
      policyLimitsDemand: formData.policyLimitsDemand,
      datePrepared: formData.datePrepared,
      responseDeadline: formData.responseDeadline,
      carrierRecipient: formData.carrierRecipient,
      packageStatus: formData.packageStatus,
      attorneyReviewStatus: formData.attorneyReviewStatus,
      checklist: formData.checklist,
      narrative: formData.narrative,
      exhibits: demandPackage?.exhibits || [
        { id: 'Ex-A', title: 'Exhibit A: Official Police Crash Report', pages: 6 },
        { id: 'Ex-B', title: 'Exhibit B: Scene & Property Damage Photographs', pages: 12 },
        { id: 'Ex-C', title: 'Exhibit C: Emergency Trauma Medical Packet', pages: 48 },
        { id: 'Ex-D', title: 'Exhibit D: Itemized Medical Expense Ledger', pages: 15 },
        { id: 'Ex-E', title: 'Exhibit E: Employer Wage Loss Verification', pages: 4 },
      ],
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={demandPackage ? `Demand Package: ${formData.matterTitle}` : 'Create New Demand Package'}
      size="xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Tab Toggle: Edit vs Letter Preview */}
        <div className="flex border-b border-[#D9D6CF] pb-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'edit'
                ? 'bg-[#06244B] text-white'
                : 'text-[#667085] hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Builder &amp; Readiness Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'preview'
                ? 'bg-[#A4432B] text-white'
                : 'text-[#667085] hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Demand Letter Formal Preview</span>
          </button>
        </div>

        {activeTab === 'edit' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Matter & Target Demand */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Associated PI Matter *"
                value={formData.matterId}
                onChange={(e) => setFormData({ ...formData, matterId: e.target.value })}
                required
                options={cases.map((c) => ({
                  value: c.id,
                  label: `${c.matterNumber} - ${c.clientName}`,
                }))}
              />

              <Input
                label="Target Demand Amount ($) *"
                type="number"
                step="1000"
                value={formData.demandAmount}
                onChange={(e) => setFormData({ ...formData, demandAmount: e.target.value })}
                required
              />

              <Select
                label="Attorney Review Status *"
                value={formData.attorneyReviewStatus}
                onChange={(e) => setFormData({ ...formData, attorneyReviewStatus: e.target.value })}
                options={[
                  { value: 'Draft', label: 'Draft (In Preparation)' },
                  { value: 'Under Partner Review', label: 'Under Partner Review' },
                  { value: 'Client Approved', label: 'Client Approved' },
                  { value: 'Approved & Sent to Carrier', label: 'Approved & Sent to Carrier' },
                ]}
              />
            </div>

            {/* Carrier Recipient & Deadlines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Carrier &amp; Adjuster Recipient *"
                value={formData.carrierRecipient}
                placeholder="e.g. Travelers Commercial Lines (Attn: Cynthia Vance)"
                onChange={(e) => setFormData({ ...formData, carrierRecipient: e.target.value })}
                required
              />

              <Input
                label="Demand Date Prepared"
                type="date"
                value={formData.datePrepared}
                onChange={(e) => setFormData({ ...formData, datePrepared: e.target.value })}
              />

              <Input
                label="Response Expiration Date *"
                type="date"
                value={formData.responseDeadline}
                onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
                required
              />
            </div>

            {/* Demand Readiness Checklist Card */}
            <div className="bg-[#F5F0E5]/60 p-4 rounded border border-[#D9D6CF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#A4432B]" />
                    Demand Readiness Checklist ({completedCount} / {checklistItems.length} Verified)
                  </h4>
                  <p className="text-[11px] text-[#667085]">
                    Verify all required evidentiary exhibits prior to releasing demand to liability carrier.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#06244B]">{completionPercentage}%</span>
                  <div className="w-24 bg-slate-200 rounded-full h-2 mt-0.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        completionPercentage === 100 ? 'bg-[#287A55]' : 'bg-[#A4432B]'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#D9D6CF]">
                {checklistItems.map((item) => {
                  const isChecked = formData.checklist[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleChecklistItem(item.key)}
                      className={`flex items-center gap-2 text-left p-2 rounded text-xs transition-colors border ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-white border-[#D9D6CF] text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demand Narrative Textarea */}
            <div>
              <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
                Substantive Legal Demand Narrative &amp; Medical Argument
              </label>
              <textarea
                rows={6}
                value={formData.narrative}
                onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                className="w-full text-xs p-3 font-mono leading-relaxed rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
                placeholder="Draft demand narrative..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Demand Package
              </Button>
            </div>
          </form>
        ) : (
          /* Demand Letter Formal Preview on Firm Letterhead */
          <div className="space-y-4">
            <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-sm font-serif text-slate-900 leading-relaxed text-xs space-y-4">
              {/* Firm Letterhead Header */}
              <div className="text-center border-b-2 border-[#06244B] pb-4">
                <h2 className="text-lg font-bold tracking-widest text-[#06244B] uppercase">
                  HEUGLY &amp; BLUDWORTH, P.C.
                </h2>
                <p className="text-[10px] text-slate-600 tracking-wider font-sans">
                  Attorneys at Law • 175 South Main Street, Suite 900, Salt Lake City, Utah 84111
                </p>
                <p className="text-[10px] text-[#A4432B] font-semibold font-sans">
                  Telephone: (801) 532-1000 • Facsimile: (801) 532-1005 • utahslawyers.com
                </p>
              </div>

              {/* Recipient & Metadata Strip */}
              <div className="space-y-1 font-sans text-xs">
                <p className="font-semibold text-slate-500">{formData.datePrepared || 'February 15, 2026'}</p>
                <p className="font-bold text-[#06244B]">{formData.carrierRecipient}</p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 my-2 space-y-0.5 text-[11px]">
                  <p><strong>RE:</strong> CONFIDENTIAL DEMAND FOR POLICY COMPROMISE UNDER UTAH LAW</p>
                  <p><strong>CLAIMANT:</strong> {formData.matterTitle || 'Sarah Jenkins'}</p>
                  <p><strong>FIRM FILE NO.:</strong> {cases.find(c => c.id === formData.matterId)?.matterNumber || '26-PI-0101'}</p>
                  <p><strong>RESPONSE DEADLINE:</strong> <span className="text-[#B42318] font-bold">{formData.responseDeadline}</span></p>
                </div>
              </div>

              {/* Narrative Content */}
              <div className="whitespace-pre-line text-xs font-sans leading-relaxed text-slate-800">
                {formData.narrative}
              </div>

              {/* Exhibit Index Table */}
              <div className="pt-3 border-t border-slate-200 font-sans">
                <h4 className="text-xs font-bold text-[#06244B] uppercase mb-2">
                  Index of Enclosed Supporting Exhibits
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {(demandPackage?.exhibits || []).map((ex) => (
                    <div key={ex.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                      <span className="font-medium text-slate-800">{ex.title}</span>
                      <span className="text-slate-500 font-semibold">{ex.pages} pp.</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-4 font-sans text-xs space-y-1">
                <p>Respectfully submitted,</p>
                <p className="font-serif font-bold text-base text-[#06244B] pt-3">Thomas Bludworth, Esq.</p>
                <p className="text-slate-600 text-[11px]">HEUGLY &amp; BLUDWORTH, P.C.</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF Letter</span>
              </Button>

              <Button type="button" variant="primary" onClick={() => setActiveTab('edit')}>
                Back to Checklist Builder
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

