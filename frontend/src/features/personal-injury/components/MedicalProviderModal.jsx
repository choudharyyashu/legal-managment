import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function MedicalProviderModal({ isOpen, onClose, onSave, provider, cases = [] }) {
  const [formData, setFormData] = useState({
    matterId: '',
    providerName: '',
    providerType: 'Orthopedic Surgery & Sports Medicine',
    treatmentStartDate: '',
    treatmentEndDate: 'Ongoing',
    treatmentStatus: 'Active Care',
    dateOfService: '',
    recordsStatus: 'Requested',
    authorizations: 'HIPAA Auth Signed (Active)',
    outstandingRecords: 'Itemized billing statement & imaging disc',
    treatmentNotes: '',
    originalBill: 5000.0,
    insurancePaid: 0.0,
    adjustments: 0.0,
    paymentStatus: 'Outstanding / Pending Settlement',
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        matterId: provider.matterId || cases[0]?.id || '',
        providerName: provider.providerName || '',
        providerType: provider.providerType || 'Orthopedic Surgery & Sports Medicine',
        treatmentStartDate: provider.treatmentStartDate || '',
        treatmentEndDate: provider.treatmentEndDate || 'Ongoing',
        treatmentStatus: provider.treatmentStatus || 'Active Care',
        dateOfService: provider.dateOfService || '',
        recordsStatus: provider.recordsStatus || 'Requested',
        authorizations: provider.authorizations || 'HIPAA Auth Signed (Active)',
        outstandingRecords: provider.outstandingRecords || '',
        treatmentNotes: provider.treatmentNotes || '',
        originalBill: provider.bills?.originalBill || 0.0,
        insurancePaid: provider.bills?.insurancePaid || 0.0,
        adjustments: provider.bills?.adjustments || 0.0,
        paymentStatus: provider.bills?.paymentStatus || 'Outstanding / Pending Settlement',
      });
    } else {
      setFormData({
        matterId: cases[0]?.id || '',
        providerName: '',
        providerType: 'Orthopedic Surgery & Sports Medicine',
        treatmentStartDate: new Date().toISOString().split('T')[0],
        treatmentEndDate: 'Ongoing',
        treatmentStatus: 'Active Care',
        dateOfService: 'Recent DOS',
        recordsStatus: 'Requested',
        authorizations: 'HIPAA Auth Signed (Active)',
        outstandingRecords: 'Awaiting certified medical records packet',
        treatmentNotes: '',
        originalBill: 4500.0,
        insurancePaid: 0.0,
        adjustments: 0.0,
        paymentStatus: 'Outstanding / Pending Settlement',
      });
    }
  }, [provider, cases, isOpen]);

  const outstandingBalance = Math.max(
    0,
    Number(formData.originalBill || 0) - Number(formData.insurancePaid || 0) - Number(formData.adjustments || 0)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedRecord = {
      id: provider?.id || `MED-${Date.now()}`,
      matterId: formData.matterId,
      providerName: formData.providerName,
      providerType: formData.providerType,
      treatmentStartDate: formData.treatmentStartDate,
      treatmentEndDate: formData.treatmentEndDate,
      treatmentStatus: formData.treatmentStatus,
      dateOfService: formData.dateOfService || `${formData.treatmentStartDate} to ${formData.treatmentEndDate}`,
      recordsStatus: formData.recordsStatus,
      authorizations: formData.authorizations,
      outstandingRecords: formData.outstandingRecords,
      treatmentNotes: formData.treatmentNotes,
      bills: {
        originalBill: Number(formData.originalBill),
        insurancePaid: Number(formData.insurancePaid),
        adjustments: Number(formData.adjustments),
        outstandingBalance,
        paymentStatus: formData.paymentStatus,
      },
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={provider ? 'Edit Medical Treatment & Billing Record' : 'Add Medical Provider & Treatment Record'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Matter & Provider */}
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
            label="Medical Provider / Facility *"
            value={formData.providerName}
            placeholder="e.g. Wasatch Orthopedic Specialists"
            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
            required
          />

          <Select
            label="Provider Practice Specialty *"
            value={formData.providerType}
            onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
            options={[
              { value: 'Emergency Hospital & Trauma Center', label: 'Emergency Hospital & Trauma Center' },
              { value: 'Orthopedic Surgery & Sports Medicine', label: 'Orthopedic Surgery & Sports Medicine' },
              { value: 'Interventional Physiatry & Pain Management', label: 'Interventional Physiatry & Pain Management' },
              { value: 'Physical Therapy & Rehabilitation', label: 'Physical Therapy & Rehabilitation' },
              { value: 'Chiropractic Care & Soft Tissue Therapy', label: 'Chiropractic Care & Soft Tissue' },
              { value: 'Neurology / Concussion & TBI Specialist', label: 'Neurology / Concussion & TBI' },
              { value: 'Diagnostic Radiology & MRI Imaging Center', label: 'Diagnostic Radiology & MRI' },
            ]}
          />
        </div>

        {/* Treatment Dates & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Treatment Start Date"
            type="date"
            value={formData.treatmentStartDate}
            onChange={(e) => setFormData({ ...formData, treatmentStartDate: e.target.value })}
          />

          <Input
            label="End Date or 'Ongoing'"
            value={formData.treatmentEndDate}
            placeholder="e.g. Ongoing"
            onChange={(e) => setFormData({ ...formData, treatmentEndDate: e.target.value })}
          />

          <Select
            label="Clinical Treatment Status"
            value={formData.treatmentStatus}
            onChange={(e) => setFormData({ ...formData, treatmentStatus: e.target.value })}
            options={[
              { value: 'Active Care', label: 'Active Care' },
              { value: 'Active Surgical Follow-up', label: 'Active Surgical Follow-up' },
              { value: 'MMI Reached (Maximum Medical Improvement)', label: 'MMI Reached (Max Improvement)' },
              { value: 'Completed Care', label: 'Completed Care' },
              { value: 'Care Interrupted / Gap in Treatment', label: 'Care Interrupted / Gap in Treatment' },
            ]}
          />

          <Select
            label="Medical Records Status *"
            value={formData.recordsStatus}
            onChange={(e) => setFormData({ ...formData, recordsStatus: e.target.value })}
            options={[
              { value: 'Received (Complete with Radiology)', label: 'Received (Complete with Radiology)' },
              { value: 'Received (Chart Notes Only)', label: 'Received (Chart Notes Only)' },
              { value: 'Requested (Pending Provider)', label: 'Requested (Pending Provider)' },
              { value: 'Deficient / Missing Billing Ledger', label: 'Deficient / Missing Billing Ledger' },
              { value: 'Awaiting Signed HIPAA Authorization', label: 'Awaiting Signed HIPAA Auth' },
            ]}
          />
        </div>

        {/* Authorizations & Outstanding Records */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Medical Authorizations Status"
            value={formData.authorizations}
            placeholder="e.g. HIPAA Auth Signed 2025-08-20"
            onChange={(e) => setFormData({ ...formData, authorizations: e.target.value })}
          />

          <Input
            label="Outstanding Records / Components"
            value={formData.outstandingRecords}
            placeholder="e.g. Operative report, MRI disc, final physical therapy note..."
            onChange={(e) => setFormData({ ...formData, outstandingRecords: e.target.value })}
          />
        </div>

        {/* Medical Bills Ledger Section */}
        <div className="bg-[#F5F0E5]/50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
              Medical Bill Financial Ledger
            </h4>
            <span className="text-xs font-bold text-[#A4432B] bg-[#A4432B]/10 px-2 py-0.5 rounded">
              Current Outstanding Balance: ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Original Billed Amount ($) *"
              type="number"
              step="0.01"
              value={formData.originalBill}
              onChange={(e) => setFormData({ ...formData, originalBill: e.target.value })}
              required
            />
            <Input
              label="Insurance / PIP Paid ($)"
              type="number"
              step="0.01"
              value={formData.insurancePaid}
              onChange={(e) => setFormData({ ...formData, insurancePaid: e.target.value })}
            />
            <Input
              label="Contractual Adjustments ($)"
              type="number"
              step="0.01"
              value={formData.adjustments}
              onChange={(e) => setFormData({ ...formData, adjustments: e.target.value })}
            />
            <Select
              label="Payment / Lien Status"
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              options={[
                { value: 'Outstanding / Pending Settlement', label: 'Outstanding / Pending Settlement' },
                { value: 'Hospital Statutory Lien Asserted', label: 'Hospital Statutory Lien Asserted' },
                { value: 'Private Health Lien Asserted', label: 'Private Health Lien Asserted' },
                { value: 'Paid in Full via 1st Party PIP', label: 'Paid in Full via 1st Party PIP' },
                { value: 'Letter of Protection (LOP) Filed', label: 'Letter of Protection (LOP) Filed' },
              ]}
            />
          </div>
        </div>

        {/* Treatment Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Clinical Summary &amp; Treatment Notes
          </label>
          <textarea
            rows={2}
            value={formData.treatmentNotes}
            onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
            placeholder="Key diagnostic impressions, injection dates, physical therapy progress, work restrictions..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {provider ? 'Save Provider Changes' : 'Record Provider'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

