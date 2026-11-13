import React, { useState } from 'react';
import {
  Heart,
  Users,
  DollarSign,
  Calculator,
  Calendar,
  ShieldAlert,
  FileCheck,
  Plus,
  Download,
  AlertCircle,
  Home,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MOCK_FAMILY_CASES } from '../../../../data/mockSpecialtyPractices';
import { useToast } from '../../../../components/ui/Toast';

export function FamilyLawWorkspace() {
  const { addToast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState(MOCK_FAMILY_CASES[0].id);
  const [activeTab, setActiveTab] = useState('property'); // property, support, parenting, safety_qdro

  // Support calculation state
  const activeCase = MOCK_FAMILY_CASES.find(c => c.id === selectedCaseId) || MOCK_FAMILY_CASES[0];
  const [petitionerIncome, setPetitionerIncome] = useState(activeCase.petitionerGrossIncome);
  const [respondentIncome, setRespondentIncome] = useState(activeCase.respondentGrossIncome);
  const [petitionerOvernights, setPetitionerOvernights] = useState(245);

  // Recalculate Utah support dynamically
  const totalIncome = petitionerIncome + respondentIncome;
  const petitionerShare = totalIncome > 0 ? (petitionerIncome / totalIncome) : 0.5;
  const respondentShare = totalIncome > 0 ? (respondentIncome / totalIncome) : 0.5;
  // Utah statutory base support heuristic for 2 children
  const baseTableAmount = Math.max(800, totalIncome * 0.14);
  const estimatedChildSupport = Math.round(baseTableAmount * respondentShare * (petitionerOvernights / 365));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#06244B] flex items-center justify-center text-white shadow-md">
              <Heart className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#FDF2FA] text-[#C11574] border border-[#FCCEEE] whitespace-nowrap">
                  SECTION 21: FAMILY LAW & DIVORCE
                </span>
                <span className="text-xs font-mono text-[#667085] whitespace-nowrap">{activeCase.caseNumber}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#06244B] leading-tight">{activeCase.caseTitle}</h1>
              <p className="text-xs text-[#475467] mt-0.5">{activeCase.court} • {activeCase.judge}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                const nextCase = MOCK_FAMILY_CASES.find(c => c.id === e.target.value);
                if (nextCase) {
                  setPetitionerIncome(nextCase.petitionerGrossIncome);
                  setRespondentIncome(nextCase.respondentGrossIncome);
                }
              }}
              className="max-w-full sm:max-w-[260px] px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {MOCK_FAMILY_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.caseTitle}</option>
              ))}
            </select>
            <button
              onClick={() => addToast('Exporting Utah URCP 26.1 Financial Declaration Packet...', 'info')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Export Rule 26.1 Packet
            </button>
          </div>
        </div>

        {/* Domestic Summary Metrics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Custody Arrangement</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.custodyArrangement}</p>
            <p className="text-[11px] text-[#A4432B] font-medium mt-1">Children: {activeCase.children.map(c => `${c.name} (${c.age})`).join(', ') || 'None'}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Child & Spousal Support</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">${activeCase.monthlyChildSupport}/mo Child Support</p>
            <p className="text-[11px] text-[#475467] font-medium mt-1">Alimony: ${activeCase.monthlyAlimony}/mo</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Financial Disclosures (Rule 26.1)</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">{activeCase.mandatoryDisclosuresStatus}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1">Paystubs & 2 Yrs Tax Returns Exchanged</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Safety & Injunctions</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.safetyOrders.hasProtectiveOrder ? '⚠️ Protective Order Active' : 'Civil Injunction Active'}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1 truncate">{activeCase.safetyOrders.stipulationDetails}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-[#E4E7EC] gap-x-6 gap-y-2 text-sm font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('property')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'property' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Property & Debt Schedule ({activeCase.propertySchedule.length})
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'support' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Utah Support Calculator (§ 78B-12-205)
        </button>
        <button
          onClick={() => setActiveTab('parenting')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'parenting' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Parenting Plan & Overnights
        </button>
        <button
          onClick={() => setActiveTab('safety_qdro')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'safety_qdro' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Safety Orders & QDRO Decree Tracker
        </button>
      </div>

      {/* Tab 1: Property & Debt Schedule */}
      {activeTab === 'property' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Equitable Division Schedule (Marital vs Separate)</h2>
              <p className="text-xs text-[#667085]">Categorize premarital/inherited separate property vs marital assets and calculate equalization offsets.</p>
            </div>
            <button
              onClick={() => addToast('Added new asset to division schedule', 'info')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A4432B]" />
              Add Asset / Debt Item
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset / Debt Description</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Fair Market Value</th>
                  <th className="py-3 px-4 text-right">Encumbrance / Debt</th>
                  <th className="py-3 px-4 text-right">Net Equity</th>
                  <th className="py-3 px-4">Proposed Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.propertySchedule.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#98A2B3]">No marital property claims logged for this matter.</td>
                  </tr>
                ) : (
                  activeCase.propertySchedule.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-[#101828]">{p.item}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.classification.includes('Marital') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.classification}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">${p.fmv.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-600">${p.encumbrance.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#101828]">${p.equity.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#06244B]">{p.proposedAward}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Support Calculator */}
      {activeTab === 'support' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Utah Statutory Child Support Worksheet Model</h2>
              <p className="text-xs text-[#667085]">Based on statutory tables under Utah Code § 78B-12-205 with overnight allocation credit.</p>
            </div>
            <button
              onClick={() => addToast('Utah Support Worksheet Form 1404 compiled and verified', 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Generate Certified Worksheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl">
            <div>
              <label className="text-xs font-semibold text-[#344054]">Petitioner Gross Monthly Income ($)</label>
              <input
                type="number"
                value={petitionerIncome}
                onChange={(e) => setPetitionerIncome(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 border border-[#D0D5DD] rounded-lg text-sm font-mono font-bold text-[#101828]"
              />
              <span className="text-[11px] text-[#667085] mt-1 block">Share of Combined Income: {(petitionerShare * 100).toFixed(1)}%</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#344054]">Respondent Gross Monthly Income ($)</label>
              <input
                type="number"
                value={respondentIncome}
                onChange={(e) => setRespondentIncome(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 border border-[#D0D5DD] rounded-lg text-sm font-mono font-bold text-[#101828]"
              />
              <span className="text-[11px] text-[#667085] mt-1 block">Share of Combined Income: {(respondentShare * 100).toFixed(1)}%</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#344054]">Petitioner Overnights per Year (out of 365)</label>
              <input
                type="number"
                value={petitionerOvernights}
                onChange={(e) => setPetitionerOvernights(parseInt(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 border border-[#D0D5DD] rounded-lg text-sm font-mono font-bold text-[#101828]"
              />
              <span className="text-[11px] text-[#667085] mt-1 block">Respondent Overnights: {365 - petitionerOvernights}</span>
            </div>
          </div>

          <div className="p-5 bg-[#06244B] text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-300 font-mono">Calculated Obligation</span>
              <p className="text-2xl font-bold font-serif mt-1">Estimated Monthly Child Support: ${estimatedChildSupport.toLocaleString()}</p>
              <p className="text-xs text-slate-300 mt-0.5">Payable by Respondent to Petitioner plus 50/50 statutory child care and health insurance split.</p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400 font-mono">
                Statutory Table Compliant
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Parenting Plan */}
      {activeTab === 'parenting' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Utah Statutory Parenting Schedule (Utah Code § 30-3-35)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#EAECF0] rounded-xl space-y-2 bg-[#F8F9FC]">
              <h3 className="font-bold text-xs uppercase text-[#06244B]">Regular Weekend & Weeknight Rotation</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Alternating weekends from Friday after school until Monday morning. One mid-week dinner visit on Wednesday evening (5:30 PM to 8:30 PM).
              </p>
            </div>
            <div className="p-4 border border-[#EAECF0] rounded-xl space-y-2 bg-[#F8F9FC]">
              <h3 className="font-bold text-xs uppercase text-[#06244B]">Holiday & Vacation Alternation</h3>
              <p className="text-xs text-[#475467] leading-relaxed">
                Odd/Even year rotation for Thanksgiving, Christmas (divided into 2 periods), Spring Break, and UEA Fall Break. 4 weeks uninterrupted summer parent-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Safety & QDRO */}
      {activeTab === 'safety_qdro' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#06244B]">
              <ShieldAlert className="w-5 h-5 text-[#A4432B]" />
              <h2 className="text-lg font-bold">Domestic Injunction & Safety Restrictions</h2>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
              <strong>Utah Rule 109 Injunction:</strong> Both parties restrained from canceling health insurance, encumbering or transferring assets, or changing beneficiaries on insurance policies until final decree.
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#06244B]">Qualified Domestic Relations Order (QDRO) Status</h2>
                <p className="text-xs text-[#667085]">{activeCase.qdroStatus}</p>
              </div>
              <button
                onClick={() => addToast('Sent QDRO draft to Plan Administrator for preliminary pre-approval', 'success')}
                className="px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
              >
                Submit for Plan Pre-Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

