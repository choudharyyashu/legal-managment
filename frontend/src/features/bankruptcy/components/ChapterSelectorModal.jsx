import React, { useState } from 'react';
import { Landmark, CheckCircle, Scale, ShieldAlert, ArrowRight, DollarSign } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function ChapterSelectorModal({ isOpen, onClose, currentChapter = 'Chapter 7', onSelectChapter }) {
  const [selected, setSelected] = useState(currentChapter);
  const { addToast } = useToast();

  const chapters = [
    {
      id: 'Chapter 7',
      name: 'Chapter 7: Liquidation / Fresh Start',
      statute: '11 U.S.C. §§ 701-727',
      primaryTarget: 'Individuals & Married Couples below Utah Median Income',
      timeline: '3 to 4 months from filing to discharge',
      keyBenefits: [
        'Discharges 100% of qualified unsecured consumer debt (credit cards, medical bills)',
        'No ongoing monthly plan payments to a trustee',
        'Stops collection actions immediately via the Automatic Stay (§ 362)',
        'Debtor retains all exempt property under Utah Code § 78B-5-501'
      ],
      considerations: 'Non-exempt equity is subject to trustee liquidation. Must pass Form 122A-1 Means-Test.'
    },
    {
      id: 'Chapter 13',
      name: 'Chapter 13: Wage Earner Debt Adjustment',
      statute: '11 U.S.C. §§ 1301-1330',
      primaryTarget: 'Individuals with Regular Income & Mortgage Arrears',
      timeline: '36 to 60 month structured repayment plan',
      keyBenefits: [
        'Cures past-due mortgage arrears over 3-5 years to stop foreclosure',
        'Stops auto repossessions and repays car loans at statutory interest',
        'Repays priority tax liabilities to IRS without ongoing penalties',
        'Debtor retains all real and personal property regardless of exemption limits'
      ],
      considerations: 'Requires regular monthly income. 60-month plan required if income is above Utah median.'
    },
    {
      id: 'Chapter 11',
      name: 'Chapter 11: Subchapter V Small Business Reorganization',
      statute: '11 U.S.C. §§ 1181-1195 (SBRA)',
      primaryTarget: 'Small Businesses & High-Debt Individuals (> § 109(e) limits)',
      timeline: '90 days to propose plan; 3 to 5 year reorganization',
      keyBenefits: [
        'Debtor in Possession maintains business operations and management control',
        'No quarterly U.S. Trustee fees under Subchapter V',
        'Eliminates appointment of an unsecured creditors committee in most cases',
        'Cramdown of non-residential secured loans permitted'
      ],
      considerations: 'Higher filing fees ($1,738) and specialized Subchapter V trustee oversight.'
    }
  ];

  const handleConfirm = () => {
    if (onSelectChapter) {
      onSelectChapter(selected);
    }
    addToast(`Bankruptcy case classification updated to ${selected}.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bankruptcy Chapter Selection &amp; Qualification Assessment"
      subtitle="Evaluation of Chapter 7 Liquidation, Chapter 13 Adjustment, and Chapter 11 Reorganization"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs text-[#202A35]">
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded flex items-center justify-between text-amber-900">
          <span>
            <strong>[DEMO SIMULATION]:</strong> Bankruptcy relief selector modeled after Best Case Bankruptcy. Evaluates statutory relief under 11 U.S.C. § 109.
          </span>
          <span className="font-bold bg-amber-200 px-2 py-0.5 rounded text-[10px]">PROTOTYPE</span>
        </div>

        <div className="space-y-3">
          {chapters.map(ch => {
            const isChosen = selected === ch.id;
            return (
              <div
                key={ch.id}
                onClick={() => setSelected(ch.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isChosen
                    ? 'border-[#A4432B] bg-orange-50/30 ring-2 ring-[#A4432B] shadow-sm'
                    : 'border-[#D9D6CF] bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={isChosen}
                      onChange={() => setSelected(ch.id)}
                      className="w-4 h-4 text-[#A4432B] focus:ring-[#A4432B]"
                    />
                    <span className="font-bold text-sm text-[#06244B]">{ch.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#667085]">{ch.statute}</span>
                </div>

                <div className="mt-2 text-xs text-[#202A35] space-y-1">
                  <div><strong>Best Suited For:</strong> {ch.primaryTarget}</div>
                  <div><strong>Timeframe:</strong> {ch.timeline}</div>
                </div>

                <ul className="mt-2 text-[11px] space-y-1 text-[#202A35] list-disc list-inside">
                  {ch.keyBenefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-[#667085] italic">
                  Note: {ch.considerations}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleConfirm}>
            Confirm Chapter Selection ({selected})
          </Button>
        </div>
      </div>
    </Modal>
  );
}

