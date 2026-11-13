import React, { useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database, Plus, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../utils/formatCurrency';
import { BankReconciliationModal } from '../components/BankReconciliationModal';
import { useToast } from '../../../components/ui/Toast';

export function OperatingAccount() {
  const { addToast } = useToast();
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);

  const [transactions, setTransactions] = useState([
    { id: 'TX-101', date: '2026-10-28', description: 'Client Wire Deposit - Wasatch Mountain Logistics', type: 'Credit', amount: 15390.00, balance: 148200.00 },
    { id: 'TX-102', date: '2026-10-24', description: 'Advanced Court Filing Fees - Utah Third District Court', type: 'Debit', amount: 385.00, balance: 132810.00 },
    { id: 'TX-103', date: '2026-10-22', description: 'Trust Retainer Earned Fee Transfer - Apex Horizon Matter', type: 'Credit', amount: 10000.00, balance: 133195.00 },
    { id: 'TX-104', date: '2026-10-18', description: 'Certified Court Reporter Appearance Fee Disbursement', type: 'Debit', amount: 890.00, balance: 123195.00 },
  ]);

  const [disbDesc, setDisbDesc] = useState('');
  const [disbAmount, setDisbAmount] = useState(450);

  const handleCreateDisbursement = (e) => {
    e.preventDefault();
    if (!disbDesc.trim() || disbAmount <= 0) return;

    const currentBalance = transactions[0]?.balance || 148200;
    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: disbDesc.trim(),
      type: 'Debit',
      amount: Number(disbAmount),
      balance: currentBalance - Number(disbAmount),
    };

    setTransactions(prev => [newTx, ...prev]);
    addToast(`Operating check disbursement of ${formatCurrency(disbAmount)} recorded.`, 'success');
    setIsDisbursementOpen(false);
    setDisbDesc('');
    setDisbAmount(450);
  };

  const columns = [
    { key: 'date', label: 'Transaction Date', sortable: true },
    {
      key: 'description',
      label: 'Description & Reference',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {row.type === 'Credit' ? (
            <ArrowDownLeft className="w-4 h-4 text-[#287A55]" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-[#B42318]" />
          )}
          <span className="font-semibold text-xs text-[#06244B]">{val}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <span className={`text-xs font-bold ${row.type === 'Credit' ? 'text-[#287A55]' : 'text-[#B42318]'}`}>
          {row.type === 'Credit' ? '+' : '-'}{formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Account Balance',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatCurrency(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Operating Bank Ledger:</strong> Operating cash receipts and firm expenditures. Supports monthly bank reconciliation matching.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Operating Account Overview"
        subtitle="Operational cash receipts and firm expense disbursements. Real-time bank reconciliation is managed via CosmoLex."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Operating Account' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsReconOpen(true)}
            >
              Reconcile Bank Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsDisbursementOpen(true)}
            >
              Record Disbursement
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold text-[#667085] uppercase">Current Operating Balance</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            {formatCurrency(transactions[0]?.balance || 148200)}
          </p>
          <span className="text-[11px] text-[#287A55] font-semibold">Zions Bank Main Commercial Account</span>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold text-[#667085] uppercase">30-Day Inflow</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">+$47,890.00</p>
          <span className="text-[11px] text-[#667085]">Earned fees transferred</span>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs font-semibold text-[#667085] uppercase">30-Day Disbursements</span>
          <p className="text-2xl font-serif font-bold text-[#B42318] mt-1">-$12,450.00</p>
          <span className="text-[11px] text-[#667085]">Litigation &amp; expert expenses</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        pageSize={8}
      />

      {/* Bank Reconciliation Modal */}
      <BankReconciliationModal
        isOpen={isReconOpen}
        onClose={() => setIsReconOpen(false)}
      />

      {/* Record Operating Disbursement Modal */}
      <Modal
        isOpen={isDisbursementOpen}
        onClose={() => setIsDisbursementOpen(false)}
        title="Record Operating Disbursement / Vendor Payment"
        subtitle="Operating Check &amp; Electronic Debit Register"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDisbursement} className="space-y-4 text-xs">
          <div>
            <Input
              label="Payee / Vendor &amp; Purpose"
              value={disbDesc}
              onChange={(e) => setDisbDesc(e.target.value)}
              placeholder="e.g. SLC Superior Court Reporter Transcripts"
              required
            />
          </div>

          <div>
            <Input
              label="Disbursement Amount ($)"
              type="number"
              value={disbAmount}
              onChange={(e) => setDisbAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
            Disbursement will immediately deduct from the operating bank balance and create an audit log entry.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDisbursementOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={Plus}>
              Confirm Disbursement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
