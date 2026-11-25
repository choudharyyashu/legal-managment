import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Users
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { matchesPracticeArea } from '../../../data/practiceAreas';

export function LitigationDashboard() {
  const { matters } = useMatters();
  const cases = React.useMemo(() => {
    return (matters || [])
      .filter((m) => matchesPracticeArea(m.practiceAreaId, 'pa-civ') || m.practiceAreaName?.toLowerCase().includes('litigation') || m.isLitigationContested)
      .map((m) => ({
        id: m.id,
        caseNumber: m.matterNumber,
        caseTitle: m.title,
        courtName: m.courtName || '',
        judge: m.judge || '',
        trialDate: m.nextCourtDate ? new Date(m.nextCourtDate).toISOString().split('T')[0] : '',
        tier: m.courtName ? 'District Court' : 'Pre-Trial',
        leadAttorney: m.responsibleAttorneyName || '',
        status: m.status || 'Active',
      }));
  }, [matters]);
  const [activeCase, setActiveCase] = useState(() => cases[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const filteredCases = cases.filter(c =>
    searchQuery === '' ||
    c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.judge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case # & Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#06244B] block">{val}</span>
          <span className="font-semibold text-xs text-[#202A35] block truncate max-w-md">{row.caseTitle}</span>
          <span className="text-[11px] text-[#A4432B] font-semibold">{row.matterType}</span>
        </div>
      ),
    },
    {
      key: 'courtVenue',
      label: 'Court Venue & Judge',
      render: (_, row) => (
        <div className="text-xs">
          <div className="font-semibold text-[#06244B]">{row.judge}</div>
          <div className="text-[11px] text-[#667085] truncate max-w-xs">{row.courtVenue}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Representation Role',
      render: (val) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF]">
          {val}
        </span>
      ),
    },
    {
      key: 'trialDate',
      label: 'Next Trial / Milestone',
      render: (val) => (
        <div className="text-xs">
          <span className="font-bold text-[#06244B] block">{val}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Jury Trial Setting</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Quick Tools',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            icon={FileCheck2}
            onClick={() => {
              setActiveCase(row);
              navigate('/litigation/assessment');
            }}
            className="text-xs"
            title="Issues & Proof Matrix"
          >
            Issues
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Search}
            onClick={() => {
              setActiveCase(row);
              navigate('/litigation/discovery');
            }}
            className="text-xs"
            title="Discovery & Privilege Log"
          >
            Discovery
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={BookOpen}
            onClick={() => {
              setActiveCase(row);
              navigate('/litigation/trial');
            }}
            className="text-xs bg-[#A4432B] hover:bg-[#8B3824]"
            title="Trial Notebook"
          >
            Trial
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Litigation Practice Overview"
        subtitle="Manage civil claims, pleadings, party-specific service, written discovery, and trial notebooks (URCP Rules 1–65A)."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Litigation Workspace' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/litigation/assessment">
              <Button variant="outline" size="sm" icon={FileCheck2}>
                Issues &amp; Proof Matrix
              </Button>
            </Link>
            <Link to="/litigation/pleadings-service">
              <Button variant="outline" size="sm" icon={Send}>
                Party Service Tracker
              </Button>
            </Link>
            <Link to="/litigation/scheduling">
              <Button variant="outline" size="sm" icon={Calendar}>
                Rule 6 Scheduling
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row (Computed strictly from active Litigation matters) */}
      {(() => {
        const discoveryCount = cases.filter((c) => c.status === 'In Discovery').length;
        const trialPrepCount = cases.filter((c) => c.status === 'Trial Prep').length;
        const scheduledCases = [...cases]
          .filter((c) => c.trialDate)
          .sort((a, b) => a.trialDate.localeCompare(b.trialDate));
        const nextTrialCase = scheduledCases[0] || null;
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#D9D6CF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Active Litigation Dockets</span>
              <div className="text-2xl font-bold font-serif text-[#06244B] mt-1">{cases.length} Matters</div>
              <span className="text-[11px] text-emerald-700 font-semibold">Utah Civil &amp; Contested Dockets</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D9D6CF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Trial Preparation</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">{trialPrepCount} Matters</div>
              <span className="text-[11px] text-[#667085]">Active pre-trial dockets</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D9D6CF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">In Discovery</span>
              <div className="text-2xl font-bold text-[#06244B] mt-1">{discoveryCount} Matters</div>
              <span className="text-[11px] text-[#667085]">Active URCP 26 discovery phase</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D9D6CF] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#667085] block">Next Court Appearance</span>
              <div className="text-2xl font-bold text-[#A4432B] mt-1">
                {nextTrialCase ? nextTrialCase.trialDate : 'None Scheduled'}
              </div>
              <span className="text-[11px] text-[#667085] truncate block">
                {nextTrialCase ? nextTrialCase.caseTitle : 'No upcoming hearings on docket'}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Search and Table */}
      <div className="space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by case #, title, or judge..."
        />

        <DataTable
          columns={columns}
          data={filteredCases}
          keyField="id"
          emptyMessage="No litigation matters found."
        />
      </div>
    </div>
  );
}

