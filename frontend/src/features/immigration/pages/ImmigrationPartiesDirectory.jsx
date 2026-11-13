import React, { useState } from 'react';
import { Users, UserPlus, Search, ShieldCheck, FileText, Globe, DollarSign, Calculator, Edit, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { MOCK_IMMIGRATION_PARTIES } from '../../../data/mockImmigrationParties';
import { Modal } from '../../../components/ui/Modal';
import { PartyModal } from '../components/PartyModal';

export function ImmigrationPartiesDirectory() {
  const [parties, setParties] = useState(MOCK_IMMIGRATION_PARTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Petitioners', 'Beneficiaries', 'Joint Sponsors'
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

  // Form I-864 Interactive Calculator State
  const [calcHouseholdSize, setCalcHouseholdSize] = useState(3);
  const [calcIncome, setCalcIncome] = useState(45000);

  // 2026 HHS Poverty Guidelines 125% benchmark baseline
  // Size 1: $18,825 | Size 2: $25,550 | Size 3: $32,275 | Size 4: $39,000 | +$6,725 per person
  const get125PovertyLine = (size) => 18825 + Math.max(0, size - 1) * 6725;
  const req125Income = get125PovertyLine(calcHouseholdSize);
  const isSufficient = calcIncome >= req125Income;

  const handleOpenAdd = () => {
    setEditingParty(null);
    setIsPartyModalOpen(true);
  };

  const handleOpenEdit = (party) => {
    setEditingParty(party);
    setIsPartyModalOpen(true);
  };

  const handleSaveParty = (saved) => {
    setParties(prev => {
      const exists = prev.some(p => p.id === saved.id);
      if (exists) {
        return prev.map(p => p.id === saved.id ? saved : p);
      }
      return [saved, ...prev];
    });
  };

  const filteredParties = parties.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.alienNumber && p.alienNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.citizenshipStatus && p.citizenshipStatus.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Petitioners' && p.role === 'Petitioner') ||
      (activeTab === 'Beneficiaries' && p.role === 'Beneficiary') ||
      (activeTab === 'Joint Sponsors' && p.role === 'Joint Sponsor');
    return matchesSearch && matchesTab;
  });

  const columns = [
    {
      key: 'name',
      label: 'Party Name & Role',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedParty(row)}
            className="font-bold text-sm text-[#06244B] hover:text-[#A4432B] text-left block"
          >
            {val}
          </button>
          <span className="text-[11px] font-semibold text-[#A4432B] block">{row.subType}</span>
          <span className="text-[10px] text-[#667085]">{row.role}</span>
        </div>
      ),
    },
    {
      key: 'alienNumber',
      label: 'A-Number / ID',
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-[#06244B]">{val || 'N/A (U.S. Citizen)'}</span>
          {row.uscisOnlineAccount && (
            <span className="text-[10px] text-[#667085] block">USCIS ID: {row.uscisOnlineAccount}</span>
          )}
        </div>
      ),
    },
    {
      key: 'citizenshipStatus',
      label: 'Citizenship / Origin',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="text-xs text-[#202A35] font-medium block">{val}</span>
          <span className="text-[10px] text-[#667085]">{row.birthCountry || 'USA'}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, row) => (
        <div>
          <span className="text-xs text-[#202A35] block">{row.email}</span>
          <span className="text-[11px] text-[#667085]">{row.phone}</span>
        </div>
      ),
    },
    {
      key: 'linkedBeneficiaryName',
      label: 'Linked Case Party',
      render: (val, row) => (
        <span className="text-xs font-medium text-[#06244B]">
          {val || row.linkedPetitionerName || 'Direct'}
        </span>
      ),
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
            icon={Edit}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[DEMO SIMULATION] Dual-Party Immigration Profiles:</strong> Manages Petitioners (U.S. Citizens / LPRs / Employers), Foreign National Beneficiaries, and I-864 Financial Sponsors.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Immigration Parties & Sponsor Directory"
        subtitle="Alien registration records, biometric identifiers, arrival/departure logs, and Form I-864 financial affidavits."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Immigration', to: '/immigration/cases' },
          { label: 'Parties Directory' }
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Add Party / Sponsor
          </Button>
        }
      />

      {/* Interactive Form I-864 Poverty Guideline Tool */}
      <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#A4432B]" />
            <h4 className="font-bold text-xs uppercase text-[#06244B]">
              Interactive Form I-864 Affidavit of Support Poverty Guideline Tool (125% HHS Line)
            </h4>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isSufficient ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
            {isSufficient ? 'Qualifies as Joint Sponsor ✓' : 'Income Insufficient (Co-Sponsor Required) ⚠️'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-end">
          <div>
            <label className="block text-[10px] font-bold text-[#202A35] uppercase mb-1">
              Household Size (Sponsor + Dependents + Immigrant)
            </label>
            <select
              value={calcHouseholdSize}
              onChange={(e) => setCalcHouseholdSize(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-slate-50 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>{s} Persons Household</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#202A35] uppercase mb-1">
              Sponsor Annual Gross Income ($)
            </label>
            <input
              type="number"
              value={calcIncome}
              onChange={(e) => setCalcIncome(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-slate-50 font-medium"
            />
          </div>

          <div className="p-2.5 bg-[#F5F0E5] rounded border border-[#D9D6CF] flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-[#667085] uppercase font-bold block">125% HHS Minimum:</span>
              <span className="font-bold text-[#A4432B] text-sm">${req125Income.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#667085] uppercase font-bold block">Surplus / Deficit:</span>
              <span className={`font-bold text-sm ${calcIncome >= req125Income ? 'text-emerald-700' : 'text-red-700'}`}>
                {calcIncome >= req125Income ? `+$${(calcIncome - req125Income).toLocaleString()}` : `-$${(req125Income - calcIncome).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2">
        {['All', 'Petitioners', 'Beneficiaries', 'Joint Sponsors'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-t text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-[#06244B] text-white'
                : 'text-[#667085] hover:text-[#06244B] bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by party name, A-number, or nationality..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredParties}
        keyField="id"
        emptyMessage="No immigration parties found."
      />

      {/* Party Details Modal */}
      <Modal
        isOpen={Boolean(selectedParty)}
        onClose={() => setSelectedParty(null)}
        title={selectedParty?.name || 'Party Profile'}
        subtitle={`${selectedParty?.role} — ${selectedParty?.subType}`}
        maxWidth="max-w-xl"
      >
        {selectedParty && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Alien Registration #:</span>
                <span className="font-mono text-sm font-bold text-[#06244B]">{selectedParty.alienNumber || 'None / USC'}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Citizenship Status:</span>
                <span className="font-bold text-sm text-[#06244B]">{selectedParty.citizenshipStatus}</span>
              </div>
            </div>

            {selectedParty.role === 'Beneficiary' && (
              <div className="border border-[#D9D6CF] p-3 rounded bg-white space-y-2">
                <span className="font-bold text-[#06244B] uppercase text-[10px] block">
                  Last U.S. Arrival &amp; Form I-94 Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>I-94 Number:</strong> {selectedParty.i94Number || 'N/A'}</div>
                  <div><strong>Class of Admission:</strong> {selectedParty.classOfAdmission || 'N/A'}</div>
                  <div><strong>Port of Entry:</strong> {selectedParty.placeOfLastEntry || 'N/A'}</div>
                  <div><strong>Date of Entry:</strong> {selectedParty.dateOfLastEntry || 'N/A'}</div>
                  <div><strong>Passport:</strong> {selectedParty.passportNumber} (Expires {selectedParty.passportExpiry})</div>
                  <div><strong>Prior Removal History:</strong> {selectedParty.hasPriorDeportation ? 'Yes (Requires 212 Waiver)' : 'None'}</div>
                </div>
              </div>
            )}

            {selectedParty.role === 'Joint Sponsor' && (
              <div className="border border-emerald-200 bg-emerald-50 p-3 rounded space-y-2">
                <span className="font-bold text-emerald-900 uppercase text-[10px] block flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" />
                  Form I-864 Poverty Guideline Assessment (125% HHS Line)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-950">
                  <div><strong>Household Size:</strong> {selectedParty.householdSize} persons</div>
                  <div><strong>Sponsor Current Income:</strong> ${selectedParty.currentAnnualIncome?.toLocaleString()}</div>
                  <div><strong>125% Poverty Threshold:</strong> ${selectedParty.minimumRequiredIncome125Pct?.toLocaleString()}</div>
                  <div><strong>Assessment Result:</strong> <span className="font-bold text-emerald-700">Eligible (Exceeds HHS Line) ✓</span></div>
                </div>
              </div>
            )}

            <div>
              <span className="font-bold text-[#06244B] uppercase text-[10px]">Address &amp; Notes:</span>
              <p className="mt-1 p-2 bg-slate-50 border border-[#D9D6CF] rounded text-xs">{selectedParty.address}</p>
              <p className="mt-1 text-[#667085] text-xs italic">{selectedParty.notes}</p>
            </div>

            <div className="pt-3 border-t border-[#D9D6CF] flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setSelectedParty(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Party Modal */}
      <PartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        party={editingParty}
        onSaveParty={handleSaveParty}
      />
    </div>
  );
}

