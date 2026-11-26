import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FolderOpen,
  FileText,
  Clock,
  Edit,
  Plus,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Landmark,
  ShieldAlert,
  DollarSign,
  CheckCircle2,
  Receipt,
  Send,
  Printer,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useTime } from '../../../context/TimeContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ClientForm } from '../forms/ClientForm';
import { MatterForm } from '../../matters/forms/MatterForm';
import { ActivityTimeline } from '../../../components/shared/ActivityTimeline';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { RelatedPartiesTab } from '../../matters/components/RelatedPartiesTab';
import { EngagementLetterModal } from '../components/EngagementLetterModal';

import { clientService } from '../../../services/clientService';
import { intakeService } from '../../../services/intakeService';

export function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, intakes = [], refreshClients, refreshIntakes } = useClients();
  const { getMattersByClient, refreshMatters } = useMatters();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const intakeId = searchParams.get('intakeId');
  const shouldOpenMatter = searchParams.get('openMatter') === 'true';

  const [activeTab, setActiveTab] = useState('matters');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewMatterModalOpen, setIsNewMatterModalOpen] = useState(false);
  const [isEngagementLetterOpen, setIsEngagementLetterOpen] = useState(false);
  const [fetchedClient, setFetchedClient] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [client360, setClient360] = useState(null);
  const [fetchedIntake, setFetchedIntake] = useState(null);

  const loadClient360 = React.useCallback(async (targetId) => {
    if (!targetId) return;
    setLoadingClient(true);
    try {
      const data = await clientService.getClient360(targetId);
      if (data) {
        setClient360(data);
        if (data.client) setFetchedClient(data.client);
      }
    } catch {
      try {
        const fallbackClient = await clientService.getClientById(targetId);
        if (fallbackClient) setFetchedClient(fallbackClient);
      } catch {}
    } finally {
      setLoadingClient(false);
    }
  }, []);

  useEffect(() => {
    setClient360(null);
    loadClient360(clientId);
  }, [clientId, loadClient360]);

  useEffect(() => {
    let isMounted = true;
    if (intakeId) {
      const existing = intakes.find(i => i.id === intakeId || i.intakeNumber === intakeId);
      if (existing) {
        setFetchedIntake(existing);
      } else {
        intakeService.getIntakeById(intakeId).then(res => {
          if (isMounted && res) setFetchedIntake(res);
        }).catch((err) => {
          console.warn('Could not fetch linked intake:', err);
        });
      }
    }
    return () => { isMounted = false; };
  }, [intakeId, intakes]);

  useEffect(() => {
    if (shouldOpenMatter) {
      setIsNewMatterModalOpen(true);
    }
  }, [shouldOpenMatter]);

  const contextClient = clients.find(c => c.id === clientId || c.clientNumber === clientId);
  const client = client360?.client || fetchedClient || contextClient;
  const resolvedClientId = client?.id;

  const clientMatters = client360?.matters
    ? client360.matters
    : resolvedClientId
    ? getMattersByClient(resolvedClientId)
    : [];

  const { invoices } = useTime();
  const linkedIntake = fetchedIntake || (intakeId ? intakes.find(i => i.id === intakeId || i.intakeNumber === intakeId) : null);

  // Strict clientId isolation only (NEVER match by clientName!)
  const clientInvoices = client360?.invoices
    ? client360.invoices
    : (invoices || []).filter(inv => resolvedClientId && inv.clientId === resolvedClientId);

  const totalBilled = client360?.financialSummary
    ? Number(client360.financialSummary.totalBilled || 0)
    : clientInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const totalPaid = client360?.financialSummary
    ? Number(client360.financialSummary.totalPaid || 0)
    : clientInvoices.reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);
  const totalOutstanding = client360?.financialSummary
    ? Number(client360.financialSummary.totalOutstanding || 0)
    : clientInvoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

  const clientTrustLedgers = client360?.trustLedgers || [];
  const clientTrustTransactions = client360?.trustTransactions || [];
  const clientTrustBalance = client360?.financialSummary
    ? Number(client360.financialSummary.trustBalance || 0)
    : 0;

  const clientComms = client360?.communications || [];
  const clientDocs = client360?.documents || [];
  const originatingIntakes = client360?.originatingIntakes || [];
  const clientAuditLogs = client360?.auditLogs || [];

  if (!client && loadingClient) {
    return (
      <div className="p-8 text-center bg-white rounded border border-[#D9D6CF] text-xs text-[#667085]">
        Loading segregated client record...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center bg-white rounded border border-[#D9D6CF]">
        <h2 className="text-xl font-serif text-[#06244B]">Client Record Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'matters', label: 'Related Matters', count: clientMatters.length, icon: FolderOpen },
    { id: 'invoices', label: 'Invoices & Billing', count: clientInvoices.length, icon: CreditCard },
    { id: 'trust-ledger', label: 'IOLTA Trust Ledger', count: clientTrustTransactions.length, icon: Landmark },
    { id: 'communications', label: 'Communications & Calls', count: clientComms.length, icon: MessageSquare },
    { id: 'related-parties', label: 'Related Entities & Adversaries', count: client360?.relatedParties?.length || 0, icon: User },
    { id: 'contact', label: 'Contact & Addresses', icon: User },
    { id: 'documents', label: 'Client Documents', count: clientDocs.length, icon: FileText },
    { id: 'notes', label: 'Internal Notes', icon: MessageSquare },
    { id: 'activity', label: 'Activity History', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
        <Link to="/clients" className="hover:text-[#06244B] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Clients
        </Link>
      </div>

      {/* Client Overview Header Card */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#06244B] text-[#F5F0E5] flex items-center justify-center font-serif font-bold text-xl flex-shrink-0 shadow-sm">
              {client.type === 'Organization' ? <Building2 className="w-7 h-7 text-[#A4432B]" /> : client.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-serif font-bold text-[#06244B]">
                  {client.name}
                </h1>
                <StatusBadge status={client.status} />
                <span className="text-xs px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B] font-semibold border border-[#D9D6CF]">
                  {client.clientNumber || client.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#667085] mt-2">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#A4432B]" /> Contact: <strong>{client.primaryContact || 'N/A'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#06244B]" /> {client.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#06244B]" /> {client.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {permissions.canCreateClient && (
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => setIsEngagementLetterOpen(true)}
            >
              Engagement Letter
            </Button>

            {permissions.canCreateMatter && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsNewMatterModalOpen(true)}
              >
                New Matter for Client
              </Button>
            )}
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#D9D6CF]/60 text-xs">
          <div>
            <span className="text-[#667085] block font-medium">Assigned Counsel:</span>
            <span className="text-sm font-semibold text-[#06244B]">{client.assignedAttorneyName || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Client Since:</span>
            <span className="text-sm font-semibold text-[#06244B]">{formatDate(client.createdAt, { short: true })}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Active Matters:</span>
            <span className="text-sm font-semibold text-[#06244B]">{clientMatters.length} Files</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Ledger Balance:</span>
            <span className={`text-sm font-semibold ${totalOutstanding > 0 ? 'text-[#B42318]' : 'text-[#287A55]'}`}>
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Contents */}
      {activeTab === 'matters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#06244B]">
              Active Matters ({clientMatters.length})
            </h2>
            {permissions.canCreateMatter && (
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={() => setIsNewMatterModalOpen(true)}
              >
                Create Matter
              </Button>
            )}
          </div>

          {clientMatters.length === 0 ? (
            <div className="p-8 text-center bg-white rounded border border-[#D9D6CF]">
              <FolderOpen className="w-8 h-8 text-[#667085] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#06244B]">No matters open for this client.</p>
              <p className="text-xs text-[#667085] mt-1">Open an active matter to begin tracking tasks, documents, and billable time.</p>
              <Button className="mt-4" size="sm" onClick={() => setIsNewMatterModalOpen(true)}>
                Open First Matter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientMatters.map((matter) => (
                <div
                  key={matter.id}
                  onClick={() => navigate(`/matters/${matter.id}`)}
                  className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle hover:border-[#A4432B] hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#A4432B] uppercase tracking-wider">
                      {matter.matterNumber}
                    </span>
                    <StatusBadge status={matter.status} />
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#06244B] mt-1 group-hover:text-[#A4432B] transition-colors">
                    {matter.title}
                  </h3>

                  <p className="text-xs text-[#667085] mt-1 line-clamp-2">
                    {matter.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#D9D6CF]/50 flex items-center justify-between text-xs text-[#667085]">
                    <span>Practice: <strong className="text-[#06244B]">{matter.practiceAreaName}</strong></span>
                    <span>Attorney: <strong className="text-[#06244B]">{matter.responsibleAttorneyName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices & Billing Tab (Clio 360° Requirement) */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Total Invoiced to Date</span>
              <span className="text-xl font-serif font-bold text-[#06244B] mt-1 block">
                {formatCurrency(totalBilled)}
              </span>
              <span className="text-[11px] text-[#667085]">Cumulative billing across all client matters</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Total Collections</span>
              <span className="text-xl font-serif font-bold text-emerald-800 mt-1 block">
                {formatCurrency(totalPaid)}
              </span>
              <span className="text-[11px] text-emerald-700">Recorded payments &amp; trust transfers</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Outstanding Accounts Receivable</span>
              <span className={`text-xl font-serif font-bold mt-1 block ${totalOutstanding > 0 ? 'text-amber-800' : 'text-[#06244B]'}`}>
                {formatCurrency(totalOutstanding)}
              </span>
              <span className="text-[11px] text-[#667085]">Unpaid invoice balances for this client</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-serif text-base font-bold text-[#06244B]">Client Invoices &amp; Statements</h3>
                <p className="text-xs text-[#667085]">All fee and expense statements issued to {client.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" icon={Printer} onClick={() => addToast('Generating full account billing statement PDF...', 'info')}>
                  Print Statement
                </Button>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => navigate('/billing/invoices')}>
                  Draft New Invoice
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Linked Matter</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {clientInvoices.length > 0 ? (
                    clientInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#A4432B]">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-3 text-[#202A35] max-w-xs truncate">{inv.matterTitle}</td>
                        <td className="py-2.5 px-3 text-[#667085]">{inv.issueDate}</td>
                        <td className="py-2.5 px-3 text-[#667085]">{inv.dueDate}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-[#06244B]">{formatCurrency(inv.totalAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">{formatCurrency(inv.balanceDue)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => navigate('/billing/invoices')}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-xs text-[#667085]">
                        No outstanding invoices on file for this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* IOLTA Trust Ledger Tab (Clio 360° Requirement) */}
      {activeTab === 'trust-ledger' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Segregated Client Trust Account (Utah Rule of Professional Conduct 1.15):</strong> Retainer funds are held in Chase IOLTA pooled escrow. Funds cannot be commingled or used for other matters.
              </span>
            </div>
            <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
              ESCROW PROTECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Current Available Trust Balance</span>
              <span className="text-2xl font-serif font-bold text-emerald-800 mt-1 block">
                {formatCurrency(clientTrustBalance)}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                {clientTrustLedgers.length > 0
                  ? `${clientTrustLedgers.length} segregated sub-ledger(s) on file`
                  : 'No segregated trust sub-ledger opened yet'}
              </span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Active Sub-Ledgers</span>
              <span className="text-sm font-bold text-[#06244B] mt-1 block">
                {clientTrustLedgers.length > 0
                  ? clientTrustLedgers.map((l) => l.ledgerCode).join(', ')
                  : 'None'}
              </span>
              <span className="text-[11px] text-[#667085]">Matter-segregated client IOLTA sub-accounts</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle flex flex-col justify-between">
              <span className="text-xs uppercase font-bold text-[#667085] block">Quick Trust Actions</span>
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" variant="outline" icon={ArrowDownLeft} onClick={() => navigate('/billing/trust')}>
                  Deposit Retainer
                </Button>
                <Button size="sm" variant="primary" icon={ArrowUpRight} onClick={() => navigate('/billing/trust')}>
                  Disburse Earned Fees
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Client Segregated Ledger History</h3>
              <span className="text-xs text-[#667085]">
                {clientTrustLedgers.length > 0
                  ? `Sub-Ledger(s): ${clientTrustLedgers.map((l) => l.ledgerCode).join(', ')}`
                  : 'No active IOLTA sub-ledger'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Description / Reference</th>
                    <th className="py-2.5 px-3">Linked Matter</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Running Trust Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  {clientTrustTransactions.length > 0 ? (
                    clientTrustTransactions.map((tx) => {
                      const isDebit = String(tx.transactionType || '').toLowerCase().includes('disburse') || Number(tx.amount) < 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-[#667085]">{formatDate(tx.createdAt, { short: true })}</td>
                          <td className={`py-2.5 px-3 font-semibold ${isDebit ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {tx.transactionType}
                          </td>
                          <td className="py-2.5 px-3 text-[#202A35]">
                            {tx.purpose || tx.sourceReference || 'Trust Transaction'}
                          </td>
                          <td className="py-2.5 px-3 text-[#667085]">{tx.matterNumber || tx.matterTitle || '-'}</td>
                          <td className={`py-2.5 px-3 text-right font-semibold ${isDebit ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">
                            {formatCurrency(tx.runningBalance)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-[#667085]">
                        No trust deposits or disbursements recorded for this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-[#06244B]">Client Communications &amp; Call Records</h3>
              <p className="text-xs text-[#667085]">Direct emails, telephone conference logs, and portal correspondence with {client.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" icon={Phone} onClick={() => navigate(`/communications?clientId=${client.id}&type=Phone+Call`)}>
                Log Call Notes
              </Button>
              <Button size="sm" variant="primary" icon={Mail} onClick={() => navigate(`/communications?clientId=${client.id}&type=Email`)}>
                Compose Email
              </Button>
            </div>
          </div>

          {clientComms.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#667085] border border-dashed border-[#D9D6CF] rounded">
              No communications logged for this client yet.
            </div>
          ) : (
            <div className="divide-y divide-[#D9D6CF]/50 text-xs">
              {clientComms.map((comm) => (
                <div key={comm.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 p-2 rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {comm.type}
                      </span>
                      <span className="font-bold text-[#06244B]">{comm.subject}</span>
                      {comm.matterNumber && (
                        <span className="text-[10px] font-mono text-[#667085]">({comm.matterNumber})</span>
                      )}
                    </div>
                    <p className="text-[#667085] text-[11px] leading-relaxed">{comm.summary}</p>
                    <div className="flex items-center gap-4 text-[10px] text-[#667085]">
                      <span>From: <strong>{comm.sender}</strong></span>
                      <span>•</span>
                      <span>To: <strong>{comm.recipient}</strong></span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span className="text-[11px] text-[#667085]">{formatDate(comm.date, { short: true })}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/communications?clientId=${client.id}`)}>
                      View in Log
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Parties & Adversaries Tab */}
      {activeTab === 'related-parties' && (
        <RelatedPartiesTab
          clientId={client.id}
          clientName={client.name}
        />
      )}

      {activeTab === 'contact' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-serif text-base font-bold text-[#06244B] mb-3 border-b border-[#D9D6CF]/60 pb-2">
              Primary Office &amp; Notice Address
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#A4432B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#06244B] block">Physical Location</span>
                  <span className="text-[#667085]">{client.address || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#06244B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#06244B] block">Billing &amp; Notice Email</span>
                  <span className="text-[#667085]">{client.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#06244B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#06244B] block">Direct Telephone</span>
                  <span className="text-[#667085]">{client.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base font-bold text-[#06244B] mb-3 border-b border-[#D9D6CF]/60 pb-2">
              Engagement Terms &amp; Counsel Relationship
            </h3>
            <div className="space-y-2 text-xs">
              <p><strong className="text-[#06244B]">Responsible Partner:</strong> {client.assignedAttorneyName || 'Unassigned'}</p>
              <p>
                <strong className="text-[#06244B]">Originating Intake &amp; Conflict Review:</strong>{' '}
                {originatingIntakes[0]
                  ? `${originatingIntakes[0].intakeNumber} (${originatingIntakes[0].conflictStatus})`
                  : 'Created directly in Clients'}
              </p>
              <p>
                <strong className="text-[#06244B]">Trust Retainer Balance:</strong>{' '}
                {clientTrustLedgers.length > 0
                  ? `${formatCurrency(clientTrustBalance)} across ${clientTrustLedgers.length} sub-ledger(s)`
                  : 'No active trust sub-ledger ($0.00)'}
              </p>
              <p><strong className="text-[#06244B]">Client Entity Type:</strong> {client.type}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-base font-bold text-[#06244B]">Client Documents ({clientDocs.length})</h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/documents')}>
              Browse All Documents
            </Button>
          </div>
          {clientDocs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#667085] border border-dashed border-[#D9D6CF] rounded">
              No documents have been uploaded or generated for this client yet.
            </div>
          ) : (
            <div className="divide-y divide-[#D9D6CF]/50 text-xs">
              {clientDocs.map((doc) => (
                <div key={doc.id} className="py-3 flex justify-between items-center gap-3">
                  <div>
                    <p className="font-bold text-[#06244B]">{doc.title}</p>
                    <p className="text-[#667085]">
                      {doc.documentCode ? `${doc.documentCode} • ` : ''}
                      {doc.category || 'Document'}
                      {doc.uploadedByName ? ` • Uploaded by ${doc.uploadedByName}` : ''}
                      {doc.createdAt ? ` on ${formatDate(doc.createdAt, { short: true })}` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(doc.matterId ? `/matters/${doc.matterId}` : '/documents')}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
            Confidential Internal Client Notes
          </h3>
          <div className="p-4 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] text-xs leading-relaxed text-[#202A35] whitespace-pre-line">
            {client.notes || 'No confidential internal notes entered for this client.'}
          </div>
          <p className="text-[11px] text-[#A4432B] font-semibold">
            Confidential Attorney Work Product • Strictly protected under Utah Rule of Professional Conduct 1.6. Never exposed to Client Portal.
          </p>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
          <h3 className="font-serif text-base font-bold text-[#06244B] mb-4">
            Chronological Client &amp; Matter Activity
          </h3>
          <ActivityTimeline
            activities={[
              ...clientAuditLogs.map((log) => ({
                title: log.action,
                timestamp: formatDate(log.timestamp, { short: true }),
                type: log.resourceType === 'MATTER' ? 'task' : 'document',
                description: `${log.resourceType} event recorded.`,
                author: log.userName || 'System',
              })),
              ...clientMatters.map((m) => ({
                title: `Matter Opened: ${m.matterNumber}`,
                timestamp: formatDate(m.openDate, { short: true }),
                type: 'task',
                description: m.title,
                author: m.responsibleAttorneyName || client.assignedAttorneyName || 'Assigned Counsel',
              })),
              ...originatingIntakes.map((i) => ({
                title: `Converted from Intake ${i.intakeNumber}`,
                timestamp: formatDate(i.reviewedAt || i.createdAt, { short: true }),
                type: 'document',
                description: `Conflict Status: ${i.conflictStatus}`,
                author: i.reviewedByName || client.assignedAttorneyName || 'Staff',
              })),
              ...(clientAuditLogs.length === 0
                ? [
                    {
                      title: 'Client Record Created',
                      timestamp: formatDate(client.createdAt, { short: true }),
                      type: 'document',
                      description: `Client profile created (${client.clientNumber || client.id}).`,
                      author: client.assignedAttorneyName || 'Firm Staff',
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Client: ${client.name}`}
      >
        <ClientForm
          initialData={client}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadClient360(client.id);
            refreshClients();
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isNewMatterModalOpen}
        onClose={() => {
          setIsNewMatterModalOpen(false);
          if (shouldOpenMatter || intakeId) {
            setSearchParams({}, { replace: true });
          }
        }}
        title={`Create New Matter for ${client.name}`}
        maxWidth="max-w-3xl"
      >
        <MatterForm
          defaultClientId={client.id}
          initialIntake={linkedIntake}
          onSuccess={(created) => {
            setIsNewMatterModalOpen(false);
            setSearchParams({}, { replace: true });
            refreshClients();
            refreshIntakes();
            refreshMatters();
            if (created?.id) {
              navigate(`/matters/${created.id}`);
            } else {
              loadClient360(client.id);
            }
          }}
          onCancel={() => {
            setIsNewMatterModalOpen(false);
            if (shouldOpenMatter || intakeId) {
              setSearchParams({}, { replace: true });
            }
          }}
        />
      </Modal>

      {isEngagementLetterOpen && (
        <EngagementLetterModal
          isOpen={isEngagementLetterOpen}
          onClose={() => setIsEngagementLetterOpen(false)}
          clientName={client.name}
          contactPerson={client.primaryContact || client.name}
          email={client.email}
          attorneyName={
            client.assignedAttorneyName && client.assignedAttorneyName !== 'Unassigned'
              ? client.assignedAttorneyName
              : 'Assigned Counsel'
          }
        />
      )}
    </div>
  );
}

