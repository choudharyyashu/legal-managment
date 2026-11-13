import React, { useState } from 'react';
import { FileEdit, CheckCircle2, AlertTriangle, Download, Printer } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function AmendedSchedulesModal({ isOpen, onClose, caseNumber = '26-25410-JTM', debtorName = 'Rachel Lynn Walker' }) {
  const { addToast } = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState('Schedule E/F');
  const [amendmentReason, setAmendmentReason] = useState('Addition of previously omitted medical collection creditor balance');
  const [creditorToAdd, setCreditorToAdd] = useState('Intermountain Health Billing LLC');
  const [claimAmount, setClaimAmount] = useState(1850);

  const handleGenerateAmendment = (e) => {
    e.preventDefault();
    addToast(`Amended ${selectedSchedule} generated with Notice of Amendment to All Affected Creditors.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Amended Bankruptcy Petition &amp; Schedules"
      subtitle={`Case: ${caseNumber} • Debtor: ${debtorName} (Fed. R. Bankr. P. 1009(a))`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleGenerateAmendment} className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Select Schedule to Amend
          </label>
          <select
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
          >
            <option value="Schedule A/B">Schedule A/B: Real &amp; Personal Property Inventory</option>
            <option value="Schedule D">Schedule D: Creditors Having Secured Claims</option>
            <option value="Schedule E/F">Schedule E/F: Priority &amp; Nonpriority Unsecured Claims</option>
            <option value="Schedule I/J">Schedule I &amp; J: Monthly Income &amp; Household Budget</option>
            <option value="Statement of Financial Affairs">Statement of Financial Affairs (SOFA)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Factual Reason for Amendment
          </label>
          <textarea
            rows={2}
            value={amendmentReason}
            onChange={(e) => setAmendmentReason(e.target.value)}
            className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            required
          />
        </div>

        <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-2">
          <span className="font-bold text-xs text-[#06244B] uppercase block">Omitted Creditor / Asset Modification</span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#667085] uppercase font-semibold block mb-0.5">Creditor Legal Entity Name</label>
              <input
                type="text"
                value={creditorToAdd}
                onChange={(e) => setCreditorToAdd(e.target.value)}
                className="w-full text-xs p-1.5 rounded border border-[#D9D6CF] bg-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-[#667085] uppercase font-semibold block mb-0.5">Omitted Claim Amount ($)</label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(Number(e.target.value))}
                className="w-full text-xs p-1.5 rounded border border-[#D9D6CF] bg-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Local Bankruptcy Rule 1009-1 Notice Requirement:</strong> Amendments adding creditors require formal service of Notice of Bankruptcy Case Filing, Meeting of Creditors, and Claims Bar Date on all newly scheduled parties.
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" type="submit" icon={FileEdit}>
              Generate Amended Schedule
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

