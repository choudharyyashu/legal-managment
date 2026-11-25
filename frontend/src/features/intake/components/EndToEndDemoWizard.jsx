import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { intakeService } from '../../../services/intakeService';

export function EndToEndDemoWizard({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser, allUsers } = useAuth();
  const { addToast } = useToast();
  const { addIntake, convertIntakeToClient, refreshIntakes } = useClients();
  const { convertIntakeToMatter } = useMatters();

  const [currentStep, setCurrentStep] = useState(1);
  const [executing, setExecuting] = useState(false);

  const attorneys = allUsers.filter((u) => u.role === 'attorney' || u.role === 'super_admin');
  const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const resolvedAttorney = attorneys.find((u) => validUuid.test(u.id)) || (validUuid.test(currentUser?.id) ? currentUser : null);

  const [demoData, setDemoData] = useState({
    clientName: 'Sample Commercial Client LLC',
    contactPerson: 'Authorized Representative',
    email: `sample-intake-${Date.now().toString().slice(-4)}@example.org`,
    phone: '(801) 555-0899',
    practiceAreaId: 'pa-civ',
    practiceAreaName: 'Civil/Commercial Litigation',
    adverseParty: 'Sample Opposing Corp',
    matterTitle: 'Sample Commercial Client v. Sample Opposing Corp',
    hourlyRate: 450,
    conflictConfirmed: false,
    reviewerNotes: '',
    createdClientId: null,
    createdClientNumber: null,
    createdMatterId: null,
    createdMatterNumber: null,
  });

  const handleCompleteFullWorkflow = async () => {
    if (!demoData.conflictConfirmed || !demoData.reviewerNotes.trim()) {
      addToast('Please confirm reviewer sign-off notes before converting.', 'error');
      return;
    }
    if (!resolvedAttorney?.id) {
      addToast('No active attorney UUID loaded to assign responsibility for the matter.', 'error');
      return;
    }

    setExecuting(true);
    try {
      const intake = await addIntake({
        prospectiveClient: demoData.clientName,
        contactPerson: demoData.contactPerson,
        email: demoData.email,
        phone: demoData.phone,
        practiceAreaId: demoData.practiceAreaId,
        adverseParties: demoData.adverseParty,
        matterSummary: demoData.matterTitle,
        disputeAmount: 25000,
      });

      await intakeService.clearConflict(intake.id, {
        status: 'Review Completed',
        notes: demoData.reviewerNotes.trim(),
      });

      const clientRes = await convertIntakeToClient(intake.id, {
        clientType: 'Organization',
        assignedAttorneyId: resolvedAttorney.id,
      });

      const matterRes = await convertIntakeToMatter(intake.id, {
        clientId: clientRes.client.id,
        title: demoData.matterTitle,
        practiceAreaId: demoData.practiceAreaId,
        responsibleAttorneyId: resolvedAttorney.id,
        billingType: 'Hourly',
        hourlyRate: demoData.hourlyRate,
        budget: 25000,
        description: demoData.matterTitle,
      });

      await refreshIntakes();

      setDemoData((prev) => ({
        ...prev,
        createdClientId: clientRes.client.id,
        createdClientNumber: clientRes.client.clientNumber,
        createdMatterId: matterRes.matter.id,
        createdMatterNumber: matterRes.matter.matterNumber,
      }));

      addToast(
        `Guided Intake Conversion Complete: Client ${clientRes.client.clientNumber} and Matter ${matterRes.matter.matterNumber} created.`,
        'success'
      );
      setCurrentStep(4);
    } catch (err) {
      addToast(err?.message || 'Workflow execution failed on backend server.', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guided Intake-to-Matter Conversion Walkthrough"
      size="xl"
    >
      <div className="space-y-4 text-xs text-[#202A35]">
        <div className="grid grid-cols-4 gap-1 border-b border-[#D9D6CF] pb-3">
          {[
            '1. Prospective Data',
            '2. Reviewer Conflict Check',
            '3. Execute Conversion',
            '4. Active Client & Matter',
          ].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={label}
                className={`p-1.5 rounded text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : isCurrent
                    ? 'bg-[#06244B] text-white font-bold'
                    : 'bg-[#FAF7F0] text-[#667085]'
                }`}
              >
                <span className="block text-[10px] leading-tight truncate">{label}</span>
              </div>
            );
          })}
        </div>

        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900">
                <strong>Walkthrough Notice:</strong> Completing step 3 creates real records through the backend API. Do not execute this on production data unless creating an actual test intake.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Prospective Entity:</span>
                <span className="font-bold text-[#06244B]">{demoData.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Practice Area:</span>
                <span>{demoData.practiceAreaName} ({demoData.practiceAreaId})</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Adverse Party:</span>
                <span className="font-bold text-rose-700">{demoData.adverseParty}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Responsible Attorney:</span>
                <span>{resolvedAttorney?.name || 'None available'}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="primary" onClick={() => setCurrentStep(2)}>
                <span>Continue to Reviewer Check</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF]">
              <h4 className="font-serif font-bold text-[#06244B] text-sm">
                Step 2: Mandatory Conflict Review Sign-Off
              </h4>
              <p className="text-[11px] text-[#667085] mt-0.5">
                Reviewer ({currentUser?.name || 'Attorney'}) must explicitly enter determination notes before conversion is unlocked.
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                Conflict Review Notes *
              </label>
              <textarea
                rows={2}
                value={demoData.reviewerNotes}
                onChange={(e) => setDemoData((prev) => ({ ...prev, reviewerNotes: e.target.value }))}
                placeholder="Enter actual conflict search review notes..."
                className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded"
              />
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={demoData.conflictConfirmed}
                onChange={(e) => setDemoData((prev) => ({ ...prev, conflictConfirmed: e.target.checked }))}
              />
              <span>I confirm conflict review for &ldquo;{demoData.adverseParty}&rdquo; will be recorded under Utah RPC 1.7.</span>
            </label>
            <div className="flex justify-between pt-2">
              <Button size="sm" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!demoData.conflictConfirmed || demoData.reviewerNotes.trim().length < 3}
                onClick={() => setCurrentStep(3)}
              >
                <span>Proceed to Conversion</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-[#667085]">
              Clicking below will call <code className="font-mono">/intakes</code>,{' '}
              <code className="font-mono">/clear-conflict</code>,{' '}
              <code className="font-mono">/convert-client</code>, and{' '}
              <code className="font-mono">/convert-matter</code> sequentially.
            </p>
            <div className="flex justify-between pt-2">
              <Button size="sm" variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button size="sm" variant="primary" disabled={executing} onClick={handleCompleteFullWorkflow}>
                {executing ? 'Executing API Flow...' : 'Convert to Active Client & Open Matter'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-emerald-950">
                Intake Conversion Persisted via Backend API
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1">
                <span className="font-bold text-[#06244B] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#A4432B]" />
                  <span>Client Created:</span>
                </span>
                <p className="text-[#06244B] font-semibold">{demoData.clientName}</p>
                <p className="text-[#667085] text-[11px]">{demoData.createdClientNumber || demoData.createdClientId}</p>
              </div>
              <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1">
                <span className="font-bold text-[#06244B] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#A4432B]" />
                  <span>Matter Opened:</span>
                </span>
                <p className="text-[#06244B] font-semibold truncate">{demoData.matterTitle}</p>
                <p className="text-[#667085] text-[11px]">{demoData.createdMatterNumber || demoData.createdMatterId}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
              {demoData.createdMatterId && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onClose();
                    navigate(`/matters/${demoData.createdMatterId}`);
                  }}
                >
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  Open Created Matter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
