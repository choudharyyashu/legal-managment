import React, { useState } from 'react';
import {
  Calculator,
  DollarSign,
  Scale,
  Printer,
  Download,
  Plus,
  Trash2,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { SettlementStatementModal } from '../components/SettlementStatementModal';

export function SettlementCalculator() {
  const { matters } = useMatters();
  const { addToast } = useToast();

  const [selectedMatterId, setSelectedMatterId] = useState(matters[0]?.id || 'MAT-1001');
  const selectedMatter = matters.find(m => m.id === selectedMatterId) || matters[0];

  // Settlement Inputs
  const [grossSettlement, setGrossSettlement] = useState(250000);
  const [contingencyPct, setContingencyPct] = useState(33.33);

  // Dynamic Case Costs
  const [costs, setCosts] = useState([
    { id: 'c1', label: 'Accident Reconstruction & Biomechanics Expert', amount: 12500 },
    { id: 'c2', label: 'Certified Deposition Transcripts (4 Witnesses)', amount: 4800 },
    { id: 'c3', label: 'Utah Third District Court Filing & Service Fees', amount: 950 },
  ]);
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');

  // Dynamic Medical & Subrogation Liens
  const [liens, setLiens] = useState([
    { id: 'l1', holder: 'University of Utah Hospital (Statutory Lien)', originalAmount: 28000, negotiatedAmount: 18500 },
    { id: 'l2', holder: 'BlueCross BlueShield (ERISA Subrogation)', originalAmount: 7200, negotiatedAmount: 3900 },
  ]);
  const [newLienHolder, setNewLienHolder] = useState('');
  const [newLienOriginal, setNewLienOriginal] = useState('');
  const [newLienNegotiated, setNewLienNegotiated] = useState('');

  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Math
  const attorneyFee = grossSettlement * (contingencyPct / 100);
  const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalLiens = liens.reduce((sum, l) => sum + Number(l.negotiatedAmount || 0), 0);
  const totalDeductions = attorneyFee + totalCosts + totalLiens;
  const netClientPayout = Math.max(0, grossSettlement - totalDeductions);

  // Handlers for adding/removing items
  const handleAddCost = (e) => {
    e.preventDefault();
    if (!newCostLabel.trim() || !newCostAmount) return;
    setCosts(prev => [
      ...prev,
      { id: `c-${Date.now()}`, label: newCostLabel.trim(), amount: Number(newCostAmount) }
    ]);
    setNewCostLabel('');
    setNewCostAmount('');
    addToast('Litigation disbursement expense added.', 'success');
  };

  const handleRemoveCost = (id) => {
    setCosts(prev => prev.filter(c => c.id !== id));
  };

  const handleAddLien = (e) => {
    e.preventDefault();
    if (!newLienHolder.trim() || !newLienNegotiated) return;
    setLiens(prev => [
      ...prev,
      {
        id: `l-${Date.now()}`,
        holder: newLienHolder.trim(),
        originalAmount: Number(newLienOriginal || newLienNegotiated),
        negotiatedAmount: Number(newLienNegotiated),
      }
    ]);
    setNewLienHolder('');
    setNewLienOriginal('');
    setNewLienNegotiated('');
    addToast('Third-party lien record added.', 'success');
  };

  const handleRemoveLien = (id) => {
    setLiens(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveSettlement = () => {
    addToast(
      `Settlement of ${formatCurrency(grossSettlement)} recorded for "${selectedMatter?.title}". Net client payout: ${formatCurrency(netClientPayout)}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Compliance Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Contingency Settlement Calculator (Utah Rule of Professional Conduct 1.5(c)):</strong> Automatic itemization of attorney fees, reimbursed litigation costs, and third-party healthcare subrogation liens. Produces client-ready closing statements.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap shrink-0 self-start sm:self-auto">
          RULE 1.5(c) COMPLIANT
        </span>
      </div>

      <PageHeader
        title="Settlement &amp; Recovery Disbursement Calculator"
        subtitle="Gross recovery calculations, attorney fee withholdings, itemized case costs, medical liens, and net client proceeds."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'Settlement Calculator' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => setIsStatementModalOpen(true)}
            >
              Print Closing Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleSaveSettlement}
            >
              Post to Trust Ledger
            </Button>
          </div>
        }
      />

      {/* Target Matter Selection */}
      <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
            Linked Legal Matter Docket
          </label>
          <select
            value={selectedMatterId}
            onChange={(e) => setSelectedMatterId(e.target.value)}
            className="w-full text-xs font-semibold text-[#06244B] border border-[#D9D6CF] rounded p-2 bg-slate-50"
          >
            {matters.map(m => (
              <option key={m.id} value={m.id}>
                {m.matterNumber} — {m.title} ({m.clientName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-6 shrink-0 text-xs text-[#667085] xl:border-l xl:border-[#EAECF0] xl:pl-6">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#667085]">Practice Group</span>
            <span className="font-semibold text-[#06244B] whitespace-nowrap">{selectedMatter?.practiceAreaName || 'Civil Litigation'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#667085]">Lead Counsel</span>
            <span className="font-semibold text-[#06244B] whitespace-nowrap">{selectedMatter?.responsibleAttorneyName || 'Thomas Bludworth, Esq.'}</span>
          </div>
        </div>
      </div>

      {/* Primary Settlement Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">1. Gross Recovery</span>
          <span className="text-2xl font-bold font-serif text-[#06244B] mt-1 block">
            {formatCurrency(grossSettlement)}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Policy Limits / Defense Award</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">2. Attorney Fee ({contingencyPct}%)</span>
          <span className="text-2xl font-bold font-serif text-[#A4432B] mt-1 block">
            {formatCurrency(attorneyFee)}
          </span>
          <span className="text-[11px] text-[#667085]">Transferred to Operating Account</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">3. Costs &amp; Liens Withheld</span>
          <span className="text-2xl font-bold font-serif text-rose-700 mt-1 block">
            {formatCurrency(totalCosts + totalLiens)}
          </span>
          <span className="text-[11px] text-[#667085]">Costs: {formatCurrency(totalCosts)} • Liens: {formatCurrency(totalLiens)}</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-300 shadow-sm">
          <span className="text-xs text-emerald-900 uppercase font-bold block">4. Net Client Proceeds</span>
          <span className="text-2xl font-bold font-serif text-emerald-800 mt-1 block">
            {formatCurrency(netClientPayout)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">Ready for Client Disbursement Check</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Settlement Formula & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recovery & Fee Setup Card */}
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#A4432B]" />
              Gross Recovery &amp; Contingency Structure
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                  Gross Settlement Amount ($)
                </label>
                <input
                  type="number"
                  value={grossSettlement}
                  onChange={(e) => setGrossSettlement(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B] bg-slate-50 text-[#06244B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                  Contingency Fee Arrangement
                </label>
                <div className="flex gap-2">
                  <select
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B] bg-slate-50"
                  >
                    <option value={33.33}>33.33% (Standard Pre-Trial Settlement)</option>
                    <option value={40}>40.00% (Post-Complaint / Trial Setting)</option>
                    <option value={25}>25.00% (Minor Settlement / Early Compromise)</option>
                    <option value={50}>50.00% (Appellate Review)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Reimbursable Costs */}
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
              <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#A4432B]" />
                Itemized Litigation Costs Reimbursed to Firm
              </h3>
              <span className="text-xs font-bold text-[#06244B]">Subtotal: {formatCurrency(totalCosts)}</span>
            </div>

            <div className="space-y-2">
              {costs.map(c => (
                <div key={c.id} className="p-2.5 rounded bg-slate-50 border border-[#D9D6CF]/60 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#202A35]">{c.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#06244B]">{formatCurrency(c.amount)}</span>
                    <button
                      onClick={() => handleRemoveCost(c.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Cost Form */}
            <form onSubmit={handleAddCost} className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Description (e.g. Expert Deposition Fee, Mediation Surcharge)"
                value={newCostLabel}
                onChange={(e) => setNewCostLabel(e.target.value)}
                className="flex-1 text-xs p-2 rounded border border-[#D9D6CF]"
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={newCostAmount}
                onChange={(e) => setNewCostAmount(e.target.value)}
                className="w-full sm:w-28 text-xs p-2 rounded border border-[#D9D6CF]"
              />
              <Button size="sm" variant="outline" type="submit" icon={Plus}>
                Add Cost
              </Button>
            </form>
          </div>

          {/* Third-Party & Medical Liens */}
          <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
              <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#A4432B]" />
                Healthcare &amp; Subrogation Liens (Paid Directly)
              </h3>
              <span className="text-xs font-bold text-rose-700">Subtotal: {formatCurrency(totalLiens)}</span>
            </div>

            <div className="space-y-2">
              {liens.map(l => (
                <div key={l.id} className="p-2.5 rounded bg-slate-50 border border-[#D9D6CF]/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#202A35] block">{l.holder}</span>
                    <span className="text-[10px] text-[#667085]">
                      Asserted: {formatCurrency(l.originalAmount)} • Savings: {formatCurrency(l.originalAmount - l.negotiatedAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-700">{formatCurrency(l.negotiatedAmount)}</span>
                    <button
                      onClick={() => handleRemoveLien(l.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove lien"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Lien Form */}
            <form onSubmit={handleAddLien} className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Lienholder (e.g. IHC Hospital, Medicare, Optum)"
                value={newLienHolder}
                onChange={(e) => setNewLienHolder(e.target.value)}
                className="flex-1 text-xs p-2 rounded border border-[#D9D6CF]"
              />
              <input
                type="number"
                placeholder="Original ($)"
                value={newLienOriginal}
                onChange={(e) => setNewLienOriginal(e.target.value)}
                className="w-24 text-xs p-2 rounded border border-[#D9D6CF]"
              />
              <input
                type="number"
                placeholder="Negotiated ($)"
                value={newLienNegotiated}
                onChange={(e) => setNewLienNegotiated(e.target.value)}
                className="w-28 text-xs p-2 rounded border border-[#D9D6CF]"
              />
              <Button size="sm" variant="outline" type="submit" icon={Plus}>
                Add Lien
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Complete Summary & Disbursement Slip */}
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF] pb-2">
              Settlement Closing Slip
            </h3>

            <div className="space-y-2.5 text-xs text-[#202A35]">
              <div className="flex justify-between font-bold text-[#06244B]">
                <span>Gross Settlement Proceeds:</span>
                <span className="font-mono text-sm">{formatCurrency(grossSettlement)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[#667085]">
                <div className="flex justify-between">
                  <span>(-) Attorney Fee ({contingencyPct}%):</span>
                  <span className="font-mono text-rose-700">-{formatCurrency(attorneyFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Itemized Case Costs:</span>
                  <span className="font-mono text-rose-700">-{formatCurrency(totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Negotiated Medical Liens:</span>
                  <span className="font-mono text-rose-700">-{formatCurrency(totalLiens)}</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#D9D6CF] flex justify-between items-center text-emerald-900 font-bold">
                <span className="uppercase tracking-wider text-[11px]">Net Client Payout:</span>
                <span className="font-mono text-lg text-emerald-800">
                  {formatCurrency(netClientPayout)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D6CF] space-y-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                icon={Printer}
                onClick={() => setIsStatementModalOpen(true)}
              >
                View Printable Statement
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center"
                icon={CheckCircle2}
                onClick={handleSaveSettlement}
              >
                Approve &amp; Disburse Check
              </Button>
            </div>

            <p className="text-[10px] text-[#667085] text-center italic">
              Mandatory client closing disclosure pursuant to Utah Rules of Professional Conduct 1.5(c).
            </p>
          </div>
        </div>
      </div>

      {/* Printable Modal */}
      <SettlementStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        matterTitle={selectedMatter?.title}
      />
    </div>
  );
}

