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
import { parsePIIntakeData, getCleanMatterSummary } from '../../intake/utils/piIntakeHelper';
import { piService } from '../../../services/piService';
import { AlertCircle } from 'lucide-react';

export function MatterForm({ initialData = null, defaultClientId = null, initialIntake = null, onSuccess, onCancel }) {
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

  const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const defaultAttorney = attorneys.find(a => validUuidPattern.test(a.id)) || attorneys[0];
  const defaultStaff = staff.find(s => validUuidPattern.test(s.id)) || staff[0];

  // Resolve practice area and intake-carried data
  const intakePaId = initialIntake?.practiceAreaId;
  const isIntakePI = intakePaId === 'pa-pi' || intakePaId === 'pa-7' || initialIntake?.practiceAreaName?.toLowerCase().includes('personal injury');
  const initialPracticeAreaId = initialData?.practiceAreaId || (isIntakePI ? 'pa-pi' : (intakePaId || PRACTICE_AREAS[0]?.id || 'pa-civ'));

  const intakePiData = initialIntake ? parsePIIntakeData(initialIntake.matterSummary) : {};

  let initialTitle = initialData?.title || '';
  if (!initialTitle && initialIntake) {
    const adverse = initialIntake.adverseParties || intakePiData.opposingParties || 'Adverse Parties';
    initialTitle = `${initialIntake.prospectiveClient} v. ${adverse}`;
  }

  const initialDescription = initialData?.description || getCleanMatterSummary(initialIntake?.matterSummary) || '';

  // In Utah, general personal injury statute of limitations is 4 years from the accident date (Utah Code § 78B-2-307)
  let calculatedSOL = initialData?.statuteOfLimitations || '';
  if (!calculatedSOL && intakePiData.accidentDate) {
    try {
      const accDate = new Date(intakePiData.accidentDate);
      if (!isNaN(accDate.getTime())) {
        accDate.setFullYear(accDate.getFullYear() + 4);
        calculatedSOL = accDate.toISOString().split('T')[0];
      }
    } catch {}
  }

  const isPI = initialPracticeAreaId === 'pa-pi' || initialPracticeAreaId === 'pa-7';

  const [formData, setFormData] = useState({
    title: initialTitle,
    clientId: initialData?.clientId || defaultClientId || clients[0]?.id || '',
    practiceAreaId: initialPracticeAreaId,
    responsibleAttorneyId: initialData?.responsibleAttorneyId || defaultAttorney?.id || '',
    assignedStaffId: initialData?.assignedStaffIds?.[0] || defaultStaff?.id || '',
    status: initialData?.status || 'Active',
    billingType: initialData?.billingType || (isPI ? 'Contingency' : 'Hourly'),
    hourlyRate: initialData?.hourlyRate || (isPI ? '' : ''),
    flatFeeAmount: initialData?.flatFeeAmount || '',
    contingencyPercentage: initialData?.contingencyPercentage || (isPI ? '33.33' : ''),
    budget: initialData?.budget || '',
    courtName: initialData?.courtName || '',
    judge: initialData?.judge || '',
    nextCourtDate: initialData?.nextCourtDate || '',
    statuteOfLimitations: calculatedSOL,
    description: initialDescription,
    isEthicalWallEnabled: initialData?.isEthicalWallEnabled || false,
    ethicalWallExcludedRole: initialData?.ethicalWallExcludedRole || 'Paralegal Staff',
  });

  const [paChangeWarning, setPaChangeWarning] = useState(null);
  const [errors, setErrors] = useState({});

  const handlePracticeAreaChange = (newPaId) => {
    const newPa = PRACTICE_AREAS.find(p => p.id === newPaId || p.legacyId === newPaId);
    const isNowPI = newPaId === 'pa-pi' || newPaId === 'pa-7';

    if (initialIntake && newPaId !== initialPracticeAreaId) {
      const origPa = PRACTICE_AREAS.find(p => p.id === initialPracticeAreaId || p.legacyId === initialPracticeAreaId);
      setPaChangeWarning(`Practice Area changed from "${origPa?.name || 'Intake Practice Area'}" to "${newPa?.name}". Notice: This modifies required litigation workflow stages, Utah bar compliance checklists, and standard billing arrangements.`);
    } else {
      setPaChangeWarning(null);
    }

    setFormData(prev => ({
      ...prev,
      practiceAreaId: newPaId,
      billingType: isNowPI ? 'Contingency' : (prev.billingType === 'Contingency' ? 'Hourly' : prev.billingType),
      contingencyPercentage: isNowPI ? (prev.contingencyPercentage || '33.33') : prev.contingencyPercentage,
    }));
  };

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
        attorneyUuid = found?.id || defaultAttorney?.id;
      }

      // Resolve valid Staff UUID
      let staffUuid = formData.assignedStaffId;
      if (staffUuid && !validUuidPattern.test(staffUuid)) {
        const found = staff.find(s => (s.id === staffUuid || s.legacyId === staffUuid) && validUuidPattern.test(s.id));
        staffUuid = found?.id || defaultStaff?.id;
      }

      const payload = {
        ...formData,
        clientId: selectedClient?.id || formData.clientId,
        practiceAreaId: selectedPracticeArea?.id || 'pa-civ',
        responsibleAttorneyId: attorneyUuid,
        assignedStaffId: staffUuid || null,
        hourlyRate: formData.billingType === 'Hourly' ? (formData.hourlyRate ? Number(formData.hourlyRate) : null) : null,
        flatFeeAmount: formData.billingType === 'Flat Fee' ? (formData.flatFeeAmount ? Number(formData.flatFeeAmount) : null) : null,
        contingencyPercentage: formData.billingType === 'Contingency' ? (formData.contingencyPercentage ? Number(formData.contingencyPercentage) : 33.33) : null,
        budget: formData.budget ? Number(formData.budget) : 0,
        courtName: formData.courtName?.trim() || null,
        judge: formData.judge?.trim() || null,
      };

      if (initialData?.id) {
        const updated = await updateMatter(initialData.id, payload);
        addToast(`Matter "${formData.title}" successfully updated.`, 'success');
        if (onSuccess) onSuccess(updated || initialData);
      } else {
        const created = await addMatter(payload);
        addToast(`Matter "${formData.title}" created (${created.matterNumber || created.id}).`, 'success');

        // Requirement 7: First Document Automation - Template 096 Letter of Representation
        const createdIsPI = selectedPracticeArea?.id === 'pa-pi' || selectedPracticeArea?.code === 'PI';
        if (createdIsPI && (intakePiData.accidentDate || intakePiData.insuranceCompany || initialIntake?.adverseParties)) {
          try {
            await piService.saveIncident(created.id, {
              incidentDate: intakePiData.accidentDate || undefined,
              accidentType: intakePiData.accidentType || 'Motor Vehicle Collision',
              incidentLocation: intakePiData.accidentLocation || undefined,
              description: intakePiData.incidentDescription || payload.description,
              notes: intakePiData.additionalNotes || undefined,
              insurancePolicy: intakePiData.insuranceCompany ? {
                coverageType: 'Liability',
                insuranceCompany: intakePiData.insuranceCompany,
                insuredName: intakePiData.insuredName || undefined,
                claimNumber: intakePiData.claimNumber || undefined,
                policyNumber: intakePiData.policyNumber || undefined,
                adjusterName: intakePiData.adjusterName || undefined,
                adjusterPhone: intakePiData.adjusterPhone || undefined,
                adjusterEmail: intakePiData.adjusterEmail || undefined,
                status: 'Active',
              } : undefined,
            });
            addToast('Template 096 Letter of Representation draft generated & attorney review task created.', 'success');
          } catch (piErr) {
            console.warn('PI Incident Auto-Draft notification:', piErr?.message);
          }
        }

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

        {paChangeWarning && (
          <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start justify-between gap-2">
            <div>
              <span className="font-bold block">Practice Area Alteration Warning:</span>
              {paChangeWarning}
            </div>
            <button
              type="button"
              onClick={() => setPaChangeWarning(null)}
              className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-sm leading-none"
            >
              &times;
            </button>
          </div>
        )}

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
            onChange={(e) => handlePracticeAreaChange(e.target.value)}
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
              placeholder="e.g. 350"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
          </div>
        ) : formData.billingType === 'Flat Fee' ? (
          <div>
            <Input
              label="Agreed Flat Fee Amount ($)"
              type="number"
              placeholder="e.g. 25000"
              value={formData.flatFeeAmount}
              onChange={(e) => setFormData({ ...formData, flatFeeAmount: e.target.value })}
            />
          </div>
        ) : (
          <div>
            <Input
              label="Contingency Fee Rate (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="33.33"
              value={formData.contingencyPercentage}
              onChange={(e) => setFormData({ ...formData, contingencyPercentage: e.target.value })}
              helperText="Standard contingency fee under Utah RPC 1.5(c)"
            />
          </div>
        )}

        <div>
          <Input
            label="Matter Budget ($)"
            type="number"
            placeholder="0"
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
            helperText={isPI && !formData.courtName ? 'Pre-litigation phase (court not yet assigned)' : ''}
          />
        </div>

        <div>
          <Input
            label="Presiding Judge / Magistrate"
            value={formData.judge}
            onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
            placeholder="e.g. Presiding Judge"
            helperText={isPI && !formData.judge ? 'Pre-litigation phase (judge not yet assigned)' : ''}
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

