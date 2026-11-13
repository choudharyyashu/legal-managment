import React, { useState } from 'react';
import { Layers, CheckCircle2, Circle, Plus, ChevronRight, FileCheck, Sliders, GitBranch, Sparkles, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function WorkflowChecklists() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'builder'
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);

  const [checklists, setChecklists] = useState([
    {
      id: 'wf-1',
      title: 'Civil Litigation Initial Pleadings & Rule 26 Checklist',
      practiceArea: 'Civil Litigation & Dispute Resolution',
      items: [
        { id: 'c1', text: 'Run Adverse Party Conflict Check in HB System', done: true },
        { id: 'c2', text: 'Obtain countersigned engagement letter & trust retainer deposit', done: true },
        { id: 'c3', text: 'Draft and file Complaint / Petition in Utah Judicial District Court', done: true },
        { id: 'c4', text: 'Issue summons and complete constable service of process within 120 days', done: true },
        { id: 'c5', text: 'Serve Initial Rule 26 Disclosures with witness contact list', done: false },
        { id: 'c6', text: 'Negotiate and submit Joint Discovery Plan & Scheduling Order', done: false },
      ]
    },
    {
      id: 'wf-2',
      title: 'Dynasty Trust Execution & Funding Protocol',
      practiceArea: 'Estate Planning, Wills & Trust Administration',
      items: [
        { id: 't1', text: 'Verify grantor, trustee, and beneficiary legal names and SSNs', done: true },
        { id: 't2', text: 'Finalize generation-skipping transfer tax formula clauses', done: true },
        { id: 't3', text: 'Print execution instruments on 24lb archival bond parchment', done: true },
        { id: 't4', text: 'Conduct formal signing ceremony with two independent witnesses & notary', done: false },
        { id: 't5', text: 'Execute Special Warranty Deeds to convey real estate into Trust', done: false },
        { id: 't6', text: 'Provide Certificate of Trust Existence to commercial financial institutions', done: false },
      ]
    },
    {
      id: 'wf-3',
      title: 'Domestic Relations / Divorce Mandatory Financial Declarations',
      practiceArea: 'Family Law & Domestic Relations',
      items: [
        { id: 'f1', text: 'Serve Utah Rule 26.1 Mandatory Financial Declaration with 3 years tax returns', done: true },
        { id: 'f2', text: 'Obtain retirement account 401(k) / pension plan summary plan descriptions', done: true },
        { id: 'f3', text: 'Schedule forensic business valuation of martial dental/medical equity', done: false },
        { id: 'f4', text: 'Calculate preliminary child support guidelines using Utah State worksheet', done: false },
      ]
    },
    {
      id: 'wf-4',
      title: 'Felony Criminal Defense Preliminary Hearing Protocol',
      practiceArea: 'Criminal Defense & State Prosecution Response',
      items: [
        { id: 'cr1', text: 'Enter formal appearance of counsel and demand Rule 16 state discovery', done: true },
        { id: 'cr2', text: 'Subpoena body-worn camera footage, dispatch audio, and breathalyzer logs', done: true },
        { id: 'cr3', text: 'Conduct defense witness cross-examination outline for preliminary hearing', done: false },
        { id: 'cr4', text: 'Draft Motion in Limine to Suppress Illegally Seized Physical Evidence', done: false },
      ]
    },
    {
      id: 'wf-5',
      title: 'Commercial Real Estate Acquisition Due Diligence',
      practiceArea: 'Real Estate, Water Rights & Land Use',
      items: [
        { id: 're1', text: 'Examine Title Commitment Schedule B exceptions and encumbrances', done: true },
        { id: 're2', text: 'Verify state water rights conveyance deeds with Utah Division of Water', done: true },
        { id: 're3', text: 'Review ALTA/NSPS boundary survey for utility easement encroachments', done: false },
        { id: 're4', text: 'Prepare and record Special Warranty Deed and Escrow Closing Statement', done: false },
      ]
    }
  ]);

  // Workflow Automation Rules (CMW-01, CMW-03, CMW-05)
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule-1',
      trigger: 'When Matter Stage advances to "In Discovery"',
      action: 'Auto-spawn task: "Serve Utah Rule 26 Initial Disclosures"',
      assignee: 'Marcus Vance (Litigation Paralegal)',
      deadline: '+14 Days from Stage Advance',
      condition: 'Applies to Civil Litigation & Dispute Resolution',
      enabled: true
    },
    {
      id: 'rule-2',
      trigger: 'When Matter Stage advances to "Trial Prep"',
      action: 'Auto-spawn task: "Draft Pre-Trial Order & Witness Disclosures"',
      assignee: 'Thomas Bludworth, Esq. (Lead Counsel)',
      deadline: '-30 Days before First Trial Date',
      condition: 'Applies to All Litigation Practice Areas',
      enabled: true
    },
    {
      id: 'rule-3',
      trigger: 'Conditional Branch: If "Jury Trial Demanded == Yes"',
      action: 'Branch workflow into: "Jury Instructions & Voir Dire SOP"',
      assignee: 'Assigned Trial Counsel',
      deadline: '-14 Days before Final Pre-Trial',
      condition: 'Civil Litigation & Criminal Defense',
      enabled: true
    },
    {
      id: 'rule-4',
      trigger: 'When Retainer Balance falls below $2,500.00',
      action: 'Auto-spawn task: "Dispatch Retainer Replenishment Request"',
      assignee: 'Rachel Adams (Billing Director)',
      deadline: 'Immediate',
      condition: 'All Hourly Practice Engagements',
      enabled: true
    }
  ]);

  // New Rule Form
  const [newTrigger, setNewTrigger] = useState('When Matter Stage advances to "Expert Discovery"');
  const [newAction, setNewAction] = useState('Auto-spawn task: "Retain Independent Forensic Expert"');
  const [newAssignee, setNewAssignee] = useState('Marcus Vance (Litigation Paralegal)');
  const [newCondition, setNewCondition] = useState('Civil Litigation');

  const handleCreateRule = (e) => {
    e.preventDefault();
    const newR = {
      id: `rule-${Date.now()}`,
      trigger: newTrigger,
      action: newAction,
      assignee: newAssignee,
      deadline: '+7 Days from Trigger',
      condition: newCondition,
      enabled: true
    };
    setAutomationRules(prev => [newR, ...prev]);
    addToast('New workflow automation rule created and activated!', 'success');
    setIsNewRuleOpen(false);
  };

  const toggleItem = (checklistId, itemId) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => item.id === itemId ? { ...item, done: !item.done } : item)
        };
      }
      return cl;
    }));
    addToast('Checklist progress updated.', 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matter Workflow SOPs &amp; Automation Engine"
        subtitle="Standard operating procedures (SOPs), stage-advance task triggers, and conditional branching logic (Filevine Model)."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Workflow Engine' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'checklists' ? 'primary' : 'outline'}
              size="sm"
              icon={FileCheck}
              onClick={() => setActiveTab('checklists')}
            >
              Practice Checklists
            </Button>
            <Button
              variant={activeTab === 'builder' ? 'primary' : 'outline'}
              size="sm"
              icon={GitBranch}
              onClick={() => setActiveTab('builder')}
            >
              Workflow Builder &amp; Rules
            </Button>
          </div>
        }
      />

      {/* Tab 1: Checklists */}
      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 gap-6">
          {checklists.map((cl) => {
            const completedCount = cl.items.filter(i => i.done).length;
            const progressPercent = Math.round((completedCount / cl.items.length) * 100);

            return (
              <div key={cl.id} className="bg-white rounded border border-[#D9D6CF] shadow-subtle p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9D6CF]/60 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#A4432B] uppercase tracking-wider block">
                      {cl.practiceArea}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#06244B] mt-0.5">
                      {cl.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="font-bold text-[#06244B]">{progressPercent}% Completed</span>
                      <span className="text-[#667085] block">{completedCount} of {cl.items.length} steps</span>
                    </div>
                    <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#287A55] h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#D9D6CF]/40">
                  {cl.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(cl.id, item.id)}
                      className="py-2.5 flex items-start gap-3 hover:bg-[#F5F0E5]/30 px-2 rounded cursor-pointer transition-colors"
                    >
                      <button className="mt-0.5 text-[#06244B] hover:text-[#A4432B]">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-[#287A55]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#667085]" />
                        )}
                      </button>
                      <span className={`text-xs ${item.done ? 'line-through text-[#667085]' : 'text-[#202A35] font-medium'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Workflow Builder & Rules (CMW-01, CMW-03, CMW-05) */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D6CF] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#06244B]">
                  Configurable Workflow Rules Engine
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Automate task spawning, deadline chains, and conditional branch protocols upon matter stage advancement.
                </p>
              </div>
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsNewRuleOpen(true)}>
                Add Automation Rule
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationRules.map(rule => (
                <div key={rule.id} className="p-4 rounded-lg border border-[#D9D6CF] bg-slate-50 space-y-2 hover:border-[#A4432B] transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-[#A4432B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {rule.trigger}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#06244B]">{rule.action}</p>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-[#667085] space-y-1">
                    <div className="flex justify-between">
                      <span>Assigned Staff:</span>
                      <span className="font-medium text-[#202A35]">{rule.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated Cutoff:</span>
                      <span className="font-medium text-[#202A35]">{rule.deadline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applicable Scope:</span>
                      <span className="font-medium text-emerald-800">{rule.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Automation Rule Modal */}
      <Modal
        isOpen={isNewRuleOpen}
        onClose={() => setIsNewRuleOpen(false)}
        title="Create Workflow Automation Rule"
        subtitle="Stage-Gate Trigger &amp; Task Auto-Assignment Engine"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Trigger Event
            </label>
            <select
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value='When Matter Stage advances to "In Discovery"'>When Stage advances to "In Discovery"</option>
              <option value='When Matter Stage advances to "Expert Discovery"'>When Stage advances to "Expert Discovery"</option>
              <option value='When Matter Stage advances to "Trial Prep"'>When Stage advances to "Trial Prep"</option>
              <option value='When Complaint Served via Constable'>When Complaint Served via Constable</option>
              <option value='Conditional: If Jury Trial Demanded'>Conditional: If Jury Trial Demanded</option>
            </select>
          </div>

          <div>
            <Input
              label="Automated Action / Spawned Task"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="e.g. Spawn: Retain Forensic Accountant"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Assignee Role / Staff
            </label>
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="Marcus Vance (Litigation Paralegal)">Marcus Vance (Litigation Paralegal)</option>
              <option value="Thomas Bludworth, Esq. (Lead Counsel)">Thomas Bludworth, Esq. (Lead Counsel)</option>
              <option value="Rachel Adams (Billing Director)">Rachel Adams (Billing Director)</option>
              <option value="Assigned Supervising Partner">Assigned Supervising Partner</option>
            </select>
          </div>

          <div>
            <Input
              label="Practice Area Condition Filter"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="e.g. Civil Litigation"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsNewRuleOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={Plus}>
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
