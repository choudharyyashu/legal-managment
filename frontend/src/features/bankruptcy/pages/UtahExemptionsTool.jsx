import React, { useState } from 'react';
import { Landmark, ShieldCheck, AlertTriangle, Calculator, DollarSign, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { UTAH_EXEMPTION_RULES, calculateExemptionEquity } from '../../../data/mockUtahExemptions';
import { useToast } from '../../../components/ui/Toast';

export function UtahExemptionsTool() {
  const [fairMarketValue, setFairMarketValue] = useState(380000);
  const [securedLiens, setSecuredLiens] = useState(340000);
  const [exemptionCategory, setExemptionCategory] = useState('homestead');
  const [isJointDebtor, setIsJointDebtor] = useState(false);
  const { addToast } = useToast();

  const result = calculateExemptionEquity({
    fairMarketValue,
    securedLiens,
    exemptionCategory,
    isJointDebtor,
  });

  const handleSimulateAssessment = (e) => {
    e.preventDefault();
    addToast(
      result.isFullyProtected
        ? 'Asset equity is 100% exempt and protected from Chapter 7 liquidation!'
        : `Exposed unexempt equity calculated: $${result.unexemptExposedEquity.toLocaleString()}. Trustee may seek turnover or buyout.`,
      result.isFullyProtected ? 'success' : 'warning'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Utah Statutory Exemptions Tool:</strong> Evaluates asset protection under Utah Code § 78B-5-501 et seq. (Homestead $43,300 single / $86,600 joint, Motor Vehicle $3,000, Retirement 100%).
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Utah Statutory Bankruptcy Exemptions Tool"
        subtitle="Calculates debtor equity protections and potential Chapter 7 trustee liquidation exposure under Utah law."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Bankruptcy', to: '/bankruptcy/cases' },
          { label: 'Utah Exemptions Tool' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Form */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2">
            Asset Equity Assessment
          </h3>

          <form onSubmit={handleSimulateAssessment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Exemption Category
              </label>
              <select
                value={exemptionCategory}
                onChange={(e) => setExemptionCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-slate-50 font-medium"
              >
                {UTAH_EXEMPTION_RULES.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Asset Fair Market Value (FMV)"
                type="number"
                value={fairMarketValue}
                onChange={(e) => setFairMarketValue(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Input
                label="Total Secured Liens / Mortgages / Auto Loans"
                type="number"
                value={securedLiens}
                onChange={(e) => setSecuredLiens(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
              <input
                type="checkbox"
                id="jointDebtorCheck"
                checked={isJointDebtor}
                onChange={(e) => setIsJointDebtor(e.target.checked)}
                className="w-4 h-4 text-[#A4432B] rounded focus:ring-[#A4432B]"
              />
              <label htmlFor="jointDebtorCheck" className="text-xs font-bold text-[#06244B] cursor-pointer">
                Joint Debtor Spouses (Doubles Exemption Cap)
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" icon={Calculator} className="w-full">
              Assess Equity Exposure
            </Button>
          </form>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
              <div>
                <span className="text-[10px] text-[#667085] uppercase font-bold">Statutory Protection Status:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {result.isFullyProtected ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <h2 className="text-lg font-bold text-[#06244B]">
                    {result.isFullyProtected ? 'Asset Equity Fully Protected' : 'Exposed Non-Exempt Equity Identified'}
                  </h2>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.isFullyProtected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {result.isFullyProtected ? '100% Exempt ✓' : 'Trustee Exposure Risk ⚠️'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Asset FMV:</span>
                <span className="text-base font-bold text-[#06244B] mt-1 block">${result.fairMarketValue.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Secured Liens:</span>
                <span className="text-base font-bold text-red-700 mt-1 block">-${result.securedLiens.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Gross Equity:</span>
                <span className="text-base font-bold text-[#06244B] mt-1 block">${result.rawEquity.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Applied Exemption:</span>
                <span className="text-base font-bold text-emerald-700 mt-1 block">${result.appliedExemption.toLocaleString()}</span>
              </div>
            </div>

            {/* Final Exposure Calculation */}
            <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs uppercase text-[#06244B] block">
                  Net Non-Exempt Equity Exposed to Chapter 7 Trustee:
                </span>
                <span className="text-[11px] text-[#667085]">
                  Statutory Citation: {result.statute}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${result.isFullyProtected ? 'text-emerald-700' : 'text-red-700'}`}>
                  ${result.unexemptExposedEquity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

