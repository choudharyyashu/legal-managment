import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Search, Download, Filter, Key, CheckCircle2, Sparkles, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { formatDate } from '../../../utils/formatDate';
import { reportService } from '../../../services/reportService';

export function AuditLogs() {
  const { addToast } = useToast();
  const [activeLogTab, setActiveLogTab] = useState('security'); // 'security' | 'workflow'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    reportService.getAuditLogs({ limit: 100 })
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load audit logs:', err?.message);
        setLogs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Workflow Execution Logs derived from real audit events
  const workflowLogs = React.useMemo(() => {
    return logs
      .filter((l) => l.action?.includes('DRAFT') || l.action?.includes('TASK') || l.action?.includes('WORKFLOW') || l.action?.includes('CONFLICT'))
      .map((l, idx) => ({
        id: `WF-${l.id.substring(0, 8)}`,
        timestamp: l.timestamp,
        ruleName: l.action,
        matter: l.target,
        triggeredBy: l.user,
        spawnedTasks: l.action?.includes('TASK') ? 1 : 0,
        details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details || {}),
        status: l.status,
      }));
  }, [logs]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleRetryWorkflow = (logId) => {
    setWorkflowLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'Success', details: 'Manual retry executed successfully.' } : l));
    addToast('Workflow rule retry simulation executed successfully.', 'success');
  };

  const filteredLogs = logs.filter(l =>
    l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkflowLogs = workflowLogs.filter(l =>
    l.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const securityColumns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (val) => <span className="text-xs font-mono text-[#06244B]">{val}</span>,
    },
    {
      key: 'user',
      label: 'User & Role',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B] block">{val}</span>
          <span className="text-[10px] text-[#667085]">{row.role}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Security Action Code',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-bold text-[#A4432B] px-2 py-0.5 rounded bg-[#A4432B]/10">
          {val}
        </span>
      ),
    },
    {
      key: 'target',
      label: 'Operation Target & Scope',
      render: (val) => <span className="text-xs text-[#202A35] max-w-sm block truncate">{val}</span>,
    },
    {
      key: 'ipAddress',
      label: 'Network IP',
      render: (val) => <span className="font-mono text-[11px] text-[#667085]">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  const workflowColumns = [
    {
      key: 'timestamp',
      label: 'Execution Time',
      sortable: true,
      render: (val) => <span className="text-xs font-mono text-[#06244B]">{val}</span>,
    },
    {
      key: 'ruleName',
      label: 'Workflow Engine Rule',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-[11px] font-bold text-[#06244B] px-2 py-0.5 rounded bg-[#06244B]/10">
          {val}
        </span>
      ),
    },
    {
      key: 'matter',
      label: 'Target Matter Docket',
      render: (val) => <span className="text-xs font-semibold text-[#06244B] block">{val}</span>,
    },
    {
      key: 'details',
      label: 'Rule Output & Trigger Payload',
      render: (val, row) => (
        <div>
          <span className="text-xs text-[#202A35] block">{val}</span>
          <span className="text-[10px] text-[#667085]">Triggered by: {row.triggeredBy} • {row.spawnedTasks} tasks spawned</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Engine Status',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={val} />
          {val === 'Retry Required' && (
            <button
              type="button"
              onClick={() => handleRetryWorkflow(row.id)}
              className="text-[10px] text-[#A4432B] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Retry
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleExportAuditLogs = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let csvContent = '';
      let filename = '';

      if (activeLogTab === 'security') {
        filename = `Security_Audit_Logs_${today}.csv`;
        const headers = ['Log ID', 'Timestamp', 'User Name', 'Role', 'Security Action Code', 'Operation Target', 'Network IP', 'Status'];
        const rows = filteredLogs.map(l => [
          `"${(l.id || '').replace(/"/g, '""')}"`,
          `"${(l.timestamp || '').replace(/"/g, '""')}"`,
          `"${(l.user || '').replace(/"/g, '""')}"`,
          `"${(l.role || '').replace(/"/g, '""')}"`,
          `"${(l.action || '').replace(/"/g, '""')}"`,
          `"${(l.target || '').replace(/"/g, '""')}"`,
          `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
          `"${(l.status || '').replace(/"/g, '""')}"`,
        ]);
        csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      } else {
        filename = `Workflow_Execution_Audit_Logs_${today}.csv`;
        const headers = ['Log ID', 'Timestamp', 'Rule Name', 'Trigger Type', 'Matter', 'Triggered By', 'Spawned Tasks', 'Engine Status', 'Details'];
        const rows = filteredWorkflowLogs.map(l => [
          `"${(l.id || '').replace(/"/g, '""')}"`,
          `"${(l.timestamp || '').replace(/"/g, '""')}"`,
          `"${(l.ruleName || '').replace(/"/g, '""')}"`,
          `"${(l.triggerType || '').replace(/"/g, '""')}"`,
          `"${(l.matter || '').replace(/"/g, '""')}"`,
          `"${(l.triggeredBy || '').replace(/"/g, '""')}"`,
          l.spawnedTasks || 0,
          `"${(l.status || '').replace(/"/g, '""')}"`,
          `"${(l.details || '').replace(/"/g, '""')}"`,
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

      addToast(`Audit logs (${activeLogTab}) exported to CSV successfully!`, 'success');
    } catch (err) {
      console.error('Failed to export audit logs:', err);
      addToast('Failed to export audit logs.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security &amp; Workflow Audit Engine"
        subtitle="Immutable records of sensitive user operations, Utah RPC conflict clearances, and Filevine-style automated workflow triggers."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Audit Logs' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeLogTab === 'security' ? 'primary' : 'outline'}
              onClick={() => setActiveLogTab('security')}
            >
              <Key className="w-3.5 h-3.5 mr-1" />
              Security Access Logs
            </Button>
            <Button
              size="sm"
              variant={activeLogTab === 'workflow' ? 'primary' : 'outline'}
              onClick={() => setActiveLogTab('workflow')}
            >
              <Layers className="w-3.5 h-3.5 mr-1" />
              Workflow Execution Logs
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleExportAuditLogs}
            >
              Export Logs (CSV)
            </Button>
          </div>
        }
      />

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={activeLogTab === 'security' ? 'Filter security logs by action or user...' : 'Filter workflow executions by rule or matter...'}
        />
      </div>

      {activeLogTab === 'security' ? (
        <DataTable
          columns={securityColumns}
          data={filteredLogs}
          pageSize={10}
        />
      ) : (
        <DataTable
          columns={workflowColumns}
          data={filteredWorkflowLogs}
          pageSize={10}
        />
      )}
    </div>
  );
}

