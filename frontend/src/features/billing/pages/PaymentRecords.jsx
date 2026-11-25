import React, { useState, useEffect } from 'react';
import { Building, DollarSign, Search, CheckCircle2, FileText, ArrowRight, Split, Landmark, CreditCard, RefreshCw } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { PaymentAllocationModal } from '../components/PaymentAllocationModal';
import { billingService } from '../../../services/billingService';

export function PaymentRecords() {
  const { invoices } = useTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load authoritative payment records from backend API
  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await billingService.getPayments();
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : (res?.payments || []);

      const mapped = raw.map((p) => ({
        id: p.id,
        date: p.receivedDate || (p.createdAt ? p.createdAt.split('T')[0] : ''),
        clientName: p.clientName || 'General Client Remittance',
        invoiceNumber: p.invoiceNumber || '—',
        amount: Number(p.amount || 0),
        method: p.paymentMethod || 'ACH / Electronic',
        referenceNumber: p.paymentReference || p.transactionReference || 'PAY-REF',
        status: 'Paid',
      }));

      setPayments(mapped);
    } catch (err) {
      console.warn('Could not load payments from API:', err?.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter(p =>
    (p.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      key: 'date',
      label: 'Payment Date',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">{formatDate(val)}</span>,
    },
    {
      key: 'clientName',
      label: 'Client Entity',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085]">Invoice: {row.invoiceNumber}</span>
        </div>
      ),
    },
    {
      key: 'method',
      label: 'Payment Method',
      sortable: true,
      render: (val) => {
        if (val === 'Trust Retainer Drawdown') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs">
              <Landmark className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              Trust Retainer Drawdown
            </span>
          );
        }
        if (val === 'FedWire / ACH') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs">
              <Building className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              FedWire / ACH
            </span>
          );
        }
        if (val?.toLowerCase().includes('check')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              Check / Draft
            </span>
          );
        }
        if (val?.toLowerCase().includes('card')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              Credit Card
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF] shadow-2xs">
            {val}
          </span>
        );
      },
    },
    {
      key: 'referenceNumber',
      label: 'Bank Reference / Tracking',
      render: (val) => <span className="text-xs font-mono text-[#667085]">{val}</span>,
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#287A55]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Ledger Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Receipts &amp; Ledger Records"
        subtitle="Historical deposits, electronic funds transfers (EFT), wire transfers, and retainer drawdowns applied to client matter statements."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Payment Records' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Split}
            onClick={() => setIsAllocationOpen(true)}
          >
            Allocate Multi-Invoice Remittance
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search payments by client, invoice #, or wire reference..."
          />
        </div>

        <div className="p-3 bg-white rounded border border-[#D9D6CF] text-xs flex items-center gap-3 shadow-subtle">
          <span className="text-[#667085]">Total Applied Collections:</span>
          <span className="font-serif font-bold text-base text-[#287A55]">{formatCurrency(totalCollected)}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        pageSize={8}
      />

      <PaymentAllocationModal
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
      />
    </div>
  );
}

