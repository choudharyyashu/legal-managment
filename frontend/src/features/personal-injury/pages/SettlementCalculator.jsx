import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  PieChart,
  Percent,
  TrendingUp,
  Scale,
  Save,
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { ClosingStatementModal } from '../components/ClosingStatementModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { formatCurrency } from '../../../utils/formatCurrency';
import { calculateSettlement } from '../../../utils/settlementCalculations';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { matchesPracticeArea } from '../../../data/practiceAreas';
import { piService } from '../../../services/piService';

export function SettlementCalculator() {
  const { addToast } = useToast();
  const { matters, activeMatter, setActiveMatter } = useMatters();
  const cases = React.useMemo(() => {
    return (matters || []).filter(
      (m) =>
        matchesPracticeArea(m.practiceAreaId, 'pa-pi') ||
        m.practiceArea?.code === 'PI' ||
        m.practiceAreaName?.toLowerCase().includes('personal injury') ||
        m.matterNumber?.toUpperCase().includes('-PI-')
    );
  }, [matters]);
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || cases[0]?.id || 'ALL');

  const [grossRecovery, setGrossRecovery] = useState(() => Number(activeMatter?.budget) || 0);
  const [feeRate, setFeeRate] = useState(() => Number(activeMatter?.contingencyPercentage) || 33.33);
  const [feeRateOption, setFeeRateOption] = useState('standard'); // 'standard' or 'exact'
  const [caseExpenses, setCaseExpenses] = useState([]);
  const [medicalLiens, setMedicalLiens] = useState([]);
  const [otherDeductions, setOtherDeductions] = useState([]);

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmt, setNewExpenseAmt] = useState('');
  const [newOtherDesc, setNewOtherDesc] = useState('');
  const [newOtherAmt, setNewOtherAmt] = useState('');

  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Sync activeCaseId when global activeMatter changes
  useEffect(() => {
    if (activeMatter?.id && activeMatter.id !== activeCaseId) {
      setActiveCaseId(activeMatter.id);
      if (activeMatter.budget) setGrossRecovery(Number(activeMatter.budget));
      if (activeMatter.contingencyPercentage) {
        setFeeRate(Number(activeMatter.contingencyPercentage));
        setFeeRateOption('standard');
      }
    }
  }, [activeMatter]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId && newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

  // Sync when case changes & reload latest saved settlement calculation if present
  useEffect(() => {
    let cancelled = false;
    const selected = cases.find(c => c.id === activeCaseId);
    if (selected) {
      setGrossRecovery(Number(selected.budget) || 0);
      setFeeRate(Number(selected.contingencyPercentage) || 33.33);
      setFeeRateOption('standard');
    }

    if (!activeCaseId || activeCaseId === 'ALL') {
      return () => { cancelled = true; };
    }

    piService.getSettlements(activeCaseId)
      .then((settlements) => {
        if (cancelled) return;
        const latestVersion = Array.isArray(settlements) ? settlements[0]?.versions?.[0] : null;
        if (!latestVersion) return;

        const savedGross = Number(latestVersion.grossSettlementAmount ?? 0);
        const savedPct = Number(latestVersion.contingencyFeePercentage ?? 33.33);
        const savedFee = Number(latestVersion.calculatedAttorneyFee ?? 0);
        const exactThirdFee = Math.round((Math.round(savedGross * 100)) / 3) / 100;
        const pctFee = Math.round(Math.round(savedGross * 100) * savedPct / 100) / 100;
        const isExact =
          Boolean(latestVersion.notes?.includes('1/3 (Exact)')) ||
          (savedGross > 0 &&
            Math.abs(savedPct - 33.33) < 0.005 &&
            Math.abs(savedFee - exactThirdFee) < 0.005 &&
            Math.abs(savedFee - pctFee) >= 0.01);

        setGrossRecovery(savedGross);
        setFeeRate(savedPct);
        setFeeRateOption(isExact ? 'exact' : 'standard');

        const savedCosts = Number(latestVersion.totalLitigationCosts ?? 0);
        const savedLiens = Number(latestVersion.totalMedicalLiens ?? 0);
        const savedOther = Number(latestVersion.otherDeductions ?? 0) + Number(latestVersion.totalClientAdvances ?? 0);

        setCaseExpenses(savedCosts > 0 ? [{ description: 'Saved Litigation Costs', amount: savedCosts }] : []);
        setMedicalLiens(savedLiens > 0 ? [{ holder: 'Saved Medical Liens', amount: savedLiens }] : []);
        setOtherDeductions(savedOther > 0 ? [{ description: 'Saved Other Deductions', amount: savedOther }] : []);
      })
      .catch(() => {
        // Keep matter defaults if settlements could not be fetched
      });

    return () => { cancelled = true; };
  }, [activeCaseId, cases.length]);

  // Dynamic Calculations (exact cent-level precision, distinguishing 33.33% from exact 1/3):
  const {
    numericGross,
    contingencyFeeAmount,
    totalCaseExpenses,
    totalMedicalLiens,
    totalOtherDeductions,
    netClientProceeds,
    feeRateDisplay,
    feePercentageForStorage,
    feeBasis,
  } = calculateSettlement({
    grossRecovery,
    feeRate,
    feeRateOption,
    caseExpenses,
    medicalLiens,
    otherDeductions,
  });

  const clientSharePercentage = numericGross > 0 ? (netClientProceeds / numericGross) * 100 : 0;
  const attorneySharePercentage = numericGross > 0 ? (contingencyFeeAmount / numericGross) * 100 : 0;
  const costsLiensPercentage = numericGross > 0 ? ((totalCaseExpenses + totalMedicalLiens + totalOtherDeductions) / numericGross) * 100 : 0;

  // Add new expense handler
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseDesc || !newExpenseAmt) return;
    setCaseExpenses(prev => [...prev, { description: newExpenseDesc, amount: Number(newExpenseAmt) }]);
    setNewExpenseDesc('');
    setNewExpenseAmt('');
    addToast('Case expense item added to ledger.', 'success');
  };

  const handleRemoveExpense = (index) => {
    setCaseExpenses(prev => prev.filter((_, i) => i !== index));
  };

  // Add new other deduction handler
  const handleAddOtherDeduction = (e) => {
    e.preventDefault();
    if (!newOtherDesc || !newOtherAmt) return;
    setOtherDeductions(prev => [...prev, { description: newOtherDesc, amount: Number(newOtherAmt) }]);
    setNewOtherDesc('');
    setNewOtherAmt('');
    addToast('Client advance / other deduction added.', 'success');
  };

  const handleRemoveOther = (index) => {
    setOtherDeductions(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLien = (index) => {
    setMedicalLiens(prev => prev.filter((_, i) => i !== index));
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const fullSettlementObject = {
    matterTitle: activeCase?.matterTitle || activeCase?.title || 'Personal Injury Settlement',
    clientName: activeCase?.clientName || 'Client',
    attorneyName: activeCase?.responsibleAttorneyName || 'Managing Attorney',
    grossRecovery: numericGross,
    contingencyFeePercentage: feePercentageForStorage,
    feeRateLabel: feeRateDisplay,
    contingencyFeeAmount,
    caseExpenses,
    totalCaseExpenses,
    medicalLiens,
    totalMedicalLiens,
    otherDeductions,
    totalOtherDeductions,
    netClientProceeds,
    statementDate: new Date().toISOString().split('T')[0],
  };

  const handleSaveSettlement = async () => {
    try {
      if (activeCaseId && activeCaseId !== 'ALL') {
        await piService.createSettlement(activeCaseId, {
          settlementTitle: `Settlement Disbursement - ${activeCase?.title || activeCase?.clientName || 'Matter'}`,
          grossSettlementAmount: numericGross,
          contingencyFeePercentage: feePercentageForStorage,
          feeBasis,
          calculatedAttorneyFee: contingencyFeeAmount,
          totalLitigationCosts: totalCaseExpenses,
          totalMedicalLiens,
          otherDeductions: totalOtherDeductions,
          netClientRecovery: netClientProceeds,
          notes: feeRateOption === 'exact' ? 'Fee Basis: 1/3 (Exact)' : `Fee Basis: ${feeRateDisplay}`,
        });
        addToast('Settlement disbursement calculation saved to database.', 'success');
      } else {
        addToast('Please select a specific matter to save this settlement.', 'warning');
      }
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Error saving settlement', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={handleCaseChange}
        cases={cases}
        title="Settlement Disbursement Modeling & Calculator"
        subtitle="Real-time Utah RPC 1.5 contingency fee modeling, litigation disbursement accounting, healthcare lien holdbacks, and official client closing statement generator."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Save}
              onClick={handleSaveSettlement}
            >
              Save to Database
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Printer}
              onClick={() => setIsClosingModalOpen(true)}
            >
              Generate Closing Statement
            </Button>
          </div>
        }
      />

      {/* Top Level Dynamic Result Banner */}
      <div className="bg-[#06244B] text-white p-6 rounded-lg border border-[#0B356D] shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-2 space-y-1">
            <span className="text-xs font-bold text-[#A4432B] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4" /> Final Calculated Net Recovery
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {formatCurrency(netClientProceeds)}
            </div>
            <p className="text-xs text-slate-300">
              Net proceeds payable directly to client <strong className="text-white">{activeCase?.clientName}</strong> ({clientSharePercentage.toFixed(1)}% of total gross recovery).
            </p>
          </div>

          <div className="bg-[#041833] p-4 rounded border border-[#0B356D] space-y-1 text-xs">
            <span className="text-[#B8C0C4] block font-medium">Contingency Attorney Fee ({feeRateDisplay}):</span>
            <span className="text-lg font-serif font-bold text-amber-300 block">
              {formatCurrency(contingencyFeeAmount)}
            </span>
            <span className="text-[11px] text-slate-400">Firm Earned Contingency Proceeds</span>
          </div>

          <div className="bg-[#041833] p-4 rounded border border-[#0B356D] space-y-1 text-xs">
            <span className="text-[#B8C0C4] block font-medium">Costs, Liens &amp; Deductions:</span>
            <span className="text-lg font-serif font-bold text-red-400 block">
              {formatCurrency(totalCaseExpenses + totalMedicalLiens + totalOtherDeductions)}
            </span>
            <span className="text-[11px] text-slate-400">Trust Account Payoffs</span>
          </div>
        </div>

        {/* Visual Multi-Color Settlement Breakdown Bar */}
        <div className="mt-6 pt-4 border-t border-[#0B356D] space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-semibold">
            <span>Settlement Proportional Equity Breakdown</span>
            <span>Gross Total: {formatCurrency(numericGross)}</span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${clientSharePercentage}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Client Net Proceeds: ${clientSharePercentage.toFixed(1)}%`}
            />
            <div
              style={{ width: `${attorneySharePercentage}%` }}
              className="bg-[#A4432B] transition-all duration-300"
              title={`Attorney Fee: ${attorneySharePercentage.toFixed(1)}%`}
            />
            <div
              style={{ width: `${costsLiensPercentage}%` }}
              className="bg-amber-400 transition-all duration-300"
              title={`Costs & Liens: ${costsLiensPercentage.toFixed(1)}%`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Client Net ({clientSharePercentage.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A4432B]"></span> Attorney Fee ({attorneySharePercentage.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Case Expenses &amp; Liens ({costsLiensPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Inputs */}
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <div className="pb-3 border-b border-[#D9D6CF]">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Primary Recovery &amp; Fee Inputs
            </h3>
            <p className="text-xs text-[#667085]">
              Adjust gross recovery or select statutory contingency tier.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
                Total Gross Settlement ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="number"
                  step="1000"
                  value={grossRecovery}
                  onChange={(e) => setGrossRecovery(e.target.value)}
                  className="w-full text-base font-bold text-[#06244B] pl-8 pr-3 py-2 rounded border border-[#D9D6CF] focus:ring-1 focus:ring-[#A4432B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
                Contingency Fee Rate ({feeRateDisplay})
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setFeeRate(33.33); setFeeRateOption('standard'); }}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    feeRateOption === 'standard' && Math.abs(Number(feeRate) - 33.33) < 0.005
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  33.33% (Pre-Suit)
                </button>
                <button
                  type="button"
                  onClick={() => { setFeeRate(33.33); setFeeRateOption('exact'); }}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    feeRateOption === 'exact'
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  1/3 (Exact)
                </button>
                <button
                  type="button"
                  onClick={() => { setFeeRate(40.0); setFeeRateOption('standard'); }}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    feeRateOption === 'standard' && Number(feeRate) === 40.0
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  40.00% (Litigation)
                </button>
                <button
                  type="button"
                  onClick={() => { setFeeRate(25.0); setFeeRateOption('standard'); }}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    feeRateOption === 'standard' && Number(feeRate) === 25.0
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  25.00% (Minor/Govt)
                </button>
              </div>
            </div>

            <div className="bg-[#F5F0E5]/60 p-3 rounded border border-[#D9D6CF] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Calculated Attorney Fee:</span>
                <span className="font-bold text-[#A4432B]">{formatCurrency(contingencyFeeAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Reimbursable Costs:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalCaseExpenses)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Medical Liens:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalMedicalLiens)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Other Deductions:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalOtherDeductions)}</span>
              </div>
              <div className="pt-2 border-t border-[#D9D6CF] flex justify-between font-bold text-sm text-[#06244B]">
                <span>Net to Client:</span>
                <span className="text-emerald-700">{formatCurrency(netClientProceeds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Case Expenses Ledger */}
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#06244B]">
                Litigation Case Expenses ({caseExpenses.length})
              </h3>
              <p className="text-xs text-[#667085]">
                Filing fees, deposition transcripts, expert retainers.
              </p>
            </div>
            <span className="text-xs font-bold text-[#A4432B]">
              {formatCurrency(totalCaseExpenses)}
            </span>
          </div>

          {/* Itemized Expenses List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {caseExpenses.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-slate-800 font-medium truncate max-w-[180px]">{exp.description}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#06244B]">{formatCurrency(exp.amount)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(idx)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Expense Form */}
          <form onSubmit={handleAddExpense} className="pt-3 border-t border-[#D9D6CF] space-y-2">
            <span className="text-[11px] font-bold text-[#06244B] uppercase tracking-wider block">
              + Add Reimbursable Cost
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Description..."
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#D9D6CF]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount ($)..."
                value={newExpenseAmt}
                onChange={(e) => setNewExpenseAmt(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#D9D6CF]"
              />
            </div>
            <Button size="sm" variant="outline" type="submit" className="w-full text-xs py-1">
              Add Expense
            </Button>
          </form>
        </div>

        {/* Right Column: Medical Liens & Other Deductions */}
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#06244B]">
                Medical Liens &amp; Deductions
              </h3>
              <p className="text-xs text-[#667085]">
                Resolved healthcare payoffs and client advances.
              </p>
            </div>
            <span className="text-xs font-bold text-[#B42318]">
              {formatCurrency(totalMedicalLiens + totalOtherDeductions)}
            </span>
          </div>

          {/* Medical Liens List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Negotiated Liens ({medicalLiens.length})
            </span>
            {medicalLiens.map((lien, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-amber-50/60 rounded border border-amber-200 text-xs">
                <span className="text-slate-800 font-medium truncate max-w-[180px]">{lien.holder}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#B42318]">{formatCurrency(lien.amount)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLien(idx)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Lien"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {otherDeductions.length > 0 && (
              <>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block pt-2">
                  Other Authorized Deductions
                </span>
                {otherDeductions.map((ded, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                    <span className="text-slate-800 font-medium truncate max-w-[180px]">{ded.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(ded.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOther(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Quick Add Other Deduction Form */}
          <form onSubmit={handleAddOtherDeduction} className="pt-3 border-t border-[#D9D6CF] space-y-2">
            <span className="text-[11px] font-bold text-[#06244B] uppercase tracking-wider block">
              + Add Client Advance / Other Deduction
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Description..."
                value={newOtherDesc}
                onChange={(e) => setNewOtherDesc(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#D9D6CF]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount ($)..."
                value={newOtherAmt}
                onChange={(e) => setNewOtherAmt(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#D9D6CF]"
              />
            </div>
            <Button size="sm" variant="outline" type="submit" className="w-full text-xs py-1">
              Add Deduction
            </Button>
          </form>
        </div>
      </div>

      {/* Official Settlement Closing Statement Modal */}
      <ClosingStatementModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        settlementModel={fullSettlementObject}
      />
    </div>
  );
}

