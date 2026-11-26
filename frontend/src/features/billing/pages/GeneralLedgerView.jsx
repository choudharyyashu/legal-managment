import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, Filter, Search, Calendar, Download, FileSpreadsheet, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { ledgerService } from '../../../services/ledgerService';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { useToast } from '../../../components/ui/Toast';

export function GeneralLedgerView() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJournals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ledgerService.getJournals();
      const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.journals || []));
      setJournalEntries(
        raw.map((j) => {
          const rawEntries = j.entries || j.lines || [];
          const debits = rawEntries.filter((e) => Number(e.debit) > 0);
          const credits = rawEntries.filter((e) => Number(e.credit) > 0);
          const debitAmount = Number(j.totalDebit) || debits.reduce((sum, e) => sum + Number(e.debit), 0);
          const creditAmount = Number(j.totalCredit) || credits.reduce((sum, e) => sum + Number(e.credit), 0);
          const debitAccountsStr = debits.map((e) => `${e.accountNumber}${e.accountName ? ` (${e.accountName})` : ''}`).join(', ') || '—';
          const creditAccountsStr = credits.map((e) => `${e.accountNumber}${e.accountName ? ` (${e.accountName})` : ''}`).join(', ') || '—';

          return {
            id: j.journalNumber || j.id,
            date: j.entryDate ? new Date(j.entryDate).toISOString().split('T')[0] : (j.transactionDate ? j.transactionDate.split('T')[0] : ''),
            ref: j.reference || j.memo || 'GL-REF',
            description: j.memo || j.description || 'Journal Entry',
            accountDebit: debitAccountsStr,
            debit: debitAmount,
            accountCredit: creditAccountsStr,
            credit: creditAmount,
            postedBy: j.postedByUser?.name || j.createdByName || j.postedByName || 'Authorized User',
          };
        })
      );
    } catch (err) {
      console.warn('Could not load journals from API:', err?.message);
      setError(err?.message || 'Failed to connect to authoritative General Ledger database.');
      setJournalEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.accountDebit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.accountCredit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAccount =
      accountFilter === 'ALL' ||
      entry.accountDebit.includes(accountFilter) ||
      entry.accountCredit.includes(accountFilter);

    return matchesSearch && matchesAccount;
  });

  const totalDebits = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const handleExportJournal = () => {
    try {
      const headers = [
        'Journal Entry #',
        'Date',
        'Source Reference',
        'Transaction Narrative',
        'Debit Account',
        'Debit Amount ($)',
        'Credit Account',
        'Credit Amount ($)',
        'Authorized By',
      ];

      const rows = filteredEntries.map((e) => [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.ref || ''}"`,
        `"${(e.description || '').replace(/"/g, '""')}"`,
        `"${(e.accountDebit || '').replace(/"/g, '""')}"`,
        Number(e.debit).toFixed(2),
        `"${(e.accountCredit || '').replace(/"/g, '""')}"`,
        Number(e.credit).toFixed(2),
        `"${(e.postedBy || '').replace(/"/g, '""')}"`,
      ]);

      rows.push([
        '"TOTAL / BALANCED SUMMARY"',
        '""',
        '""',
        '"Trial Balance Verification (Utah Bar Rule 1.15 Double-Entry Audit)"',
        '"Total Debits"',
        totalDebits.toFixed(2),
        '"Total Credits"',
        totalCredits.toFixed(2),
        '""',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `General_Ledger_Double_Entry_Journal_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('General Ledger Journal exported successfully as CSV!', 'success');
    } catch (err) {
      console.error('Failed to export journal:', err);
      addToast('Failed to export journal. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger Double-Entry Journal"
        subtitle="Chronological audit record of balanced legal debits and credits across all accounts (Utah RPC 1.15)."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'General Ledger' },
        ]}
        actions={
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportJournal}>
            Export Journal (.CSV)
          </Button>
        }
      />

      {/* Balance Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Journal Debits</span>
          <span className="text-xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalDebits)}</span>
          <span className="text-[11px] text-emerald-700">Bank deposits &amp; expense debits</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Journal Credits</span>
          <span className="text-xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalCredits)}</span>
          <span className="text-[11px] text-[#667085]">Trust liability &amp; fee income</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Double-Entry Trial Balance</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xl font-bold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-emerald-700' : 'text-red-700'}`}
            >
              {Math.abs(totalDebits - totalCredits) < 0.01 ? 'In Perfect Balance' : `Variance: ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
            </span>
          </div>
          <span className="text-[11px] text-[#667085]">Utah Supreme Court mandatory zero-variance rule</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search journal #, ref, narrative, account..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#06244B]">Account Filter:</span>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="text-xs p-1.5 rounded border border-[#D9D6CF] bg-white font-medium"
          >
            <option value="ALL">All Accounts</option>
            <option value="1010">1010 - Operating Account</option>
            <option value="1020">1020 - Trust Account (IOLTA)</option>
            <option value="1200">1200 - Accounts Receivable</option>
            <option value="2100">2100 - Client Trust Liability</option>
            <option value="4000">4000 - Fee Revenue</option>
            <option value="5000">5000 - Operating Expenses</option>
            <option value="5010">5010 - Litigation Costs</option>
          </select>
        </div>
      </div>

      {/* Journal Table with Separate Loading, Error and Empty States */}
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
              <tr>
                <th className="p-3">Journal Entry # &amp; Date</th>
                <th className="p-3">Source Ref</th>
                <th className="p-3">Transaction Narrative</th>
                <th className="p-3">Debit Account</th>
                <th className="p-3 text-right">Debit ($)</th>
                <th className="p-3">Credit Account</th>
                <th className="p-3 text-right">Credit ($)</th>
                <th className="p-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#667085]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#06244B]" />
                      <span>Loading authoritative General Ledger journal entries from database...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs">
                    <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-2">
                      <div className="flex items-center justify-center gap-2 font-bold text-sm">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Database Connectivity Error</span>
                      </div>
                      <p className="text-xs text-red-700">{error}</p>
                      <Button size="sm" variant="outline" onClick={loadJournals} className="mt-2">
                        Retry Loading
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#667085]">
                    No General Ledger journal entries found in database.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-[#A4432B] block">{entry.id}</span>
                      <span className="text-[11px] text-[#667085]">{formatDate(entry.date)}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-[#06244B]">{entry.ref}</td>
                    <td className="p-3 font-medium text-[#202A35] max-w-xs">{entry.description}</td>
                    <td className="p-3 text-blue-900 font-semibold">{entry.accountDebit}</td>
                    <td className="p-3 text-right font-bold text-blue-800">{formatCurrency(entry.debit)}</td>
                    <td className="p-3 text-red-900 font-semibold">{entry.accountCredit}</td>
                    <td className="p-3 text-right font-bold text-red-800">{formatCurrency(entry.credit)}</td>
                    <td className="p-3 text-[#667085] text-[11px]">{entry.postedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#F5F0E5]/60 font-bold border-t-2 border-[#D9D6CF]">
              <tr>
                <td colSpan={4} className="p-3 text-right text-xs text-[#06244B] uppercase">Total Balanced Postings:</td>
                <td className="p-3 text-right font-bold text-blue-800">{formatCurrency(totalDebits)}</td>
                <td className="p-3"></td>
                <td className="p-3 text-right font-bold text-red-800">{formatCurrency(totalCredits)}</td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
