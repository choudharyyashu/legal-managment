import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  Printer,
  Download,
  Award,
  DollarSign,
  Gavel,
  Landmark,
  Scale
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_LITIGATION_CASES } from '../../../data/mockLitigationCases';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { useToast } from '../../../components/ui/Toast';

export function TrialNotebook() {
  const [cases, setCases] = useState(MOCK_LITIGATION_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_LITIGATION_CASES[0]);
  const [activeTab, setActiveTab] = useState('witnesses'); // 'witnesses', 'exhibits', 'motions', 'enforcement'
  const [isAddWitnessOpen, setIsAddWitnessOpen] = useState(false);
  const [isAddExhibitOpen, setIsAddExhibitOpen] = useState(false);
  const { addToast } = useToast();

  const trial = activeCase.trialPlan || {
    trialDate: '2026-10-14',
    estimatedDays: 4,
    trialFormat: 'Jury Trial',
    plaintiffWitnesses: [],
    exhibitBinder: [],
    motionsInLimine: []
  };

  // Add witness state
  const [wName, setWName] = useState('');
  const [wCall, setWCall] = useState('Will Call');
  const [wTime, setWTime] = useState('2.0 hrs');
  const [wPurpose, setWPurpose] = useState('');

  // Add exhibit state
  const [exNum, setExNum] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [exStatus, setExStatus] = useState('Stipulated Admissible');
  const [exObj, setExObj] = useState('None');

  const handleAddWitness = (e) => {
    e.preventDefault();
    const newW = {
      name: wName,
      order: (trial.plaintiffWitnesses?.length || 0) + 1,
      willCall: wCall,
      estimateTime: wTime,
      purpose: wPurpose
    };

    setActiveCase(prev => ({
      ...prev,
      trialPlan: {
        ...prev.trialPlan,
        plaintiffWitnesses: [...(prev.trialPlan?.plaintiffWitnesses || []), newW]
      }
    }));

    addToast(`Witness ${wName} added to trial examination roster!`, 'success');
    setIsAddWitnessOpen(false);
    setWName('');
    setWPurpose('');
  };

  const handleAddExhibit = (e) => {
    e.preventDefault();
    const newEx = {
      num: exNum,
      description: exDesc,
      status: exStatus,
      objections: exObj
    };

    setActiveCase(prev => ({
      ...prev,
      trialPlan: {
        ...prev.trialPlan,
        exhibitBinder: [...(prev.trialPlan?.exhibitBinder || []), newEx]
      }
    }));

    addToast(`Exhibit ${exNum} added to Trial Binder!`, 'success');
    setIsAddExhibitOpen(false);
    setExNum('');
    setExDesc('');
  };

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Trial Notebook, Hearing Packages &amp; Enforcement"
        subtitle="Manage witness examination orders, exhibit binders, motions in limine, and post-judgment enforcement (Sections 7 &amp; 8)."
        breadcrumbs={[
          { label: 'Litigation Workspace', to: '/litigation/dashboard' },
          { label: 'Trial Notebook' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Trial Notebook
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddWitnessOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Add Witness
            </Button>
          </div>
        }
      />

      {/* Trial Header Setting Card */}
      <div className="p-4 bg-[#06244B] text-white rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-300" />
            <span className="font-serif font-bold text-base text-white">Trial Setting: {trial.trialDate}</span>
            <span className="bg-[#A4432B] px-2 py-0.5 rounded text-[10px] font-bold">
              {trial.trialFormat}
            </span>
          </div>
          <p className="text-slate-300 mt-0.5">
            Presiding: <strong>{activeCase.judge}</strong> • Estimated Length: <strong>{trial.estimatedDays} Days</strong> • Courtroom 301
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 px-3 py-1 rounded text-amber-200 font-mono font-bold">
            {trial.plaintiffWitnesses?.length || 0} Witnesses • {trial.exhibitBinder?.length || 0} Exhibits Tabbed
          </span>
        </div>
      </div>

      {/* Trial Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2 text-xs">
        {[
          { id: 'witnesses', label: '1. Witness Examination Order', count: trial.plaintiffWitnesses?.length || 0 },
          { id: 'exhibits', label: '2. Trial Exhibit Binder', count: trial.exhibitBinder?.length || 0 },
          { id: 'motions', label: '3. Motions in Limine', count: trial.motionsInLimine?.length || 0 },
          { id: 'enforcement', label: '4. Judgment & Writs Enforcement', count: 1 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#06244B] text-white shadow-sm'
                : 'bg-white border border-[#D9D6CF] text-[#667085] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Witness Examination Order */}
      {activeTab === 'witnesses' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Plaintiff's Trial Witness Roster &amp; Direct Examination Plan
            </h3>
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setIsAddWitnessOpen(true)}
              className="text-xs"
            >
              Add Witness
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-[#06244B] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-3 w-16">Order</th>
                  <th className="p-3">Witness Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Estimated Time</th>
                  <th className="p-3">Substantive Scope &amp; Examination Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
                {(trial.plaintiffWitnesses || []).map((w) => (
                  <tr key={w.order} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sm text-[#A4432B]">#{w.order}</td>
                    <td className="p-3 font-bold text-[#06244B]">{w.name}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.willCall.includes('Will Call')
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {w.willCall}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{w.estimateTime}</td>
                    <td className="p-3 text-slate-700 leading-relaxed">{w.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Trial Exhibit Binder */}
      {activeTab === 'exhibits' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Numbered Trial Exhibits Binder &amp; Evidentiary Objections
            </h3>
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setIsAddExhibitOpen(true)}
              className="text-xs"
            >
              Add Trial Exhibit
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-[#06244B] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-3 w-20">Exhibit #</th>
                  <th className="p-3">Document Description</th>
                  <th className="p-3">Admissibility Status</th>
                  <th className="p-3">Defense Objections / Foundation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
                {(trial.exhibitBinder || []).map((ex) => (
                  <tr key={ex.num} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sm text-[#A4432B]">{ex.num}</td>
                    <td className="p-3 font-medium text-[#06244B]">{ex.description}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        ex.status.includes('Stipulated')
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-xs italic">{ex.objections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Motions in Limine */}
      {activeTab === 'motions' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF]">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Pretrial Motions in Limine &amp; Evidentiary Exclusions
            </h3>
          </div>

          <div className="p-4 divide-y divide-[#D9D6CF]">
            {(trial.motionsInLimine || []).map((mil) => (
              <div key={mil.id} className="py-3 first:pt-0 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-[#06244B]">{mil.title}</div>
                  <div className="text-[11px] text-[#667085]">Movant: {mil.movant}</div>
                </div>
                <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                  {mil.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Judgment & Enforcement */}
      {activeTab === 'enforcement' && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-[#D9D6CF] rounded-xl shadow-sm space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#06244B] border-b border-[#D9D6CF] pb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#A4432B]" />
              Judgment Terms &amp; Post-Judgment Enforcement Engine (Utah Code § 78B-5-201)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                <span className="font-bold text-[#06244B] block">Principal Award</span>
                <span className="text-xl font-bold font-mono text-[#06244B] block">$148,500.00</span>
                <span className="text-[10px] text-[#667085]">Plus $18,400 statutory attorney fees</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                <span className="font-bold text-[#06244B] block">Post-Judgment Interest</span>
                <span className="text-xl font-bold font-mono text-emerald-700 block">7.42% p.a.</span>
                <span className="text-[10px] text-[#667085]">Utah Code § 15-1-4 (Federal Rate + 2%)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
                <span className="font-bold text-[#06244B] block">Active Execution Writs</span>
                <span className="text-xl font-bold font-mono text-[#A4432B] block">Writ of Garnishment</span>
                <span className="text-[10px] text-[#667085]">Served on Wells Fargo Commercial</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Witness Modal */}
      {isAddWitnessOpen && (
        <Modal
          isOpen={isAddWitnessOpen}
          onClose={() => setIsAddWitnessOpen(false)}
          title="Add Witness to Direct Examination Roster"
          subtitle={`Trial Setting: ${trial.trialDate}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddWitness} className="space-y-4 text-xs">
            <div>
              <Input
                label="Witness Full Legal Name *"
                value={wName}
                onChange={(e) => setWName(e.target.value)}
                placeholder="e.g. Dr. Arthur Miller, Ph.D."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                  Call Designation
                </label>
                <select
                  value={wCall}
                  onChange={(e) => setWCall(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  <option value="Will Call">Will Call</option>
                  <option value="May Call">May Call</option>
                  <option value="May Call (Hostile / Adverse)">May Call (Hostile / Adverse)</option>
                  <option value="Rebuttal Witness">Rebuttal Witness</option>
                </select>
              </div>
              <div>
                <Input
                  label="Estimated Direct Time"
                  value={wTime}
                  onChange={(e) => setWTime(e.target.value)}
                  placeholder="e.g. 1.5 hrs"
                />
              </div>
            </div>
            <div>
              <Input
                label="Substantive Scope &amp; Key Testimony Purpose"
                value={wPurpose}
                onChange={(e) => setWPurpose(e.target.value)}
                placeholder="e.g. Establish contract execution and verify delivery logs..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsAddWitnessOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#A4432B] hover:bg-[#8B3824]">
                Add to Trial Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Exhibit Modal */}
      {isAddExhibitOpen && (
        <Modal
          isOpen={isAddExhibitOpen}
          onClose={() => setIsAddExhibitOpen(false)}
          title="Add Exhibit to Trial Binder"
          subtitle="Pre-mark exhibit with designated trial exhibit number"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddExhibit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Exhibit Number *"
                value={exNum}
                onChange={(e) => setExNum(e.target.value)}
                placeholder="e.g. P-05 or D-12"
                required
              />
              <div>
                <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                  Stipulation / Status
                </label>
                <select
                  value={exStatus}
                  onChange={(e) => setExStatus(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  <option value="Stipulated Admissible">Stipulated Admissible</option>
                  <option value="Objection Pending">Objection Pending</option>
                  <option value="Contested (Foundation Required)">Contested (Foundation Required)</option>
                </select>
              </div>
            </div>
            <div>
              <Input
                label="Document Description *"
                value={exDesc}
                onChange={(e) => setExDesc(e.target.value)}
                placeholder="e.g. Certified Bill of Lading dated Nov 12, 2024"
                required
              />
            </div>
            <div>
              <Input
                label="Known Defense Objections"
                value={exObj}
                onChange={(e) => setExObj(e.target.value)}
                placeholder="e.g. Rule 802 Hearsay or Rule 403 Prejudicial"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsAddExhibitOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#06244B] hover:bg-[#0B356D]">
                Add to Exhibit Binder
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

