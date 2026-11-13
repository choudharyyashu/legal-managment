import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Scale
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export function RelativeDeadlineCalculator({
  isOpen,
  onClose,
  initialAnchorDate = '2027-02-15',
  anchorEventType = 'Trial Date',
  matterNumber = '25-CV-0101',
  matterTitle = 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
  onApplyDeadlines = null
}) {
  const { addToast } = useToast();
  const [anchorDate, setAnchorDate] = useState(initialAnchorDate);
  const [anchorType, setAnchorType] = useState(anchorEventType);

  // Helper to add/subtract days and adjust for Utah URCP Rule 6 (weekend rollover)
  const calculateRuleDate = (baseDateStr, daysOffset) => {
    const base = new Date(baseDateStr);
    base.setDate(base.getDate() + daysOffset);

    // Rule 6(a): If last day falls on weekend, roll to next business day
    const dayOfWeek = base.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 6) {
      base.setDate(base.getDate() + 2); // Saturday -> Monday
    } else if (dayOfWeek === 0) {
      base.setDate(base.getDate() + 1); // Sunday -> Monday
    }

    return base.toISOString().split('T')[0];
  };

  const statutoryRules = [
    {
      id: 'rule-1',
      title: 'Fact Discovery Cutoff',
      ruleCitation: 'Utah R. Civ. P. 26',
      offsetDays: -60,
      description: '60 days prior to Trial Setting',
      calculatedDate: calculateRuleDate(anchorDate, -60),
    },
    {
      id: 'rule-2',
      title: 'Plaintiff Expert Witness Disclosures',
      ruleCitation: 'Utah R. Civ. P. 26(a)(2)',
      offsetDays: -90,
      description: '90 days prior to Trial Setting',
      calculatedDate: calculateRuleDate(anchorDate, -90),
    },
    {
      id: 'rule-3',
      title: 'Defendant Expert Witness Disclosures',
      ruleCitation: 'Utah R. Civ. P. 26(a)(2)',
      offsetDays: -60,
      description: '60 days prior to Trial Setting',
      calculatedDate: calculateRuleDate(anchorDate, -60),
    },
    {
      id: 'rule-4',
      title: 'Dispositive Summary Judgment Motion Cutoff',
      ruleCitation: 'Utah R. Civ. P. 56(c)',
      offsetDays: -45,
      description: '45 days prior to Trial Setting',
      calculatedDate: calculateRuleDate(anchorDate, -45),
    },
    {
      id: 'rule-5',
      title: 'Final Pre-Trial Conference & Jury Instructions',
      ruleCitation: 'Utah R. Civ. P. 16',
      offsetDays: -14,
      description: '14 days prior to Trial Setting',
      calculatedDate: calculateRuleDate(anchorDate, -14),
    },
  ];

  const handleApplyCascading = () => {
    if (onApplyDeadlines) {
      onApplyDeadlines(statutoryRules);
    }
    addToast(
      `Cascading court deadlines recalculated and synchronized for "${matterNumber}" per Utah URCP Rule 6.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Utah URCP Rule 6 Statutory Relative Deadline Calculator"
      size="lg"
    >
      <div className="space-y-4 text-xs text-[#202A35]">
        {/* Matter & Anchor Header */}
        <div className="p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#06244B] text-xs truncate max-w-sm">{matterTitle}</span>
            <span className="text-[10px] font-mono font-bold bg-[#06244B] text-white px-2 py-0.5 rounded">
              {matterNumber}
            </span>
          </div>
          <p className="text-[11px] text-[#667085]">
            Automatic computation of statutory discovery, expert, and motion deadlines based on court procedural rules.
          </p>
        </div>

        {/* Anchor Event Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded border border-[#D9D6CF]">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#667085] mb-1">
              Anchor Procedural Event:
            </label>
            <select
              value={anchorType}
              onChange={(e) => setAnchorType(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#06244B] font-semibold"
            >
              <option value="Trial Date">Trial Setting (Master Trial Date)</option>
              <option value="Service Date">Service of Process Executed</option>
              <option value="Complaint Filing">Initial Complaint Filed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#667085] mb-1">
              Anchor Date Value:
            </label>
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#06244B] font-semibold"
            />
          </div>
        </div>

        {/* Cascading Deadlines Calculated List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#06244B] text-xs uppercase tracking-wider">
              Cascading Deadlines (Utah URCP Rules Applied):
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Weekend Rollover Protected (Rule 6(a))
            </span>
          </div>

          <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white max-h-64 overflow-y-auto">
            {statutoryRules.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF7F0] transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#06244B]">{item.title}</span>
                    <span className="text-[9px] bg-[#06244B]/10 text-[#06244B] px-1.5 py-0.2 rounded font-mono font-bold">
                      {item.ruleCitation}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#667085]">{item.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold font-mono text-[#A4432B]">
                    {item.calculatedDate}
                  </span>
                  <span className="block text-[9px] text-[#667085]">
                    {item.offsetDays < 0 ? `${Math.abs(item.offsetDays)} days prior` : `${item.offsetDays} days after`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D9D6CF]">
          <span className="text-[10px] text-[#667085]">
            Updates Master Court Calendar and Case Deadlines.
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleApplyCascading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Apply Cascading Updates
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

