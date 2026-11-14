import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function InsuranceModal({ isOpen, onClose, onSave, policy, cases = [], defaultCaseId = '' }) {
  const [formData, setFormData] = useState({
    matterId: '',
    insuranceCompany: '',
    insuranceType: '3rd Party Commercial Auto / Bodily Injury Liability',
    insuredName: '',
    policyNumber: '',
    policyLimits: '$100,000 / $300,000 Bodily Injury',
    adjusterName: '',
    adjusterPhone: '',
    adjusterEmail: '',
    claimNumber: '',
    pipCoverage: '$3,000 Statutory Utah PIP',
    medPayCoverage: 'None',
    umCoverage: 'None',
    uimCoverage: 'None',
    claimStatus: 'Active - Awaiting Demand',
    coverageNotes: '',
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        matterId: policy.matterId || '',
        insuranceCompany: policy.insuranceCompany || '',
        insuranceType: policy.insuranceType || '3rd Party Commercial Auto / Bodily Injury Liability',
        insuredName: policy.insuredName || '',
        policyNumber: policy.policyNumber || '',
        policyLimits: policy.policyLimits || '',
        adjusterName: policy.adjusterName || '',
        adjusterPhone: policy.adjusterPhone || '',
        adjusterEmail: policy.adjusterEmail || '',
        claimNumber: policy.claimNumber || '',
        pipCoverage: policy.pipCoverage || '',
        medPayCoverage: policy.medPayCoverage || '',
        umCoverage: policy.umCoverage || '',
        uimCoverage: policy.uimCoverage || '',
        claimStatus: policy.claimStatus || 'Active - Awaiting Demand',
        coverageNotes: policy.coverageNotes || '',
      });
    } else {
      const initialMatterId = (defaultCaseId && defaultCaseId !== 'ALL') ? defaultCaseId : (cases[0]?.id || '');
      setFormData({
        matterId: initialMatterId,
        insuranceCompany: '',
        insuranceType: '3rd Party Bodily Injury Liability',
        insuredName: '',
        policyNumber: '',
        policyLimits: '$100,000 / $300,000',
        adjusterName: '',
        adjusterPhone: '',
        adjusterEmail: '',
        claimNumber: '',
        pipCoverage: '$3,000 Utah Statutory Minimum',
        medPayCoverage: 'None',
        umCoverage: 'None',
        uimCoverage: 'None',
        claimStatus: 'Active - Awaiting Demand',
        coverageNotes: '',
      });
    }
  }, [policy, cases, defaultCaseId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedPolicy = {
      id: policy?.id || `INS-${Date.now()}`,
      matterId: formData.matterId,
      insuranceCompany: formData.insuranceCompany,
      insuranceType: formData.insuranceType,
      insuredName: formData.insuredName,
      policyNumber: formData.policyNumber,
      policyLimits: formData.policyLimits,
      adjusterName: formData.adjusterName,
      adjusterPhone: formData.adjusterPhone,
      adjusterEmail: formData.adjusterEmail,
      claimNumber: formData.claimNumber,
      pipCoverage: formData.pipCoverage,
      medPayCoverage: formData.medPayCoverage,
      umCoverage: formData.umCoverage,
      uimCoverage: formData.uimCoverage,
      claimStatus: formData.claimStatus,
      coverageNotes: formData.coverageNotes,
    };

    onSave(savedPolicy);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy ? 'Edit Insurance Policy & Coverage' : 'Add Insurance Carrier Policy'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Matter & Carrier */}
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
            label="Insurance Company / Carrier *"
            value={formData.insuranceCompany}
            placeholder="e.g. State Farm, Travelers, Progressive"
            onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
            required
          />

          <Select
            label="Insurance Coverage Type *"
            value={formData.insuranceType}
            onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
            options={[
              { value: '3rd Party Bodily Injury Liability (Defendant)', label: '3rd Party Bodily Injury Liability (Defendant)' },
              { value: '3rd Party Commercial Auto / Fleet Policy', label: '3rd Party Commercial Auto / Fleet Policy' },
              { value: '1st Party Personal Injury Protection (PIP)', label: '1st Party PIP (Utah No-Fault)' },
              { value: '1st Party Underinsured Motorist (UIM)', label: '1st Party Underinsured Motorist (UIM)' },
              { value: '1st Party Uninsured Motorist (UM)', label: '1st Party Uninsured Motorist (UM)' },
              { value: 'Commercial General Liability (Premises)', label: 'Commercial General Liability (Premises)' },
              { value: 'Medical Payments (MedPay)', label: 'Medical Payments (MedPay)' },
              { value: 'Commercial Excess / Umbrella Liability', label: 'Commercial Excess / Umbrella' },
            ]}
          />
        </div>

        {/* Policy & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Named Insured Entity / Driver"
            value={formData.insuredName}
            placeholder="e.g. Interstate Freightlines Inc."
            onChange={(e) => setFormData({ ...formData, insuredName: e.target.value })}
          />

          <Input
            label="Policy Number"
            value={formData.policyNumber}
            placeholder="e.g. TRV-99418-01"
            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
          />

          <Input
            label="Applicable Policy Limits *"
            value={formData.policyLimits}
            placeholder="e.g. $1,000,000 CSL or $100k/$300k"
            onChange={(e) => setFormData({ ...formData, policyLimits: e.target.value })}
            required
          />
        </div>

        {/* Adjuster Details */}
        <div className="bg-[#F5F0E5]/50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
            Assigned Claims Adjuster Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Adjuster Full Name"
              value={formData.adjusterName}
              placeholder="e.g. Cynthia Vance"
              onChange={(e) => setFormData({ ...formData, adjusterName: e.target.value })}
            />
            <Input
              label="Adjuster Direct Phone"
              value={formData.adjusterPhone}
              placeholder="e.g. (800) 555-9201"
              onChange={(e) => setFormData({ ...formData, adjusterPhone: e.target.value })}
            />
            <Input
              label="Adjuster Email"
              type="email"
              value={formData.adjusterEmail}
              placeholder="e.g. cvance@carrier.com"
              onChange={(e) => setFormData({ ...formData, adjusterEmail: e.target.value })}
            />
            <Input
              label="Claim Reference Number *"
              value={formData.claimNumber}
              placeholder="e.g. CLM-2025-99812A"
              onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Utah Specific Coverage Endorsements */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="PIP Coverage / Exhaustion"
            value={formData.pipCoverage}
            placeholder="e.g. $10,000 Exhausted"
            onChange={(e) => setFormData({ ...formData, pipCoverage: e.target.value })}
          />
          <Input
            label="MedPay Coverage"
            value={formData.medPayCoverage}
            placeholder="e.g. $5,000"
            onChange={(e) => setFormData({ ...formData, medPayCoverage: e.target.value })}
          />
          <Input
            label="UM Coverage Limits"
            value={formData.umCoverage}
            placeholder="e.g. $250k / $500k"
            onChange={(e) => setFormData({ ...formData, umCoverage: e.target.value })}
          />
          <Input
            label="UIM Coverage Limits"
            value={formData.uimCoverage}
            placeholder="e.g. $250k / $500k"
            onChange={(e) => setFormData({ ...formData, uimCoverage: e.target.value })}
          />
        </div>

        {/* Claim Status & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Current Claim Status"
            value={formData.claimStatus}
            onChange={(e) => setFormData({ ...formData, claimStatus: e.target.value })}
            options={[
              { value: 'Active - Awaiting Demand', label: 'Active - Awaiting Demand' },
              { value: 'Demand Package Delivered (Awaiting Offer)', label: 'Demand Package Delivered (Awaiting Offer)' },
              { value: 'In Active Negotiation', label: 'In Active Negotiation' },
              { value: 'Tender of Policy Limits Offered', label: 'Tender of Policy Limits Offered' },
              { value: 'Reservation of Rights Issued', label: 'Reservation of Rights Issued' },
              { value: 'Liability Denied / Impasse', label: 'Liability Denied / Impasse' },
              { value: 'PIP Exhaustion Letter Issued', label: 'PIP Exhaustion Letter Issued' },
              { value: 'Settled & Released', label: 'Settled & Released' },
            ]}
          />

          <div className="sm:col-span-2">
            <Input
              label="Policy &amp; Coverage Analysis Notes"
              value={formData.coverageNotes}
              placeholder="e.g. Certified dec sheet requested under Utah Code § 31A-22-303..."
              onChange={(e) => setFormData({ ...formData, coverageNotes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {policy ? 'Save Policy Changes' : 'Add Policy'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

