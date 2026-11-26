import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Link } from 'react-router-dom';
import { ImmigrationCaseDrawer } from '../components/ImmigrationCaseDrawer';
import { FilingPackageAssemblerModal } from '../components/FilingPackageAssemblerModal';
import { useToast } from '../../../components/ui/Toast';
import { matterService } from '../../../services/matterService';
import { immigrationService } from '../../../services/immigrationService';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';

export function ImmigrationCasesList() {
  const { clients } = useClients();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isAssemblerOpen, setIsAssemblerOpen] = useState(false);
  const [assemblerCase, setAssemblerCase] = useState(null);
  const [creatingCase, setCreatingCase] = useState(false);

  // New Case form state
  const [newClientId, setNewClientId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newPetitioner, setNewPetitioner] = useState('');
  const [newAlienNumber, setNewAlienNumber] = useState('');
  const [newCategory, setNewCategory] = useState('Family-Based Adjustment of Status');
  const [newReceiptNumber, setNewReceiptNumber] = useState('');

  useEffect(() => {
    if (clients.length > 0 && !newClientId) {
      setNewClientId(clients[0].id);
    }
  }, [clients, newClientId]);

  const loadImmigrationCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matterService.getMatters({ practiceAreaId: 'pa-imm' });
      const realMatters = Array.isArray(res) ? res : res?.matters || [];

      const enriched = await Promise.all(
        realMatters.map(async (m) => {
          let imm = null;
          try {
            imm = await immigrationService.getImmigrationCase(m.id);
          } catch {
            imm = null;
          }

          const receipts = Array.isArray(imm?.receipts) ? imm.receipts : [];
          const parties = Array.isArray(imm?.parties) ? imm.parties : [];
          const petitionerParty = parties.find((p) =>
            (p.relationshipRole || '').toLowerCase().includes('petitioner')
          );

          return {
            id: m.id,
            matterId: m.id,
            immigrationCaseId: imm?.id || null,
            title: m.title,
            clientName: m.client?.name || m.clientName || '—',
            matterNumber: m.matterNumber,
            category:
              imm?.visaCategory ||
              (m.title.includes('Naturalization')
                ? 'Naturalization (N-400)'
                : m.title.includes('Employment')
                ? 'Employment-Based'
                : 'Family-Based Adjustment of Status'),
            status: imm?.status || m.status || 'Preparation',
            currentStage: imm?.status || m.currentStage?.stageName || 'Preparation',
            beneficiaryName: imm?.beneficiaryName || m.client?.name || '—',
            petitionerName: petitionerParty?.name || m.client?.name || '—',
            alienNumber: imm?.alienRegistrationNum || '—',
            i94Number: imm?.i94Number || '',
            classOfAdmission: imm?.classOfAdmission || '',
            countryOfCitizenship: imm?.countryOfCitizenship || '',
            receiptNumber: receipts[0]?.receiptNumber || '—',
            serviceCenter: receipts[0]?.serviceCenter || 'Pending Assignment',
            priorityDate: imm?.priorityDate
              ? new Date(imm.priorityDate).toISOString().split('T')[0]
              : m.openDate
              ? new Date(m.openDate).toISOString().split('T')[0]
              : '',
            receipts,
            parties,
            formsRequired: [],
            assignedAttorneyName:
              m.responsibleAttorney?.name || m.responsibleAttorneyName || 'Assigned Counsel',
            isRealDbMatter: true,
          };
        })
      );

      setCases(enriched);
    } catch (err) {
      console.warn('Could not load immigration matters from API:', err?.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImmigrationCases();
  }, [loadImmigrationCases]);

  // Compute real metrics strictly from loaded matters & USCIS receipt records (zero hardcoded counts)
  const metrics = useMemo(() => {
    const allReceipts = cases.flatMap((c) => c.receipts || []);
    const pendingReceipts = allReceipts.filter((r) => {
      const st = (r.currentStatus || '').toLowerCase();
      return !st.includes('approved') && !st.includes('closed') && !st.includes('denied');
    });

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const rfeDueSoon = allReceipts.filter((r) => {
      if (!r.rfeDueDate) return false;
      const d = new Date(r.rfeDueDate);
      return !isNaN(d.getTime()) && d <= in30Days;
    });

    const scheduledInterviews = allReceipts.filter((r) => Boolean(r.interviewDate));

    return {
      activePetitions: cases.length,
      pendingReceiptsCount: pendingReceipts.length,
      rfeDueCount: rfeDueSoon.length,
      rfeHighlight: rfeDueSoon[0]?.receiptNumber || 'No active RFEs',
      interviewsCount: scheduledInterviews.length,
      nextInterviewHighlight: scheduledInterviews[0]?.interviewDate
        ? new Date(scheduledInterviews[0].interviewDate).toLocaleDateString()
        : 'No upcoming interviews',
    };
  }, [cases]);

  const handleOpenAssembler = (caseItem = null) => {
    setAssemblerCase(caseItem || cases[0] || null);
    setIsAssemblerOpen(true);
  };

  const handlePackageCleared = (caseId, attorneyName) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            filingPackage: {
              ...c.filingPackage,
              status: 'Attorney Cleared for Filing ✓',
              clearedByAttorney: true,
              clearedAt: new Date().toISOString(),
              clearingAttorney: attorneyName,
            },
          };
        }
        return c;
      })
    );
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBeneficiary.trim()) {
      addToast('Please enter petition title and beneficiary name.', 'error');
      return;
    }

    const clientId = newClientId || clients[0]?.id;
    const attorneyId = currentUser?.id;
    if (!clientId || !attorneyId) {
      addToast('An active client record and signed-in counsel are required to create a matter.', 'error');
      return;
    }

    setCreatingCase(true);
    try {
      const createdMatter = await matterService.createMatter({
        title: newTitle.trim(),
        clientId,
        practiceAreaId: 'pa-imm',
        responsibleAttorneyId: attorneyId,
        billingType: 'Flat Fee',
        flatFeeAmount: 0,
        status: 'Active',
        openDate: new Date().toISOString().split('T')[0],
      });

      await immigrationService.saveImmigrationCase(createdMatter.id, {
        visaCategory: newCategory,
        beneficiaryName: newBeneficiary.trim(),
        alienRegistrationNum: newAlienNumber.trim() || undefined,
        status: 'Preparation',
      });

      if (newPetitioner.trim()) {
        await immigrationService.createParty(createdMatter.id, {
          name: newPetitioner.trim(),
          relationshipRole: 'Petitioner',
        });
      }

      if (newReceiptNumber.trim()) {
        await immigrationService.createReceipt(createdMatter.id, {
          receiptNumber: newReceiptNumber.trim().toUpperCase(),
          formType: 'I-130',
          filingDate: new Date().toISOString().split('T')[0],
          currentStatus: 'Case Was Received',
        });
      }

      addToast(`Immigration matter ${createdMatter.matterNumber} created and persisted.`, 'success');
      setIsAddCaseOpen(false);
      setNewTitle('');
      setNewBeneficiary('');
      setNewPetitioner('');
      setNewAlienNumber('');
      setNewReceiptNumber('');
      await loadImmigrationCases();
    } catch (err) {
      addToast(err?.message || 'Failed to create immigration petition.', 'error');
    } finally {
      setCreatingCase(false);
    }
  };

  const handleUpdateCase = (updated) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(updated);
  };

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.beneficiaryName && c.beneficiaryName.toLowerCase().includes(q)) ||
      (c.alienNumber && c.alienNumber.toLowerCase().includes(q)) ||
      (c.receiptNumber && c.receiptNumber.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === '' || c.category === categoryFilter;
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      key: 'matterNumber',
      label: 'Case # & Beneficiary',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedCase(row)}
            className="font-bold text-xs text-[#06244B] hover:text-[#A4432B] text-left block"
          >
            {val}
          </button>
          <span className="font-semibold text-sm text-[#06244B] block">{row.beneficiaryName}</span>
          <span className="text-[11px] text-[#667085] block font-mono">{row.alienNumber}</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Petition Type & Category',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedCase(row)}
            className="font-medium text-xs text-[#06244B] hover:text-[#A4432B] text-left block"
          >
            {val}
          </button>
          <span className="text-[11px] text-[#A4432B] font-semibold">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'petitionerName',
      label: 'Petitioner / Sponsor',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35] font-medium">{val}</span>,
    },
    {
      key: 'receiptNumber',
      label: 'USCIS Receipt #',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-[#06244B] block">{val}</span>
          <span className="text-[10px] text-[#667085]">{row.serviceCenter}</span>
        </div>
      ),
    },
    {
      key: 'currentStage',
      label: 'Stage & Clearance',
      render: (val, row) => (
        <div>
          <span className="text-xs font-medium text-[#06244B] bg-[#F5F0E5] px-2 py-0.5 rounded border border-[#D9D6CF] inline-block">
            {val}
          </span>
          {row.filingPackage?.clearedByAttorney ? (
            <span className="block text-[10px] font-bold text-emerald-700 mt-0.5">
              Attorney Cleared ✓
            </span>
          ) : (
            <span className="block text-[10px] text-amber-700 font-medium mt-0.5">
              Assembly in Progress
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
            icon={Layers}
            onClick={() => handleOpenAssembler(row)}
            className="text-xs text-[#A4432B] font-semibold hover:bg-amber-50"
            title="Open Multi-Form Auto-Fill Package"
          >
            Auto-Fill
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Workspace Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Immigration Matter &amp; Form Studio Workspace:</strong> Counts and case records query live immigration matters, receipts, and participants. Prepared packets require attorney clearance before external USCIS filing.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          CONNECTED RECORDS
        </span>
      </div>

      {/* Multi-Form Auto-Fill Feature Banner */}
      <div className="bg-[#06244B] text-white p-4 rounded-xl shadow-md border-l-4 border-[#A4432B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-amber-300 shrink-0 mt-0.5">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm tracking-wide text-white">
                DOCKETWISE MULTI-FORM AUTO-FILL &amp; FILING ASSEMBLY ENGINE
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                8 CFR § 245.2
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Eliminate repetitive data entry across Form G-28, Form I-130, Form I-485, Form I-765, and Form I-864. Enter client questionnaire data once to populate case records, indexed exhibits, fee summaries, and downloadable filing packages.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={() => handleOpenAssembler(cases[0])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#06244B] hover:bg-slate-100 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#A4432B]" />
            <span>Launch Multi-Form Studio</span>
          </button>
        </div>
      </div>

      <PageHeader
        title="Immigration Practice Workspace"
        subtitle="Family-based petitions, employment visas, removal defense, and USCIS receipt tracking."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Immigration Workspace' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddCaseOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              New Petition
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Layers}
              onClick={() => handleOpenAssembler(cases[0])}
            >
              Auto-Fill Studio
            </Button>
            <Link to="/immigration/receipts">
              <Button variant="outline" size="sm" icon={Search}>
                Receipt Tracker
              </Button>
            </Link>
            <Link to="/immigration/forms">
              <Button variant="outline" size="sm" icon={FileText}>
                Form Library
              </Button>
            </Link>
            <Link to="/immigration/questionnaires">
              <Button variant="outline" size="sm" icon={Globe}>
                Bilingual Intake
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row — Derived strictly from loaded matters & receipt records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Active Petitions</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{metrics.activePetitions}</span>
          <span className="text-[11px] text-emerald-700 font-medium">
            {metrics.activePetitions > 0 ? 'Linked to Immigration Matters' : 'No active petitions'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Pending USCIS Receipts</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{metrics.pendingReceiptsCount}</span>
          <span className="text-[11px] text-[#667085]">
            {metrics.pendingReceiptsCount > 0 ? 'Active receipt filings tracked' : 'No pending receipts'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">RFEs Due &lt;30 Days</span>
          <span className="text-2xl font-bold text-red-700 mt-1 block">{metrics.rfeDueCount}</span>
          <span className="text-[11px] text-[#667085] font-medium">{metrics.rfeHighlight}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Scheduled Interviews</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{metrics.interviewsCount}</span>
          <span className="text-[11px] text-[#667085] font-medium">{metrics.nextInterviewHighlight}</span>
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
            placeholder="Search by beneficiary, A-Number, or receipt..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#A4432B]" />
            <span className="uppercase text-[10px] tracking-wider font-mono">Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Category: All</option>
            <option value="Family-Based Adjustment of Status">Family-Based Adjustment</option>
            <option value="Employment-Based">Employment-Based</option>
            <option value="Non-Immigrant Employment">Non-Immigrant (H-1B)</option>
            <option value="Humanitarian / Asylum">Asylum</option>
            <option value="Naturalization (N-400)">Naturalization (N-400)</option>
            <option value="Immigration Court Defense">EOIR Court Defense</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Status: All</option>
            <option value="Preparation">Preparation</option>
            <option value="In Progress">In Progress</option>
            <option value="RFE Issued">RFE Issued</option>
            <option value="Approved">Approved</option>
          </select>

          {(searchQuery || categoryFilter || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setStatusFilter('');
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

      {/* Cases Table */}
      <DataTable
        columns={columns}
        data={filteredCases}
        keyField="id"
        loading={loading}
        emptyMessage="No immigration cases found. Click 'New Petition' to create an immigration matter."
      />

      {/* Case Management Drawer */}
      {selectedCase && (
        <ImmigrationCaseDrawer
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          immigrationCase={selectedCase}
          onUpdateCase={handleUpdateCase}
        />
      )}

      {/* Filing Package Assembler & Multi-Form Auto-Fill Modal (Always opens visibly when triggered) */}
      <FilingPackageAssemblerModal
        isOpen={isAssemblerOpen}
        onClose={() => setIsAssemblerOpen(false)}
        immigrationCase={assemblerCase}
        cases={cases}
        onSelectCase={(selected) => setAssemblerCase(selected)}
        onOpenCreatePetition={() => {
          setIsAssemblerOpen(false);
          setIsAddCaseOpen(true);
        }}
        onCaseSaved={loadImmigrationCases}
        onPackageCleared={handlePackageCleared}
      />

      {/* New Immigration Petition Modal */}
      <Modal
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        title="Initiate New Immigration Petition Docket"
        subtitle="Creates a persisted Immigration Matter and linked USCIS case record"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Client Record *
            </label>
            <select
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="">Select Client...</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.clientNumber || cl.id} — {cl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Petition Title / Proceeding Description"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Form I-130 / I-485 Immediate Relative Adjustment"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Beneficiary Full Legal Name"
                value={newBeneficiary}
                onChange={(e) => setNewBeneficiary(e.target.value)}
                placeholder="Foreign National Applicant"
                required
              />
            </div>
            <div>
              <Input
                label="Petitioner / Qualifying Sponsor"
                value={newPetitioner}
                onChange={(e) => setNewPetitioner(e.target.value)}
                placeholder="U.S. Citizen / Employer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Immigration Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                <option value="Family-Based Adjustment of Status">Family-Based Adjustment (I-130/I-485)</option>
                <option value="Employment-Based">Employment-Based (EB-1, EB-2 NIW, EB-3)</option>
                <option value="Non-Immigrant Employment">Non-Immigrant Work Visa (H-1B, L-1, O-1)</option>
                <option value="Humanitarian / Asylum">Affirmative Asylum (I-589)</option>
                <option value="Naturalization (N-400)">Naturalization (N-400)</option>
                <option value="Immigration Court Defense">EOIR Removal Defense (EOIR-42B)</option>
              </select>
            </div>
            <div>
              <Input
                label="Alien Registration Number (A-Number)"
                value={newAlienNumber}
                onChange={(e) => setNewAlienNumber(e.target.value)}
                placeholder="A-###-###-### (if assigned)"
              />
            </div>
          </div>

          <div>
            <Input
              label="USCIS Receipt Number (if issued)"
              value={newReceiptNumber}
              onChange={(e) => setNewReceiptNumber(e.target.value)}
              placeholder="e.g. LIN2690012345 (Optional)"
            />
          </div>

          <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={creatingCase}>
              {creatingCase ? 'Creating...' : 'Create Petition Docket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
