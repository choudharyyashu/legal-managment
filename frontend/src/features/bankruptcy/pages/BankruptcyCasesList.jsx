import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  Calculator,
  FileText,
  Eye,
  ShieldCheck,
  Download,
  Printer,
  X,
  CheckCircle2,
  ExternalLink,
  Flame,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { Modal } from '../../../components/ui/Modal';
import { MOCK_BANKRUPTCY_CASES } from '../../../data/mockBankruptcyCases';
import { Link } from 'react-router-dom';
import { BankruptcyCaseDrawer } from '../components/BankruptcyCaseDrawer';
import { DebtorIntakeWizardModal } from '../components/DebtorIntakeWizardModal';
import { useToast } from '../../../components/ui/Toast';

export function BankruptcyCasesList() {
  const [cases, setCases] = useState(MOCK_BANKRUPTCY_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEcfModalOpen, setIsEcfModalOpen] = useState(false);
  const [ecfTargetCase, setEcfTargetCase] = useState(null);
  const { addToast } = useToast();

  const handleCreateCaseFromWizard = (newCase) => {
    setCases(prev => [newCase, ...prev]);
    addToast(`Docket ${newCase.caseNumber} initiated for ${newCase.debtorName}!`, 'success');
  };

  const handleUpdateCase = (updated) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCase(updated);
  };

  const handleOpenEcfModal = (caseItem) => {
    setEcfTargetCase(caseItem || cases[0]);
    setIsEcfModalOpen(true);
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      searchQuery === '' ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trusteeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = chapterFilter === '' || c.chapter === chapterFilter;
    return matchesSearch && matchesChapter;
  });

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case # & Debtor',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedCase(row)}
            className="font-mono font-bold text-xs text-[#06244B] hover:text-[#A4432B] hover:underline block text-left"
          >
            {val}
          </button>
          <div className="text-xs font-semibold text-[#202A35]">{row.debtorName}</div>
          {row.jointDebtorName && row.jointDebtorName !== 'None (Individual)' && (
            <div className="text-[11px] text-[#667085]">Joint: {row.jointDebtorName}</div>
          )}
          {row.emergencyFiling && (
            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
              <Flame className="w-2.5 h-2.5" /> 14-Day Emergency Stay
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'chapter',
      label: 'Chapter & Relief',
      sortable: true,
      render: (val, row) => (
        <div>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
              val === 'Chapter 7'
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : val === 'Chapter 13'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-purple-100 text-purple-900 border border-purple-300'
            }`}
          >
            {val}
          </span>
          <div className="text-[11px] text-[#667085] mt-0.5">{row.filingType}</div>
        </div>
      ),
    },
    {
      key: 'courtVenue',
      label: 'Court, Judge & Trustee',
      render: (_, row) => (
        <div className="text-xs">
          <div className="font-semibold text-[#06244B]">{row.assignedJudge}</div>
          <div className="text-[11px] text-[#667085] truncate max-w-xs">{row.trusteeName}</div>
          <div className="text-[10px] text-slate-500">
            {row.districtAndFormDetails?.courtDistrict || 'District of Utah'} • {row.districtAndFormDetails?.courtDivision || 'Salt Lake City Division'}
          </div>
          {row.districtAndFormDetails?.formEdition && (
            <div className="text-[10px] font-mono text-[#06244B]/80">
              {row.districtAndFormDetails.formEdition} (Ver. {row.districtAndFormDetails.lastVerifiedDate})
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'meansTestStatus',
      label: 'Form 122 Means-Test',
      render: (val, row) => (
        <div className="text-xs">
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
              val.includes('Below')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {val}
          </span>
          <div className="text-[11px] text-[#667085] mt-0.5">
            ${row.annualGrossIncome?.toLocaleString()}/yr (HH of {row.householdSize})
          </div>
        </div>
      ),
    },
    {
      key: 'schedulesSummary',
      label: 'Schedules (Assets / Debt)',
      render: (_, row) => (
        <div className="text-xs font-mono">
          <div className="text-emerald-700">Assets: ${row.totalAssets?.toLocaleString()}</div>
          <div className="text-red-700">Debt: ${(row.totalSecuredDebt + row.totalUnsecuredDebt)?.toLocaleString()}</div>
          {row.monthlyPlanPayment && (
            <span className="text-[10px] font-bold text-emerald-700 block">
              ${row.monthlyPlanPayment}/mo ({row.planTermMonths} mos)
            </span>
          )}
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
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => setSelectedCase(row)}
            className="text-xs"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={FileText}
            onClick={() => handleOpenEcfModal(row)}
            className="text-xs text-[#06244B]"
            title="Compile Utah CM/ECF Filing Packet"
          >
            ECF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Watermark Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[DEMO SIMULATION] Bankruptcy Practice Workspace:</strong> Model for Chapter 7, 13, and 11 representation under District of Utah Local Rules &amp; U.S. Trustee Form 122 guidelines.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      {/* Official Court ECF Transmission Notice & Disclaimer Banner */}
      <div className="bg-[#06244B] text-white p-4 rounded-xl shadow-md border-l-4 border-[#A4432B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-amber-300 shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                OFFICIAL COURT CM/ECF TRANSMISSION &amp; COMPLIANCE NOTICE
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                FRBP RULE 1007
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              This module compiles, formats, and validates debtor petitions, Schedules A/B through J, Form 122 Means-Test statements, and raw ASCII Creditor Matrices in strict compliance with the District of Utah Clerk of Court specifications. Direct electronic filing must be submitted through the official court CM/ECF portal by attorney of record.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={() => handleOpenEcfModal(cases[0])}
            style={{ color: '#06244B', backgroundColor: '#FFFFFF' }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#06244B] hover:bg-slate-100 font-bold text-xs shadow-sm transition-all cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4" style={{ color: '#A4432B' }} />
            <span style={{ color: '#06244B' }}>Compile ECF Package</span>
          </button>
        </div>
      </div>

      <PageHeader
        title="Bankruptcy Practice Workspace"
        subtitle="Debtor petitions, Schedules A/B through J ledgers, Means-Test Form 122, and Chapter 13 plan modeling."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Bankruptcy Workspace' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsWizardOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              New Debtor Intake Wizard
            </Button>
            <Link to="/bankruptcy/means-test">
              <Button variant="outline" size="sm" icon={Calculator}>
                Means-Test
              </Button>
            </Link>
            <Link to="/bankruptcy/exemptions">
              <Button variant="outline" size="sm" icon={Landmark}>
                Utah Exemptions
              </Button>
            </Link>
            <Link to="/bankruptcy/plan">
              <Button variant="outline" size="sm" icon={Calculator}>
                Chapter 13 Plan
              </Button>
            </Link>
            <Link to="/bankruptcy/creditor-matrix">
              <Button variant="outline" size="sm" icon={FileText}>
                Creditor Matrix
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Active Dockets</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{cases.length}</span>
          <span className="text-[11px] text-emerald-700 font-medium">District of Utah (Salt Lake City)</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Chapter 7 Liquidations</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">
            {cases.filter(c => c.chapter === 'Chapter 7').length}
          </span>
          <span className="text-[11px] text-[#667085]">Passed Form 122A-1 Median Test</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Chapter 13 Active Plans</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {cases.filter(c => c.chapter === 'Chapter 13').length}
          </span>
          <span className="text-[11px] text-[#667085]">36 &amp; 60 Month Standing Trustee Plans</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Section 341 Hearings</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">2</span>
          <span className="text-[11px] text-amber-800 font-semibold">Scheduled via Zoom Video</span>
        </div>
      </div>

      {/* Unified Executive Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case #, debtor, or trustee..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#A4432B]" />
            <span className="uppercase text-[10px] tracking-wider font-mono">Filters:</span>
          </div>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Chapter: All</option>
            <option value="Chapter 7">Chapter 7</option>
            <option value="Chapter 13">Chapter 13</option>
            <option value="Chapter 11">Chapter 11</option>
          </select>

          {(searchQuery || chapterFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setChapterFilter('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#A4432B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Clear all filters and search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCases}
        keyField="id"
        emptyMessage="No bankruptcy cases found."
      />

      {/* Case Detail & Docket Drawer */}
      <BankruptcyCaseDrawer
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        bankruptcyCase={selectedCase}
        onUpdateCase={handleUpdateCase}
      />

      {/* Structured Debtor Intake & Means-Test 5-Step Wizard */}
      <DebtorIntakeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateCaseFromWizard}
      />

      {/* CM/ECF Electronic Filing Package Compiler Modal */}
      {isEcfModalOpen && ecfTargetCase && (
        <Modal
          isOpen={isEcfModalOpen}
          onClose={() => setIsEcfModalOpen(false)}
          title={`Utah CM/ECF Court Package: ${ecfTargetCase.caseNumber}`}
          subtitle={`Debtor: ${ecfTargetCase.debtorName} • ${ecfTargetCase.chapter}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">FRBP Form Validation Succeeded (0 Errors)</span>
                  <span className="text-[11px] text-emerald-800">
                    All mandatory schedules, Utah exemption statutory citations, and Section 521 certifications verified.
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                READY FOR ECF
              </span>
            </div>

            <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
              <div className="p-3 bg-[#F5F0E5] font-bold text-[#06244B] border-b border-[#D9D6CF] flex justify-between">
                <span>Compiled Filing Documents Index (PDF/A Format)</span>
                <span className="text-[11px] text-[#667085]">District of Utah Local Form Specifications</span>
              </div>
              <div className="divide-y divide-[#D9D6CF]">
                {[
                  { name: 'Official Form 101: Voluntary Petition for Individuals', pages: '8 pages', status: 'Generated & Signed' },
                  { name: 'Schedules A/B through J (Summary of Assets & Liabilities)', pages: '24 pages', status: 'Balanced ($0 variance)' },
                  { name: 'Official Form 122A-1: Chapter 7 Statement of Monthly Income', pages: '4 pages', status: ecfTargetCase.meansTestStatus },
                  { name: '11 U.S.C. § 521 Certificate of Payment Advices & Tax Compliance', pages: '2 pages', status: 'Counsel Verified' },
                  { name: 'District of Utah Creditor Matrix (.txt ASCII Format)', pages: '42 Creditors', status: 'CM/ECF Compliant' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#A4432B]" />
                      <div>
                        <div className="font-semibold text-[#06244B]">{item.name}</div>
                        <div className="text-[10px] text-[#667085]">{item.pages}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1 text-slate-700">
              <div className="font-bold text-[#06244B]">Court Filing Instructions:</div>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                <li>Download compiled package (.zip containing individual PDF/A filings and matrix.txt).</li>
                <li>Log in to <strong>https://ecf.utb.uscourts.gov</strong> using Utah Bar ECF credentials.</li>
                <li>Navigate to <em>Bankruptcy &rarr; Open a Voluntary Petition</em> and enter debtor demographics.</li>
                <li>Upload the generated matrix text file to verify 100% address deliverability.</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEcfModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => {
                  addToast(`ECF Package for ${ecfTargetCase.caseNumber} downloaded successfully!`, 'success');
                  setIsEcfModalOpen(false);
                }}
              >
                Download Compiled Package (.ZIP)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
