import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, ShieldAlert, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ledgerService } from '../../../services/ledgerService';
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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ledgerService.getAccounts();
      const raw = Array.isArray(res) ? res : (Array.isArray(res?.accounts) ? res.accounts : (res?.data || []));
      if (Array.isArray(raw) && raw.length > 0) {
        setAccounts(
          raw.map((a) => ({
            code: String(a.accountNumber),
            name: a.accountName,
            type: a.accountType,
            category: a.accountType === 'Asset' ? 'Current Assets' : a.accountType,
            balance: Number(a.balance) || 0,
            status: a.isActive ? 'Active' : 'Inactive',
          }))
        );
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.warn('Could not load accounts from API:', err?.message);
      setError(err?.message || 'Failed to connect to authoritative Chart of Accounts database.');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Expense');
  const [newCategory, setNewCategory] = useState('Operating Expense');
  const [newBalance, setNewBalance] = useState(0);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const parsedCode = parseInt(newCode.trim(), 10);
    if (isNaN(parsedCode) || !newName.trim()) {
      addToast('Please enter a valid numeric account code and account title.', 'error');
      return;
    }

    try {
      await ledgerService.createAccount({
        accountNumber: parsedCode,
        accountName: newName.trim(),
        accountType: newType,
        isActive: true,
      });
      addToast(`Account #${parsedCode} (${newName.trim()}) persisted to Chart of Accounts in MySQL.`, 'success');
      setIsAddAccountOpen(false);
      setNewCode('');
      setNewName('');
      setNewBalance(0);
      await loadAccounts();
    } catch (err) {
      addToast(err?.message || 'Failed to create account in database.', 'error');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      searchQuery === '' ||
      acc.code.includes(searchQuery) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || acc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAssets = accounts.filter((a) => a.type === 'Asset').reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter((a) => a.type === 'Liability').reduce((s, a) => s + a.balance, 0);
  const totalRevenue = accounts.filter((a) => a.type === 'Revenue').reduce((s, a) => s + a.balance, 0);
  const totalExpenses = accounts.filter((a) => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        subtitle="Standardized general ledger account classifications and balance summaries (Assets 1000, Liabilities 2000, Equity 3000, Revenue 4000, Expenses 5000)."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'Chart of Accounts' },
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
          <span className="text-[11px] text-emerald-700">Legal Fees Earned</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">5000 Total Expenses</span>
          <span className="text-xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalExpenses)}</span>
          <span className="text-[11px] text-[#667085]">Operating &amp; Advanced Litigation</span>
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
          {['ALL', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((cat) => (
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

      {/* Accounts Table with Separate Loading, Error and Empty States */}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#667085]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#06244B]" />
                      <span>Loading authoritative Chart of Accounts from database...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs">
                    <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-2">
                      <div className="flex items-center justify-center gap-2 font-bold text-sm">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Database Connectivity Error</span>
                      </div>
                      <p className="text-xs text-red-700">{error}</p>
                      <Button size="sm" variant="outline" onClick={loadAccounts} className="mt-2">
                        Retry Loading
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#667085]">
                    No Chart of Accounts records found in database.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#A4432B]">{acc.code}</td>
                    <td className="p-3 font-semibold text-[#06244B]">{acc.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.type === 'Asset'
                            ? 'bg-blue-100 text-blue-800'
                            : acc.type === 'Liability'
                            ? 'bg-purple-100 text-purple-800'
                            : acc.type === 'Revenue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : acc.type === 'Expense'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3 text-[#667085]">{acc.category}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {acc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#06244B]">{formatCurrency(acc.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Account Modal */}
      <Modal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        title="Add New General Ledger Account"
        subtitle="Chart of Accounts Master Definition"
      >
        <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-semibold text-[#06244B] block mb-1">
              Account Number (e.g. 1030, 2150, 5020)
            </label>
            <Input
              type="number"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. 1030"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#06244B] block mb-1">Account Legal Title</label>
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Payroll Operating Clearing"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#06244B] block mb-1">Financial Classification</label>
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
            <div>
              <label className="text-xs font-semibold text-[#06244B] block mb-1">Category Classification</label>
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Current Assets"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddAccountOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Account to Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
