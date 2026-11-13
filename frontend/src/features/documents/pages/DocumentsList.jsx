import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  ShieldCheck,
  ShieldAlert,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  History,
  FileCode,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../../data/mockDocuments';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../utils/formatDate';

export function DocumentsList() {
  const { matters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Enriched documents with version history, privilege tags, and OCR text
  const [documents, setDocuments] = useState(() => {
    return MOCK_DOCUMENTS.map((doc, idx) => ({
      ...doc,
      version: idx === 0 ? 'v2.1' : (idx === 2 ? 'v3.0' : 'v1.0'),
      isPrivileged: idx === 2 || idx === 3, // Hydrology report & Trust instrument are privileged
      privilegeType: idx === 2
        ? 'Attorney Work Product (Rule 1.6)'
        : (idx === 3 ? 'Confidential Estate Client Communication' : null),
      ocrText: idx === 0
        ? 'Breach of commercial freight transport agreement pursuant to cold-chain telemetric sensor failure during transit...'
        : (idx === 2
          ? 'Comprehensive aquifer discharge study prepared by Intermountain Hydrology Associates. Culinary recharge basin capacity measured at 450 acre-feet...'
          : 'Confidential dynasty trust provisions establishing generational transfer covenants and Salt Lake County real property deeds...'),
      versionHistory: idx === 0 ? [
        { version: 'v2.1', date: '2025-01-22', author: 'Thomas Bludworth, Esq.', note: 'Incorporated telemetry damage calculations' },
        { version: 'v2.0', date: '2025-01-20', author: 'Marcus Vance (Paralegal)', note: 'Formatted exhibits and civil cover sheet' },
        { version: 'v1.0', date: '2025-01-15', author: 'Thomas Bludworth, Esq.', note: 'Initial pleading draft' },
      ] : [
        { version: 'v1.0', date: doc.uploadedAt?.split('T')[0] || '2025-01-10', author: doc.uploadedByName || 'Firm Staff', note: 'Original filed instrument' }
      ]
    }));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [privilegeFilter, setPrivilegeFilter] = useState('all'); // 'all', 'privileged', 'public'
  const [searchOCR, setSearchOCR] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import('../../../services/documentService').then(({ documentService }) => {
      documentService.getDocuments().then((res) => {
        if (isMounted && Array.isArray(res) && res.length > 0) {
          setDocuments(
            res.map((d) => ({
              ...d,
              id: d.id,
              title: d.title,
              matterName: d.matter?.title || d.matterName || 'Matter Document',
              clientName: d.client?.name || d.clientName || 'Firm Client',
              category: d.category || 'Pleading',
              version: d.currentVersion ? `v${d.currentVersion}.0` : 'v1.0',
              uploadedAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-11-13',
              uploadedByName: d.createdBy?.name || 'Staff Member',
              isPrivileged: Boolean(d.isPrivileged),
              privilegeType: d.privilegeType || null,
              ocrText: d.ocrText || 'Document content indexed for search.',
              versionHistory: [
                {
                  version: d.currentVersion ? `v${d.currentVersion}.0` : 'v1.0',
                  date: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-11-13',
                  author: d.createdBy?.name || 'Staff Member',
                  note: 'Uploaded document version',
                },
              ],
            }))
          );
        }
      }).catch((err) => console.warn('Could not load documents from API:', err?.message));
    });
    return () => { isMounted = false; };
  }, []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [versionDoc, setVersionDoc] = useState(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Pleadings');
  const [uploadMatterId, setUploadMatterId] = useState(matters[0]?.id || '');
  const [isNewDocPrivileged, setIsNewDocPrivileged] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesStandard =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.matterTitle.toLowerCase().includes(q) ||
        doc.clientName.toLowerCase().includes(q);

      const matchesOCR = searchOCR && doc.ocrText && doc.ocrText.toLowerCase().includes(q);
      const matchesSearch = matchesStandard || matchesOCR;

      const matchesCat = categoryFilter === '' || doc.category === categoryFilter;
      const matchesPrivilege =
        privilegeFilter === 'all' ||
        (privilegeFilter === 'privileged' && doc.isPrivileged) ||
        (privilegeFilter === 'public' && !doc.isPrivileged);

      return matchesSearch && matchesCat && matchesPrivilege;
    });
  }, [documents, searchQuery, categoryFilter, privilegeFilter, searchOCR]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadMatterId) {
      addToast('Please provide a document title and select a matter.', 'error');
      return;
    }

    const matter = matters.find(m => m.id === uploadMatterId);
    const newDoc = {
      id: `DOC-${documents.length + 401}`,
      title: uploadTitle,
      fileName: selectedFileName || `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
      fileType: 'PDF',
      fileSize: '1.4 MB',
      category: uploadCategory,
      clientId: matter?.clientId || 'CLI-1001',
      clientName: matter?.clientName || 'Wasatch Mountain Logistics LLC',
      matterId: matter?.id,
      matterTitle: matter?.title,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedAt: new Date().toISOString(),
      version: 'v1.0',
      isPrivileged: isNewDocPrivileged,
      privilegeType: isNewDocPrivileged ? 'Attorney Work Product (Utah RPC 1.6)' : null,
      ocrText: `OCR extracted text for ${uploadTitle}... Indexed into firm full-text search engine.`,
      versionHistory: [
        { version: 'v1.0', date: new Date().toISOString().split('T')[0], author: currentUser.name, note: 'Initial upload' }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);
    addToast(`Document "${uploadTitle}" (v1.0) indexed to ${matter?.matterNumber}.`, 'success');
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setSelectedFileName('');
    setIsNewDocPrivileged(false);
  };

  const handleTogglePrivilege = (docId) => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const nextState = !d.isPrivileged;
          addToast(
            nextState
              ? `Document classified as "Attorney-Client Privileged" (Protected under Utah RPC 1.6).`
              : `Document classification updated to "Court Pleading / Public".`,
            'info'
          );
          return {
            ...d,
            isPrivileged: nextState,
            privilegeType: nextState ? 'Attorney Work Product (Utah RPC 1.6)' : null
          };
        }
        return d;
      })
    );
  };

  const handleUploadNewVersion = (docId) => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const nextVerNum = (parseFloat(d.version.replace('v', '')) + 1.0).toFixed(1);
          const nextVer = `v${nextVerNum}`;
          const updatedHistory = [
            { version: nextVer, date: new Date().toISOString().split('T')[0], author: currentUser.name, note: 'Revised version with updated annotations' },
            ...d.versionHistory
          ];
          addToast(`Version ${nextVer} uploaded for "${d.title}". Previous revisions archived.`, 'success');
          return { ...d, version: nextVer, versionHistory: updatedHistory };
        }
        return d;
      })
    );
    setVersionDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Filevine Document Architecture Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Document Integrity &amp; Versioning Engine (Filevine Model):</strong> Full document revision history (v1, v2, v3), searchable text/OCR index, and strict Utah Rule of Professional Conduct 1.6 privileged access controls.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          VERSIONING &amp; OCR
        </span>
      </div>

      <PageHeader
        title="Document Management &amp; Repository"
        subtitle="Centralized firm repository for pleadings, discovery disclosures, contracts, transcripts, and court orders."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'Documents' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Search, Filters & OCR Toggle Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchOCR ? "Full-text / OCR search inside document body and transcripts..." : "Search by title, file name, client, or docket..."}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white transition-all"
            />
          </div>

          {/* OCR Toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchOCR(!searchOCR);
                addToast(
                  !searchOCR ? 'Full-text / OCR search enabled. Querying document text content.' : 'Standard metadata search active.',
                  'info'
                );
              }}
              className={`text-xs px-3 py-2 rounded-lg font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                searchOCR
                  ? 'bg-[#06244B] text-white border-[#06244B] shadow-sm'
                  : 'bg-[#F9FAFB] text-[#475467] border-[#D0D5DD] hover:bg-slate-100 hover:text-[#1D2939]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${searchOCR ? 'text-amber-300' : 'text-[#667085]'}`} />
              <span>OCR Content Search:</span>
              <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${searchOCR ? 'bg-amber-400/20 text-amber-200' : 'bg-slate-200 text-slate-700'}`}>
                {searchOCR ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Category Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAECF0] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#475467] uppercase text-[10px] tracking-wider font-mono mr-1">Privilege Tag:</span>
            {[
              { id: 'all', label: 'All Files' },
              { id: 'privileged', label: 'Privileged Only (Rule 1.6)', icon: Lock },
              { id: 'public', label: 'Court Filings / Public', icon: Unlock },
            ].map(f => {
              const Icon = f.icon;
              const isActive = privilegeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPrivilegeFilter(f.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#06244B] text-white border-[#06244B] shadow-sm'
                      : 'bg-[#F9FAFB] text-[#344054] border-[#D0D5DD] hover:bg-white hover:border-[#98A2B3]'
                  }`}
                >
                  {Icon && <Icon className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[#475467] uppercase text-[10px] tracking-wider font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] text-xs text-[#344054] font-medium focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Pleadings">Pleadings</option>
              <option value="Discovery">Discovery</option>
              <option value="Orders">Orders</option>
              <option value="Contracts">Contracts</option>
            </select>

            {(searchQuery || privilegeFilter !== 'all' || categoryFilter || searchOCR) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPrivilegeFilter('all');
                  setCategoryFilter('');
                  setSearchOCR(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#A4432B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reset all filters and search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F9FAFB] text-[#475467] uppercase font-semibold text-[11px] tracking-wider border-b border-[#EAECF0]">
              <tr>
                <th className="py-3 px-4 font-semibold">Document Title &amp; File</th>
                <th className="py-3 px-3 text-center font-semibold">Version History</th>
                <th className="py-3 px-3 font-semibold">Privilege &amp; Confidentiality Tag</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Linked Matter &amp; Client</th>
                <th className="py-3 px-3 font-semibold">Uploaded By</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                  {/* Title & File */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-[#06244B] text-white shrink-0 shadow-xs">
                        <FileText className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <span
                          onClick={() => setPreviewDoc(doc)}
                          className="font-serif font-bold text-sm text-[#06244B] hover:text-[#A4432B] block cursor-pointer transition-colors"
                        >
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-[#667085] mt-0.5 block">{doc.fileName} • {doc.fileSize}</span>
                        {searchOCR && doc.ocrText && searchQuery && doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 max-w-md">
                            <span className="font-bold">OCR Match:</span> "...{doc.ocrText.slice(0, 80)}..."
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Version History Pill */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setVersionDoc(doc)}
                      className="font-mono font-semibold text-[11px] px-2.5 py-0.5 rounded-md bg-[#F9FAFB] text-[#06244B] border border-[#D0D5DD] hover:border-[#06244B] hover:bg-white transition-all cursor-pointer"
                      title="Click to view revision history"
                    >
                      {doc.version} ({doc.versionHistory?.length || 1})
                    </button>
                  </td>

                  {/* Privilege Tag Button */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleTogglePrivilege(doc.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                        doc.isPrivileged
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-50 text-[#475467] border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {doc.isPrivileged ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Privileged (RPC 1.6)</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-slate-400" />
                          <span>Court Record / Public</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-[#344054] font-medium border border-slate-200">
                      {doc.category}
                    </span>
                  </td>

                  {/* Matter & Client */}
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-xs font-semibold text-[#1D2939] block truncate">{doc.matterTitle}</span>
                    <span className="text-[11px] text-[#667085] mt-0.5 block">{doc.clientName}</span>
                  </td>

                  {/* Uploaded By */}
                  <td className="py-3 px-3">
                    <span className="text-xs font-medium text-[#1D2939] block">{doc.uploadedByName}</span>
                    <span className="text-[11px] text-[#667085]">{formatDate(doc.uploadedAt, { short: true })}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] hover:bg-[#F9FAFB] hover:border-[#06244B] transition-all cursor-pointer shadow-xs"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => addToast(`Download started for ${doc.fileName}.`, 'info')}
                        className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] hover:bg-[#F9FAFB] hover:border-[#06244B] transition-all cursor-pointer shadow-xs"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version History Modal */}
      {versionDoc && (
        <Modal
          isOpen={!!versionDoc}
          onClose={() => setVersionDoc(null)}
          title={`Document Version History: ${versionDoc.title}`}
          subtitle={`Current Version: ${versionDoc.version} | Linked Matter: ${versionDoc.matterTitle}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-[#D9D6CF] rounded">
              <div>
                <span className="font-bold text-[#06244B] block">Revision Audit Trail</span>
                <span className="text-[11px] text-[#667085]">Full immutable timestamp log of all file updates</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={Upload}
                onClick={() => handleUploadNewVersion(versionDoc.id)}
              >
                Upload Revision (v{(parseFloat(versionDoc.version.replace('v', '')) + 1.0).toFixed(1)})
              </Button>
            </div>

            <div className="space-y-2">
              {versionDoc.versionHistory?.map((vh, i) => (
                <div key={i} className="p-3 border rounded-lg bg-white border-[#D9D6CF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-[#06244B] text-white px-2 py-0.5 rounded">
                      {vh.version}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-[#06244B] block">{vh.note}</span>
                      <span className="text-[11px] text-[#667085]">
                        Updated by <strong>{vh.author}</strong> on {vh.date}
                      </span>
                    </div>
                  </div>
                  <Button size="xs" variant="outline" onClick={() => addToast(`Reverted view to ${vh.version}.`, 'info')}>
                    Restore View
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setVersionDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.title}`}
          subtitle={`${previewDoc.fileName} • ${previewDoc.fileSize} • Version ${previewDoc.version}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="flex justify-between items-center p-3 bg-[#FAF8F5] border border-[#D9D6CF] rounded">
              <div className="flex items-center gap-2">
                {previewDoc.isPrivileged ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-amber-700" /> {previewDoc.privilegeType}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Court Filed Pleading
                  </span>
                )}
              </div>
              <span className="text-[#667085]">Linked: {previewDoc.matterTitle}</span>
            </div>

            <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg shadow-inner font-mono text-xs whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
              <p className="font-bold text-sm text-[#06244B] pb-2 border-b border-slate-100">{previewDoc.title}</p>
              <p className="pt-2">{previewDoc.ocrText}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#D9D6CF]">
              <span className="text-[11px] text-[#667085]">Uploaded by {previewDoc.uploadedByName}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
                  Close
                </Button>
                <Button size="sm" variant="primary" icon={Download} onClick={() => addToast('Document downloaded.', 'success')}>
                  Download File
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload &amp; Index Legal Document"
          subtitle="Index new pleading, discovery exhibit, or confidential work product."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs text-[#202A35]">
            <div>
              <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g. Defendant Motion to Dismiss &amp; Supporting Memorandum"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
                >
                  <option value="Pleadings">Pleadings</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Orders">Orders</option>
                  <option value="Contracts">Contracts</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
                  Linked Matter
                </label>
                <select
                  value={uploadMatterId}
                  onChange={(e) => setUploadMatterId(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-semibold"
                >
                  {matters.map(m => (
                    <option key={m.id} value={m.id}>{m.matterNumber} — {m.title.slice(0, 24)}...</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Privilege Checkbox */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewDocPrivileged}
                  onChange={(e) => setIsNewDocPrivileged(e.target.checked)}
                  className="rounded border-[#D9D6CF] text-[#06244B]"
                />
                <div>
                  <span className="font-bold text-[#06244B] block text-xs">Classify as Attorney-Client Privileged (Utah RPC 1.6)</span>
                  <span className="text-[10px] text-amber-800">Restricts access to legal counsel. Excludes from external disclosures.</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Upload &amp; Index (v1.0)
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
