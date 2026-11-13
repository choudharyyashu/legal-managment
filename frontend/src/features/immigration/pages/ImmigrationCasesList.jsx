import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Layers,
  ShieldCheck,
  Printer,
  Download,
  Award,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_IMMIGRATION_CASES } from '../../../data/mockImmigrationCases';
import { formatDate } from '../../../utils/formatDate';
import { Link } from 'react-router-dom';
import { ImmigrationCaseDrawer } from '../components/ImmigrationCaseDrawer';
import { FilingPackageAssemblerModal } from '../components/FilingPackageAssemblerModal';
import { useToast } from '../../../components/ui/Toast';
import { matterService } from '../../../services/matterService';

export function ImmigrationCasesList() {
  const [cases, setCases] = useState(MOCK_IMMIGRATION_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isAssemblerOpen, setIsAssemblerOpen] = useState(false);
  const [assemblerCase, setAssemblerCase] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    matterService.getMatters({ practiceAreaId: 'pa-imm' })
      .then((res) => {
        const realMatters = Array.isArray(res) ? res : (res?.matters || []);
        if (isMounted && realMatters.length > 0) {
          const mapped = realMatters.map((m) => ({
            id: m.id,
            title: m.title,
            clientName: m.client?.name || m.clientName || 'Elena Rostova',
            matterNumber: m.matterNumber,
            category: m.title.includes('Naturalization') ? 'Naturalization (N-400)' : (m.title.includes('Employment') ? 'Employment-Based' : 'Family-Based Adjustment of Status'),
            status: m.status === 'Active' ? 'Pending USCIS Review' : (m.status === 'Concluded' ? 'Approved' : 'Document Collection'),
            alienNumber: 'A-214-890-412',
            receiptNumber: 'IOE-092-418-9201',
            priorityDate: m.openDate ? new Date(m.openDate).toISOString().split('T')[0] : '2026-11-13',
            formsRequired: ['I-130', 'I-485', 'I-864'],
            assignedAttorney: m.responsibleAttorney?.name || 'Eleanor Heugly, Esq.',
            isRealDbMatter: true,
            matterId: m.id,
          }));
          setCases(mapped);
        }
      })
      .catch((err) => console.warn('Could not load immigration matters from API:', err?.message));
    return () => { isMounted = false; };
  }, []);

  // New Case form state
  const [newTitle, setNewTitle] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newPetitioner, setNewPetitioner] = useState('');
  const [newAlienNumber, setNewAlienNumber] = useState('');
  const [newCategory, setNewCategory] = useState('Family-Based Adjustment of Status');
  const [newReceiptNumber, setNewReceiptNumber] = useState('');

  const handleOpenAssembler = (caseItem) => {
    setAssemblerCase(caseItem || cases[0]);
    setIsAssemblerOpen(true);
  };

  const handlePackageCleared = (caseId, attorneyName) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          filingPackage: {
            ...c.filingPackage,
            status: 'Attorney Cleared for Filing ✓',
            clearedByAttorney: true,
            clearedAt: new Date().toISOString(),
            clearingAttorney: attorneyName
          }
        };
      }
      return c;
    }));
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newTitle || !newBeneficiary) {
      addToast('Please enter petition title and beneficiary name.', 'error');
      return;
    }

    const created = {
      id: `IMM-2026-00${cases.length + 1}`,
      matterNumber: `IMM-2026-00${cases.length + 1}`,
      title: newTitle,
      category: newCategory,
      petitionType: newCategory,
      petitionerName: newPetitioner || 'Self-Petitioning',
      beneficiaryName: newBeneficiary,
      alienNumber: newAlienNumber || 'Pending A-Number',
      receiptNumber: newReceiptNumber || `IOE-26-900-${Math.floor(10000 + Math.random() * 90000)}`,
      priorityDate: new Date().toISOString().split('T')[0],
      currentStage: 'Filing Package Prepared',
      serviceCenter: 'Nebraska Service Center (LIN)',
      filingDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      assignedAttorneyId: 'usr-3',
      assignedAttorneyName: 'Sarah Jenkins, Esq.',
      assignedParalegalId: 'usr-4',
      assignedParalegalName: 'Marcus Vance',
      notes: 'Newly initiated immigration matter docket.',
      travelHistory: [],
      evidenceChecklist: [
        { id: 'ev-init-1', category: 'Civil Document', title: 'Certified Birth Certificate', status: 'Pending Review', file: null, required: true },
        { id: 'ev-init-2', category: 'Legal Appearance', title: 'Executed Form G-28 Appearance of Counsel', status: 'Verified & Admitted', file: 'g28_executed.pdf', required: true }
      ],
      filingPackage: {
        status: 'Paralegal Drafting',
        packageId: `PKG-IMM-2026-0${cases.length + 1}`,
        clearedByAttorney: false,
        exhibitTabs: [
          { tab: 'Tab A', title: 'Form G-28 Notice of Entry of Appearance' },
          { tab: 'Tab B', title: 'Immigration Petitions & Exhibits' }
        ]
      }
    };

    setCases(prev => [created, ...prev]);
    addToast(`Immigration matter ${created.matterNumber} created successfully!`, 'success');
    setIsAddCaseOpen(false);
    setNewTitle('');
    setNewBeneficiary('');
    setNewPetitioner('');
    setNewAlienNumber('');
  };

  const handleUpdateCase = (updated) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCase(updated);
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alienNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
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
      {/* Disclaimer banner */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[DEMO SIMULATION] Specialty Practice Workspace:</strong> Immigration Management prototype modeled after Docketwise. All USCIS receipt tracking, A-numbers, and filing packages operate strictly client-side.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      {/* Multi-Form Auto-Fill Feature Banner */}
      <div className="bg-[#06244B] text-white p-4 rounded-xl shadow-md border-l-4 border-[#A4432B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-amber-300 shrink-0 mt-0.5">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                DOCKETWISE MULTI-FORM AUTO-FILL &amp; FILING ASSEMBLY ENGINE
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                8 CFR § 245.2
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Eliminate repetitive data entry across Form G-28, Form I-130, Form I-485, Form I-765, and Form I-864. Enter client questionnaire data once to simultaneously generate compliant USCIS forms, 7-tab indexed exhibit binders, fee check vouchers ($1,975), and attorney clearance cover letters.
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
        subtitle="Family-based petitions, employment visas, removal defense, and USCIS receipt tracking (Docketwise Model)."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Immigration Workspace' }
        ]}
        actions={
          <div className="flex items-center gap-2">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Active Petitions</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{cases.length}</span>
          <span className="text-[11px] text-emerald-700 font-medium">Family, Employment &amp; Court Defense</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Pending USCIS Receipts</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">5</span>
          <span className="text-[11px] text-[#667085]">Nebraska, Texas &amp; Vermont Centers</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">RFEs Due &lt;30 Days</span>
          <span className="text-2xl font-bold text-red-700 mt-1 block">1</span>
          <span className="text-[11px] text-red-600 font-semibold">Dr. Klaus Richter (EB-2 NIW)</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Naturalization Interviews</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">1</span>
          <span className="text-[11px] text-emerald-700 font-medium">Nov 24 (Fatima Al-Mansoor)</span>
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
            placeholder="Search by beneficiary, A-Number, or receipt..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Category: All</option>
            <option value="Family-Based Adjustment of Status">Family-Based Adjustment</option>
            <option value="Employment-Based Immigrant">Employment-Based</option>
            <option value="Non-Immigrant Employment">Non-Immigrant (H-1B)</option>
            <option value="Humanitarian / Asylum">Asylum</option>
            <option value="Naturalization">Naturalization (N-400)</option>
            <option value="Immigration Court Defense">EOIR Court Defense</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Status: All</option>
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
        emptyMessage="No immigration cases found matching your criteria."
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

      {/* Filing Package Assembler & Multi-Form Auto-Fill Modal */}
      {isAssemblerOpen && assemblerCase && (
        <FilingPackageAssemblerModal
          isOpen={isAssemblerOpen}
          onClose={() => setIsAssemblerOpen(false)}
          immigrationCase={assemblerCase}
          onPackageCleared={handlePackageCleared}
        />
      )}

      {/* New Immigration Petition Modal */}
      <Modal
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        title="Initiate New Immigration Petition Docket"
        subtitle="Open new family, employment, or defense case file"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
          <div>
            <Input
              label="Petition Title / Proceeding Description"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Maria Santos: Form I-130 / I-485 Immediate Relative Adjustment"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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
                <option value="Employment-Based Immigrant">Employment-Based (EB-1, EB-2 NIW, EB-3)</option>
                <option value="Non-Immigrant Employment">Non-Immigrant Work Visa (H-1B, L-1, O-1)</option>
                <option value="Humanitarian / Asylum">Affirmative Asylum (I-589)</option>
                <option value="Naturalization">Naturalization (N-400)</option>
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
              placeholder="e.g. LIN-26-900-##### (Optional)"
            />
          </div>

          <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Create Petition Docket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
