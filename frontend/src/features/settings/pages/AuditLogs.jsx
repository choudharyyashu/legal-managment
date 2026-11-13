import React, { useState } from 'react';
import { ShieldAlert, Clock, Search, Download, Filter, Key, CheckCircle2, Sparkles, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { formatDate } from '../../../utils/formatDate';

export function AuditLogs() {
  const { addToast } = useToast();
  const [activeLogTab, setActiveLogTab] = useState('security'); // 'security' | 'workflow'

  const [logs] = useState([
    {
      id: 'AUD-991',
      timestamp: '2026-11-05 17:15',
      user: 'Eleanor Heugly, Esq.',
      role: 'Super Admin',
      action: 'TIME_APPROVAL',
      target: 'TIM-501 (Thomas Bludworth - 3.5 hrs)',
      ipAddress: '192.168.1.104',
      status: 'Success',
    },
    {
      id: 'AUD-992',
      timestamp: '2026-11-04 18:30',
      user: 'Rachel Adams',
      role: 'Billing Director',
      action: 'COSMOLEX_BATCH_EXPORT',
      target: 'Batch COSMO-2026-1101 (8 entries / $14,850.00)',
      ipAddress: '192.168.1.112',
      status: 'Success',
    },
    {
      id: 'AUD-993',
      timestamp: '2026-11-04 15:45',
      user: 'Thomas Bludworth, Esq.',
      role: 'Senior Partner',
      action: 'CONFLICT_CHECK_REVIEW',
      target: 'INT-902 (Vanguard Medical Devices - Adverse Identified)',
      ipAddress: '192.168.1.108',
      status: 'Conflict Flagged',
    },
    {
      id: 'AUD-994',
      timestamp: '2026-11-03 09:20',
      user: 'David Sterling, Esq.',
      role: 'Supervisor',
      action: 'TASK_DELEGATION',
      target: 'TSK-105 assigned to Marcus Vance',
      ipAddress: '192.168.1.115',
      status: 'Success',
    },
    {
      id: 'AUD-995',
      timestamp: '2026-11-02 11:00',
      user: 'Eleanor Heugly, Esq.',
      role: 'Super Admin',
      action: 'ROLE_PERMISSION_UPDATE',
      target: 'Updated Paralegal access to matter files',
      ipAddress: '192.168.1.104',
      status: 'Success',
    }
  ]);

  // Workflow Execution Logs (Filevine Reference)
  const [workflowLogs, setWorkflowLogs] = useState([
    {
      id: 'WF-701',
      timestamp: '2026-11-06 10:45 AM',
      ruleName: 'STAGE_ADVANCE_AUTO_SPAWN',
      matter: 'MAT-2025-0101 (Wasatch Mountain Logistics)',
      triggeredBy: 'Thomas Bludworth, Esq.',
      spawnedTasks: 2,
      details: 'Advanced to Expert Discovery; spawned Expert Retainer & Index Disclosure tasks.',
      status: 'Success',
    },
    {
      id: 'WF-702',
      timestamp: '2026-11-06 09:30 AM',
      ruleName: 'RULE_6_DEADLINE_SHIFT',
      matter: 'MAT-2025-0101 (Wasatch Mountain Logistics)',
      triggeredBy: 'Marcus Vance',
      spawnedTasks: 5,
      details: 'Trial date anchor shifted; recalculated 5 cascading pre-trial court cutoffs.',
      status: 'Success',
    },
    {
      id: 'WF-703',
      timestamp: '2026-11-05 02:15 PM',
      ruleName: 'INTAKE_CONFLICT_CLEARANCE',
      matter: 'INT-901 (Clearwater Basin Agricultural)',
      triggeredBy: 'Eleanor Heugly, Esq.',
      spawnedTasks: 0,
      details: 'Issued Utah RPC 1.7 Certificate UT-RPC1.7-889102; zero adverse hits.',
      status: 'Success',
    },
    {
      id: 'WF-704',
      timestamp: '2026-11-04 11:10 AM',
      ruleName: 'COSMOLEX_LEDGER_SYNC_ATTEMPT',
      matter: 'MAT-2024-0301 (Apex Horizon)',
      triggeredBy: 'System Automation Worker',
      spawnedTasks: 0,
      details: 'Simulated endpoint timeout: Gateway connection retry scheduled in 5m.',
      status: 'Retry Required',
    },
  ]);

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

