import React, { useState } from 'react';
import { Users, FileSpreadsheet, Download, Filter, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTime } from '../../../context/TimeContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';

export function StaffReports() {
  const { allUsers } = useAuth();
  const { timeEntries } = useTime();
  const { addToast } = useToast();

  const staffReportData = allUsers.map(user => {
    const userEntries = timeEntries.filter(t => t.userId === user.id);
    const totalHours = userEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
    const totalBillable = userEntries.filter(e => e.isBillable).reduce((sum, e) => sum + (e.hours || 0), 0);
    const totalFees = userEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const targetHours = user.role === 'attorney' || user.role === 'super_admin' ? 160 : 140;
    const progress = Math.min(100, Math.round((totalHours / targetHours) * 100));

    return {
      id: user.id,
      name: user.name,
      title: user.title,
      department: user.department,
      hourlyRate: user.rate,
      totalHours,
      totalBillable,
      totalFees,
      targetHours,
      progress,
    };
  });

  const columns = [
    {
      key: 'name',
      label: 'Attorney / Staff Member',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-serif font-bold text-sm text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.title} • {row.department}</span>
        </div>
      ),
    },
    {
      key: 'hourlyRate',
      label: 'Standard Rate',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">${val}/hr</span>,
    },
    {
      key: 'totalHours',
      label: 'Logged Hours',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#A4432B]">{formatHours(val)}</span>,
    },
    {
      key: 'totalFees',
      label: 'Generated Revenue',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#287A55]">{formatCurrency(val)}</span>,
    },
    {
      key: 'progress',
      label: 'Monthly Target Progress',
      align: 'right',
      render: (val, row) => (
        <div className="w-32 ml-auto text-right">
          <span className="text-[11px] font-bold text-[#06244B]">{val}% ({row.totalHours} / {row.targetHours}h)</span>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#A4432B] h-full" style={{ width: `${val}%` }} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attorney &amp; Staff Productivity Reports"
        subtitle="Individual billable hour performance, realization vs targets, and practice department generation."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/reports/staff' }, { label: 'Staff Reports' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => addToast('Exporting Staff Productivity Report to CSV...', 'info')}
          >
            Export CSV
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={staffReportData}
        pageSize={10}
      />
    </div>
  );
}

