import React, { useState, useEffect } from 'react';
import { useMatters } from '../../../context/MatterContext';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PRACTICE_AREAS } from '../../../data/practiceAreas';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';

export function MatterForm({ initialData = null, defaultClientId = null, onSuccess, onCancel }) {
  const { addMatter, updateMatter } = useMatters();
  const { clients, refreshClients } = useClients();
  const { allUsers } = useAuth();
  const { addToast } = useToast();

  // Lazy load clients if empty when opening the new matter form
  useEffect(() => {
    if (clients.length === 0) {
      refreshClients();
    }
  }, [clients.length, refreshClients]);

  const attorneys = allUsers.filter(u => u.role === 'attorney' || u.role === 'super_admin');
  const staff = allUsers.filter(u => u.role === 'paralegal' || u.role === 'billing');

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const defaultAttorney = attorneys.find(a => validUuidPattern.test(a.id)) || attorneys[0];

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    clientId: initialData?.clientId || defaultClientId || clients[0]?.id || '',
    practiceAreaId: initialData?.practiceAreaId || PRACTICE_AREAS[0]?.id || '',
    responsibleAttorneyId: initialData?.responsibleAttorneyId || defaultAttorney?.id || '8640f71a-0142-42f4-a4c0-732537dcd9b7',
    assignedStaffId: initialData?.assignedStaffIds?.[0] || staff[0]?.id || 'a0b374d7-a8b4-4d42-b4c1-909094f4598b',
    status: initialData?.status || 'Active',
    billingType: initialData?.billingType || 'Hourly',
    hourlyRate: initialData?.hourlyRate || 500,
    flatFeeAmount: initialData?.flatFeeAmount || 25000,
    budget: initialData?.budget || 50000,
    courtName: initialData?.courtName || 'Utah Third Judicial District Court - Salt Lake City',
    judge: initialData?.judge || 'Hon. Elizabeth A. Hruby-Mills',
    nextCourtDate: initialData?.nextCourtDate || '',
    statuteOfLimitations: initialData?.statuteOfLimitations || '',
    description: initialData?.description || '',
    isEthicalWallEnabled: initialData?.isEthicalWallEnabled || false,
    ethicalWallExcludedRole: initialData?.ethicalWallExcludedRole || 'Paralegal Staff',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Matter Name / Caption is required';
    if (!formData.clientId) newErrors.clientId = 'Please select a Client';
    if (!formData.practiceAreaId) newErrors.practiceAreaId = 'Please select a Practice Area';
    if (!formData.responsibleAttorneyId) newErrors.responsibleAttorneyId = 'Responsible Attorney is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId || c.clientNumber === formData.clientId);
      const selectedPracticeArea = PRACTICE_AREAS.find(pa => pa.id === formData.practiceAreaId || pa.legacyId === formData.practiceAreaId);
      
      // Resolve valid Attorney UUID strictly matching attorney or super_admin
      let attorneyUuid = formData.responsibleAttorneyId;
      if (!validUuidPattern.test(attorneyUuid)) {
        const found = attorneys.find(a => (a.id === attorneyUuid || a.legacyId === attorneyUuid) && validUuidPattern.test(a.id));
        attorneyUuid = found?.id || '8640f71a-0142-42f4-a4c0-732537dcd9b7'; // Thomas Bludworth, Esq.
      }

      // Resolve valid Staff UUID
      let staffUuid = formData.assignedStaffId;
      if (staffUuid && !validUuidPattern.test(staffUuid)) {
        const found = staff.find(s => (s.id === staffUuid || s.legacyId === staffUuid) && validUuidPattern.test(s.id));
        staffUuid = found?.id || 'a0b374d7-a8b4-4d42-b4c1-909094f4598b'; // Marcus Vance
      }

      const payload = {
        ...formData,
        clientId: selectedClient?.id || formData.clientId,
        practiceAreaId: selectedPracticeArea?.id || 'pa-civ',
        responsibleAttorneyId: attorneyUuid,
        assignedStaffId: staffUuid,
        hourlyRate: formData.billingType === 'Hourly' ? Number(formData.hourlyRate || 350) : null,
        flatFeeAmount: formData.billingType === 'Flat Fee' ? Number(formData.flatFeeAmount || 25000) : null,
        budget: Number(formData.budget) || 25000,
      };

      if (initialData?.id) {
        const updated = await updateMatter(initialData.id, payload);
        addToast(`Matter "${formData.title}" successfully updated.`, 'success');
        if (onSuccess) onSuccess(updated || initialData);
      } else {
        const created = await addMatter(payload);
        addToast(`Matter "${formData.title}" created (${created.matterNumber || created.id}).`, 'success');
        if (onSuccess) onSuccess(created);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to save matter record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Matter Caption / Name"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Wasatch Mountain Logistics v. Interstate Freightlines Inc."
            error={errors.title}
          />
        </div>

        <div>
          <Select
            label="Client Entity"
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))}
            error={errors.clientId}
          />
        </div>

        <div>
          <Select
            label="Practice Area (9 Confirmed)"
            required
            value={formData.practiceAreaId}
            onChange={(e) => setFormData({ ...formData, practiceAreaId: e.target.value })}
            options={PRACTICE_AREAS.map(pa => ({ value: pa.id, label: pa.name }))}
            error={errors.practiceAreaId}
          />
        </div>

        <div>
          <Select
            label="Responsible Attorney"
            required
            value={formData.responsibleAttorneyId}
            onChange={(e) => setFormData({ ...formData, responsibleAttorneyId: e.target.value })}
            options={attorneys.map(a => ({ value: a.id, label: `${a.name} (${a.title})` }))}
            error={errors.responsibleAttorneyId}
          />
        </div>

        <div>
          <Select
            label="Assigned Paralegal / Staff"
            value={formData.assignedStaffId}
            onChange={(e) => setFormData({ ...formData, assignedStaffId: e.target.value })}
            options={staff.map(s => ({ value: s.id, label: `${s.name} (${s.title})` }))}
          />
        </div>

        <div>
          <Select
            label="Matter Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Active', label: 'Active (Pre-Trial / Active)' },
              { value: 'In Discovery', label: 'In Discovery' },
              { value: 'Trial Prep', label: 'Trial Preparation' },
              { value: 'On Hold', label: 'On Hold / Stay of Proceedings' },
              { value: 'Concluded', label: 'Concluded / Closed' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Billing Type"
            value={formData.billingType}
            onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
            options={[
              { value: 'Hourly', label: 'Hourly Rate Billing' },
              { value: 'Flat Fee', label: 'Flat-Fee Arrangement' },
              { value: 'Contingency', label: 'Contingency Fee Representation' },
            ]}
          />
        </div>

        {formData.billingType === 'Hourly' ? (
          <div>
            <Input
              label="Standard Hourly Rate ($/hr)"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
          </div>
        ) : formData.billingType === 'Flat Fee' ? (
          <div>
            <Input
              label="Agreed Flat Fee Amount ($)"
              type="number"
              value={formData.flatFeeAmount}
              onChange={(e) => setFormData({ ...formData, flatFeeAmount: e.target.value })}
            />
          </div>
        ) : (
          <div>
            <Input
              label="Estimated Recovery Budget ($)"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>
        )}

        <div>
          <Input
            label="Matter Budget ($)"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Court / Jurisdiction Forum"
            value={formData.courtName}
            onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
            placeholder="e.g. Utah Third District Court"
          />
        </div>

        <div>
          <Input
            label="Presiding Judge / Magistrate"
            value={formData.judge}
            onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
            placeholder="e.g. Hon. Elizabeth A. Hruby-Mills"
          />
        </div>

        <div>
          <DatePicker
            label="Next Court Hearing Date"
            value={formData.nextCourtDate}
            onChange={(val) => setFormData({ ...formData, nextCourtDate: val })}
          />
        </div>

        <div>
          <DatePicker
            label="Statute of Limitations / Key Deadline"
            value={formData.statuteOfLimitations}
            onChange={(val) => setFormData({ ...formData, statuteOfLimitations: val })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase mb-1">
            Matter Scope &amp; Case Summary
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed factual synopsis, claims asserted, discovery protocols, or settlement guidelines..."
            className="w-full text-sm p-3 rounded border border-[#D9D6CF] bg-white text-[#202A35] placeholder-[#667085]/60 focus:outline-none focus:border-[#06244B]"
          />
        </div>

        {/* Ethical Wall / Information Barrier (SBO-04) */}
        <div className="sm:col-span-2 p-3 bg-red-50/50 border border-red-200 rounded space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEthicalWallEnabled}
              onChange={(e) => setFormData({ ...formData, isEthicalWallEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <span className="font-bold text-xs text-red-950">
              Enforce Ethical Wall / Confidential Information Barrier (Utah RPC 1.10)
            </span>
          </label>
          <p className="text-[11px] text-red-900 leading-relaxed">
            Restricts document access and time logging exclusively to the assigned attorney and authorized staff to prevent imputed conflicts of interest.
          </p>
          {formData.isEthicalWallEnabled && (
            <div className="pt-2 border-t border-red-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-red-950 uppercase mb-1">
                  Screened Personnel Category
                </label>
                <select
                  value={formData.ethicalWallExcludedRole}
                  onChange={(e) => setFormData({ ...formData, ethicalWallExcludedRole: e.target.value })}
                  className="w-full text-xs p-1.5 rounded border border-red-300 bg-white"
                >
                  <option value="Non-Assigned Attorneys">Screen All Non-Assigned Attorneys</option>
                  <option value="Paralegal Staff">Screen Paralegal Staff</option>
                  <option value="All External Users">Strict Confidential Lock (Primary Attorney Only)</option>
                </select>
              </div>
              <div className="text-[11px] text-red-800 flex items-center">
                <span>Access log will record all view attempts for mandatory bar ethics compliance.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9D6CF]">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm">
          {initialData?.id ? 'Save Matter Changes' : 'Open Matter Record'}
        </Button>
      </div>
    </form>
  );
}

