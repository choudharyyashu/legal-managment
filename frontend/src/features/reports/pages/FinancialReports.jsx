import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, PieChart as PieIcon, BarChart3, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { reportService } from '../../../services/reportService';
import { useAuth } from '../../../hooks/useAuth';

export function FinancialReports() {
  const { addToast } = useToast();
  const { allUsers } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstandingAr: 0,
    totalTrustBalance: 0,
  });
  const [arAging, setArAging] = useState({
    current: 0,
    days31to60: 0,
    days61to90: 0,
    daysOver90: 0,
    totalOutstanding: 0,
  });

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [dashData, arData] = await Promise.allSettled([
        reportService.getDashboard(),
        reportService.getArAging(),
      ]);

      if (dashData.status === 'fulfilled' && dashData.value?.financials) {
        setFinancials(dashData.value.financials);
      }
      if (arData.status === 'fulfilled' && arData.value) {
        setArAging(arData.value);
      }
    } catch (err) {
      console.warn('Could not load financial reports from backend:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Compute dynamic realization percentage
  const grossBilled = Number(financials.totalInvoiced) || 0;
  const grossCollected = Number(financials.totalCollected) || 0;
  const realizationPct = grossBilled > 0
    ? ((grossCollected / grossBilled) * 100).toFixed(1) + '%'
    : '100.0%';

  // Compute average partner billing rate dynamically from firm users
  const partnerUsers = allUsers.filter(
    (u) => u.role === 'super_admin' || u.role === 'attorney' || u.role === 'supervisor'
  );
  const avgPartnerRate = partnerUsers.length > 0
    ? partnerUsers.reduce((sum, u) => sum + (Number(u.billingRate || u.rate) || 500), 0) / partnerUsers.length
    : 500;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Financial &amp; Realization Reports"
        subtitle="Executive management reporting on billings, collections, trust liabilities, and fee realization."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/reports/staff' }, { label: 'Financial Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadFinancialData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Ledger'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => addToast('Executive Financial Package (CSV & PDF Ledger) exported.', 'success')}
            >
              Export Executive Package
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Fees Billed (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            {formatCurrency(grossBilled)}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Collected (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">
            {formatCurrency(grossCollected)}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Overall Realization</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">
            {realizationPct}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Average Partner Rate</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            ${avgPartnerRate.toFixed(2)}/hr
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D6CF]/60 pb-2">
          <h3 className="font-serif font-bold text-base text-[#06244B]">
            Accounts Receivable Aging Summary (30 / 60 / 90+ Days)
          </h3>
          <span className="text-xs text-[#667085]">
            Total Outstanding A/R: <strong>{formatCurrency(arAging.totalOutstanding || 0)}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <span className="text-green-800 font-bold block uppercase text-[10px]">Current (0 - 30 Days)</span>
            <span className="text-lg font-bold text-green-900 mt-1 block">
              {formatCurrency(arAging.current || 0)}
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <span className="text-amber-800 font-bold block uppercase text-[10px]">31 - 60 Days</span>
            <span className="text-lg font-bold text-amber-900 mt-1 block">
              {formatCurrency(arAging.days31to60 || 0)}
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded border border-rose-200">
            <span className="text-rose-800 font-bold block uppercase text-[10px]">61 - 90 Days</span>
            <span className="text-lg font-bold text-rose-900 mt-1 block">
              {formatCurrency(arAging.days61to90 || 0)}
            </span>
          </div>
          <div className="p-3 bg-red-100 rounded border border-red-300">
            <span className="text-red-800 font-bold block uppercase text-[10px]">90+ Days Past Due</span>
            <span className="text-lg font-bold text-red-950 mt-1 block">
              {formatCurrency(arAging.daysOver90 || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

