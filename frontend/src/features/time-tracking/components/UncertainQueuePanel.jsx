import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  Edit2,
  Clock,
  ShieldAlert,
  Search,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchBar } from '../../../components/shared/SearchBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatHours, formatCurrency } from '../../../utils/formatCurrency';

/**
 * Uncertain / Unmatched billing queue requiring manual review (never auto-approved).
 */
export function UncertainQueuePanel({
  items = [],
  matters = [],
  activeSlotId = '',
  onMarkReviewed,
  onApproveConfirmed,
  onRejectConfirmed,
  onEditSaved,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [reviewItem, setReviewItem] = useState(null);
  const [reviewNoteDraft, setReviewNoteDraft] = useState('');

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    matterId: '',
    description: '',
    suggestedHours: '',
    detectedRate: '',
    reviewNote: '',
  });
  const [editErrors, setEditErrors] = useState({});

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSlot = !activeSlotId || item.slotId === activeSlotId;
      const matchesStatus = !statusFilter || item.reviewStatus === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.matterTitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.uncertaintyReason.toLowerCase().includes(q);
      return matchesSlot && matchesStatus && matchesQuery;
    });
  }, [items, activeSlotId, statusFilter, searchQuery]);

  const openReviewModal = (item) => {
    setReviewItem(item);
    setReviewNoteDraft(item.reviewNote || '');
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditForm({
      matterId: item.matterId || '',
      description: item.description || '',
      suggestedHours: String(item.suggestedHours ?? ''),
      detectedRate: String(item.detectedRate ?? ''),
      reviewNote: item.reviewNote || '',
    });
    setEditErrors({});
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.description.trim()) errors.description = 'Description is required.';
    const hoursNum = parseFloat(editForm.suggestedHours);
    if (Number.isNaN(hoursNum) || hoursNum <= 0) {
      errors.suggestedHours = 'Suggested duration must be greater than 0.';
    }
    const rateNum = parseFloat(editForm.detectedRate);
    if (Number.isNaN(rateNum) || rateNum <= 0) {
      errors.detectedRate = 'Billing rate must be greater than 0.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const selectedMatter = matters.find((m) => m.id === editForm.matterId);
    onEditSaved(editItem.id, {
      matterId: selectedMatter ? selectedMatter.id : '',
      matterNumber: selectedMatter ? selectedMatter.matterNumber : 'UNMATCHED',
      matterTitle: selectedMatter
        ? selectedMatter.title
        : 'No automatic matter match — manual assignment required',
      clientId: selectedMatter ? selectedMatter.clientId : '',
      clientName: selectedMatter ? selectedMatter.clientName : editItem.clientName,
      description: editForm.description.trim(),
      suggestedHours: Number(hoursNum.toFixed(1)),
      detectedRate: Number(rateNum.toFixed(2)),
      reviewNote: editForm.reviewNote.trim(),
    });
    setEditItem(null);
  };

  return (
    <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#D9D6CF] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#A4432B]" />
              Uncertain / Unmatched Time Queue ({filteredItems.length})
            </h3>
            <p className="text-xs text-[#667085]">
              Entries flagged due to ambiguous matter links, unmatched callers, or inactivity gaps.{' '}
              <strong className="text-[#06244B]">Manual confirmation is required</strong> — uncertain items are never auto-approved.
            </p>
          </div>
          <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-semibold px-2.5 py-1 rounded">
            Manual Review Required
          </span>
        </div>

        {/* Unified Search & Status Filters */}
        <div className="bg-[#F9FAFB] p-2.5 sm:p-3 rounded-xl border border-[#EAECF0] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2 text-[#98A2B3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uncertain client, matter, description, or reason..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {['', 'Pending', 'Reviewed', 'Approved', 'Rejected'].map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st || 'all'}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#06244B] text-white border-[#06244B] shadow-xs'
                      : 'bg-white text-[#344054] border-[#D0D5DD] hover:bg-slate-50'
                  }`}
                >
                  {st || 'All'}
                </button>
              );
            })}
            {(searchQuery || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#667085] hover:text-[#A4432B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reset search and filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Uncertain / Unmatched Entries Found"
            description="No uncertain billing suggestions match your active slot or status filter."
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const suggestedAmount = (item.suggestedHours || 0) * (item.detectedRate || 0);
              const isFinalized = item.reviewStatus === 'Approved' || item.reviewStatus === 'Rejected';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-[#D9D6CF] bg-white hover:bg-slate-50/60 transition-colors space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#A4432B] bg-[#F5F0E5] px-2 py-0.5 rounded border border-[#D9D6CF]">
                          {item.matterNumber}
                        </span>
                        <span className="font-bold text-xs text-[#06244B]">{item.clientName}</span>
                        <StatusBadge status={item.reviewStatus} />
                      </div>

                      <div className="text-xs font-semibold text-[#202A35]">{item.matterTitle}</div>
                      <p className="text-xs text-[#202A35] leading-relaxed">{item.description}</p>

                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-950 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong>Reason for Uncertainty:</strong> {item.uncertaintyReason}
                        </span>
                      </div>

                      {item.reviewNote && (
                        <div className="text-[11px] text-[#667085] italic">
                          Reviewer Note: &ldquo;{item.reviewNote}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-[#D9D6CF]">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-[#667085] block">
                          Suggested Duration &amp; Fee
                        </span>
                        <div className="font-mono font-bold text-sm text-[#06244B]">
                          {formatHours(item.suggestedHours)} • {formatCurrency(suggestedAmount)}
                        </div>
                        <span className="text-[11px] text-[#667085] flex items-center lg:justify-end gap-1">
                          <Clock className="w-3 h-3" /> Actual: {item.actualDuration}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => openReviewModal(item)}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Edit2}
                          disabled={isFinalized}
                          onClick={() => openEditModal(item)}
                        >
                          Edit Suggestion
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle2}
                          disabled={item.reviewStatus === 'Approved'}
                          onClick={() => setApproveTarget(item)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          disabled={item.reviewStatus === 'Rejected'}
                          onClick={() => {
                            setRejectTarget(item);
                            setRejectReason('');
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      <Modal
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        title="Review Uncertain Billing Suggestion"
        subtitle={reviewItem ? `${reviewItem.sourceType} • ${reviewItem.date}` : ''}
        maxWidth="max-w-lg"
      >
        {reviewItem && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Client / Matter</span>
                <span className="font-semibold text-[#06244B]">{reviewItem.clientName}</span>
                <span className="block text-[11px] text-[#667085]">{reviewItem.matterNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Review Status</span>
                <div className="mt-0.5"><StatusBadge status={reviewItem.reviewStatus} /></div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Suggested Duration</span>
                <span className="font-mono font-bold text-[#06244B]">
                  {formatHours(reviewItem.suggestedHours)} (Actual: {reviewItem.actualDuration})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Suggested Billing Amount</span>
                <span className="font-mono font-bold text-[#A4432B]">
                  {formatCurrency(reviewItem.suggestedHours * reviewItem.detectedRate)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Source Identifier</span>
              <div className="p-2 bg-slate-50 border border-[#D9D6CF] rounded font-mono text-[11px]">
                {reviewItem.sourceIdentifier}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Reason for Uncertainty</span>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-950">
                {reviewItem.uncertaintyReason}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#667085] block mb-1">
                Reviewer Verification Note
              </label>
              <textarea
                rows={2}
                value={reviewNoteDraft}
                onChange={(e) => setReviewNoteDraft(e.target.value)}
                placeholder="Document verification findings or billing adjustment reason..."
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setReviewItem(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="navyOutline"
                onClick={() => {
                  onMarkReviewed(reviewItem.id, reviewNoteDraft);
                  setReviewItem(null);
                }}
              >
                Mark as Reviewed
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  const target = reviewItem;
                  setReviewItem(null);
                  setApproveTarget({ ...target, reviewNote: reviewNoteDraft || target.reviewNote });
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (approveTarget) {
            onApproveConfirmed(approveTarget);
          }
        }}
        title="Confirm Approval of Uncertain Time Entry"
        message={
          approveTarget
            ? `Approve ${formatHours(approveTarget.suggestedHours)} (${formatCurrency(
                approveTarget.suggestedHours * approveTarget.detectedRate
              )}) for "${approveTarget.clientName}" and post it to the Time Tracking ledger?`
            : ''
        }
        confirmLabel="Confirm & Post Entry"
        variant="primary"
      />

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject Uncertain Billing Suggestion"
        subtitle={rejectTarget ? `${rejectTarget.clientName} • ${formatHours(rejectTarget.suggestedHours)}` : ''}
        maxWidth="max-w-md"
      >
        {rejectTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRejectConfirmed(rejectTarget.id, rejectReason.trim() || 'Rejected during manual review.');
              setRejectTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            <p className="text-[#202A35]">
              Are you sure you want to reject this suggested billing entry? It will not be posted to the billable time ledger.
            </p>
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Rejection Note (Optional)</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Personal / administrative non-billable call, or duplicate of TIM-504"
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button type="button" size="sm" variant="outline" onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="danger">
                Confirm Reject
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Suggestion Modal */}
      <Modal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit Uncertain Billing Suggestion"
        subtitle={editItem ? `Source: ${editItem.sourceType} • ${editItem.date}` : ''}
        maxWidth="max-w-lg"
      >
        {editItem && (
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Assign Client / Matter</label>
              <select
                value={editForm.matterId}
                onChange={(e) => setEditForm({ ...editForm, matterId: e.target.value })}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
              >
                <option value="">Unmatched (Keep in Manual Queue)</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} — {m.title} ({m.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Time Entry Description <span className="text-[#A4432B]">*</span>
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => {
                  setEditForm({ ...editForm, description: e.target.value });
                  if (editErrors.description) setEditErrors({ ...editErrors, description: '' });
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
              {editErrors.description && <p className="text-red-700 text-[11px] mt-1">{editErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#06244B] mb-1">
                  Suggested Hours <span className="text-[#A4432B]">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editForm.suggestedHours}
                  onChange={(e) => {
                    setEditForm({ ...editForm, suggestedHours: e.target.value });
                    if (editErrors.suggestedHours) setEditErrors({ ...editErrors, suggestedHours: '' });
                  }}
                  className="w-full p-2 border border-[#D9D6CF] rounded"
                />
                {editErrors.suggestedHours && (
                  <p className="text-red-700 text-[11px] mt-1">{editErrors.suggestedHours}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-[#06244B] mb-1">
                  Hourly Rate ($) <span className="text-[#A4432B]">*</span>
                </label>
                <input
                  type="number"
                  step="5"
                  min="1"
                  value={editForm.detectedRate}
                  onChange={(e) => {
                    setEditForm({ ...editForm, detectedRate: e.target.value });
                    if (editErrors.detectedRate) setEditErrors({ ...editErrors, detectedRate: '' });
                  }}
                  className="w-full p-2 border border-[#D9D6CF] rounded"
                />
                {editErrors.detectedRate && (
                  <p className="text-red-700 text-[11px] mt-1">{editErrors.detectedRate}</p>
                )}
              </div>
              <div>
                <span className="block font-semibold text-[#06244B] mb-1">Calculated Amount</span>
                <div className="p-2 bg-slate-50 border border-[#D9D6CF] rounded font-mono font-bold text-[#06244B]">
                  {formatCurrency(
                    (parseFloat(editForm.suggestedHours) || 0) * (parseFloat(editForm.detectedRate) || 0)
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Review Note</label>
              <input
                type="text"
                value={editForm.reviewNote}
                onChange={(e) => setEditForm({ ...editForm, reviewNote: e.target.value })}
                placeholder="Optional note explaining edit..."
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button type="button" size="sm" variant="outline" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

