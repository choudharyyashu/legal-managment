import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Landmark,
  Lock,
  AlertCircle,
  Clock,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck,
  CheckCircle2,
  DollarSign,
  FileText,
  Scale
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { formatCurrency } from '../../../utils/formatCurrency';

export function TrustAccount() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ledgers, setLedgers] = useState([
    {
      id: 'TR-1001',
      clientId: 'CLI-1001',
      clientName: 'Wasatch Mountain Logistics LLC',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      balance: 25000,
      escrowPurpose: 'General Retainer & Expert Deposition Reserve',
      lastTransactionDate: '2026-02-15',
      status: 'In Compliance'
    },
    {
      id: 'TR-1002',
      clientId: 'CLI-1002',
      clientName: 'Dr. Evelyn Martinez',
      matterNumber: '25-DOM-0418',
      matterTitle: 'In re Marriage of Martinez and Sterling: Domestic Dissolution',
      balance: 12500,
      escrowPurpose: 'Forensic Accounting & Real Estate Appraisal Retainer',
      lastTransactionDate: '2026-02-20',
      status: 'In Compliance'
    },
    {
      id: 'TR-1003',
      clientId: 'CLI-1008',
      clientName: 'Elena Rostova',
      matterNumber: '26-IMM-0012',
      matterTitle: 'Elena Rostova: Marriage-Based Adjustment of Status (I-130 / I-485)',
      balance: 1440,
      escrowPurpose: 'USCIS Statutory Filing Fee Escrow (Forms I-130 + I-485)',
      lastTransactionDate: '2026-01-22',
      status: 'In Compliance'
    },
    {
      id: 'TR-1004',
      clientId: 'CLI-1009',
      clientName: 'Rachel Lynn Walker',
      matterNumber: '26-25410-JTM',
      matterTitle: 'Rachel Lynn Walker: Chapter 7 Consumer Debt Liquidation',
      balance: 338,
      escrowPurpose: 'U.S. Bankruptcy Court District of Utah Statutory Filing Fee',
      lastTransactionDate: '2026-02-12',
      status: 'In Compliance'
    },
    {
      id: 'TR-1005',
      clientId: 'CLI-1003',
      clientName: 'Apex Horizon Real Estate Group',
      matterNumber: '24-LND-0912',
      matterTitle: 'Apex Horizon v. Wasatch County Board of Adjustment (Water Rights Appeal)',
      balance: 35000,
      escrowPurpose: 'Hydrology Expert Escrow & Appeal Bond Reserve',
      lastTransactionDate: '2026-01-05',
      status: 'In Compliance'
    }
  ]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [selectedLedgerId, setSelectedLedgerId] = useState('TR-1001');
  const [amount, setAmount] = useState(1000);
  const [reference, setReference] = useState('');

  const totalTrustBalance = ledgers.reduce((sum, item) => sum + item.balance, 0);

  const handleDeposit = (e) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLedgers(prev =>
      prev.map(l => (l.id === selectedLedgerId ? { ...l, balance: l.balance + Number(amount) } : l))
    );
    addToast(`Client trust deposit of ${formatCurrency(amount)} recorded successfully.`, 'success');
    setIsDepositOpen(false);
    setAmount(1000);
  };

  const handleDisburse = (e) => {
    e.preventDefault();
    if (amount <= 0) return;
    const target = ledgers.find(l => l.id === selectedLedgerId);
    if (target && target.balance < amount) {
      addToast('Cannot disburse more than the individual client ledger balance (Utah Rule 1.15 anti-commingling).', 'error');
      return;
    }
    setLedgers(prev =>
      prev.map(l => (l.id === selectedLedgerId ? { ...l, balance: l.balance - Number(amount) } : l))
    );
    addToast(`Earned fee disbursement of ${formatCurrency(amount)} transferred to Operating Account.`, 'success');
    setIsDisburseOpen(false);
    setAmount(1000);
  };

  return (
    <div className="space-y-6">
      {/* Standalone Accounting Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Independent Client Trust Accounting (Utah RPC 1.15):</strong> Operating autonomously with full segregated sub-ledgers and monthly three-way reconciliation. Completely independent of CosmoLex.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          AUTONOMOUS IOLTA
        </span>
      </div>

      <PageHeader
        title="IOLTA &amp; Client Trust Account"
        subtitle="Individual client ledger segregation, earned retainer drawdowns, and three-way reconciliation status."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Trust Account' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Scale}
              onClick={() => navigate('/billing/reconciliation')}
            >
              3-Way Reconciliation Tool
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowDownLeft}
              onClick={() => setIsDepositOpen(true)}
            >
              Record Deposit
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => setIsDisburseOpen(true)}
            >
              Disburse Earned Fees
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Pooled IOLTA Balance</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">
            {formatCurrency(totalTrustBalance)}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">First Republic / Chase IOLTA Pooled Acct</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Segregated Client Ledgers</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">
            {ledgers.length} Active Accounts
          </span>
          <span className="text-[11px] text-[#667085]">Zero commingling between client funds</span>
        </div>
        <div
          onClick={() => navigate('/billing/reconciliation')}
          className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm hover:border-[#A4432B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#667085] uppercase font-bold block">Three-Way Reconciliation</span>
            <span className="text-[10px] text-[#A4432B] font-semibold group-hover:underline">Open Tool &rarr;</span>
          </div>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Reconciled
          </span>
          <span className="text-[11px] text-[#667085]">Bank ($74.2k) = Book = Sub-Ledgers</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Utah Bar Foundation</span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block">
            $142.80
          </span>
          <span className="text-[11px] text-[#667085]">Auto-remitted interest YTD (Rule 1.15)</span>
        </div>
      </div>

      {/* Segregated Ledgers Table */}
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#D9D6CF] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#06244B]">
            Client-Level Segregated Trust Sub-Ledgers
          </h3>
          <span className="text-xs text-[#667085]">
            Individual client liability balances cannot be overdrawn or offset against other clients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
              <tr>
                <th className="p-3">Client &amp; ID</th>
                <th className="p-3">Matter Reference</th>
                <th className="p-3">Escrow Purpose</th>
                <th className="p-3">Last Activity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Trust Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]">
              {ledgers.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-[#06244B]">
                    <span className="block">{item.clientName}</span>
                    <span className="text-[11px] text-[#667085]">{item.clientId}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] text-[#A4432B] font-bold block">{item.matterNumber}</span>
                    <span className="text-[11px] text-[#202A35] max-w-xs truncate block">{item.matterTitle}</span>
                  </td>
                  <td className="p-3 text-[#202A35]">{item.escrowPurpose}</td>
                  <td className="p-3 text-[#667085]">{item.lastTransactionDate}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[10px]">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-sm text-emerald-800">
                    {formatCurrency(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title="Record Trust Account Deposit"
        subtitle="Utah Rule of Professional Conduct 1.15 Retainer Intake"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDeposit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              Select Client Trust Sub-Ledger
            </label>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
            >
              {ledgers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.clientName} — {l.matterNumber} ({formatCurrency(l.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Deposit Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Input
              label="Reference / Check # / Wire Details"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Check #4928 - Retainer replenishment"
            />
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
            Funds will immediately reflect in the individual client sub-ledger and pool into the IOLTA checking account.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={Plus}>
              Confirm Deposit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Disburse Modal */}
      <Modal
        isOpen={isDisburseOpen}
        onClose={() => setIsDisburseOpen(false)}
        title="Authorize Earned Fee Disbursement"
        subtitle="Drawdown from Trust to Firm Operating Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDisburse} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#202A35] mb-1">
              Client Trust Sub-Ledger Source
            </label>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
            >
              {ledgers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.clientName} — Balance: {formatCurrency(l.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Disbursement Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Input
              label="Approved Invoice / Fee Notice Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Approved Invoice #INV-2026-0042"
            />
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
            <strong>Utah Bar Compliance Notice:</strong> Earned fees must be billed and invoiced prior to or concurrent with withdrawal from the trust account.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDisburseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={ArrowUpRight}>
              Authorize Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

