import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, Eye, Edit, Building2, User, Phone, Mail, FolderOpen, RotateCcw } from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { Modal } from '../../../components/ui/Modal';
import { ClientForm } from '../forms/ClientForm';
import { formatCurrency } from '../../../utils/formatCurrency';

export function ClientsList() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { allUsers } = useAuth();
  const permissions = usePermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attorneyFilter, setAttorneyFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Attorneys for filter
  const attorneys = allUsers.filter(u => u.role === 'attorney' || u.role === 'super_admin');

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        searchQuery === '' ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === '' || client.status === statusFilter;
      const matchesAttorney = attorneyFilter === '' || client.assignedAttorneyId === attorneyFilter;

      return matchesSearch && matchesStatus && matchesAttorney;
    });
  }, [clients, searchQuery, statusFilter, attorneyFilter]);

  const columns = [
    {
      key: 'name',
      label: 'Client Name & Reference',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#F5F0E5] border border-[#D9D6CF] flex items-center justify-center text-[#06244B] flex-shrink-0">
            {row.type === 'Organization' ? <Building2 className="w-4 h-4 text-[#A4432B]" /> : <User className="w-4 h-4 text-[#06244B]" />}
          </div>
          <div>
            <span className="font-semibold text-[#06244B] hover:text-[#A4432B] block cursor-pointer">
              {row.name}
            </span>
            <span className="text-[11px] text-[#667085]">{row.id} • {row.type}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'primaryContact',
      label: 'Primary Contact & Comms',
      render: (val, row) => (
        <div>
          <p className="font-medium text-xs text-[#202A35]">{row.primaryContact || '—'}</p>
          <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#A4432B]" /> {row.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#06244B]" /> {row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedAttorneyName',
      label: 'Assigned Counsel',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold text-[#06244B]">{val || 'Unassigned'}</span>
      ),
    },
    {
      key: 'totalMatters',
      label: 'Matters',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B]">
          <FolderOpen className="w-3 h-3 text-[#A4432B]" />
          {val}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      label: 'Ledger Balance',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className={`text-xs font-semibold ${val > 0 ? 'text-[#B42318]' : 'text-[#287A55]'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/clients/${row.id}`)}
            className="p-1 rounded text-[#06244B] hover:bg-[#F5F0E5] hover:text-[#A4432B]"
            title="View Client Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {permissions.canCreateClient && (
            <button
              onClick={() => setEditingClient(row)}
              className="p-1 rounded text-[#667085] hover:bg-[#F5F0E5] hover:text-[#06244B]"
              title="Edit Client"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Directory"
        subtitle="Active corporations, trusts, and individuals represented by Heugly &amp; Bludworth."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'All Clients' }]}
        actions={
          permissions.canCreateClient && (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Client
            </Button>
          )
        }
      />

      {/* Unified Executive Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, reference ID, email..."
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
            <option value="Active">Active (Retained)</option>
            <option value="Prospective">Prospective</option>
            <option value="Inactive">Inactive / Closed</option>
          </select>

          <select
            value={attorneyFilter}
            onChange={(e) => setAttorneyFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Assigned Counsel: All</option>
            {attorneys.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {(searchQuery || statusFilter || attorneyFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setAttorneyFilter('');
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

      {/* Clients Data Grid */}
      <DataTable
        columns={columns}
        data={filteredClients}
        pageSize={8}
        onRowClick={(client) => navigate(`/clients/${client.id}`)}
        emptyMessage="No clients found matching the applied search or filters."
      />

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        subtitle="Enter client contact, representation details, and relationship counsel."
        maxWidth="max-w-2xl"
      >
        <ClientForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={Boolean(editingClient)}
        onClose={() => setEditingClient(null)}
        title={`Edit Client: ${editingClient?.name}`}
        subtitle="Update corporate or individual client details."
        maxWidth="max-w-2xl"
      >
        {editingClient && (
          <ClientForm
            initialData={editingClient}
            onSuccess={() => setEditingClient(null)}
            onCancel={() => setEditingClient(null)}
          />
        )}
      </Modal>
    </div>
  );
}

