import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

const formatDateInput = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const EMPTY_FORM = {
  matterId: '',
  matterTitle: '',
  incidentDate: '',
  incidentTime: '',
  incidentLocation: '',
  accidentType: '',
  description: '',
  mechanismOfInjury: '',
  policeAgency: '',
  reportNumber: '',
  investigatingOfficer: '',
  citationIssued: '',
  witnessName: '',
  witnessContact: '',
  witnessStatement: '',
  liabilityAssessment: '',
  plaintiffFaultPercentage: '',
  adverseFaultPercentage: '',
  comparativeFaultAnalysis: '',
  investigationNotes: '',
};

export function IncidentModal({ isOpen, onClose, onSave, incident, cases = [], defaultCaseId = '' }) {
  const [matterError, setMatterError] = useState('');
  const [faultError, setFaultError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    setMatterError('');
    setFaultError('');
    if (incident) {
      const pFault =
        incident.comparativeFault?.plaintiffPercentage ?? incident.plaintiffFaultPercentage;
      const aFault =
        incident.comparativeFault?.adversePercentage ?? incident.adverseFaultPercentage;

      setFormData({
        matterId: incident.matterId || '',
        matterTitle: incident.matterTitle || '',
        incidentDate: formatDateInput(incident.incidentDate),
        incidentTime: incident.incidentTime || '',
        incidentLocation: incident.incidentLocation || '',
        accidentType: incident.accidentType || '',
        description: incident.description || '',
        mechanismOfInjury: incident.mechanismOfInjury || '',
        policeAgency: incident.policeReportDetails?.agency ?? incident.policeAgency ?? '',
        reportNumber: incident.policeReportDetails?.reportNumber ?? incident.reportNumber ?? '',
        investigatingOfficer:
          incident.policeReportDetails?.investigatingOfficer ?? incident.investigatingOfficer ?? '',
        citationIssued: incident.policeReportDetails?.citationIssued || '',
        witnessName: incident.witnesses?.[0]?.name || '',
        witnessContact: incident.witnesses?.[0]?.phone || '',
        witnessStatement: incident.witnesses?.[0]?.statement || '',
        liabilityAssessment: incident.liabilityAssessment || '',
        plaintiffFaultPercentage: pFault !== null && pFault !== undefined ? String(pFault) : '',
        adverseFaultPercentage: aFault !== null && aFault !== undefined ? String(aFault) : '',
        comparativeFaultAnalysis: incident.comparativeFault?.legalAnalysis || '',
        investigationNotes: incident.investigationNotes ?? incident.notes ?? '',
      });
    } else {
      const isSingleMatter = Boolean(defaultCaseId && defaultCaseId !== 'ALL');
      const initialMatterId = isSingleMatter ? defaultCaseId : '';
      const defaultMatter = isSingleMatter ? cases.find((c) => c.id === initialMatterId) : null;
      setFormData({
        ...EMPTY_FORM,
        matterId: initialMatterId,
        matterTitle: defaultMatter?.matterTitle || defaultMatter?.title || '',
      });
    }
  }, [incident, cases, defaultCaseId, isOpen]);

  const handlePlaintiffFaultChange = (rawVal) => {
    setFaultError('');
    if (rawVal === '') {
      setFormData((prev) => ({
        ...prev,
        plaintiffFaultPercentage: '',
        adverseFaultPercentage: '',
      }));
      return;
    }
    const parsed = Number(rawVal);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(100, Math.max(0, Math.round(parsed * 100) / 100));
    const adverse = Math.round((100 - clamped) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      plaintiffFaultPercentage: String(clamped),
      adverseFaultPercentage: String(adverse),
    }));
  };

  const handleAdverseFaultChange = (rawVal) => {
    setFaultError('');
    if (rawVal === '') {
      setFormData((prev) => ({
        ...prev,
        plaintiffFaultPercentage: '',
        adverseFaultPercentage: '',
      }));
      return;
    }
    const parsed = Number(rawVal);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(100, Math.max(0, Math.round(parsed * 100) / 100));
    const plaintiff = Math.round((100 - clamped) * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      adverseFaultPercentage: String(clamped),
      plaintiffFaultPercentage: String(plaintiff),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.matterId || formData.matterId === 'ALL') {
      setMatterError('Please select an associated PI matter before saving.');
      return;
    }

    const hasPlaintiffFault = formData.plaintiffFaultPercentage !== '';
    const hasAdverseFault = formData.adverseFaultPercentage !== '';
    let plaintiffFaultNum = null;
    let adverseFaultNum = null;

    if (hasPlaintiffFault || hasAdverseFault) {
      plaintiffFaultNum = hasPlaintiffFault ? Number(formData.plaintiffFaultPercentage) : 100 - Number(formData.adverseFaultPercentage);
      adverseFaultNum = hasAdverseFault ? Number(formData.adverseFaultPercentage) : 100 - plaintiffFaultNum;

      if (
        Number.isNaN(plaintiffFaultNum) ||
        Number.isNaN(adverseFaultNum) ||
        plaintiffFaultNum < 0 ||
        plaintiffFaultNum > 100 ||
        adverseFaultNum < 0 ||
        adverseFaultNum > 100
      ) {
        setFaultError('Fault percentages must be between 0% and 100%.');
        return;
      }

      if (Math.abs(plaintiffFaultNum + adverseFaultNum - 100) > 0.01) {
        setFaultError('Plaintiff and Adverse Party fault percentages must total 100%.');
        return;
      }
    }

    const selectedMatter = cases.find((c) => c.id === formData.matterId);

    const savedRecord = {
      id: incident?.id || `INC-${Date.now()}`,
      matterId: formData.matterId,
      matterTitle: selectedMatter?.matterTitle || selectedMatter?.title || formData.matterTitle,
      incidentDate: formData.incidentDate,
      incidentTime: formData.incidentTime,
      incidentLocation: formData.incidentLocation,
      accidentType: formData.accidentType,
      description: formData.description,
      mechanismOfInjury: formData.mechanismOfInjury,
      policeReportDetails: {
        agency: formData.policeAgency,
        reportNumber: formData.reportNumber,
        investigatingOfficer: formData.investigatingOfficer,
        citationIssued: formData.citationIssued,
        filedDate: formData.incidentDate,
      },
      witnesses: formData.witnessName
        ? [
            {
              name: formData.witnessName,
              phone: formData.witnessContact,
              statement: formData.witnessStatement,
            },
          ]
        : incident?.witnesses || [],
      sceneEvidence: incident?.sceneEvidence || [],
      liabilityAssessment: formData.liabilityAssessment || null,
      plaintiffFaultPercentage: plaintiffFaultNum,
      adverseFaultPercentage: adverseFaultNum,
      comparativeFault: {
        plaintiffPercentage: plaintiffFaultNum,
        adversePercentage: adverseFaultNum,
        legalAnalysis: formData.comparativeFaultAnalysis,
      },
      investigationNotes: formData.investigationNotes,
    };

    onSave(savedRecord);
    onClose();
  };

  const hasNumericFault = formData.plaintiffFaultPercentage !== '';
  const numericPlaintiffFault = hasNumericFault ? Number(formData.plaintiffFaultPercentage) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incident ? 'Edit Incident & Liability Record' : 'Record New Incident Investigation'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Matter & Accident Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Associated PI Matter *"
            value={formData.matterId}
            onChange={(e) => {
              const selectedMatter = cases.find((c) => c.id === e.target.value);
              setFormData({
                ...formData,
                matterId: e.target.value,
                matterTitle: selectedMatter?.matterTitle || selectedMatter?.title || formData.matterTitle,
              });
              if (matterError) setMatterError('');
            }}
            placeholder={
              cases.length === 0 ? 'No active PI matters available' : '-- Select Associated PI Matter --'
            }
            error={matterError}
            required
            options={cases.map((c) => ({
              value: c.id,
              label: `${c.matterNumber} - ${c.clientName || c.client?.name || c.title}`,
            }))}
          />

          <Select
            label="Accident Type *"
            value={formData.accidentType}
            onChange={(e) => setFormData({ ...formData, accidentType: e.target.value })}
            placeholder="-- Select Accident Type --"
            required
            options={[
              { value: 'Motor Vehicle Collision (Rear-End)', label: 'Motor Vehicle Collision (Rear-End)' },
              { value: 'Motor Vehicle Accident (Commercial Trucking / Semi)', label: 'Motor Vehicle Accident (Commercial Trucking / Semi)' },
              { value: 'Premises Liability (Slip & Fall / Transitory Liquid)', label: 'Premises Liability (Slip & Fall / Transitory Liquid)' },
              { value: 'Pedestrian / Bicycle vs Motor Vehicle', label: 'Pedestrian / Bicycle vs Motor Vehicle' },
              { value: 'Construction Site Negligence (Third-Party)', label: 'Construction Site Negligence (Third-Party)' },
              { value: 'Recreational / Equipment Defect', label: 'Recreational / Equipment Defect' },
              { value: 'Wrongful Death Action', label: 'Wrongful Death Action' },
            ]}
          />
        </div>

        {/* Date, Time & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Incident Date *"
            type="date"
            value={formData.incidentDate}
            onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
            required
          />

          <Input
            label="Incident Time"
            value={formData.incidentTime}
            placeholder="e.g. 16:45 MT"
            onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
          />

          <Input
            label="Incident Location (Street / Milepost) *"
            value={formData.incidentLocation}
            placeholder="e.g. I-15 Southbound MP 291, Draper, UT"
            onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
            required
          />
        </div>

        {/* Narrative & Mechanism */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
              Description of Incident *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed chronological factual summary of how the collision/injury transpired..."
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
              Mechanism of Injury
            </label>
            <textarea
              rows={2}
              value={formData.mechanismOfInjury}
              onChange={(e) => setFormData({ ...formData, mechanismOfInjury: e.target.value })}
              placeholder="e.g. Rapid deceleration whiplash force, steering wheel strike to sternum..."
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
            />
          </div>
        </div>

        {/* Police Report Details */}
        <div className="bg-[#F5F0E5]/50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
            Law Enforcement &amp; Police Crash Report
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Investigating Agency"
              value={formData.policeAgency}
              placeholder="e.g. Utah Highway Patrol"
              onChange={(e) => setFormData({ ...formData, policeAgency: e.target.value })}
            />
            <Input
              label="Police Report Number"
              value={formData.reportNumber}
              placeholder="e.g. UHP-25-88412-C"
              onChange={(e) => setFormData({ ...formData, reportNumber: e.target.value })}
            />
            <Input
              label="Investigating Officer"
              value={formData.investigatingOfficer}
              placeholder="e.g. Trooper B. Johansen (#412)"
              onChange={(e) => setFormData({ ...formData, investigatingOfficer: e.target.value })}
            />
          </div>
          <Input
            label="Citations Issued to Adverse Parties"
            value={formData.citationIssued}
            placeholder="e.g. Utah Code § 41-6a-711 (Following Too Closely)"
            onChange={(e) => setFormData({ ...formData, citationIssued: e.target.value })}
          />
        </div>

        {/* Witness Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Key Witness Name"
            value={formData.witnessName}
            placeholder="Enter witness full name"
            onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
          />
          <Input
            label="Witness Contact Phone / Email"
            value={formData.witnessContact}
            placeholder="Enter phone or email"
            onChange={(e) => setFormData({ ...formData, witnessContact: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Witness Statement Summary
          </label>
          <input
            type="text"
            value={formData.witnessStatement}
            onChange={(e) => setFormData({ ...formData, witnessStatement: e.target.value })}
            placeholder="Summarize witness observation..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        {/* Liability & Comparative Fault (Utah Code 78B-5-818) */}
        <div className="bg-slate-50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
              Utah Comparative Fault &amp; Liability Evaluation
            </h4>
            {hasNumericFault ? (
              numericPlaintiffFault >= 50 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                  Utah § 78B-5-818: Recovery Barred ({numericPlaintiffFault}% ≥ 50%)
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Utah § 78B-5-818: Recoverable ({numericPlaintiffFault}% &lt; 50%)
                </span>
              )
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Fault % Not Yet Assessed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Overall Liability Assessment"
              value={formData.liabilityAssessment}
              placeholder="-- Select Liability Assessment --"
              onChange={(e) => setFormData({ ...formData, liabilityAssessment: e.target.value })}
              options={[
                { value: 'Clear Liability (100% Adverse Fault)', label: 'Clear Liability (100% Adverse Fault)' },
                { value: 'Favorable Liability with Minor Comparative Argument', label: 'Favorable Liability with Minor Comparative Argument' },
                { value: 'Disputed Liability (Contested Notice / Fault)', label: 'Disputed Liability (Contested Notice / Fault)' },
                { value: 'Severe Disputed Liability (Requires Expert Reconstruction)', label: 'Severe Disputed Liability' },
              ]}
            />
            <Input
              label="Plaintiff Fault % (0 - 100%)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="e.g. 0"
              value={formData.plaintiffFaultPercentage}
              onChange={(e) => handlePlaintiffFaultChange(e.target.value)}
            />
            <Input
              label="Adverse Party Fault % (0 - 100%)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="e.g. 100"
              value={formData.adverseFaultPercentage}
              onChange={(e) => handleAdverseFaultChange(e.target.value)}
            />
          </div>

          {faultError && (
            <p className="text-xs font-semibold text-rose-700">{faultError}</p>
          )}

          <Input
            label="Comparative Fault Legal Analysis"
            value={formData.comparativeFaultAnalysis}
            placeholder="Legal basis under Utah Code Ann. § 78B-5-818..."
            onChange={(e) => setFormData({ ...formData, comparativeFaultAnalysis: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Investigation &amp; Spoliation Notes
          </label>
          <textarea
            rows={2}
            value={formData.investigationNotes}
            onChange={(e) => setFormData({ ...formData, investigationNotes: e.target.value })}
            placeholder="Spoliation letters sent, cell phone records subpoenaed, dashcam retrieval status..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {incident ? 'Save Changes' : 'Record Incident'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
