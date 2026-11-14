import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { InsuranceModal } from '../components/InsuranceModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { MOCK_PI_CASES, MOCK_INSURANCE_POLICIES } from '../../../data/mockPersonalInjury';
import { mockStorage } from '../../../services/mockStorage';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';

export function InsuranceManagement() {
  const { addToast } = useToast();
  const { activeMatter, setActiveMatter } = useMatters();
  const [cases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [policies, setPolicies] = useState(() => mockStorage.get('pi_policies', MOCK_INSURANCE_POLICIES));
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (activeMatter?.id) {
      setActiveCaseId(activeMatter.id);
    }
  }, [activeMatter?.id]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    if (!p) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      p.insuranceCompany?.toLowerCase().includes(q) ||
      p.claimNumber?.toLowerCase().includes(q) ||
      p.adjusterName?.toLowerCase().includes(q) ||
      p.policyNumber?.toLowerCase().includes(q);
    const matchesCase = activeCaseId === 'ALL' || p.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  const handleSavePolicy = (savedRecord) => {
    setPolicies((prev) => {
      const exists = prev.some((p) => p.id === savedRecord.id);
      let updated;
      if (exists) {
        updated = prev.map((p) => (p.id === savedRecord.id ? savedRecord : p));
        addToast('Insurance policy updated successfully.', 'success');
      } else {
        updated = [savedRecord, ...prev];
        addToast('New insurance policy coverage added.', 'success');
      }
      mockStorage.set('pi_policies', updated);
      return updated;
    });
  };

  const openAddModal = () => {
    setSelectedPolicy(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setSelectedPolicy(p);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'insuranceCompany',
      label: 'Carrier & Coverage Type',
      sortable: true,
      render: (val, p) => (
        <div>
          <span className="font-bold text-[#06244B] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#A4432B]" />
            {p?.insuranceCompany || val || 'Not Available'}
          </span>
          <span className="text-[11px] text-[#667085] block">{p?.insuranceType || 'Standard Policy'}</span>
        </div>
      ),
    },
    {
      key: 'policyLimits',
      label: 'Policy Limits & Policy #',
      render: (val, p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p?.policyLimits || val || 'Limits Not Available'}</span>
          <span className="text-[11px] text-slate-500 font-mono">Pol: {p?.policyNumber || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'adjuster',
      label: 'Adjuster Contact & Claim #',
      render: (_, p) => (
        <div>
          <span className="font-semibold text-slate-900 block">{p?.adjusterName || 'Unassigned'}</span>
          <span className="text-[11px] text-[#A4432B] font-mono block">Claim #{p?.claimNumber || 'N/A'}</span>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {p?.adjusterPhone || 'Phone N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'utahCoverage',
      label: 'PIP / MedPay / UIM Endorsements',
      render: (_, p) => (
        <div className="space-y-0.5 text-[11px]">
          {p?.pipCoverage && p.pipCoverage !== 'None' && (
            <span className="inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 font-semibold mr-1">
              PIP: {p.pipCoverage}
            </span>
          )}
          {p?.uimCoverage && p.uimCoverage !== 'None' && (
            <span className="inline-block px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 font-semibold">
              UIM: {p.uimCoverage}
            </span>
          )}
          {p?.medPayCoverage && p.medPayCoverage !== 'None' && (
            <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold ml-1">
              MedPay: {p.medPayCoverage}
            </span>
          )}
          {(!p?.pipCoverage || p.pipCoverage === 'None') && (!p?.uimCoverage || p.uimCoverage === 'None') && (!p?.medPayCoverage || p.medPayCoverage === 'None') && (
            <span className="text-slate-400 italic">No optional endorsements</span>
          )}
        </div>
      ),
    },
    {
      key: 'claimStatus',
      label: 'Claim Status',
      render: (val, p) => <StatusBadge status={p?.claimStatus || val || 'Active'} />,
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
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit Policy
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={handleCaseChange}
        cases={cases}
        title="Insurance Management &amp; Coverage Tracking"
        subtitle="Manage 3rd-party commercial liability policies, 1st-party Utah statutory PIP exhaustion ledgers, Underinsured Motorist (UIM) reserves, and claims adjuster logs."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Add Insurance Policy
          </Button>
        }
      />

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Active Insurance Policies ({filteredPolicies.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Multiple insurance lines identified and put on formal representation notice.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Search carrier, adjuster, claim #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-56 sm:w-72"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredPolicies}
          pageSize={10}
          emptyMessage="No insurance policies found."
        />
      </div>

      {/* Utah Statutory PIP Notice Card */}
      <div className="bg-[#F5F0E5]/60 p-4 rounded border border-[#D9D6CF] space-y-2 text-xs text-slate-800">
        <h4 className="font-serif font-bold text-xs text-[#06244B] uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#A4432B]" /> Utah Statutory No-Fault Personal Injury Protection (PIP) Rules
        </h4>
        <p className="text-[11px] leading-relaxed text-[#667085]">
          Under Utah Code Ann. § 31A-22-307, every Utah motor vehicle liability policy carries mandatory no-fault PIP coverage of at least $3,000 for medical expenses regardless of fault. Once 1st-party PIP is exhausted, medical bills transition directly to health insurance subrogation or hospital statutory liens.
        </p>
      </div>

      {/* Add / Edit Modal */}
      <InsuranceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePolicy}
        policy={selectedPolicy}
        cases={cases}
        defaultCaseId={activeMatter?.id || activeCaseId}
      />
    </div>
  );
}

