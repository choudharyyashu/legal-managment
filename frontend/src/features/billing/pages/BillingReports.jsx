import React, { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, Download, Filter, Calendar, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { useToast } from '../../../components/ui/Toast';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';
import { useTime } from '../../../context/TimeContext';
import { useMatters } from '../../../context/MatterContext';
import { reportService } from '../../../services/reportService';

const DEFAULT_PRACTICE_GROUPS = [
  'Civil Litigation & Dispute Resolution',
  'Personal Injury & Wrongful Death',
  'Commercial & Corporate Law',
  'Family Law & Domestic Relations',
  'Immigration & Nationality Law',
  'Bankruptcy & Debtor Relief',
  'Real Estate, Water Rights & Land Use',
  'Estate Planning & Trust Admin',
  'Criminal Defense',
];

export function BillingReports() {
  const { addToast } = useToast();
  const { timeEntries } = useTime();
  const { matters } = useMatters();
  const [loading, setLoading] = useState(false);
  const [financials, setFinancials] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstandingAr: 0,
  });

  const loadFinancials = async () => {
    setLoading(true);
    try {
      const res = await reportService.getDashboard();
      if (res?.financials) {
        setFinancials(res.financials);
      }
    } catch (err) {
      console.warn('Could not load billing financials:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  // Dynamically compute practice area breakdown from live time entries and matters
  const reportRows = useMemo(() => {
    const matterMap = new Map();
    matters.forEach((m) => {
      matterMap.set(m.id, m.practiceAreaName || m.practiceArea || 'Civil Litigation & Dispute Resolution');
    });

    const groupMap = new Map();
    DEFAULT_PRACTICE_GROUPS.forEach((pg) => {
      groupMap.set(pg, { hoursBilled: 0, totalFees: 0, collected: 0 });
    });

    timeEntries.forEach((entry) => {
      const practiceArea = matterMap.get(entry.matterId) || 'Civil Litigation & Dispute Resolution';
      const existing = groupMap.get(practiceArea) || { hoursBilled: 0, totalFees: 0, collected: 0 };
      const hours = Number(entry.hours) || 0;
      const rate = Number(entry.rate) || 500;
      const amount = Number(entry.amount) || hours * rate;

      existing.hoursBilled += hours;
      existing.totalFees += amount;
      if (entry.status === 'Approved' || entry.isBilled) {
        existing.collected += amount;
      }
      groupMap.set(practiceArea, existing);
    });

    return Array.from(groupMap.entries()).map(([practiceArea, data]) => {
      const realization = data.totalFees > 0
        ? ((data.collected / data.totalFees) * 100).toFixed(1) + '%'
        : '100.0%';
      return {
        practiceArea,
        hoursBilled: Number(data.hoursBilled.toFixed(1)),
        totalFees: data.totalFees,
        collected: data.collected,
        realizationRate: realization,
      };
    });
  }, [timeEntries, matters]);

  const totalBilled = Number(financials.totalInvoiced) || 0;
  const totalCollected = Number(financials.totalCollected) || 0;
  const realizationRate = totalBilled > 0
    ? ((totalCollected / totalBilled) * 100).toFixed(1) + '%'
    : '100.0%';

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadFinancials}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Financials'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => addToast('Exporting Billing Summary to CSV/Excel format...', 'info')}
            >
              Export Report (CSV)
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Total Firm Fees Billed (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#06244B] mt-1">
            {formatCurrency(totalBilled)}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Total Collections (YTD)</span>
          <p className="text-2xl font-serif font-bold text-[#287A55] mt-1">
            {formatCurrency(totalCollected)}
          </p>
        </div>
        <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-xs text-[#667085] uppercase font-semibold">Firm Realization Rate</span>
          <p className="text-2xl font-serif font-bold text-[#A4432B] mt-1">
            {realizationRate}
          </p>
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

