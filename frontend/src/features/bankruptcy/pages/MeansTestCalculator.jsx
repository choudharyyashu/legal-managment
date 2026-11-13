import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, Scale, DollarSign, Info } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { evaluateMeansTest, UTAH_MEDIAN_FAMILY_INCOME } from '../../../data/mockUtahMedianIncome';
import { useToast } from '../../../components/ui/Toast';

export function MeansTestCalculator() {
  const [householdSize, setHouseholdSize] = useState(4);
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(8500);
  const { addToast } = useToast();

  const result = evaluateMeansTest(Number(householdSize), Number(grossMonthlyIncome));

  const handleSimulateCalculation = (e) => {
    e.preventDefault();
    addToast(
      result.isBelowMedian
        ? 'Debtor passes the Utah Median Test! Chapter 7 presumption of abuse does not arise.'
        : 'Debtor is Above Utah Median. Form 122A-2 disposable income calculations required.',
      result.isBelowMedian ? 'success' : 'warning'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Form 122 Means-Test Calculator:</strong> Benchmarked against official Census Bureau median income tables for Utah households. Chapter 7 eligibility &amp; Chapter 13 commitment periods.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Form 122 Bankruptcy Means-Test Calculator"
        subtitle="11 U.S.C. § 707(b) median family income benchmark test for District of Utah debtor filings."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Bankruptcy', to: '/bankruptcy/cases' },
          { label: 'Means-Test Calculator' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#A4432B]" />
            Debtor Financial Inputs
          </h3>

          <form onSubmit={handleSimulateCalculation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Household Size (Debtor + Dependents)
              </label>
              <select
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B] bg-slate-50 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>
                    {s} {s === 1 ? 'Person (Single Debtor)' : 'Persons Household'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Gross Current Monthly Income (CMI)"
                type="number"
                value={grossMonthlyIncome}
                onChange={(e) => setGrossMonthlyIncome(Number(e.target.value))}
                placeholder="6-Month historical average"
                required
              />
              <span className="text-[10px] text-[#667085] mt-1 block">
                Includes wages, gross business income, pensions, and spouse contributions.
              </span>
            </div>

            <Button type="submit" variant="primary" size="md" icon={Calculator} className="w-full">
              Calculate Means-Test
            </Button>
          </form>

          {/* Reference Table */}
          <div className="pt-3 border-t border-[#D9D6CF] text-xs space-y-1.5 text-[#667085]">
            <span className="font-bold text-[#06244B] uppercase text-[10px] block">
              Current Utah Median Benchmarks:
            </span>
            <div className="space-y-1 text-[11px]">
              <div>1 Person: $72,140/yr</div>
              <div>2 Persons: $91,220/yr</div>
              <div>3 Persons: $101,850/yr</div>
              <div>4 Persons: $112,450/yr</div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
              <div>
                <span className="text-[10px] text-[#667085] uppercase font-bold">Calculation Result:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {result.isBelowMedian ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <h2 className="text-lg font-bold text-[#06244B]">
                    {result.isBelowMedian ? 'Below Utah Median Family Income' : 'Above Utah Median Family Income'}
                  </h2>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.isBelowMedian
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {result.isBelowMedian ? 'Chapter 7 Eligible ✓' : 'Presumption of Abuse Test Required ⚠️'}
              </span>
            </div>

            {/* Income Comparison Meters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">
                  Debtor Annualized Income (CMI × 12):
                </span>
                <span className="text-2xl font-bold text-[#06244B]">
                  ${result.annualizedIncome.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#667085] block">
                  (${result.grossMonthlyIncome.toLocaleString()} per month)
                </span>
              </div>

              <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] space-y-1">
                <span className="text-[10px] text-[#667085] uppercase font-bold block">
                  Utah Median Threshold (Family of {result.householdSize}):
                </span>
                <span className="text-2xl font-bold text-[#A4432B]">
                  ${result.medianAnnualThreshold.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#667085] block">
                  (${Math.round(result.medianMonthlyThreshold).toLocaleString()} per month)
                </span>
              </div>
            </div>

            {/* Legal Analysis Callout */}
            <div
              className={`p-4 rounded-lg border text-xs leading-relaxed space-y-2 ${
                result.isBelowMedian
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/60 border-amber-200 text-amber-950'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Statutory Legal Analysis:
              </div>
              <p>
                {result.isBelowMedian ? (
                  <>
                    Because the debtor's annualized current monthly income of <strong>${result.annualizedIncome.toLocaleString()}</strong> is less than or equal to the applicable Utah median family income of <strong>${result.medianAnnualThreshold.toLocaleString()}</strong>, the debtor passes the Form 122A-1 preliminary test. <strong>No presumption of abuse arises under 11 U.S.C. § 707(b)(2).</strong> The debtor is eligible for Chapter 7 discharge without completing Form 122A-2 expense deductions.
                  </>
                ) : (
                  <>
                    The debtor's annualized income of <strong>${result.annualizedIncome.toLocaleString()}</strong> exceeds the Utah median family income of <strong>${result.medianAnnualThreshold.toLocaleString()}</strong>. The debtor must complete Form 122A-2 to determine whether disposable income exceeds IRS National and Local Standards. If filing Chapter 13, the applicable commitment period is <strong>60 months</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

