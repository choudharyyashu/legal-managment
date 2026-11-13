import React, { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, AlertTriangle, MessageSquare, ExternalLink, Filter } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function TimeApprovals() {
  const { timeEntries, approveTimeEntry, rejectTimeEntry } = useTime();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pendingEntries = timeEntries.filter(t => t.status === 'Submitted');
  const approvedEntries = timeEntries.filter(t => t.status === 'Approved' || t.status === 'Exported');
  const rejectedEntries = timeEntries.filter(t => t.status === 'Rejected');

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: pendingEntries.length, icon: Clock },
    { id: 'approved', label: 'Approved & Billable', count: approvedEntries.length, icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected Entries', count: rejectedEntries.length, icon: XCircle },
  ];

  const handleApprove = (id) => {
    if (!permissions.canApproveTime) {
      addToast('Unauthorized: Approving time entries requires Supervisor or Partner authority.', 'error');
      return;
    }
    approveTimeEntry(id, `Approved by ${currentUser.name} on ${new Date().toLocaleDateString()}`);
    addToast('Time entry approved. Now eligible for client billing & CosmoLex export.', 'success');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!permissions.canApproveTime) {
      addToast('Unauthorized: Reviewing time entries requires Supervisor or Partner authority.', 'error');
      return;
    }
    if (!rejectReason.trim()) {
      addToast('Please provide an explanation for rejection.', 'error');
      return;
    }

    rejectTimeEntry(selectedEntry.id, rejectReason);
    addToast('Time entry rejected. Log retained in audit ledger with reason.', 'warning');
    setRejectModalOpen(false);
    setSelectedEntry(null);
    setRejectReason('');
  };

  const currentList = activeTab === 'pending' ? pendingEntries : activeTab === 'approved' ? approvedEntries : rejectedEntries;

  const columns = [
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
      render: (val, row) => (
        <div>
          <p className="text-xs text-[#202A35] max-w-md line-clamp-2">{val}</p>
          {row.reviewComment && (
            <p className="text-[11px] text-[#A4432B] mt-0.5 italic">Note: "{row.reviewComment}"</p>
          )}
        </div>
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
      label: 'Fee Amount',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Review Action',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'Submitted' && permissions.canApproveTime && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-[#B42318] hover:bg-red-50 border-red-200"
                onClick={() => {
                  setSelectedEntry(row);
                  setRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleApprove(row.id)}
              >
                Approve
              </Button>
            </>
          )}
          {row.status !== 'Submitted' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedEntry(row)}
            >
              View Record
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time &amp; Billing Supervisory Approvals"
        subtitle="Review, approve, or reject logged hours before invoicing or exporting to CosmoLex accounting."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Time Approvals' }]}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Approvals Table */}
      <DataTable
        columns={columns}
        data={currentList}
        pageSize={8}
        emptyMessage={`No ${activeTab} time records found in the review queue.`}
      />

      {/* Rejection Modal with Comment */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Time Entry"
        subtitle={`Entry ID: ${selectedEntry?.id} • ${selectedEntry?.userName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="p-3 bg-red-50 text-red-950 rounded border border-red-200 text-xs">
            <p className="font-bold">{selectedEntry?.matterTitle}</p>
            <p className="mt-1">{selectedEntry?.hours} hrs • {formatCurrency(selectedEntry?.amount)}</p>
            <p className="italic mt-1 text-[#667085]">"{selectedEntry?.description}"</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Reason for Rejection / Modification Instructions <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Activity must be categorized under non-billable overhead per outside counsel guidelines..."
              className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#B42318]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={Boolean(selectedEntry) && !rejectModalOpen}
        onClose={() => setSelectedEntry(null)}
        title={`Time Entry Details: ${selectedEntry?.id}`}
        maxWidth="max-w-md"
      >
        {selectedEntry && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] space-y-1">
              <p><strong>Timekeeper:</strong> {selectedEntry.userName}</p>
              <p><strong>Matter:</strong> {selectedEntry.matterTitle}</p>
              <p><strong>Date:</strong> {formatDate(selectedEntry.date)}</p>
              <p><strong>Rate &amp; Hours:</strong> {selectedEntry.hours} hrs @ ${selectedEntry.rate}/hr = {formatCurrency(selectedEntry.amount)}</p>
              <div className="pt-2">
                <StatusBadge status={selectedEntry.status} />
              </div>
            </div>

            <div>
              <span className="font-bold text-[#06244B] uppercase text-[10px]">Work Description:</span>
              <p className="p-3 bg-white border border-[#D9D6CF] rounded mt-1 leading-relaxed text-sm">
                {selectedEntry.description}
              </p>
            </div>

            {selectedEntry.reviewComment && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900">
                <span className="font-bold uppercase text-[10px] block">Reviewer Comment:</span>
                <p className="mt-1">{selectedEntry.reviewComment}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

