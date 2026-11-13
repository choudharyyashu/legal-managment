import React, { useState } from 'react';
import { FileSpreadsheet, Download, Filter, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { useToast } from '../../../components/ui/Toast';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function BillingReports() {
  const { addToast } = useToast();

  const reportRows = [
    { practiceArea: 'Civil Litigation & Dispute Resolution', hoursBilled: 198.4, totalFees: 99200, collected: 86400, realizationRate: '87.1%' },
    { practiceArea: 'Real Estate, Water Rights & Land Use', hoursBilled: 124.5, totalFees: 68475, collected: 62000, realizationRate: '90.5%' },
    { practiceArea: 'Commercial & Corporate Law', hoursBilled: 75.0, totalFees: 37500, collected: 37500, realizationRate: '100.0%' },
    { practiceArea: 'Family Law & Domestic Relations', hoursBilled: 83.3, totalFees: 31237, collected: 24000, realizationRate: '76.8%' },
    { practiceArea: 'Estate Planning & Trust Admin', hoursBilled: 52.0, totalFees: 24700, collected: 24700, realizationRate: '100.0%' },
    { practiceArea: 'Municipal & Administrative Law', hoursBilled: 59.0, totalFees: 29500, collected: 28000, realizationRate: '94.9%' },
  ];

  const columns = [
    {
      key: 'practiceArea',
      label: 'Practice Group',
      sortable: true,
      render: (val) => <span className="font-serif font-bold text-sm text-[#06244B]">{val}</span>,
    },
    {
      key: 'hoursBilled',
      label: 'Billed Hours',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-semibold text-[#A4432B]">{formatHours(val)}</span>,
    },
    {
      key: 'totalFees',
      label: 'Fees Billed',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#06244B]">{formatCurrency(val)}</span>,
    },
    {
      key: 'collected',
      label: 'Cash Collections',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#287A55]">{formatCurrency(val)}</span>,
    },
    {
      key: 'realizationRate',
      label: 'Realization %',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#287A55] border border-emerald-200">
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing &amp; Revenue Reports"
        subtitle="Practice group fee generation, realization metrics, and accounts receivable aging summaries."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Billing Reports' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => addToast('Exporting Billing Summary to CSV/Excel format...', 'info')}
          >
            Export Report (CSV)
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Total Firm Fees Billed (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">$290,612.00</p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Total Collections (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">$262,600.00</p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Firm Realization Rate</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">90.3%</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reportRows}
        pageSize={10}
      />
    </div>
  );
}

