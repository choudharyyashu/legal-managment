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

  const handleExportCSV = () => {
    try {
      const headers = [
        'Staff Member',
        'Title',
        'Department',
        'Standard Rate ($/hr)',
        'Logged Hours',
        'Billable Hours',
        'Generated Revenue ($)',
        'Monthly Target (h)',
        'Target Progress (%)'
      ];

      const rows = staffReportData.map(u => [
        `"${u.name.replace(/"/g, '""')}"`,
        `"${(u.title || '').replace(/"/g, '""')}"`,
        `"${(u.department || '').replace(/"/g, '""')}"`,
        u.hourlyRate,
        u.totalHours.toFixed(1),
        u.totalBillable.toFixed(1),
        u.totalFees.toFixed(2),
        u.targetHours,
        `"${u.progress}%"`
      ]);

      const totalLogged = staffReportData.reduce((s, u) => s + u.totalHours, 0).toFixed(1);
      const totalRev = staffReportData.reduce((s, u) => s + u.totalFees, 0).toFixed(2);

      rows.push([
        '"TOTAL FIRM STAFF SUMMARY"',
        '""',
        '""',
        '""',
        totalLogged,
        '""',
        totalRev,
        '""',
        '""'
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `Attorney_Staff_Productivity_Report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Staff productivity report exported successfully as CSV!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export staff report.', 'error');
    }
  };

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
            onClick={handleExportCSV}
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

