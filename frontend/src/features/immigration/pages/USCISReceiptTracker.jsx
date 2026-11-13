import React, { useState } from 'react';
import { Search, Globe, RefreshCw, CheckCircle, Clock, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { MOCK_IMMIGRATION_CASES } from '../../../data/mockImmigrationCases';

export function USCISReceiptTracker() {
  const [receiptNumber, setReceiptNumber] = useState('LIN-26-901-50234');
  const [activeTracking, setActiveTracking] = useState(MOCK_IMMIGRATION_CASES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToast } = useToast();

  const handleLookup = (e) => {
    e.preventDefault();
    const cleanQuery = receiptNumber.trim().toUpperCase();
    const found = MOCK_IMMIGRATION_CASES.find(c =>
      c.receiptNumber.replace(/[^A-Z0-9]/g, '') === cleanQuery.replace(/[^A-Z0-9]/g, '')
    );
    if (found) {
      setActiveTracking(found);
      addToast(`Receipt ${found.receiptNumber} loaded from immigration dockets.`, 'success');
    } else {
      addToast(`Receipt "${receiptNumber}" not found in current mock cases. Showing sample tracking.`, 'info');
      setActiveTracking({
        ...MOCK_IMMIGRATION_CASES[0],
        receiptNumber: cleanQuery || 'WAC-26-900-88123',
        title: 'Custom Inquired Petition',
        beneficiaryName: 'Foreign National Applicant',
        currentStage: 'Case Was Received and A Notice Was Sent',
      });
    }
  };

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('USCIS Case Status Online polling complete. Milestone up to date.', 'success');
    }, 800);
  };

  const milestones = [
    { id: 1, title: 'Case Received & Notice Issued', desc: 'Form I-797C Notice of Action dispatched to counsel.', date: activeTracking?.filingDate || '2025-09-02' },
    { id: 2, title: 'Biometrics Scheduled & Completed', desc: 'Code 3 biometrics taken at Salt Lake City Application Support Center.', date: '2025-10-15' },
    { id: 3, title: 'Request for Evidence (RFE) / Review', desc: 'Under active supervisory officer review.', date: 'Current Stage' },
    { id: 4, title: 'Final Adjudication & Card Production', desc: 'Notice of approval and legal permanent resident card issuance.', date: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[SIMULATED USCIS TRACKER]:</strong> 13-character USCIS receipt lookup. In production, this maps to the USCIS Case Status Online webhook bridge.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="USCIS 13-Character Receipt Tracker"
        subtitle="Live milestone progress tracker for LIN, WAC, EAC, SRC, and IOE service center filings."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Immigration', to: '/immigration/cases' },
          { label: 'Receipt Tracker' }
        ]}
      />

      {/* Search Bar Container */}
      <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm max-w-2xl">
        <form onSubmit={handleLookup} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="USCIS 13-Character Receipt Number"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. LIN-26-901-50234, SRC-26-902-88190"
              required
            />
          </div>
          <Button type="submit" variant="primary" icon={Search}>
            Track Receipt
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-[#667085] mr-1">Quick Case Select:</span>
          {MOCK_IMMIGRATION_CASES.slice(0, 5).map(c => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                setReceiptNumber(c.receiptNumber);
                setActiveTracking(c);
              }}
              className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors border ${
                activeTracking?.id === c.id
                  ? 'bg-[#06244B] text-white border-[#06244B]'
                  : 'bg-slate-100 text-[#06244B] border-slate-200 hover:bg-slate-200'
              }`}
            >
              {c.receiptNumber} ({c.beneficiaryName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Case Overview Card */}
      {activeTracking && (
        <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[#06244B]">
                  {activeTracking.receiptNumber}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-300">
                  Active in Processing Queue
                </span>
              </div>
              <span className="text-xs text-[#667085] block mt-0.5">
                Service Center: <strong>{activeTracking.serviceCenter}</strong>
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={handleSimulateRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Polling USCIS...' : 'Refresh Status'}
            </Button>
          </div>

          <div className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#667085] font-bold block uppercase text-[10px]">Beneficiary Foreign National:</span>
                <span className="font-bold text-sm text-[#06244B] block">{activeTracking.beneficiaryName}</span>
                <span className="text-[11px] text-[#667085]">A-Number: {activeTracking.alienNumber}</span>
              </div>
              <div>
                <span className="text-[#667085] font-bold block uppercase text-[10px]">Petitioner / Sponsor:</span>
                <span className="font-bold text-sm text-[#06244B] block">{activeTracking.petitionerName}</span>
                <span className="text-[11px] text-[#667085]">Category: {activeTracking.category}</span>
              </div>
              <div>
                <span className="text-[#667085] font-bold block uppercase text-[10px]">Responsible Firm Counsel:</span>
                <span className="font-bold text-sm text-[#06244B] block">{activeTracking.assignedAttorneyName}</span>
                <span className="text-[11px] text-[#667085]">Paralegal: {activeTracking.assignedParalegalName}</span>
              </div>
            </div>

            {/* 4-Stage Milestone Stepper */}
            <div>
              <span className="font-bold text-xs uppercase text-[#06244B] block mb-3">
                Adjudication Milestone Timeline:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {milestones.map((m, idx) => {
                  const isCurrent = idx === 1; // stage 2 active
                  const isDone = idx < 1;
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 relative ${
                        isCurrent
                          ? 'border-[#A4432B] bg-orange-50/40 shadow-sm ring-1 ring-[#A4432B]'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-[#D9D6CF] bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase text-[#667085]">
                          Milestone {m.id}
                        </span>
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-[#A4432B] animate-pulse" />
                        ) : null}
                      </div>
                      <div className="font-bold text-sm text-[#06244B]">{m.title}</div>
                      <div className="text-[11px] text-[#667085] leading-relaxed">{m.desc}</div>
                      <div className="text-[10px] font-semibold text-[#06244B] pt-1">{m.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

