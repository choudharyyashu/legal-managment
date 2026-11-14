import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function DamagesModal({ isOpen, onClose, onSave, damagesRecord, cases = [], defaultCaseId = '' }) {
  const [formData, setFormData] = useState({
    matterId: '',
    bodyArea: 'Cervical Spine',
    category: 'Spinal / Discogenic',
    description: '',
    severity: 'Moderate to Severe',
    preExistingConditions: '',
    functionalLimitations: '',
    employer: '',
    jobTitle: '',
    hourlyRate: 35.0,
    daysMissed: 20,
    wageVerificationStatus: 'Verified by HR Letter & W-2 Paystubs',
    medicalEvidenceDocument: '',
    medicalFacility: '',
    medicalFinding: '',
    damagesNotes: '',
  });

  useEffect(() => {
    if (damagesRecord) {
      const primaryInjury = damagesRecord.injuries?.[0] || {};
      const primaryEvidence = damagesRecord.supportingMedicalEvidence?.[0] || {};

      setFormData({
        matterId: damagesRecord.matterId || defaultCaseId || cases[0]?.id || '',
        bodyArea: primaryInjury.bodyArea || 'Cervical Spine',
        category: primaryInjury.category || 'Spinal / Discogenic',
        description: primaryInjury.description || '',
        severity: primaryInjury.severity || 'Moderate to Severe',
        preExistingConditions: damagesRecord.preExistingConditions || '',
        functionalLimitations: damagesRecord.functionalLimitations || '',
        employer: damagesRecord.employment?.employer || '',
        jobTitle: damagesRecord.employment?.jobTitle || '',
        hourlyRate: damagesRecord.employment?.hourlyRate || 35.0,
        daysMissed: damagesRecord.employment?.daysMissed || 20,
        wageVerificationStatus: damagesRecord.employment?.wageVerificationStatus || 'Verified by HR Letter & W-2 Paystubs',
        medicalEvidenceDocument: primaryEvidence.document || '',
        medicalFacility: primaryEvidence.facility || '',
        medicalFinding: primaryEvidence.finding || '',
        damagesNotes: damagesRecord.damagesNotes || '',
      });
    } else {
      setFormData({
        matterId: defaultCaseId || cases[0]?.id || '',
        bodyArea: 'Cervical Spine',
        category: 'Spinal / Discogenic',
        description: '',
        severity: 'Moderate to Severe',
        preExistingConditions: 'None reported. Asymptomatic prior to collision.',
        functionalLimitations: 'Restricted from lifting over 15 lbs. Inability to sit for prolonged periods.',
        employer: '',
        jobTitle: '',
        hourlyRate: 35.0,
        daysMissed: 15,
        wageVerificationStatus: 'Requested from Employer',
        medicalEvidenceDocument: '',
        medicalFacility: '',
        medicalFinding: '',
        damagesNotes: '',
      });
    }
  }, [damagesRecord, cases, defaultCaseId, isOpen]);

  const calculatedLostWages = Number(formData.hourlyRate || 0) * 8 * Number(formData.daysMissed || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMatter = cases.find(c => c.id === formData.matterId);

    const savedRecord = {
      id: damagesRecord?.id || `DMG-${Date.now()}`,
      matterId: formData.matterId,
      matterTitle: selectedMatter?.matterTitle || damagesRecord?.matterTitle || 'Personal Injury Matter',
      injuries: [
        {
          bodyArea: formData.bodyArea,
          category: formData.category,
          description: formData.description,
          severity: formData.severity,
        },
        ...(damagesRecord?.injuries?.slice(1) || []),
      ],
      preExistingConditions: formData.preExistingConditions,
      functionalLimitations: formData.functionalLimitations,
      employment: {
        employer: formData.employer,
        jobTitle: formData.jobTitle,
        hourlyRate: Number(formData.hourlyRate),
        annualSalary: Number(formData.hourlyRate) * 2080,
        daysMissed: Number(formData.daysMissed),
        totalLostWages: calculatedLostWages,
        wageVerificationStatus: formData.wageVerificationStatus,
      },
      supportingMedicalEvidence: formData.medicalEvidenceDocument
        ? [
            {
              document: formData.medicalEvidenceDocument,
              facility: formData.medicalFacility,
              date: new Date().toISOString().split('T')[0],
              finding: formData.medicalFinding,
            },
            ...(damagesRecord?.supportingMedicalEvidence?.slice(1) || []),
          ]
        : damagesRecord?.supportingMedicalEvidence || [],
      damagesNotes: formData.damagesNotes,
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={damagesRecord ? 'Edit Injury & Damages Profile' : 'Add Injury & Economic Damages Profile'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Matter & Injury Category */}
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

          <Select
            label="Anatomical Body Area *"
            value={formData.bodyArea}
            onChange={(e) => setFormData({ ...formData, bodyArea: e.target.value })}
            required
            options={[
              { value: 'Cervical Spine (Neck)', label: 'Cervical Spine (Neck)' },
              { value: 'Lumbar Spine (Lower Back)', label: 'Lumbar Spine (Lower Back)' },
              { value: 'Thoracic Spine (Mid-Back)', label: 'Thoracic Spine (Mid-Back)' },
              { value: 'Head & Traumatic Brain Injury (TBI)', label: 'Head & TBI / Concussion' },
              { value: 'Left Knee (Meniscus / ACL)', label: 'Left Knee (Meniscus / ACL)' },
              { value: 'Right Knee', label: 'Right Knee' },
              { value: 'Right Shoulder (Rotator Cuff)', label: 'Right Shoulder (Rotator Cuff)' },
              { value: 'Left Shoulder', label: 'Left Shoulder' },
              { value: 'Upper Extremity / Arm / Wrist', label: 'Upper Extremity / Arm / Wrist' },
              { value: 'Chest / Sternum / Ribs', label: 'Chest / Sternum / Ribs' },
              { value: 'Facial Trauma / Dental', label: 'Facial Trauma / Dental' },
              { value: 'Psychological / PTSD', label: 'Psychological / PTSD' },
            ]}
          />

          <Select
            label="Injury Severity Classification"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            options={[
              { value: 'Mild (Sprain/Strain)', label: 'Mild (Sprain/Strain)' },
              { value: 'Moderate (Tear / Non-Surgical Disc)', label: 'Moderate (Tear / Non-Surgical Disc)' },
              { value: 'Moderate to Severe', label: 'Moderate to Severe' },
              { value: 'Severe (Surgical Intervention Required)', label: 'Severe (Surgical Intervention Required)' },
              { value: 'Permanent Catastrophic Disability', label: 'Permanent Catastrophic Disability' },
            ]}
          />
        </div>

        {/* Injury Description */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Specific Injury &amp; Diagnostic Pathology *
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Posterior disc extrusion C5-C6 with nerve root impingement, causing radiating paresthesia into left forearm..."
            className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
            required
          />
        </div>

        {/* Pre-existing Conditions & Limitations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
              Pre-Existing Medical History (Eggshell Doctrine)
            </label>
            <textarea
              rows={2}
              value={formData.preExistingConditions}
              onChange={(e) => setFormData({ ...formData, preExistingConditions: e.target.value })}
              placeholder="e.g. Prior asymptomatic lumbar degenerative changes; no active treatment for 3+ years prior..."
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
              Functional Limitations &amp; Impairments *
            </label>
            <textarea
              rows={2}
              value={formData.functionalLimitations}
              onChange={(e) => setFormData({ ...formData, functionalLimitations: e.target.value })}
              placeholder="e.g. Restricted from lifting > 15 lbs; unable to sit at computer workstation beyond 30 min..."
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
              required
            />
          </div>
        </div>

        {/* Employment & Lost Wages Ledger */}
        <div className="bg-[#F5F0E5]/50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
              Employment &amp; Economic Wage Loss Calculation
            </h4>
            <span className="text-xs font-bold text-[#A4432B] bg-[#A4432B]/10 px-2 py-0.5 rounded">
              Calculated Lost Wages: ${calculatedLostWages.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Employer Name"
              value={formData.employer}
              placeholder="e.g. Intermountain Biopharma"
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
            />
            <Input
              label="Job Title / Role"
              value={formData.jobTitle}
              placeholder="e.g. Clinical Research Coordinator"
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
            <Input
              label="Hourly Wage Rate ($)"
              type="number"
              step="0.5"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
            <Input
              label="Work Days Missed"
              type="number"
              value={formData.daysMissed}
              onChange={(e) => setFormData({ ...formData, daysMissed: e.target.value })}
            />
          </div>

          <Select
            label="Wage Verification Status"
            value={formData.wageVerificationStatus}
            onChange={(e) => setFormData({ ...formData, wageVerificationStatus: e.target.value })}
            options={[
              { value: 'Verified by HR Letter & W-2 Paystubs', label: 'Verified by HR Letter & W-2 Paystubs' },
              { value: 'Self-Employed 1099 / Schedule C Tax Returns Verified', label: 'Self-Employed 1099 / Schedule C Tax Returns Verified' },
              { value: 'Requested - Awaiting HR Payroll Department', label: 'Requested - Awaiting HR Payroll Department' },
              { value: 'Client Self-Reported (Unverified)', label: 'Client Self-Reported (Unverified)' },
            ]}
          />
        </div>

        {/* Supporting Diagnostic Evidence */}
        <div className="bg-slate-50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
            Supporting Objective Diagnostic Imaging / Report
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Diagnostic Document / Study"
              value={formData.medicalEvidenceDocument}
              placeholder="e.g. 3.0T Cervical MRI Study"
              onChange={(e) => setFormData({ ...formData, medicalEvidenceDocument: e.target.value })}
            />
            <Input
              label="Medical Imaging Facility"
              value={formData.medicalFacility}
              placeholder="e.g. Wasatch Imaging Center"
              onChange={(e) => setFormData({ ...formData, medicalFacility: e.target.value })}
            />
          </div>
          <Input
            label="Radiologist / Surgeon Objective Finding"
            value={formData.medicalFinding}
            placeholder="e.g. 3.4mm focal disc extrusion C5-C6 with nerve root impingement"
            onChange={(e) => setFormData({ ...formData, medicalFinding: e.target.value })}
          />
        </div>

        {/* General Damages Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Attorney Case Damages Strategy Notes
          </label>
          <textarea
            rows={2}
            value={formData.damagesNotes}
            onChange={(e) => setFormData({ ...formData, damagesNotes: e.target.value })}
            placeholder="Upcoming surgical consultations, future medical care projection, pain multiplier recommendations..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {damagesRecord ? 'Save Changes' : 'Record Damages'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

