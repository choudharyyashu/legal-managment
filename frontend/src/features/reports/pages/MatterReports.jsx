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

  const [activeReportTab, setActiveReportTab] = useState('all');

  // Stalled Matters dynamically derived from live matters (inactive >30 days)
  const now = new Date();
  const stalledMatters = matters
    .filter((m) => m.status !== 'Concluded' && m.status !== 'Closed')
    .filter((m) => {
      const updated = m.updatedAt ? new Date(m.updatedAt) : new Date(m.createdAt || now);
      const daysDiff = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
      return daysDiff >= 30;
    })
    .map((m) => {
      const updated = m.updatedAt ? new Date(m.updatedAt) : new Date(m.createdAt || now);
      return {
        id: m.id,
        matterNumber: m.matterNumber,
        title: m.title,
        clientName: m.clientName || 'Firm Client',
        practiceArea: m.practiceAreaName || m.practiceArea || 'General Practice',
        leadAttorney: m.assignedAttorneyName || 'Thomas Bludworth, Esq.',
        currentStage: m.stage || m.status || 'Active',
        daysInactive: Math.max(30, Math.floor((now - updated) / (1000 * 60 * 60 * 24))),
        lastActivityDate: updated.toISOString().split('T')[0],
        stalledReason: 'No docket advancement or stage transition recorded in past 30 days.',
      };
    });

  // Missing Documents dynamically identified from live matters without documents attached
  const missingDocMatters = matters
    .filter((m) => !m.documentsCount || m.documentsCount === 0)
    .slice(0, 5)
    .map((m, idx) => ({
      id: `md-${m.id || idx}`,
      matterNumber: m.matterNumber,
      matterTitle: m.title,
      clientName: m.clientName || 'Firm Client',
      missingDocument: 'Initial Engagement Agreement & Representation Letter',
      category: 'Mandatory Engagement Filing',
      responsibleStaff: m.assignedAttorneyName || 'Thomas Bludworth, Esq.',
      daysPending: Math.max(1, Math.floor((now - new Date(m.createdAt || now)) / (1000 * 60 * 60 * 24))),
      severity: 'High (Required for Formal Filing)',
    }));

  // Approaching Deadlines dynamically derived from live tasks with due dates in next 30 days
  const approachingDeadlines = tasks
    .filter((t) => t.status !== 'Completed' && t.dueDate)
    .filter((t) => {
      const due = new Date(t.dueDate);
      const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .map((t) => {
      const due = new Date(t.dueDate);
      const daysRemaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
      return {
        id: t.id,
        matterNumber: t.matterNumber || 'Active Matter',
        matterTitle: t.matterTitle || t.title,
        deadlineTitle: t.title,
        ruleCitation: t.ruleCitation || 'Utah R. Civ. P. Schedule',
        dueDate: t.dueDate,
        daysRemaining,
        responsibleCounsel: t.assignedTo || 'Thomas Bludworth, Esq.',
        riskLevel: daysRemaining <= 3 ? 'Critical' : daysRemaining <= 7 ? 'Urgent' : 'Standard',
      };
    });

  // Overdue Tasks dynamically derived from live overdue tasks in firm
  const overdueTasks = tasks
    .filter((t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now)
    .map((t) => {
      const due = new Date(t.dueDate);
      const daysOverdue = Math.max(1, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
      return {
        id: t.id,
        title: t.title,
        matterTitle: t.matterTitle || 'Firm Matter',
        assignedTo: t.assignedTo || 'Firm Staff',
        role: t.role || 'Attorney',
        dueDate: t.dueDate,
        daysOverdue,
        priority: t.priority || 'High',
      };
    });

  const handleExportReport = () => {
    try {
      let csvContent = '';
      let filename = '';
      const today = new Date().toISOString().split('T')[0];

      if (activeReportTab === 'stalled') {
        filename = `Stalled_Matters_Audit_Report_${today}.csv`;
        const headers = ['Matter Number', 'Matter Caption / Title', 'Client Name', 'Practice Area', 'Lead Attorney', 'Current Stage', 'Days Inactive', 'Last Activity Date', 'Stalled Reason'];
        const rows = stalledMatters.map(m => [
          `"${(m.matterNumber || '').replace(/"/g, '""')}"`,
          `"${(m.title || '').replace(/"/g, '""')}"`,
          `"${(m.clientName || '').replace(/"/g, '""')}"`,
          `"${(m.practiceArea || '').replace(/"/g, '""')}"`,
          `"${(m.leadAttorney || '').replace(/"/g, '""')}"`,
          `"${(m.currentStage || '').replace(/"/g, '""')}"`,
          m.daysInactive || 0,
          `"${m.lastActivityDate || ''}"`,
          `"${(m.stalledReason || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      } else if (activeReportTab === 'missing-docs') {
        filename = `Missing_Gatekeeper_Documents_Report_${today}.csv`;
        const headers = ['Matter Number', 'Matter Title', 'Client Name', 'Missing Document', 'Category', 'Responsible Staff', 'Days Pending', 'Severity'];
        const rows = missingDocMatters.map(m => [
          `"${(m.matterNumber || '').replace(/"/g, '""')}"`,
          `"${(m.matterTitle || '').replace(/"/g, '""')}"`,
          `"${(m.clientName || '').replace(/"/g, '""')}"`,
          `"${(m.missingDocument || '').replace(/"/g, '""')}"`,
          `"${(m.category || '').replace(/"/g, '""')}"`,
          `"${(m.responsibleStaff || '').replace(/"/g, '""')}"`,
          m.daysPending || 0,
          `"${(m.severity || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      } else if (activeReportTab === 'deadlines') {
        filename = `Approaching_Court_Deadlines_Report_${today}.csv`;
        const headers = ['Matter Number', 'Matter Title', 'Deadline / Motion Cutoff', 'Rule / Statutory Citation', 'Due Date', 'Days Remaining', 'Responsible Counsel', 'Risk Level'];
        const rows = approachingDeadlines.map(m => [
          `"${(m.matterNumber || '').replace(/"/g, '""')}"`,
          `"${(m.matterTitle || '').replace(/"/g, '""')}"`,
          `"${(m.deadlineTitle || '').replace(/"/g, '""')}"`,
          `"${(m.ruleCitation || '').replace(/"/g, '""')}"`,
          `"${m.dueDate || ''}"`,
          m.daysRemaining || 0,
          `"${(m.responsibleCounsel || '').replace(/"/g, '""')}"`,
          `"${(m.riskLevel || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      } else if (activeReportTab === 'overdue') {
        filename = `Overdue_Tasks_Workload_Report_${today}.csv`;
        const headers = ['Task Title', 'Linked Matter Docket', 'Assigned To', 'Role', 'Due Date', 'Days Overdue', 'Priority'];
        const rows = overdueTasks.map(t => [
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${(t.matterTitle || '').replace(/"/g, '""')}"`,
          `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
          `"${(t.role || '').replace(/"/g, '""')}"`,
          `"${t.dueDate || ''}"`,
          t.daysOverdue || 0,
          `"${(t.priority || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      } else {
        filename = `Master_Matter_Portfolio_Report_${today}.csv`;
        const headers = ['Matter Number', 'Matter Caption', 'Client Name', 'Practice Area', 'Stage', 'Budget ($)', 'Billed to Date ($)', 'Status'];
        const rows = matters.map(m => [
          `"${(m.matterNumber || '').replace(/"/g, '""')}"`,
          `"${(m.title || '').replace(/"/g, '""')}"`,
          `"${(m.clientName || '').replace(/"/g, '""')}"`,
          `"${(m.practiceAreaName || m.practiceArea || '').replace(/"/g, '""')}"`,
          `"${(m.stage || '').replace(/"/g, '""')}"`,
          m.budget || 0,
          m.totalBilled || 0,
          `"${(m.status || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      }

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Operational Report (${activeReportTab.toUpperCase()}) exported and downloaded!`, 'success');
    } catch (err) {
      console.error('Failed to export operational report:', err);
      addToast('Failed to export operational report.', 'error');
    }
  };

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
              onClick={handleExportReport}
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
