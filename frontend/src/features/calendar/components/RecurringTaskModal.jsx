import React, { useState } from 'react';
import { Repeat, Calendar, Clock, CheckCircle2, Bell, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function RecurringTaskModal({ isOpen, onClose, onTaskCreated }) {
  const { addToast } = useToast();
  const [taskTitle, setTaskTitle] = useState('');
  const [matterId, setMatterId] = useState('25-CV-0101');
  const [category, setCategory] = useState('Court Filing');
  const [frequency, setFrequency] = useState('Weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Friday');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2027-05-15');
  const [reminderDays, setReminderDays] = useState('3');
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [syncToOutlook, setSyncToOutlook] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle) {
      addToast('Please provide a task or deadline description.', 'error');
      return;
    }

    const newTask = {
      id: `REC-${Date.now()}`,
      title: taskTitle,
      matterId,
      category,
      frequency,
      dayOfWeek,
      startDate,
      endDate,
      reminderDays,
      excludeWeekends,
      syncToOutlook,
      nextDueDate: startDate,
      status: 'Active Recurring'
    };

    if (onTaskCreated) {
      onTaskCreated(newTask);
    }

    addToast(`Recurring schedule "${taskTitle}" (${frequency}) created and synced to Outlook Calendar.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Recurring Task & Docket Deadline"
      subtitle="Automated interval scheduling with weekend roll-over logic (Utah URCP Rule 6)"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Task / Docket Description *
          </label>
          <input
            type="text"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Monthly Status Conference Call / IOLTA Trust Balance Verification"
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:ring-1 focus:ring-[#06244B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Associated Matter
            </label>
            <select
              value={matterId}
              onChange={(e) => setMatterId(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
            >
              <option value="25-CV-0101">25-CV-0101 - Wasatch Mountain Logistics</option>
              <option value="24-LND-0912">24-LND-0912 - Apex Horizon Land Use</option>
              <option value="IMM-2026-001">IMM-2026-001 - Garcia I-130 Petition</option>
              <option value="BNK-2026-001">BNK-2026-001 - Rachel Walker Ch. 7</option>
              <option value="FIRM-GEN">FIRM-GEN - Administrative &amp; Trust Accounting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
            >
              <option value="Court Filing">Court Filing / Motion Deadline</option>
              <option value="Discovery Cutoff">Discovery Response Deadline</option>
              <option value="Client Consultation">Client Status Conference</option>
              <option value="Statute of Limitations">Statute of Limitations Check</option>
              <option value="Trust Accounting">IOLTA Three-Way Reconciliation</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] space-y-3">
          <div className="flex items-center gap-2 text-[#06244B] font-bold">
            <Repeat className="w-4 h-4 text-[#A4432B]" />
            <span>Recurrence Frequency Pattern</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#667085] uppercase mb-1">
                Repeats Every
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                <option value="Daily">Daily (Every Business Day)</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Every 2 Weeks</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually (Statutory SOL)</option>
              </select>
            </div>

            {frequency === 'Weekly' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#667085] uppercase mb-1">
                  On Day
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#667085] uppercase mb-1">
                First Due Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#667085] uppercase mb-1">
                End Recurrence
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Automated Advance Alert
            </label>
            <select
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
            >
              <option value="1">1 Business Day Prior</option>
              <option value="3">3 Business Days Prior</option>
              <option value="7">1 Week Prior</option>
              <option value="14">2 Weeks Prior</option>
              <option value="30">30 Calendar Days Prior</option>
            </select>
          </div>

          <div className="space-y-2 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeWeekends}
                onChange={(e) => setExcludeWeekends(e.target.checked)}
                className="rounded border-[#D9D6CF] text-[#06244B]"
              />
              <span className="font-semibold text-[#202A35]">Utah URCP Rule 6 Weekend Rollover</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToOutlook}
                onChange={(e) => setSyncToOutlook(e.target.checked)}
                className="rounded border-[#D9D6CF] text-[#06244B]"
              />
              <span className="font-semibold text-[#202A35]">Sync into Firm Outlook / Exchange</span>
            </label>
          </div>
        </div>

        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>[DEMO/SIMULATED] Court Rule Engine:</strong> Recurrence triggers will automatically simulate task creation across assigned paralegals and attorneys.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" icon={Repeat}>
            Save Recurring Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}

