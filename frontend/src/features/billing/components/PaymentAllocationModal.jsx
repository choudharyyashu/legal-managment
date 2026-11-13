import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Split, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';

export function PaymentAllocationModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [totalPayment, setTotalPayment] = useState(20000);

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-0041', client: 'Wasatch Mountain Logistics', matter: '25-CV-0101', due: 14250.00, allocatedFees: 12000.00, allocatedCosts: 2250.00 },
    { id: 'INV-2026-0042', client: 'Wasatch Mountain Logistics', matter: '25-CORP-0102', due: 8500.00, allocatedFees: 5750.00, allocatedCosts: 0.00 },
  ]);

  const allocatedTotal = invoices.reduce((sum, inv) => sum + inv.allocatedFees + inv.allocatedCosts, 0);
  const remainingUnallocated = totalPayment - allocatedTotal;

  const handleUpdateAllocation = (id, field, value) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, [field]: Number(value) } : inv)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (remainingUnallocated < -0.01) {
      addToast('Allocated total exceeds the total received payment amount.', 'error');
      return;
    }
    addToast(`Payment of ${formatCurrency(totalPayment)} allocated across ${invoices.length} invoices.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Invoice Payment Allocation &amp; Cost Split"
      subtitle="Split client wire / retainer receipts across multiple matters (Fee vs Cost Segregation)"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg">
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Received Remittance</span>
            <input
              type="number"
              value={totalPayment}
              onChange={(e) => setTotalPayment(Number(e.target.value))}
              className="mt-1 font-bold text-sm text-[#06244B] bg-white border border-[#D9D6CF] rounded p-1 w-full"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Total Allocated</span>
            <span className="mt-1 font-bold text-sm text-[#06244B] block pt-1">{formatCurrency(allocatedTotal)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Remaining Unallocated</span>
            <span className={`mt-1 font-bold text-sm block pt-1 ${remainingUnallocated >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(remainingUnallocated)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <span className="font-bold text-xs text-[#06244B] uppercase block">Invoice Allocation Matrix</span>
          {invoices.map(inv => (
            <div key={inv.id} className="p-3 bg-white border border-[#D9D6CF] rounded-lg space-y-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                <div>
                  <span className="font-mono font-bold text-[#A4432B]">{inv.id}</span>
                  <span className="text-[11px] text-[#667085] ml-2">Matter: {inv.matter}</span>
                </div>
                <span className="text-xs font-semibold text-[#06244B]">Due: {formatCurrency(inv.due)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#667085] uppercase font-semibold block mb-0.5">
                    Allocate to Professional Fees ($)
                  </label>
                  <input
                    type="number"
                    value={inv.allocatedFees}
                    onChange={(e) => handleUpdateAllocation(inv.id, 'allocatedFees', e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-[#D9D6CF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#667085] uppercase font-semibold block mb-0.5">
                    Allocate to Litigation Costs ($)
                  </label>
                  <input
                    type="number"
                    value={inv.allocatedCosts}
                    onChange={(e) => handleUpdateAllocation(inv.id, 'allocatedCosts', e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-[#D9D6CF]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" icon={CheckCircle2}>
            Confirm Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

