import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  DollarSign, 
  CheckCircle2, 
  Download, 
  Eye, 
  Send, 
  Scale, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Clock, 
  Building 
} from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useBranding } from '../../../context/BrandingContext';
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
  const { invoices, addInvoice, recordPayment, refreshInvoices, timeEntries = [], expenses = [] } = useTime();
  const { clients } = useClients();
  const { matters } = useMatters();
  const { branding } = useBranding();
  const { addToast } = useToast();

  useEffect(() => {
    if (typeof refreshInvoices === 'function') {
      refreshInvoices();
    }
  }, [refreshInvoices]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('FedWire / ACH');

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMatterId, setNewMatterId] = useState('');
  const [newIssueDate, setNewIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('Professional legal services rendered pursuant to legal representation agreement.');
  const [newLineItems, setNewLineItems] = useState([]);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // Unbilled activities available for currently selected matter
  const unbilledTimeForMatter = useMemo(() => {
    if (!newMatterId) return [];
    return (timeEntries || []).filter(
      (t) => t.matterId === newMatterId && t.status !== 'Billed' && t.status !== 'Invoiced' && t.isBillable !== false
    );
  }, [timeEntries, newMatterId]);

  const unbilledExpensesForMatter = useMemo(() => {
    if (!newMatterId) return [];
    return (expenses || []).filter(
      (e) => e.matterId === newMatterId && e.status !== 'Billed' && e.status !== 'Invoiced' && e.isBillable !== false
    );
  }, [expenses, newMatterId]);

  // Reset modal state cleanly to prevent stale data retention
  const resetCreateModalState = (targetMatterId) => {
    const selectedMatter = matters.find(m => m.id === targetMatterId) || matters[0];
    const defaultMatterId = selectedMatter?.id || '';
    setNewMatterId(defaultMatterId);
    setNewIssueDate(new Date().toISOString().split('T')[0]);
    setNewDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setNewNotes('Professional legal services rendered pursuant to legal representation agreement.');
    setNewLineItems([]);
  };

  // Open modal with fresh state
  const handleOpenCreateInvoice = () => {
    const initialMatterId = matters.length > 0 ? (newMatterId || matters[0].id) : '';
    resetCreateModalState(initialMatterId);
    setIsCreateModalOpen(true);
  };

  // Close modal and clear state
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateModalState('');
  };

  // Add a blank manual line item
  const handleAddLineItem = () => {
    const selectedMatter = matters.find(m => m.id === newMatterId);
    const defaultRate = selectedMatter && selectedMatter.hourlyRate ? Number(selectedMatter.hourlyRate) : 0;
    setNewLineItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        itemType: 'Time',
        description: '',
        quantity: 1,
        unitRate: defaultRate,
      }
    ]);
  };

  // Import unbilled time & disbursements for current matter
  const handleImportUnbilledActivities = () => {
    const items = [];
    unbilledTimeForMatter.forEach((t, idx) => {
      items.push({
        id: `time-${t.id || idx}-${Date.now()}`,
        itemType: 'Time',
        timeEntryId: t.id,
        description: t.description?.trim() || `${t.activityType || 'Legal Services'} (${t.userName || 'Staff'})`,
        quantity: Number(t.hours) || 1,
        unitRate: Number(t.rate) || 350,
      });
    });
    unbilledExpensesForMatter.forEach((e, idx) => {
      items.push({
        id: `exp-${e.id || idx}-${Date.now()}`,
        itemType: 'Expense',
        expenseId: e.id,
        description: e.description?.trim() || e.vendorName || `${e.category || 'Disbursement'} Expense`,
        quantity: 1,
        unitRate: Number(e.amount) || 0,
      });
    });

    if (items.length === 0) {
      addToast('No unbilled time entries or expenses found for this matter.', 'info');
      return;
    }

    setNewLineItems(items);
    addToast(`Loaded ${items.length} unbilled item${items.length === 1 ? '' : 's'} into invoice draft.`, 'success');
  };

  const handleRemoveLineItem = (id) => {
    setNewLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id, field, value) => {
    setNewLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'quantity' || field === 'unitRate' ? (parseFloat(value) || 0) : value
        };
      }
      return item;
    }));
  };

  // Calculate invoice subtotal, adjustments, and final total dynamically
  const invoiceSubtotal = useMemo(() => {
    return newLineItems
      .filter(item => item.itemType !== 'Adjustment')
      .reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitRate || 0)), 0);
  }, [newLineItems]);

  const invoiceAdjustments = useMemo(() => {
    return newLineItems
      .filter(item => item.itemType === 'Adjustment')
      .reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitRate || 0)), 0);
  }, [newLineItems]);

  const calculatedInvoiceTotal = useMemo(() => {
    return Math.max(0, invoiceSubtotal - invoiceAdjustments);
  }, [invoiceSubtotal, invoiceAdjustments]);

  // Submit and create invoice with strict validation
  const handleCreateInvoiceSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const selectedMatter = matters.find(m => m.id === newMatterId) || matters[0];

    if (!selectedMatter) {
      addToast('Please select an active legal matter first.', 'error');
      return;
    }

    if (newLineItems.length === 0) {
      addToast('Please include at least one billing line item before generating an invoice.', 'error');
      return;
    }

    const emptyDescItem = newLineItems.find(item => !item.description || !item.description.trim());
    if (emptyDescItem) {
      addToast('Please provide a valid description for all invoice line items.', 'error');
      return;
    }

    const invalidQtyItem = newLineItems.find(item => Number(item.quantity) <= 0);
    if (invalidQtyItem) {
      addToast('Line item quantities must be greater than zero.', 'error');
      return;
    }

    const invalidRateItem = newLineItems.find(item => Number(item.unitRate) < 0);
    if (invalidRateItem) {
      addToast('Line item rates cannot be negative.', 'error');
      return;
    }

    if (calculatedInvoiceTotal <= 0) {
      addToast('Invoice total must be greater than $0.00.', 'error');
      return;
    }

    setIsSubmittingInvoice(true);
    try {
      await addInvoice({
        clientId: selectedMatter.clientId,
        matterId: selectedMatter.id,
        issueDate: newIssueDate,
        dueDate: newDueDate,
        notes: newNotes,
        lineItems: newLineItems.map(item => ({
          itemType: item.itemType,
          description: item.description.trim(),
          quantity: Number(item.quantity) || 1,
          unitRate: Number(item.unitRate) || 0,
          timeEntryId: item.timeEntryId || undefined,
          expenseId: item.expenseId || undefined,
        })),
      });

      addToast(`Invoice generated successfully for ${selectedMatter.title}!`, 'success');
      handleCloseCreateModal();
    } catch (err) {
      console.error('Invoice creation error:', err);
      addToast(err?.response?.data?.message || err?.message || 'Failed to create invoice.', 'error');
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const filteredInvoices = invoices.filter(i => {
    const invNum = i.invoiceNumber || '';
    const cName = i.clientName || '';
    const mTitle = i.matterTitle || i.matterName || '';
    const q = searchQuery.toLowerCase();
    return invNum.toLowerCase().includes(q) || cName.toLowerCase().includes(q) || mTitle.toLowerCase().includes(q);
  });

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
      render: (val, row) => <span className="text-xs text-[#202A35] max-w-xs block truncate">{val || row.matterName || 'Legal Representation'}</span>,
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
              onClick={handleOpenCreateInvoice}
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

      {/* GENERATE NEW INVOICE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Generate Client Invoice &amp; Statement"
        subtitle="Create an official billing statement and record accounts receivable on firm general ledger."
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col text-xs text-[#667085]">
              <div className="flex items-center gap-3">
                <span>Subtotal: <strong className="font-mono text-[#202A35]">{formatCurrency(invoiceSubtotal)}</strong></span>
                {invoiceAdjustments > 0 && (
                  <span className="text-emerald-700 font-semibold">
                    Discounts: -{formatCurrency(invoiceAdjustments)}
                  </span>
                )}
              </div>
              <div className="text-sm font-serif font-bold text-[#06244B]">
                Total Invoiced: {formatCurrency(calculatedInvoiceTotal)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateModal}
                disabled={isSubmittingInvoice}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleCreateInvoiceSubmit}
                disabled={isSubmittingInvoice || matters.length === 0}
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isSubmittingInvoice ? 'Generating Invoice...' : 'Generate &amp; Issue Invoice'}
              </Button>
            </div>
          </div>
        }
      >
        {matters.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-sm mb-1">No Active Legal Matters Found</strong>
              Before generating an invoice, please create a prospective client and open a legal matter in the Clients &amp; Matters section.
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 py-1">
            {/* Row 1: Linked Legal Matter */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                Linked Legal Matter *
              </label>
              <select
                value={newMatterId}
                onChange={(e) => setNewMatterId(e.target.value)}
                required
                className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] font-semibold focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} — {m.title} (Client: {m.clientName})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Issue Date & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                  Invoice Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={newIssueDate}
                  onChange={(e) => setNewIssueDate(e.target.value)}
                  className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
                />
              </div>
            </div>

            {/* Row 3: Billing Line Items Table */}
            <div className="space-y-2 pt-2 border-t border-[#D9D6CF]/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#06244B]">
                  Billing Line Items ({newLineItems.length})
                </span>
                <div className="flex items-center gap-2">
                  {(unbilledTimeForMatter.length > 0 || unbilledExpensesForMatter.length > 0) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImportUnbilledActivities}
                      title="Load unbilled time entries and disbursements for this matter"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#A4432B]" />
                      Import Unbilled ({unbilledTimeForMatter.length + unbilledExpensesForMatter.length})
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLineItem}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Line Item
                  </Button>
                </div>
              </div>

              {newLineItems.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-[#D9D6CF] rounded-lg text-center text-xs text-[#667085]">
                  No line items on this invoice yet. Click <strong className="text-[#06244B]">"Add Line Item"</strong> to manually add charges, or <strong className="text-[#06244B]">"Import Unbilled"</strong> to populate from logged matter hours and expenses.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newLineItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-[#F5F0E5]/40 border border-[#D9D6CF] rounded-lg space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#A4432B]">
                          Item #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-[#667085] hover:text-[#B42318] p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-3">
                          <select
                            value={item.itemType}
                            onChange={(e) => handleLineItemChange(item.id, 'itemType', e.target.value)}
                            className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-1.5 px-2 text-[#202A35]"
                          >
                            <option value="Time">Time (Hourly)</option>
                            <option value="Expense">Expense (Disbursement)</option>
                            <option value="FlatFee">Flat Fee / Retainer</option>
                            <option value="Adjustment">Adjustment / Discount</option>
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                            placeholder="Description of legal services, flat fee, or disbursement..."
                            className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-1.5 px-2 text-[#202A35]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                            placeholder="Qty / Hrs"
                            className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-1.5 px-2 text-[#202A35] text-right font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            required
                            value={item.unitRate}
                            onChange={(e) => handleLineItemChange(item.id, 'unitRate', e.target.value)}
                            placeholder="Rate ($)"
                            className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-1.5 px-2 text-[#202A35] text-right font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end text-[11px] text-[#667085] pt-1">
                        Line Total: <strong className="text-[#06244B] ml-1 font-mono">{formatCurrency(Number(item.quantity || 0) * Number(item.unitRate || 0))}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Row 4: Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                Invoice Notes / Payment Instructions
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Include remittance information or payment instructions..."
                className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Invoice Detail / Print Preview Modal */}
      <Modal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        title={selectedInvoice ? `Invoice: ${selectedInvoice.invoiceNumber}` : 'Invoice Preview'}
        subtitle={selectedInvoice ? `Client: ${selectedInvoice.clientName || 'Client'}` : ''}
        maxWidth="max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-[#202A35]">
            {/* Printable Formal Invoice Sheet */}
            <div className="p-4 sm:p-8 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-6">
              {/* Firm Letterhead Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#06244B] pb-4">
                <div>
                  {branding?.logoUrl && (
                    <img
                      src={branding.logoUrl}
                      alt={branding?.firmName || 'Firm Logo'}
                      className="max-h-12 max-w-[180px] object-contain mb-2"
                    />
                  )}
                  <h2 className="font-serif font-bold text-2xl text-[#06244B]">
                    {branding?.firmName || 'HEUGLY & BLUDWORTH'}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#A4432B] uppercase tracking-widest">
                    {branding?.tagline || 'ATTORNEYS AT LAW'}
                  </p>
                  <p className="text-[10px] text-[#667085] mt-1">
                    {branding?.address || '250 State Street, Suite 800, Salt Lake City, UT 84111'}<br />
                    Tel: {branding?.primaryPhone || '(801) 555-0100'} • {branding?.primaryEmail || 'contact@utahslawyers.com'}
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
        matterId={selectedInvoice?.matterId || matters[0]?.id}
        matterTitle={selectedInvoice?.matterName || matters[0]?.title}
      />
    </div>
  );
}

