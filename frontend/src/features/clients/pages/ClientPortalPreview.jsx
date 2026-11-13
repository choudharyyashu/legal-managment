import React, { useState } from 'react';
import {
  Eye,
  Shield,
  Lock,
  FileText,
  Calendar,
  MessageSquare,
  Briefcase,
  Download,
  Upload,
  Send,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Paperclip,
  Clock
} from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';

export function ClientPortalPreview() {
  const { clients } = useClients();
  const { matters } = useMatters();
  const { addToast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || 'CLI-1001');
  const [portalTab, setPortalTab] = useState('matters');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const clientMatters = matters.filter(m => m.clientId === selectedClient?.id);

  // Client Upload State
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 'up-1', name: '2024_W2_Wage_Statement.pdf', size: '1.2 MB', uploadedAt: '2026-11-02', status: 'Received by Firm' },
    { id: 'up-2', name: 'Commercial_Driver_Log_Excerpts.pdf', size: '4.8 MB', uploadedAt: '2026-11-04', status: 'Received by Firm' },
  ]);
  const [uploadCategory, setUploadCategory] = useState('Tax & Financial Records');

  // Client Messaging State
  const [messages, setMessages] = useState([
    { id: 'msg-1', sender: 'Thomas Bludworth, Esq.', time: 'Nov 5, 2026 at 10:15 AM', isLawyer: true, text: 'Robert, we have finalized the second set of interrogatories. Please review the attached draft question list when you have a moment before Friday.' },
    { id: 'msg-2', sender: 'Robert H. Henderson', time: 'Nov 5, 2026 at 02:40 PM', isLawyer: false, text: 'Thanks Thomas. Our fleet safety director reviewed items 4 through 12. I uploaded the driver log excerpts to the portal.' },
  ]);
  const [replyText, setReplyText] = useState('');

  // Online Payment Simulator State
  const [paymentAmount, setPaymentAmount] = useState(selectedClient?.outstandingBalance || 2500);
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 8912');
  const [cardExp, setCardExp] = useState('08/28');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paidInvoices, setPaidInvoices] = useState(false);

  const tabs = [
    { id: 'matters', label: 'My Matters', count: clientMatters.length, icon: Briefcase },
    { id: 'documents', label: 'Documents & Uploads', count: 2 + uploadedFiles.length, icon: FileText },
    { id: 'messages', label: 'Counsel Messages', count: messages.length, icon: MessageSquare },
    { id: 'billing', label: 'Invoices & Payments', icon: CreditCard },
    { id: 'appointments', label: 'Hearings & Calendar', count: 1, icon: Calendar },
  ];

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    const newFile = {
      id: `up-${Date.now()}`,
      name: `Client_Submission_${uploadedFiles.length + 1}_Verified.pdf`,
      size: '2.1 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Received by Firm'
    };
    setUploadedFiles(prev => [newFile, ...prev]);
    addToast(`Document "${newFile.name}" securely encrypted and uploaded to matter file.`, 'success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: selectedClient.primaryContact || selectedClient.name,
      time: 'Just now',
      isLawyer: false,
      text: replyText.trim()
    };
    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
    addToast('Message securely transmitted to legal team.', 'success');
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaidInvoices(true);
      addToast(`Payment of ${formatCurrency(paymentAmount)} processed successfully via LawPay gateway. Receipt dispatched to client email.`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secure Client Portal Demonstration"
        subtitle="Simulated view of the client-facing access portal. Internal notes, confidential research, and billing approvals are strictly restricted from client view."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'Client Portal Preview' }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#667085] font-semibold">Simulate Client:</span>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                const cl = clients.find(c => c.id === e.target.value);
                setPaymentAmount(cl?.outstandingBalance || 1500);
                setPaidInvoices(false);
              }}
              className="text-xs py-1.5 px-3 rounded bg-white border border-[#D9D6CF] text-[#06244B] font-bold focus:outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Security Sandbox Banner */}
      <div className="p-4 bg-emerald-950 text-emerald-100 rounded border border-emerald-800 shadow-subtle flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white uppercase tracking-wider">
              Protected Client Boundary Active
            </p>
            <p className="text-emerald-200 mt-0.5">
              Restricted content (internal attorney work product, staff notes, and draft billing entries) is suppressed.
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-white font-bold uppercase">
          [PROTOTYPE] Client View
        </span>
      </div>

      {/* Simulated Portal Canvas */}
      <div className="bg-white rounded-lg border-2 border-[#06244B] p-6 shadow-elevated">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#D9D6CF] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A4432B] uppercase tracking-wider">
                Heugly &amp; Bludworth Client Portal
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#06244B] mt-1">
              Welcome, {selectedClient.primaryContact || selectedClient.name}
            </h2>
            <p className="text-xs text-[#667085]">{selectedClient.name} • Account #{selectedClient.id}</p>
          </div>

          <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-xs">
            <span className="text-[#667085] block">Your Lead Counsel:</span>
            <span className="font-bold text-[#06244B]">{selectedClient.assignedAttorneyName}</span>
          </div>
        </div>

        {/* Portal Navigation */}
        <div className="mt-4">
          <Tabs tabs={tabs} activeTab={portalTab} onChange={setPortalTab} />
        </div>

        {/* Portal Contents */}
        <div className="mt-6">
          {/* Tab 1: Matters */}
          {portalTab === 'matters' && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Your Legal Matters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientMatters.map((m) => (
                  <div key={m.id} className="p-4 rounded border border-[#D9D6CF] bg-[#F5F0E5]/30 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#A4432B]">{m.matterNumber}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#06244B]">{m.title}</h4>
                    <p className="text-xs text-[#667085]">{m.description}</p>
                    <div className="pt-2 border-t border-[#D9D6CF]/40 text-[11px] text-[#667085] flex justify-between">
                      <span>Practice: {m.practiceAreaName}</span>
                      <span>Next Court Date: {m.nextCourtDate || 'None Scheduled'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Documents & Uploads */}
          {portalTab === 'documents' && (
            <div className="space-y-6 text-xs">
              {/* Interactive Upload Dropzone */}
              <div className="p-4 border-2 border-dashed border-[#A4432B]/40 bg-[#F5F0E5]/40 rounded-lg text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-white text-[#A4432B] mx-auto flex items-center justify-center shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#06244B]">Secure Document Upload Dropzone</h4>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Upload discovery answers, tax stubs, lease agreements, or court evidence directly to your case file.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="text-xs p-1.5 rounded border border-[#D9D6CF] bg-white font-medium text-[#06244B]"
                  >
                    <option value="Tax & Financial Records">Tax &amp; Financial Records</option>
                    <option value="Discovery Evidence">Discovery Evidence</option>
                    <option value="Corporate Governance">Corporate Governance</option>
                    <option value="Identity Documents">Identity Documents</option>
                  </select>
                  <Button size="sm" variant="primary" icon={Upload} onClick={handleSimulateUpload}>
                    Simulate Upload File (.PDF / .DOCX)
                  </Button>
                </div>
              </div>

              {/* Uploaded Files Table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-[#06244B] mb-2">Documents Transmitted to Legal Team</h4>
                <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white overflow-hidden">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <div>
                          <p className="font-semibold text-[#06244B]">{file.name}</p>
                          <p className="text-[10px] text-[#667085]">{file.size} • Uploaded {file.uploadedAt}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared from Counsel */}
              <div>
                <h4 className="font-bold text-xs uppercase text-[#06244B] mb-2">Pleadings Shared By Firm</h4>
                <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#A4432B]" />
                      <div>
                        <p className="font-bold text-[#06244B]">First Amended Complaint (Court-Stamped Copy).pdf</p>
                        <p className="text-[10px] text-[#667085]">Shared on 2025-01-24 • 3.4 MB</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={Download} onClick={() => addToast('Encrypted client copy downloaded: First Amended Complaint.pdf', 'success')}>
                      Download
                    </Button>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#A4432B]" />
                      <div>
                        <p className="font-bold text-[#06244B]">Joint Scheduling Order Signed by Judge Hruby-Mills.pdf</p>
                        <p className="text-[10px] text-[#667085]">Shared on 2025-02-16 • 840 KB</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={Download} onClick={() => addToast('Encrypted client copy downloaded: Scheduling Order.pdf', 'success')}>
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Messages */}
          {portalTab === 'messages' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Encrypted Counsel Messaging Channel</h3>
              <div className="border border-[#D9D6CF] rounded-lg p-4 space-y-3 bg-slate-50 max-h-72 overflow-y-auto">
                {messages.map(m => (
                  <div key={m.id} className={`p-3 rounded-lg max-w-xl ${m.isLawyer ? 'bg-white border border-[#D9D6CF]' : 'bg-[#06244B] text-white ml-auto'}`}>
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className={`font-bold ${m.isLawyer ? 'text-[#06244B]' : 'text-amber-200'}`}>{m.sender}</span>
                      <span className={m.isLawyer ? 'text-[#667085]' : 'text-slate-300'}>{m.time}</span>
                    </div>
                    <p className={`text-xs ${m.isLawyer ? 'text-[#202A35]' : 'text-slate-100'}`}>{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a secure message to your attorney..."
                  className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
                  required
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#667085] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" /> End-to-end encrypted under attorney-client privilege
                  </span>
                  <Button size="sm" variant="primary" icon={Send} type="submit">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Billing & Online Payments */}
          {portalTab === 'billing' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Invoices &amp; Online Payment Gateway</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-[#D9D6CF] rounded-lg">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Outstanding Balance Due</span>
                  <span className={`text-2xl font-bold font-serif mt-1 block ${paidInvoices ? 'text-emerald-700' : 'text-red-700'}`}>
                    {paidInvoices ? '$0.00' : formatCurrency(selectedClient.outstandingBalance || 2500)}
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    {paidInvoices ? 'All accounts in good standing' : 'Invoice #INV-2026-0041 payable'}
                  </span>
                </div>

                <div className="md:col-span-2 p-4 bg-white border border-[#D9D6CF] rounded-lg space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-[#06244B] uppercase">LawPay Secure Payment Gateway</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      PCI-DSS Compliant
                    </span>
                  </div>

                  {paidInvoices ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center text-emerald-900 space-y-1">
                      <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                      <p className="font-bold">Payment Completed Successfully!</p>
                      <p className="text-[11px]">Thank you for your prompt remittance. A formal receipt has been emailed.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSimulatePayment} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#667085] block mb-1">Payment Amount ($)</label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#667085] block mb-1">Credit Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full text-xs p-2 rounded border border-[#D9D6CF] font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-[#667085]">Direct deposit into Firm Operating / Trust Account</span>
                        <Button size="sm" variant="primary" type="submit" icon={CreditCard} disabled={isProcessingPayment}>
                          {isProcessingPayment ? 'Authorizing...' : `Pay ${formatCurrency(paymentAmount)} Now`}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Appointments */}
          {portalTab === 'appointments' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-serif text-base font-bold text-[#06244B]">Scheduled Hearings &amp; Meetings</h3>
              <div className="p-4 rounded border-l-4 border-l-[#A4432B] border border-[#D9D6CF] bg-white">
                <p className="font-bold text-sm text-[#06244B]">Oral Argument: Motion for Summary Judgment</p>
                <p className="text-[#667085] mt-1">Utah Third Judicial District Court • Courtroom 4B, Salt Lake City</p>
                <p className="text-[#A4432B] font-semibold mt-1">Wednesday, November 18, 2026 at 09:30 AM</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
