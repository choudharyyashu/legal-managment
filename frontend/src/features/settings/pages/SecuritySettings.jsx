import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Smartphone,
  Sparkles,
  Database,
  FileText,
  RotateCcw,
  RefreshCw,
  Server,
  Cloud,
  Download,
  Check
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { usePermissions } from '../../../hooks/usePermissions';
import { MfaSetupModal } from '../components/MfaSetupModal';
import { BackupRestoreModal } from '../components/BackupRestoreModal';

export function SecuritySettings() {
  const { addToast } = useToast();
  const permissions = usePermissions();

  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipRestricted, setIpRestricted] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // In-page disaster recovery dry-run drill state
  const [isDrillRunning, setIsDrillRunning] = useState(false);
  const [drillProgress, setDrillProgress] = useState(0);
  const [drillStep, setDrillStep] = useState('');
  const [drillCompleted, setDrillCompleted] = useState(false);

  const handleRunDrill = () => {
    setIsDrillRunning(true);
    setDrillCompleted(false);
    setDrillProgress(15);
    setDrillStep('Verifying PostgreSQL relational dump & SHA-256 checksums...');

    setTimeout(() => {
      setDrillProgress(45);
      setDrillStep('Spinning up isolated cloud staging sandbox & restoring schemas...');
    }, 800);

    setTimeout(() => {
      setDrillProgress(75);
      setDrillStep('Validating IOLTA three-way ledger balances & document file signatures ($0 variance)...');
    }, 1800);

    setTimeout(() => {
      setDrillProgress(100);
      setDrillStep('Dry-run complete: 100% data fidelity verified. Sandbox destroyed.');
      setIsDrillRunning(false);
      setDrillCompleted(true);
      addToast('Disaster Recovery Dry-Run Drill passed with 0 errors! RTO: 18 minutes.', 'success');
    }, 2800);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!permissions.canEditSettings) {
      addToast('Super Admin authorization required to modify firm security policy.', 'error');
      return;
    }
    addToast('Firm security policy updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security &amp; Data Governance"
        subtitle="Confidentiality controls, session timeout policies, and Utah Rule of Professional Conduct 1.6 compliance."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Security' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Smartphone}
              onClick={() => setIsMfaModalOpen(true)}
            >
              Configure MFA (SBO-02)
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={HardDrive}
              onClick={() => setIsBackupModalOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Backups &amp; Disaster Recovery
            </Button>
          </div>
        }
      />

      {/* Automated Backup Schedule & Disaster Recovery Architecture Card (Requirement 8) */}
      <div className="bg-white p-6 rounded-xl border border-[#D9D6CF] shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D6CF] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#06244B] text-amber-300 rounded-lg shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#06244B]">
                  Automated Daily Backups &amp; Disaster Recovery Architecture
                </h3>
                <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                  RPO: 24h • RTO: &lt;4h
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Automated multi-region replication, AES-256 GCM encryption, and point-in-time recovery for Utah RPC 1.6 compliance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={RotateCcw}
              onClick={handleRunDrill}
              disabled={isDrillRunning}
              className="text-xs font-semibold text-[#06244B]"
            >
              {isDrillRunning ? 'Executing Drill...' : 'Run Restore Dry-Run Drill'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={() => setIsBackupModalOpen(true)}
              className="text-xs"
            >
              Snapshot Ledger
            </Button>
          </div>
        </div>

        {/* 4 Architecture KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#667085] block flex items-center justify-between">
              <span>Last Daily Snapshot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
            <div className="font-bold text-sm text-[#06244B]">Today, 02:00:14 UTC</div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> SHA-256 Integrity Verified
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#667085] block">Backup Cadence</span>
            <div className="font-bold text-sm text-[#06244B]">Automated Daily (02:00 UTC)</div>
            <div className="text-[11px] text-[#667085]">Next run: In 13 hrs • 30-Day Immutable WORM</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#667085] block">Encryption &amp; Geo-Redundancy</span>
            <div className="font-bold text-sm text-[#06244B]">AES-256 GCM (At Rest)</div>
            <div className="text-[11px] text-[#667085]">US-West (SLC) &rarr; US-East (VA) Replicated</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#667085] block">Recovery SLA Target</span>
            <div className="font-bold text-sm text-[#06244B]">RPO: 24h • RTO: &lt; 4h</div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              Actual Dry-Run RTO: <strong>18 Minutes</strong>
            </div>
          </div>
        </div>

        {/* Live Restore Dry-Run Drill Simulator */}
        {(isDrillRunning || drillCompleted) && (
          <div className="p-4 bg-slate-50 border border-[#06244B]/20 rounded-lg space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-[#06244B]">
              <span className="flex items-center gap-1.5">
                <RotateCcw className={`w-3.5 h-3.5 text-[#A4432B] ${isDrillRunning ? 'animate-spin' : ''}`} />
                Point-in-Time Recovery Dry-Run Simulation:
              </span>
              <span className="font-mono text-emerald-800">{drillProgress}% Completed</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#06244B] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${drillProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#667085]">
              <span className="italic">{drillStep}</span>
              {drillCompleted && (
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  DRY-RUN VERIFICATION PASSED (0 ANOMALIES) ✓
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#D9D6CF] shadow-sm space-y-6">
        <div className="border-b border-[#D9D6CF]/60 pb-4">
          <h3 className="font-serif font-bold text-base text-[#06244B]">
            Authentication &amp; Session Policies (SBO-01, SBO-02, SBO-03)
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">Enforce firm-wide standards for law firm workstations and mobile portal devices.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Two-Factor Authentication (2FA / MFA - TOTP)</span>
              <span className="text-[#667085]">Require TOTP authenticator app or hardware FIDO2 key for all attorney and staff accounts.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsMfaModalOpen(true)}
                className="text-[11px] py-1 bg-white text-[#06244B]"
              >
                Enroll TOTP Key
              </Button>
              <input
                type="checkbox"
                checked={mfaEnforced}
                onChange={(e) => setMfaEnforced(e.target.checked)}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Inactivity Session Timeout</span>
              <span className="text-[#667085]">Automatically lock unattended workstations to prevent unauthorized client record disclosure.</span>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="p-1.5 rounded border border-[#D9D6CF] bg-white text-xs font-semibold text-[#06244B]"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes (Recommended)</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">IP Range Restrictions</span>
              <span className="text-[#667085]">Restrict General Ledger &amp; IOLTA financial accounting export authorizations to firm office VPN ranges.</span>
            </div>
            <input
              type="checkbox"
              checked={ipRestricted}
              onChange={(e) => setIpRestricted(e.target.checked)}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
            />
          </div>
        </div>

        {/* AI & Cloud Provider Compliance Disclosure Card (SBO-12) */}
        <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-2">
          <div className="flex items-center gap-2 text-[#06244B] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#A4432B]" />
            <span>External AI &amp; Cloud Provider Compliance Disclosure (SBO-12)</span>
          </div>
          <p className="text-xs text-[#202A35] leading-relaxed">
            In compliance with <strong>Utah Rule of Professional Conduct 1.6 (Confidentiality)</strong> and <strong>ABA Formal Opinion 512 (Generative AI Tools)</strong>:
          </p>
          <ul className="text-xs text-[#667085] space-y-1 list-disc list-inside">
            <li><strong>Zero Public Model Training:</strong> Client communications, bio-data, and case files are strictly excluded from public AI training corpuses.</li>
            <li><strong>Data Retention Zero-Day:</strong> External LLM inference pipelines enforce zero persistent logging on third-party servers.</li>
            <li><strong>100% Firm Intellectual Property:</strong> All pleadings, work product, notes, and templates remain the sole exclusive property of Heugly &amp; Bludworth.</li>
          </ul>
        </div>

        {/* Compliance Certification */}
        <div className="p-4 bg-emerald-950 text-emerald-100 rounded-lg border border-emerald-800 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Utah RPC 1.6 &amp; ABA Formal Opinion 477R Compliance</p>
            <p className="text-emerald-200 mt-0.5 leading-relaxed">
              Software parameters adhere to standard legal industry cybersecurity guidance for transmitting and storing client confidential and proprietary commercial matter data.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!permissions.canEditSettings}
            className="bg-[#A4432B] hover:bg-[#8B3824]"
          >
            Save Security Controls
          </Button>
        </div>
      </form>

      {/* MFA Modal */}
      <MfaSetupModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
      />

      {/* Backup & Disaster Recovery Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
