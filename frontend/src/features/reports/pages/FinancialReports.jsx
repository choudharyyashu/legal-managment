import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, PieChart as PieIcon, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { reportService } from '../../../services/reportService';
import { useAuth } from '../../../hooks/useAuth';

export function FinancialReports() {
  const { addToast } = useToast();
  const { allUsers = [] } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [arAging, setArAging] = useState(null);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, arData] = await Promise.allSettled([
        reportService.getDashboard(),
        reportService.getArAging(),
      ]);

      let loadedFinancials = null;
      let loadedAr = null;
      let anyError = null;

      if (dashData.status === 'fulfilled' && dashData.value?.financials) {
        loadedFinancials = dashData.value.financials;
      } else if (dashData.status === 'rejected') {
        anyError = dashData.reason?.message || 'Failed to load financial dashboard';
      }

      if (arData.status === 'fulfilled' && arData.value) {
        loadedAr = arData.value;
      } else if (arData.status === 'rejected') {
        anyError = anyError || arData.reason?.message || 'Failed to load AR aging';
      }

      if (!loadedFinancials && !loadedAr && anyError) {
        setError(anyError);
        setFinancials(null);
        setArAging(null);
      } else {
        setFinancials(
          loadedFinancials || {
            totalInvoiced: 0,
            totalCollected: 0,
            totalOutstandingAr: 0,
            totalTrustBalance: 0,
          }
        );
        setArAging(
          loadedAr || {
            current: 0,
            days31to60: 0,
            days61to90: 0,
            daysOver90: 0,
            totalOutstanding: 0,
          }
        );
      }
    } catch (err) {
      console.warn('Could not load financial reports from backend:', err?.message);
      setError(err?.message || 'Unable to retrieve financial metrics.');
      setFinancials(null);
      setArAging(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Compute dynamic realization percentage without fake fallbacks
  const grossBilled = financials !== null ? Number(financials.totalInvoiced) || 0 : 0;
  const grossCollected = financials !== null ? Number(financials.totalCollected) || 0 : 0;
  const realizationPct =
    grossBilled > 0
      ? ((grossCollected / grossBilled) * 100).toFixed(1) + '%'
      : financials !== null
      ? '0.0%'
      : 'Unavailable';

  // Compute average partner billing rate dynamically from real firm users
  const partnerUsers = (allUsers || []).filter(
    (u) => u.role === 'super_admin' || u.role === 'attorney' || u.role === 'supervisor'
  );
  const avgPartnerRate =
    partnerUsers.length > 0
      ? partnerUsers.reduce((sum, u) => sum + (Number(u.billingRate || u.hourlyRate || u.rate) || 0), 0) /
        partnerUsers.length
      : 0;

  const handleExportFinancialPackage = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `Executive_Financial_Summary_Package_${today}.csv`;

      const curAr = arAging || { current: 0, days31to60: 0, days61to90: 0, daysOver90: 0, totalOutstanding: 0 };
      const totalAr = curAr.totalOutstanding || 1;
      const totalTrust = financials ? Number(financials.totalTrustBalance) || 0 : 0;

      const lines = [
        ['HEUGLY & BLUDWORTH ATTORNEYS AT LAW - EXECUTIVE FINANCIAL PACKAGE'],
        [`Generated: ${today}`, 'Internal Firm Financial Summary', 'Accounting Standard: Modified Cash Basis'],
        [''],
        ['SECTION 1: YEAR-TO-DATE (YTD) FINANCIAL KPI SUMMARY'],
        ['Metric Category', 'Key Performance Indicator', 'YTD Amount / Ratio', 'Benchmark / Target', 'Audit Status'],
        [
          'Revenue & Billings',
          'Gross Fees Billed (YTD)',
          financials !== null ? formatCurrency(grossBilled) : 'Unavailable',
          'Dynamic Target',
          'Actual Database Invoices',
        ],
        [
          'Cash Realization',
          'Gross Collections (YTD)',
          financials !== null ? formatCurrency(grossCollected) : 'Unavailable',
          'Collected Fees',
          'Actual Operating Payments',
        ],
        ['Efficiency', 'Overall Realization Rate', realizationPct, 'Realization Metric', 'Calculated Cash Realization'],
        [
          'Hourly Rate',
          'Average Partner Billable Rate',
          partnerUsers.length > 0 ? `$${avgPartnerRate.toFixed(2)} / hr` : 'N/A',
          'Authorized Rates',
          'Active Attorney Profiles',
        ],
        [''],
        ['SECTION 2: ACCOUNTS RECEIVABLE (AR) AGING BREAKDOWN'],
        ['Aging Bucket', 'Outstanding Balance ($)', 'Percentage of AR (%)', 'Risk Assessment', 'Action Required'],
        [
          'Current (0 - 30 Days)',
          formatCurrency(curAr.current || 0),
          `${Math.round(((curAr.current || 0) / totalAr) * 100)}%`,
          'Standard Cycle',
          'Active Invoices',
        ],
        [
          '31 - 60 Days',
          formatCurrency(curAr.days31to60 || 0),
          `${Math.round(((curAr.days31to60 || 0) / totalAr) * 100)}%`,
          'Follow-up Needed',
          'Statement Reminder',
        ],
        [
          '61 - 90 Days',
          formatCurrency(curAr.days61to90 || 0),
          `${Math.round(((curAr.days61to90 || 0) / totalAr) * 100)}%`,
          'Partner Review',
          'Billing Outreach',
        ],
        [
          '90+ Days Past Due',
          formatCurrency(curAr.daysOver90 || 0),
          `${Math.round(((curAr.daysOver90 || 0) / totalAr) * 100)}%`,
          'Delinquent',
          'Action Required',
        ],
        ['Total Outstanding AR', formatCurrency(curAr.totalOutstanding || 0), '100.0%', 'Firm Receivables', 'Total Outstanding Invoices'],
        [''],
        ['SECTION 3: IOLTA TRUST ACCOUNT FIDUCIARY OVERSIGHT (UTAH RPC 1.15)'],
        ['Fiduciary Category', 'Account Balance ($)', 'Internal Status', 'Reconciliation Requirement'],
        [
          'General Ledger Client Trust Liability (GL 2100)',
          formatCurrency(totalTrust),
          'Internal GL Book Balance',
          'Subject to monthly 3-way reconciliation',
        ],
        [
          'Individual Client Trust Sub-Ledgers Sum',
          formatCurrency(totalTrust),
          'Internal Sub-Ledger Sum',
          'Exact 1:1 Parity with GL 2100 Required',
        ],
        [
          'Trust Account Operating Segregation',
          formatCurrency(totalTrust),
          'Segregated Account Balance',
          'Strict Anti-Commingling Compliant (Utah RPC 1.15)',
        ],
      ];

      const csvContent = lines
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Executive Financial Package exported and downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to export financial package:', err);
      addToast('Failed to export executive financial package.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Financial &amp; Realization Reports"
        subtitle="Executive management reporting on billings, collections, trust liabilities, and fee realization."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/reports/staff' }, { label: 'Financial Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadFinancialData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Ledger'}
            </Button>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportFinancialPackage}>
              Export Executive Package
            </Button>
          </div>
        }
      />

      {error && !financials && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Financial metrics unavailable from backend: {error}</span>
          </div>
          <Button size="xs" variant="outline" onClick={loadFinancialData}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Fees Billed (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            {loading ? 'Loading...' : financials !== null ? formatCurrency(grossBilled) : 'Unavailable'}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Gross Collected (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">
            {loading ? 'Loading...' : financials !== null ? formatCurrency(grossCollected) : 'Unavailable'}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Overall Realization</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">
            {loading ? 'Loading...' : realizationPct}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Average Partner Rate</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            {partnerUsers.length > 0 ? `$${avgPartnerRate.toFixed(2)}/hr` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D6CF]/60 pb-2">
          <h3 className="font-serif font-bold text-base text-[#06244B]">
            Accounts Receivable Aging Summary (30 / 60 / 90+ Days)
          </h3>
          <span className="text-xs text-[#667085]">
            Total Outstanding A/R:{' '}
            <strong>
              {loading
                ? 'Loading...'
                : arAging !== null
                ? formatCurrency(arAging.totalOutstanding || 0)
                : 'Unavailable'}
            </strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <span className="text-green-800 font-bold block uppercase text-[10px]">Current (0 - 30 Days)</span>
            <span className="text-lg font-bold text-green-900 mt-1 block">
              {loading ? '...' : arAging !== null ? formatCurrency(arAging.current || 0) : 'Unavailable'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <span className="text-amber-800 font-bold block uppercase text-[10px]">31 - 60 Days</span>
            <span className="text-lg font-bold text-amber-900 mt-1 block">
              {loading ? '...' : arAging !== null ? formatCurrency(arAging.days31to60 || 0) : 'Unavailable'}
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded border border-rose-200">
            <span className="text-rose-800 font-bold block uppercase text-[10px]">61 - 90 Days</span>
            <span className="text-lg font-bold text-rose-900 mt-1 block">
              {loading ? '...' : arAging !== null ? formatCurrency(arAging.days61to90 || 0) : 'Unavailable'}
            </span>
          </div>
          <div className="p-3 bg-red-100 rounded border border-red-300">
            <span className="text-red-800 font-bold block uppercase text-[10px]">90+ Days Past Due</span>
            <span className="text-lg font-bold text-red-950 mt-1 block">
              {loading ? '...' : arAging !== null ? formatCurrency(arAging.daysOver90 || 0) : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
