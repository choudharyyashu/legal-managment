import React, { useState } from 'react';
import { ShieldCheck, QrCode, Key, Copy, Download, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function MfaSetupModal({ isOpen, onClose, userName = 'Thomas Bludworth, Esq.' }) {
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: QR & Secret, 2: Verification Code, 3: Backup Codes
  const [authCode, setAuthCode] = useState('');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [copiedKey, setCopiedKey] = useState(false);
  const [backupCodes] = useState([
    'A9F2-4821', 'K281-9943', 'B764-1182', 'X902-3341', 'M551-7829',
    'R310-4490', 'L892-0012', 'P443-8821', 'C109-6632', 'W771-5540'
  ]);

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(secretKey);
    setCopiedKey(true);
    addToast('Secret key copied to clipboard.', 'info');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (authCode.length < 6) {
      addToast('Please enter the 6-digit verification code from your authenticator app.', 'error');
      return;
    }
    setStep(3);
    addToast('Authenticator verified successfully. Save your emergency backup codes.', 'success');
  };

  const handleFinish = () => {
    addToast('Multi-Factor Authentication (MFA) is now active on your account.', 'success');
    onClose();
    setStep(1);
    setAuthCode('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Multi-Factor Authentication (MFA / 2FA)"
      subtitle={`Enforce hardware/TOTP authentication for ${userName}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F5F0E5] border border-[#D9D6CF] rounded text-[#06244B]">
              <span className="font-bold block text-sm mb-1">Step 1: Scan QR Code with Authenticator App</span>
              <p className="text-[11px] text-[#667085]">
                Use Google Authenticator, Microsoft Authenticator, 1Password, or any standard RFC 6238 TOTP application.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#D9D6CF] rounded">
              {/* Simulated QR Code Canvas */}
              <div className="w-40 h-40 bg-slate-900 rounded p-2 flex flex-col items-center justify-center text-white relative shadow-inner">
                <QrCode className="w-28 h-28 text-white stroke-[1.5]" />
                <span className="text-[9px] font-mono tracking-widest text-slate-300 mt-1">HEUGLY-BLUDWORTH-MFA</span>
              </div>
              <span className="text-[10px] text-[#667085] mt-2">Time-based One-Time Password (TOTP)</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#667085] uppercase mb-1">
                Or manually enter secret key:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={secretKey}
                  className="font-mono text-xs p-2 bg-slate-100 rounded border border-[#D9D6CF] flex-1 text-center font-bold tracking-wider"
                />
                <Button size="sm" variant="outline" icon={Copy} onClick={handleCopySecret}>
                  {copiedKey ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="primary" onClick={() => setStep(2)}>
                Next: Verify Code &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="p-3 bg-[#F5F0E5] border border-[#D9D6CF] rounded text-[#06244B]">
              <span className="font-bold block text-sm mb-1">Step 2: Enter 6-Digit Verification Code</span>
              <p className="text-[11px] text-[#667085]">
                Enter the current code displayed in your authenticator app to confirm proper configuration.
              </p>
            </div>

            <div className="py-2 text-center">
              <input
                type="text"
                maxLength={6}
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                autoFocus
                className="text-center font-mono text-2xl font-bold tracking-widest w-48 p-2 border-2 border-[#06244B] rounded bg-white text-[#06244B] focus:outline-none"
              />
              <span className="block text-[11px] text-[#667085] mt-1.5">
                Simulated code test: type any 6 digits (e.g. 583921)
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setStep(1)}>
                &larr; Back
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Verify Code &rarr;
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-sm">Step 3: Emergency Backup Recovery Codes</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Save these one-time recovery codes in a secure vault. If you lose access to your primary authenticator device, each code can be used once to access your account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-[#D9D6CF] rounded font-mono text-xs font-semibold text-[#06244B]">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-white border border-[#D9D6CF]/70 rounded text-center">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Download}
                onClick={() => addToast('Backup codes downloaded as txt file.', 'info')}
                className="flex-1"
              >
                Download Codes (.txt)
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard?.writeText(backupCodes.join('\n'));
                  addToast('All 10 backup codes copied to clipboard.', 'info');
                }}
                className="flex-1"
              >
                Copy All Codes
              </Button>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="primary" icon={ShieldCheck} onClick={handleFinish}>
                Complete MFA Enrollment
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

