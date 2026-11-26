import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Filter,
  Calculator,
  FileText,
  Eye,
  ShieldCheck,
  Download,
  CheckCircle2,
  Flame,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Link } from 'react-router-dom';
import { BankruptcyCaseDrawer } from '../components/BankruptcyCaseDrawer';
import { DebtorIntakeWizardModal } from '../components/DebtorIntakeWizardModal';
import { useToast } from '../../../components/ui/Toast';
import { matterService } from '../../../services/matterService';
import { bankruptcyService } from '../../../services/bankruptcyService';
import { createLegalDocumentPdf } from '../../../utils/pdfGenerator';

const formatIsoDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

export function BankruptcyCasesList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEcfModalOpen, setIsEcfModalOpen] = useState(false);
  const [ecfTargetCase, setEcfTargetCase] = useState(null);
  const { addToast } = useToast();

  const loadBankruptcyCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matterService.getMatters({ practiceAreaId: 'pa-bk' });
      const realMatters = Array.isArray(res) ? res : res?.matters || [];

      const enriched = await Promise.all(
        realMatters.map(async (m) => {
          let bk = null;
          try {
            const bkRes = await bankruptcyService.getBankruptcyCase(m.id);
            bk = bkRes?.bankruptcyCase || bkRes || null;
          } catch {
            bk = null;
          }

          const chapter =
            bk?.chapter ||
            (m.title?.includes('13')
              ? 'Chapter 13'
              : m.title?.includes('11')
              ? 'Chapter 11'
              : 'Chapter 7');

          const meeting341Date = formatIsoDate(bk?.meeting341Date);
          const filingDate = formatIsoDate(bk?.filingDate) || formatIsoDate(m.openDate);
          const confirmationDate = formatIsoDate(bk?.confirmationDate);
          const dischargeDate = formatIsoDate(bk?.dischargeDate);
          const monthlyIncome = bk?.monthlyGrossIncome ? Number(bk.monthlyGrossIncome) : 0;

          return {
            id: m.id,
            matterId: m.id,
            caseNumber: bk?.caseNumber || m.matterNumber,
            title: m.title,
            debtorName: m.client?.name || m.clientName || m.title,
            jointDebtorName: bk?.debtorType === 'Joint' ? 'Joint Debtor' : 'None (Individual)',
            chapter,
            filingType:
              chapter === 'Chapter 13'
                ? 'Wage Earner Adjustment'
                : chapter === 'Chapter 11'
                ? 'Reorganization'
                : 'Individual Liquidation',
            status:
              bk?.status ||
              (m.status === 'Active'
                ? 'Pre-Filing'
                : m.status === 'Concluded'
                ? 'Discharged'
                : 'Pending Review'),
            filingDate,
            meeting341Date,
            meeting341Status: meeting341Date ? 'Scheduled' : 'Not Scheduled',
            confirmationDate,
            confirmationHearingDate: confirmationDate,
            dischargeDate,
            trusteeName: bk?.trusteeName || 'Unassigned',
            assignedJudge: bk?.assignedJudge || m.judge || 'Unassigned',
            assignedAttorneyName: m.responsibleAttorney?.name || 'Assigned Counsel',
            assignedParalegalName: 'Bankruptcy Staff',
            householdSize: bk?.householdSize || 1,
            annualGrossIncome: monthlyIncome * 12,
            meansTestStatus: bk?.meansTestStatus || 'Pending Means-Test',
            totalAssets: Number(bk?.totalAssets || 0),
            totalSecuredDebt: Number(bk?.totalSecuredDebt || 0),
            totalUnsecuredDebt: Number(bk?.totalUnsecuredDebt || 0),
            totalPriorityDebt: Number(bk?.totalPriorityDebt || 0),
            creditors: bk?.creditors || [],
            schedulesList: bk?.schedules || [],
            districtAndFormDetails: {
              courtDistrict: bk?.courtDistrict || 'District of Utah',
              courtDivision: bk?.courtDivision || 'Salt Lake City Division',
            },
            notes: bk?.notes || '',
            isRealDbMatter: true,
          };
        })
      );

      setCases(enriched);
      setSelectedCase((prev) => (prev ? enriched.find((c) => c.id === prev.id) || null : null));
      setEcfTargetCase((prev) => (prev ? enriched.find((c) => c.id === prev.id) || enriched[0] || null : null));
    } catch (err) {
      console.warn('Could not load bankruptcy matters from API:', err?.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankruptcyCases();
  }, [loadBankruptcyCases]);

  const metrics = useMemo(() => {
    const activeDockets = cases.length;
    const ch7Count = cases.filter((c) => c.chapter === 'Chapter 7').length;
    const ch13Count = cases.filter((c) => c.chapter === 'Chapter 13').length;
    const hearings341Count = cases.filter((c) => {
      if (Boolean(c.meeting341Date)) return true;
      const meetings = c.postFilingAdmin?.meetings341 || [];
      return meetings.some((mtg) =>
        ['Scheduled', 'Pending', 'Continued'].includes(mtg?.status)
      );
    }).length;

    return {
      activeDockets,
      ch7Count,
      ch13Count,
      hearings341Count,
    };
  }, [cases]);

  const handleCreateCaseFromWizard = async () => {
    await loadBankruptcyCases();
  };

  const handleUpdateCase = (updated) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(updated);
  };

  const handleOpenEcfModal = (caseItem) => {
    setEcfTargetCase(caseItem || cases[0] || null);
    setIsEcfModalOpen(true);
  };

  const handleDownloadEcfPdf = (target) => {
    if (!target) return;
    const creditorCount = target.creditors?.length || 0;
    const scheduleCount = target.schedulesList?.length || 0;
    const totalLiabilities = (target.totalSecuredDebt || 0) + (target.totalUnsecuredDebt || 0) + (target.totalPriorityDebt || 0);

    const lines = [
      'HEUGLY & BLUDWORTH, ATTORNEYS AT LAW',
      'BANKRUPTCY CM/ECF FILING PACKAGE SUMMARY',
      '=========================================================================',
      `Case / Matter Number: ${target.caseNumber}`,
      `Debtor: ${target.debtorName}`,
      `Chapter: ${target.chapter} (${target.filingType || 'Petition'})`,
      `Court Venue: ${target.districtAndFormDetails?.courtDistrict || 'District of Utah'} (${target.districtAndFormDetails?.courtDivision || 'Salt Lake City'})`,
      `Assigned Judge: ${target.assignedJudge || 'Unassigned'}`,
      `Trustee: ${target.trusteeName || 'Unassigned'}`,
      `Section 341 Meeting Date: ${target.meeting341Date || 'Not Scheduled'}`,
      `Means-Test Status: ${target.meansTestStatus || 'Pending Means-Test'}`,
      `Total Assets: $${(target.totalAssets || 0).toLocaleString()}`,
      `Total Scheduled Liabilities: $${totalLiabilities.toLocaleString()}`,
      `Recorded Creditors: ${creditorCount} • Schedule Line Items: ${scheduleCount}`,
      ' ',
      'INCLUDED SUBMISSION CHECKLIST:',
      '- Official Form 101: Voluntary Petition',
      '- Schedules A/B through J (Summary of Assets & Liabilities)',
      '- Form 122 Statement of Current Monthly Income / Means Test',
      '- 11 U.S.C. § 521 Credit Counseling & Payment Advices Verification',
      `- Creditor Mailing Matrix (${creditorCount} recorded creditors)`,
      ' ',
      'NOTE: Counsel verification required prior to direct upload via official court CM/ECF portal.',
    ];

    const pdfBlob = createLegalDocumentPdf({
      title: `CM/ECF Filing Summary - ${target.caseNumber}`,
      draftCode: `BK-ECF-${target.caseNumber}`,
      client: target.debtorName,
      matter: `${target.caseNumber} - ${target.chapter}`,
      attorney: target.assignedAttorneyName || 'Assigned Counsel',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      customBodyLines: lines,
    });

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${target.caseNumber || 'Bankruptcy'}_ECF_Summary.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    addToast(`ECF Summary PDF for ${target.caseNumber} downloaded.`, 'success');
  };

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(q)) ||
      (c.debtorName && c.debtorName.toLowerCase().includes(q)) ||
      (c.trusteeName && c.trusteeName.toLowerCase().includes(q));
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
      label: 'Court, Trustee & 341 Date',
      render: (_, row) => (
        <div className="text-xs">
          <div className="font-semibold text-[#06244B]">{row.assignedJudge || 'Unassigned'}</div>
          <div className="text-[11px] text-[#667085] truncate max-w-xs">
            Trustee: {row.trusteeName || 'Unassigned'}
          </div>
          <div className="text-[10px] text-slate-500">
            {row.districtAndFormDetails?.courtDistrict || 'District of Utah'} •{' '}
            {row.districtAndFormDetails?.courtDivision || 'Salt Lake City Division'}
          </div>
          <div className="text-[10px] font-semibold text-[#A4432B] mt-0.5">
            § 341 Hearing: {row.meeting341Date || 'Not Scheduled'}
          </div>
        </div>
      ),
    },
    {
      key: 'meansTestStatus',
      label: 'Form 122 Means-Test',
      render: (val, row) => {
        const statusText = val || 'Pending Means-Test';
        return (
          <div className="text-xs">
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                statusText.includes('Below')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {statusText}
            </span>
            <div className="text-[11px] text-[#667085] mt-0.5">
              ${(row.annualGrossIncome || 0).toLocaleString()}/yr (HH of {row.householdSize || 1})
            </div>
          </div>
        );
      },
    },
    {
      key: 'schedulesSummary',
      label: 'Schedules (Assets / Debt)',
      render: (_, row) => {
        const totalDebt = (row.totalSecuredDebt || 0) + (row.totalUnsecuredDebt || 0);
        return (
          <div className="text-xs font-mono">
            <div className="text-emerald-700">Assets: ${(row.totalAssets || 0).toLocaleString()}</div>
            <div className="text-red-700">Debt: ${totalDebt.toLocaleString()}</div>
            {row.monthlyPlanPayment && (
              <span className="text-[10px] font-bold text-emerald-700 block">
                ${row.monthlyPlanPayment}/mo ({row.planTermMonths} mos)
              </span>
            )}
          </div>
        );
      },
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
      {/* Live Workspace Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Bankruptcy Practice Workspace:</strong> Counts, schedules, creditors, and Section 341 hearing dates load dynamically from saved Chapter 7, 13, and 11 matters.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          CONNECTED RECORDS
        </span>
      </div>

      {/* Official Court ECF Transmission Notice */}
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
              This module compiles, validates, and packages debtor petitions, Schedules A/B through J, Form 122 Means-Test statements, and Creditor Matrices under District of Utah Clerk of Court specifications. Direct electronic filing must be submitted through the official court CM/ECF portal by counsel of record.
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
          { label: 'Bankruptcy Workspace' },
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

      {/* Metrics Row — Derived strictly from loaded bankruptcy matters & 341 hearings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Active Dockets</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{metrics.activeDockets}</span>
          <span className="text-[11px] text-emerald-700 font-medium">
            {metrics.activeDockets > 0 ? 'Linked to Bankruptcy Matters' : 'No active dockets'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Chapter 7 Liquidations</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{metrics.ch7Count}</span>
          <span className="text-[11px] text-[#667085]">
            {metrics.ch7Count > 0 ? 'Individual & Joint Ch. 7 filings' : 'No Chapter 7 dockets'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Chapter 13 Active Plans</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{metrics.ch13Count}</span>
          <span className="text-[11px] text-[#667085]">
            {metrics.ch13Count > 0 ? '36 & 60 Month Trustee Plans' : 'No Chapter 13 plans'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Section 341 Hearings</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{metrics.hearings341Count}</span>
          <span className="text-[11px] text-[#667085] font-semibold">
            {metrics.hearings341Count > 0
              ? 'Scheduled § 341 Creditor Meetings'
              : 'No 341 hearings scheduled'}
          </span>
        </div>
      </div>

      {/* Unified Executive Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
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
        loading={loading}
        emptyMessage="No bankruptcy cases found. Click 'New Debtor Intake Wizard' to initiate a docket."
      />

      {/* Case Detail & Docket Drawer */}
      <BankruptcyCaseDrawer
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        bankruptcyCase={selectedCase}
        onUpdateCase={handleUpdateCase}
        onRefreshCases={loadBankruptcyCases}
      />

      {/* Structured Debtor Intake & Means-Test 5-Step Wizard */}
      <DebtorIntakeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateCaseFromWizard}
      />

      {/* CM/ECF Electronic Filing Package Compiler Modal */}
      {isEcfModalOpen && (
        <Modal
          isOpen={isEcfModalOpen}
          onClose={() => setIsEcfModalOpen(false)}
          title={
            ecfTargetCase
              ? `Utah CM/ECF Court Package: ${ecfTargetCase.caseNumber}`
              : 'Utah CM/ECF Court Package Compiler'
          }
          subtitle={
            ecfTargetCase
              ? `Debtor: ${ecfTargetCase.debtorName} • ${ecfTargetCase.chapter}`
              : 'Select or create a bankruptcy docket to compile court filing documents'
          }
          maxWidth="max-w-3xl"
        >
          {!ecfTargetCase ? (
            <div className="space-y-4 text-xs text-[#202A35]">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    No Active Bankruptcy Docket Selected
                  </h4>
                  <p className="text-xs text-amber-900 mt-1">
                    CM/ECF filing packages compile schedules, means-test forms, and creditor matrices from a persisted Bankruptcy Matter. Create a new debtor intake docket or select an existing case.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
                <Button variant="outline" size="sm" onClick={() => setIsEcfModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setIsEcfModalOpen(false);
                    setIsWizardOpen(true);
                  }}
                  className="bg-[#A4432B] hover:bg-[#8B3824]"
                >
                  Open Debtor Intake Wizard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[#202A35]">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex flex-wrap items-center justify-between gap-2 text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">CM/ECF Filing Summary Ready</span>
                    <span className="text-[11px] text-emerald-800">
                      Creditors: {ecfTargetCase.creditors?.length || 0} • Schedule Items: {ecfTargetCase.schedulesList?.length || 0} • § 341 Hearing: {ecfTargetCase.meeting341Date || 'Not Scheduled'}
                    </span>
                  </div>
                </div>
                {cases.length > 1 && (
                  <select
                    value={ecfTargetCase.id}
                    onChange={(e) => {
                      const next = cases.find((c) => c.id === e.target.value);
                      if (next) setEcfTargetCase(next);
                    }}
                    className="text-[11px] px-2 py-1 rounded border border-emerald-300 bg-white font-semibold"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} — {c.debtorName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-[#F5F0E5] font-bold text-[#06244B] border-b border-[#D9D6CF] flex justify-between">
                  <span>Compiled Filing Documents Index</span>
                  <span className="text-[11px] text-[#667085]">
                    {ecfTargetCase.districtAndFormDetails?.courtDistrict || 'District of Utah'}
                  </span>
                </div>
                <div className="divide-y divide-[#D9D6CF]">
                  {[
                    {
                      name: 'Official Form 101: Voluntary Petition',
                      meta: ecfTargetCase.chapter,
                      status: ecfTargetCase.status,
                    },
                    {
                      name: 'Schedules A/B through J (Assets & Liabilities)',
                      meta: `${ecfTargetCase.schedulesList?.length || 0} recorded line item(s)`,
                      status: ecfTargetCase.schedulesList?.length > 0 ? 'Recorded' : 'Pending Entries',
                    },
                    {
                      name: 'Form 122 Statement of Monthly Income / Means-Test',
                      meta: `Annualized Income: $${(ecfTargetCase.annualGrossIncome || 0).toLocaleString()}`,
                      status: ecfTargetCase.meansTestStatus || 'Pending Means-Test',
                    },
                    {
                      name: 'Creditor Mailing Matrix',
                      meta: `${ecfTargetCase.creditors?.length || 0} recorded creditor(s)`,
                      status: ecfTargetCase.creditors?.length > 0 ? 'Matrix Populated' : 'No Creditors Added',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A4432B]" />
                        <div>
                          <div className="font-semibold text-[#06244B]">{item.name}</div>
                          <div className="text-[10px] text-[#667085]">{item.meta}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[#06244B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1 text-slate-700">
                <div className="font-bold text-[#06244B]">Court Filing Instructions:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Download compiled CM/ECF package summary (.PDF) for supervising attorney review.</li>
                  <li>Verify Section 341 hearing notice details and complete creditor matrix entries before submission.</li>
                  <li>Submit final electronic petition through the official court CM/ECF portal by counsel of record.</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
                <Button variant="outline" size="sm" onClick={() => setIsEcfModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadEcfPdf(ecfTargetCase)}
                >
                  Download ECF Summary (.PDF)
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
