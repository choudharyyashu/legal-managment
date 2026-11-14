import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { DemandPackageModal } from '../components/DemandPackageModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { MOCK_PI_CASES, MOCK_DEMAND_PACKAGES } from '../../../data/mockPersonalInjury';
import { mockStorage } from '../../../services/mockStorage';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';

export function DemandPackages() {
  const { addToast } = useToast();
  const { activeMatter, setActiveMatter } = useMatters();
  const [cases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [demandPackages, setDemandPackages] = useState(() => mockStorage.get('pi_demands', MOCK_DEMAND_PACKAGES));
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync activeCaseId when global activeMatter changes
  useEffect(() => {
    if (activeMatter?.id && activeMatter.id !== activeCaseId) {
      setActiveCaseId(activeMatter.id);
    }
  }, [activeMatter]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId && newCaseId !== 'ALL') {
      const match = cases.find((c) => c.id === newCaseId);
      if (match) {
        setActiveMatter({
          id: match.id,
          title: match.matterTitle || `${match.clientName} - PI Claim`,
          clientName: match.clientName,
          clientNumber: match.clientNumber || match.id,
          matterNumber: match.matterNumber || match.id,
          practiceArea: 'Personal Injury',
          leadAttorney: match.leadAttorney || 'Eleanor Heugly, Esq.',
          status: match.caseStage || 'Active',
          incidentDate: match.incidentDate,
        });
      }
    }
  };

  const filteredDemands = demandPackages.filter((d) => {
    if (!d) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      d.matterTitle?.toLowerCase().includes(q) ||
      d.carrierRecipient?.toLowerCase().includes(q) ||
      d.attorneyReviewStatus?.toLowerCase().includes(q);
    const matchesCase = activeCaseId === 'ALL' || d.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  const handleSaveDemand = (savedRecord) => {
    setDemandPackages((prev) => {
      const exists = prev.some((d) => d.id === savedRecord.id);
      let updated;
      if (exists) {
        updated = prev.map((d) => (d.id === savedRecord.id ? savedRecord : d));
        addToast('Demand package updated.', 'success');
      } else {
        updated = [savedRecord, ...prev];
        addToast('New demand package created and ready for attorney review.', 'success');
      }
      mockStorage.set('pi_demands', updated);
      return updated;
    });
  };

  const openAddModal = () => {
    setSelectedDemand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setSelectedDemand(d);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'matterTitle',
      label: 'PI Matter & Carrier Recipient',
      sortable: true,
      render: (val, d) => (
        <div>
          <span className="font-bold text-[#06244B] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#A4432B]" />
            {d?.matterTitle || val || 'Untitled Matter'}
          </span>
          <span className="text-[11px] text-[#667085] block truncate max-w-sm">
            {d?.carrierRecipient || 'Carrier Not Specified'}
          </span>
        </div>
      ),
    },
    {
      key: 'demandAmount',
      label: 'Target Demand Amount',
      align: 'right',
      sortable: true,
      render: (val, d) => (
        <span className="text-sm font-bold text-[#A4432B]">
          {formatCurrency(d?.demandAmount ?? val ?? 0)}
        </span>
      ),
    },
    {
      key: 'checklistProgress',
      label: 'Readiness Checklist (10 Items)',
      render: (_, d) => {
        const completed = Object.values(d?.checklist || {}).filter(Boolean).length;
        const pct = Math.round((completed / 10) * 100);
        return (
          <div className="w-40 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-700">
              <span>{completed} / 10 Exhibits</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${pct === 100 ? 'bg-[#287A55]' : 'bg-[#A4432B]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'deadlines',
      label: 'Response Deadline',
      render: (_, d) => (
        <div>
          <span className="text-xs font-semibold text-[#B42318] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {d?.responseDeadline || 'Not Set'}
          </span>
          <span className="text-[10px] text-slate-500 block">Drafted: {d?.datePrepared || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'attorneyReviewStatus',
      label: 'Attorney Review Status',
      render: (val, d) => {
        const rev = d?.attorneyReviewStatus || val || 'Draft in Progress';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
              rev.includes('Approved') || rev.includes('Sent')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {rev}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, d) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1"
            onClick={() => openEditModal(d)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Letterhead &amp; Builder
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
        title="Demand Packages & Readiness Builder"
        subtitle="10-point evidentiary readiness checklist, Utah formal policy limits demand narratives, hyperlinked exhibit indices, and partner approval workflow."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Create Demand Package
          </Button>
        }
      />

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Active Demand Packages ({filteredDemands.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Settlement demand portfolios prepared for insurance carrier submission.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Search demand, carrier, review status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-56 sm:w-72"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredDemands}
          pageSize={10}
          emptyMessage="No demand packages found."
        />
      </div>

      {/* 10-Item Requirement Checklist Legend Banner */}
      <div className="bg-[#F5F0E5]/60 p-4 rounded border border-[#D9D6CF] space-y-2 text-xs">
        <h4 className="font-serif font-bold text-xs text-[#06244B] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#A4432B]" /> Mandatory 10-Item Utah Evidentiary Demand Checklist
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-700 pt-1">
          <span>✓ 1. Incident Crash Report</span>
          <span>✓ 2. Liability Scene Evidence</span>
          <span>✓ 3. Witness Statements</span>
          <span>✓ 4. Medical Records Packet</span>
          <span>✓ 5. Itemized Bills Ledger</span>
          <span>✓ 6. Wage Loss Verifications</span>
          <span>✓ 7. Insurance Dec Sheets</span>
          <span>✓ 8. Medical Chronology</span>
          <span>✓ 9. Injury &amp; Scene Photos</span>
          <span>✓ 10. Expert Forensic Reports</span>
        </div>
      </div>

      {/* Add / Edit & Preview Modal */}
      <DemandPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDemand}
        demandPackage={selectedDemand}
        cases={cases}
        defaultCaseId={activeMatter?.id || activeCaseId}
      />
    </div>
  );
}

