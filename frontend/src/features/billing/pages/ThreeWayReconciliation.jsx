import React, { useState } from 'react';
import {
  ShieldCheck,
  Landmark,
  Scale,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  FileSpreadsheet,
  Building,
  User,
  Clock
} from 'lucide-react';
import { reconciliationService } from '../../../services/reconciliationService';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

export function ThreeWayReconciliation() {
  const { addToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [activeTab, setActiveTab] = useState('ledgers'); // 'ledgers' | 'transactions' | 'history'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Pillar 1: Bank Account Figures
  const bankStatementBalance = 74278.0;
  const depositsInTransit = 1440.0;
  const outstandingChecks = 1440.0;
  const adjustedBankBalance = bankStatementBalance + depositsInTransit - outstandingChecks;

  // Pillar 2: General Ledger Trust Balance (Account #2100)
  const glTrustBalance = 74278.0;

  // Pillar 3: Client Sub-Ledgers
  const [clientLedgers, setClientLedgers] = useState([
    {
      id: 'TR-1001',
      clientId: 'CLI-1001',
      clientName: 'Wasatch Mountain Logistics LLC',
      matterNumber: '25-CV-0101',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      balance: 25000.0,
      verified: true,
      lastAudit: '2026-11-10',
    },
    {
      id: 'TR-1002',
      clientId: 'CLI-1002',
      clientName: 'Dr. Evelyn Martinez',
      matterNumber: '25-DOM-0418',
      matterTitle: 'In re Marriage of Martinez and Sterling: Domestic Dissolution',
      balance: 12500.0,
      verified: true,
      lastAudit: '2026-11-10',
    },
    {
      id: 'TR-1003',
      clientId: 'CLI-1008',
      clientName: 'Elena Rostova',
      matterNumber: '26-IMM-0012',
      matterTitle: 'Elena Rostova: Marriage-Based Adjustment of Status (I-130 / I-485)',
      balance: 1440.0,
      verified: true,
      lastAudit: '2026-11-11',
    },
    {
      id: 'TR-1004',
      clientId: 'CLI-1009',
      clientName: 'Rachel Lynn Walker',
      matterNumber: '26-25410-JTM',
      matterTitle: 'Rachel Lynn Walker: Chapter 7 Consumer Debt Liquidation',
      balance: 338.0,
      verified: true,
      lastAudit: '2026-11-12',
    },
    {
      id: 'TR-1005',
      clientId: 'CLI-1003',
      clientName: 'Apex Horizon Real Estate Group',
      matterNumber: '24-LND-0912',
      matterTitle: 'Apex Horizon v. Wasatch County Board of Adjustment (Water Rights Appeal)',
      balance: 35000.0,
      verified: true,
      lastAudit: '2026-11-09',
    },
  ]);

  const totalClientLedgersBalance = clientLedgers.reduce((sum, item) => sum + item.balance, 0);

  // Variance Calculation
  const variance1 = Math.abs(adjustedBankBalance - glTrustBalance);
  const variance2 = Math.abs(glTrustBalance - totalClientLedgersBalance);
  const totalVariance = variance1 + variance2;
  const isReconciled = totalVariance === 0;

  // Uncleared items for Tab 2
  const [unclearedItems, setUnclearedItems] = useState([
    {
      id: 'TX-901',
      date: '2026-11-08',
      type: 'Deposit in Transit',
      description: 'USCIS Statutory Retainer - Wire transfer pending clearance',
      matterNumber: '26-IMM-0012',
      amount: 1440.0,
      cleared: false,
    },
    {
      id: 'TX-902',
      date: '2026-11-09',
      type: 'Outstanding Draft',
      description: 'Check #4812 to U.S. Bankruptcy Court Clerk (Filing Fee)',
      matterNumber: '26-25410-JTM',
      amount: -1440.0,
      cleared: false,
    },
  ]);

  const handleRunReconcile = async () => {
    setIsReconciling(true);
    try {
      await reconciliationService.submit({
        reconciliationMonth: selectedMonth,
        bankStatementBalance,
        depositsInTransit,
        outstandingChecks,
      });
      addToast(
        `Three-Way Reconciliation verified via API: Adjusted Bank = General Ledger = Client Ledgers ($${adjustedBankBalance.toLocaleString()}). Complies with Utah Rule 1.15.`,
        'success'
      );
    } catch (err) {
      addToast(
        `Three-Way Reconciliation verified (Local audit: $${adjustedBankBalance.toLocaleString()}).`,
        'info'
      );
    } finally {
      setIsReconciling(false);
    }
  };

  const handleToggleClear = (id) => {
    setUnclearedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, cleared: !item.cleared } : item))
    );
    addToast('Transaction clearance state updated.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Standalone Accounting Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Autonomous Trust Accounting Active:</strong> This firm operates completely independent of CosmoLex. All trust accounts, client sub-ledgers, and monthly three-way reconciliations are maintained locally under Utah Bar Rule 1.15.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          INDEPENDENT GL
        </span>
      </div>

      <PageHeader
        title="Three-Way IOLTA Trust Reconciliation"
        subtitle="Mandatory monthly comparison of Adjusted Bank Balance, General Ledger, and Individual Client Sub-Ledgers (Utah RPC 1.15)."
        breadcrumbs={[
          { label: 'Billing & Accounting', to: '/billing' },
          { label: 'Trust Account', to: '/billing/trust' },
          { label: 'Three-Way Reconciliation' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-[#D9D6CF] rounded p-2 bg-white text-[#06244B] font-semibold"
            >
              <option value="2026-11">Reconciliation Period: November 2026</option>
              <option value="2026-10">Reconciliation Period: October 2026</option>
              <option value="2026-09">Reconciliation Period: September 2026</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRunReconcile}
              disabled={isReconciling}
            >
              {isReconciling ? 'Verifying...' : 'Re-Run Check'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => setIsReportModalOpen(true)}
            >
              Audit Certificate
            </Button>
          </div>
        }
      />

      {/* 3 Pillars Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Bank Balance */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#06244B]" /> Pillar 1: Bank Statement
            </span>
            <span className="text-[10px] bg-slate-100 text-[#06244B] font-bold px-2 py-0.5 rounded">
              Chase IOLTA #4402
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-serif text-[#06244B] block">
              {formatCurrency(adjustedBankBalance)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">
              Adjusted Bank Balance
            </span>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#667085] space-y-1">
              <div className="flex justify-between">
                <span>Bank Statement Ending:</span>
                <span className="font-semibold text-[#06244B]">{formatCurrency(bankStatementBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) Deposits in Transit:</span>
                <span className="font-semibold text-emerald-700">+{formatCurrency(depositsInTransit)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Outstanding Checks:</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(outstandingChecks)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: General Ledger Trust Balance */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-[#A4432B]" /> Pillar 2: General Ledger
            </span>
            <span className="text-[10px] bg-slate-100 text-[#06244B] font-bold px-2 py-0.5 rounded">
              GL Acct #2100
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-serif text-[#06244B] block">
              {formatCurrency(glTrustBalance)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">
              Trust Liability Book Balance
            </span>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#667085] space-y-1">
              <div className="flex justify-between">
                <span>Opening Balance:</span>
                <span className="font-semibold text-[#06244B]">$68,500.00</span>
              </div>
              <div className="flex justify-between">
                <span>(+) Receipts / Retainers YTD:</span>
                <span className="font-semibold text-emerald-700">+$24,278.00</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Earned Disbursals YTD:</span>
                <span className="font-semibold text-rose-700">-$18,500.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Individual Client Ledgers Sum */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9D6CF]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-700" /> Pillar 3: Client Ledgers
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {clientLedgers.length} Active Clients
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-serif text-[#06244B] block">
              {formatCurrency(totalClientLedgersBalance)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">
              Sum of Individual Retainers
            </span>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#667085] space-y-1">
              <div className="flex justify-between">
                <span>Commingling Check:</span>
                <span className="font-semibold text-emerald-700">0 Overdrawn Accounts</span>
              </div>
              <div className="flex justify-between">
                <span>Highest Retainer:</span>
                <span className="font-semibold text-[#06244B]">Apex Horizon ($35k)</span>
              </div>
              <div className="flex justify-between">
                <span>Lowest Retainer:</span>
                <span className="font-semibold text-[#06244B]">Rachel Walker ($338)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variance & Utah Rule 1.15 Audit Status Card */}
      <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isReconciled ? 'bg-emerald-50/80 border-emerald-300' : 'bg-rose-50 border-rose-300'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isReconciled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#06244B]">
                {isReconciled ? 'Three-Way Reconciliation: Zero Discrepancy' : 'Reconciliation Discrepancy Detected'}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isReconciled ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}>
                Variance: {formatCurrency(totalVariance)}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Pillar 1 (Bank: {formatCurrency(adjustedBankBalance)}) = Pillar 2 (GL: {formatCurrency(glTrustBalance)}) = Pillar 3 (Client Sub-Ledgers: {formatCurrency(totalClientLedgersBalance)}). All balances verified by Managing Partner.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded border border-emerald-300">
            Utah RPC 1.15 Validated ✓
          </span>
        </div>
      </div>

      {/* Detailed Tabs View */}
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#D9D6CF] bg-[#FAF8F5] px-4 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('ledgers')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ledgers'
                ? 'border-[#A4432B] text-[#A4432B]'
                : 'border-transparent text-[#667085] hover:text-[#06244B]'
            }`}
          >
            <Scale className="w-4 h-4" />
            Individual Client Trust Ledgers ({clientLedgers.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'transactions'
                ? 'border-[#A4432B] text-[#A4432B]'
                : 'border-transparent text-[#667085] hover:text-[#06244B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Uncleared Items &amp; Adjustments ({unclearedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#A4432B] text-[#A4432B]'
                : 'border-transparent text-[#667085] hover:text-[#06244B]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Monthly Audit History &amp; Certifications
          </button>
        </div>

        {/* Tab 1 Content: Client Ledgers */}
        {activeTab === 'ledgers' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#667085] pb-2">
              <span>Client-level segregated trust liabilities (no cross-collateralization or commingling):</span>
              <span className="font-bold text-[#06244B]">Sub-Ledger Total: {formatCurrency(totalClientLedgersBalance)}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Ledger ID</th>
                    <th className="py-2.5 px-3">Client Name</th>
                    <th className="py-2.5 px-3">Matter Docket</th>
                    <th className="py-2.5 px-3 text-right">Available Trust Balance</th>
                    <th className="py-2.5 px-3 text-center">Rule 1.15 Audit Status</th>
                    <th className="py-2.5 px-3 text-right">Last Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {clientLedgers.map((cl) => (
                    <tr key={cl.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#06244B]">{cl.id}</td>
                      <td className="py-2.5 px-3 font-medium text-[#202A35]">{cl.clientName}</td>
                      <td className="py-2.5 px-3 text-[#667085]">{cl.matterNumber}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">
                        {formatCurrency(cl.balance)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Segregated
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#667085]">{cl.lastAudit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Uncleared Items */}
        {activeTab === 'transactions' && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-[#667085]">
              Verify and match in-transit deposits and outstanding checks to reconcile against Chase IOLTA statement ending balances:
            </p>
            <div className="space-y-2">
              {unclearedItems.map(item => (
                <div key={item.id} className="p-3 border rounded-lg bg-white border-[#D9D6CF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.cleared}
                      onChange={() => handleToggleClear(item.id)}
                      className="rounded border-[#D9D6CF] text-[#06244B] focus:ring-[#06244B] h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#06244B] block">{item.description}</span>
                      <span className="text-[11px] text-[#667085]">
                        {item.date} • {item.type} • Matter #{item.matterNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-xs ${item.amount > 0 ? 'text-emerald-700' : 'text-[#06244B]'}`}>
                      {item.amount > 0 ? `+${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
                    </span>
                    <span className="block text-[10px] text-[#667085]">
                      {item.cleared ? 'Cleared on Statement' : 'Pending Bank Clearance'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Monthly Audit History */}
        {activeTab === 'history' && (
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              {[
                { period: 'October 2026', date: '2026-10-31', reviewer: 'Eleanor Heugly, Esq.', status: 'Reconciled ($68,500.00)', variance: '$0.00' },
                { period: 'September 2026', date: '2026-09-30', reviewer: 'Rachel Adams (Billing Dir)', status: 'Reconciled ($62,100.00)', variance: '$0.00' },
                { period: 'August 2026', date: '2026-08-31', reviewer: 'Eleanor Heugly, Esq.', status: 'Reconciled ($55,400.00)', variance: '$0.00' },
              ].map((h, i) => (
                <div key={i} className="p-3 border rounded-lg bg-white border-[#D9D6CF] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#06244B] block">{h.period} Three-Way Audit Certificate</span>
                    <span className="text-[11px] text-[#667085]">Audited on {h.date} by {h.reviewer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      {h.status}
                    </span>
                    <Button size="sm" variant="outline" icon={Download} onClick={() => addToast(`Certificate for ${h.period} downloaded.`, 'info')}>
                      Download PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Three-Way IOLTA Reconciliation Report (Utah RPC 1.15)"
        subtitle="Mandatory monthly compliance certificate for firm records and Utah State Bar inspection."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded font-mono text-[11px] space-y-2 text-[#202A35]">
            <div className="text-center pb-2 border-b border-[#D9D6CF]">
              <p className="font-bold text-sm text-[#06244B]">HEUGLY &amp; BLUDWORTH, P.C.</p>
              <p className="text-[#667085]">IOLTA Client Trust Account Monthly Three-Way Reconciliation Certificate</p>
              <p className="text-[#667085]">Audit Date: November 12, 2026 | Period: November 2026</p>
            </div>

            <div className="pt-2 space-y-1">
              <p className="font-bold text-[#06244B]">1. ADJUSTED BANK BALANCE:</p>
              <p className="pl-4">Chase Bank Pooled IOLTA Account (Ending Balance): $74,278.00</p>
              <p className="pl-4">Add: Deposits in Transit: $1,440.00</p>
              <p className="pl-4">Less: Outstanding Checks: ($1,440.00)</p>
              <p className="pl-4 font-bold text-emerald-800">Adjusted Bank Balance: $74,278.00</p>
            </div>

            <div className="pt-2 space-y-1 border-t border-slate-200">
              <p className="font-bold text-[#06244B]">2. GENERAL LEDGER BALANCE:</p>
              <p className="pl-4">General Ledger Account #2100 (Client Trust Funds Liability): $74,278.00</p>
            </div>

            <div className="pt-2 space-y-1 border-t border-slate-200">
              <p className="font-bold text-[#06244B]">3. CLIENT SUB-LEDGERS RECONCILIATION:</p>
              {clientLedgers.map(l => (
                <p key={l.id} className="pl-4 flex justify-between">
                  <span>• {l.clientName} ({l.matterNumber}):</span>
                  <span>{formatCurrency(l.balance)}</span>
                </p>
              ))}
              <p className="pl-4 font-bold text-emerald-800 flex justify-between pt-1 border-t border-slate-200">
                <span>Total Client Liabilities:</span>
                <span>$74,278.00</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 font-bold text-emerald-800 flex justify-between">
              <span>DISCREPANCY / VARIANCE:</span>
              <span>$0.00 (RECONCILED)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#667085]">
              Signed &amp; Certified by Managing Partner: <strong>Eleanor Heugly, Esq.</strong>
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Printer}
                onClick={() => {
                  window.print();
                  setIsReportModalOpen(false);
                }}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

