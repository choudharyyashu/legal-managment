import React, { useState } from 'react';
import {
  FileText,
  Landmark,
  Shield,
  Clock,
  AlertTriangle,
  Plus,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Filter,
  Download,
  Search,
  Scale
} from 'lucide-react';
import { MOCK_PROBATE_CASES } from '../../../../data/mockSpecialtyPractices';
import { useToast } from '../../../../components/ui/Toast';

export function ProbateWorkspace() {
  const { addToast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState(MOCK_PROBATE_CASES[0].id);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, claims, beneficiaries, accounting
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ category: 'Real Property', description: '', appraisedValue: '', probateType: 'Probate Asset' });

  const activeCase = MOCK_PROBATE_CASES.find(c => c.id === selectedCaseId) || MOCK_PROBATE_CASES[0];

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.description || !newAsset.appraisedValue) {
      addToast('Please fill all required asset fields', 'error');
      return;
    }
    activeCase.inventory.push({
      id: `inv-${Date.now()}`,
      category: newAsset.category,
      description: newAsset.description,
      appraisedValue: parseFloat(newAsset.appraisedValue) || 0,
      probateType: newAsset.probateType,
      status: 'Appraisal Confirmed'
    });
    setShowAddAssetModal(false);
    setNewAsset({ category: 'Real Property', description: '', appraisedValue: '', probateType: 'Probate Asset' });
    addToast('Asset added to Estate Inventory ledger', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Case Selector */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#06244B] flex items-center justify-center text-white shadow-md">
              <Landmark className="w-6 h-6 text-[#A4432B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F4EBFF] text-[#6941C6] border border-[#D6BBFB] whitespace-nowrap">
                  SECTION 20: PROBATE & TRUSTS
                </span>
                <span className="text-xs font-mono text-[#667085] whitespace-nowrap">{activeCase.caseNumber}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#06244B] leading-tight">{activeCase.estateName}</h1>
              <p className="text-xs text-[#475467] mt-0.5">{activeCase.court} • {activeCase.judge}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="max-w-full sm:max-w-[260px] px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {MOCK_PROBATE_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.decedent}</option>
              ))}
            </select>
            <button
              onClick={() => addToast('Exporting Utah Supervised Estate Inventory (Form 1402)...', 'info')}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Export Court Inventory
            </button>
          </div>
        </div>

        {/* Fiduciary Notice & Bar Date Alert */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Personal Representative</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.personalRepresentative}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ {activeCase.lettersStatus}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Creditor Bar Date (90-Day)</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{activeCase.barDate}</p>
            <p className="text-[11px] text-[#A4432B] font-medium mt-1">⏳ {activeCase.barDateStatus}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Probate Assets vs Total</p>
            <p className="text-xs font-bold text-[#101828] mt-0.5">${activeCase.probateAssetsValue.toLocaleString()} / ${activeCase.totalInventoryValue.toLocaleString()}</p>
            <p className="text-[11px] text-[#475467] font-medium mt-1">Non-Probate: ${activeCase.nonProbateAssetsValue.toLocaleString()}</p>
          </div>

          <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0]">
            <p className="text-[11px] font-semibold text-[#667085] uppercase">Estate Fiduciary Account</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">${activeCase.estateAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-[#667085] font-medium mt-1">Bond: {activeCase.fiduciaryBond}</p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center border-b border-[#E4E7EC] gap-x-6 gap-y-2 text-sm font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Asset Inventory & Appraisals ({activeCase.inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'claims' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Creditor Claims & Bar Date ({activeCase.creditorClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'beneficiaries' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Beneficiary Distribution Schedule ({activeCase.beneficiaries.length})
        </button>
        <button
          onClick={() => setActiveTab('accounting')}
          className={`pb-3 whitespace-nowrap transition-colors ${activeTab === 'accounting' ? 'border-b-2 border-[#A4432B] text-[#06244B]' : 'hover:text-[#101828]'}`}
        >
          Fiduciary Account Ledger
        </button>
      </div>

      {/* Tab 1: Asset Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Probate & Non-Probate Asset Schedule</h2>
              <p className="text-xs text-[#667085]">Categorize probate property subject to court administration vs non-probate TOD/POD assets.</p>
            </div>
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#A4432B]" />
              Add Inventory Asset
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Asset Description</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Appraised / Value</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-[#101828]">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#475467]">{item.description}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.probateType === 'Probate Asset'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.probateType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#101828]">
                      ${item.appraisedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Creditor Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Utah Creditor Claims Register (Utah Code § 75-3-805)</h2>
              <p className="text-xs text-[#667085]">Claims barred unless presented within 90 days from notice to creditors publication.</p>
            </div>
            <button
              onClick={() => addToast('New creditor claim logged', 'info')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A4432B]" />
              Log Creditor Claim
            </button>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-[#F8F9FC] text-[#475467] font-semibold border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Statutory Priority</th>
                  <th className="py-3 px-4">Presentation Date</th>
                  <th className="py-3 px-4 text-right">Claim Amount</th>
                  <th className="py-3 px-4">Claim Status</th>
                  <th className="py-3 px-4 text-right">Fiduciary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {activeCase.creditorClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#98A2B3]">No creditor claims presented to date.</td>
                  </tr>
                ) : (
                  activeCase.creditorClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-[#101828]">{claim.claimant}</td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-[#475467]">{claim.statutoryPriority}</td>
                      <td className="py-3.5 px-4 text-[11px] text-[#667085]">{claim.claimDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#101828]">
                        ${claim.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          claim.status.includes('Allowed') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          claim.status.includes('Disputed') ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => addToast(`Updated claim status for ${claim.claimant}`, 'success')}
                          className="text-[11px] text-[#06244B] hover:text-[#A4432B] font-semibold underline cursor-pointer"
                        >
                          Review & Classify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Beneficiary Schedule */}
      {activeTab === 'beneficiaries' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#06244B]">Beneficiary Roster & Distribution Matrix</h2>
              <p className="text-xs text-[#667085]">Track residuary shares, specific bequests, and receipt/release execution status.</p>
            </div>
            <button
              onClick={() => addToast('Prepared receipt & release waiver packages', 'info')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A4432B]" />
              Generate Receipts & Releases
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeCase.beneficiaries.map((ben) => (
              <div key={ben.id} className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#06244B]">{ben.relation}</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium">
                    {ben.distributionStatus}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101828]">{ben.name}</h3>
                <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0] text-xs font-mono text-[#344054]">
                  {ben.share}
                </div>
                <button
                  onClick={() => addToast(`Prepared draft decree for ${ben.name}`, 'success')}
                  className="w-full py-1.5 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors"
                >
                  View Distribution Voucher
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Fiduciary Accounting */}
      {activeTab === 'accounting' && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#06244B]">Utah Court Annual / Final Estate Accounting</h2>
            <p className="text-xs text-[#667085]">Strict separation of Estate Fiduciary Accounts from firm operating and IOLTA trust ledgers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl">
              <span className="text-xs text-[#667085]">Total Probate Assets Administered</span>
              <p className="text-xl font-bold font-mono text-[#101828] mt-1">${activeCase.probateAssetsValue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl">
              <span className="text-xs text-[#667085]">Disbursements & Allowed Claims</span>
              <p className="text-xl font-bold font-mono text-rose-700 mt-1">-$27,180.72</p>
            </div>
            <div className="p-4 bg-[#F8F9FC] border border-[#EAECF0] rounded-xl">
              <span className="text-xs text-[#667085]">Net Balance for Distribution</span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">${activeCase.estateAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="p-4 border border-[#EAECF0] rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#101828]">Statutory Personal Representative Fee Calculation</p>
              <p className="text-xs text-[#667085]">Standard reasonable fee under Utah Code § 75-3-718 (Calculated at 2.5% of gross probate receipts)</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold font-mono text-[#06244B]">$31,250.00</p>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Subject to Court Approval</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Inventory Asset */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#06244B]">Add Asset to Estate Inventory</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054]">Asset Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#D0D5DD] rounded-lg text-xs"
                >
                  <option>Real Property</option>
                  <option>Liquid Accounts</option>
                  <option>Securities</option>
                  <option>Personalty & Vehicles</option>
                  <option>Business Interests</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054]">Description & Location / Account</label>
                <input
                  type="text"
                  placeholder="e.g. Vacant Lot 12, Summit County, UT"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#D0D5DD] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054]">Appraised / Estimated Value ($)</label>
                <input
                  type="number"
                  placeholder="250000"
                  value={newAsset.appraisedValue}
                  onChange={(e) => setNewAsset({ ...newAsset, appraisedValue: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#D0D5DD] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054]">Probate Classification</label>
                <select
                  value={newAsset.probateType}
                  onChange={(e) => setNewAsset({ ...newAsset, probateType: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#D0D5DD] rounded-lg text-xs"
                >
                  <option value="Probate Asset">Probate Asset (Subject to PR Administration)</option>
                  <option value="Non-Probate (TOD/POD)">Non-Probate Asset (Passes by Operation of Law)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#06244B] text-white rounded-lg text-xs font-semibold hover:bg-[#083366]"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

