import React, { useState, useMemo } from 'react';
import { Calendar, TimerOff, Copy, FileSpreadsheet } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Tabs } from '../../../components/ui/Tabs';
import { FilterBar } from '../../../components/shared/FilterBar';
import { INITIAL_IDLE_FLAGS, INITIAL_OVERLAP_FLAGS } from '../../../data/mockTimeReviewSchedules';
import { ScheduledReviewSlots } from '../components/ScheduledReviewSlots';
import { TimeReviewFlagsPanel } from '../components/TimeReviewFlagsPanel';
import { formatDate } from '../../../utils/formatDate';
import { formatHours, formatCurrency } from '../../../utils/formatCurrency';

export function DailyTimeReview() {
  const { timeEntries, reviewSlots, markSlotReviewed } = useTime();
  const { allUsers } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('idle');
  const [activeSlotId, setActiveSlotId] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [idleFlags, setIdleFlags] = useState(INITIAL_IDLE_FLAGS);
  const [overlapFlags, setOverlapFlags] = useState(INITIAL_OVERLAP_FLAGS);

  const handleUpdateIdleFlagStatus = (flagId, status, reviewNote) => {
    setIdleFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, status, reviewNote: reviewNote !== undefined ? reviewNote : f.reviewNote }
          : f
      )
    );
    addToast(`Idle flag ${flagId} updated to ${status}.`, status === 'Rejected' ? 'info' : 'success');
  };

  const handleUpdateOverlapFlagStatus = (flagId, status, reviewNote) => {
    setOverlapFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, status, reviewNote: reviewNote !== undefined ? reviewNote : f.reviewNote }
          : f
      )
    );
    addToast(`Overlap flag ${flagId} updated to ${status}.`, status === 'Rejected' ? 'info' : 'success');
  };

  const pendingIdleCount = idleFlags.filter((f) => f.status === 'Pending' || f.status === 'Reviewed').length;
  const pendingOverlapCount = overlapFlags.filter((f) => f.status === 'Pending' || f.status === 'Reviewed').length;

  const pendingCountBySlot = useMemo(() => {
    const counts = {};
    reviewSlots.forEach((slot) => {
      const idlePending = idleFlags.filter(
        (f) => f.slotId === slot.id && (f.status === 'Pending' || f.status === 'Reviewed')
      ).length;
      const overlapPending = overlapFlags.filter(
        (f) => f.slotId === slot.id && (f.status === 'Pending' || f.status === 'Reviewed')
      ).length;
      counts[slot.id] = idlePending + overlapPending;
    });
    return counts;
  }, [reviewSlots, idleFlags, overlapFlags]);

  const handleViewSlotQueue = (slot) => {
    setActiveSlotId((prev) => (prev === slot.id ? '' : slot.id));
    if (activeTab === 'daily') setActiveTab('idle');
    addToast(`Filtered Daily Time Review flags to ${slot.scheduledTime}.`, 'info');
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const filtered = timeEntries.filter(e => {
      const matchUser = selectedUser === '' || e.userId === selectedUser;
      const matchStatus = selectedStatus === '' || e.status === selectedStatus;
      return matchUser && matchStatus;
    });

    const groups = {};
    filtered.forEach(entry => {
      const d = entry.date;
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(entry);
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [timeEntries, selectedUser, selectedStatus]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Time Review &amp; Quality Audit"
        subtitle="Chronological audit of logged time grouped by date and timekeeper. Detect missing descriptions or unsubmitted draft hours."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Daily Review' }]}
      />

      {/* D. Scheduled Review Slots (Shared with Suggested Billing) */}
      <ScheduledReviewSlots
        slots={reviewSlots}
        pendingCountBySlot={pendingCountBySlot}
        activeSlotId={activeSlotId}
        onViewQueue={handleViewSlotQueue}
        onClearSlot={() => setActiveSlotId('')}
        onMarkSlotReviewed={(slot) => {
          markSlotReviewed(slot.id);
          addToast(`${slot.scheduledTime} marked as reviewed.`, 'success');
        }}
      />

      {/* Review Mode Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'idle', label: 'Idle Flags', icon: TimerOff, count: pendingIdleCount },
          { id: 'overlap', label: 'Overlap Flags', icon: Copy, count: pendingOverlapCount },
          { id: 'daily', label: 'Daily Time Log', icon: FileSpreadsheet, count: timeEntries.length },
        ]}
      />

      {/* A. Idle Flags Review Workflow */}
      {activeTab === 'idle' && (
        <TimeReviewFlagsPanel
          mode="idle"
          flags={idleFlags}
          activeSlotId={activeSlotId}
          onUpdateFlagStatus={handleUpdateIdleFlagStatus}
        />
      )}

      {/* B. Overlap Flags Review Workflow */}
      {activeTab === 'overlap' && (
        <TimeReviewFlagsPanel
          mode="overlap"
          flags={overlapFlags}
          activeSlotId={activeSlotId}
          onUpdateFlagStatus={handleUpdateOverlapFlagStatus}
        />
      )}

      {/* Existing Grouped Day-by-Day Audit Log */}
      {activeTab === 'daily' && (
      <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        filters={[
          {
            id: 'user',
            label: 'Timekeeper',
            value: selectedUser,
            options: allUsers.map(u => ({ value: u.id, label: u.name })),
            onChange: setSelectedUser,
          },
          {
            id: 'status',
            label: 'Billing Status',
            value: selectedStatus,
            options: [
              { value: 'Draft', label: 'Draft' },
              { value: 'Submitted', label: 'Submitted' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ],
            onChange: setSelectedStatus,
          },
        ]}
        onReset={() => {
          setSelectedUser('');
          setSelectedStatus('');
        }}
      />

      {/* Grouped Day-by-Day Cards */}
      <div className="space-y-6">
        {groupedEntries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded border border-[#D9D6CF] text-xs text-[#667085]">
            No time entries found for the selected review parameters.
          </div>
        ) : (
          groupedEntries.map(([date, entries]) => {
            const dayHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);
            const dayFees = entries.reduce((sum, e) => sum + (e.amount || 0), 0);

            return (
              <div key={date} className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
                {/* Date Header */}
                <div className="p-4 bg-[#F5F0E5]/60 border-b border-[#D9D6CF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A4432B]" />
                    <h3 className="font-serif font-bold text-base text-[#06244B]">
                      {formatDate(date)}
                    </h3>
                    <span className="text-xs text-[#667085] ml-2">({entries.length} entries)</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span>Day Total: <strong className="text-[#06244B]">{formatHours(dayHours)}</strong></span>
                    <span>Fees: <strong className="text-[#A4432B]">{formatCurrency(dayFees)}</strong></span>
                  </div>
                </div>

                {/* Day Entries */}
                <div className="divide-y divide-[#D9D6CF]/50">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 hover:bg-[#F5F0E5]/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#06244B]">{entry.userName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-semibold text-[#A4432B]">{entry.matterTitle}</span>
                        </div>
                        <p className="text-[#202A35] leading-relaxed">{entry.description}</p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#06244B] block">{formatHours(entry.hours)}</span>
                          <span className="text-[10px] text-[#667085]">{formatCurrency(entry.amount)}</span>
                        </div>
                        <div>
                          <StatusBadge status={entry.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
      )}
    </div>
  );
}

