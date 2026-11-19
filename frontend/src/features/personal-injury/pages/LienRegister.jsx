import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Building,
  TrendingDown,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { LienModal } from '../components/LienModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatCard } from '../../../components/shared/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { MOCK_PI_CASES } from '../../../data/mockPersonalInjury';
import { piService } from '../../../services/piService';

export function LienRegister() {
  const { addToast } = useToast();
  const { matters, activeMatter, setActiveMatter } = useMatters();
  const cases = React.useMemo(() => {
    const filtered = (matters || []).filter(
      (m) =>
        m.practiceAreaId === 'pa-pi' ||
        m.practiceAreaId === 'pa-7' ||
        m.practiceArea?.code === 'PI' ||
        m.practiceAreaName?.toLowerCase().includes('personal injury') ||
        m.matterNumber?.toUpperCase().includes('PI')
    );
    return filtered.length > 0 ? filtered : MOCK_PI_CASES;
  }, [matters]);
  const [liens, setLiens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || (cases[0]?.id || 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLien, setSelectedLien] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync activeCaseId when global activeMatter changes
  useEffect(() => {
    if (activeMatter?.id && activeMatter.id !== activeCaseId) {
      setActiveCaseId(activeMatter.id);
    }
  }, [activeMatter]);

  useEffect(() => {
    let isMounted = true;
    if (activeCaseId && activeCaseId !== 'ALL') {
      setLoading(true);
      piService.getLiens(activeCaseId)
        .then((res) => {
          if (isMounted) {
            const list = Array.isArray(res) ? res : (res?.data || []);
            setLiens(list.map((l) => ({
              ...l,
              lienHolder: l.lienholderName || l.lienHolder,
              lienType: l.category || l.lienType,
              originalLienAmount: Number(l.assertedAmount || l.originalLienAmount || 0),
              verifiedLienAmount: Number(l.verifiedAmount || l.verifiedLienAmount || 0),
              finalPayoffAmount: Number(l.finalPayoffAmount || 0),
              confirmationStatus: l.status || l.confirmationStatus || 'ASSERTED',
            })));
          }
        })
        .catch((err) => {
          console.warn('Could not load liens from API:', err?.message);
          if (isMounted) setLiens([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLiens([]);
    }
    return () => { isMounted = false; };
  }, [activeCaseId]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId && newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

  const filteredLiens = liens.filter((l) => {
    if (!l) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      l.lienHolder?.toLowerCase().includes(q) ||
      l.lienType?.toLowerCase().includes(q) ||
      l.matterTitle?.toLowerCase().includes(q) ||
      l.confirmationStatus?.toLowerCase().includes(q);
    const matchesCase = activeCaseId === 'ALL' || l.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  // Calculate totals
  const totalOriginal = filteredLiens.reduce((sum, l) => sum + (l.originalLienAmount || 0), 0);
  const totalVerified = filteredLiens.reduce((sum, l) => sum + (l.verifiedLienAmount || 0), 0);
  const totalPayoff = filteredLiens.reduce((sum, l) => sum + (l.finalPayoffAmount || 0), 0);
  const totalSavings = Math.max(0, totalOriginal - totalPayoff);

  const handleSaveLien = async (savedRecord) => {
    try {
      if (activeCaseId && activeCaseId !== 'ALL') {
        if (savedRecord.id && liens.some((l) => l.id === savedRecord.id)) {
          await piService.updateLien(activeCaseId, savedRecord.id, savedRecord);
          addToast('Healthcare lien updated persistently in database.', 'success');
        } else {
          const created = await piService.createLien(activeCaseId, savedRecord);
          savedRecord = created || savedRecord;
          addToast('New healthcare lien registered in database.', 'success');
        }
      }
      setLiens((prev) => {
        const exists = prev.some((l) => l.id === savedRecord.id);
        if (exists) {
          return prev.map((l) => (l.id === savedRecord.id ? { ...l, ...savedRecord } : l));
        }
        return [savedRecord, ...prev];
      });
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Error saving lien', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedLien(null);
    setIsModalOpen(true);
  };

  const openEditModal = (l) => {
    setSelectedLien(l);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'lienHolder',
      label: 'Lien Holder / Recovery Agency',
      sortable: true,
      render: (val, l) => (
        <div>
          <span className="font-bold text-[#06244B] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#A4432B]" />
            {l?.lienHolder || val || 'Not Available'}
          </span>
          <span className="text-[11px] text-[#667085] block">{l?.matterTitle || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'lienType',
      label: 'Statutory / Plan Classification',
      render: (val, l) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#F5F0E5] text-[#06244B]">
          {l?.lienType || val || 'Statutory Healthcare Lien'}
        </span>
      ),
    },
    {
      key: 'originalLienAmount',
      label: 'Original Asserted',
      align: 'right',
      sortable: true,
      render: (val, l) => (
        <span className="text-slate-500 line-through text-xs">
          {formatCurrency(l?.originalLienAmount ?? val ?? 0)}
        </span>
      ),
    },
    {
      key: 'reduction',
      label: 'Negotiated Savings',
      align: 'right',
      render: (_, l) => {
        const original = l?.originalLienAmount || 0;
        const payoff = l?.finalPayoffAmount || 0;
        const savings = Math.max(0, original - payoff);
        return (
          <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-0.5">
            <TrendingDown className="w-3 h-3" />
            {formatCurrency(savings)}
          </span>
        );
      },
    },
    {
      key: 'finalPayoffAmount',
      label: 'Final Payoff Amount',
      align: 'right',
      sortable: true,
      render: (val, l) => (
        <span className="text-sm font-bold text-[#B42318]">
          {formatCurrency(l?.finalPayoffAmount ?? val ?? 0)}
        </span>
      ),
    },
    {
      key: 'confirmationStatus',
      label: 'Payoff Confirmation',
      render: (val, l) => {
        const conf = l?.confirmationStatus || val || 'Unconfirmed';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
              conf.includes('Confirmed') || conf.includes('Payoff')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {conf}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, l) => (
        <Button
          size="sm"
          variant="outline"
          className="text-xs py-1 text-[#06244B]"
          onClick={() => openEditModal(l)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" /> Audit &amp; Payoff
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
        title="Healthcare Lien Register & Statutory Reductions"
        subtitle="Manage Medicare (CMS BCRC super-liens), Utah Medicaid statutory subrogation, ERISA self-funded private health plans, hospital liens (UCA § 38-7-1), and common fund fee reductions."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Register New Lien
          </Button>
        }
      />

      {/* Top 3 Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Initial Asserted Liens"
          value={formatCurrency(totalOriginal)}
          subtitle="Pre-audit asserted balances"
          icon={DollarSign}
        />
        <StatCard
          title="Total Negotiated Client Savings"
          value={formatCurrency(totalSavings)}
          subtitle="Attorney common-fund reductions"
          icon={TrendingDown}
          trend={{ value: `${Math.round((totalSavings / (totalOriginal || 1)) * 100)}% Saved`, isPositive: true }}
          className="border-emerald-300 bg-emerald-50/20"
        />
        <StatCard
          title="Final Approved Payoff Total"
          value={formatCurrency(totalPayoff)}
          subtitle="Disbursed from client settlement trust"
          icon={CheckCircle2}
          className="border-[#06244B]"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Registered Subrogation &amp; Healthcare Liens ({filteredLiens.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Mandatory statutory subrogation resolution before settlement disbursement.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Search lien holder, status, case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-56 sm:w-72"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLiens}
          pageSize={10}
          emptyMessage="No healthcare liens found."
        />
      </div>

      {/* Utah Common Fund & Made-Whole Legal Precedent Notice */}
      <div className="bg-[#F5F0E5]/60 p-4 rounded border border-[#D9D6CF] space-y-2 text-xs text-slate-800">
        <h4 className="font-serif font-bold text-xs text-[#06244B] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#A4432B]" /> Utah Common Fund Doctrine &amp; Statutory Fee Apportionment
        </h4>
        <p className="text-[11px] leading-relaxed text-[#667085]">
          Under Utah law and established equitable principles, a subrogated insurer or statutory lienholder who recovers through an attorney's efforts must bear a proportionate share of the attorney fees and costs expended in generating the fund. This allows our firm to negotiate reductions of 33.33% to 50% on medical liens.
        </p>
      </div>

      {/* Add / Edit Modal */}
      <LienModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLien}
        lien={selectedLien}
        cases={cases}
        defaultCaseId={activeMatter?.id || activeCaseId}
      />
    </div>
  );
}

