import React, { useState, useMemo } from 'react';
import {
  TimerOff,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchBar } from '../../../components/shared/SearchBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import { formatHours } from '../../../utils/formatCurrency';

/**
 * Shared Idle Flags & Overlap Flags review workflow panel for Daily Time Review.
 */
export function TimeReviewFlagsPanel({
  mode = 'idle', // 'idle' | 'overlap'
  flags = [],
  activeSlotId = '',
  onUpdateFlagStatus,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [reviewingFlag, setReviewingFlag] = useState(null);
  const [reviewNoteDraft, setReviewNoteDraft] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { flagId, targetStatus, title, message }

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSlot = !activeSlotId || flag.slotId === activeSlotId;
      const matchesStatus = !statusFilter || flag.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesSlot && matchesStatus;

      const baseMatch =
        flag.userName.toLowerCase().includes(q) ||
        flag.reason.toLowerCase().includes(q) ||
        (flag.reviewNote || '').toLowerCase().includes(q) ||
        (flag.matterTitle || '').toLowerCase().includes(q) ||
        (flag.entries || []).some(
          (e) =>
            e.matterTitle.toLowerCase().includes(q) ||
            e.matterNumber.toLowerCase().includes(q)
        );
      return matchesSlot && matchesStatus && baseMatch;
    });
  }, [flags, activeSlotId, statusFilter, searchQuery]);

  const openReviewModal = (flag) => {
    setReviewingFlag(flag);
    setReviewNoteDraft(flag.reviewNote || '');
  };

  const requestStatusConfirm = (flag, nextStatus) => {
    const label =
      mode === 'idle'
        ? `${flag.userName}'s idle-flagged entry (${flag.loggedDuration})`
        : `${flag.userName}'s overlapping entries (${flag.overlapDuration})`;
    setConfirmAction({
      flagId: flag.id,
      targetStatus: nextStatus,
      note: reviewNoteDraft,
      title: `Confirm ${nextStatus} Decision`,
      message:
        nextStatus === 'Approved'
          ? `Approve ${label} and clear the flag for billing?`
          : `Reject ${label}? This flagged time will be held back from billing until corrected.`,
      variant: nextStatus === 'Rejected' ? 'danger' : 'primary',
    });
  };

  const isIdle = mode === 'idle';
  const HeaderIcon = isIdle ? TimerOff : Copy;

  return (
    <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#D9D6CF] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
              <HeaderIcon className="w-4 h-4 text-[#A4432B]" />
              {isIdle
                ? `Idle Time Flags (${filteredFlags.length})`
                : `Overlapping Time Entry Flags (${filteredFlags.length})`}
            </h3>
            <p className="text-xs text-[#667085]">
              {isIdle
                ? 'Entries exhibiting prolonged inactivity windows during active desktop timing.'
                : 'Potentially overlapping time ranges logged across simultaneous client matters.'}
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-[#F5F0E5] text-[#06244B] px-2.5 py-1 rounded border border-[#D9D6CF]">
            Audit Workflow: Pending &rarr; Reviewed &rarr; Approved / Rejected
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
              placeholder={
                isIdle
                  ? 'Search timekeeper, matter, idle reason...'
                  : 'Search timekeeper, overlapping matter, time range...'
              }
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
        {filteredFlags.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={isIdle ? 'No Idle Flags Found' : 'No Overlap Flags Found'}
            description="No flagged entries match the selected Mountain Time slot or status filter."
          />
        ) : (
          <div className="space-y-3">
            {filteredFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-4 rounded-lg border border-[#D9D6CF] bg-white hover:bg-slate-50/60 transition-colors space-y-3 text-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#06244B]">{flag.userName}</span>
                      <span className="text-[#667085]">•</span>
                      <span className="font-mono font-semibold text-[#202A35]">
                        {formatDate(flag.date)}
                      </span>
                      <StatusBadge status={flag.status} />
                    </div>

                    {isIdle ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-[#A4432B]">
                          {flag.matterNumber} — {flag.matterTitle}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-[#667085]">
                          <span>
                            Logged Duration: <strong className="text-[#06244B]">{flag.loggedDuration}</strong>
                          </span>
                          <span>
                            Flagged Idle: <strong className="text-[#A4432B]">{flag.idleDuration}</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-[#A4432B] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Detected Overlap: {flag.overlapDuration}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(flag.entries || []).map((entry) => (
                            <div
                              key={entry.id}
                              className="p-2.5 rounded border border-[#D9D6CF] bg-slate-50 text-[11px]"
                            >
                              <div className="flex items-center justify-between font-bold text-[#06244B]">
                                <span>{entry.matterNumber}</span>
                                <span className="font-mono">{formatHours(entry.hours)}</span>
                              </div>
                              <div className="text-[#202A35] font-medium truncate" title={entry.matterTitle}>
                                {entry.matterTitle}
                              </div>
                              <div className="text-[#667085] font-mono mt-0.5">{entry.timeRange}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 bg-amber-50/75 border border-amber-200 rounded text-[11px] text-amber-950 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Flag Reason:</strong> {flag.reason}
                      </span>
                    </div>

                    {flag.reviewNote && (
                      <div className="text-[11px] text-[#667085] italic">
                        Review Note: &ldquo;{flag.reviewNote}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Eye}
                      onClick={() => openReviewModal(flag)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(reviewingFlag)}
        onClose={() => setReviewingFlag(null)}
        title={isIdle ? 'Review Idle Time Flag' : 'Review Overlapping Time Entries'}
        subtitle={
          reviewingFlag
            ? `${reviewingFlag.userName} • ${formatDate(reviewingFlag.date)}`
            : ''
        }
        maxWidth="max-w-lg"
      >
        {reviewingFlag && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#06244B]">Current Status</span>
                <StatusBadge status={reviewingFlag.status} />
              </div>
              {isIdle ? (
                <>
                  <div>
                    <strong>Matter:</strong> {reviewingFlag.matterNumber} — {reviewingFlag.matterTitle}
                  </div>
                  <div>
                    <strong>Logged Duration:</strong> {reviewingFlag.loggedDuration} |{' '}
                    <strong className="text-[#A4432B]">Idle Window:</strong> {reviewingFlag.idleDuration}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold text-[#A4432B]">{reviewingFlag.overlapDuration}</div>
                  {(reviewingFlag.entries || []).map((entry) => (
                    <div key={entry.id} className="p-2 bg-white border border-[#D9D6CF] rounded text-[11px]">
                      <strong>{entry.matterNumber}</strong> ({entry.timeRange} • {formatHours(entry.hours)}) — {entry.matterTitle}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-950">
              <strong>Audit Reason:</strong> {reviewingFlag.reason}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#667085] mb-1">
                Reviewer Note / Resolution Explanation
              </label>
              <textarea
                rows={3}
                value={reviewNoteDraft}
                onChange={(e) => setReviewNoteDraft(e.target.value)}
                placeholder="Enter audit resolution note (e.g., confirmed off-screen binder review or split overlapping intervals)..."
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setReviewingFlag(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="navyOutline"
                onClick={() => {
                  onUpdateFlagStatus(reviewingFlag.id, 'Reviewed', reviewNoteDraft);
                  setReviewingFlag(null);
                }}
              >
                Mark Reviewed
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={XCircle}
                onClick={() => {
                  const target = reviewingFlag;
                  setReviewingFlag(null);
                  requestStatusConfirm(target, 'Rejected');
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                onClick={() => {
                  const target = reviewingFlag;
                  setReviewingFlag(null);
                  requestStatusConfirm(target, 'Approved');
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve / Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            onUpdateFlagStatus(
              confirmAction.flagId,
              confirmAction.targetStatus,
              confirmAction.note
            );
          }
        }}
        title={confirmAction?.title || 'Confirm Review Action'}
        message={confirmAction?.message || ''}
        confirmLabel={
          confirmAction?.targetStatus === 'Rejected' ? 'Confirm Reject' : 'Confirm Approve'
        }
        variant={confirmAction?.variant || 'primary'}
      />
    </div>
  );
}

