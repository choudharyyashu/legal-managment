import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Briefcase,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Users,
  Search,
  Plus,
  ArrowRight,
  Shield,
  Stethoscope,
  ChevronRight,
  Scale
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { StatCard } from '../../../components/shared/StatCard';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { MOCK_PI_CASES, MOCK_DEMAND_PACKAGES } from '../../../data/mockPersonalInjury';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { mockStorage } from '../../../services/mockStorage';

export function PIDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [activeCaseId, setActiveCaseId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // KPI Calculations
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status !== 'Closed').length;
  const pendingRecords = cases.filter(c => c.awaitingRecords).length;
  const pendingInsurance = cases.filter(c => c.awaitingInsurance).length;
  const demandsInProgress = cases.filter(c => c.status === 'Demand In Progress').length;
  const readyForSettlement = cases.filter(c => c.status === 'Ready for Settlement').length;

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      searchQuery === '' ||
      c.matterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accidentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCase = activeCaseId === 'ALL' || c.id === activeCaseId;
    return matchesSearch && matchesStatus && matchesCase;
  });

  const columns = [
    {
      key: 'matterNumber',
      label: 'Matter #',
      sortable: true,
      render: (val, c) => (
        <span className="inline-block whitespace-nowrap font-semibold text-[#06244B] bg-[#F5F0E5] px-2 py-0.5 rounded text-xs">
          {c?.matterNumber || val || '—'}
        </span>
      ),
    },
    {
      key: 'clientName',
      label: 'Client / Case Title',
      sortable: true,
      render: (val, c) => (
        <div className="min-w-[160px] max-w-[220px]">
          <span
            className="font-bold text-[#06244B] block hover:underline cursor-pointer"
            onClick={() => navigate('/personal-injury/incident-liability')}
          >
            {c?.clientName || val || 'Unnamed Client'}
          </span>
          <span className="text-[11px] text-[#667085] truncate block">{c?.matterTitle || '—'}</span>
        </div>
      ),
    },
    {
      key: 'accidentType',
      label: 'Accident Category',
      render: (val, c) => (
        <span title={c?.accidentType || val} className="text-xs text-slate-700 font-medium truncate block max-w-[150px]">
          {c?.accidentType || val || 'Not Specified'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Stage Status',
      render: (val, c) => <StatusBadge status={c?.status || val || 'Active'} />,
    },
    {
      key: 'medicalBillsTotal',
      label: 'Medical Bills',
      align: 'right',
      sortable: true,
      render: (val, c) => (
        <span className="font-semibold text-slate-900 whitespace-nowrap">
          {formatCurrency(c?.medicalBillsTotal ?? val ?? 0)}
        </span>
      ),
    },
    {
      key: 'targetDemand',
      label: 'Target Demand',
      align: 'right',
      sortable: true,
      render: (val, c) => (
        <span className="font-bold text-[#A4432B] whitespace-nowrap">
          {(c?.targetDemand ?? val) ? formatCurrency(c?.targetDemand ?? val) : 'TBD'}
        </span>
      ),
    },
    {
      key: 'statuteOfLimitations',
      label: 'SoL Bar Date',
      render: (val, c) => (
        <span className="inline-block whitespace-nowrap text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          {c?.statuteOfLimitations || val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, c) => (
        <Button
          size="sm"
          variant="outline"
          className="text-xs py-1"
          onClick={() => {
            if (c?.id) {
              setActiveCaseId(c.id);
            }
            navigate('/personal-injury/settlement-calculator');
          }}
        >
          Calculator
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dedicated PI Navigation Header */}
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={setActiveCaseId}
        cases={cases}
        title="Personal Injury Practice Dashboard"
        subtitle="Active pre-litigation & litigation personal injury caseload, medical treatment pipelines, liability investigations, and settlement milestones."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/personal-injury/incident-liability')}
          >
            New PI Matter
          </Button>
        }
      />

      {/* 6 Key Performance Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard
          title="Total PI Cases"
          value={totalCases}
          subtitle="Utah Jurisdiction"
          icon={Activity}
          className="bg-white"
        />
        <StatCard
          title="Active Cases"
          value={activeCases}
          subtitle="In Active Treatment"
          icon={Briefcase}
          trend={{ value: '100% active', isPositive: true }}
        />
        <StatCard
          title="Pending Med Records"
          value={pendingRecords}
          subtitle="Awaiting Clinics"
          icon={Stethoscope}
          className="border-amber-200"
        />
        <StatCard
          title="Pending Ins. Claims"
          value={pendingInsurance}
          subtitle="Awaiting Carrier"
          icon={Shield}
        />
        <StatCard
          title="Demands In Progress"
          value={demandsInProgress}
          subtitle="Drafting Packages"
          icon={FileText}
        />
        <StatCard
          title="Settlement Pending"
          value={readyForSettlement}
          subtitle="Offers In Review"
          icon={DollarSign}
          trend={{ value: '2 Ready', isPositive: true }}
        />
      </div>

      {/* Case Stage Distribution Visual Progress Bar */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Personal Injury Case Pipeline Distribution
            </h3>
            <p className="text-xs text-[#667085]">
              Active progression from incident intake through medical recovery to final settlement disbursement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Intake (20%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Treatment (40%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Demands (20%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Settlement (20%)</span>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: '20%' }} className="bg-blue-600" title="Intake & Investigation"></div>
          <div style={{ width: '40%' }} className="bg-amber-500" title="Medical Care & Records"></div>
          <div style={{ width: '20%' }} className="bg-indigo-600" title="Demand Preparation"></div>
          <div style={{ width: '20%' }} className="bg-emerald-600" title="Settlement & Liens"></div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Deadlines & Medical Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Statutory Deadlines */}
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9D6CF]">
            <h3 className="font-serif font-bold text-sm text-[#06244B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#A4432B]" />
              Critical Personal Injury Deadlines
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Utah SoL Bar Tracker</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {cases.slice(0, 3).map((c) => (
              <div key={c.id} className="p-2.5 rounded bg-[#F5F0E5]/50 border border-[#D9D6CF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#06244B] block">{c.clientName}</span>
                  <span className="text-[#667085] text-[11px]">{c.matterNumber} • Accident: {c.incidentDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#B42318] font-bold block">{c.statuteOfLimitations}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Statutory Bar Date</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Medical Follow-ups */}
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9D6CF]">
            <h3 className="font-serif font-bold text-sm text-[#06244B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#287A55]" />
              Medical Treatment Follow-up Schedule
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Next 14 Days</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {cases.slice(0, 3).map((c) => (
              <div key={c.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{c.clientName}</span>
                  <span className="text-slate-600 text-[11px]">Next follow-up appointment verification</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#06244B] block">{c.medicalFollowupDue}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Recent PI Matters Table */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Active Personal Injury Caseload Directory
            </h2>
            <p className="text-xs text-[#667085]">
              Comprehensive oversight of all current personal injury client files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Search matter, client, crash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-48 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded border border-[#D9D6CF] bg-white text-slate-700"
            >
              <option value="ALL">All Stages</option>
              <option value="Demand In Progress">Demand In Progress</option>
              <option value="Medical Treatment Ongoing">Medical Treatment Ongoing</option>
              <option value="Ready for Settlement">Ready for Settlement</option>
              <option value="Investigation & Records">Investigation & Records</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCases}
          pageSize={10}
          emptyMessage="No Personal Injury matters match your filter criteria."
        />
      </div>
    </div>
  );
}

