import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  FileCheck,
  Send,
  Building2
} from 'lucide-react';
import { MOCK_APPEALS_CASES } from '../../../../data/mockSpecialtyPractices';
import { useToast } from '../../../../components/ui/Toast';

export function AppealsWorkspace() {
  const { addToast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState(MOCK_APPEALS_CASES[0].id);
  const [activeTab, setActiveTab] = useState('briefing'); // briefing, record, issues, mandate

  const activeCase = MOCK_APPEALS_CASES.find(c => c.id === selectedCaseId) || MOCK_APPEALS_CASES[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#06244B] flex items-center justify-center text-white shadow-md">
              <Scale className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] whitespace-nowrap">
                  SECTION 23: APPELLATE PRACTICE
                </span>
                <span className="text-xs font-mono text-[#667085] whitespace-nowrap">{activeCase.appellateCaseNumber}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#06244B] leading-tight">{activeCase.caseTitle}</h1>
              <p className="text-xs text-[#475467] mt-0.5">{activeCase.court} • Lower Court: {activeCase.lowerCourt} (Docket #{activeCase.lowerCourtNumber})</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="max-w-full sm:max-w-[260px] px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {MOCK_APPEALS_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.appellateCaseNumber} - {c.court}</option>
              ))}
            </select>
            <button
              onClick={() => addToast('Exporting Utah R. App. P. 24 Compliance Certificate...', 'info')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Export Brief Certificate
            </button>
          </div>
        </div>

        {/* Appellate Jurisdictional Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Party Role & Appeal Type</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.partyRole}</p>
            <p className="text-[11px] text-[#A4432B] font-medium mt-1 truncate">{activeCase.appealType}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Notice of Appeal (30-Day Rule)</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">Jurisdiction Established</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1 truncate">{activeCase.jurisdictionalNoticeDate}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Governing Standard of Review</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.standardOfReview}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1">Questions of Law / Interpretation</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Oral Argument / Mandate</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.mandateStatus}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Hearing: Dec 12, 2024</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-[#E4E7EC] gap-x-6 gap-y-2 text-sm font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'briefing' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Appellate Briefing Schedule & Word Counts ({activeCase.briefingSchedule.length})
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'record' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Record on Appeal & Transcripts
        </button>
        <button
          onClick={() => setActiveTab('mandate')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'mandate' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Remittitur & Remand Directives
        </button>
      </div>

      {/* Tab 1: Briefing Schedule */}
      {activeTab === 'briefing' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Utah R. App. P. 24 Briefing Ledger</h2>
              <p className="text-xs text-[#667085]">Mandatory word count limits: 14,000 words for Principal Briefs; 7,000 words for Reply Briefs.</p>
            </div>
            <button
              onClick={() => addToast('Brief word count certificate verified against Word Document', 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <FileCheck className="w-4 h-4 text-[#A4432B]" />
              Verify Word Count Limits
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Brief Phase</th>
                  <th className="py-3 px-4">URAP Word Limit</th>
                  <th className="py-3 px-4">Court Due Date</th>
                  <th className="py-3 px-4">Filing Status</th>
                  <th className="py-3 px-4 text-right">Appellate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.briefingSchedule.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-[#101828]">{b.phase}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#475467]">{b.wordLimit}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#667085]">{b.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.status.includes('Filed') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => addToast(`Opening PDF viewer for ${b.phase}`, 'info')}
                        className="text-[11px] text-[#06244B] hover:text-[#A4432B] font-semibold underline cursor-pointer"
                      >
                        Inspect Brief
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Record Completeness */}
      {activeTab === 'record' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Utah R. App. P. 11 Record on Appeal Certification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC] space-y-2">
              <span className="text-xs font-bold text-[#06244B] uppercase">Trial Court Transcript Designation</span>
              <p className="text-xs text-[#475467] leading-relaxed">{activeCase.recordCompleteness.transcriptsDelivered}</p>
            </div>
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC] space-y-2">
              <span className="text-xs font-bold text-[#06244B] uppercase">Master Certified Record Status</span>
              <p className="text-xs text-[#475467] leading-relaxed">{activeCase.recordCompleteness.recordMasterStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mandate */}
      {activeTab === 'mandate' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Appellate Disposition & Remittitur Protocol</h2>
          <p className="text-xs text-[#667085]">
            Pursuant to Utah R. App. P. 36, remittitur issues 15 days after expiration of rehearing petition period, returning jurisdiction to the District Court.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>Current Status:</strong> {activeCase.mandateStatus}
          </div>
        </div>
      )}
    </div>
  );
}

