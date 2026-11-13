import React, { useState } from 'react';
import { AlertTriangle, Clock, Calendar, CheckCircle2, ShieldAlert, Plus, Search } from 'lucide-react';
import { useMatters } from '../../../context/MatterContext';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { formatDate, formatRelativeDays } from '../../../utils/formatDate';
import { RelativeDeadlineCalculator } from '../components/RelativeDeadlineCalculator';

export function CourtDeadlines() {
  const { matters } = useMatters();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [deadlines, setDeadlines] = useState([
    {
      id: 'DDL-101',
      title: 'Fact Discovery Cutoff Date',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      court: 'Utah Third District Court',
      dueDate: '2026-11-24',
      type: 'Discovery Cutoff',
      jurisdictionRule: 'Utah R. Civ. P. 26',
      assignedAttorney: 'Thomas Bludworth, Esq.',
      status: 'Attention Required',
    },
    {
      id: 'DDL-102',
      title: 'Motion for Summary Judgment Opposition Brief Filing',
      matterNumber: '24-LND-0912',
      matterTitle: 'Apex Horizon v. Wasatch County Board of Adjustment',
      court: 'Utah Fourth Judicial District Court',
      dueDate: '2026-11-10',
      type: 'Briefing Deadline',
      jurisdictionRule: 'Utah R. Civ. P. 56(c)',
      assignedAttorney: 'Eleanor Heugly, Esq.',
      status: 'Urgent',
    },
    {
      id: 'DDL-103',
      title: 'Rebuttal Expert Witness Disclosures',
      matterNumber: '25-CV-0519',
      matterTitle: 'Summit Crest BioSciences v. BioNexus Labs',
      court: 'U.S. District Court for District of Utah',
      dueDate: '2026-12-05',
      type: 'Expert Disclosure',
      jurisdictionRule: 'Fed. R. Civ. P. 26(a)(2)',
      assignedAttorney: 'Thomas Bludworth, Esq.',
      status: 'Pending',
    },
    {
      id: 'DDL-104',
      title: 'Statute of Limitations - Contractual Indemnity Claim',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      court: 'Utah State Courts',
      dueDate: '2027-01-20',
      type: 'Statute of Limitations',
      jurisdictionRule: 'Utah Code Ann. § 78B-2-307',
      assignedAttorney: 'Thomas Bludworth, Esq.',
      status: 'Compliant',
    }
  ]);

  const columns = [
    {
      key: 'title',
      label: 'Court Deadline & Statutory Rule',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-[#06244B]">
            <AlertTriangle className="w-4 h-4 text-[#B42318] flex-shrink-0" />
            <span>{val}</span>
          </div>
          <span className="text-[11px] text-[#A4432B] font-semibold block mt-0.5">
            Rule: {row.jurisdictionRule}
          </span>
        </div>
      ),
    },
    {
      key: 'matterTitle',
      label: 'Matter & Court Docket',
      render: (val, row) => (
        <div>
          <span className="text-xs font-semibold text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.matterNumber} • {row.court}</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Filing Due Date',
      sortable: true,
      render: (val) => {
        const diff = formatRelativeDays(val);
        return (
          <div>
            <span className="text-xs font-bold text-[#B42318] block">{formatDate(val)}</span>
            <span className="text-[10px] text-[#667085]">{diff}</span>
          </div>
        );
      },
    },
    {
      key: 'assignedAttorney',
      label: 'Counsel Responsible',
      sortable: true,
      render: (val) => <span className="text-xs font-medium text-[#202A35]">{val}</span>,
    },
    {
      key: 'status',
      label: 'Filing Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court Deadlines &amp; Statutory Cutoffs"
        subtitle="Critical jurisdictional calendar deadlines, Utah Rules of Civil Procedure timeframes, and statutes of limitations."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Court Deadlines' }]}
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCalculatorOpen(true)}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Relative Deadline Calculator (Utah Rule 6)
          </Button>
        }
      />

      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950">
            Mandatory Malpractice Prevention Docket
          </p>
          <p className="text-amber-800 mt-0.5">
            All statutory deadlines are double-checked against Utah Court XChange e-filing receipt confirmations and judicial scheduling orders.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={deadlines}
        pageSize={10}
      />

      {/* Relative Deadline Calculator Modal */}
      {isCalculatorOpen && (
        <RelativeDeadlineCalculator
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          onApplyDeadlines={(newDeadlines) => {
            const mapped = newDeadlines.map(d => ({
              id: `DDL-${Date.now()}-${d.id}`,
              title: d.title,
              matterNumber: '25-CV-0101',
              matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
              court: 'Utah Third District Court',
              dueDate: d.calculatedDate,
              type: d.title.includes('Expert') ? 'Expert Disclosure' : 'Discovery Cutoff',
              jurisdictionRule: d.ruleCitation,
              assignedAttorney: 'Thomas Bludworth, Esq.',
              status: 'Calculated (Rule 6)',
            }));
            setDeadlines(prev => [...mapped, ...prev]);
          }}
        />
      )}
    </div>
  );
}

