import React from 'react';
import { DollarSign, TrendingUp, Download, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';

export function FinancialReports() {
  const { addToast } = useToast();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Financial &amp; Realization Reports"
        subtitle="Executive management reporting on billings, collections, trust liabilities, and fee realization."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/reports/staff' }, { label: 'Financial Reports' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => addToast('Executive Financial Package (CSV & PDF Ledger) exported.', 'success')}
          >
            Export Executive Package
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Fees Billed (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">$485,250.00</p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Collected (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">$438,900.00</p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Overall Realization</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">90.4%</p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Average Partner Rate</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">$516.00/hr</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
          Accounts Receivable Aging Summary (30 / 60 / 90+ Days)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <span className="text-green-800 font-bold block uppercase text-[10px]">Current (0 - 30 Days)</span>
            <span className="text-lg font-bold text-green-900 mt-1 block">$48,200.00</span>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <span className="text-amber-800 font-bold block uppercase text-[10px]">31 - 60 Days</span>
            <span className="text-lg font-bold text-amber-900 mt-1 block">$18,400.00</span>
          </div>
          <div className="p-3 bg-rose-50 rounded border border-rose-200">
            <span className="text-rose-800 font-bold block uppercase text-[10px]">61 - 90 Days</span>
            <span className="text-lg font-bold text-rose-900 mt-1 block">$6,250.00</span>
          </div>
          <div className="p-3 bg-red-100 rounded border border-red-300">
            <span className="text-red-800 font-bold block uppercase text-[10px]">90+ Days Past Due</span>
            <span className="text-lg font-bold text-red-950 mt-1 block">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

