import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { MOCK_INVOICES } from '../../../data/mockInvoices';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
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

export function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients } = useClients();
  const { getMattersByClient } = useMatters();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('matters');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewMatterModalOpen, setIsNewMatterModalOpen] = useState(false);
  const [isEngagementLetterOpen, setIsEngagementLetterOpen] = useState(false);
  const [fetchedClient, setFetchedClient] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (clientId && !clients.some(c => c.id === clientId || c.clientNumber === clientId)) {
      clientService.getClientById(clientId).then(res => {
        if (isMounted && res) setFetchedClient(res);
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [clientId, clients]);

  const client = clients.find(c => c.id === clientId || c.clientNumber === clientId) || fetchedClient || clients[0];
  const clientMatters = client ? getMattersByClient(client.id) : [];

  // 360° Financials & Invoices for this client
  const clientInvoices = MOCK_INVOICES.filter(
    inv => inv.clientId === client?.id || inv.clientName === client?.name
  );
  const totalBilled = clientInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalPaid = clientInvoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalOutstanding = clientInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  // Client Trust Ledger mock data
  const clientTrustBalance = client?.id === 'CLI-1001' ? 25000 : (client?.id === 'CLI-1002' ? 12500 : (client?.id === 'CLI-1008' ? 1440 : 5000));

  // Client Communications mock data
  const clientComms = [
    {
      id: 'comm-1',
      type: 'Email',
      subject: 'Discovery Protocol & Cold-Chain Telemetry Log Production',
      sender: 'Thomas Bludworth, Esq.',
      recipient: client?.email || 'client@firm.com',
      date: '2026-11-05 14:20',
      summary: 'Transmitted revised deposition questions and confirmed date for expert telemetry witness inspection.',
    },
    {
      id: 'comm-2',
      type: 'Telephone Call',
      subject: 'Monthly Case Status & Deposition Scheduling Conference',
      sender: 'Thomas Bludworth, Esq.',
      recipient: client?.phone || '(801) 555-0100',
      date: '2026-11-01 11:30',
      summary: '30-minute conference with primary representative regarding upcoming mediator scheduling order.',
    },
    {
      id: 'comm-3',
      type: 'Portal Notice',
      subject: 'Formal Request: 2024 Corporate Tax Returns & W-2 Records',
      sender: 'Marcus Vance (Paralegal)',
      recipient: 'Client Portal Secure Inbox',
      date: '2026-10-24 09:15',
      summary: 'Official document upload request issued through the secure client portal.',
    },
  ];

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
    { id: 'trust-ledger', label: 'IOLTA Trust Ledger', icon: Landmark },
    { id: 'communications', label: 'Communications & Calls', count: clientComms.length, icon: MessageSquare },
    { id: 'related-parties', label: 'Related Entities & Adversaries', icon: User },
    { id: 'contact', label: 'Contact & Addresses', icon: User },
    { id: 'documents', label: 'Client Documents', count: 3, icon: FileText },
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
                  {client.id}
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
            <span className="text-sm font-semibold text-[#06244B]">{client.assignedAttorneyName}</span>
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
            <span className={`text-sm font-semibold ${client.outstandingBalance > 0 ? 'text-[#B42318]' : 'text-[#287A55]'}`}>
              {formatCurrency(client.outstandingBalance)}
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
                {formatCurrency(totalBilled || 15390)}
              </span>
              <span className="text-[11px] text-[#667085]">Cumulative billing across all client matters</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Total Collections</span>
              <span className="text-xl font-serif font-bold text-emerald-800 mt-1 block">
                {formatCurrency(totalPaid || 15390)}
              </span>
              <span className="text-[11px] text-emerald-700">ACH, FedWire &amp; Retainer drawdowns</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Outstanding Accounts Receivable</span>
              <span className={`text-xl font-serif font-bold mt-1 block ${totalOutstanding > 0 ? 'text-amber-800' : 'text-[#06244B]'}`}>
                {formatCurrency(totalOutstanding || 0)}
              </span>
              <span className="text-[11px] text-[#667085]">Aging receivables due within 30 days</span>
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
              <span className="text-[11px] text-emerald-700 font-medium">Available for earned fee drawdown</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle">
              <span className="text-xs uppercase font-bold text-[#667085] block">Escrow Purpose</span>
              <span className="text-sm font-bold text-[#06244B] mt-1 block">
                General Litigation Retainer &amp; Expert Witness Reserve
              </span>
              <span className="text-[11px] text-[#667085]">Designated pursuant to signed retainer</span>
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

          {/* Individual Client Sub-Ledger Table */}
          <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Client Segregated Ledger History</h3>
              <span className="text-xs text-[#667085]">Ledger ID: TR-1001 • Sub-account of Chase IOLTA #4402</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#06244B] uppercase font-bold border-y border-[#D9D6CF]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Description / Reference</th>
                    <th className="py-2.5 px-3">Linked Matter</th>
                    <th className="py-2.5 px-3 text-right">Debit (-)</th>
                    <th className="py-2.5 px-3 text-right">Credit (+)</th>
                    <th className="py-2.5 px-3 text-right">Running Trust Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]/60">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[#667085]">2026-11-02</td>
                    <td className="py-2.5 px-3 font-semibold text-rose-700">Earned Fee Drawdown</td>
                    <td className="py-2.5 px-3 text-[#202A35]">Transfer to Operating for Invoice #HB-2026-1088 fees</td>
                    <td className="py-2.5 px-3 text-[#667085]">25-CV-0101</td>
                    <td className="py-2.5 px-3 text-right text-rose-700 font-semibold">-$5,000.00</td>
                    <td className="py-2.5 px-3 text-right text-[#667085]">-</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">{formatCurrency(clientTrustBalance)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[#667085]">2026-10-15</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">Retainer Deposit</td>
                    <td className="py-2.5 px-3 text-[#202A35]">FedWire Retainer replenishment (Wire #W-98124)</td>
                    <td className="py-2.5 px-3 text-[#667085]">25-CV-0101</td>
                    <td className="py-2.5 px-3 text-right text-[#667085]">-</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">+$15,000.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">$30,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[#667085]">2026-09-01</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">Initial Retainer</td>
                    <td className="py-2.5 px-3 text-[#202A35]">Opening deposit per Master Engagement Agreement</td>
                    <td className="py-2.5 px-3 text-[#667085]">25-CV-0101</td>
                    <td className="py-2.5 px-3 text-right text-[#667085]">-</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">+$15,000.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#06244B]">$15,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Communications Tab (Clio 360° Requirement) */}
      {activeTab === 'communications' && (
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-[#06244B]">Client Communications &amp; Call Records</h3>
              <p className="text-xs text-[#667085]">Direct emails, telephone conference logs, and portal correspondence with {client.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" icon={Phone} onClick={() => addToast('Opening phone call log modal...', 'info')}>
                Log Call Notes
              </Button>
              <Button size="sm" variant="primary" icon={Mail} onClick={() => navigate('/communications')}>
                Compose Email
              </Button>
            </div>
          </div>

          <div className="divide-y divide-[#D9D6CF]/50 text-xs">
            {clientComms.map((comm) => (
              <div key={comm.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 p-2 rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      comm.type === 'Email' ? 'bg-blue-50 text-blue-800 border border-blue-200' : (comm.type === 'Telephone Call' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200')
                    }`}>
                      {comm.type}
                    </span>
                    <span className="font-bold text-[#06244B]">{comm.subject}</span>
                  </div>
                  <p className="text-[#667085] text-[11px] leading-relaxed">{comm.summary}</p>
                  <div className="flex items-center gap-4 text-[10px] text-[#667085]">
                    <span>From: <strong>{comm.sender}</strong></span>
                    <span>•</span>
                    <span>To: <strong>{comm.recipient}</strong></span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                  <span className="text-[11px] text-[#667085]">{comm.date}</span>
                  <Button size="sm" variant="outline" onClick={() => addToast(`Opening thread: ${comm.subject}`, 'info')}>
                    View Thread
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
                  <span className="text-[#667085]">{client.address || '1420 South Foothill Blvd, Salt Lake City, UT 84108'}</span>
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
              <p><strong className="text-[#06244B]">Responsible Partner:</strong> {client.assignedAttorneyName}</p>
              <p><strong className="text-[#06244B]">Fee Agreement Status:</strong> Countersigned engagement agreement on file</p>
              <p><strong className="text-[#06244B]">Trust Retainer Deposit:</strong> Verified in Firm IOLTA Trust Account (Utah RPC 1.15)</p>
              <p><strong className="text-[#06244B]">Client Entity Type:</strong> {client.type}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-base font-bold text-[#06244B]">Client Master Records</h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/documents')}>
              Browse All Documents
            </Button>
          </div>
          <div className="divide-y divide-[#D9D6CF]/50 text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#06244B]">Engagement Letter &amp; Hourly Fee Schedule.pdf</p>
                <p className="text-[#667085]">Uploaded on 2025-01-16 by Rachel Adams • 520 KB</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => addToast('Opening secure document preview: Engagement Letter.pdf', 'info')}>
                Preview
              </Button>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#06244B]">Corporate Certificate of Good Standing &amp; Articles.pdf</p>
                <p className="text-[#667085]">Uploaded on 2025-01-18 by Marcus Vance • 1.8 MB</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => addToast('Opening secure document preview: Corporate Certificate.pdf', 'info')}>
                Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
            Confidential Internal Client Notes
          </h3>
          <div className="p-4 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] text-xs leading-relaxed text-[#202A35]">
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
            Chronological Matter &amp; Communication History
          </h3>
          <ActivityTimeline
            activities={[
              {
                title: 'Engagement Initialized',
                timestamp: client.createdAt,
                type: 'document',
                description: 'Client intake cleared conflict review and signed master fee agreement.',
                author: client.assignedAttorneyName,
              },
              {
                title: 'Initial Matter Opened',
                timestamp: '2025-01-20',
                type: 'task',
                description: 'First lawsuit matter opened in Utah Third District Court.',
                author: 'Thomas Bludworth, Esq.',
              },
            ]}
          />
        </div>
      )}

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Client: ${client.name}`}
      >
        <ClientForm
          initialData={client}
          onSuccess={() => setIsEditModalOpen(false)}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* New Matter Modal pre-assigned to this client */}
      <Modal
        isOpen={isNewMatterModalOpen}
        onClose={() => setIsNewMatterModalOpen(false)}
        title={`Create New Matter for ${client.name}`}
        maxWidth="max-w-3xl"
      >
        <MatterForm
          defaultClientId={client.id}
          onSuccess={() => setIsNewMatterModalOpen(false)}
          onCancel={() => setIsNewMatterModalOpen(false)}
        />
      </Modal>

      {/* Engagement Letter Generator Modal */}
      {isEngagementLetterOpen && (
        <EngagementLetterModal
          isOpen={isEngagementLetterOpen}
          onClose={() => setIsEngagementLetterOpen(false)}
          clientName={client.name}
          contactPerson={client.primaryContact || client.name}
          email={client.email}
          attorneyName={client.assignedAttorneyName || 'Thomas Bludworth, Esq.'}
        />
      )}
    </div>
  );
}

