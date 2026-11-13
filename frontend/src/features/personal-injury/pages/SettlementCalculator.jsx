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
  Scale
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { ClosingStatementModal } from '../components/ClosingStatementModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { MOCK_PI_CASES, MOCK_SETTLEMENT_MODELS } from '../../../data/mockPersonalInjury';
import { mockStorage } from '../../../services/mockStorage';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';

export function SettlementCalculator() {
  const { addToast } = useToast();
  const [cases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [activeCaseId, setActiveCaseId] = useState(cases[0]?.id || 'PI-2026-001');

  // Load preset or initialize state
  const presetModel = MOCK_SETTLEMENT_MODELS.find(m => m.matterId === activeCaseId) || MOCK_SETTLEMENT_MODELS[0] || {};

  const [grossRecovery, setGrossRecovery] = useState(presetModel?.grossRecovery || 250000);
  const [feeRate, setFeeRate] = useState(presetModel?.contingencyFeePercentage || 33.3333);
  const [caseExpenses, setCaseExpenses] = useState(Array.isArray(presetModel?.caseExpenses) ? presetModel.caseExpenses : []);
  const [medicalLiens, setMedicalLiens] = useState(Array.isArray(presetModel?.medicalLiens) ? presetModel.medicalLiens : []);
  const [otherDeductions, setOtherDeductions] = useState(Array.isArray(presetModel?.otherDeductions) ? presetModel.otherDeductions : []);

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmt, setNewExpenseAmt] = useState('');
  const [newOtherDesc, setNewOtherDesc] = useState('');
  const [newOtherAmt, setNewOtherAmt] = useState('');

  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Sync when case changes
  useEffect(() => {
    const model = MOCK_SETTLEMENT_MODELS.find(m => m.matterId === activeCaseId);
    if (model) {
      setGrossRecovery(model.grossRecovery || 0);
      setFeeRate(model.contingencyFeePercentage || 33.3333);
      setCaseExpenses(Array.isArray(model.caseExpenses) ? model.caseExpenses : []);
      setMedicalLiens(Array.isArray(model.medicalLiens) ? model.medicalLiens : []);
      setOtherDeductions(Array.isArray(model.otherDeductions) ? model.otherDeductions : []);
    }
  }, [activeCaseId]);

  // Dynamic Calculations:
  const numericGross = Number(grossRecovery) || 0;
  const contingencyFeeAmount = Math.round(((numericGross * Number(feeRate)) / 100) * 100) / 100;
  const totalCaseExpenses = caseExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalMedicalLiens = medicalLiens.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const totalOtherDeductions = otherDeductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // Formula: Net Client Proceeds = Gross Recovery - Contingency Fee - Case Expenses - Medical Liens - Other Deductions
  const netClientProceeds = Math.max(
    0,
    numericGross - contingencyFeeAmount - totalCaseExpenses - totalMedicalLiens - totalOtherDeductions
  );

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

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const fullSettlementObject = {
    matterTitle: activeCase?.matterTitle || 'Personal Injury Settlement',
    clientName: activeCase?.clientName || 'Sarah Jenkins',
    grossRecovery: numericGross,
    contingencyFeePercentage: Number(feeRate),
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

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={setActiveCaseId}
        cases={cases}
        title="Settlement Disbursement Modeling &amp; Calculator"
        subtitle="Real-time Utah RPC 1.5 contingency fee modeling, litigation disbursement accounting, healthcare lien holdbacks, and official client closing statement generator."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Printer}
            onClick={() => setIsClosingModalOpen(true)}
          >
            Generate Closing Statement
          </Button>
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
            <span className="text-[#B8C0C4] block font-medium">Contingency Attorney Fee ({Number(feeRate).toFixed(2)}%):</span>
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
                Contingency Fee Rate (%)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeeRate(33.3333)}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    Math.abs(Number(feeRate) - 33.3333) < 0.1
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  33.33% (Pre-Suit)
                </button>
                <button
                  type="button"
                  onClick={() => setFeeRate(40.0)}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    Number(feeRate) === 40.0
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  40.00% (Litigation)
                </button>
                <button
                  type="button"
                  onClick={() => setFeeRate(25.0)}
                  className={`py-1.5 px-2 text-xs font-bold rounded border ${
                    Number(feeRate) === 25.0
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
                <span className="font-bold text-[#B42318]">{formatCurrency(lien.amount)}</span>
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

