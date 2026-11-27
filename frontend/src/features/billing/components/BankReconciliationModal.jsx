import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check,
  DollarSign,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { reconciliationService } from '../../../services/reconciliationService';
import { useAuth } from '../../../hooks/useAuth';

export function BankReconciliationModal({
  isOpen,
  onClose,
  initialPeriod = '2026-10',
  onReconciliationComplete,
}) {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [period, setPeriod] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form input states (manual entry of external bank statement)
  const [openingBalance, setOpeningBalance] = useState('');
  const [statementEndingBalance, setStatementEndingBalance] = useState('');
  const [bookAdjustments, setBookAdjustments] = useState('');
  const [certificationNotes, setCertificationNotes] = useState('');

  // Status and items from backend API
  const [statementItems, setStatementItems] = useState([]);
  const [gl1010BookBalance, setGl1010BookBalance] = useState(0);
  const [glDataAvailable, setGlDataAvailable] = useState(false);

  // Load reconciliation state from backend API
  const loadReconciliationStatus = useCallback(
    async (targetPeriod, customEnding, customOpening, customAdj) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = { reconciliationPeriod: targetPeriod };
        if (customEnding !== undefined && customEnding !== '') {
          queryParams.statementEndingBalance = Number(customEnding);
        }
        if (customOpening !== undefined && customOpening !== '') {
          queryParams.statementOpeningBalance = Number(customOpening);
        }
        if (customAdj !== undefined && customAdj !== '') {
          queryParams.bookAdjustments = Number(customAdj);
        }

        const data = await reconciliationService.getOperatingStatus(queryParams);
        if (data) {
          setGl1010BookBalance(Number(data.gl1010BookBalance) || 0);
          setGlDataAvailable(Boolean(data.glDataAvailable));

          if (Array.isArray(data.items)) {
            setStatementItems(data.items);
          } else {
            setStatementItems([]);
          }
        }
      } catch (err) {
        console.warn('Could not load operating reconciliation from API:', err?.message);
        setError(err?.message || 'Failed to load operating bank reconciliation status.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      loadReconciliationStatus(period);
    }
  }, [isOpen, period, loadReconciliationStatus]);

  // Handle month / period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setOpeningBalance('');
    setStatementEndingBalance('');
    setBookAdjustments('');
    loadReconciliationStatus(newPeriod);
  };

  // Toggle clearance status for a transaction in live component state
  const toggleCleared = (id) => {
    setStatementItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, cleared: !item.cleared };
        }
        return item;
      })
    );
  };

  // Dynamic calculations based on live UI state
  const hasOpening = openingBalance !== '' && Number.isFinite(Number(openingBalance));
  const hasEnding = statementEndingBalance !== '' && Number.isFinite(Number(statementEndingBalance));

  const parsedOpening = hasOpening ? Number(openingBalance) : null;
  const parsedEnding = hasEnding ? Number(statementEndingBalance) : null;
  const parsedAdjustments = bookAdjustments !== '' && Number.isFinite(Number(bookAdjustments)) ? Number(bookAdjustments) : 0;

  // Book Side: Independent GL 1010 Book Balance + Book Adjustments
  const adjustedBookBalance = Number((gl1010BookBalance + parsedAdjustments).toFixed(2));

  // Cleared Activity
  const clearedInflows = statementItems
    .filter((i) => i.cleared && i.type === 'Credit')
    .reduce((sum, i) => sum + i.amount, 0);

  const clearedOutflows = statementItems
    .filter((i) => i.cleared && i.type === 'Debit')
    .reduce((sum, i) => sum + i.amount, 0);

  const clearedNetTransactions = Number((clearedInflows - clearedOutflows).toFixed(2));

  // Bank Side adjustments
  // Deposits in transit = Valid uncleared inflows on or before cutoff date
  const depositsInTransit = statementItems
    .filter((i) => !i.cleared && i.type === 'Credit')
    .reduce((sum, i) => sum + i.amount, 0);

  // Outstanding checks = Valid uncleared outflows on or before cutoff date
  const outstandingChecks = statementItems
    .filter((i) => !i.cleared && i.type === 'Debit')
    .reduce((sum, i) => sum + i.amount, 0);

  // Adjusted Bank Balance = Ending Statement Balance + Deposits in Transit - Outstanding Checks
  const adjustedBankBalance = hasEnding ? Number((parsedEnding + depositsInTransit - outstandingChecks).toFixed(2)) : null;

  // Final Reconciliation Variance = Adjusted Bank Balance - Independently Calculated GL Book Balance
  const variance = adjustedBankBalance !== null ? Number((adjustedBankBalance - adjustedBookBalance).toFixed(2)) : null;

  const isBalanced =
    variance !== null && Math.abs(variance) < 0.01 && hasOpening && hasEnding && glDataAvailable;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Operating Bank Statement Reconciliation"
      subtitle={`Commercial Operating Account • General Ledger Account #1010 • Period: ${period}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Period Selector & Schema Migration Notice Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#06244B]" />
            <span className="font-bold text-[#06244B]">Reconciliation Month:</span>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              disabled={loading}
              className="bg-white border border-[#D9D6CF] rounded px-2 py-1 font-bold text-xs text-[#06244B]"
            >
              <option value="2026-11">November 2026 (2026-11)</option>
              <option value="2026-10">October 2026 (2026-10)</option>
              <option value="2026-09">September 2026 (2026-09)</option>
              <option value="2026-08">August 2026 (2026-08)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded text-[11px] border border-amber-300">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span>Dedicated DB Schema Required for Final Certification</span>
          </div>
        </div>

        {/* Database Support Requirement Alert (Requirement 7) */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-950 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#06244B]">Operating Bank Reconciliation Verification Engine</p>
            <p className="text-[11px] text-blue-900">
              Live mathematical calculation, General Ledger Account 1010 book balance integration, period cutoff filtering, and clearance auditing are active. Final permanent certification is disabled pending database schema migration of the dedicated <code>OperatingBankReconciliation</code> model.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="xs" variant="outline" type="button" onClick={() => loadReconciliationStatus(period)}>
              Retry
            </Button>
          </div>
        )}

        {/* Independent Bank Statement Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white border border-[#D9D6CF] rounded-lg">
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">
              Statement Opening Balance ($)
            </span>
            <input
              type="number"
              step="0.01"
              disabled={loading}
              value={openingBalance}
              placeholder="e.g. 50000.00"
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="mt-1 font-bold text-sm text-[#06244B] bg-slate-50 border border-[#D9D6CF] rounded p-1.5 w-full"
              required
            />
            <span className="text-[10px] text-[#667085] mt-0.5 block">From external bank statement start date</span>
          </div>

          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">
              Statement Ending Balance ($)
            </span>
            <input
              type="number"
              step="0.01"
              disabled={loading}
              value={statementEndingBalance}
              placeholder="e.g. 57500.00"
              onChange={(e) => setStatementEndingBalance(e.target.value)}
              className="mt-1 font-bold text-sm text-[#06244B] bg-slate-50 border border-[#D9D6CF] rounded p-1.5 w-full"
              required
            />
            <span className="text-[10px] text-[#667085] mt-0.5 block">From external bank statement cutoff date</span>
          </div>

          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">
              Book-Side Adjustments ($)
            </span>
            <input
              type="number"
              step="0.01"
              disabled={loading}
              value={bookAdjustments}
              placeholder="0.00"
              onChange={(e) => setBookAdjustments(e.target.value)}
              className="mt-1 font-bold text-sm text-[#06244B] bg-slate-50 border border-[#D9D6CF] rounded p-1.5 w-full"
            />
            <span className="text-[10px] text-[#667085] mt-0.5 block">Unposted bank fees (-) or interest (+)</span>
          </div>
        </div>

        {/* Four-Pillar Mathematical Balancing Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#F5F0E5]/60 border border-[#D9D6CF] rounded-lg text-center">
          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Adjusted Bank Balance</span>
            <span className="mt-1 font-bold text-sm text-[#06244B] block pt-1">
              {adjustedBankBalance !== null ? formatCurrency(adjustedBankBalance) : 'Pending Ending Bal'}
            </span>
            <span className="text-[10px] text-[#667085]">
              Stmt + {formatCurrency(depositsInTransit)} in transit - {formatCurrency(outstandingChecks)} checks
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Adjusted Book Balance</span>
            <span className="mt-1 font-bold text-sm text-[#06244B] block pt-1">
              {formatCurrency(adjustedBookBalance)}
            </span>
            <span className="text-[10px] text-[#667085]">
              GL 1010 ({formatCurrency(gl1010BookBalance)}) + Adj ({formatCurrency(parsedAdjustments)})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Reconciliation Variance</span>
            <span
              className={`mt-1 font-bold text-sm block pt-1 ${
                variance === null
                  ? 'text-slate-500'
                  : Math.abs(variance) < 0.01
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-red-700 font-extrabold'
              }`}
            >
              {variance !== null ? formatCurrency(variance) : 'Enter Balances'}
            </span>
            <span className="text-[10px] font-semibold">
              {variance !== null && Math.abs(variance) < 0.01 ? (
                <span className="text-emerald-700">Balanced (Zero Variance)</span>
              ) : variance !== null ? (
                <span className="text-red-700">Unreconciled Variance</span>
              ) : (
                <span className="text-slate-500">Awaiting statement inputs</span>
              )}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#667085] uppercase font-bold block">Net Cleared Activity</span>
            <span className="mt-1 font-bold text-sm text-[#06244B] block pt-1">
              {formatCurrency(clearedNetTransactions)}
            </span>
            <span className="text-[10px] text-[#667085]">
              +{formatCurrency(clearedInflows)} / -{formatCurrency(clearedOutflows)}
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xs text-[#06244B] uppercase">
              General Ledger Account #1010 (Operating Cash) Transactions
            </span>
            <span className="text-[11px] text-[#667085]">
              Check box to match book transaction against cleared bank statement
            </span>
          </div>

          <div className="border border-[#D9D6CF] rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold sticky top-0">
                <tr>
                  <th className="p-2 w-8 text-center">Cleared</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">General Ledger Description</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#667085] text-xs">
                      Loading operating ledger records for {period}...
                    </td>
                  </tr>
                ) : statementItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#667085] text-xs">
                      No Account 1010 transactions found on or before the {period} period cutoff date.
                    </td>
                  </tr>
                ) : (
                  statementItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.cleared ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          disabled={loading}
                          checked={item.cleared}
                          onChange={() => toggleCleared(item.id)}
                          className="rounded border-[#D9D6CF] text-[#06244B] focus:ring-0 cursor-pointer h-4 w-4"
                        />
                      </td>
                      <td className="p-2 text-[#667085]">{item.date}</td>
                      <td className="p-2 font-medium text-[#202A35]">{item.description}</td>
                      <td
                        className={`p-2 text-right font-bold ${
                          item.type === 'Credit' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.type === 'Credit' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Utah Legal Accounting Standard Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            <strong>Fiduciary Segregation &amp; Compliance:</strong> Commercial operating accounts must be
            reconciled monthly against independent bank statements with zero variance. Operating funds are strictly
            segregated from fiduciary client trust funds (Account 1020 / 2100).
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              icon={Lock}
              disabled
              title="Permanent certification requires database schema support"
            >
              Certification Disabled (Requires Database Migration)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
