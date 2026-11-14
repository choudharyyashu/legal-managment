import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function IncidentModal({ isOpen, onClose, onSave, incident, cases = [], defaultCaseId = '' }) {
  const [formData, setFormData] = useState({
    matterId: '',
    matterTitle: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    accidentType: 'Motor Vehicle Collision (Rear-End)',
    description: '',
    mechanismOfInjury: '',
    policeAgency: 'Utah Highway Patrol',
    reportNumber: '',
    investigatingOfficer: '',
    citationIssued: '',
    witnessName: '',
    witnessContact: '',
    witnessStatement: '',
    liabilityAssessment: 'Clear Liability (100% Adverse Fault)',
    plaintiffFaultPercentage: 0,
    adverseFaultPercentage: 100,
    comparativeFaultAnalysis: 'Utah Code § 78B-5-818 comparative fault applies. Plaintiff bears 0% fault.',
    investigationNotes: '',
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        matterId: incident.matterId || '',
        matterTitle: incident.matterTitle || '',
        incidentDate: incident.incidentDate || '',
        incidentTime: incident.incidentTime || '',
        incidentLocation: incident.incidentLocation || '',
        accidentType: incident.accidentType || 'Motor Vehicle Collision (Rear-End)',
        description: incident.description || '',
        mechanismOfInjury: incident.mechanismOfInjury || '',
        policeAgency: incident.policeReportDetails?.agency || '',
        reportNumber: incident.policeReportDetails?.reportNumber || '',
        investigatingOfficer: incident.policeReportDetails?.investigatingOfficer || '',
        citationIssued: incident.policeReportDetails?.citationIssued || '',
        witnessName: incident.witnesses?.[0]?.name || '',
        witnessContact: incident.witnesses?.[0]?.phone || '',
        witnessStatement: incident.witnesses?.[0]?.statement || '',
        liabilityAssessment: incident.liabilityAssessment || 'Clear Liability (100% Adverse Fault)',
        plaintiffFaultPercentage: incident.comparativeFault?.plaintiffPercentage ?? 0,
        adverseFaultPercentage: incident.comparativeFault?.adversePercentage ?? 100,
        comparativeFaultAnalysis: incident.comparativeFault?.legalAnalysis || '',
        investigationNotes: incident.investigationNotes || '',
      });
    } else {
      const initialMatterId = (defaultCaseId && defaultCaseId !== 'ALL') ? defaultCaseId : (cases[0]?.id || '');
      const defaultMatter = cases.find(c => c.id === initialMatterId) || cases[0];
      setFormData({
        matterId: initialMatterId,
        matterTitle: defaultMatter?.matterTitle || '',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: '14:30 MT',
        incidentLocation: '',
        accidentType: 'Motor Vehicle Collision (Rear-End)',
        description: '',
        mechanismOfInjury: '',
        policeAgency: 'Utah Highway Patrol',
        reportNumber: '',
        investigatingOfficer: '',
        citationIssued: '',
        witnessName: '',
        witnessContact: '',
        witnessStatement: '',
        liabilityAssessment: 'Clear Liability (100% Adverse Fault)',
        plaintiffFaultPercentage: 0,
        adverseFaultPercentage: 100,
        comparativeFaultAnalysis: 'Utah Code § 78B-5-818 comparative fault analysis confirmed.',
        investigationNotes: '',
      });
    }
  }, [incident, cases, defaultCaseId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMatter = cases.find(c => c.id === formData.matterId);

    const savedRecord = {
      id: incident?.id || `INC-${Date.now()}`,
      matterId: formData.matterId,
      matterTitle: selectedMatter?.matterTitle || formData.matterTitle,
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
      sceneEvidence: incident?.sceneEvidence || [
        { name: 'Police Accident Incident Report', type: 'Official Report', date: formData.incidentDate, verified: true },
        { name: 'Scene & Vehicle Damage Photographs', type: 'Photographs', date: formData.incidentDate, verified: true },
      ],
      liabilityAssessment: formData.liabilityAssessment,
      comparativeFault: {
        plaintiffPercentage: Number(formData.plaintiffFaultPercentage),
        adversePercentage: Number(formData.adverseFaultPercentage),
        legalAnalysis: formData.comparativeFaultAnalysis,
      },
      investigationNotes: formData.investigationNotes,
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incident ? 'Edit Incident & Liability Record' : 'Record New Incident Investigation'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Matter Selector */}
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
            label="Accident Type *"
            value={formData.accidentType}
            onChange={(e) => setFormData({ ...formData, accidentType: e.target.value })}
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
              Mechanism of Injury *
            </label>
            <textarea
              rows={2}
              value={formData.mechanismOfInjury}
              onChange={(e) => setFormData({ ...formData, mechanismOfInjury: e.target.value })}
              placeholder="e.g. Rapid deceleration whiplash force, steering wheel strike to sternum, knee contact with dashboard..."
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
              required
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
            placeholder="e.g. Arthur Pendelton"
            onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
          />
          <Input
            label="Witness Contact Phone / Email"
            value={formData.witnessContact}
            placeholder="e.g. (801) 555-0182"
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
            placeholder="Confirmed defendant vehicle was speeding and did not activate brakes..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        {/* Liability & Comparative Fault (Utah Code 78B-5-818) */}
        <div className="bg-slate-50 p-3.5 rounded border border-[#D9D6CF] space-y-3">
          <h4 className="text-xs font-serif font-bold text-[#06244B] uppercase tracking-wider">
            Utah Comparative Fault &amp; Liability Evaluation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Overall Liability Assessment"
              value={formData.liabilityAssessment}
              onChange={(e) => setFormData({ ...formData, liabilityAssessment: e.target.value })}
              options={[
                { value: 'Clear Liability (100% Adverse Fault)', label: 'Clear Liability (100% Adverse Fault)' },
                { value: 'Favorable Liability with Minor Comparative Argument', label: 'Favorable Liability with Minor Comparative Argument' },
                { value: 'Disputed Liability (Contested Notice / Fault)', label: 'Disputed Liability (Contested Notice / Fault)' },
                { value: 'Severe Disputed Liability (Requires Expert Reconstruction)', label: 'Severe Disputed Liability' },
              ]}
            />
            <Input
              label="Plaintiff Fault % (0 - 49%)"
              type="number"
              min="0"
              max="49"
              value={formData.plaintiffFaultPercentage}
              onChange={(e) => {
                const p = Number(e.target.value);
                setFormData({
                  ...formData,
                  plaintiffFaultPercentage: p,
                  adverseFaultPercentage: Math.max(0, 100 - p),
                });
              }}
            />
            <Input
              label="Adverse Party Fault %"
              type="number"
              value={formData.adverseFaultPercentage}
              disabled
            />
          </div>

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

