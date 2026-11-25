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
  Receipt,
  FileCheck2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { MedicalProviderModal } from '../components/MedicalProviderModal';
import { RecordSignatureModal } from '../components/RecordSignatureModal';
import { UpdateRequestStatusModal } from '../components/UpdateRequestStatusModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { StatCard } from '../../../components/shared/StatCard';
import { piService } from '../../../services/piService';
import { documentService } from '../../../services/documentService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { matchesPracticeArea } from '../../../data/practiceAreas';

export function MedicalTreatment() {
  const { addToast } = useToast();
  const { matters, activeMatter, setActiveMatter } = useMatters();
  const cases = React.useMemo(() => {
    return (matters || []).filter(
      (m) =>
        matchesPracticeArea(m.practiceAreaId, 'pa-pi') ||
        m.practiceArea?.code === 'PI' ||
        m.practiceAreaName?.toLowerCase().includes('personal injury') ||
        m.matterNumber?.toUpperCase().includes('-PI-')
    );
  }, [matters]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || (cases[0]?.id || 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetProviderForModal, setTargetProviderForModal] = useState(null);

  const handleOpenSignatureModal = (provider) => {
    setTargetProviderForModal(provider);
    setIsSignatureModalOpen(true);
  };

  const handleOpenStatusModal = (provider) => {
    setTargetProviderForModal(provider);
    setIsStatusModalOpen(true);
  };

  const handleProviderUpdated = (updatedProvider) => {
    setProviders((prev) => {
      return prev.map((p) =>
        p.id === updatedProvider.id ? { ...p, ...updatedProvider } : p
      );
    });
  };

  React.useEffect(() => {
    if (activeMatter?.id) {
      setActiveCaseId(activeMatter.id);
    }
  }, [activeMatter?.id]);

  React.useEffect(() => {
    let isMounted = true;
    if (activeCaseId && activeCaseId !== 'ALL') {
      setLoading(true);
      piService.getProviders(activeCaseId)
        .then((res) => {
          if (isMounted) {
            const list = Array.isArray(res) ? res : (res?.providers || (res ? [res] : []));
            setProviders(list);
          }
        })
        .catch((err) => {
          console.warn('Could not load medical providers from API:', err?.message);
          if (isMounted) setProviders([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setProviders([]);
    }
    return () => { isMounted = false; };
  }, [activeCaseId]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

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

  const handleSaveProvider = async (savedRecord) => {
    try {
      if (savedRecord.matterId) {
        await piService.addProvider(savedRecord.matterId, savedRecord);
      }
      setProviders((prev) => {
        const exists = prev.some((p) => p.id === savedRecord.id);
        if (exists) {
          return prev.map((p) => (p.id === savedRecord.id ? savedRecord : p));
        } else {
          return [savedRecord, ...prev];
        }
      });
      addToast('Medical provider & billing record saved to database.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to save medical provider.', 'error');
    }

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
      label: 'Medical Records Request & Auth (112/113)',
      render: (val, p) => {
        const status = p?.recordsStatus || val || 'Drafted';
        const isSigned = Boolean(
          p?.authorizationSigned ||
            p?.authorizations?.toLowerCase().includes('signed')
        );
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                  status.includes('Received')
                    ? 'bg-emerald-100 text-emerald-800'
                    : status.includes('Sent')
                    ? 'bg-blue-100 text-blue-800'
                    : status.includes('Ready')
                    ? 'bg-purple-100 text-purple-800'
                    : status.includes('Incomplete')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status}
              </span>
              <button
                type="button"
                onClick={() => handleOpenStatusModal(p)}
                className="text-[10px] text-[#06244B] hover:text-[#A4432B] font-semibold underline cursor-pointer"
                title="Update Document 113 records request lifecycle status"
              >
                Change
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              {isSigned ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[140px]">{p?.authorizations || 'Auth Signed'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span className="text-amber-700 font-medium">Auth Unsigned</span>
                  <button
                    type="button"
                    onClick={() => handleOpenSignatureModal(p)}
                    className="text-[#A4432B] hover:underline font-bold"
                  >
                    [Record Sig]
                  </button>
                </span>
              )}
            </div>
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
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-[11px] py-1 px-2 text-[#06244B] border-slate-300 hover:bg-slate-50"
            onClick={() => handleOpenSignatureModal(p)}
            title="Record Document 112 Medical Authorization signature evidence"
          >
            <FileCheck2 className="w-3 h-3 mr-1 text-[#A4432B]" /> Sign Auth
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-[11px] py-1 px-2 text-[#06244B] border-slate-300 hover:bg-slate-50"
            onClick={() => handleOpenStatusModal(p)}
            title="Update Document 113 records request status & 30-day turnaround follow-up"
          >
            <Send className="w-3 h-3 mr-1 text-[#06244B]" /> Status
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-[11px] py-1 px-2 text-[#06244B]"
            onClick={() => openEditModal(p)}
          >
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={handleCaseChange}
        cases={cases}
        title="Medical Treatment & Records Workspace"
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
        defaultCaseId={activeMatter?.id || activeCaseId}
      />

      {/* Document 112: Record Signature Evidence Modal */}
      <RecordSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        provider={targetProviderForModal}
        matter={cases.find((c) => c.id === targetProviderForModal?.matterId) || activeMatter}
        onSignatureRecorded={handleProviderUpdated}
      />

      {/* Document 113: Update Request Status Modal */}
      <UpdateRequestStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        provider={targetProviderForModal}
        matter={cases.find((c) => c.id === targetProviderForModal?.matterId) || activeMatter}
        onStatusUpdated={handleProviderUpdated}
        onOpenSignatureModal={handleOpenSignatureModal}
      />
    </div>
  );
}

