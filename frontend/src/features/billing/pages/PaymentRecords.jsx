import React, { useState } from 'react';
import { Building, DollarSign, Search, CheckCircle2, FileText, ArrowRight, Split } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { PaymentAllocationModal } from '../components/PaymentAllocationModal';

export function PaymentRecords() {
  const { invoices } = useTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);

  // Extract payment records from invoices
  const paymentHistory = [
    {
      id: 'PAY-8801',
      date: '2026-10-28',
      clientName: 'Wasatch Mountain Logistics LLC',
      invoiceNumber: 'HB-2026-1088',
      amount: 15390.00,
      method: 'FedWire / ACH',
      referenceNumber: 'WF-TXN-994812',
      status: 'Paid',
    },
    {
      id: 'PAY-8802',
      date: '2026-10-22',
      clientName: 'Apex Horizon Real Estate Group',
      invoiceNumber: 'HB-2026-1092',
      amount: 10000.00,
      method: 'Trust Retainer Drawdown',
      referenceNumber: 'TRST-DRW-0441',
      status: 'Paid',
    },
    {
      id: 'PAY-8803',
      date: '2026-09-30',
      clientName: 'Summit Crest BioSciences Inc.',
      invoiceNumber: 'HB-2026-1070',
      amount: 22500.00,
      method: 'FedWire / ACH',
      referenceNumber: 'WF-TXN-988310',
      status: 'Paid',
    }
  ];

  const filteredPayments = paymentHistory.filter(p =>
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
      render: (val) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF]">
          {val}
        </span>
      ),
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

