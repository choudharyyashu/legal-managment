import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldCheck, Flame, CheckCircle, FileText } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function EmergencyFilingModal({ isOpen, onClose, bankruptcyCase, onConfirmEmergencyFiling }) {
  const [emergencyReason, setEmergencyReason] = useState('Imminent Sheriff Wage Garnishment (25% check withholding)');
  const [stayCertified, setStayCertified] = useState(false);
  const { addToast } = useToast();

  if (!bankruptcyCase) return null;

  const handleExecuteEmergency = (e) => {
    e.preventDefault();
    if (!stayCertified) {
      addToast('Please certify that emergency grounds exist and creditor matrix is attached.', 'error');
      return;
    }

    const deficiencyDeadline = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    if (onConfirmEmergencyFiling) {
      onConfirmEmergencyFiling(bankruptcyCase.id, deficiencyDeadline, emergencyReason);
    }
    addToast(
      `Emergency "Bare-Bones" Petition filed! Automatic Stay (§ 362) engaged. Complete Schedules A-J due in 14 days (${deficiencyDeadline}).`,
      'warning'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency 'Bare-Bones' Bankruptcy Filing Gateway"
      subtitle={`Case: ${bankruptcyCase.caseNumber} — ${bankruptcyCase.debtorName}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleExecuteEmergency} className="space-y-4 text-xs text-[#202A35]">
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-950 flex items-start gap-2.5">
          <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm">EMERGENCY PROCEDURE WARNING:</span>
            <p className="leading-relaxed">
              Under Bankruptcy Rule 1007(c), an emergency "bare-bones" petition requires only the <strong>Voluntary Petition (Official Form 101)</strong> and the <strong>Creditor Mailing Matrix</strong>. All remaining Schedules (A/B, D, E/F, I, J, Form 122 Means-Test, and Statement of Financial Affairs) <strong>MUST BE FILED WITHIN 14 DAYS</strong> or the court will dismiss the case without further notice.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Emergency Justification for Expedited Filing
          </label>
          <select
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
          >
            <option value="Imminent Sheriff Wage Garnishment (25% check withholding)">Imminent Sheriff Wage Garnishment (25% paycheck levy)</option>
            <option value="Scheduled Residential Foreclosure Sale within 48 Hours">Scheduled Residential Foreclosure Auction within 48 Hours</option>
            <option value="Imminent Vehicle Repossession Order">Imminent Vehicle Repossession Order by Secured Lender</option>
            <option value="Impending Eviction Restitution of Premises Warrant">Impending Eviction Restitution of Premises Warrant</option>
            <option value="Bank Account Frozen by Judgment Creditor">Bank Account Frozen by State Court Judgment Creditor</option>
          </select>
        </div>

        <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-2">
          <span className="font-bold text-[#06244B] uppercase text-[10px] block">
            Automatic Stay Activation Scope (11 U.S.C. § 362):
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#202A35]">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Halts all active wage garnishments</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stays sheriff trustee foreclosure sales</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prohibits creditor collection calls</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stops civil debt lawsuits &amp; citations</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-white border border-[#D9D6CF] rounded">
          <input
            type="checkbox"
            id="emergencyAttest"
            checked={stayCertified}
            onChange={(e) => setStayCertified(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded mt-0.5 focus:ring-red-500"
          />
          <label htmlFor="emergencyAttest" className="text-xs text-[#202A35] leading-relaxed cursor-pointer">
            <strong>Counsel Certification:</strong> I certify that an emergency exists threatening debtor assets, the standard creditor matrix is compiled, and the firm will complete and submit full Schedules A-J and Form 122 within the 14-day statutory deficiency period.
          </label>
        </div>

        <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" className="bg-red-700 hover:bg-red-800 border-red-700">
            Execute Emergency Filing &amp; Engage Stay
          </Button>
        </div>
      </form>
    </Modal>
  );
}

