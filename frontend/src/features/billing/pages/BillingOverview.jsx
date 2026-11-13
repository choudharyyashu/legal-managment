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
  const { timeEntries, expenses, invoices } = useTime();
  const { matters } = useMatters();

  const totalBillableHours = timeEntries.filter(t => t.isBillable).reduce((sum, t) => sum + (t.hours || 0), 0);
  const approvedHours = timeEntries.filter(t => t.status === 'Approved' || t.status === 'Exported').reduce((sum, t) => sum + (t.hours || 0), 0);
  const pendingHours = timeEntries.filter(t => t.status === 'Submitted').reduce((sum, t) => sum + (t.hours || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const outstandingInvoices = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  // Chart data
  const monthlyData = [
    { month: 'Jun', billed: 42000, collected: 38000 },
    { month: 'Jul', billed: 48500, collected: 45000 },
    { month: 'Aug', billed: 53000, collected: 50200 },
    { month: 'Sep', billed: 61000, collected: 58000 },
    { month: 'Oct', billed: 68500, collected: 62000 },
    { month: 'Nov', billed: 34500, collected: 25390 },
  ];

  const practiceBillingData = [
    { name: 'Civil Litigation', value: 96500, color: '#06244B' },
    { name: 'Real Estate & Water', value: 68400, color: '#A66A16' },
    { name: 'Commercial Law', value: 37500, color: '#7B8890' },
    { name: 'Family Law', value: 31250, color: '#A4432B' },
    { name: 'Trust & Estates', value: 24000, color: '#315F8C' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing &amp; Financial Overview"
        subtitle="Operational legal billing, time realization rates, expense disbursements, and CosmoLex accounting synchronization."
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

      {/* CosmoLex Notice */}
      <div className="p-3 bg-[#06244B] text-[#F5F0E5] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-subtle">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#A4432B]" />
          <span><strong>CosmoLex Official System Boundary:</strong> CosmoLex remains the authoritative general ledger. Approved time and expenses synchronize via the export bridge.</span>
        </div>
        <span className="text-[10px] text-[#A4432B] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
          Sync Active
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
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-[#D9D6CF]/50">
            {practiceBillingData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#202A35] truncate">{item.name}</span>
                </span>
                <span className="font-bold text-[#06244B]">{formatCurrency(item.value)}</span>
              </div>
            ))}
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

