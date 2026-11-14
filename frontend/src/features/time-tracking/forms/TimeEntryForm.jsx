import React, { useState, useEffect } from 'react';
import { useTime } from '../../../context/TimeContext';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';

export function TimeEntryForm({ defaultMatterId = null, onSuccess, onCancel }) {
  const { addTimeEntry } = useTime();
  const { clients, refreshClients } = useClients();
  const { matters, refreshMatters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (clients.length === 0) refreshClients();
    if (matters.length === 0) refreshMatters();
  }, [clients.length, matters.length, refreshClients, refreshMatters]);

  const selectedDefaultMatter = defaultMatterId ? matters.find(m => m.id === defaultMatterId) : matters[0];

  const [clientId, setClientId] = useState(selectedDefaultMatter?.clientId || clients[0]?.id || '');
  const [matterId, setMatterId] = useState(selectedDefaultMatter?.id || matters[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('1.5');
  const [rate, setRate] = useState(currentUser.rate || 450);
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [errors, setErrors] = useState({});

  // When client changes, filter available matters
  const availableMatters = clientId ? matters.filter(m => m.clientId === clientId) : matters;

  const handleClientChange = (newClientId) => {
    setClientId(newClientId);
    const related = matters.filter(m => m.clientId === newClientId);
    if (related.length > 0) {
      setMatterId(related[0].id);
    } else {
      setMatterId('');
    }
  };

  const validate = () => {
    const errs = {};
    if (!clientId) errs.clientId = 'Please select a Client';
    if (!matterId) errs.matterId = 'Please select a Matter';
    if (!hours || parseFloat(hours) <= 0) errs.hours = 'Duration must be greater than 0';
    if (!description.trim()) errs.description = 'Work description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (submitStatus) => {
    if (!validate()) return;

    const client = clients.find(c => c.id === clientId);
    const matter = matters.find(m => m.id === matterId);

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      clientId,
      clientName: client?.name || 'Client',
      matterId,
      matterTitle: matter?.title || 'Matter',
      date,
      hours: parseFloat(hours),
      rate: parseFloat(rate),
      description,
      isBillable,
      status: submitStatus, // 'Draft' or 'Submitted'
    };

    addTimeEntry(payload);
    addToast(
      submitStatus === 'Submitted'
        ? `Logged ${hours} hrs and submitted for review.`
        : `Time entry saved as Draft (${hours} hrs).`,
      'success'
    );

    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            label="Client"
            required
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            options={clients.map(c => ({ value: c.id, label: c.name }))}
            error={errors.clientId}
          />
        </div>

        <div>
          <Select
            label="Related Matter"
            required
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
            options={availableMatters.map(m => ({ value: m.id, label: `${m.matterNumber} - ${m.title}` }))}
            error={errors.matterId}
          />
        </div>

        <div>
          <DatePicker
            label="Work Date"
            required
            value={date}
            onChange={(val) => setDate(val)}
          />
        </div>

        <div>
          <Input
            label="Duration (Decimal Hours, e.g. 1.5 = 1h 30m)"
            type="number"
            step="0.1"
            min="0.1"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            error={errors.hours}
          />
        </div>

        <div>
          <Input
            label="Hourly Rate ($/hr)"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            helperText={`Calculated Fee: $${((parseFloat(hours) || 0) * (parseFloat(rate) || 0)).toFixed(2)}`}
          />
        </div>

        <div className="flex items-center pt-6">
          <label className="relative flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] border-[#D9D6CF]"
            />
            <span className="text-sm font-semibold text-[#06244B]">
              Billable to Client
            </span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase mb-1">
            Work Description &amp; UTBMS Activity Details <span className="text-[#A4432B]">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe legal tasks performed (e.g. Conducted research on Tenth Circuit water easement precedence; prepared cross-examination outline)..."
            className={`w-full text-sm p-3 rounded border bg-white text-[#202A35] focus:outline-none ${
              errors.description ? 'border-[#B42318]' : 'border-[#D9D6CF] focus:border-[#06244B]'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-[#B42318] mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#D9D6CF]">
        <div className="text-xs text-[#667085]">
          Logging as <span className="font-semibold text-[#06244B]">{currentUser.name}</span> ({currentUser.title})
        </div>

        <div className="flex items-center gap-2.5">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('Draft')}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSubmit('Submitted')}
          >
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}

