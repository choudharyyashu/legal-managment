import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, RefreshCw, ArrowUpRight, ShieldCheck, Clock, FileSpreadsheet, AlertTriangle, Key, AlertCircle } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';
import { integrationService } from '../../../services/integrationService';

export function CosmoLexSettings() {
  const { cosmoLexExports, exportApprovedToCosmoLex, timeEntries } = useTime();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [connectionStatus, setConnectionStatus] = useState('Checking Status...');
  const [tenantInfo, setTenantInfo] = useState('Awaiting Server Credentials');
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    integrationService.getStatuses()
      .then((list) => {
        const item = (list || []).find((i) => i.id === 'cosmolex');
        if (item) {
          setHasCredentials(Boolean(item.hasCredentials));
          setTenantInfo(item.tenant || 'Awaiting Server Credentials');
          setConnectionStatus(
            item.status === 'CONNECTED'
              ? 'Connected'
              : item.status === 'CONFIGURED'
              ? 'Configured'
              : 'Credentials Required'
          );
        } else {
          setConnectionStatus('Credentials Required');
        }
      })
      .catch((err) => {
        console.warn('Could not load CosmoLex status from backend:', err?.message);
        setConnectionStatus('Credentials Required');
      });
  }, []);

  const pendingReadyEntries = timeEntries.filter(t => t.status === 'Approved');

  const handleTestConnection = async () => {
    setIsTesting(true);
    addToast('Testing CosmoLex API endpoint connectivity via backend gateway...', 'info');
    try {
      const res = await integrationService.testConnection('cosmolex');
      if (res?.success) {
        setConnectionStatus('Connected');
        addToast(res.message || 'CosmoLex API handshake verified.', 'success');
      } else {
        setConnectionStatus(res?.status === 'BLOCKED' ? 'Upstream Blocked' : 'Credentials Required');
        addToast(res?.message || 'CosmoLex API credentials required in server environment.', 'warning');
      }
    } catch (err) {
      setConnectionStatus('Credentials Required');
      addToast(err?.message || 'Failed to verify CosmoLex connection.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunExport = () => {
    if (!permissions.canExportToCosmoLex) {
      addToast('Unauthorized: Exporting to CosmoLex requires Accounting or Super Admin privileges.', 'error');
      return;
    }

    if (pendingReadyEntries.length === 0) {
      addToast('No approved unexported entries available.', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      const entryIds = pendingReadyEntries.map(e => e.id);
      const batch = exportApprovedToCosmoLex(entryIds, currentUser?.name || 'Authorized Staff');
      setIsExporting(false);

      if (hasCredentials) {
        addToast(`Batch ${batch.batchId} created and staged for CosmoLex ledger sync.`, 'success');
      } else {
        addToast(
          `Batch ${batch.batchId} recorded internally. External CosmoLex live sync is unconfigured pending API credentials.`,
          'info'
        );
      }
    } catch (err) {
      setIsExporting(false);
      addToast(err?.message || 'Failed to generate export batch.', 'error');
    }
  };

  const columns = [
    {
      key: 'batchId',
      label: 'Export Batch ID',
      sortable: true,
      render: (val) => <span className="font-mono text-xs font-bold text-[#A4432B]">{val}</span>,
    },
    {
      key: 'exportedAt',
      label: 'Export Timestamp',
      sortable: true,
      render: (val) => <span className="text-xs text-[#06244B]">{val}</span>,
    },
    {
      key: 'exportedBy',
      label: 'Transmitted By',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35]">{val}</span>,
    },
    {
      key: 'entriesCount',
      label: 'Entries',
      align: 'center',
      render: (val) => <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F0E5]">{val} items</span>,
    },
    {
      key: 'totalHours',
      label: 'Hours',
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatHours(val)}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total Value',
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#287A55]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'CosmoLex Sync Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CosmoLex Integration &amp; Export Bridge"
        subtitle="Optional downstream general ledger batch export bridge. Native double-entry accounting operates independently inside LegalPro (Utah RPC 1.15)."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'CosmoLex Export' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleTestConnection}
            loading={isTesting}
            disabled={isTesting}
          >
            {isTesting ? 'Verifying Gateway...' : 'Test API Connection'}
          </Button>
        }
      />

      {/* Integration Status Card */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded bg-[#06244B] text-[#F5F0E5] flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-[#06244B]">
                  CosmoLex Legal Practice Accounting Engine
                </h2>
                <StatusBadge status={connectionStatus} />
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Firm Gateway Status: <strong>{tenantInfo}</strong> • Protocol: <strong>REST API Bridge</strong>
              </p>
              <p className="text-[11px] text-[#A4432B] font-semibold mt-1">
                CosmoLex is optional. Full standalone General Ledger, Trust Sub-Ledgers, and Utah RPC 1.15 Compliance are maintained natively.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="primary"
              disabled={!permissions.canExportToCosmoLex || pendingReadyEntries.length === 0 || isExporting}
              loading={isExporting}
              onClick={handleRunExport}
              title={!permissions.canExportToCosmoLex ? 'Requires Accounting / Super Admin authorization' : undefined}
            >
              Export {pendingReadyEntries.length} Approved Entries
            </Button>
          </div>
        </div>

        {/* Sync Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#D9D6CF]/60 text-xs">
          <div>
            <span className="text-[#667085] block font-medium">Connection State:</span>
            <span className={`font-bold text-sm flex items-center gap-1 ${
              connectionStatus === 'Connected' ? 'text-[#287A55]' : 'text-[#A4432B]'
            }`}>
              {connectionStatus === 'Connected' ? (
                <CheckCircle2 className="w-4 h-4 text-[#287A55]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#A4432B]" />
              )}
              {connectionStatus}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Last Successful Export:</span>
            <span className="font-bold text-sm text-[#06244B]">{cosmoLexExports[0]?.exportedAt || '—'}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Ready for Export:</span>
            <span className="font-bold text-sm text-[#A4432B]">{pendingReadyEntries.length} Entries</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Total Batches Synced:</span>
            <span className="font-bold text-sm text-[#06244B]">{cosmoLexExports.length} Batches</span>
          </div>
        </div>
      </div>

      {/* Batch Export History Table */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-base text-[#06244B]">
          Export Transmission History
        </h3>
        <DataTable
          columns={columns}
          data={cosmoLexExports}
          pageSize={10}
        />
      </div>

      {/* CosmoLex Config Settings Form */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
          CosmoLex API Gateway Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              CosmoLex Firm Tenant Status
            </label>
            <input
              type="text"
              readOnly
              value={tenantInfo}
              className="w-full p-2 rounded border border-[#D9D6CF] bg-[#F5F0E5]/40 text-[#667085] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              Target Endpoint URL
            </label>
            <input
              type="text"
              readOnly
              value={hasCredentials ? "https://api.cosmolex.com/v3/sync/batch" : "Not configured (Set COSMOLEX_API_KEY)"}
              className="w-full p-2 rounded border border-[#D9D6CF] bg-[#F5F0E5]/40 text-[#667085] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              Default General Ledger Income Account
            </label>
            <input
              type="text"
              readOnly
              value="GL-4010 Legal Fees Earned"
              className="w-full p-2 rounded border border-[#D9D6CF] bg-white text-[#06244B] text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              Expense Pass-Through Account
            </label>
            <input
              type="text"
              readOnly
              value="GL-1250 Advanced Client Costs (Asset)"
              className="w-full p-2 rounded border border-[#D9D6CF] bg-white text-[#06244B] text-xs"
            />
          </div>
        </div>

        <p className="text-[11px] text-[#667085]">
          Field mappings conform to LEDES 1998B and UTBMS litigation task codes.
        </p>
      </div>
    </div>
  );
}

