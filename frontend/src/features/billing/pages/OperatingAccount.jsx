import React, { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../utils/formatCurrency';
import { BankReconciliationModal } from '../components/BankReconciliationModal';
import { useToast } from '../../../components/ui/Toast';
import { ledgerService } from '../../../services/ledgerService';

export function OperatingAccount() {
  const { addToast } = useToast();
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disbDesc, setDisbDesc] = useState('');
  const [disbAmount, setDisbAmount] = useState(450);

  // Load live operating account transactions from General Ledger
  const loadOperatingLedger = async () => {
    setLoading(true);
    try {
      const res = await ledgerService.getJournals();
      const rawJournals = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : (res?.journals || []);

      const opTransactions = [];
      rawJournals.forEach((j) => {
        if (Array.isArray(j.entries)) {
          j.entries.forEach((e) => {
            const accNum = String(e.accountNumber || e.account?.accountNumber || '');
            const accName = e.accountName || e.account?.accountName || '';
            if (accNum === '1010' || accNum === '1000' || accName.toLowerCase().includes('operating')) {
              const debitVal = Number(e.debit || (e.entryType === 'DEBIT' ? e.amount : 0) || 0);
              const creditVal = Number(e.credit || (e.entryType === 'CREDIT' ? e.amount : 0) || 0);
              const isDeposit = debitVal > 0;
              const amt = isDeposit ? debitVal : creditVal;
              opTransactions.push({
                id: `${j.journalNumber || j.id}-${e.id || Math.random().toString(36).slice(2, 6)}`,
                date: j.transactionDate ? new Date(j.transactionDate).toISOString().split('T')[0] : '',
                description: j.memo || j.description || `${accName} Entry`,
                type: isDeposit ? 'Credit' : 'Debit', // UI display: Credit = deposit into account, Debit = payout
                amount: amt,
                journalId: j.id,
              });
            }
          });
        } else if (j.accountDebit?.includes('1010') || j.accountCredit?.includes('1010')) {
          const isDeposit = j.accountDebit?.includes('1010');
          opTransactions.push({
            id: j.id,
            date: j.date || (j.transactionDate ? j.transactionDate.split('T')[0] : ''),
            description: j.memo || j.description || 'Operating Transaction',
            type: isDeposit ? 'Credit' : 'Debit',
            amount: Number(isDeposit ? j.debit : j.credit),
            journalId: j.id,
          });
        }
      });

      // Sort by date descending
      opTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Compute running balance
      let currentBal = 184520.50; // Operating baseline
      const withBalances = opTransactions.map((tx) => {
        const bal = currentBal;
        if (tx.type === 'Credit') {
          currentBal -= tx.amount;
        } else {
          currentBal += tx.amount;
        }
        return { ...tx, balance: bal };
      });

      setTransactions(withBalances);
    } catch (err) {
      console.warn('Could not load operating ledger from API:', err?.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperatingLedger();
  }, []);

  const handleCreateDisbursement = async (e) => {
    e.preventDefault();
    if (!disbDesc.trim() || disbAmount <= 0) return;

    try {
      const amt = Number(disbAmount);
      await ledgerService.createJournal({
        transactionDate: new Date().toISOString().split('T')[0],
        memo: disbDesc.trim(),
        entries: [
          {
            accountNumber: 5000, // Operating Expenses (Chart of Accounts #5000)
            debit: amt,
            credit: 0,
          },
          {
            accountNumber: 1010, // Operating Cash Account (Chart of Accounts #1010)
            debit: 0,
            credit: amt,
          },
        ],
      });

      addToast(`Operating check disbursement of ${formatCurrency(amt)} posted to General Ledger (Account #1010 / #5000).`, 'success');
      setIsDisbursementOpen(false);
      setDisbDesc('');
      setDisbAmount(450);
      loadOperatingLedger();
    } catch (err) {
      console.error('Failed to post disbursement:', err);
      addToast(err?.response?.data?.message || err?.message || 'Failed to post disbursement.', 'error');
    }
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
      <div className="bg-[#FAF8F5] border border-[#D9D6CF] p-3 rounded-lg flex items-center justify-between text-xs text-[#202A35]">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#06244B] shrink-0" />
          <span>
            <strong>General Ledger Account #1010 (Operating Cash) | Account #5000 (Operating Expenses):</strong> Operational cash receipts and firm expenditures strictly segregated from fiduciary client trust funds (#1020 / #2100).
          </span>
        </div>
        <span className="bg-[#EAE7E0] text-[#06244B] font-bold px-2 py-0.5 rounded text-[10px]">
          OPERATING LEDGER
        </span>
      </div>

      <PageHeader
        title="Operating Account Overview"
        subtitle="Operational cash receipts and firm expense disbursements tracked in the firm General Ledger."
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
        transactions={transactions}
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
