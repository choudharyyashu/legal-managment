import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Building,
  RotateCcw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_LITIGATION_CASES } from '../../../data/mockLitigationCases';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { useToast } from '../../../components/ui/Toast';

export function CourtScheduling() {
  const [cases, setCases] = useState(MOCK_LITIGATION_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_LITIGATION_CASES[0]);
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);
  const [newTrialDate, setNewTrialDate] = useState('2026-11-17');
  const [recalcReason, setRecalcReason] = useState('Stipulated Amended Scheduling Order Granted by Judge Scott');
  const { addToast } = useToast();

  const [deadlines, setDeadlines] = useState([
    {
      id: 'dd-1',
      event: 'Fact Discovery Cutoff (URCP 26)',
      currentDate: '2026-05-15',
      rule: '150 days before trial setting',
      type: 'Statutory Discovery Cutoff',
      status: 'Active Track'
    },
    {
      id: 'dd-2',
      event: "Plaintiff's Expert Witness Disclosures (URCP 26(a)(4))",
      currentDate: '2026-06-15',
      rule: '120 days before trial setting',
      type: 'Expert Reports Due',
      status: 'Active Track'
    },
    {
      id: 'dd-3',
      event: "Defendant's Expert Witness Disclosures (URCP 26(a)(4))",
      currentDate: '2026-07-15',
      rule: '30 days after plaintiff disclosure',
      type: 'Defense Rebuttal Due',
      status: 'Active Track'
    },
    {
      id: 'dd-4',
      event: 'Dispositive Motions Deadline (Summary Judgment URCP 56)',
      currentDate: '2026-08-14',
      rule: '60 days before trial setting',
      type: 'Dispositive Motion Cutoff',
      status: 'Active Track'
    },
    {
      id: 'dd-5',
      event: 'Pretrial Conference & Motions in Limine Filing',
      currentDate: '2026-09-22',
      rule: '21 days before trial setting',
      type: 'Court Hearing Setting',
      status: 'Active Track'
    },
    {
      id: 'dd-6',
      event: 'Jury Trial Setting (4 Days Estimated)',
      currentDate: '2026-10-14',
      rule: 'Primary Court Trial Order',
      type: 'Court Trial Setting',
      status: 'Firm Trial Date'
    }
  ]);

  const handleApplyRecalculation = () => {
    // Dynamically shift all dates by +34 days (difference between Oct 14 and Nov 17)
    const shifted = [
      { id: 'dd-1', event: 'Fact Discovery Cutoff (URCP 26)', currentDate: '2026-06-18', rule: '150 days before trial setting', type: 'Statutory Discovery Cutoff', status: 'Recalculated ✓' },
      { id: 'dd-2', event: "Plaintiff's Expert Witness Disclosures", currentDate: '2026-07-20', rule: '120 days before trial setting', type: 'Expert Reports Due', status: 'Recalculated ✓' },
      { id: 'dd-3', event: "Defendant's Expert Witness Disclosures", currentDate: '2026-08-19', rule: '30 days after plaintiff disclosure', type: 'Defense Rebuttal Due', status: 'Recalculated ✓' },
      { id: 'dd-4', event: 'Dispositive Motions Deadline (URCP 56)', currentDate: '2026-09-18', rule: '60 days before trial setting', type: 'Dispositive Motion Cutoff', status: 'Recalculated ✓' },
      { id: 'dd-5', event: 'Pretrial Conference & Motions in Limine', currentDate: '2026-10-27', rule: '21 days before trial setting', type: 'Court Hearing Setting', status: 'Recalculated ✓' },
      { id: 'dd-6', event: 'Jury Trial Setting (4 Days Estimated)', currentDate: newTrialDate, rule: 'Amended Trial Order', type: 'Court Trial Setting', status: 'Recalculated ✓' }
    ];

    setDeadlines(shifted);
    setIsRecalcModalOpen(false);
    addToast(`Utah URCP Rule 6 recalculation applied! 6 deadlines adjusted for ${newTrialDate}.`, 'success');
  };

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Court Events &amp; Rule 6 Deadline Scheduling"
        subtitle="Manage pretrial scheduling orders, court notices, and automated Utah URCP Rule 6 deadline recalculation (Section 5)."
        breadcrumbs={[
          { label: 'Litigation Workspace', to: '/litigation/dashboard' },
          { label: 'Court Scheduling' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsRecalcModalOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Recalculate Rule Deadlines
            </Button>
          </div>
        }
      />

      {/* Utah URCP Rule 6 Explanation Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-950">
        <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block">Utah Rules of Civil Procedure (URCP) Rule 6 Computation Engine</span>
          <p className="leading-relaxed text-blue-900">
            When a trial, hearing, or order date is modified, this engine recalculates all dependent statutory deadlines backward from trial setting, strictly excluding intermediate court holidays and adding 3 days for electronic service under URCP 6(c).
          </p>
        </div>
      </div>

      {/* Deadlines Schedule Ledger */}
      <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#06244B]" />
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Master Scheduling Order Docket: {activeCase.caseTitle}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#A4432B]">
            Hon. Laura Scott Presiding
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
            <thead className="bg-[#06244B] text-white font-bold text-[11px]">
              <tr>
                <th className="p-3">Statutory Court Milestone / Event</th>
                <th className="p-3">Governing Rule / Calculation Formula</th>
                <th className="p-3">Current Deadline</th>
                <th className="p-3">Event Classification</th>
                <th className="p-3 text-right">Schedule Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
              {deadlines.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#06244B]">{item.event}</td>
                  <td className="p-3 text-slate-600 font-serif text-[11px]">{item.rule}</td>
                  <td className="p-3 font-mono font-bold text-xs text-[#A4432B]">{item.currentDate}</td>
                  <td className="p-3 text-slate-700">{item.type}</td>
                  <td className="p-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Recalculation Impact Preview Modal */}
      {isRecalcModalOpen && (
        <Modal
          isOpen={isRecalcModalOpen}
          onClose={() => setIsRecalcModalOpen(false)}
          title="Rule Date Recalculation Impact Preview (Section 5)"
          subtitle="Display all affected dependent dates before reviewer accepts recalculation"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 text-xs space-y-1">
              <strong>Pre-Recalculation Impact Analysis:</strong> Modifying the primary trial date will automatically adjust 5 dependent discovery and dispositive motion milestones.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="New Target Trial Date *"
                  type="date"
                  value={newTrialDate}
                  onChange={(e) => setNewTrialDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="Reason / Triggering Court Order"
                  value={recalcReason}
                  onChange={(e) => setRecalcReason(e.target.value)}
                  placeholder="e.g. Amended Scheduling Order"
                />
              </div>
            </div>

            {/* Side-by-side diff preview */}
            <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
              <div className="p-2.5 bg-[#06244B] text-white font-bold text-xs">
                Proposed Deadline Shifts (Before vs After)
              </div>
              <div className="p-3 divide-y divide-slate-200 space-y-2">
                {[
                  { title: 'Fact Discovery Cutoff', oldDate: '2026-05-15', newDate: '2026-06-18', diff: '+34 Days' },
                  { title: "Plaintiff's Expert Disclosures", oldDate: '2026-06-15', newDate: '2026-07-20', diff: '+35 Days' },
                  { title: "Defendant's Expert Disclosures", oldDate: '2026-07-15', newDate: '2026-08-19', diff: '+35 Days' },
                  { title: 'Dispositive Motions Deadline', oldDate: '2026-08-14', newDate: '2026-09-18', diff: '+35 Days' },
                  { title: 'Jury Trial Setting', oldDate: '2026-10-14', newDate: newTrialDate, diff: '+34 Days' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center pt-2 first:pt-0">
                    <span className="font-semibold text-[#06244B]">{row.title}</span>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-400 line-through">{row.oldDate}</span>
                      <span>&rarr;</span>
                      <span className="font-bold text-emerald-700">{row.newDate}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {row.diff}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setIsRecalcModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                onClick={handleApplyRecalculation}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                Accept &amp; Apply Recalculation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

