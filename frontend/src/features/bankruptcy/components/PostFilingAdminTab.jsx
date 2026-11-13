import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  AlertCircle,
  Landmark,
  RefreshCw,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  CheckSquare,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

const STATUS_BADGE_MAP = {
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  entered: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  withdrawn: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  granted: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  reviewed: 'bg-blue-50 text-blue-800 border-blue-300',
  acknowledged: 'bg-blue-50 text-blue-800 border-blue-300',
  scheduled: 'bg-amber-50 text-amber-900 border-amber-300',
  pending: 'bg-amber-50 text-amber-900 border-amber-300',
  'in progress': 'bg-amber-50 text-amber-900 border-amber-300',
  'in review': 'bg-amber-50 text-amber-900 border-amber-300',
  continued: 'bg-amber-50 text-amber-900 border-amber-300',
  'response required': 'bg-amber-50 text-amber-900 border-amber-300',
  overdue: 'bg-red-50 text-red-800 border-red-300',
  sustained: 'bg-red-50 text-red-800 border-red-300',
  denied: 'bg-red-50 text-red-800 border-red-300',
  cancelled: 'bg-red-50 text-red-800 border-red-300',
};

const EVENT_TYPE_BADGE_MAP = {
  Discharge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Conversion: 'bg-amber-100 text-amber-900 border-amber-300',
  Reopening: 'bg-blue-100 text-blue-900 border-blue-300',
};

const DEFAULT_MEETING_CHECKLIST = [
  'Government Photo ID & Social Security Card Verified',
  'Pre-Petition Tax Return Delivered to Trustee (7 Days Prior)',
  '60-Day Pre-Petition Pay Advices Uploaded (§ 521)',
  'Client Pre-341 Oath & Question Prep Completed',
];

function PostFilingBadge({ status }) {
  const key = (status || '').toLowerCase().trim();
  const matched =
    STATUS_BADGE_MAP[key] ||
    (key.startsWith('n/a') ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-100 text-slate-700 border-slate-300');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${matched}`}>
      {status || 'Not Available'}
    </span>
  );
}

function SectionEmptyState({ icon: Icon, title, description }) {
  return (
    <div className="p-5 bg-slate-50 border border-dashed border-[#D9D6CF] rounded-lg text-center space-y-1">
      <Icon className="w-5 h-5 text-[#667085] mx-auto" />
      <div className="text-xs font-semibold text-[#06244B]">{title}</div>
      <p className="text-[11px] text-[#667085] max-w-md mx-auto">{description}</p>
    </div>
  );
}

/**
 * Interactive Post-Filing Administration tab for a Bankruptcy case drawer.
 */
export function PostFilingAdminTab({ currentCase, postFilingAdmin, onUpdatePostFiling, addToast }) {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedObjection, setSelectedObjection] = useState(null);

  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    meetingDateTime: '',
    locationOrVirtual: '',
    trusteeName: currentCase.trusteeName || '',
    status: 'Scheduled',
    notes: '',
    checklistText: DEFAULT_MEETING_CHECKLIST.join('\n'),
  });
  const [meetingErrors, setMeetingErrors] = useState({});

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    eventType: 'Discharge',
    eventDate: '',
    status: 'Scheduled',
    description: '',
  });
  const [eventErrors, setEventErrors] = useState({});

  const trusteeNotices = postFilingAdmin?.trusteeNotices || [];
  const meetings341 = postFilingAdmin?.meetings341 || [];
  const objections = postFilingAdmin?.objections || [];
  const planConfirmation = postFilingAdmin?.planConfirmation || {};
  const caseEvents = postFilingAdmin?.caseEvents || [];

  const handleToggleChecklistItem = (meetingId, itemId) => {
    const updatedMeetings = meetings341.map((meeting) => {
      if (meeting.id !== meetingId) return meeting;
      const updatedChecklist = (meeting.preparationChecklist || []).map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...meeting, preparationChecklist: updatedChecklist };
    });

    onUpdatePostFiling({ ...postFilingAdmin, meetings341: updatedMeetings });
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      const synced = updatedMeetings.find((m) => m.id === meetingId);
      setSelectedMeeting(synced || null);
    }
  };

  const openAddMeetingModal = () => {
    setMeetingForm({
      meetingDateTime: '',
      locationOrVirtual: '',
      trusteeName: currentCase.trusteeName || '',
      status: 'Scheduled',
      notes: '',
      checklistText: DEFAULT_MEETING_CHECKLIST.join('\n'),
    });
    setMeetingErrors({});
    setIsAddMeetingOpen(true);
  };

  const handleSaveMeeting = (e) => {
    e.preventDefault();
    const errors = {};
    if (!meetingForm.meetingDateTime.trim()) errors.meetingDateTime = 'Meeting date and time is required.';
    if (!meetingForm.locationOrVirtual.trim()) errors.locationOrVirtual = 'Location or virtual meeting details are required.';
    if (!meetingForm.trusteeName.trim()) errors.trusteeName = 'Trustee name is required.';

    if (Object.keys(errors).length > 0) {
      setMeetingErrors(errors);
      return;
    }

    const checklistLines = meetingForm.checklistText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const newMeeting = {
      id: `M341-${Date.now().toString().slice(-4)}`,
      meetingDateTime: meetingForm.meetingDateTime.trim(),
      locationOrVirtual: meetingForm.locationOrVirtual.trim(),
      trusteeName: meetingForm.trusteeName.trim(),
      status: meetingForm.status,
      notes: meetingForm.notes.trim() || 'Added via Post-Filing Administration workspace.',
      preparationChecklist: (checklistLines.length ? checklistLines : DEFAULT_MEETING_CHECKLIST).map((label, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        label,
        completed: false,
      })),
    };

    onUpdatePostFiling({
      ...postFilingAdmin,
      meetings341: [newMeeting, ...meetings341],
    });
    addToast(`341 Meeting scheduled for ${newMeeting.meetingDateTime}.`, 'success');
    setIsAddMeetingOpen(false);
  };

  const openAddEventModal = () => {
    setEventForm({
      eventType: 'Discharge',
      eventDate: '',
      status: 'Scheduled',
      description: '',
    });
    setEventErrors({});
    setIsAddEventOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const errors = {};
    if (!eventForm.eventDate.trim()) errors.eventDate = 'Event date is required.';
    if (!eventForm.description.trim()) errors.description = 'Description is required.';

    if (Object.keys(errors).length > 0) {
      setEventErrors(errors);
      return;
    }

    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      eventType: eventForm.eventType,
      eventDate: eventForm.eventDate.trim(),
      status: eventForm.status,
      description: eventForm.description.trim(),
    };

    onUpdatePostFiling({
      ...postFilingAdmin,
      caseEvents: [newEvent, ...caseEvents],
    });
    addToast(`${newEvent.eventType} event recorded on post-filing log.`, 'success');
    setIsAddEventOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Demo / Mock Data Scope Notice */}
      <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg flex items-start gap-2.5 text-xs text-[#202A35]">
        <Info className="w-4 h-4 text-[#06244B] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#06244B]">Post-Filing Administration Workspace (Demo Mock Docket Data):</span>{' '}
          Track trustee notices, Section 341 meetings, formal objections, plan confirmation milestones, and discharge/conversion/reopening events for{' '}
          <strong>{currentCase.caseNumber}</strong>.
        </div>
      </div>

      {/* Section A: Trustee Notices */}
      <section className="bg-white border border-[#D9D6CF] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#A4432B]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#06244B]">A. Trustee Notices</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#06244B] border border-[#D9D6CF]">
              {trusteeNotices.length}
            </span>
          </div>
          <span className="text-[11px] text-[#667085] hidden sm:inline">Standing / Case Trustee Communications</span>
        </div>

        <div className="p-4">
          {trusteeNotices.length === 0 ? (
            <SectionEmptyState
              icon={Bell}
              title="No Trustee Notices Recorded"
              description="No post-filing trustee notices or deficiency directives are currently logged for this docket."
            />
          ) : (
            <div className="space-y-2.5">
              {trusteeNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-lg border border-[#D9D6CF] bg-white hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-[#06244B]">{notice.title}</span>
                      <PostFilingBadge status={notice.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-[#667085]">
                      <span>Trustee: <strong className="text-[#202A35]">{notice.trusteeName}</strong></span>
                      <span>Received: <strong className="text-[#202A35] font-mono">{notice.dateReceived}</strong></span>
                      <span>Deadline: <strong className="text-[#A4432B] font-mono">{notice.responseDeadline}</strong></span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedNotice(notice)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section B: 341 Meetings */}
      <section className="bg-white border border-[#D9D6CF] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#06244B]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#06244B]">B. 341 Meetings of Creditors</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#06244B] border border-[#D9D6CF]">
              {meetings341.length}
            </span>
          </div>
          <Button size="sm" variant="primary" icon={Plus} onClick={openAddMeetingModal}>
            Add Meeting
          </Button>
        </div>

        <div className="p-4">
          {meetings341.length === 0 ? (
            <SectionEmptyState
              icon={Calendar}
              title="No 341 Meetings Scheduled"
              description="Use Add Meeting to schedule a Section 341 examination and track its preparation checklist."
            />
          ) : (
            <div className="space-y-3">
              {meetings341.map((meeting) => {
                const checklist = meeting.preparationChecklist || [];
                const completedCount = checklist.filter((c) => c.completed).length;

                return (
                  <div
                    key={meeting.id}
                    className="p-3.5 rounded-lg border border-[#D9D6CF] bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-[#06244B] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#A4432B]" />
                            {meeting.meetingDateTime}
                          </span>
                          <PostFilingBadge status={meeting.status} />
                        </div>
                        <div className="text-[11px] text-[#202A35] flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#667085] shrink-0 mt-0.5" />
                          <span>{meeting.locationOrVirtual}</span>
                        </div>
                        <div className="text-[11px] text-[#667085]">
                          Presiding Trustee: <strong className="text-[#202A35]">{meeting.trusteeName}</strong>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          View Meeting
                        </Button>
                      </div>
                    </div>

                    {/* Preparation Checklist */}
                    <div className="p-2.5 bg-slate-50 rounded border border-[#D9D6CF]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#06244B]">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-[#06244B]" />
                          Preparation Checklist
                        </span>
                        <span className="font-mono text-[#667085]">
                          {completedCount}/{checklist.length} Completed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {checklist.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 text-[11px] text-[#202A35] cursor-pointer hover:text-[#06244B]"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklistItem(meeting.id, item.id)}
                              className="mt-0.5 rounded border-[#D9D6CF] text-[#06244B] focus:ring-[#06244B]"
                            />
                            <span className={item.completed ? 'line-through text-[#667085]' : ''}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section C: Objections */}
      <section className="bg-white border border-[#D9D6CF] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#A4432B]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#06244B]">C. Objections &amp; Contested Filings</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#06244B] border border-[#D9D6CF]">
              {objections.length}
            </span>
          </div>
          <span className="text-[11px] text-[#667085] hidden sm:inline">Creditor &amp; Trustee Objections</span>
        </div>

        <div className="p-4">
          {objections.length === 0 ? (
            <SectionEmptyState
              icon={CheckCircle2}
              title="No Pending or Filed Objections"
              description="No creditor, trustee, or U.S. Trustee objections have been filed against exemptions, discharge, or plan confirmation."
            />
          ) : (
            <div className="space-y-2.5">
              {objections.map((obj) => (
                <div
                  key={obj.id}
                  className="p-3 rounded-lg border border-[#D9D6CF] bg-white hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-[#06244B]">{obj.objectionType}</span>
                      <PostFilingBadge status={obj.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-[#667085]">
                      <span>Filed By: <strong className="text-[#202A35]">{obj.filedBy}</strong></span>
                      <span>Filing Date: <strong className="text-[#202A35] font-mono">{obj.filingDate}</strong></span>
                      <span>Response Due: <strong className="text-[#A4432B] font-mono">{obj.responseDeadline}</strong></span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedObjection(obj)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section D: Plan Confirmation */}
      <section className="bg-white border border-[#D9D6CF] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#06244B]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#06244B]">D. Plan Confirmation</h4>
          </div>
          <PostFilingBadge status={planConfirmation.confirmationStatus || 'Not Available'} />
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Plan Submission Date</span>
              <span className="font-semibold text-[#06244B] mt-0.5 block">
                {planConfirmation.planSubmissionDate || 'Not Available'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Confirmation Hearing Date</span>
              <span className="font-semibold text-[#06244B] mt-0.5 block">
                {planConfirmation.confirmationHearingDate || 'Not Available'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Plan Status</span>
              <span className="font-semibold text-[#06244B] mt-0.5 block">
                {planConfirmation.planStatus || 'Not Available'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Confirmation Status</span>
              <div className="mt-1">
                <PostFilingBadge status={planConfirmation.confirmationStatus || 'Not Available'} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
            <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Related Notes</span>
            <p className="text-xs text-[#202A35] leading-relaxed">
              {planConfirmation.relatedNotes || 'No additional confirmation notes recorded.'}
            </p>
          </div>
        </div>
      </section>

      {/* Section E: Discharge / Conversion / Reopening */}
      <section className="bg-white border border-[#D9D6CF] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#F5F0E5] border-b border-[#D9D6CF] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#06244B]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#06244B]">
              E. Discharge / Conversion / Reopening Events
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#06244B] border border-[#D9D6CF]">
              {caseEvents.length}
            </span>
          </div>
          <Button size="sm" variant="primary" icon={Plus} onClick={openAddEventModal}>
            Add Event
          </Button>
        </div>

        <div className="p-4">
          {caseEvents.length === 0 ? (
            <SectionEmptyState
              icon={FileText}
              title="No Discharge, Conversion, or Reopening Events"
              description="No case disposition or status-change events have been recorded yet. Click Add Event to log one."
            />
          ) : (
            <div className="space-y-2.5">
              {caseEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-lg border border-[#D9D6CF] bg-white space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          EVENT_TYPE_BADGE_MAP[evt.eventType] || 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {evt.eventType}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#06244B]">
                        Event Date: {evt.eventDate}
                      </span>
                    </div>
                    <PostFilingBadge status={evt.status} />
                  </div>
                  <p className="text-xs text-[#202A35] leading-relaxed">{evt.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trustee Notice Detail Modal */}
      <Modal
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || 'Trustee Notice Details'}
        subtitle={
          selectedNotice
            ? `${selectedNotice.docketEntry || 'Post-Filing Notice'} • ${currentCase.caseNumber}`
            : ''
        }
        maxWidth="max-w-lg"
        footer={
          <Button size="sm" variant="outline" onClick={() => setSelectedNotice(null)}>
            Close
          </Button>
        }
      >
        {selectedNotice && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Trustee Name</span>
                <span className="font-semibold text-[#06244B]">{selectedNotice.trusteeName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Current Status</span>
                <div className="mt-0.5">
                  <PostFilingBadge status={selectedNotice.status} />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Date Received</span>
                <span className="font-mono font-semibold">{selectedNotice.dateReceived}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Response Deadline</span>
                <span className="font-mono font-semibold text-[#A4432B]">{selectedNotice.responseDeadline}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Notice Summary</span>
              <p className="leading-relaxed bg-white p-3 rounded border border-[#D9D6CF]">
                {selectedNotice.summary || 'No detailed summary provided.'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Required Action</span>
              <p className="leading-relaxed bg-[#F5F0E5]/50 p-3 rounded border border-[#D9D6CF]">
                {selectedNotice.requiredAction || 'Monitor docket for further trustee instructions.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 341 Meeting Detail Modal */}
      <Modal
        isOpen={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        title="Section 341 Meeting of Creditors Details"
        subtitle={selectedMeeting ? `${selectedMeeting.meetingDateTime} • ${currentCase.caseNumber}` : ''}
        maxWidth="max-w-lg"
        footer={
          <Button size="sm" variant="outline" onClick={() => setSelectedMeeting(null)}>
            Close
          </Button>
        }
      >
        {selectedMeeting && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Meeting Date &amp; Time</span>
                <span className="font-semibold text-[#06244B]">{selectedMeeting.meetingDateTime}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Meeting Status</span>
                <div className="mt-0.5">
                  <PostFilingBadge status={selectedMeeting.status} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Location / Virtual Details</span>
                <span className="font-medium text-[#06244B]">{selectedMeeting.locationOrVirtual}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Trustee Name</span>
                <span className="font-semibold">{selectedMeeting.trusteeName}</span>
              </div>
            </div>

            {selectedMeeting.notes && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Meeting Notes</span>
                <p className="p-3 bg-white rounded border border-[#D9D6CF] leading-relaxed">
                  {selectedMeeting.notes}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1.5">
                Preparation Checklist (Click to Update)
              </span>
              <div className="space-y-1.5 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                {(selectedMeeting.preparationChecklist || []).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2 text-xs text-[#202A35] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(selectedMeeting.id, item.id)}
                      className="mt-0.5 rounded border-[#D9D6CF] text-[#06244B]"
                    />
                    <span className={item.completed ? 'line-through text-[#667085]' : ''}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Objection Detail Modal */}
      <Modal
        isOpen={Boolean(selectedObjection)}
        onClose={() => setSelectedObjection(null)}
        title={selectedObjection?.objectionType || 'Objection Details'}
        subtitle={
          selectedObjection
            ? `${selectedObjection.docketNumber || 'Contested Filing'} • ${currentCase.caseNumber}`
            : ''
        }
        maxWidth="max-w-lg"
        footer={
          <Button size="sm" variant="outline" onClick={() => setSelectedObjection(null)}>
            Close
          </Button>
        }
      >
        {selectedObjection && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Filed By</span>
                <span className="font-semibold text-[#06244B]">{selectedObjection.filedBy}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Filing Date</span>
                <span className="font-mono font-semibold">{selectedObjection.filingDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Response Deadline</span>
                <span className="font-mono font-semibold text-[#A4432B]">{selectedObjection.responseDeadline}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Status</span>
                <div className="mt-0.5">
                  <PostFilingBadge status={selectedObjection.status} />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Hearing Date</span>
                <span className="font-semibold">{selectedObjection.hearingDate || 'To Be Set'}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Grounds / Legal Basis</span>
              <p className="p-3 bg-white rounded border border-[#D9D6CF] leading-relaxed">
                {selectedObjection.grounds || 'See filed objection docket entry.'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Proposed Resolution / Strategy</span>
              <p className="p-3 bg-[#F5F0E5]/50 rounded border border-[#D9D6CF] leading-relaxed">
                {selectedObjection.proposedResolution || 'Counsel review pending.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Add 341 Meeting Modal */}
      <Modal
        isOpen={isAddMeetingOpen}
        onClose={() => setIsAddMeetingOpen(false)}
        title="Schedule / Add Section 341 Meeting"
        subtitle={`Case ${currentCase.caseNumber} • ${currentCase.debtorName}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveMeeting} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Meeting Date &amp; Time <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 2026-04-28 • 10:30 AM MT"
              value={meetingForm.meetingDateTime}
              onChange={(e) => {
                setMeetingForm({ ...meetingForm, meetingDateTime: e.target.value });
                if (meetingErrors.meetingDateTime) setMeetingErrors({ ...meetingErrors, meetingDateTime: '' });
              }}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
            {meetingErrors.meetingDateTime && (
              <p className="text-[11px] text-red-700 mt-1">{meetingErrors.meetingDateTime}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Location or Virtual Meeting Details <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Zoom Video • ID: 849 2019 4412 • Passcode: UTB341"
              value={meetingForm.locationOrVirtual}
              onChange={(e) => {
                setMeetingForm({ ...meetingForm, locationOrVirtual: e.target.value });
                if (meetingErrors.locationOrVirtual) setMeetingErrors({ ...meetingErrors, locationOrVirtual: '' });
              }}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
            {meetingErrors.locationOrVirtual && (
              <p className="text-[11px] text-red-700 mt-1">{meetingErrors.locationOrVirtual}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Trustee Name <span className="text-[#A4432B]">*</span>
              </label>
              <input
                type="text"
                value={meetingForm.trusteeName}
                onChange={(e) => {
                  setMeetingForm({ ...meetingForm, trusteeName: e.target.value });
                  if (meetingErrors.trusteeName) setMeetingErrors({ ...meetingErrors, trusteeName: '' });
                }}
                className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              />
              {meetingErrors.trusteeName && (
                <p className="text-[11px] text-red-700 mt-1">{meetingErrors.trusteeName}</p>
              )}
            </div>
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Meeting Status</label>
              <select
                value={meetingForm.status}
                onChange={(e) => setMeetingForm({ ...meetingForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Continued">Continued</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Preparation Checklist Items (one per line)
            </label>
            <textarea
              rows={3}
              value={meetingForm.checklistText}
              onChange={(e) => setMeetingForm({ ...meetingForm, checklistText: e.target.value })}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Optional attendance or document instructions..."
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMeetingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Meeting
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Discharge / Conversion / Reopening Event Modal */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Add Discharge / Conversion / Reopening Event"
        subtitle={`Case ${currentCase.caseNumber} • ${currentCase.debtorName}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Event Type <span className="text-[#A4432B]">*</span>
              </label>
              <select
                value={eventForm.eventType}
                onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              >
                <option value="Discharge">Discharge</option>
                <option value="Conversion">Conversion</option>
                <option value="Reopening">Reopening</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Current Status <span className="text-[#A4432B]">*</span>
              </label>
              <select
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
                <option value="Entered">Entered</option>
                <option value="Completed">Completed</option>
                <option value="Denied">Denied</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Event Date <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="date"
              value={eventForm.eventDate}
              onChange={(e) => {
                setEventForm({ ...eventForm, eventDate: e.target.value });
                if (eventErrors.eventDate) setEventErrors({ ...eventErrors, eventDate: '' });
              }}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
            {eventErrors.eventDate && (
              <p className="text-[11px] text-red-700 mt-1">{eventErrors.eventDate}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Event Description <span className="text-[#A4432B]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the discharge order, chapter conversion motion, or case reopening basis..."
              value={eventForm.description}
              onChange={(e) => {
                setEventForm({ ...eventForm, description: e.target.value });
                if (eventErrors.description) setEventErrors({ ...eventErrors, description: '' });
              }}
              className="w-full px-3 py-2 border border-[#D9D6CF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#06244B]"
            />
            {eventErrors.description && (
              <p className="text-[11px] text-red-700 mt-1">{eventErrors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

