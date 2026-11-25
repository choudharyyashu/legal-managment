import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Split, AlertCircle, Building2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { useTime } from '../../../context/TimeContext';

export function PaymentAllocationModal({ isOpen, onClose, clientId = '' }) {
  const { addToast } = useToast();
  const { invoices: contextInvoices } = useTime();
  const [totalPayment, setTotalPayment] = useState(0);

  // Derive unique clients that have open invoices
  const availableClients = Array.from(
    new Map(
      (contextInvoices || [])
        .filter((inv) => (inv.clientId || inv.client?.id) && (inv.clientName || inv.client?.name))
        .map((inv) => {
          const cid = inv.clientId || inv.client?.id;
          const cname = inv.clientName || inv.client?.name || 'Client';
          return [cid, { id: cid, name: cname }];
        })
    ).values()
  );

  const [selectedClientId, setSelectedClientId] = useState(clientId || (availableClients[0]?.id || ''));

  useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    } else if (!selectedClientId && availableClients.length > 0) {
      setSelectedClientId(availableClients[0].id);
    }
  }, [clientId, availableClients]);

  const [invoices, setInvoices] = useState([]);

  // Load and filter open invoices specifically belonging to selectedClientId
  useEffect(() => {
    const open = (contextInvoices || []).filter((inv) => {
      const isUnpaid = inv.status !== 'Paid' && (Number(inv.totalAmount || inv.total || 0) > Number(inv.paidAmount || 0));
      const invoiceClientId = inv.clientId || inv.client?.id;
      const matchesClient = !selectedClientId || invoiceClientId === selectedClientId;
      return isUnpaid && matchesClient;
    });

    setInvoices(
      open.map((inv) => ({
        id: inv.invoiceNumber || inv.id,
        clientId: inv.clientId || inv.client?.id,
        client: inv.clientName || inv.client?.name || 'Client',
        matter: inv.matterTitle || inv.matter?.title || inv.matterName || 'Matter',
        due: Number(inv.totalAmount || inv.total || 0) - Number(inv.paidAmount || 0),
        allocatedFees: 0,
        allocatedCosts: 0,
      }))
    );
  }, [contextInvoices, selectedClientId]);

  const allocatedTotal = invoices.reduce((sum, inv) => sum + inv.allocatedFees + inv.allocatedCosts, 0);
  const remainingUnallocated = totalPayment - allocatedTotal;

  const handleUpdateAllocation = (id, field, value) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, [field]: Number(value) } : inv))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (remainingUnallocated < -0.01) {
      addToast('Allocated total exceeds the total received payment amount.', 'error');
      return;
    }

    if (totalPayment <= 0) {
      addToast('Please enter a valid received payment amount.', 'error');
      return;
    }

    // Backend client validation: confirm all allocated invoices belong to the active client
    const foreignInvoice = invoices.find(
      (inv) => (inv.allocatedFees > 0 || inv.allocatedCosts > 0) && selectedClientId && inv.clientId && inv.clientId !== selectedClientId
    );
    if (foreignInvoice) {
      addToast(`Security validation error: Invoice ${foreignInvoice.id} does not belong to client ${selectedClientId}.`, 'error');
      return;
    }

    const activeAllocations = invoices.filter((inv) => inv.allocatedFees > 0 || inv.allocatedCosts > 0);
    if (activeAllocations.length === 0) {
      addToast('Please allocate funds to at least one invoice.', 'warning');
      return;
    }

    const clientObj = availableClients.find((c) => c.id === selectedClientId);
    const clientDisplay = clientObj?.name || 'the selected client';

    addToast(
      `Payment of ${formatCurrency(totalPayment)} allocated across ${activeAllocations.length} invoice(s) for ${clientDisplay}.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Invoice Payment Allocation & Cost Split"
      subtitle="Split client wire / retainer receipts across multiple matters (Fee vs Cost Segregation)"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Client Selector & Received Remittance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg">
          <div>
            <label className="text-[10px] text-[#667085] uppercase font-bold block mb-1">
              Payer Client Account
            </label>
            {clientId ? (
              <div className="p-1.5 bg-white border border-[#D9D6CF] rounded font-bold text-xs text-[#06244B] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{availableClients.find((c) => c.id === clientId)?.name || clientId}</span>
              </div>
            ) : availableClients.length > 0 ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs font-semibold text-[#06244B] bg-white border border-[#D9D6CF] rounded p-1.5"
              >
                {availableClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-[11px] text-[#667085] italic p-1.5 bg-white border border-[#D9D6CF] rounded">
                No active billing clients found
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[#667085] uppercase font-bold block mb-1">
              Received Remittance Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalPayment || ''}
              onChange={(e) => setTotalPayment(Number(e.target.value))}
              placeholder="0.00"
              className="font-bold text-sm text-[#06244B] bg-white border border-[#D9D6CF] rounded p-1 w-full"
            />
          </div>
        </div>

        {/* Allocation Balance Summary */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F0E5]/50 border border-[#D9D6CF] rounded-lg">
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Total Allocated</span>
            <span className="mt-0.5 font-bold text-sm text-[#06244B] block">{formatCurrency(allocatedTotal)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Remaining Unallocated</span>
            <span className={`mt-0.5 font-bold text-sm block ${remainingUnallocated >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(remainingUnallocated)}
            </span>
          </div>
        </div>

        {/* Invoice Allocation Matrix */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-[#06244B] uppercase block">
              Client Unpaid Invoices Matrix ({invoices.length})
            </span>
            <span className="text-[11px] text-[#667085]">
              Strictly filtered to invoices owned by active client
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#667085] bg-white border border-[#D9D6CF] rounded-lg">
              No open unpaid invoices found for the selected client account.
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="p-3 bg-white border border-[#D9D6CF] rounded-lg space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <div>
                    <span className="font-mono font-bold text-[#A4432B]">{inv.id}</span>
                    <span className="text-[11px] text-[#667085] ml-2">Matter: {inv.matter}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({inv.client})</span>
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
                      min="0"
                      step="0.01"
                      value={inv.allocatedFees || ''}
                      onChange={(e) => handleUpdateAllocation(inv.id, 'allocatedFees', e.target.value)}
                      placeholder="0.00"
                      className="w-full text-xs p-1.5 rounded border border-[#D9D6CF]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#667085] uppercase font-semibold block mb-0.5">
                      Allocate to Litigation Costs ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={inv.allocatedCosts || ''}
                      onChange={(e) => handleUpdateAllocation(inv.id, 'allocatedCosts', e.target.value)}
                      placeholder="0.00"
                      className="w-full text-xs p-1.5 rounded border border-[#D9D6CF]"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
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
