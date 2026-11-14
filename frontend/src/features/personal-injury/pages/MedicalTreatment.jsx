import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Edit,
  DollarSign,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { MedicalProviderModal } from '../components/MedicalProviderModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { StatCard } from '../../../components/shared/StatCard';
import { MOCK_PI_CASES, MOCK_MEDICAL_PROVIDERS } from '../../../data/mockPersonalInjury';
import { mockStorage } from '../../../services/mockStorage';
import { documentService } from '../../../services/documentService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';

export function MedicalTreatment() {
  const { addToast } = useToast();
  const [cases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [providers, setProviders] = useState(() => mockStorage.get('pi_medical', MOCK_MEDICAL_PROVIDERS));
  const [activeCaseId, setActiveCaseId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProviders = providers.filter((p) => {
    if (!p) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      p.providerName?.toLowerCase().includes(q) ||
      p.providerType?.toLowerCase().includes(q) ||
      p.recordsStatus?.toLowerCase().includes(q);
    const matchesCase = activeCaseId === 'ALL' || p.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  // Calculate overall financial totals across filtered providers
  const totalOriginalBills = filteredProviders.reduce((sum, p) => sum + (p.bills?.originalBill || 0), 0);
  const totalInsurancePaid = filteredProviders.reduce((sum, p) => sum + (p.bills?.insurancePaid || 0), 0);
  const totalOutstanding = filteredProviders.reduce((sum, p) => sum + (p.bills?.outstandingBalance || 0), 0);

  const handleSaveProvider = (savedRecord) => {
    setProviders((prev) => {
      const exists = prev.some((p) => p.id === savedRecord.id);
      let updated;
      if (exists) {
        updated = prev.map((p) => (p.id === savedRecord.id ? savedRecord : p));
        addToast('Medical provider & billing record updated.', 'success');
      } else {
        updated = [savedRecord, ...prev];
        addToast('New medical provider added to treatment ledger.', 'success');
      }
      mockStorage.set('pi_medical', updated);
      return updated;
    });

    // Event-Driven Auto Draft Triggers (Phase 4)
    if (savedRecord.matterId && savedRecord.providerName) {
      // 1. Provider Added Trigger: Document 113 (Records Request) & 112 (Authorization)
      documentService
        .triggerDocumentEvent('pi.provider.added', savedRecord.matterId, {
          providerName: savedRecord.providerName,
          providerType: savedRecord.providerType,
          treatmentDates: savedRecord.dateOfService,
          recordsStatus: savedRecord.recordsStatus,
          requestRecords: true,
          requestAuthorization: true,
        })
        .then((res) => {
          if (res?.draftsCreated?.length > 0) {
            const titles = res.draftsCreated.map((d) => d.title).join(', ');
            addToast(`Auto-drafts created: ${titles}`, 'info');
          }
        })
        .catch(() => {});

      // 2. Incomplete / Deficient Records Trigger: Document 116 (Incomplete Medical Records Follow-up)
      if (
        savedRecord.recordsStatus === 'Deficient / Missing Billing Ledger' ||
        savedRecord.recordsStatus === 'Missing / Overdue' ||
        savedRecord.recordsStatus?.toLowerCase().includes('deficient') ||
        savedRecord.recordsStatus?.toLowerCase().includes('missing') ||
        savedRecord.recordsStatus?.toLowerCase().includes('incomplete')
      ) {
        documentService
          .triggerDocumentEvent('pi.missing.records', savedRecord.matterId, {
            providerName: savedRecord.providerName,
            requestDate: savedRecord.dateOfService,
            daysOverdue: 30,
            outstandingRecords: savedRecord.outstandingRecords
              ? [savedRecord.outstandingRecords]
              : ['Billing Itemized Ledger', 'Operative & Diagnostic Reports'],
            followUpNotes: savedRecord.outstandingRecords || 'Incomplete packet received from provider.',
          })
          .then((res) => {
            if (res?.draftsCreated?.length > 0) {
              addToast(`Incomplete records follow-up created: ${res.draftsCreated[0].title}`, 'warning');
            }
          })
          .catch(() => {});
      }
    }
  };

  const openAddModal = () => {
    setSelectedProvider(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setSelectedProvider(p);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'providerName',
      label: 'Medical Facility & Specialty',
      sortable: true,
      render: (val, p) => (
        <div>
          <span className="font-bold text-[#06244B] flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-[#A4432B]" />
            {p?.providerName || val || 'Not Available'}
          </span>
          <span className="text-[11px] text-[#667085] block">{p?.providerType || 'General Medical'}</span>
        </div>
      ),
    },
    {
      key: 'dateOfService',
      label: 'Dates of Service & Care Status',
      render: (val, p) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {p?.dateOfService || val || 'Not Available'}
          </span>
          <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
            {p?.treatmentStatus || 'Ongoing'}
          </span>
        </div>
      ),
    },
    {
      key: 'recordsStatus',
      label: 'Medical Records Status',
      render: (val, p) => {
        const status = p?.recordsStatus || val || 'Pending Request';
        return (
          <div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                status.includes('Received')
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-xs">
              {p?.authorizations || 'Auth on file'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'originalBill',
      label: 'Original Bill',
      align: 'right',
      sortable: true,
      render: (_, p) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(p?.bills?.originalBill || 0)}
        </span>
      ),
    },
    {
      key: 'insurancePaid',
      label: 'Insurance / PIP Paid',
      align: 'right',
      render: (_, p) => (
        <span className="text-emerald-700 font-medium">
          {formatCurrency(p?.bills?.insurancePaid || 0)}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      label: 'Outstanding Balance',
      align: 'right',
      sortable: true,
      render: (_, p) => (
        <div>
          <span className="font-bold text-[#B42318] block">
            {formatCurrency(p?.bills?.outstandingBalance || 0)}
          </span>
          <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
            {p?.bills?.paymentStatus || 'Pending'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, p) => (
        <Button
          size="sm"
          variant="outline"
          className="text-xs py-1 text-[#06244B]"
          onClick={() => openEditModal(p)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={setActiveCaseId}
        cases={cases}
        title="Medical Treatment &amp; Records Workspace"
        subtitle="Medical provider directory, date-of-service chronologies, HIPAA authorization tracking, certified medical records requests, and master billing ledger."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Add Medical Provider
          </Button>
        }
      />

      {/* Financial Summary Top Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed Medical Charges"
          value={formatCurrency(totalOriginalBills)}
          subtitle={`${filteredProviders.length} Documented Providers`}
          icon={Receipt}
        />
        <StatCard
          title="Insurance / PIP Paid to Date"
          value={formatCurrency(totalInsurancePaid)}
          subtitle="No-Fault & Private Health"
          icon={CheckCircle2}
          trend={{ value: 'Credits Applied', isPositive: true }}
        />
        <StatCard
          title="Remaining Medical Balance / Liens"
          value={formatCurrency(totalOutstanding)}
          subtitle="Subject to Settlement Lien Payoff"
          icon={DollarSign}
          className="border-red-200"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Medical Providers &amp; Treatment Ledger ({filteredProviders.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Every treating hospital, surgeon, physical therapist, and diagnostic imaging clinic.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Search provider, specialty, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-56 sm:w-72"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredProviders}
          pageSize={10}
          emptyMessage="No medical providers found."
        />
      </div>

      {/* Add / Edit Modal */}
      <MedicalProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProvider}
        provider={selectedProvider}
        cases={cases}
      />
    </div>
  );
}

