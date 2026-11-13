import React, { useState } from 'react';
import { Landmark, FileSpreadsheet, DollarSign, Plus, CheckCircle, AlertTriangle, UserPlus, FileEdit } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { MOCK_BANKRUPTCY_SCHEDULES } from '../../../data/mockBankruptcySchedules';
import { MOCK_BANKRUPTCY_CASES } from '../../../data/mockBankruptcyCases';
import { AddCreditorModal } from '../components/AddCreditorModal';
import { AmendedSchedulesModal } from '../components/AmendedSchedulesModal';

export function BankruptcySchedulesLedger() {
  const [selectedCaseId, setSelectedCaseId] = useState('BNK-2026-001');
  const [activeTab, setActiveTab] = useState('AB'); // 'AB', 'D', 'EF', 'IJ'
  const [schedulesMap, setSchedulesMap] = useState(MOCK_BANKRUPTCY_SCHEDULES);
  const [isAddCreditorOpen, setIsAddCreditorOpen] = useState(false);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);

  const caseData = MOCK_BANKRUPTCY_CASES.find(c => c.id === selectedCaseId) || MOCK_BANKRUPTCY_CASES[0];
  const schedules = schedulesMap[selectedCaseId] || schedulesMap['BNK-2026-001'];

  const handleAddCreditor = (newCreditor) => {
    setSchedulesMap(prev => {
      const current = prev[selectedCaseId] || prev['BNK-2026-001'];
      return {
        ...prev,
        [selectedCaseId]: {
          ...current,
          scheduleEF: [newCreditor, ...(current.scheduleEF || [])],
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Official Schedules Ledger:</strong> Schedules A/B (Property), D (Secured Claims), E/F (Unsecured Debts), and I/J (Income/Living Expenses).
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Bankruptcy Schedules Ledger (A/B through J)"
          subtitle={`Case: ${caseData.caseNumber} — ${caseData.debtorName} (${caseData.chapter})`}
          breadcrumbs={[
            { label: 'Clients & Matters', to: '/matters' },
            { label: 'Bankruptcy', to: '/bankruptcy/cases' },
            { label: 'Schedules Ledger' }
          ]}
        />

        {/* Case Switcher & Actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={FileEdit}
            onClick={() => setIsAmendModalOpen(true)}
            className="text-xs"
          >
            Amend Schedules (F.R.B.P. 1009)
          </Button>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#D9D6CF] shadow-sm">
            <span className="text-xs font-semibold text-[#06244B] ml-2">Select Debtor:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="text-xs p-1.5 rounded border border-[#D9D6CF] text-[#06244B] bg-slate-50 font-medium"
            >
              {MOCK_BANKRUPTCY_CASES.slice(0, 3).map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.debtorName} ({c.chapter})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Financial Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Schedule A/B Assets</span>
          <span className="text-xl font-bold text-[#06244B] mt-1 block">
            ${schedules.scheduleAB.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-[#667085]">Real Estate &amp; Personal Belongings</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Secured Debt (Sched D)</span>
          <span className="text-xl font-bold text-red-700 mt-1 block">
            ${schedules.scheduleD.reduce((sum, item) => sum + item.claimAmount, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-[#667085]">Mortgages &amp; Vehicle Liens</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Unsecured Debt (Sched E/F)</span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">
            ${schedules.scheduleEF.reduce((sum, item) => sum + item.claimAmount, 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-[#667085]">Taxes, Credit Cards &amp; Medical</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Net Monthly Cash Flow (I - J)</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            ${schedules.scheduleJ.netMonthlyDisposableIncome?.toLocaleString() || 0}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold">
            {schedules.scheduleJ.netMonthlyDisposableIncome > 0
              ? 'Disposable Income for Plan'
              : 'Zero Net Disposable Income'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2">
        {[
          { id: 'AB', label: 'Schedule A/B: Real & Personal Property' },
          { id: 'D', label: 'Schedule D: Secured Creditors' },
          { id: 'EF', label: 'Schedule E/F: Unsecured Creditors' },
          { id: 'IJ', label: 'Schedule I & J: Income & Living Budget' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-t text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#06244B] text-white'
                : 'text-[#667085] hover:text-[#06244B] bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'AB' && (
        <div className="bg-white rounded-lg border border-[#D9D6CF] p-4 space-y-3">
          <h4 className="font-bold text-sm text-[#06244B]">Schedule A/B: Real Property &amp; Personal Assets Inventory</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Asset Description</th>
                  <th className="p-2.5">Fair Market Value</th>
                  <th className="p-2.5">Exempt Amount Claimed</th>
                  <th className="p-2.5">Statutory Exemption Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {schedules.scheduleAB.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-[#06244B]">{item.category}</td>
                    <td className="p-2.5">{item.description}</td>
                    <td className="p-2.5 font-bold">${item.value.toLocaleString()}</td>
                    <td className="p-2.5 font-bold text-emerald-700">${item.exemptAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-[#667085]">{item.law}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'D' && (
        <div className="bg-white rounded-lg border border-[#D9D6CF] p-4 space-y-3">
          <h4 className="font-bold text-sm text-[#06244B]">Schedule D: Creditors Having Claims Secured by Property</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                <tr>
                  <th className="p-2.5">Secured Creditor</th>
                  <th className="p-2.5">Collateral Description</th>
                  <th className="p-2.5">Account #</th>
                  <th className="p-2.5">Total Claim</th>
                  <th className="p-2.5">Secured Portion</th>
                  <th className="p-2.5">Unsecured Deficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {schedules.scheduleD.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <span className="font-bold text-[#06244B] block">{item.creditor}</span>
                      <span className="text-[10px] text-[#667085]">{item.address}</span>
                    </td>
                    <td className="p-2.5 font-medium">{item.collateral}</td>
                    <td className="p-2.5 font-mono">{item.accountNum}</td>
                    <td className="p-2.5 font-bold text-red-700">${item.claimAmount.toLocaleString()}</td>
                    <td className="p-2.5 font-semibold">${item.securedPortion.toLocaleString()}</td>
                    <td className="p-2.5 font-semibold text-amber-700">${item.unsecuredPortion.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EF' && (
        <div className="bg-white rounded-lg border border-[#D9D6CF] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#06244B]">Schedule E/F: Priority &amp; Non-Priority Unsecured Claims</h4>
            <Button
              size="sm"
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsAddCreditorOpen(true)}
            >
              Add Creditor Claim
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                <tr>
                  <th className="p-2.5">Claim Priority</th>
                  <th className="p-2.5">Creditor Name &amp; Address</th>
                  <th className="p-2.5">Account #</th>
                  <th className="p-2.5">Nature of Debt</th>
                  <th className="p-2.5">Claim Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {schedules.scheduleEF.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-[#A4432B]">{item.priority}</td>
                    <td className="p-2.5">
                      <span className="font-bold text-[#06244B] block">{item.creditor}</span>
                      <span className="text-[10px] text-[#667085]">{item.address}</span>
                    </td>
                    <td className="p-2.5 font-mono">{item.accountNum}</td>
                    <td className="p-2.5">{item.natureOfDebt}</td>
                    <td className="p-2.5 font-bold text-[#06244B]">${item.claimAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'IJ' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-[#D9D6CF] p-4 space-y-3">
            <h4 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2">Schedule I: Debtor Monthly Income</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Gross Monthly Wages:</span>
                <span className="font-bold">${schedules.scheduleI.monthlyGrossWages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Payroll Taxes &amp; Social Security:</span>
                <span>-${schedules.scheduleI.payrollDeductionTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Health Insurance Premium:</span>
                <span>-${schedules.scheduleI.payrollDeductionInsurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>401(k) Retirement Contribution:</span>
                <span>-${schedules.scheduleI.payrollDeduction401k.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#D9D6CF] flex justify-between font-bold text-[#06244B]">
                <span>Net Monthly Take-Home Pay:</span>
                <span className="text-emerald-700">${schedules.scheduleI.netMonthlyTakeHomePay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D9D6CF] p-4 space-y-3">
            <h4 className="font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2">Schedule J: Itemized Household Living Expenses</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Rent / Mortgage Payment:</span>
                <span>${schedules.scheduleJ.rentOrMortgage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Utilities (Electric, Gas, Water):</span>
                <span>${schedules.scheduleJ.utilitiesElectricGas.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Food &amp; Groceries:</span>
                <span>${schedules.scheduleJ.foodAndGroceries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation, Gas &amp; Auto Maintenance:</span>
                <span>${schedules.scheduleJ.transportationGasMaintenance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto &amp; Health Insurance Out-of-Pocket:</span>
                <span>${schedules.scheduleJ.autoInsurance.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#D9D6CF] flex justify-between font-bold text-[#06244B]">
                <span>Total Monthly Living Budget:</span>
                <span>${schedules.scheduleJ.totalMonthlyLivingExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Creditor Modal */}
      <AddCreditorModal
        isOpen={isAddCreditorOpen}
        onClose={() => setIsAddCreditorOpen(false)}
        onAddCreditor={handleAddCreditor}
      />

      {/* Amended Schedules Modal (F.R.B.P. 1009) */}
      <AmendedSchedulesModal
        isOpen={isAmendModalOpen}
        onClose={() => setIsAmendModalOpen(false)}
        caseNumber={caseData.caseNumber}
        debtorName={caseData.debtorName}
      />
    </div>
  );
}

