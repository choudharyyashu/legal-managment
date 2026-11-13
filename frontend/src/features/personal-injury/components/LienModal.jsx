import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function LienModal({ isOpen, onClose, onSave, lien, cases = [] }) {
  const [formData, setFormData] = useState({
    matterId: '',
    lienHolder: '',
    lienType: 'Health Insurance / ERISA Subrogation',
    originalLienAmount: 10000.0,
    verifiedLienAmount: 8500.0,
    reductionRequested: 2833.33,
    negotiatedAmount: 5666.67,
    finalPayoffAmount: 5666.67,
    confirmationStatus: 'Written Payoff Confirmed',
    supportingDocuments: 'Formal Payoff Agreement & Ledger',
    notes: 'Agreed 33.33% statutory fee procurement reduction under Utah Made-Whole Rule.',
  });

  useEffect(() => {
    if (lien) {
      setFormData({
        matterId: lien.matterId || cases[0]?.id || '',
        lienHolder: lien.lienHolder || '',
        lienType: lien.lienType || 'Health Insurance / ERISA Subrogation',
        originalLienAmount: lien.originalLienAmount || 0,
        verifiedLienAmount: lien.verifiedLienAmount || 0,
        reductionRequested: lien.reductionRequested || 0,
        negotiatedAmount: lien.negotiatedAmount || 0,
        finalPayoffAmount: lien.finalPayoffAmount || 0,
        confirmationStatus: lien.confirmationStatus || 'Written Payoff Confirmed',
        supportingDocuments: lien.supportingDocuments || '',
        notes: lien.notes || '',
      });
    } else {
      setFormData({
        matterId: cases[0]?.id || '',
        lienHolder: '',
        lienType: 'Health Insurance / ERISA Subrogation',
        originalLienAmount: 5000.0,
        verifiedLienAmount: 5000.0,
        reductionRequested: 1666.67,
        negotiatedAmount: 3333.33,
        finalPayoffAmount: 3333.33,
        confirmationStatus: 'Reduction Request Submitted (Under Review)',
        supportingDocuments: 'Itemized Subrogation Claims Printout',
        notes: 'Requesting 33.3% common fund attorney fee reduction under Utah law.',
      });
    }
  }, [lien, cases, isOpen]);

  // Handle automatic 1/3 common fund reduction helper
  const applyCommonFundReduction = () => {
    const verified = Number(formData.verifiedLienAmount || 0);
    const reduction = Math.round((verified / 3) * 100) / 100;
    const finalAmt = Math.round((verified - reduction) * 100) / 100;

    setFormData((prev) => ({
      ...prev,
      reductionRequested: reduction,
      negotiatedAmount: finalAmt,
      finalPayoffAmount: finalAmt,
      notes: `${prev.notes ? prev.notes + ' ' : ''}Applied 33.33% Utah Common Fund attorney fee procurement reduction.`,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMatter = cases.find(c => c.id === formData.matterId);

    const savedRecord = {
      id: lien?.id || `LIEN-${Date.now()}`,
      matterId: formData.matterId,
      matterTitle: selectedMatter?.matterTitle || lien?.matterTitle || 'Personal Injury Matter',
      lienHolder: formData.lienHolder,
      lienType: formData.lienType,
      originalLienAmount: Number(formData.originalLienAmount),
      verifiedLienAmount: Number(formData.verifiedLienAmount),
      reductionRequested: Number(formData.reductionRequested),
      negotiatedAmount: Number(formData.negotiatedAmount),
      finalPayoffAmount: Number(formData.finalPayoffAmount),
      confirmationStatus: formData.confirmationStatus,
      supportingDocuments: formData.supportingDocuments,
      notes: formData.notes,
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lien ? 'Edit Healthcare Lien & Payoff' : 'Register New Medical / Subrogation Lien'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <Select
            label="Lien Classification Category *"
            value={formData.lienType}
            onChange={(e) => setFormData({ ...formData, lienType: e.target.value })}
            required
            options={[
              { value: 'Medicare Secondary Payer (Super-Lien)', label: 'Medicare Secondary Payer (CMS Super-Lien)' },
              { value: 'State Medicaid Statutory Lien (UCA § 26B-3-1004)', label: 'State Medicaid (Utah DHHS § 26B-3-1004)' },
              { value: 'Health Insurance / ERISA Subrogation', label: 'Health Insurance / ERISA Subrogation (e.g. BCBS/SelectHealth)' },
              { value: 'Hospital Statutory Lien (Utah Code Ann. § 38-7-1)', label: 'Hospital Statutory Lien (Utah Code § 38-7-1)' },
              { value: 'Medical Provider Lien / Letter of Protection (LOP)', label: 'Medical Provider Lien / Letter of Protection (LOP)' },
            ]}
          />
        </div>

        <Input
          label="Lien Holder Entity / Subrogation Agency *"
          value={formData.lienHolder}
          placeholder="e.g. Centers for Medicare & Medicaid Services (CMS) or Regence BCBS"
          onChange={(e) => setFormData({ ...formData, lienHolder: e.target.value })}
          required
        />

        {/* Amounts & Calculations Grid */}
        <div className="bg-[#F5F0E5]/60 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
              Lien Financial Audit &amp; Reduction Modeling
            </h4>
            <button
              type="button"
              onClick={applyCommonFundReduction}
              className="text-[11px] font-bold text-[#A4432B] hover:underline"
            >
              + Quick Apply 33.33% Utah Common Fund Reduction
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Original Asserted Amount ($) *"
              type="number"
              step="0.01"
              value={formData.originalLienAmount}
              onChange={(e) => setFormData({ ...formData, originalLienAmount: e.target.value })}
              required
            />

            <Input
              label="Verified Unrelated-Audit ($) *"
              type="number"
              step="0.01"
              value={formData.verifiedLienAmount}
              onChange={(e) => setFormData({ ...formData, verifiedLienAmount: e.target.value })}
              required
            />

            <Input
              label="Reduction Concession Requested ($)"
              type="number"
              step="0.01"
              value={formData.reductionRequested}
              onChange={(e) => setFormData({ ...formData, reductionRequested: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D9D6CF]">
            <Input
              label="Negotiated Amount ($)"
              type="number"
              step="0.01"
              value={formData.negotiatedAmount}
              onChange={(e) => setFormData({ ...formData, negotiatedAmount: e.target.value })}
            />

            <Input
              label="Final Written Payoff Amount ($) *"
              type="number"
              step="0.01"
              value={formData.finalPayoffAmount}
              onChange={(e) => setFormData({ ...formData, finalPayoffAmount: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Confirmation &amp; Payoff Status *"
            value={formData.confirmationStatus}
            onChange={(e) => setFormData({ ...formData, confirmationStatus: e.target.value })}
            options={[
              { value: 'Written Payoff Confirmed', label: 'Written Payoff Confirmed' },
              { value: 'Reduction Request Submitted (Under Review)', label: 'Reduction Request Submitted (Under Review)' },
              { value: 'Initial Notice Received (Awaiting Claims Detail)', label: 'Initial Notice Received (Awaiting Claims Detail)' },
              { value: 'CMS Final Demand Pending (Medicare)', label: 'CMS Final Demand Pending (Medicare)' },
              { value: 'Paid & Satisfaction Released', label: 'Paid & Satisfaction Released' },
            ]}
          />

          <Input
            label="Supporting Payoff Documents"
            value={formData.supportingDocuments}
            placeholder="e.g. Formal Payoff Letter & Executed Release"
            onChange={(e) => setFormData({ ...formData, supportingDocuments: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Negotiation &amp; Statutory Notes
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Precedent cited, statutory limitations under Utah Code, adjuster correspondence..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {lien ? 'Save Lien Changes' : 'Register Lien'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

