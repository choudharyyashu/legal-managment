import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight, Database, FileText, CheckSquare, Square } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function BillableHours() {
  const navigate = useNavigate();
  const { timeEntries, exportApprovedToCosmoLex } = useTime();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Only show approved or exported hours
  const approvedEntries = useMemo(() => {
    return timeEntries.filter(t => (t.status === 'Approved' || t.status === 'Exported') && t.isBillable);
  }, [timeEntries]);

  const filteredEntries = useMemo(() => {
    return approvedEntries.filter(t =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.matterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [approvedEntries, searchQuery]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map(e => e.id));
    }
  };

  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      addToast('Please select at least one approved entry to export.', 'warning');
      return;
    }
    const batch = exportApprovedToCosmoLex(selectedIds, currentUser.name);
    if (batch) {
      addToast(`Batch ${batch.batchId} (${batch.entriesCount} entries / ${batch.totalHours} hrs) successfully exported to CosmoLex.`, 'success');
      setSelectedIds([]);
      navigate('/billing/cosmolex');
    }
  };

  const columns = [
    {
      key: 'select',
      label: 'Select',
      align: 'center',
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          disabled={row.status === 'Exported'}
          onChange={() => toggleSelect(row.id)}
          className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer disabled:opacity-40"
        />
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">{formatDate(val, { short: true })}</span>,
    },
    {
      key: 'userName',
      label: 'Timekeeper',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#202A35]">{val}</span>,
    },
    {
      key: 'matterTitle',
      label: 'Matter & Client',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B] block max-w-xs truncate">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Activity Description',
      render: (val) => <span className="text-xs text-[#202A35] max-w-md block line-clamp-2">{val}</span>,
    },
    {
      key: 'hours',
      label: 'Approved Hours',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#A4432B]">{formatHours(val)}</span>,
    },
    {
      key: 'amount',
      label: 'Billable Value',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'CosmoLex Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approved Billable Hours"
        subtitle="Time entries cleared by supervising counsel, ready for client billing and CosmoLex accounting ledger transfer."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Billable Hours' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/billing/invoices')}
            >
              Draft Invoice
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Database}
              disabled={selectedIds.length === 0}
              onClick={handleExportSelected}
            >
              Export Selected ({selectedIds.length}) to CosmoLex
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-md w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search approved hours..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Button size="sm" variant="outline" onClick={selectAll}>
            {selectedIds.length === filteredEntries.length ? 'Deselect All' : 'Select All Ready'}
          </Button>
          <span className="text-[#667085]">
            {selectedIds.length} of {filteredEntries.length} entries selected
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredEntries}
        pageSize={10}
        emptyMessage="No approved billable hours available for the current filter."
      />
    </div>
  );
}

