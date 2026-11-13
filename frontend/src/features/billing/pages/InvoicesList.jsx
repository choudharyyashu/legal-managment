import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Printer, DollarSign, CheckCircle2, Download, Eye, Send, Scale } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { SettlementStatementModal } from '../components/SettlementStatementModal';

export function InvoicesList() {
  const { invoices, addInvoice, recordPayment } = useTime();
  const { clients } = useClients();
  const { matters } = useMatters();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('FedWire / ACH');

  const filteredInvoices = invoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.matterTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceDue.toString());
    setPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const pAmt = parseFloat(paymentAmount);
    if (!pAmt || pAmt <= 0) {
      addToast('Please enter a valid payment amount.', 'error');
      return;
    }

    recordPayment(selectedInvoice.id, pAmt, paymentMethod, `PAY-REF-${Date.now().toString().slice(-4)}`);
    addToast(`Payment of ${formatCurrency(pAmt)} recorded for invoice ${selectedInvoice.invoiceNumber}.`, 'success');
    setPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice # & Client',
      sortable: true,
      render: (val, row) => (
        <div>
          <span
            onClick={() => {
              setSelectedInvoice(row);
              setIsPrintPreviewOpen(true);
            }}
            className="font-serif font-bold text-sm text-[#06244B] hover:text-[#A4432B] block cursor-pointer"
          >
            {val}
          </span>
          <span className="text-[11px] text-[#667085]">{row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'matterTitle',
      label: 'Related Case Matter',
      render: (val) => <span className="text-xs text-[#202A35] max-w-xs block truncate">{val}</span>,
    },
    {
      key: 'issueDate',
      label: 'Issue / Due Date',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs">
          <span className="text-[#06244B] block">Issued: {formatDate(val, { short: true })}</span>
          <span className="text-[10px] text-[#667085]">Due: {formatDate(row.dueDate, { short: true })}</span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Invoiced',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatCurrency(val)}</span>,
    },
    {
      key: 'balanceDue',
      label: 'Balance Due',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className={`text-xs font-bold ${val > 0 ? 'text-[#B42318]' : 'text-[#287A55]'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Payment Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedInvoice(row);
              setIsPrintPreviewOpen(true);
            }}
            className="p-1.5 rounded text-[#06244B] hover:bg-[#F5F0E5]"
            title="Invoice Preview & Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          {row.balanceDue > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenPayment(row)}
            >
              Record Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Invoices &amp; Statements"
        subtitle="Operational billing statements, retainer drawdowns, fee schedules, and printable client invoices."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Invoices' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Scale}
              onClick={() => setIsSettlementOpen(true)}
            >
              Settlement Sheet
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                const defaultMatter = matters[0];
                addInvoice({
                  clientId: defaultMatter.clientId,
                  clientName: defaultMatter.clientName,
                  matterId: defaultMatter.id,
                  matterTitle: defaultMatter.title,
                  dueDate: '2026-12-15',
                  subtotalFees: 8500.00,
                  subtotalExpenses: 450.00,
                  totalAmount: 8950.00,
                  billingArrangement: 'Hourly',
                  lineItems: [
                    { id: 'li-new-1', description: 'Legal research & drafting appellate reply brief', hours: 17.0, rate: 500, amount: 8500.00 },
                    { id: 'li-new-2', description: 'Disbursement: Utah court transcript copy fees', hours: null, rate: null, amount: 450.00 }
                  ],
                  notes: 'Invoice generated and ready for client delivery.',
                });
                addToast('New invoice record created and added to ledger.', 'success');
              }}
            >
              Generate New Invoice
            </Button>
          </div>
        }
      />

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search invoices by number, client, or case..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        pageSize={8}
      />

      {/* Invoice Detail / Print Preview Modal */}
      <Modal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        title={`Invoice: ${selectedInvoice?.invoiceNumber}`}
        subtitle={`Client: ${selectedInvoice?.clientName}`}
        maxWidth="max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-[#202A35]">
            {/* Printable Formal Invoice Sheet */}
            <div className="p-4 sm:p-8 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-6">
              {/* Firm Letterhead Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#06244B] pb-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#06244B]">
                    HEUGLY &amp; BLUDWORTH
                  </h2>
                  <p className="text-[11px] font-semibold text-[#A4432B] uppercase tracking-widest">
                    ATTORNEYS AT LAW
                  </p>
                  <p className="text-[10px] text-[#667085] mt-1">
                    250 State Street, Suite 800, Salt Lake City, UT 84111<br />
                    Tel: (801) 555-0100 • contact@utahslawyers.com
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="font-serif font-bold text-xl text-[#06244B] block">
                    INVOICE
                  </span>
                  <p className="font-mono text-xs font-bold text-[#A4432B]">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-[10px] text-[#667085] mt-1">
                    Date: {formatDate(selectedInvoice.issueDate)}<br />
                    Payment Due: {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
              </div>

              {/* Bill To & Matter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F5F0E5]/50 rounded border border-[#D9D6CF]">
                  <span className="font-bold text-[10px] text-[#667085] uppercase block">Billed To Client:</span>
                  <p className="font-serif font-bold text-sm text-[#06244B] mt-0.5">{selectedInvoice.clientName}</p>
                  <p className="text-[#667085] mt-0.5">Account ID: {selectedInvoice.clientId}</p>
                </div>

                <div className="p-3 bg-[#F5F0E5]/50 rounded border border-[#D9D6CF]">
                  <span className="font-bold text-[10px] text-[#667085] uppercase block">Matter Representation:</span>
                  <p className="font-semibold text-xs text-[#06244B] mt-0.5">{selectedInvoice.matterTitle}</p>
                  <p className="text-[#667085] mt-0.5">Billing Basis: {selectedInvoice.billingArrangement}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs divide-y divide-[#D9D6CF] min-w-[480px]">
                  <thead>
                    <tr className="bg-[#F5F0E5]/80 text-[#06244B] uppercase tracking-wider text-left">
                      <th className="py-2 px-3">Service Description</th>
                      <th className="py-2 px-3 text-right">Hours</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9D6CF]/50">
                    {selectedInvoice.lineItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 text-[#202A35]">{item.description}</td>
                        <td className="py-2 px-3 text-right text-[#667085]">{item.hours ? formatHours(item.hours) : '—'}</td>
                        <td className="py-2 px-3 text-right text-[#667085]">{item.rate ? `$${item.rate}/hr` : '—'}</td>
                        <td className="py-2 px-3 text-right font-semibold text-[#06244B]">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#D9D6CF]/50">
                    <span className="text-[#667085]">Total Professional Services:</span>
                    <span className="font-bold text-[#06244B]">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9D6CF]/50">
                    <span className="text-[#667085]">Payments / Retainer Applied:</span>
                    <span className="font-bold text-[#287A55]">({formatCurrency(selectedInvoice.paidAmount)})</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-serif font-bold text-[#06244B]">Total Balance Due:</span>
                    <span className="font-serif font-bold text-[#B42318]">{formatCurrency(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Remittance notes */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] text-gray-600 leading-normal">
                Please remit wire or ACH payments referencing {selectedInvoice.invoiceNumber} to Heugly &amp; Bludworth Client Trust / Operating Account.
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsPrintPreviewOpen(false)}>
                Close Preview
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" icon={Download} onClick={() => addToast('PDF invoice downloaded.', 'success')}>
                  Download PDF
                </Button>
                <Button size="sm" variant="primary" icon={Printer} onClick={() => window.print()}>
                  Print Invoice
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoiceNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-xs">
            <p><strong>Client:</strong> {selectedInvoice?.clientName}</p>
            <p><strong>Total Outstanding Balance:</strong> <span className="text-[#B42318] font-bold">{formatCurrency(selectedInvoice?.balanceDue)}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#202A35] mb-1">
              Payment Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#202A35] mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            >
              <option value="FedWire / ACH">FedWire / ACH Direct Deposit</option>
              <option value="Trust Retainer Drawdown">Trust Retainer Drawdown</option>
              <option value="Check">Check / Commercial Draft</option>
              <option value="Credit Card">Credit Card via Client Portal</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Apply Payment Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contingency Settlement Statement Modal */}
      <SettlementStatementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
      />
    </div>
  );
}

