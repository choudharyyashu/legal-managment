import React from 'react';
import { Clock, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';

/**
 * Shared Mountain Time scheduled review slots panel for Suggested Billing and Daily Time Review.
 */
export function ScheduledReviewSlots({
  slots = [],
  pendingCountBySlot = null,
  activeSlotId = '',
  onViewQueue,
  onClearSlot,
  onMarkSlotReviewed,
}) {
  return (
    <section className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#A4432B]" />
          <div>
            <h3 className="font-bold text-sm text-[#06244B]">
              Scheduled Daily Review Slots (Mountain Time)
            </h3>
            <p className="text-[11px] text-[#667085]">
              Standardized firm billing &amp; audit checkpoints at Noon, 4:00 PM, 6:00 PM, and 9:00 PM Mountain Time (MT).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold bg-[#06244B] text-white whitespace-nowrap">
            Timezone: Mountain Time (MT)
          </span>
          {activeSlotId && onClearSlot && (
            <Button size="sm" variant="outline" icon={RotateCcw} onClick={onClearSlot}>
              Show All Slots
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = activeSlotId === slot.id;
          const pendingCount =
            pendingCountBySlot && typeof pendingCountBySlot[slot.id] === 'number'
              ? pendingCountBySlot[slot.id]
              : slot.pendingSuggestions;

          return (
            <div
              key={slot.id}
              className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-[#A4432B] bg-[#F5F0E5]/50 ring-1 ring-[#A4432B]'
                  : 'border-[#D9D6CF] bg-white hover:border-[#06244B]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4432B] block">
                      {slot.timezone}
                    </span>
                    <div className="font-serif font-bold text-sm text-[#06244B] mt-0.5">
                      {slot.scheduledTime}
                    </div>
                  </div>
                  <StatusBadge status={slot.reviewStatus} />
                </div>

                <p className="text-[11px] text-[#667085] leading-snug">{slot.windowDescription}</p>

                <div className="pt-2 border-t border-[#D9D6CF]/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085] block">
                      Pending Suggestions
                    </span>
                    <span className="font-mono font-bold text-sm text-[#06244B]">
                      {pendingCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085] block">
                      Last Reviewed
                    </span>
                    <span className="font-medium text-[#202A35] block truncate" title={slot.lastReviewedTime}>
                      {slot.lastReviewedTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant={isSelected ? 'primary' : 'outline'}
                  icon={Eye}
                  className="flex-1"
                  onClick={() => onViewQueue && onViewQueue(slot)}
                >
                  {isSelected ? 'Viewing Queue' : 'View Queue'}
                </Button>
                {onMarkSlotReviewed && slot.reviewStatus !== 'Completed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={CheckCircle2}
                    onClick={() => onMarkSlotReviewed(slot)}
                    title="Mark slot as reviewed"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

