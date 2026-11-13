import React, { useState } from 'react';
import {
  Home,
  AlertTriangle,
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  DollarSign,
  FileText,
  Key,
  ShieldCheck,
  Building
} from 'lucide-react';
import { MOCK_EVICTIONS_CASES } from '../../../../data/mockSpecialtyPractices';
import { useToast } from '../../../../components/ui/Toast';

export function EvictionsWorkspace() {
  const { addToast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState(MOCK_EVICTIONS_CASES[0].id);
  const [activeTab, setActiveTab] = useState('notices'); // notices, court, treble, sheriff

  const activeCase = MOCK_EVICTIONS_CASES.find(c => c.id === selectedCaseId) || MOCK_EVICTIONS_CASES[0];

  // Treble damages interactive state
  const [unlawfulDays, setUnlawfulDays] = useState(activeCase.trebleDamagesCalculator.unlawfulDetainerDays);
  const dailyRate = activeCase.trebleDamagesCalculator.dailyRentRate;
  const computedTrebledDamages = Math.round(unlawfulDays * dailyRate * 3);
  const totalJudgment = computedTrebledDamages + activeCase.delinquentRent + activeCase.lateFeesOwed + activeCase.trebleDamagesCalculator.statutoryAttorneyFees + activeCase.trebleDamagesCalculator.courtCosts;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#06244B] flex items-center justify-center text-white shadow-md">
              <Home className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#FEF6EE] text-[#B93815] border border-[#F9DBAF] whitespace-nowrap">
                  SECTION 24: EVICTIONS & UNLAWFUL DETAINER
                </span>
                <span className="text-xs font-mono text-[#667085] whitespace-nowrap">{activeCase.caseNumber}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#06244B] leading-tight">{activeCase.propertyAddress}</h1>
              <p className="text-xs text-[#475467] mt-0.5">{activeCase.representationRole} • Tenant: {activeCase.tenantNames}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                const nextCase = MOCK_EVICTIONS_CASES.find(c => c.id === e.target.value);
                if (nextCase) {
                  setUnlawfulDays(nextCase.trebleDamagesCalculator.unlawfulDetainerDays);
                }
              }}
              className="max-w-full sm:max-w-[260px] px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {MOCK_EVICTIONS_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.representationRole.split('(')[0]}</option>
              ))}
            </select>
            <button
              onClick={() => addToast('Exporting Utah Statutory 3-Day Notice & Proof of Service...', 'info')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Export 3-Day Notice
            </button>
          </div>
        </div>

        {/* Financial & Tenancy Overview */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Lease & Monthly Rent</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.leaseType}</p>
            <p className="text-[11px] text-[#475467] font-medium mt-1">Deposit: ${activeCase.securityDeposit.toLocaleString()} (in Trust)</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Delinquent Rent & Fees</p>
            <p className="text-xs font-bold text-rose-700 mt-0.5">${activeCase.totalClaimAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1">Late Fees: ${activeCase.lateFeesOwed.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Statutory Notice Status</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5 truncate">{activeCase.statutoryNotice.type.split('(')[0]}</p>
            <p className="text-[11px] text-[#A4432B] font-medium mt-1">{activeCase.statutoryNotice.cureStatus}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Sheriff Restitution Status</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5 truncate">{activeCase.courtAction.occupancyOutcome}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Lockout Complete / Stored</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-[#E4E7EC] gap-x-6 gap-y-2 text-sm font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'notices' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Utah Statutory Notice & Service
        </button>
        <button
          onClick={() => setActiveTab('court')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'court' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Unlawful Detainer Court Action
        </button>
        <button
          onClick={() => setActiveTab('treble')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'treble' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Treble Damages Calculator (§ 78B-6-811)
        </button>
        <button
          onClick={() => setActiveTab('sheriff')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'sheriff' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Sheriff Restitution & Storage
        </button>
      </div>

      {/* Tab 1: Notices */}
      {activeTab === 'notices' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Utah Statutory Pre-Lawsuit Notice Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC]">
              <span className="text-xs text-[#667085] uppercase font-semibold">Notice Type</span>
              <p className="text-sm font-bold text-[#101828] mt-1">{activeCase.statutoryNotice.type}</p>
            </div>
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC]">
              <span className="text-xs text-[#667085] uppercase font-semibold">Service Method</span>
              <p className="text-sm font-bold text-[#101828] mt-1">{activeCase.statutoryNotice.serviceMethod}</p>
            </div>
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC]">
              <span className="text-xs text-[#667085] uppercase font-semibold">Cure Deadline</span>
              <p className="text-sm font-bold text-rose-700 mt-1">{activeCase.statutoryNotice.cureDeadline}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Court Action */}
      {activeTab === 'court' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">Expedited Unlawful Detainer Proceedings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC] space-y-1">
              <span className="text-xs text-[#667085] font-semibold uppercase">Occupancy Hearing Scheduled</span>
              <p className="text-sm font-bold text-[#101828]">{activeCase.courtAction.occupancyHearingDate}</p>
            </div>
            <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC] space-y-1">
              <span className="text-xs text-[#667085] font-semibold uppercase">Court Restitution Order</span>
              <p className="text-sm font-bold text-emerald-700">{activeCase.courtAction.occupancyOutcome}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Treble Damages */}
      {activeTab === 'treble' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Statutory Treble Damages Calculator (Utah Code § 78B-6-811)</h2>
              <p className="text-xs text-[#667085]">Utah law mandates treble (3x) rent damages for every day the tenant remains in unlawful possession after notice expiration.</p>
            </div>
            <button
              onClick={() => addToast('Treble damages calculation verified and prepared for judgment entry', 'success')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Generate Judgment Worksheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl">
            <div>
              <label className="text-xs font-semibold text-[#344054]">Unlawful Detainer Days (After Notice Expiration)</label>
              <input
                type="number"
                value={unlawfulDays}
                onChange={(e) => setUnlawfulDays(parseInt(e.target.value) || 0)}
                className="w-full mt-1 p-2.5 border border-[#D0D5DD] rounded-lg text-sm font-mono font-bold text-[#101828]"
              />
              <span className="text-[11px] text-[#667085] mt-1 block">Daily Rate: ${dailyRate.toFixed(2)} / day</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#344054]">Statutory Multiplier</label>
              <input
                type="text"
                disabled
                value="3x (Mandatory per Utah Code § 78B-6-811)"
                className="w-full mt-1 p-2.5 border border-[#D0D5DD] rounded-lg text-sm font-mono bg-slate-100 text-[#475467]"
              />
              <span className="text-[11px] text-[#667085] mt-1 block">Non-discretionary under Utah law</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#344054]">Trebled Unlawful Rent Amount</label>
              <div className="w-full mt-1 p-2.5 border border-emerald-300 rounded-lg text-sm font-mono font-bold text-emerald-800 bg-emerald-50">
                ${computedTrebledDamages.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">{unlawfulDays} days × ${dailyRate.toFixed(2)} × 3</span>
            </div>
          </div>

          <div className="p-5 bg-[#06244B] text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-300 font-mono">Total Civil Judgment Projected</span>
              <p className="text-2xl font-bold font-serif mt-1">${totalJudgment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-slate-300 mt-0.5">Includes delinquent rent (${activeCase.delinquentRent}), trebled damages (${computedTrebledDamages}), statutory attorney fees (${activeCase.trebleDamagesCalculator.statutoryAttorneyFees}), & court filing fees.</p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400 font-mono">
              Ready for Clerk Entry
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Sheriff */}
      {activeTab === 'sheriff' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#06244B]">County Sheriff Restitution & Personal Property Storage</h2>
          <div className="p-4 border border-[#EAECF0] rounded-xl bg-[#F8F9FC] space-y-2">
            <span className="text-xs font-bold text-[#06244B] uppercase">Utah Code § 78B-6-816 Storage Protocol</span>
            <p className="text-xs text-[#475467] leading-relaxed">
              {activeCase.sheriffEnforcement.propertyStorageStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

