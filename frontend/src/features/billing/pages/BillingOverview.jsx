import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Clock,
  DollarSign,
  Receipt,
  FileText,
  Building,
  TrendingUp,
  Database,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTime } from '../../../context/TimeContext';
import { useMatters } from '../../../context/MatterContext';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatCard } from '../../../components/shared/StatCard';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function BillingOverview() {
  const navigate = useNavigate();
  const { timeEntries, expenses, invoices, payments } = useTime();
  const { matters } = useMatters();

  const totalBillableHours = timeEntries.filter(t => t.isBillable).reduce((sum, t) => sum + (t.hours || 0), 0);
  const approvedHours = timeEntries.filter(t => t.status === 'Approved' || t.status === 'Exported').reduce((sum, t) => sum + (t.hours || 0), 0);
  const pendingHours = timeEntries.filter(t => t.status === 'Submitted').reduce((sum, t) => sum + (t.hours || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalCollected = (payments && payments.length > 0)
    ? payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const outstandingInvoices = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  // Dynamic monthly data for past 6 calendar months computed from actual database invoices and payment records
  const monthlyData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const monthInvoices = (invoices || []).filter((inv) => {
        if (!inv.issueDate) return false;
        const invDate = new Date(inv.issueDate);
        return (
          invDate.getFullYear() === year &&
          invDate.getMonth() === monthIndex &&
          inv.status !== 'Draft' &&
          inv.status !== 'Void' &&
          inv.status !== 'Cancelled'
        );
      });

      // Billed: issued invoices in this calendar month
      const billed = monthInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

      // Collections: actual payment receipts recorded in this calendar month using payment.receivedDate
      const monthPayments = (payments || []).filter((p) => {
        if (!p.receivedDate) return false;
        const pDate = new Date(p.receivedDate);
        return pDate.getFullYear() === year && pDate.getMonth() === monthIndex;
      });

      const collected = monthPayments.length > 0
        ? monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        : monthInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);

      months.push({
        month: monthLabel,
        billed: Math.round(billed),
        collected: Math.round(collected),
      });
    }
    return months;
  }, [invoices, payments]);

  // Dynamic practice area billing distribution computed from matters and issued invoices
  const practiceBillingData = React.useMemo(() => {
    const palette = ['#06244B', '#A66A16', '#7B8890', '#A4432B', '#315F8C', '#287A55', '#4B6B94'];
    const matterMap = new Map();
    (matters || []).forEach((m) => {
      matterMap.set(m.id, m.practiceAreaName || m.practiceArea?.name || 'General Practice');
    });

    const revenueByPractice = {};
    (invoices || []).forEach((inv) => {
      if (inv.status === 'Draft' || inv.status === 'Void' || inv.status === 'Cancelled') return;
      const paName = matterMap.get(inv.matterId) || inv.matter?.practiceArea?.name || 'General Practice';
      const amount = Number(inv.totalAmount) || 0;
      revenueByPractice[paName] = (revenueByPractice[paName] || 0) + amount;
    });

    const entries = Object.entries(revenueByPractice);
    if (entries.length === 0) {
      return [];
    }

    return entries
      .map(([name, value], idx) => ({
        name,
        value: Math.round(value),
        color: palette[idx % palette.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [invoices, matters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing &amp; Financial Overview"
        subtitle="Operational legal billing, time realization rates, expense disbursements, and independent double-entry accounting."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Overview' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Database}
              onClick={() => navigate('/billing/cosmolex')}
            >
              CosmoLex Export Bridge
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => navigate('/billing/invoices')}
            >
              Generate Invoices
            </Button>
          </div>
        }
      />

      {/* Accounting Engine Notice */}
      <div className="p-3 bg-[#06244B] text-[#F5F0E5] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-subtle">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#A4432B]" />
          <span><strong>Standalone General Ledger &amp; Accounting Engine:</strong> Native double-entry general ledger and trust account sub-ledgers operate independently under Utah State Bar Rule 1.15 compliance standards.</span>
        </div>
        <span className="text-[10px] text-[#A4432B] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
          Independent GL
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billable Hours"
          value={formatHours(totalBillableHours)}
          subtitle={`${formatHours(approvedHours)} approved for billing`}
          icon={Clock}
          onClick={() => navigate('/billing/hours')}
        />

        <StatCard
          title="Pending Approval"
          value={formatHours(pendingHours)}
          subtitle="Awaiting partner signoff"
          icon={TrendingUp}
          onClick={() => navigate('/time/approvals')}
        />

        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalInvoiced)}
          subtitle={`Collected: ${formatCurrency(totalCollected)}`}
          icon={FileText}
          onClick={() => navigate('/billing/invoices')}
        />

        <StatCard
          title="Ledger Receivables"
          value={formatCurrency(outstandingInvoices)}
          subtitle="Outstanding client balance"
          icon={DollarSign}
          onClick={() => navigate('/billing/invoices')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Billed vs Collected */}
        <div className="lg:col-span-2 bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#06244B]">
                Monthly Billing &amp; Fee Realization
              </h3>
              <p className="text-xs text-[#667085]">Amounts billed vs cash collected (Past 6 Months)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#06244B]" /> Billed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#A4432B]" /> Collected</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D5" />
                <XAxis dataKey="month" stroke="#667085" fontSize={12} tickLine={false} />
                <YAxis stroke="#667085" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val)]}
                  contentStyle={{ backgroundColor: '#06244B', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                />
                <Bar dataKey="billed" fill="#06244B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="#A4432B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Area Distribution */}
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#06244B]">
              Revenue by Practice Area
            </h3>
            <p className="text-xs text-[#667085] mb-4">Year-to-date fees recorded</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            {practiceBillingData.length === 0 || practiceBillingData.every((p) => p.value === 0) ? (
              <div className="text-center text-[#667085] text-xs">
                <p className="font-semibold text-[#06244B]">No Practice Area Invoices</p>
                <p className="text-[11px] mt-0.5">Year-to-date fees will appear as invoices are issued.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={practiceBillingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {practiceBillingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-[#D9D6CF]/50">
            {practiceBillingData.length === 0 || practiceBillingData.every((p) => p.value === 0) ? (
              <p className="text-center text-[11px] text-[#667085]">Zero billed revenue across practice areas.</p>
            ) : (
              practiceBillingData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[#202A35] truncate">{item.name}</span>
                  </span>
                  <span className="font-bold text-[#06244B]">{formatCurrency(item.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/billing/expenses')}
          className="p-4 bg-white rounded border border-[#D9D6CF] hover:border-[#A4432B] transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-[#A4432B]" />
            <div>
              <p className="font-serif font-bold text-sm text-[#06244B]">Matter Expenses</p>
              <p className="text-xs text-[#667085]">{formatCurrency(totalExpenses)} in case disbursements</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#667085]" />
        </div>

        <div
          onClick={() => navigate('/billing/payments')}
          className="p-4 bg-white rounded border border-[#D9D6CF] hover:border-[#A4432B] transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-[#06244B]" />
            <div>
              <p className="font-serif font-bold text-sm text-[#06244B]">Payment Records</p>
              <p className="text-xs text-[#667085]">Wire and trust retainer drawdowns</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#667085]" />
        </div>

        <div
          onClick={() => navigate('/billing/cosmolex')}
          className="p-4 bg-white rounded border border-[#D9D6CF] hover:border-[#A4432B] transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#A4432B]" />
            <div>
              <p className="font-serif font-bold text-sm text-[#06244B]">CosmoLex Export</p>
              <p className="text-xs text-[#667085]">Sync approved billing entries</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#667085]" />
        </div>
      </div>
    </div>
  );
}

