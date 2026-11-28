import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ClientPortalDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matters, setMatters] = useState([]);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents' | 'messages' | 'invoices'
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const token = localStorage.getItem('clientPortalToken');

  useEffect(() => {
    const storedUser = localStorage.getItem('clientPortalUser');
    if (!token || !storedUser) {
      navigate('/portal/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchMatters();
    fetchInvoices();
  }, [navigate]);

  useEffect(() => {
    if (selectedMatter) {
      fetchDocuments(selectedMatter.id);
      fetchMessages(selectedMatter.id);
    }
  }, [selectedMatter]);

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMatters = async () => {
    try {
      const res = await fetch('/api/v1/portal/matters', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMatters(data.data);
        if (data.data.length > 0) {
          setSelectedMatter(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load matters', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (matterId) => {
    try {
      const res = await fetch(`/api/v1/portal/matters/${matterId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const fetchMessages = async (matterId) => {
    try {
      const res = await fetch(`/api/v1/portal/matters/${matterId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/v1/portal/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInvoices(data.data || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatter) return;

    try {
      const res = await fetch(`/api/v1/portal/matters/${selectedMatter.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
        showNotice('Message transmitted to your legal team.');
      }
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const handleSignDocument = async (docId, docTitle) => {
    const signerName = prompt(`Please enter your full legal name to electronically sign "${docTitle}":`, user?.name || '');
    if (!signerName) return;

    try {
      const res = await fetch(`/api/v1/portal/documents/${docId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ signerName }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Document signed successfully. Audit Hash: ${data.data.signatureHash.substring(0, 16)}...`);
        fetchDocuments(selectedMatter.id);
      }
    } catch (err) {
      alert('Failed to sign document.');
    }
  };

  const handleUploadSim = async () => {
    const title = prompt('Enter document title to upload (e.g. W2 Statement, Medical Bill):');
    if (!title || !selectedMatter) return;

    try {
      const res = await fetch(`/api/v1/portal/matters/${selectedMatter.id}/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category: 'Client Upload' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Document "${title}" uploaded and queued for attorney review.`);
        fetchDocuments(selectedMatter.id);
      }
    } catch (err) {
      alert('Failed to upload document.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientPortalToken');
    localStorage.removeItem('clientPortalUser');
    navigate('/portal/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading Client Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            HEUGLY & BLUDWORTH
          </span>
          <h1 className="text-base font-medium text-white">Client Portal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">Client ID: {user?.clientNumber}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 border border-slate-600"
          >
            Sign Out
          </button>
        </div>
      </header>

      {notification && (
        <div className="bg-emerald-900 border-b border-emerald-500 text-emerald-200 px-6 py-2.5 text-xs font-medium text-center">
          {notification}
        </div>
      )}

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matters.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
            <h3 className="text-lg font-medium text-white mb-2">No Active Matters Found</h3>
            <p className="text-sm text-slate-400">
              There are currently no open legal matters linked to your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Matter Selector */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Matters ({matters.length})
              </h2>
              <div className="space-y-2">
                {matters.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatter(m)}
                    className={`w-full text-left p-3.5 rounded-lg border transition ${
                      selectedMatter?.id === m.id
                        ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-amber-400">{m.matterNumber}</div>
                    <div className="text-sm font-medium mt-1 truncate">{m.title}</div>
                    <div className="text-xs text-slate-400 mt-2 flex justify-between">
                      <span>{m.practiceArea}</span>
                      <span className="text-emerald-400 font-medium">{m.stageName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Pane: Matter Details & Tabs */}
            <div className="lg:col-span-3 bg-slate-800 rounded-lg border border-slate-700 p-6">
              {/* Matter Header */}
              <div className="border-b border-slate-700 pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {selectedMatter?.practiceArea} • {selectedMatter?.matterNumber}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedMatter?.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Responsible Counsel:{' '}
                      <span className="text-slate-200">
                        {selectedMatter?.responsibleAttorney?.name || 'Heugly & Bludworth Legal Team'}
                      </span>{' '}
                      ({selectedMatter?.responsibleAttorney?.email || 'office@heuglybludworth.com'})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-700 rounded-full text-xs font-medium">
                    {selectedMatter?.stageName}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 mt-6 text-sm font-medium">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'documents', label: `Documents (${documents.length})` },
                    { id: 'messages', label: `Messages (${messages.length})` },
                    { id: 'invoices', label: `Billing & Invoices (${invoices.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-2 border-b-2 transition ${
                        activeTab === tab.id
                          ? 'border-amber-400 text-amber-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/60 p-4 rounded border border-slate-700/60">
                    <h3 className="text-sm font-semibold text-white mb-2">Matter Summary</h3>
                    <dl className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <dt className="text-slate-400">Docket / Matter Number:</dt>
                        <dd className="text-slate-200 font-mono mt-0.5">{selectedMatter?.matterNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">File Opened Date:</dt>
                        <dd className="text-slate-200 mt-0.5">{selectedMatter?.openedDate}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Practice Area:</dt>
                        <dd className="text-slate-200 mt-0.5">{selectedMatter?.practiceArea}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">File Status:</dt>
                        <dd className="text-emerald-400 font-medium mt-0.5">{selectedMatter?.status}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* Tab 2: Documents & E-Sign */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Matter Documents & Vault</h3>
                    <button
                      onClick={handleUploadSim}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded text-xs font-semibold"
                    >
                      + Upload Document
                    </button>
                  </div>

                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No documents currently posted for this matter.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-700/60 border border-slate-700 rounded-lg overflow-hidden">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3.5 bg-slate-900/40 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-medium text-white">{doc.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {doc.documentType} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <div>
                            {doc.requiresSignature && !doc.isSigned ? (
                              <button
                                onClick={() => handleSignDocument(doc.id, doc.title)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded"
                              >
                                Sign Now
                              </button>
                            ) : doc.isSigned ? (
                              <span className="text-xs text-emerald-400 font-medium">✓ Signed</span>
                            ) : (
                              <span className="text-xs text-slate-400">Available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Messages */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-900/60 rounded border border-slate-700/60">
                    {messages.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">
                        No previous messages on this matter. Use the form below to message your legal team.
                      </p>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded text-xs max-w-[80%] ${
                            m.senderType === 'CLIENT'
                              ? 'ml-auto bg-amber-950/60 border border-amber-800 text-amber-100'
                              : 'mr-auto bg-slate-800 border border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-amber-400 mb-1">{m.senderName}</div>
                          <div className="whitespace-pre-wrap">{m.body}</div>
                          <div className="text-[10px] text-slate-400 mt-1 text-right">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message to your attorney..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-xs rounded"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Billing & Invoices */}
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Client Invoices & Statement</h3>
                  {invoices.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No invoices currently issued for your account.
                    </p>
                  ) : (
                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-700 text-xs">
                        <thead className="bg-slate-900/80 text-slate-400">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold">Invoice #</th>
                            <th className="px-4 py-2.5 text-left font-semibold">Matter</th>
                            <th className="px-4 py-2.5 text-left font-semibold">Issue Date</th>
                            <th className="px-4 py-2.5 text-right font-semibold">Total Amount</th>
                            <th className="px-4 py-2.5 text-right font-semibold">Balance Due</th>
                            <th className="px-4 py-2.5 text-center font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 bg-slate-900/40 text-slate-200">
                          {invoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="px-4 py-2.5 font-mono text-amber-400">{inv.invoiceNumber}</td>
                              <td className="px-4 py-2.5">{inv.matterNumber}</td>
                              <td className="px-4 py-2.5">{inv.issueDate}</td>
                              <td className="px-4 py-2.5 text-right font-mono">${inv.totalAmount.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-semibold text-white">
                                ${inv.balanceDue.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default ClientPortalDashboard;
