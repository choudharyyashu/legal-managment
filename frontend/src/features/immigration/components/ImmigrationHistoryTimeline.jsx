import React, { useState } from 'react';
import { Plane, Plus, Calendar, MapPin, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function ImmigrationHistoryTimeline({ travelHistory = [], onAddTravelRecord }) {
  const [history, setHistory] = useState(travelHistory);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [entryDate, setEntryDate] = useState('');
  const [portOfEntry, setPortOfEntry] = useState('');
  const [classOfAdmission, setClassOfAdmission] = useState('B-2 Visitor');
  const [i94Number, setI94Number] = useState('');
  const [authorizedStayUntil, setAuthorizedStayUntil] = useState('');
  const [notes, setNotes] = useState('');
  const { addToast } = useToast();

  const handleSaveTravel = (e) => {
    e.preventDefault();
    if (!entryDate || !portOfEntry) {
      addToast('Please provide entry date and port of entry.', 'error');
      return;
    }

    const newRecord = {
      id: `trv-${Date.now()}`,
      entryDate,
      portOfEntry,
      classOfAdmission,
      i94Number: i94Number || 'Pending Retrieval',
      authorizedStayUntil: authorizedStayUntil || 'Duration of Status (D/S)',
      notes: notes || 'Client reported entry.',
    };

    setHistory(prev => [newRecord, ...prev]);
    if (onAddTravelRecord) {
      onAddTravelRecord(newRecord);
    }
    addToast('U.S. travel and admission record added to timeline.', 'success');
    setIsAddOpen(false);
    setEntryDate('');
    setPortOfEntry('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-2">
        <div>
          <h4 className="font-bold text-sm text-[#06244B] flex items-center gap-1.5">
            <Plane className="w-4 h-4 text-[#A4432B]" />
            U.S. Arrival, Departure &amp; Form I-94 Chronology
          </h4>
          <span className="text-xs text-[#667085]">
            Chronological inspection history required by USCIS Form I-485 Part 1.
          </span>
        </div>
        <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Travel Record
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 border border-[#D9D6CF] rounded-lg text-xs text-[#667085]">
          No prior entry/departure records logged for this beneficiary.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9D6CF]">
          {history.map((item, idx) => (
            <div key={item.id} className="relative bg-white p-3.5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-1.5 text-xs">
              <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-[#A4432B] border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#06244B] text-sm">
                    {item.entryDate}
                  </span>
                  <span className="bg-[#F5F0E5] text-[#06244B] font-semibold px-2 py-0.5 rounded text-[10px] border border-[#D9D6CF]">
                    {item.classOfAdmission}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#667085]">
                  I-94: <strong>{item.i94Number}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#202A35]">
                <MapPin className="w-3.5 h-3.5 text-[#A4432B] shrink-0" />
                <span>Port of Entry: <strong>{item.portOfEntry}</strong></span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-[#667085]">
                  Authorized Stay Until: <strong className="text-[#06244B]">{item.authorizedStayUntil}</strong>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Lawful Admission
                </span>
              </div>

              {item.notes && (
                <p className="text-[11px] text-[#667085] italic pt-0.5">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log U.S. Entry / Admission Record"
        subtitle="Record Form I-94 details for USCIS inspection verification"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveTravel} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Date of Entry"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Port of Entry (Airport / Land Border)"
                value={portOfEntry}
                onChange={(e) => setPortOfEntry(e.target.value)}
                placeholder="e.g. Salt Lake City (SLC), UT"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Class of Admission
              </label>
              <select
                value={classOfAdmission}
                onChange={(e) => setClassOfAdmission(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                <option value="B-2 Visitor">B-2 Visitor for Pleasure</option>
                <option value="B-1 Business">B-1 Temporary Business</option>
                <option value="F-1 Student">F-1 Academic Student</option>
                <option value="H-1B Specialty">H-1B Specialty Occupation</option>
                <option value="O-1A Extraordinary">O-1A Extraordinary Ability</option>
                <option value="Parole Humanitarian">Humanitarian Parole</option>
              </select>
            </div>
            <div>
              <Input
                label="Form I-94 Number (11 digits)"
                value={i94Number}
                onChange={(e) => setI94Number(e.target.value)}
                placeholder="###########"
              />
            </div>
          </div>

          <div>
            <Input
              label="Authorized Stay Date (Admit Until Date)"
              value={authorizedStayUntil}
              onChange={(e) => setAuthorizedStayUntil(e.target.value)}
              placeholder="e.g. 10/11/2023 or D/S"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Notes &amp; Inspection Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context regarding visa stamp, port inspector notes, or timely departure..."
              className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
            />
          </div>

          <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Admission Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

