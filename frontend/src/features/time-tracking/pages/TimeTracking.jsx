import React, { useState, useMemo } from 'react';
import { Clock, Plus, Filter, Search, CheckCircle2, DollarSign, Calendar, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { Modal } from '../../../components/ui/Modal';
import { TimeEntryForm } from '../forms/TimeEntryForm';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function TimeTracking() {
  const { timeEntries } = useTime();
  const { currentUser, allUsers } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      const matchesSearch =
        searchQuery === '' ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.matterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === '' || entry.status === statusFilter;
      const matchesUser = userFilter === '' || entry.userId === userFilter;

      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [timeEntries, searchQuery, statusFilter, userFilter]);

  const totalHours = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const totalAmount = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const billableHours = filteredEntries.filter(e => e.isBillable).reduce((sum, e) => sum + (e.hours || 0), 0);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">{formatDate(val, { short: true })}</span>,
    },
    {
      key: 'userName',
      label: 'Personnel',
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
      label: 'Activity Description & UTBMS Scope',
      render: (val) => (
        <span className="text-xs text-[#202A35] max-w-md block line-clamp-2" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'hours',
      label: 'Duration',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#A4432B]">{formatHours(val)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <div className="text-xs text-right">
          <span className="font-bold text-[#06244B] block">{formatCurrency(val)}</span>
          <span className="text-[10px] text-[#667085]">${row.rate}/hr</span>
        </div>
      ),
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
      <PageHeader
        title="Time Tracking &amp; Activity Ledger"
        subtitle="Record daily attorney and staff billable activities, client conferences, and document preparation."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Time Tracking' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Clock}
            onClick={() => setIsLogModalOpen(true)}
          >
            Log Time Entry
          </Button>
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#667085]">Filtered Total Hours</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">{formatHours(totalHours)}</p>
          <span className="text-[11px] text-[#287A55] font-semibold">{formatHours(billableHours)} billable</span>
        </div>

        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#667085]">Calculated Fee Value</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">{formatCurrency(totalAmount)}</p>
          <span className="text-[11px] text-[#667085]">Based on attorney rate schedules</span>
        </div>

        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#667085]">Logged Entries</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">{filteredEntries.length} Records</p>
          <span className="text-[11px] text-[#A66A16] font-semibold">
            {filteredEntries.filter(e => e.status === 'Submitted').length} pending supervisory review
          </span>
        </div>
      </div>

      {/* Unified Executive Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, matter, or lawyer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#A4432B]" />
            <span className="uppercase text-[10px] tracking-wider font-mono">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Exported">Exported to CosmoLex</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Timekeeper: All</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {(searchQuery || statusFilter || userFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setUserFilter('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#A4432B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Clear all filters and search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <DataTable
        columns={columns}
        data={filteredEntries}
        pageSize={8}
      />

      {/* Log Time Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Billable Time"
        subtitle="Record legal activity against a matter for supervisory review and billing."
        maxWidth="max-w-2xl"
      >
        <TimeEntryForm
          onSuccess={() => setIsLogModalOpen(false)}
          onCancel={() => setIsLogModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

