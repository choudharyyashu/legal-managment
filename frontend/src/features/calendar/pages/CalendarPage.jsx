import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Plus,
  Repeat,
  Trash2,
  Scale
} from 'lucide-react';
import { calendarService } from '../../../services/calendarService';
import { MOCK_CALENDAR_EVENTS } from '../../../data/mockCalendar';
import { useMatters } from '../../../context/MatterContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatDate';
import { RecurringTaskModal } from '../components/RecurringTaskModal';

export function CalendarPage() {
  const { matters } = useMatters();
  const { addToast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(MOCK_CALENDAR_EVENTS);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Form State for New Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventMatterId, setEventMatterId] = useState('');
  const [eventType, setEventType] = useState('Hearing');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventLocation, setEventLocation] = useState('Third Judicial District Court, Courtroom 3B');
  const [eventJudge, setEventJudge] = useState('Hon. Carolyn B. McHugh');
  const [isCourtAppearance, setIsCourtAppearance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeEvent = (e) => ({
    ...e,
    id: e.id,
    title: e.title,
    date: e.startTime ? new Date(e.startTime).toISOString().split('T')[0] : e.date,
    time: e.startTime
      ? new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : e.time,
    startTime: e.startTime
      ? new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '09:00 AM',
    endTime: e.endTime
      ? new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '10:00 AM',
    type: e.isCourtAppearance ? 'Court Hearing' : (e.eventType || 'Client Appointment'),
    matter: e.matter?.title || e.matter || 'Firm Matter',
    matterTitle: e.matter?.title || e.matterTitle || 'Firm Matter',
    clientName: e.matter?.client?.name || e.clientName || 'Heugly & Bludworth Client',
    location: e.location || 'Third District Court - Salt Lake City',
    presidingJudge: e.judge || e.presidingJudge || 'Hon. Carolyn B. Tanner',
    notes: e.notes || (e.isCourtAppearance ? 'Mandatory in-person judicial appearance' : 'Office conference'),
    isDbRecord: Boolean(e.createdAt || (e.id && e.id.length > 20)),
  });

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await calendarService.getEvents();
      if (Array.isArray(res) && res.length > 0) {
        const liveEvents = res.map(normalizeEvent);
        setEvents(liveEvents);
      } else {
        setEvents(MOCK_CALENDAR_EVENTS);
      }
    } catch (err) {
      console.warn('Could not load calendar events from API:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      addToast('Please enter an event title.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const startDateTime = new Date(`${eventDate}T${eventStartTime}:00`);
      const endDateTime = new Date(`${eventDate}T${eventEndTime}:00`);

      if (endDateTime < startDateTime) {
        addToast('End time must be after start time.', 'error');
        return;
      }

      const payload = {
        title: eventTitle.trim(),
        eventType,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: eventLocation || undefined,
        judge: eventJudge || undefined,
        isCourtAppearance: Boolean(isCourtAppearance),
        matterId: eventMatterId || undefined,
      };

      await calendarService.createEvent(payload);
      addToast(`Calendar event "${eventTitle}" scheduled and persisted to MySQL.`, 'success');
      setIsAddEventOpen(false);
      setEventTitle('');
      await loadEvents();
    } catch (err) {
      addToast(err?.message || 'Failed to schedule calendar event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this event from the court calendar?')) return;
    try {
      await calendarService.deleteEvent(id);
      addToast('Event removed from firm calendar.', 'info');
      setSelectedEvent(null);
      await loadEvents();
    } catch (err) {
      // If it is mock or local only, remove from state
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSelectedEvent(null);
      addToast('Event removed from local view.', 'info');
    }
  };

  const handleRecurringCreated = async (newTask) => {
    try {
      const startDateTime = new Date(`${newTask.startDate}T09:00:00`);
      const endDateTime = new Date(`${newTask.startDate}T10:00:00`);
      const matchedMatter = matters.find((m) => m.matterNumber === newTask.matterId || m.id === newTask.matterId);

      await calendarService.createEvent({
        title: newTask.title,
        eventType: 'Filing Deadline',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: 'Salt Lake City Docket',
        isCourtAppearance: false,
        matterId: matchedMatter?.id || undefined,
      });
      await loadEvents();
      addToast(`Recurring schedule "${newTask.title}" persisted to firm calendar.`, 'success');
    } catch (err) {
      console.warn('Could not persist recurring event to API:', err?.message);
      // Fallback local update
      setEvents((prev) => [
        {
          id: newTask.id,
          title: newTask.title,
          matterTitle: newTask.matterId,
          clientName: 'Heugly & Bludworth Recurring Docket',
          date: newTask.nextDueDate,
          startTime: '09:00 AM',
          endTime: '10:00 AM',
          type: 'Court Deadline',
          location: 'Simulated Firm Calendar',
          notes: `Recurrence: ${newTask.frequency} (Reminder: ${newTask.reminderDays} days prior).`,
        },
        ...prev,
      ]);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month view generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ dayNumber: null, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    days.push({ dayNumber: d, dateStr, isCurrentMonth: true, events: dayEvents });
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'Court Hearing':
      case 'Hearing':
      case 'Trial':
        return 'bg-red-50 text-red-900 border-l-2 border-red-700';
      case 'Court Deadline':
      case 'Filing Deadline':
        return 'bg-amber-50 text-amber-900 border-l-2 border-amber-700';
      case 'Client Appointment':
      case 'Client Conference':
        return 'bg-blue-50 text-blue-900 border-l-2 border-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 border-l-2 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Litigation & Court Calendar"
        subtitle="Master docket of hearings, judicial conferences, discovery deadlines, and client signing appointments."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Calendar' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddEventOpen(true)}
              className="text-xs"
            >
              Schedule Event
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Repeat}
              onClick={() => setIsRecurringModalOpen(true)}
              className="text-xs"
            >
              Recurring Rules
            </Button>

            {/* View Switcher */}
            <div className="flex rounded border border-[#D9D6CF] bg-white p-0.5 text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'month' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:text-[#06244B]'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'week' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:text-[#06244B]'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'day' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:text-[#06244B]'}`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'agenda' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:text-[#06244B]'}`}
              >
                Agenda
              </button>
            </div>
          </div>
        }
      />

      {/* Calendar Controls & Month Title */}
      <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#A4432B]" />
          <h2 className="text-xl font-serif font-bold text-[#06244B]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          {loading && <span className="text-xs text-[#667085] italic">Syncing with court docket...</span>}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentDate(new Date(2026, 10, 1))}
            className="text-xs"
          >
            Today (Nov 2026)
          </Button>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" icon={ChevronLeft} onClick={prevMonth} />
            <Button size="sm" variant="outline" icon={ChevronRight} onClick={nextMonth} />
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-[#D9D6CF] bg-[#FAF8F5] text-center text-xs font-bold text-[#667085] uppercase py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#D9D6CF]">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[110px] p-2 transition-colors ${
                  !day.isCurrentMonth
                    ? 'bg-[#F9FAFB]/50'
                    : day.dateStr === '2026-11-13'
                      ? 'bg-amber-50/40'
                      : 'hover:bg-gray-50/60'
                }`}
              >
                {day.dayNumber && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold ${
                        day.dateStr === '2026-11-13'
                          ? 'w-6 h-6 rounded-full bg-[#06244B] text-white flex items-center justify-center font-mono'
                          : 'text-[#202A35]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.events && day.events.length > 0 && (
                      <span className="text-[10px] font-bold text-[#667085]">
                        {day.events.length}
                      </span>
                    )}
                  </div>
                )}

                {/* Day Events List */}
                <div className="space-y-1">
                  {day.events &&
                    day.events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 rounded text-[11px] truncate block font-medium shadow-2xs transition-transform hover:scale-[1.01] ${getEventBadge(
                          evt.type
                        )}`}
                      >
                        <div className="font-bold truncate">{evt.title}</div>
                        <div className="text-[9px] opacity-80 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 inline" /> {evt.time || evt.startTime}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle divide-y divide-[#D9D6CF]">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="p-4 flex items-start justify-between hover:bg-gray-50 cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getEventBadge(
                      evt.type
                    )}`}
                  >
                    {evt.type}
                  </span>
                  <span className="font-bold text-xs text-[#06244B]">{evt.title}</span>
                </div>
                <p className="text-xs text-[#667085]">{evt.matterTitle || evt.matter}</p>
                <div className="flex items-center gap-4 text-xs text-[#667085] pt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#A4432B]" /> {evt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#A4432B]" /> {evt.startTime} - {evt.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {evt.location}
                  </span>
                </div>
              </div>
              <Button size="xs" variant="outline">
                View Details
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Week & Day Placeholder Views */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white p-12 text-center rounded border border-[#D9D6CF] space-y-2">
          <CalendarIcon className="w-10 h-10 text-[#667085] mx-auto opacity-40" />
          <h3 className="font-serif font-bold text-base text-[#06244B]">
            {viewMode.toUpperCase()} Docket Timeline
          </h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Switch to <strong>Month</strong> or <strong>Agenda</strong> view to inspect complete Utah District Court appearances.
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Court Appearance Details'}
        subtitle={`Utah URCP Rule 10 Judicial Appearance • ${selectedEvent?.type || 'Hearing'}`}
        maxWidth="max-w-lg"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#FAF8F5] border border-[#D9D6CF] rounded space-y-1">
              <span className="text-[#667085] font-semibold text-[10px] block uppercase">Associated Matter:</span>
              <p className="font-bold text-[#06244B] text-sm">{selectedEvent.matterTitle || selectedEvent.matter}</p>
              <p className="text-[#667085]">{selectedEvent.clientName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#667085] font-semibold text-[10px] block uppercase">Scheduled Time:</span>
                <p className="font-bold text-[#A4432B] text-sm mt-0.5">
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
              </div>
              <div>
                <span className="text-[#667085] font-semibold text-[10px] block uppercase">Presiding Judicial Officer:</span>
                <p className="font-bold text-[#06244B] mt-0.5">{selectedEvent.presidingJudge || 'Hon. Carolyn Tanner'}</p>
              </div>
            </div>

            <div>
              <span className="text-[#667085] font-semibold text-[10px] block uppercase">Location & Hearing Room:</span>
              <p className="mt-0.5 leading-relaxed">{selectedEvent.location}</p>
            </div>

            {selectedEvent.notes && (
              <div>
                <span className="text-[#667085] font-semibold text-[10px] block uppercase">Hearing Instructions:</span>
                <p className="p-3 bg-white border border-[#D9D6CF] rounded mt-1 leading-relaxed text-sm">
                  {selectedEvent.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#D9D6CF]">
              <Button
                size="sm"
                variant="outline"
                icon={Trash2}
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="text-red-700 hover:bg-red-50 border-red-200"
              >
                Delete Event
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Event Modal */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Schedule Court Appearance or Client Meeting"
        subtitle="Persists to Utah District Court litigation docket in MySQL database"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs text-[#202A35]">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Event Title / Hearing Description *
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Preliminary Injunction Hearing / Deposition of CFO"
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:ring-1 focus:ring-[#06244B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Associated Matter
              </label>
              <select
                value={eventMatterId}
                onChange={(e) => setEventMatterId(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium text-[#06244B]"
              >
                <option value="">General Docket (No Specific Matter)</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} - {m.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Event Classification *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium text-[#06244B]"
              >
                <option value="Hearing">Hearing (Judicial)</option>
                <option value="Trial">Trial (Jury / Bench)</option>
                <option value="Deposition">Deposition</option>
                <option value="Mediation">Mediation / ADR</option>
                <option value="Client Conference">Client Conference</option>
                <option value="Filing Deadline">Filing Deadline</option>
                <option value="Internal Meeting">Internal Firm Meeting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Court Location / Room
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g. Matheson Courthouse, Courtroom 4A"
                className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Presiding Judge
              </label>
              <input
                type="text"
                value={eventJudge}
                onChange={(e) => setEventJudge(e.target.value)}
                placeholder="e.g. Hon. Carolyn McHugh"
                className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] border border-[#D9D6CF] rounded flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-[#06244B] block">Mandatory Court Appearance</span>
              <span className="text-[11px] text-[#667085]">Flags event as high-priority litigation milestone</span>
            </div>
            <input
              type="checkbox"
              checked={isCourtAppearance}
              onChange={(e) => setIsCourtAppearance(e.target.checked)}
              className="w-4 h-4 text-[#06244B] rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Save & Persist to Docket'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recurring Task & Docket Deadline Modal */}
      <RecurringTaskModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onTaskCreated={handleRecurringCreated}
      />
    </div>
  );
}
