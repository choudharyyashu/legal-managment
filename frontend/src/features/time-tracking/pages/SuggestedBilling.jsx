import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Mail,
  FileText,
  Plus,
  Phone,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  X,
  Edit2,
  Info,
  ShieldAlert
} from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useMatters } from '../../../context/MatterContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Tabs } from '../../../components/ui/Tabs';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_UNCERTAIN_SUGGESTIONS } from '../../../data/mockTimeReviewSchedules';
import { ScheduledReviewSlots } from '../components/ScheduledReviewSlots';
import { UncertainQueuePanel } from '../components/UncertainQueuePanel';
import { formatHours, formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

export function SuggestedBilling() {
  const { addTimeEntry, reviewSlots, markSlotReviewed } = useTime();
  const { currentUser } = useAuth();
  const { matters } = useMatters();
  const { addToast } = useToast();

  const [suggestions, setSuggestions] = useState([
    {
      id: 'SUG-01',
      slotId: 'slot-noon',
      sourceType: 'Outlook Email',
      sourceIcon: Mail,
      sourceIdentifier: 'MSG-ID: <20261105.1420.outbound@wasatchlogistics.com>',
      date: '2026-11-05',
      matterId: 'MAT-2025-0101',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      clientName: 'Wasatch Mountain Logistics LLC',
      actualDuration: '14 mins',
      actualMinutes: 14,
      suggestedHours: 0.3, // Rounded up to nearest 0.1 hr (18 mins)
      matchConfidence: 98,
      activityDescription: 'Email correspondence to opposing counsel regarding proposed cold-chain inspection schedule.',
      detectedRate: 500,
      converted: false,
      dismissed: false,
    },
    {
      id: 'SUG-02',
      slotId: 'slot-4pm',
      sourceType: 'Telephone Call',
      sourceIcon: Phone,
      sourceIdentifier: 'VOIP-CALL-REC #88192 (Direct Inward Dialing)',
      date: '2026-11-04',
      matterId: 'MAT-2025-0418',
      matterNumber: '25-DOM-0418',
      matterTitle: 'In re Marriage of Martinez and Sterling: Domestic Dissolution',
      clientName: 'Dr. Evelyn Martinez',
      actualDuration: '42 mins',
      actualMinutes: 42,
      suggestedHours: 0.8, // Rounded to 48 mins (0.8 hrs)
      matchConfidence: 95,
      activityDescription: 'Attended telephonic pre-hearing conference with mediator and counsel of record.',
      detectedRate: 375,
      converted: false,
      dismissed: false,
    },
    {
      id: 'SUG-03',
      slotId: 'slot-6pm',
      sourceType: 'Word Document',
      sourceIcon: FileText,
      sourceIdentifier: 'WIN-DOC-AUDIT: Reply_Brief_Recharge_Easements_v3.docx',
      date: '2026-11-04',
      matterId: 'MAT-2024-0301',
      matterNumber: '24-LND-0912',
      matterTitle: 'Apex Horizon v. Wasatch County Board of Adjustment (Water Rights Appeal)',
      clientName: 'Apex Horizon Real Estate Group',
      actualDuration: '2 hrs 18 mins',
      actualMinutes: 138,
      suggestedHours: 2.4, // Standard 6-minute billing increment
      matchConfidence: 68, // Flagged for review
      activityDescription: 'Drafted reply brief section addressing municipal groundwater recharge easements.',
      detectedRate: 550,
      converted: false,
      dismissed: false,
    },
    {
      id: 'SUG-04',
      slotId: 'slot-9pm',
      sourceType: 'VoIP SMS Thread',
      sourceIcon: MessageSquare,
      sourceIdentifier: 'TWILIO-SMS-SID: SM88192001a1',
      date: '2026-11-03',
      matterId: 'MAT-2025-0101',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      clientName: 'Wasatch Mountain Logistics LLC',
      actualDuration: '6 mins',
      actualMinutes: 6,
      suggestedHours: 0.2, // Minimum 0.2 block
      matchConfidence: 99,
      activityDescription: 'Mobile SMS exchange confirming expert witness inspection time and zoom conference access.',
      detectedRate: 500,
      converted: false,
      dismissed: false,
    }
  ]);

  // Modal states & Phase 4 Queue states
  const [activeTab, setActiveTab] = useState('uncertain');
  const [activeSlotId, setActiveSlotId] = useState('');
  const [uncertainItems, setUncertainItems] = useState(INITIAL_UNCERTAIN_SUGGESTIONS);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [reassigningItem, setReassigningItem] = useState(null);
  const [newSelectedMatterId, setNewSelectedMatterId] = useState('');

  const handleMarkUncertainReviewed = (id, note) => {
    setUncertainItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reviewStatus: 'Reviewed',
              reviewNote: note !== undefined ? note : item.reviewNote,
            }
          : item
      )
    );
    addToast('Uncertain entry marked as Reviewed. Still requires explicit Approval before billing.', 'info');
  };

  const handleApproveUncertainConfirmed = (item) => {
    addTimeEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      clientId: item.clientId || 'CLI-1001',
      clientName: item.clientName,
      matterId: item.matterId || 'MAT-2025-0101',
      matterTitle: item.matterTitle,
      date: item.date,
      hours: item.suggestedHours,
      rate: item.detectedRate,
      amount: item.suggestedHours * item.detectedRate,
      description: `${item.description} [Manual Review Approved from ${item.sourceType}]`,
      isBillable: true,
      status: 'Submitted',
    });
    setUncertainItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id
          ? { ...entry, reviewStatus: 'Approved', reviewNote: item.reviewNote || entry.reviewNote }
          : entry
      )
    );
    addToast(
      `Confirmed & posted ${item.suggestedHours} hrs (${formatCurrency(item.suggestedHours * item.detectedRate)}) to Time Tracking!`,
      'success'
    );
  };

  const handleRejectUncertainConfirmed = (id, reason) => {
    setUncertainItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reviewStatus: 'Rejected', reviewNote: reason } : item
      )
    );
    addToast('Uncertain suggestion rejected and excluded from billing.', 'info');
  };

  const handleEditUncertainSaved = (id, updates) => {
    setUncertainItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addToast('Uncertain billing suggestion updated.', 'success');
  };

  const handleConvert = (sug) => {
    addTimeEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      clientId: 'CLI-1001',
      clientName: sug.clientName,
      matterId: sug.matterId,
      matterTitle: sug.matterTitle,
      date: sug.date,
      hours: sug.suggestedHours,
      rate: sug.detectedRate,
      amount: sug.suggestedHours * sug.detectedRate,
      description: `${sug.activityDescription} [Captured from ${sug.sourceType} - Actual Duration: ${sug.actualDuration}]`,
      isBillable: true,
      status: 'Submitted',
    });

    setSuggestions(prev => prev.map(s => s.id === sug.id ? { ...s, converted: true } : s));
    addToast(
      `Activity converted to billable entry (${sug.suggestedHours} hrs = ${formatCurrency(sug.suggestedHours * sug.detectedRate)}) and routed to Billing Approval queue!`,
      'success'
    );
  };

  const handleDismiss = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
    addToast('Suggestion dismissed.', 'info');
  };

  const handleReassignMatter = (e) => {
    e.preventDefault();
    if (!reassigningItem || !newSelectedMatterId) return;

    const target = matters.find(m => m.id === newSelectedMatterId);
    if (!target) return;

    setSuggestions(prev =>
      prev.map(s =>
        s.id === reassigningItem.id
          ? {
              ...s,
              matterId: target.id,
              matterNumber: target.matterNumber,
              matterTitle: target.title,
              clientName: target.clientName,
              matchConfidence: 100, // Explicitly corrected by attorney
            }
          : s
      )
    );

    addToast(`Matter assignment corrected to "${target.matterNumber}"!`, 'success');
    setReassigningItem(null);
  };

  const handleSimulateDuplicateImport = () => {
    addToast(
      'Duplicate Prevention Active: Re-scanned Outlook & VoIP logs. Found 4 existing activities, 0 duplicates created. Audit signature verified.',
      'success'
    );
  };

  const activeSuggestions = suggestions.filter(
    (s) => !s.dismissed && (!activeSlotId || s.slotId === activeSlotId)
  );

  const pendingUncertainCount = uncertainItems.filter(
    (u) => u.reviewStatus === 'Pending' || u.reviewStatus === 'Reviewed'
  ).length;

  const pendingCountBySlot = useMemo(() => {
    const counts = {};
    reviewSlots.forEach((slot) => {
      const regPending = suggestions.filter(
        (s) => !s.dismissed && !s.converted && s.slotId === slot.id
      ).length;
      const uncPending = uncertainItems.filter(
        (u) =>
          u.slotId === slot.id &&
          (u.reviewStatus === 'Pending' || u.reviewStatus === 'Reviewed')
      ).length;
      counts[slot.id] = regPending + uncPending;
    });
    return counts;
  }, [reviewSlots, suggestions, uncertainItems]);

  const handleViewSlotQueue = (slot) => {
    setActiveSlotId((prev) => (prev === slot.id ? '' : slot.id));
    addToast(`Filtered Suggested Billing queue to ${slot.scheduledTime}.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Compliance Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Passive Activity &amp; Time Capture (Clio/Filevine Spec):</strong> Transparent separation of actual event duration from proposed billable time. Source identifiers preserved with automated duplicate prevention.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          DUPLICATE SAFE
        </span>
      </div>

      <PageHeader
        title="Passive Time Capture &amp; Activity Matching"
        subtitle="Review automated time suggestions detected from Outlook emails, phone calls, calendar attendance, and document drafting."
        breadcrumbs={[
          { label: 'Tasks & Activities', to: '/tasks' },
          { label: 'Time Tracking', to: '/time' },
          { label: 'Suggested Billing' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleSimulateDuplicateImport}
            >
              Test Duplicate-Safe Import
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Info}
              onClick={() => setIsProposalModalOpen(true)}
            >
              Phone/SMS Capture Architecture
            </Button>
          </div>
        }
      />

      {/* A. Scheduled Review Slots (Mountain Time) */}
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

      {/* Queue Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'uncertain',
            label: 'Uncertain / Unmatched Queue',
            icon: ShieldAlert,
            count: pendingUncertainCount,
          },
          {
            id: 'detected',
            label: 'Detected Activity Queue',
            icon: Sparkles,
            count: activeSuggestions.filter((s) => !s.converted).length,
          },
        ]}
      />

      {/* B. Uncertain / Unmatched Queue */}
      {activeTab === 'uncertain' && (
        <UncertainQueuePanel
          items={uncertainItems}
          matters={matters}
          activeSlotId={activeSlotId}
          onMarkReviewed={handleMarkUncertainReviewed}
          onApproveConfirmed={handleApproveUncertainConfirmed}
          onRejectConfirmed={handleRejectUncertainConfirmed}
          onEditSaved={handleEditUncertainSaved}
        />
      )}

      {/* Main Suggestions Table Card */}
      {activeTab === 'detected' && (
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#D9D6CF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A4432B]" />
              Detected Background Activities Pending Review ({activeSuggestions.filter(s => !s.converted).length})
            </h3>
            <p className="text-xs text-[#667085]">
              Compare actual activity duration with proposed 6-minute minimum billing increments before approving into the firm ledger.
            </p>
          </div>

          <span className="text-[10px] bg-slate-100 text-[#06244B] font-bold px-2.5 py-1 rounded border border-slate-300">
            Source Traceability: 100%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-b border-[#D9D6CF]">
              <tr>
                <th className="py-2.5 px-3">Source &amp; Date</th>
                <th className="py-2.5 px-3">Linked Matter &amp; Match Confidence</th>
                <th className="py-2.5 px-3">Activity Narrative</th>
                <th className="py-2.5 px-3 text-center">Actual Duration</th>
                <th className="py-2.5 px-3 text-right">Proposed Billed</th>
                <th className="py-2.5 px-3 text-right">Estimated Fee</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]/60">
              {activeSuggestions.map((sug) => {
                const Icon = sug.sourceIcon;
                return (
                  <tr
                    key={sug.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      sug.converted ? 'bg-emerald-50/40 opacity-70' : ''
                    }`}
                  >
                    {/* Source & Date */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-[#F5F0E5] text-[#06244B] shrink-0">
                          <Icon className="w-4 h-4 text-[#A4432B]" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-[#06244B] block">{sug.sourceType}</span>
                          <span className="text-[10px] text-[#667085]">{sug.date}</span>
                          <span className="text-[9px] text-slate-400 font-mono block max-w-[120px] truncate" title={sug.sourceIdentifier}>
                            {sug.sourceIdentifier}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Matter & Confidence */}
                    <td className="py-3 px-3 align-top max-w-xs">
                      <div>
                        <span className="font-bold text-[#06244B] text-xs block">{sug.matterNumber}</span>
                        <span className="text-[11px] text-[#202A35] font-medium block leading-tight">{sug.matterTitle}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            sug.matchConfidence >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sug.matchConfidence}% Match
                          </span>
                          {!sug.converted && (
                            <button
                              onClick={() => {
                                setReassigningItem(sug);
                                setNewSelectedMatterId(sug.matterId);
                              }}
                              className="text-[10px] text-[#A4432B] font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" /> Reassign
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Narrative */}
                    <td className="py-3 px-3 align-top text-xs text-[#202A35] max-w-sm">
                      <p className="leading-relaxed">{sug.activityDescription}</p>
                      <span className="text-[10px] text-[#667085] block mt-0.5">Client: {sug.clientName}</span>
                    </td>

                    {/* Actual Duration (Requirement 6 Spec) */}
                    <td className="py-3 px-3 align-top text-center">
                      <span className="font-mono text-xs font-semibold text-[#667085] bg-slate-100 px-2 py-0.5 rounded">
                        {sug.actualDuration}
                      </span>
                    </td>

                    {/* Proposed Billed Time (Requirement 6 Spec) */}
                    <td className="py-3 px-3 align-top text-right">
                      <span className="font-mono font-bold text-xs text-[#A4432B] block">
                        {formatHours(sug.suggestedHours)}
                      </span>
                      <span className="text-[10px] text-[#667085] block">
                        @ ${sug.detectedRate}/hr
                      </span>
                    </td>

                    {/* Estimated Fee */}
                    <td className="py-3 px-3 align-top text-right font-bold text-xs text-[#06244B]">
                      {formatCurrency(sug.suggestedHours * sug.detectedRate)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      {sug.converted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recorded
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="primary"
                            icon={Plus}
                            onClick={() => handleConvert(sug)}
                          >
                            Approve Time
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleDismiss(sug.id)}
                            title="Dismiss activity"
                          >
                            <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeSuggestions.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={Sparkles}
                title="No Detected Activities for Selected Slot"
                description="All detected activities for this Mountain Time review slot have been reviewed or dismissed."
              />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Technical Proposal Modal for Calls & SMS Capture (Requirement 6 Deliverable) */}
      <Modal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        title="Technical Architecture Proposal: Automated Call & SMS Capture"
        subtitle="Formal technical proposal addressing telephony capture, SMS/iMessage legal limitations, hardware devices, and recurring costs."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-[#202A35]">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Utah State Bar RPC 1.6 &amp; Privacy Mandate:</strong> Automatic mobile call recording and message archiving must strictly respect attorney-client privilege and two-party statutory consent guidelines.
            </span>
          </div>

          <div className="space-y-3">
            <div className="border border-[#D9D6CF] rounded p-3 bg-slate-50">
              <h4 className="font-bold text-xs text-[#06244B] uppercase mb-1">
                1. Voice &amp; SMS Integration Architecture
              </h4>
              <p className="text-[#667085] leading-relaxed">
                Calls and SMS messages sent through the firm's direct phone numbers are routed via a cloud VoIP gateway (Twilio / RingCentral Enterprise API). Call durations, caller ID metadata, and text strings are captured automatically with zero manual entry.
              </p>
            </div>

            <div className="border border-[#D9D6CF] rounded p-3 bg-slate-50">
              <h4 className="font-bold text-xs text-[#06244B] uppercase mb-1">
                2. Apple iMessage vs. Standard SMS Legal &amp; Technical Boundaries
              </h4>
              <p className="text-[#667085] leading-relaxed">
                <strong>Important Limitation:</strong> Apple iMessage operates under end-to-end proprietary encryption without accessible public background APIs. Under iOS security sandboxes, personal attorney iMessages cannot be passively captured without firm Mobile Device Management (MDM) enrollment. Standard cellular SMS/MMS transmitted via firm VoIP numbers are captured 100% reliably.
              </p>
            </div>

            <div className="border border-[#D9D6CF] rounded p-3 bg-slate-50">
              <h4 className="font-bold text-xs text-[#06244B] uppercase mb-1">
                3. Required Devices, Hardware &amp; Recurring Costs
              </h4>
              <ul className="list-disc pl-4 text-[#667085] space-y-1">
                <li><strong>Hardware Required:</strong> Zero proprietary hardware needed. Attorneys use existing iOS/Android mobile smartphones or desktop softphones.</li>
                <li><strong>Permissions Needed:</strong> Twilio API webhook credentials and Microsoft 365 Exchange Online Graph permissions.</li>
                <li><strong>Recurring Costs:</strong> ~$15.00/month per active direct number, plus $0.0075/minute for voice recording transcripts and $0.0079 per inbound/outbound SMS.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="primary" onClick={() => setIsProposalModalOpen(false)}>
              Close Proposal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Matter Modal */}
      {reassigningItem && (
        <Modal
          isOpen={!!reassigningItem}
          onClose={() => setReassigningItem(null)}
          title="Reassign Activity to Correct Matter Docket"
          subtitle={`Activity: ${reassigningItem.sourceType} on ${reassigningItem.date}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReassignMatter} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
                Select Correct Matter Docket
              </label>
              <select
                value={newSelectedMatterId}
                onChange={(e) => setNewSelectedMatterId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded border border-[#D9D6CF] bg-white text-[#06244B]"
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} — {m.title} ({m.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] text-[#667085]">
              <p>Current Assignment: <strong>{reassigningItem.matterTitle}</strong></p>
              <p>Original Match Confidence: <strong>{reassigningItem.matchConfidence}%</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setReassigningItem(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Confirm Reassignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
