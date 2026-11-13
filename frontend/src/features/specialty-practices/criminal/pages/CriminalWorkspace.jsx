import React, { useState } from 'react';
import {
  Shield,
  AlertOctagon,
  FileText,
  Video,
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Flame,
  Radio,
  FileCheck
} from 'lucide-react';
import { MOCK_CRIMINAL_CASES } from '../../../../data/mockSpecialtyPractices';
import { useToast } from '../../../../components/ui/Toast';

export function CriminalWorkspace() {
  const { addToast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState(MOCK_CRIMINAL_CASES[0].id);
  const [activeTab, setActiveTab] = useState('charges'); // charges, discovery, plea, expungement

  const activeCase = MOCK_CRIMINAL_CASES.find(c => c.id === selectedCaseId) || MOCK_CRIMINAL_CASES[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#06244B] flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] whitespace-nowrap">
                  SECTION 22: CRIMINAL DEFENSE
                </span>
                <span className="text-xs font-mono text-[#667085] whitespace-nowrap">{activeCase.caseNumber}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#06244B] leading-tight">State of Utah v. {activeCase.defendant}</h1>
              <p className="text-xs text-[#475467] mt-0.5">{activeCase.court} • {activeCase.judge} • Pros: {activeCase.prosecutor}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="max-w-full sm:max-w-[260px] px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {MOCK_CRIMINAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.defendant}</option>
              ))}
            </select>
            <button
              onClick={() => addToast('Exporting Utah Rule 16 Criminal Discovery Demand & Brady Motion...', 'info')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Export Rule 16 Demand
            </button>
          </div>
        </div>

        {/* Pretrial Custody & Conditions Banner */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Custody & Bail Status</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.custodyStatus}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Bond Active & Verified</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Pretrial Release Conditions</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5 truncate">{activeCase.releaseConditions}</p>
            <p className="text-[11px] text-[#A4432B] font-medium mt-1">GPS Monitor & UA Testing</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Active Charges / Counts</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.counts.length} Charged Counts</p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">Lead: {activeCase.counts[0]?.degree || 'None'}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Pending State Plea Offer</p>
            <p className="text-xs font-bold text-amber-700 mt-0.5">Expires: {activeCase.pleaOffer.expirationDate}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1">Action: Client Review Pending</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-[#E4E7EC] gap-x-6 gap-y-2 text-sm font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('charges')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'charges' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Charges & Penalties Matrix ({activeCase.counts.length})
        </button>
        <button
          onClick={() => setActiveTab('discovery')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'discovery' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Utah Rule 16 Discovery & Evidence ({activeCase.rule16Discovery.length})
        </button>
        <button
          onClick={() => setActiveTab('plea')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'plea' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Plea Offer & Mitigation Strategy
        </button>
        <button
          onClick={() => setActiveTab('expungement')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'expungement' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Expungement / Clean Slate Calculator
        </button>
      </div>

      {/* Tab 1: Charges & Penalties Matrix */}
      {activeTab === 'charges' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">State Information / Indictment Counts</h2>
              <p className="text-xs text-[#667085]">Statutory classification under Title 76 of the Utah Code Annotated.</p>
            </div>
            <button
              onClick={() => addToast('Added count to criminal indictment matrix', 'info')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A4432B]" />
              Add Indictment Count
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Count #</th>
                  <th className="py-3 px-4">Statutory Charge & Citation</th>
                  <th className="py-3 px-4">Classification & Degree</th>
                  <th className="py-3 px-4">Statutory Maximum / Mandatory Minimum</th>
                  <th className="py-3 px-4">Plea Negotiation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.counts.map((c) => (
                  <tr key={c.countNo} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#101828]">Count {c.countNo}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#101828]">{c.charge}</p>
                      <p className="font-mono text-[11px] text-[#667085]">{c.statute}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.degree.includes('Felony') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.degree}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#475467]">{c.penalty}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Discovery */}
      {activeTab === 'discovery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Utah Rule 16 Mandatory Criminal Discovery Log</h2>
              <p className="text-xs text-[#667085]">Tracking Axon bodycam videos, police narratives, crime lab tests, and Brady exculpatory material.</p>
            </div>
            <button
              onClick={() => addToast('Filed formal Motion to Compel Brady/Giglio Material with District Court', 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              File Motion to Compel
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Evidence Item</th>
                  <th className="py-3 px-4">Evidence Category</th>
                  <th className="py-3 px-4">Production Date</th>
                  <th className="py-3 px-4">Chain of Custody / Status</th>
                  <th className="py-3 px-4 text-right">Defense Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.rule16Discovery.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-[#101828] flex items-center gap-2">
                      {item.type.includes('Video') ? <Video className="w-4 h-4 text-[#A4432B]" /> : <FileText className="w-4 h-4 text-blue-600" />}
                      <span>{item.item}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#475467]">{item.type}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#667085]">{item.dateReceived}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status.includes('Received') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => addToast(`Opening secure evidence preview: ${item.item}`, 'info')}
                        className="text-[11px] text-[#06244B] hover:text-[#A4432B] font-semibold underline cursor-pointer"
                      >
                        Inspect Vault Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Plea Offer */}
      {activeTab === 'plea' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">State's Formal Plea Bargain Offer</h2>
              <p className="text-xs text-[#667085]">Plea deadline tracked with client mitigation brief.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-full">
              ⏳ Deadline: {activeCase.pleaOffer.expirationDate}
            </span>
          </div>

          <div className="p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase text-[#667085]">Offer Summary:</span>
            <p className="text-sm font-semibold text-[#101828] leading-relaxed">
              {activeCase.pleaOffer.offerSummary}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase text-emerald-800">Defense Mitigation Package:</span>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {activeCase.pleaOffer.mitigationPrepared}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAECF0]">
            <div>
              <p className="text-xs font-bold text-[#101828]">Client Recommendation:</p>
              <p className="text-xs text-[#667085]">{activeCase.pleaOffer.clientPosition}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addToast('Formal counter-offer draft prepared', 'info')}
                className="px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50"
              >
                Draft Counter-Offer
              </button>
              <button
                onClick={() => addToast('Plea Affidavit Form (Rule 11) generated for signature', 'success')}
                className="px-4 py-2 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366]"
              >
                Prepare Rule 11 Plea Affidavit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expungement */}
      {activeTab === 'expungement' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Utah Clean Slate Act & Expungement Calculator</h2>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <FileCheck className="w-5 h-5 text-purple-700" />
              <span>Statutory Eligibility Forecast (Utah Code § 77-40a)</span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              {activeCase.expungementEligibility}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

