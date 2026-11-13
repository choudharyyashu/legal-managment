import React, { useState } from 'react';
import { Landmark, CheckCircle2, AlertTriangle, FileText, Check, DollarSign } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';

export function BankReconciliationModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [statementEndingBalance, setStatementEndingBalance] = useState(148200);

  const [statementItems, setStatementItems] = useState([
    { id: 'ST-1', date: '2026-10-28', description: 'Client Wire Deposit - Wasatch Mountain Logistics', amount: 15390.00, cleared: true },
    { id: 'ST-2', date: '2026-10-24', description: 'Advanced Court Filing Fees - Utah Third District Court', amount: -385.00, cleared: true },
    { id: 'ST-3', date: '2026-10-22', description: 'Trust Retainer Earned Fee Transfer - Apex Horizon', amount: 10000.00, cleared: true },
    { id: 'ST-4', date: '2026-10-18', description: 'Certified Court Reporter Appearance Fee Disbursement', amount: -890.00, cleared: true },
    { id: 'ST-5', date: '2026-10-30', description: 'Outstanding Client Retainer Check #4912', amount: 3500.00, cleared: false },
    { id: 'ST-6', date: '2026-10-31', description: 'Uncashed Vendor Check - Deposition Transcripts', amount: -650.00, cleared: false },
  ]);

  const toggleCleared = (id) => {
    setStatementItems(prev =>
      prev.map(item => item.id === id ? { ...item, cleared: !item.cleared } : item)
    );
  };

  const clearedBalance = 124085.00 + statementItems
    .filter(i => i.cleared)
    .reduce((sum, i) => sum + i.amount, 0);

  const difference = statementEndingBalance - clearedBalance;

  const handleFinishReconciliation = (e) => {
    e.preventDefault();
    if (Math.abs(difference) > 0.01) {
      addToast(`Reconciliation has an unresolved variance of ${formatCurrency(difference)}. All items must balance to zero.`, 'warning');
      return;
    }
    addToast('Bank reconciliation completed! Statement matched book balance with zero variance.', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Bank Statement Reconciliation"
      subtitle="Zions Bank Commercial Operating Account • Period Ending October 31, 2026"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleFinishReconciliation} className="space-y-4 text-xs">
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg">
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Statement Ending Balance</span>
            <input
              type="number"
              value={statementEndingBalance}
              onChange={(e) => setStatementEndingBalance(Number(e.target.value))}
              className="mt-1 font-bold text-sm text-[#06244B] bg-white border border-[#D9D6CF] rounded p-1 w-full"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Cleared Book Balance</span>
            <span className="mt-1 font-bold text-sm text-[#06244B] block pt-1">{formatCurrency(clearedBalance)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Unreconciled Variance</span>
            <span className={`mt-1 font-bold text-sm block pt-1 ${Math.abs(difference) < 0.01 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(difference)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xs text-[#06244B] uppercase">Uncleared &amp; Cleared Bank Transactions</span>
            <span className="text-[11px] text-[#667085]">Click checkbox to match against bank statement line items</span>
          </div>

          <div className="border border-[#D9D6CF] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold sticky top-0">
                <tr>
                  <th className="p-2 w-8">Cleared</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Transaction Description</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {statementItems.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50 ${item.cleared ? 'bg-emerald-50/30' : ''}`}>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.cleared}
                        onChange={() => toggleCleared(item.id)}
                        className="rounded border-[#D9D6CF] text-[#06244B] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 text-[#667085]">{item.date}</td>
                    <td className="p-2 font-medium text-[#202A35]">{item.description}</td>
                    <td className={`p-2 text-right font-bold ${item.amount > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            <strong>[DEMO SIMULATION] Utah State Bar Compliance:</strong> Reconciled bank statements must be certified by the Managing Partner and archived for 7 years under Utah Supreme Court Rules of Professional Practice.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" icon={CheckCircle2}>
            Confirm Reconciliation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

