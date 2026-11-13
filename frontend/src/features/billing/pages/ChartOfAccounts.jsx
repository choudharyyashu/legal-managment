import React, { useState } from 'react';
import { Landmark, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, ShieldAlert, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function ChartOfAccounts() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const [accounts, setAccounts] = useState([
    // 1000 Assets
    { code: '1010', name: 'Operating Checking Account (Chase)', type: 'Asset', category: 'Current Assets', balance: 184520.50, status: 'Active' },
    { code: '1020', name: 'IOLTA Client Trust Account (First Republic)', type: 'Asset', category: 'Trust & Escrow', balance: 74278.00, status: 'Active' },
    { code: '1050', name: 'Petty Cash Reserve', type: 'Asset', category: 'Current Assets', balance: 1500.00, status: 'Active' },
    { code: '1100', name: 'Accounts Receivable (Client Invoices)', type: 'Asset', category: 'Receivables', balance: 92450.00, status: 'Active' },
    { code: '1200', name: 'Law Library & Digital Legal Subscriptions', type: 'Asset', category: 'Fixed Assets', balance: 14500.00, status: 'Active' },
    { code: '1250', name: 'Office Furniture & High-End Tech Hardware', type: 'Asset', category: 'Fixed Assets', balance: 48900.00, status: 'Active' },

    // 2000 Liabilities
    { code: '2010', name: 'Client Trust Liability (Unearned Retainers)', type: 'Liability', category: 'Trust Liabilities', balance: 74278.00, status: 'Active' },
    { code: '2050', name: 'Accounts Payable (Trade Vendors)', type: 'Liability', category: 'Current Liabilities', balance: 18400.00, status: 'Active' },
    { code: '2100', name: 'Utah State Bar & Professional Privilege Tax Payable', type: 'Liability', category: 'Taxes Payable', balance: 4250.00, status: 'Active' },
    { code: '2200', name: 'Commercial Equipment Term Loan', type: 'Liability', category: 'Long-Term Debt', balance: 32000.00, status: 'Active' },

    // 3000 Equity
    { code: '3010', name: 'Partner Capital - Eleanor Heugly, Esq.', type: 'Equity', category: 'Partners Equity', balance: 140000.00, status: 'Active' },
    { code: '3020', name: 'Partner Capital - Thomas Bludworth, Esq.', type: 'Equity', category: 'Partners Equity', balance: 110000.00, status: 'Active' },
    { code: '3100', name: 'Retained Earnings Prior Years', type: 'Equity', category: 'Retained Earnings', balance: 85200.50, status: 'Active' },

    // 4000 Revenue
    { code: '4010', name: 'Legal Fee Income - Hourly Matters', type: 'Revenue', category: 'Fee Revenue', balance: 384500.00, status: 'Active' },
    { code: '4020', name: 'Legal Fee Income - Flat Fee Engagements', type: 'Revenue', category: 'Fee Revenue', balance: 142000.00, status: 'Active' },
    { code: '4030', name: 'Legal Fee Income - Contingency Recoveries', type: 'Revenue', category: 'Fee Revenue', balance: 95000.00, status: 'Active' },
    { code: '4100', name: 'Client Reimbursed Litigation Costs', type: 'Revenue', category: 'Cost Recoveries', balance: 12400.00, status: 'Active' },

    // 5000 Expenses
    { code: '5010', name: 'Associate Attorney & Staff Salaries', type: 'Expense', category: 'Personnel', balance: 198000.00, status: 'Active' },
    { code: '5050', name: 'Office Lease - Foothill Boulevard Tower', type: 'Expense', category: 'Facilities', balance: 54000.00, status: 'Active' },
    { code: '5100', name: 'Legal Malpractice Insurance Premium', type: 'Expense', category: 'Insurance', balance: 18200.00, status: 'Active' },
    { code: '5150', name: 'Deposition Reporters & Expert Witness Fees', type: 'Expense', category: 'Litigation Expense', balance: 24500.00, status: 'Active' },
    { code: '5200', name: 'Westlaw / LexisNexis Research Subscriptions', type: 'Expense', category: 'Practice Tools', balance: 9600.00, status: 'Active' },
  ]);

  React.useEffect(() => {
    let isMounted = true;
    import('../../../services/ledgerService').then(({ ledgerService }) => {
      ledgerService.getAccounts().then((res) => {
        if (isMounted && Array.isArray(res) && res.length > 0) {
          setAccounts(
            res.map((a) => ({
              code: String(a.accountNumber),
              name: a.accountName,
              type: a.accountType,
              category: a.accountType === 'Asset' ? 'Current Assets' : a.accountType,
              balance: Number(a.balance) || 0,
              status: a.isActive ? 'Active' : 'Inactive',
            }))
          );
        }
      }).catch((err) => console.warn('Could not load accounts from API:', err?.message));
    });
    return () => { isMounted = false; };
  }, []);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Expense');
  const [newCategory, setNewCategory] = useState('Operating Expense');
  const [newBalance, setNewBalance] = useState(0);

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const newAcc = {
      code: newCode.trim(),
      name: newName.trim(),
      type: newType,
      category: newCategory,
      balance: Number(newBalance),
      status: 'Active'
    };

    setAccounts(prev => [newAcc, ...prev]);
    addToast(`Account #${newAcc.code} (${newAcc.name}) added to Chart of Accounts.`, 'success');
    setIsAddAccountOpen(false);
    setNewCode('');
    setNewName('');
    setNewBalance(0);
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      searchQuery === '' ||
      acc.code.includes(searchQuery) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || acc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'Liability').reduce((s, a) => s + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.type === 'Revenue').reduce((s, a) => s + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] Independent Chart of Accounts:</strong> Standard legal accounting hierarchy (Assets 1000, Liabilities 2000, Equity 3000, Revenue 4000, Expenses 5000). Provides standalone accounting visibility alongside CosmoLex.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="Chart of Accounts"
        subtitle="Standardized general ledger account classifications and balance summaries."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'Chart of Accounts' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddAccountOpen(true)}>
            New Ledger Account
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">1000 Total Assets</span>
          <span className="text-xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalAssets)}</span>
          <span className="text-[11px] text-emerald-700">Operating, IOLTA &amp; Receivables</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">2000 Total Liabilities</span>
          <span className="text-xl font-bold text-red-700 mt-1 block">{formatCurrency(totalLiabilities)}</span>
          <span className="text-[11px] text-[#667085]">Trust Liabilities &amp; Payables</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">4000 Year-to-Date Revenue</span>
          <span className="text-xl font-bold text-emerald-800 mt-1 block">{formatCurrency(totalRevenue)}</span>
          <span className="text-[11px] text-[#667085]">Hourly, Flat &amp; Contingency Fees</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">5000 Operating Expenses</span>
          <span className="text-xl font-bold text-amber-800 mt-1 block">{formatCurrency(totalExpenses)}</span>
          <span className="text-[11px] text-[#667085]">Salaries, Lease, Practice Subscriptions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search account code, name, category..."
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F5F0E5] p-1 rounded-lg border border-[#D9D6CF] text-xs">
          {['ALL', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#06244B] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#06244B]'
              }`}
            >
              {cat === 'ALL' ? 'All Classes' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
              <tr>
                <th className="p-3">Account #</th>
                <th className="p-3">Account Legal Title</th>
                <th className="p-3">Financial Class</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]">
              {filteredAccounts.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#A4432B]">{acc.code}</td>
                  <td className="p-3 font-semibold text-[#06244B]">{acc.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      acc.type === 'Asset' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      acc.type === 'Liability' ? 'bg-red-50 text-red-700 border border-red-200' :
                      acc.type === 'Revenue' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      acc.type === 'Expense' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="p-3 text-[#667085]">{acc.category}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      {acc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-[#06244B]">{formatCurrency(acc.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Account Modal */}
      <Modal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        title="Add New General Ledger Account"
        subtitle="Chart of Accounts Structure (Utah Bar Accounting Standard)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Account Code (e.g. 1060)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="4-digit code"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Account Class
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                <option value="Asset">Asset (1000s)</option>
                <option value="Liability">Liability (2000s)</option>
                <option value="Equity">Equity (3000s)</option>
                <option value="Revenue">Revenue (4000s)</option>
                <option value="Expense">Expense (5000s)</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Account Legal Title"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Expert Witness Retainer Advance"
              required
            />
          </div>

          <div>
            <Input
              label="Sub-Category Classification"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Direct Case Costs"
              required
            />
          </div>

          <div>
            <Input
              label="Opening Ledger Balance ($)"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddAccountOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={Plus}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

