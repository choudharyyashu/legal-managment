import React, { useState } from 'react';
import {
  X,
  Globe,
  Users,
  Plane,
  FileCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ImmigrationHistoryTimeline } from './ImmigrationHistoryTimeline';
import { ImmigrationEvidenceChecklist } from './ImmigrationEvidenceChecklist';
import { FilingPackageAssemblerModal } from './FilingPackageAssemblerModal';
import { useToast } from '../../../components/ui/Toast';

export function ImmigrationCaseDrawer({ isOpen, onClose, immigrationCase, onUpdateCase }) {
  const [activeTab, setActiveTab] = useState('parties'); // 'parties', 'timeline', 'evidence', 'package', 'deadlines'
  const [isAssemblerOpen, setIsAssemblerOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState(immigrationCase);
  const { addToast } = useToast();

  if (!isOpen || !currentCase) return null;

  const handlePackageCleared = (caseId, attorneyName) => {
    setCurrentCase(prev => ({
      ...prev,
      filingPackage: {
        ...prev.filingPackage,
        status: 'Attorney Cleared for Filing ✓',
        clearedByAttorney: true,
        clearedAt: new Date().toISOString(),
        clearingAttorney: attorneyName,
      }
    }));
    if (onUpdateCase) {
      onUpdateCase({
        ...currentCase,
        filingPackage: {
          ...currentCase.filingPackage,
          status: 'Attorney Cleared for Filing ✓',
          clearedByAttorney: true,
          clearedAt: new Date().toISOString(),
          clearingAttorney: attorneyName,
        }
      });
    }
  };

  const exp = currentCase.expirations || {
    eadExpiration: '2027-04-15',
    advanceParoleExpiration: '2027-04-15',
    passportExpiration: '2028-09-15',
    rfeDueDate: currentCase.rfeDueDate || null,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#06244B] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">
                {currentCase.matterNumber}
              </span>
              <span className="text-xs bg-[#A4432B] px-2 py-0.5 rounded font-semibold">
                {currentCase.category}
              </span>
              <span className="text-xs text-amber-300 font-medium">
                [DEMO SIMULATION]
              </span>
            </div>
            <h2 className="text-base font-bold mt-1 text-white truncate max-w-2xl">
              {currentCase.title}
            </h2>
            <div className="text-xs text-slate-300 mt-0.5 flex gap-4">
              <span>Beneficiary: <strong>{currentCase.beneficiaryName}</strong></span>
              <span>A-Number: <strong>{currentCase.alienNumber}</strong></span>
              <span>USCIS Receipt: <strong>{currentCase.receiptNumber}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 bg-[#F5F0E5] border-b border-[#D9D6CF] overflow-x-auto text-xs">
          {[
            { id: 'parties', label: '1. Dual Parties & Sponsor', icon: Users },
            { id: 'timeline', label: '2. Travel & I-94 History', icon: Plane },
            { id: 'evidence', label: '3. Evidence Checklist', icon: FileCheck },
            { id: 'package', label: '4. Filing Assembly & Sign-Off', icon: Award },
            { id: 'deadlines', label: '5. Expiration Reminders', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#A4432B] text-[#A4432B] bg-white'
                    : 'border-transparent text-[#667085] hover:text-[#06244B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#202A35]">
          {/* Tab 1: Parties & Sponsor */}
          {activeTab === 'parties' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase text-[#06244B]">Petitioner / Employer Sponsor</span>
                    <span className="bg-[#06244B] text-white px-1.5 py-0.5 rounded text-[10px]">U.S. Citizen / Sponsor</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Legal Name:</strong> {currentCase.petitionerName}</div>
                    <div><strong>Status:</strong> U.S. Citizen by Birth (Passport Verified)</div>
                    <div><strong>Address:</strong> 742 South 1100 East, Salt Lake City, UT</div>
                    <div><strong>Relationship:</strong> Qualifying Spouse</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-[#D9D6CF] space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase text-[#06244B]">Beneficiary (Foreign National)</span>
                    <span className="bg-[#A4432B] text-white px-1.5 py-0.5 rounded text-[10px]">Applicant</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Full Name:</strong> {currentCase.beneficiaryName}</div>
                    <div><strong>Alien Number:</strong> {currentCase.alienNumber}</div>
                    <div><strong>Country of Origin:</strong> Mexico</div>
                    <div><strong>Current Class:</strong> B-2 Visitor for Pleasure</div>
                  </div>
                </div>
              </div>

              {/* Form I-864 Poverty Guideline Assessment */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Form I-864 Joint Sponsor Financial Safe Harbor (125% HHS Line)</span>
                  </div>
                  <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    SUFFICIENT ✓
                  </span>
                </div>
                <p className="text-emerald-950 text-xs">
                  Petitioner income ($92,500) and Joint Sponsor Gabriel Alvarez ($114,000) both exceed the statutory 125% Federal Poverty Guideline threshold for household size 2 ($25,550). Public charge ground of inadmissibility overcome.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Travel Timeline */}
          {activeTab === 'timeline' && (
            <ImmigrationHistoryTimeline travelHistory={currentCase.travelHistory || []} />
          )}

          {/* Tab 3: Evidence Checklist */}
          {activeTab === 'evidence' && (
            <ImmigrationEvidenceChecklist evidenceItems={currentCase.evidenceChecklist || []} />
          )}

          {/* Tab 4: Filing Assembly & Sign-Off */}
          {activeTab === 'package' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#06244B]">
                      Package ID: {currentCase.filingPackage?.packageId || 'PKG-IMM-2026-01'}
                    </h4>
                    <span className="text-xs text-[#667085]">
                      Status: <strong>{currentCase.filingPackage?.status || 'Paralegal Assembled'}</strong>
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Award}
                    onClick={() => setIsAssemblerOpen(true)}
                  >
                    Launch Assembly &amp; Attorney Sign-Off Gate
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] uppercase text-[#667085] font-bold block">G-28 Appearance:</span>
                    <span className="font-bold text-[#06244B] mt-1 block">Signed by Counsel</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] uppercase text-[#667085] font-bold block">Indexed Tabs:</span>
                    <span className="font-bold text-[#06244B] mt-1 block">Tabs A through F Indexed</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF]">
                    <span className="text-[10px] uppercase text-[#667085] font-bold block">Statutory Filing Fee:</span>
                    <span className="font-bold text-[#A4432B] mt-1 block">$1,975.00 Check Voucher</span>
                  </div>
                </div>

                {currentCase.filingPackage?.clearedByAttorney && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>
                        Certified &amp; Cleared by <strong>{currentCase.filingPackage.clearingAttorney || 'Sarah Jenkins, Esq.'}</strong> on {new Date(currentCase.filingPackage.clearedAt).toLocaleDateString()}.
                      </span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                      LOCKED FOR DISPATCH
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Expiration Reminders */}
          {activeTab === 'deadlines' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#06244B] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#A4432B]" />
                Statutory Expiration &amp; Response Deadline Monitor
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">EAD Work Authorization:</span>
                  <span className="text-base font-bold text-[#06244B] block">{exp.eadExpiration}</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Valid (160+ days remaining)</span>
                </div>

                <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">Advance Parole Travel Cutoff:</span>
                  <span className="text-base font-bold text-[#06244B] block">{exp.advanceParoleExpiration}</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Valid for travel</span>
                </div>

                <div className="p-4 bg-white rounded-lg border border-[#D9D6CF] shadow-sm space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">Foreign Passport Expiration:</span>
                  <span className="text-base font-bold text-[#06244B] block">{exp.passportExpiration}</span>
                  <span className="text-[11px] text-[#667085]">Valid &gt; 6 months required</span>
                </div>
              </div>

              {exp.rfeDueDate ? (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between text-xs text-red-950">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-bold block">USCIS Request for Evidence (RFE) Deadline: {exp.rfeDueDate}</span>
                      <span>Statutory 87-day window. Failure to respond results in petition denial.</span>
                    </div>
                  </div>
                  <span className="bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    URGENT DOCKET
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-xs text-[#667085]">
                  No active USCIS Requests for Evidence (RFE) pending on this docket.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#D9D6CF] flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Case File
          </Button>
          <div className="text-[11px] text-[#667085]">
            Assigned: <strong>{currentCase.assignedAttorneyName}</strong> &amp; <strong>{currentCase.assignedParalegalName}</strong>
          </div>
        </div>
      </div>

      {/* Filing Package Assembler Modal */}
      <FilingPackageAssemblerModal
        isOpen={isAssemblerOpen}
        onClose={() => setIsAssemblerOpen(false)}
        immigrationCase={currentCase}
        onPackageCleared={handlePackageCleared}
      />
    </div>
  );
}

