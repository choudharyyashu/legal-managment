import React, { useState } from 'react';
import { Calculator, DollarSign, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function Chapter13PlanCalculator() {
  const [planMonths, setPlanMonths] = useState(60);
  const [priorityTaxDebt, setPriorityTaxDebt] = useState(8400);
  const [mortgageArrearsCure, setMortgageArrearsCure] = useState(18000);
  const [attorneyFeeBalance, setAttorneyFeeBalance] = useState(3500);
  const [totalGeneralUnsecuredDebt, setTotalGeneralUnsecuredDebt] = useState(75000);
  const [proposedUnsecuredDividendPct, setProposedUnsecuredDividendPct] = useState(20);
  const { addToast } = useToast();

  // Calculations
  const unsecuredPayout = (totalGeneralUnsecuredDebt * (proposedUnsecuredDividendPct / 100));
  const subtotalClaims = priorityTaxDebt + mortgageArrearsCure + attorneyFeeBalance + unsecuredPayout;
  const trusteeFeeRate = 0.10; // 10% statutory Chapter 13 Standing Trustee fee
  const totalPlanFunding = subtotalClaims / (1 - trusteeFeeRate);
  const trusteeFeeAmount = totalPlanFunding * trusteeFeeRate;
  const monthlyPlanPayment = Math.round(totalPlanFunding / planMonths);

  const handleSimulatePlan = (e) => {
    e.preventDefault();
    addToast(
      `Chapter 13 Plan calculated: $${monthlyPlanPayment.toLocaleString()}/month for ${planMonths} months (${proposedUnsecuredDividendPct}% dividend to unsecured creditors).`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Chapter 13 Repayment Plan Calculator:</strong> Calculates required monthly plan payments to the Chapter 13 Standing Trustee (including 10% statutory fee and priority amortizations).
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Chapter 13 Debt Adjustment Plan Calculator"
        subtitle="36-to-60 month debt adjustment model conforming to District of Utah Standing Trustee requirements."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Bankruptcy', to: '/bankruptcy/cases' },
          { label: 'Chapter 13 Plan' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Form */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2">
            Plan Variables &amp; Claims Amortization
          </h3>

          <form onSubmit={handleSimulatePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Applicable Commitment Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanMonths(36)}
                  className={`py-2 px-3 rounded text-xs font-bold border ${
                    planMonths === 36
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-[#667085] border-[#D9D6CF]'
                  }`}
                >
                  36 Months (Below Median)
                </button>
                <button
                  type="button"
                  onClick={() => setPlanMonths(60)}
                  className={`py-2 px-3 rounded text-xs font-bold border ${
                    planMonths === 60
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-[#667085] border-[#D9D6CF]'
                  }`}
                >
                  60 Months (Above Median)
                </button>
              </div>
            </div>

            <div>
              <Input
                label="Priority Tax Claims (100% Repaid)"
                type="number"
                value={priorityTaxDebt}
                onChange={(e) => setPriorityTaxDebt(Number(e.target.value))}
                placeholder="IRS / State Tax Deficiency"
                required
              />
            </div>

            <div>
              <Input
                label="Mortgage / Secured Collateral Arrears Cure"
                type="number"
                value={mortgageArrearsCure}
                onChange={(e) => setMortgageArrearsCure(Number(e.target.value))}
                placeholder="Past due home loan balance to cure"
                required
              />
            </div>

            <div>
              <Input
                label="Administrative Attorney Fee Balance"
                type="number"
                value={attorneyFeeBalance}
                onChange={(e) => setAttorneyFeeBalance(Number(e.target.value))}
                placeholder="Balance paid through plan"
                required
              />
            </div>

            <div>
              <Input
                label="Total Non-Priority General Unsecured Debt"
                type="number"
                value={totalGeneralUnsecuredDebt}
                onChange={(e) => setTotalGeneralUnsecuredDebt(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Proposed Unsecured Dividend: {proposedUnsecuredDividendPct}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={proposedUnsecuredDividendPct}
                onChange={(e) => setProposedUnsecuredDividendPct(Number(e.target.value))}
                className="w-full accent-[#A4432B]"
              />
              <div className="flex justify-between text-[10px] text-[#667085]">
                <span>0% (Pro-Rata Base)</span>
                <span>50%</span>
                <span>100% (Full Payoff)</span>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" icon={Calculator} className="w-full">
              Recalculate Plan
            </Button>
          </form>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-5">
            <div className="border-b border-[#D9D6CF] pb-3">
              <span className="text-[10px] text-[#667085] uppercase font-bold">Recommended Plan Formulation:</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-[#06244B]">
                  Required Monthly Plan Payment: ${monthlyPlanPayment.toLocaleString()} / mo
                </h2>
              </div>
              <span className="text-xs text-[#667085] block mt-1">
                Total Plan Term: <strong>{planMonths} months</strong> | Total Plan Funding: <strong>${Math.round(totalPlanFunding).toLocaleString()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Priority &amp; Arrears:</span>
                <span className="text-base font-bold text-[#06244B] mt-1 block">
                  ${(priorityTaxDebt + mortgageArrearsCure).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#667085]">Paid at 100% statutory requirement</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Standing Trustee Fee (10%):</span>
                <span className="text-base font-bold text-[#A4432B] mt-1 block">
                  ${Math.round(trusteeFeeAmount).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#667085]">Lon A. Jenkins, Trustee</span>
              </div>
              <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Unsecured Dividend ({proposedUnsecuredDividendPct}%):</span>
                <span className="text-base font-bold text-emerald-700 mt-1 block">
                  ${Math.round(unsecuredPayout).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#667085]">Discharged balance: ${(totalGeneralUnsecuredDebt - unsecuredPayout).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] text-xs leading-relaxed space-y-2">
              <div className="font-bold text-[#06244B] uppercase text-[10px]">
                Chapter 13 Standing Trustee Payment Schedule Summary:
              </div>
              <p className="text-[#202A35]">
                Under the proposed plan, the debtor tenders <strong>${monthlyPlanPayment.toLocaleString()} per month</strong> to the Chapter 13 Standing Trustee for <strong>{planMonths} consecutive months</strong>. In exchange, residential foreclosure proceedings remain stayed, priority tax liabilities are extinguished without penalty, and the balance of credit card debts will be discharged upon completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

