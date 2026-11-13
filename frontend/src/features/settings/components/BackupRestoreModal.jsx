import React, { useState } from 'react';
import { Database, HardDrive, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Download, History, RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function BackupRestoreModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('snapshots'); // 'snapshots', 'restore', 'export'
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedSnapshot, setSelectedSnapshot] = useState('SNAP-20261110-0200');

  const [snapshots, setSnapshots] = useState([
    {
      id: 'SNAP-20261110-0200',
      timestamp: '2026-11-10 02:00:14 UTC',
      type: 'Automated Daily',
      size: '842.6 MB',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'Verified Healthy',
      retention: '30 Days Immutable'
    },
    {
      id: 'SNAP-20261109-0200',
      timestamp: '2026-11-09 02:00:22 UTC',
      type: 'Automated Daily',
      size: '839.1 MB',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'Verified Healthy',
      retention: '30 Days Immutable'
    },
    {
      id: 'SNAP-20261108-0200',
      timestamp: '2026-11-08 02:00:08 UTC',
      type: 'Automated Daily',
      size: '834.7 MB',
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      status: 'Verified Healthy',
      retention: '30 Days Immutable'
    },
    {
      id: 'SNAP-20261102-1830',
      timestamp: '2026-11-02 18:30:00 UTC',
      type: 'Pre-Deployment Manual',
      size: '812.4 MB',
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      status: 'Archived Cold',
      retention: '7 Years Statutory'
    }
  ]);

  const handleCreateSnapshot = () => {
    const newSnap = {
      id: `SNAP-${Date.now().toString().slice(-8)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      type: 'Manual On-Demand',
      size: '845.2 MB',
      sha256: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
      status: 'Verified Healthy',
      retention: '90 Days Manual'
    };
    setSnapshots([newSnap, ...snapshots]);
    addToast('On-demand immutable snapshot generated and replicated to multi-region cloud storage.', 'success');
  };

  const handleSimulateRestore = () => {
    setIsRestoring(true);
    setRestoreProgress(10);
    const interval = setInterval(() => {
      setRestoreProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          addToast(`Point-in-time recovery test to ${selectedSnapshot} completed with 0 errors.`, 'success');
          return 100;
        }
        return p + 30;
      });
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disaster Recovery, Automated Backups &amp; Data Portability"
      subtitle="Utah RPC 1.6 compliance: Automated daily multi-region snapshots and point-in-time recovery."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2">
          {[
            { id: 'snapshots', label: 'Snapshot Logs (SBO-07)' },
            { id: 'restore', label: 'Point-in-Time Restore (SBO-09)' },
            { id: 'export', label: 'Tenant Data Export (SBO-10)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-t text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#06244B] text-white'
                  : 'text-[#667085] hover:text-[#06244B] bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'snapshots' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#06244B] block">Automated Immutable Snapshots</span>
                <span className="text-[11px] text-[#667085]">Encrypted AES-256 GCM in transit and at rest in secondary cloud region.</span>
              </div>
              <Button size="sm" variant="primary" icon={HardDrive} onClick={handleCreateSnapshot}>
                Create Snapshot Now
              </Button>
            </div>

            <div className="overflow-x-auto border border-[#D9D6CF] rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
                  <tr>
                    <th className="p-2">Snapshot ID</th>
                    <th className="p-2">Timestamp (UTC)</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Archive Size</th>
                    <th className="p-2">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF]">
                  {snapshots.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-[#06244B]">{s.id}</td>
                      <td className="p-2">{s.timestamp}</td>
                      <td className="p-2">{s.type}</td>
                      <td className="p-2 font-semibold">{s.size}</td>
                      <td className="p-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold text-sm">Disaster Recovery Point-in-Time Restore Simulator</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                Simulate a non-destructive restore of database records, client documents, and IOLTA transaction ledgers to an isolated staging environment.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Select Recovery Target Snapshot
              </label>
              <select
                value={selectedSnapshot}
                onChange={(e) => setSelectedSnapshot(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                {snapshots.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.timestamp} ({s.size})
                  </option>
                ))}
              </select>
            </div>

            {isRestoring && (
              <div className="space-y-2 p-3 bg-slate-50 border border-[#D9D6CF] rounded">
                <div className="flex justify-between font-semibold text-xs">
                  <span>Simulating point-in-time recovery to staging sandbox...</span>
                  <span>{restoreProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#06244B] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${restoreProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button
                size="sm"
                variant="primary"
                icon={RotateCcw}
                disabled={isRestoring}
                onClick={handleSimulateRestore}
              >
                {isRestoring ? 'Simulating Recovery...' : 'Execute Recovery Simulation'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F5F0E5] border border-[#D9D6CF] rounded text-[#06244B]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Database className="w-4 h-4 text-[#A4432B]" />
                <span>Client Data Ownership &amp; 100% Portability (SBO-10)</span>
              </div>
              <p className="text-[11px] text-[#667085] mt-1">
                Heugly &amp; Bludworth retains 100% proprietary ownership of all data. Generate an immediate, unencumbered export of all firm records in standard open schemas (JSON + SQL + PDF).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#D9D6CF] rounded space-y-1">
                <span className="font-bold text-[#06244B] block">Complete Relational Dump</span>
                <span className="text-[11px] text-[#667085] block">Clients, Matters, Invoices, Time Entries, Trust Ledgers.</span>
                <span className="text-[10px] font-mono text-emerald-700 block">Format: Normalized JSON + PostgreSQL .sql</span>
              </div>
              <div className="p-3 bg-white border border-[#D9D6CF] rounded space-y-1">
                <span className="font-bold text-[#06244B] block">Document Vault Archive</span>
                <span className="text-[11px] text-[#667085] block">All pleadings, evidence scans, executed engagement letters.</span>
                <span className="text-[10px] font-mono text-emerald-700 block">Format: ZIP Archive with SHA-256 Manifest</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button
                size="sm"
                variant="primary"
                icon={Download}
                onClick={() => addToast('Export archive generation requested. Download link will be generated.', 'success')}
              >
                Generate Complete Firm Export (.ZIP)
              </Button>
            </div>
          </div>
        )}

        <div className="p-2.5 bg-slate-50 border border-[#D9D6CF] rounded text-[11px] text-[#667085] flex items-center justify-between">
          <span>
            <strong>[DEMO/SIMULATED]:</strong> Cloud storage backup and point-in-time recovery simulator for firm audit compliance.
          </span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

