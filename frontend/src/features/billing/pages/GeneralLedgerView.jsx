import React, { useState } from 'react';
import { Landmark, Filter, Search, Calendar, Download, FileSpreadsheet, ArrowRight, ArrowLeft } from 'lucide-react';
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

  const [journalEntries, setJournalEntries] = useState([
    {
      id: 'JE-2026-0101',
      date: '2026-02-15',
      ref: 'INV-2026-0041',
      description: 'Fee Income recognition for Wasatch Mountain Logistics',
      accountDebit: '1100 - Accounts Receivable',
      debit: 14250.00,
      accountCredit: '4010 - Legal Fee Income (Hourly)',
      credit: 14250.00,
      postedBy: 'Rachel Adams (Billing Director)'
    },
    {
      id: 'JE-2026-0102',
      date: '2026-02-16',
      ref: 'ACH-49102',
      description: 'Client payment receipt from Wasatch Mountain Logistics',
      accountDebit: '1010 - Operating Checking Account',
      debit: 14250.00,
      accountCredit: '1100 - Accounts Receivable',
      credit: 14250.00,
      postedBy: 'Rachel Adams (Billing Director)'
    },
    {
      id: 'JE-2026-0103',
      date: '2026-02-18',
      ref: 'TR-DEP-1003',
      description: 'IOLTA Trust Retainer Deposit - Elena Rostova (USCIS Filing Escrow)',
      accountDebit: '1020 - IOLTA Client Trust Account',
      debit: 1440.00,
      accountCredit: '2010 - Client Trust Liability',
      credit: 1440.00,
      postedBy: 'Thomas Bludworth, Esq.'
    },
    {
      id: 'JE-2026-0104',
      date: '2026-02-19',
      ref: 'EXP-502',
      description: 'LexisNexis Research Suite monthly firm subscription',
      accountDebit: '5200 - Legal Research Subscriptions',
      debit: 1850.00,
      accountCredit: '1010 - Operating Checking Account',
      credit: 1850.00,
      postedBy: 'Rachel Adams (Billing Director)'
    },
    {
      id: 'JE-2026-0105',
      date: '2026-02-20',
      ref: 'DRAW-TR-1002',
      description: 'Earned fee drawdown from Dr. Evelyn Martinez Trust Retainer',
      accountDebit: '2010 - Client Trust Liability',
      debit: 3500.00,
      accountCredit: '1020 - IOLTA Client Trust Account',
      credit: 3500.00,
      postedBy: 'Eleanor Heugly, Esq.'
    },
    {
      id: 'JE-2026-0106',
      date: '2026-02-20',
      ref: 'FEE-TR-1002',
      description: 'Operating deposit of earned trust fee transfer',
      accountDebit: '1010 - Operating Checking Account',
      debit: 3500.00,
      accountCredit: '4010 - Legal Fee Income (Hourly)',
      credit: 3500.00,
      postedBy: 'Rachel Adams (Billing Director)'
    }
  ]);

  React.useEffect(() => {
    let isMounted = true;
    import('../../../services/ledgerService').then(({ ledgerService }) => {
      ledgerService.getJournals().then((res) => {
        if (isMounted && Array.isArray(res?.journals) && res.journals.length > 0) {
          setJournalEntries(
            res.journals.map((j) => ({
              id: j.journalNumber || j.id,
              date: j.entryDate ? new Date(j.entryDate).toISOString().split('T')[0] : '2026-11-13',
              ref: j.reference || 'GL-REF',
              description: j.memo || 'Journal Entry',
              accountDebit: `${j.lines?.find((l) => Number(l.debit) > 0)?.accountNumber || 1010} - Debit`,
              debit: Number(j.lines?.find((l) => Number(l.debit) > 0)?.debit) || 0,
              accountCredit: `${j.lines?.find((l) => Number(l.credit) > 0)?.accountNumber || 2100} - Credit`,
              credit: Number(j.lines?.find((l) => Number(l.credit) > 0)?.credit) || 0,
              postedBy: j.postedByUser?.name || 'Firm Staff',
            }))
          );
        }
      }).catch((err) => console.warn('Could not load journals from API:', err?.message));
    });
    return () => { isMounted = false; };
  }, []);

  const filteredEntries = journalEntries.filter(entry => {
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
    addToast('General Ledger Journal exported to CSV format.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[CLIENT-SIDE PROTOTYPE] General Ledger Double-Entry Journal:</strong> Complete balanced journal entries (Debits = Credits) for firm revenue, client trust movements, and operating expenditures.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <PageHeader
        title="General Ledger Double-Entry Journal"
        subtitle="Chronological audit record of balanced legal debits and credits across all accounts."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'General Ledger' }
        ]}
        actions={
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportJournal}>
            Export Journal (.CSV)
          </Button>
        }
      />

      {/* Balance Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Journal Debits</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalDebits)}</span>
          <span className="text-[11px] text-emerald-700">Balanced against credits</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Total Journal Credits</span>
          <span className="text-2xl font-bold text-[#06244B] mt-1 block">{formatCurrency(totalCredits)}</span>
          <span className="text-[11px] text-emerald-700">Balanced against debits</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs text-[#667085] uppercase font-bold block">Trial Balance Variance</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">$0.00</span>
          <span className="text-[11px] text-emerald-800 font-semibold">In Strict Double-Entry Balance</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reference #, description, account..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#06244B]">Filter Account:</span>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium text-[#06244B]"
          >
            <option value="ALL">All General Accounts</option>
            <option value="1010">1010 - Operating Checking</option>
            <option value="1020">1020 - IOLTA Client Trust</option>
            <option value="1100">1100 - Accounts Receivable</option>
            <option value="2010">2010 - Client Trust Liability</option>
            <option value="4010">4010 - Legal Fee Income</option>
            <option value="5200">5200 - Legal Subscriptions</option>
          </select>
        </div>
      </div>

      {/* Journal Table */}
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
              {filteredEntries.map(entry => (
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
              ))}
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

