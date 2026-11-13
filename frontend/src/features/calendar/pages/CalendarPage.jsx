import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, AlertTriangle, Plus, Repeat } from 'lucide-react';
import { MOCK_CALENDAR_EVENTS } from '../../../data/mockCalendar';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatDate';
import { RecurringTaskModal } from '../components/RecurringTaskModal';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(MOCK_CALENDAR_EVENTS);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

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
    const dayEvents = events.filter(e => e.date === dateStr);
    days.push({ dayNumber: d, dateStr, isCurrentMonth: true, events: dayEvents });
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'Court Hearing':
        return 'bg-red-50 text-red-900 border-l-2 border-red-700';
      case 'Court Deadline':
        return 'bg-amber-50 text-amber-900 border-l-2 border-amber-700';
      case 'Client Appointment':
        return 'bg-blue-50 text-blue-900 border-l-2 border-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 border-l-2 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Litigation &amp; Court Calendar"
        subtitle="Master docket of hearings, judicial conferences, discovery deadlines, and client signing appointments."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Calendar' }]}
        actions={
          <div className="flex items-center gap-2">
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
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentDate(new Date(2026, 10, 1))}
          >
            Today (Nov 2026)
          </Button>
          <div className="flex items-center rounded border border-[#D9D6CF]">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#F5F0E5] text-[#06244B] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#F5F0E5] text-[#06244B] transition-colors border-l border-[#D9D6CF]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-[#D9D6CF] bg-[#F5F0E5]/80 text-center text-xs font-bold text-[#06244B] py-2.5 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#D9D6CF]/60">
                {days.map((item, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                      !item.isCurrentMonth ? 'bg-[#FAF7F0]/30' : 'bg-white hover:bg-[#F5F0E5]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          item.dayNumber === 6 ? 'w-5 h-5 rounded-full bg-[#A4432B] text-white flex items-center justify-center font-bold' : 'text-[#06244B]'
                        }`}
                      >
                        {item.dayNumber}
                      </span>
                      {item.events?.length > 0 && (
                        <span className="text-[10px] font-bold text-[#A4432B]">
                          {item.events.length} {item.events.length === 1 ? 'event' : 'events'}
                        </span>
                      )}
                    </div>

                    {/* Event badges */}
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-20">
                      {item.events?.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`text-[10px] p-1 rounded font-medium cursor-pointer truncate ${getEventBadge(evt.type)}`}
                          title={`${evt.startTime} - ${evt.title}`}
                        >
                          <strong>{evt.startTime}</strong> {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {(viewMode === 'agenda' || viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#D9D6CF] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#06244B]">
              Litigation Docket &amp; Agenda View ({events.length} Scheduled Events)
            </h3>
            <span className="text-xs text-[#667085]">Showing upcoming hearings and appointments</span>
          </div>

          <div className="divide-y divide-[#D9D6CF]/60">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="py-4 hover:bg-[#F5F0E5]/30 rounded p-3 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded bg-[#F5F0E5] border border-[#D9D6CF] flex flex-col items-center justify-center text-[#06244B] flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase text-[#A4432B]">
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-serif font-bold">
                      {new Date(evt.date).getDate() + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getEventBadge(evt.type)}`}>
                        {evt.type}
                      </span>
                      <span className="text-xs font-semibold text-[#A4432B]">
                        {evt.startTime} - {evt.endTime}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#06244B] mt-1">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-[#667085] mt-0.5">
                      Case: <strong>{evt.matterTitle}</strong>
                    </p>

                    <p className="text-xs text-[#202A35] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#06244B]" />
                      {evt.location}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedEvent(evt)}>
                    Event Details &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Dialog */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
        subtitle={`${selectedEvent?.type} • ${formatDate(selectedEvent?.date)}`}
        maxWidth="max-w-lg"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
              <p className="font-bold text-sm text-[#06244B]">{selectedEvent.matterTitle}</p>
              <p className="text-[#667085]">{selectedEvent.clientName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#667085] font-semibold text-[10px] block uppercase">Scheduled Time:</span>
                <p className="font-bold text-[#A4432B] text-sm mt-0.5">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
              </div>
              <div>
                <span className="text-[#667085] font-semibold text-[10px] block uppercase">Presiding Judicial Officer:</span>
                <p className="font-bold text-[#06244B] mt-0.5">{selectedEvent.presidingJudge || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span className="text-[#667085] font-semibold text-[10px] block uppercase">Location &amp; Hearing Room:</span>
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

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Recurring Task & Docket Deadline Modal */}
      <RecurringTaskModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onTaskCreated={(newTask) => {
          setEvents(prev => [
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
              notes: `Recurrence: ${newTask.frequency} (Reminder: ${newTask.reminderDays} days prior).`
            },
            ...prev
          ]);
        }}
      />
    </div>
  );
}

