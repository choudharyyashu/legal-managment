import React, { useState } from 'react';
import {
  FolderOpen,
  Download,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Send,
  Eye
} from 'lucide-react';
import { useMatters } from '../../../context/MatterContext';
import { useTasks } from '../../../context/TaskContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

export function MatterReports() {
  const { matters } = useMatters();
  const { tasks } = useTasks();
  const { addToast } = useToast();

  const [activeReportTab, setActiveReportTab] = useState('stalled'); // 'all', 'stalled', 'missing-docs', 'deadlines', 'overdue'

  // Stalled Matters mock data (>30 days without activity or stage advance)
  const stalledMatters = [
    {
      id: 'MAT-2024-0301',
      matterNumber: '24-LND-0912',
      title: 'Apex Horizon v. Wasatch County Board of Adjustment (Water Rights Appeal)',
      clientName: 'Apex Horizon Real Estate Group',
      practiceArea: 'Real Estate, Water Rights & Land Use',
      leadAttorney: 'Eleanor Heugly, Esq.',
      currentStage: 'Fact Discovery',
      daysInactive: 42,
      lastActivityDate: '2026-10-01',
      stalledReason: 'Awaiting certified groundwater recharge telemetry logs from opposing expert.',
    },
    {
      id: 'MAT-2025-0601',
      matterNumber: '25-CORP-0119',
      title: 'Intermountain Health Tech Acquisition & Asset Transfer',
      clientName: 'Harrison & Claire Thorne',
      practiceArea: 'Commercial & Corporate Law',
      leadAttorney: 'Thomas Bludworth, Esq.',
      currentStage: 'Entity Structuring',
      daysInactive: 34,
      lastActivityDate: '2026-10-09',
      stalledReason: 'Pending member signature on revised buy-sell valuation schedule.',
    },
  ];

  // Missing Documents mock data (Mandatory gatekeeper documents pending)
  const missingDocMatters = [
    {
      id: 'md-1',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      clientName: 'Wasatch Mountain Logistics LLC',
      missingDocument: 'Rule 26(a)(2) Economics Damages Expert Formal Report',
      category: 'Pleadings / Discovery',
      responsibleStaff: 'Thomas Bludworth, Esq.',
      daysPending: 18,
      severity: 'Critical (Trial Gatekeeper)',
    },
    {
      id: 'md-2',
      matterNumber: '25-DOM-0418',
      matterTitle: 'In re Marriage of Martinez and Sterling: Domestic Dissolution',
      clientName: 'Dr. Evelyn Martinez',
      missingDocument: 'Utah URCP 26.1 Sworn Financial Declaration & 12 Months Bank Statements',
      category: 'Mandatory Disclosure',
      responsibleStaff: 'Sarah Jenkins, Esq.',
      daysPending: 12,
      severity: 'Urgent (Hearing Prerequisite)',
    },
    {
      id: 'md-3',
      matterNumber: '26-25410-JTM',
      matterTitle: 'Rachel Lynn Walker: Chapter 7 Consumer Debt Liquidation',
      clientName: 'Rachel Lynn Walker',
      missingDocument: 'Signed IRS Form 1040 Tax Return Transcripts (2024 & 2025)',
      category: 'Statutory 11 U.S.C. § 521',
      responsibleStaff: 'Marcus Vance (Paralegal)',
      daysPending: 8,
      severity: 'High (341 Meeting Deficiency)',
    },
  ];

  // Approaching Court Deadlines mock data (Next 30 Days)
  const approachingDeadlines = [
    {
      id: 'cd-1',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      deadlineTitle: 'Utah URCP 56 Dispositive Summary Judgment Briefing Cutoff',
      ruleCitation: 'Utah R. Civ. P. 56(c)',
      dueDate: '2026-12-01',
      daysRemaining: 19,
      responsibleCounsel: 'Thomas Bludworth, Esq.',
      riskLevel: 'Critical',
    },
    {
      id: 'cd-2',
      matterNumber: '25-DOM-0418',
      matterTitle: 'In re Marriage of Martinez and Sterling: Domestic Dissolution',
      deadlineTitle: 'Mandatory Court Mediation & Marital Balance Sheet Exchange',
      ruleCitation: 'Utah Code § 30-3-39',
      dueDate: '2026-11-20',
      daysRemaining: 8,
      responsibleCounsel: 'Sarah Jenkins, Esq.',
      riskLevel: 'Urgent',
    },
    {
      id: 'cd-3',
      matterNumber: '24-LND-0912',
      deadlineTitle: 'Pre-Hearing Brief to Wasatch County Board of Adjustment',
      ruleCitation: 'Wasatch County Code § 16.02',
      dueDate: '2026-11-25',
      daysRemaining: 13,
      responsibleCounsel: 'Eleanor Heugly, Esq.',
      riskLevel: 'High',
    },
  ];

  // Overdue Tasks mock data
  const overdueTasks = [
    {
      id: 'ot-1',
      title: 'File Summary Judgment Opposition Brief & Rule 56(d) Declaration',
      matterTitle: 'Apex Horizon v. Wasatch County Board (Water Rights Appeal)',
      assignedTo: 'Eleanor Heugly, Esq.',
      role: 'Partner',
      dueDate: '2026-11-10',
      daysOverdue: 2,
      priority: 'High',
    },
    {
      id: 'ot-2',
      title: 'Subpoena Telemetry Sensor Calibration Log for Truck 408',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines',
      assignedTo: 'Marcus Vance',
      role: 'Paralegal',
      dueDate: '2026-11-08',
      daysOverdue: 4,
      priority: 'Urgent',
    },
  ];

  // Master Roster Columns
  const masterColumns = [
    {
      key: 'matterNumber',
      label: 'Matter Docket & Caption',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-serif font-bold text-sm text-[#06244B] block">{row.title}</span>
          <span className="text-[11px] text-[#667085]">{val} • {row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'practiceAreaName',
      label: 'Practice Area',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35] font-medium">{val}</span>,
    },
    {
      key: 'stage',
      label: 'Current Stage',
      render: (val) => (
        <span className="text-[11px] bg-[#F5F0E5] text-[#06244B] font-semibold px-2 py-0.5 rounded border border-[#D9D6CF]">
          {val || 'Fact Discovery'}
        </span>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">{formatCurrency(val)}</span>,
    },
    {
      key: 'totalBilled',
      label: 'Billed to Date',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const percent = Math.min(100, Math.round((val / (row.budget || 50000)) * 100));
        return (
          <div className="text-right">
            <span className="text-xs font-bold text-[#A4432B] block">{formatCurrency(val)}</span>
            <span className="text-[10px] text-[#667085]">{percent}% of budget</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filevine Requirements Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Operational Integrity Reports (Filevine Architecture):</strong> Active audit reports identifying stalled cases (&gt;30 days inactive), missing gatekeeper documents, approaching statutory deadlines, and employee overdue workloads.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap shrink-0 self-start sm:self-auto">
          AUDIT ENGINE ACTIVE
        </span>
      </div>

      <PageHeader
        title="Case &amp; Matter Operational Reports"
        subtitle="Stalled case identification, gatekeeper document audit, approaching court deadlines, and employee workload distribution."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/reports/staff' }, { label: 'Matter Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => addToast(`Operational Report (${activeReportTab.toUpperCase()}) exported to CSV.`, 'success')}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveReportTab('stalled')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            activeReportTab === 'stalled'
              ? 'bg-amber-50/80 border-amber-400 shadow-sm'
              : 'bg-white border-[#D9D6CF] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-900">Stalled Matters (&gt;30d)</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-serif font-bold text-amber-900 mt-1 block">
            {stalledMatters.length} Cases Flagged
          </span>
          <span className="text-[11px] text-amber-800 font-medium">Requires partner intervention</span>
        </div>

        <div
          onClick={() => setActiveReportTab('missing-docs')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            activeReportTab === 'missing-docs'
              ? 'bg-rose-50/80 border-rose-400 shadow-sm'
              : 'bg-white border-[#D9D6CF] hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-900">Missing Key Documents</span>
            <FileText className="w-4 h-4 text-rose-700" />
          </div>
          <span className="text-2xl font-serif font-bold text-rose-900 mt-1 block">
            {missingDocMatters.length} Matters Deficient
          </span>
          <span className="text-[11px] text-rose-800 font-medium">Blocking stage advance</span>
        </div>

        <div
          onClick={() => setActiveReportTab('deadlines')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            activeReportTab === 'deadlines'
              ? 'bg-blue-50/80 border-blue-400 shadow-sm'
              : 'bg-white border-[#D9D6CF] hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-blue-900">Approaching Deadlines</span>
            <Calendar className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl font-serif font-bold text-blue-900 mt-1 block">
            {approachingDeadlines.length} Critical Cutoffs
          </span>
          <span className="text-[11px] text-blue-800 font-medium">Next 30 court days</span>
        </div>

        <div
          onClick={() => setActiveReportTab('overdue')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            activeReportTab === 'overdue'
              ? 'bg-slate-100 border-[#06244B] shadow-sm'
              : 'bg-white border-[#D9D6CF] hover:border-[#06244B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#06244B]">Overdue Work By Staff</span>
            <Clock className="w-4 h-4 text-[#A4432B]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#06244B] mt-1 block">
            {overdueTasks.length} Overdue Tasks
          </span>
          <span className="text-[11px] text-[#667085]">Supervisory escalation</span>
        </div>
      </div>

      {/* Report View Tabs Navigation */}
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center border-b border-[#D9D6CF] bg-[#FAF8F5] px-4 pt-3 gap-x-4 gap-y-1">
          {[
            { id: 'stalled', label: `Stalled Matters (${stalledMatters.length})`, icon: AlertTriangle },
            { id: 'missing-docs', label: `Missing Documents (${missingDocMatters.length})`, icon: FileCheck },
            { id: 'deadlines', label: `Approaching Deadlines (${approachingDeadlines.length})`, icon: Calendar },
            { id: 'overdue', label: `Overdue Work (${overdueTasks.length})`, icon: Clock },
            { id: 'all', label: `Master Roster & Budget (${matters.length})`, icon: FolderOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id)}
                className={`pb-3 px-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#A4432B] text-[#A4432B]'
                    : 'border-transparent text-[#667085] hover:text-[#06244B]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Stalled Matters */}
        {activeReportTab === 'stalled' && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085]">
              <span>Matters with no docket activity, filings, or task progress for more than 30 days:</span>
              <span className="font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 whitespace-nowrap shrink-0 self-start sm:self-auto">
                Action Required: Case Audit &amp; Supervisor Review
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Matter Docket</th>
                    <th className="py-2.5 px-3">Practice Group</th>
                    <th className="py-2.5 px-3">Current Stage</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Inactivity Duration</th>
                    <th className="py-2.5 px-3">Identified Bottleneck Reason</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lead Attorney</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Escalation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {stalledMatters.map(m => (
                    <tr key={m.id} className="hover:bg-amber-50/40">
                      <td className="py-3 px-3 font-semibold text-[#06244B] min-w-[180px]">
                        <span className="font-bold block whitespace-nowrap">{m.matterNumber}</span>
                        <span className="text-[11px] text-[#667085] leading-snug block mt-0.5">{m.title}</span>
                      </td>
                      <td className="py-3 px-3 text-[#202A35] font-medium min-w-[140px]">{m.practiceArea}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block whitespace-nowrap bg-[#F5F0E5] text-[#06244B] px-2 py-0.5 rounded font-semibold text-[11px] border border-[#D9D6CF]">
                          {m.currentStage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block whitespace-nowrap font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded text-xs">
                          {m.daysInactive} Days Inactive
                        </span>
                        <span className="block whitespace-nowrap text-[10px] text-[#667085] mt-1">Since {m.lastActivityDate}</span>
                      </td>
                      <td className="py-3 px-3 text-[#202A35] min-w-[180px] max-w-xs">{m.stalledReason}</td>
                      <td className="py-3 px-3 font-semibold text-[#06244B] whitespace-nowrap">{m.leadAttorney}</td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="xs"
                          variant="primary"
                          icon={Send}
                          onClick={() => addToast(`Supervisor Escalation Notice dispatched to ${m.leadAttorney} for matter ${m.matterNumber}!`, 'success')}
                        >
                          Escalate to Partner
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Missing Documents */}
        {activeReportTab === 'missing-docs' && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085]">
              <span>Mandatory gatekeeper documents and statutory records missing from active client files:</span>
              <span className="font-bold text-rose-900 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 whitespace-nowrap shrink-0 self-start sm:self-auto">
                Non-Compliance Risk (RPC 1.3 / Court Order)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Matter Docket</th>
                    <th className="py-2.5 px-3">Missing Required Instrument</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Days Pending</th>
                    <th className="py-2.5 px-3">Severity &amp; Consequence</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Responsible Staff</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {missingDocMatters.map(d => (
                    <tr key={d.id} className="hover:bg-rose-50/40">
                      <td className="py-3 px-3 font-semibold text-[#06244B] min-w-[160px]">
                        <span className="font-bold block whitespace-nowrap">{d.matterNumber}</span>
                        <span className="text-[11px] text-[#667085]">{d.clientName}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-900 min-w-[180px] max-w-xs">{d.missingDocument}</td>
                      <td className="py-3 px-3 text-[#202A35] whitespace-nowrap">{d.category}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block whitespace-nowrap font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          {d.daysPending} days
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-rose-800 text-[11px] min-w-[160px]">{d.severity}</td>
                      <td className="py-3 px-3 font-medium text-[#06244B] whitespace-nowrap">{d.responsibleStaff}</td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          icon={Send}
                          onClick={() => addToast(`Document upload request dispatched to ${d.clientName} via secure portal.`, 'success')}
                        >
                          Request from Client
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Approaching Deadlines */}
        {activeReportTab === 'deadlines' && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085]">
              <span>Court-mandated statutory cutoffs and jurisdictional deadlines due in the next 30 days:</span>
              <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 whitespace-nowrap shrink-0 self-start sm:self-auto">
                Rule 6 Utah Civil Procedure Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Matter Docket</th>
                    <th className="py-2.5 px-3">Statutory Deadline &amp; Event</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Rule Citation</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Due Date</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Days Remaining</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Responsible Counsel</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {approachingDeadlines.map(cd => (
                    <tr key={cd.id} className="hover:bg-blue-50/40">
                      <td className="py-3 px-3 font-semibold text-[#06244B] min-w-[170px]">
                        <span className="font-bold block whitespace-nowrap">{cd.matterNumber}</span>
                        <span className="text-[11px] text-[#667085]">{cd.matterTitle}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#06244B] min-w-[180px] max-w-xs">{cd.deadlineTitle}</td>
                      <td className="py-3 px-3 text-blue-900 font-semibold font-mono whitespace-nowrap">{cd.ruleCitation}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#06244B] whitespace-nowrap">{cd.dueDate}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block whitespace-nowrap font-bold px-2 py-0.5 rounded text-xs ${
                          cd.daysRemaining <= 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {cd.daysRemaining} Days Left
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#06244B] whitespace-nowrap">{cd.responsibleCounsel}</td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          icon={Calendar}
                          onClick={() => addToast(`Calendar notification synced for ${cd.deadlineTitle}.`, 'info')}
                        >
                          View on Docket
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Overdue Work by Staff */}
        {activeReportTab === 'overdue' && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085]">
              <span>Tasks past statutory or internal completion deadlines categorized by employee workload:</span>
              <span className="font-bold text-rose-900 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 whitespace-nowrap shrink-0 self-start sm:self-auto">
                Staff Workload Escalation Queue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Overdue Task Description</th>
                    <th className="py-2.5 px-3">Linked Matter</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Assigned Employee</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Original Due Date</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Days Overdue</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {overdueTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-rose-900 min-w-[180px] max-w-xs">{t.title}</td>
                      <td className="py-3 px-3 text-[#202A35] min-w-[160px]">{t.matterTitle}</td>
                      <td className="py-3 px-3 font-bold text-[#06244B] whitespace-nowrap">{t.assignedTo}</td>
                      <td className="py-3 px-3 text-[#667085] whitespace-nowrap">{t.role}</td>
                      <td className="py-3 px-3 text-center text-[#667085] whitespace-nowrap">{t.dueDate}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block whitespace-nowrap bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-xs">
                          {t.daysOverdue} Days Late
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => addToast(`Reassignment request sent for task: ${t.title}.`, 'info')}
                        >
                          Reassign Task
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Master Roster */}
        {activeReportTab === 'all' && (
          <div className="p-4 space-y-4">
            <DataTable
              columns={masterColumns}
              data={matters}
              pageSize={10}
            />
          </div>
        )}
      </div>
    </div>
  );
}
