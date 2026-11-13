import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  Trash2,
  Save,
  RotateCcw,
  ShieldCheck,
  Clock,
  FileCheck,
  GitBranch,
  GitMerge,
  BellRing,
  History,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { useToast } from '../../../components/ui/Toast';
import { PRACTICE_AREA_WORKFLOWS } from '../../../data/practiceAreaWorkflows';
import { buildInitialWorkflowEnhancements } from '../../../data/mockWorkflowEnhancements';
import {
  ConditionalBranchesPanel,
  ParallelTasksPanel,
  EscalationRulesPanel,
  WorkflowVersionControlPanel,
} from '../components/WorkflowEnhancementsPanels';

export function WorkflowManager() {
  const { addToast } = useToast();

  const practiceAreaNames = Object.keys(PRACTICE_AREA_WORKFLOWS);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState(practiceAreaNames[0]);
  const [workflows, setWorkflows] = useState(PRACTICE_AREA_WORKFLOWS);
  const [activeTab, setActiveTab] = useState('stages');
  const [enhancementsByArea, setEnhancementsByArea] = useState(() =>
    buildInitialWorkflowEnhancements(practiceAreaNames)
  );

  const currentStages = workflows[selectedPracticeArea] || [];
  const [selectedStageId, setSelectedStageId] = useState(currentStages[0]?.id || '');

  const activeStage = currentStages.find(s => s.id === selectedStageId) || currentStages[0];

  // State for adding a new required field
  const [newRequiredField, setNewRequiredField] = useState('');

  // State for adding a new auto-task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRole, setNewTaskRole] = useState('Attorney');
  const [newTaskDays, setNewTaskDays] = useState(7);

  const handleSelectPracticeArea = (name) => {
    setSelectedPracticeArea(name);
    const stages = workflows[name] || [];
    if (stages.length > 0) {
      setSelectedStageId(stages[0].id);
    }
  };

  const handleAddRequiredField = (e) => {
    e.preventDefault();
    if (!newRequiredField.trim()) return;

    setWorkflows(prev => {
      const updatedStages = (prev[selectedPracticeArea] || []).map(st => {
        if (st.id === activeStage.id) {
          return {
            ...st,
            requiredFields: [...(st.requiredFields || []), newRequiredField.trim()]
          };
        }
        return st;
      });
      return { ...prev, [selectedPracticeArea]: updatedStages };
    });

    setNewRequiredField('');
    addToast(`Gatekeeper requirement added to stage "${activeStage.name}".`, 'success');
  };

  const handleRemoveRequiredField = (fieldIndex) => {
    setWorkflows(prev => {
      const updatedStages = (prev[selectedPracticeArea] || []).map(st => {
        if (st.id === activeStage.id) {
          const filtered = [...st.requiredFields];
          filtered.splice(fieldIndex, 1);
          return { ...st, requiredFields: filtered };
        }
        return st;
      });
      return { ...prev, [selectedPracticeArea]: updatedStages };
    });
    addToast('Requirement removed.', 'info');
  };

  const handleAddAutoTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setWorkflows(prev => {
      const updatedStages = (prev[selectedPracticeArea] || []).map(st => {
        if (st.id === activeStage.id) {
          return {
            ...st,
            autoTasks: [
              ...(st.autoTasks || []),
              {
                title: newTaskTitle.trim(),
                role: newTaskRole,
                dueDays: Number(newTaskDays),
                priority: 'High'
              }
            ]
          };
        }
        return st;
      });
      return { ...prev, [selectedPracticeArea]: updatedStages };
    });

    setNewTaskTitle('');
    addToast(`Automated trigger task added to stage "${activeStage.name}".`, 'success');
  };

  const handleRemoveAutoTask = (taskIndex) => {
    setWorkflows(prev => {
      const updatedStages = (prev[selectedPracticeArea] || []).map(st => {
        if (st.id === activeStage.id) {
          const filtered = [...st.autoTasks];
          filtered.splice(taskIndex, 1);
          return { ...st, autoTasks: filtered };
        }
        return st;
      });
      return { ...prev, [selectedPracticeArea]: updatedStages };
    });
    addToast('Automated task rule removed.', 'info');
  };

  const currentEnhancements = useMemo(
    () =>
      enhancementsByArea[selectedPracticeArea] || {
        branches: [],
        parallelTasks: [],
        escalations: [],
        versions: [],
      },
    [enhancementsByArea, selectedPracticeArea]
  );

  const handleToggleBranchActive = (branchId) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      if (!areaData) return prev;
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          branches: areaData.branches.map((b) =>
            b.id === branchId ? { ...b, isActive: !b.isActive } : b
          ),
        },
      };
    });
    addToast('Conditional branch routing state updated.', 'info');
  };

  const handleAddBranch = (newBranch) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          branches: [
            { id: `BR-${Date.now().toString().slice(-4)}`, ...newBranch },
            ...(areaData?.branches || []),
          ],
        },
      };
    });
    addToast('Conditional workflow branch added.', 'success');
  };

  const handleCycleParallelTaskStatus = (taskId) => {
    const nextMap = {
      Pending: 'In Progress',
      'In Progress': 'Completed',
      Completed: 'Pending',
    };
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          parallelTasks: areaData.parallelTasks.map((t) =>
            t.id === taskId ? { ...t, status: nextMap[t.status] || 'Pending' } : t
          ),
        },
      };
    });
    addToast('Parallel task status updated.', 'info');
  };

  const handleAddParallelTask = (newTask) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          parallelTasks: [
            ...(areaData?.parallelTasks || []),
            { id: `PT-${Date.now().toString().slice(-4)}`, ...newTask },
          ],
        },
      };
    });
    addToast('Parallel workflow task added.', 'success');
  };

  const handleUpdateEscalationStatus = (ruleId, nextStatus) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          escalations: areaData.escalations.map((r) =>
            r.id === ruleId ? { ...r, status: nextStatus } : r
          ),
        },
      };
    });
    addToast(`Escalation rule status updated to ${nextStatus}.`, nextStatus === 'Escalated' ? 'warning' : 'success');
  };

  const handleAddEscalation = (newRule) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          escalations: [
            ...(areaData?.escalations || []),
            { id: `ESC-${Date.now().toString().slice(-4)}`, ...newRule },
          ],
        },
      };
    });
    addToast('Escalation rule added.', 'success');
  };

  const handleRestoreVersion = (versionId) => {
    setEnhancementsByArea((prev) => {
      const areaData = prev[selectedPracticeArea];
      return {
        ...prev,
        [selectedPracticeArea]: {
          ...areaData,
          versions: areaData.versions.map((v) => ({
            ...v,
            status: v.id === versionId ? 'Current' : 'Previous',
          })),
        },
      };
    });
    const restored = currentEnhancements.versions.find((v) => v.id === versionId);
    addToast(
      `Workflow schema restored to ${restored?.versionNumber || 'selected version'} (Demo UI).`,
      'success'
    );
  };

  const handleSaveAll = () => {
    addToast(
      `Firm administrative workflow schema for "${selectedPracticeArea}" successfully saved to database!`,
      'success'
    );
  };

  const handleResetDefault = () => {
    setWorkflows(PRACTICE_AREA_WORKFLOWS);
    setEnhancementsByArea(buildInitialWorkflowEnhancements(practiceAreaNames));
    addToast('Workflow stages, branches, and rules reset to practice defaults.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Filevine Architecture Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Configurable Matter Workflows (Filevine Architecture):</strong> Firm administrators can modify matter stages, gatekeeper conditions, and automatic task assignments across all 9 practice areas without developer code changes.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
          FIRM ADMIN CONFIG
        </span>
      </div>

      <PageHeader
        title="Matter Workflow &amp; Stage Configurator"
        subtitle="Manage procedural stages, mandatory gatekeeper checklists, and automated task chains for all 9 practice areas."
        breadcrumbs={[
          { label: 'Reports & Settings', to: '/settings/users' },
          { label: 'Templates & Workflows', to: '/settings/templates' },
          { label: 'Workflow Manager' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDefault}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSaveAll}
            >
              Save Workflow Changes
            </Button>
          </div>
        }
      />

      {/* Practice Area Selector Pills */}
      <div className="bg-white p-4 rounded-lg border border-[#D9D6CF] shadow-sm space-y-2">
        <label className="text-xs font-bold text-[#667085] uppercase block">
          Select Practice Group Workflow to Configure
        </label>
        <div className="flex flex-wrap gap-2">
          {practiceAreaNames.map((name) => {
            const isSelected = selectedPracticeArea === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectPracticeArea(name)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[#06244B] text-white border-[#06244B] shadow-xs'
                    : 'bg-white text-[#202A35] border-[#D9D6CF] hover:border-[#A4432B]'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Feature Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'stages', label: 'Stages & Gatekeepers', icon: Layers, count: currentStages.length },
          { id: 'branches', label: 'Conditional Branches', icon: GitBranch, count: currentEnhancements.branches.length },
          { id: 'parallel', label: 'Parallel Tasks', icon: GitMerge, count: currentEnhancements.parallelTasks.length },
          { id: 'escalations', label: 'Escalation Rules', icon: BellRing, count: currentEnhancements.escalations.length },
          { id: 'versions', label: 'Version Control', icon: History, count: currentEnhancements.versions.length },
        ]}
      />

      {/* Tab 1: Main Configuration Studio */}
      {activeTab === 'stages' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage Sequence Stepper */}
        <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
            <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#A4432B]" />
              Sequential Stages ({currentStages.length})
            </h3>
            <span className="text-[11px] text-[#667085]">Step-by-step pipeline</span>
          </div>

          <div className="space-y-2">
            {currentStages.map((st, idx) => {
              const isActive = (activeStage?.id === st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStageId(st.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#06244B] text-white border-[#06244B] shadow-sm'
                      : 'bg-slate-50 border-[#D9D6CF] text-[#202A35] hover:border-[#A4432B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                    <span className={isActive ? 'text-[#F5F0E5]' : 'text-[#A4432B]'}>
                      Phase 0{idx + 1} • {st.code}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#06244B]'
                    }`}>
                      {st.requiredFields?.length || 0} Gatekeepers
                    </span>
                  </div>
                  <span className="font-serif font-bold text-xs block truncate">
                    {st.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Stage Rules & Automations */}
        {activeStage && (
          <div className="lg:col-span-2 space-y-6">
            {/* Stage Summary Header */}
            <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A4432B] uppercase">
                  Active Stage Configuration
                </span>
                <h2 className="text-xl font-serif font-bold text-[#06244B] mt-0.5">
                  {activeStage.name}
                </h2>
                <p className="text-xs text-[#667085]">
                  Practice Area: <strong>{selectedPracticeArea}</strong>
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                Gatekeeper Protected ✓
              </span>
            </div>

            {/* Gatekeeper Required Checklist Fields */}
            <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
              <div className="border-b border-[#D9D6CF] pb-2">
                <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#A4432B]" />
                  Mandatory Gatekeeper Conditions
                </h3>
                <p className="text-xs text-[#667085]">
                  Users cannot advance a matter beyond this stage until all items below are verified by staff:
                </p>
              </div>

              <div className="space-y-2">
                {activeStage.requiredFields?.map((req, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-50 border border-[#D9D6CF]/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[#202A35]">{req}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveRequiredField(i)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove condition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Gatekeeper Field */}
              <form onSubmit={handleAddRequiredField} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add required gatekeeper condition (e.g. Expert Deposition Completed, Deed Recorded)..."
                  value={newRequiredField}
                  onChange={(e) => setNewRequiredField(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded border border-[#D9D6CF]"
                />
                <Button size="sm" variant="outline" type="submit" icon={Plus}>
                  Add Gatekeeper
                </Button>
              </form>
            </div>

            {/* Automated Task Trigger Rules */}
            <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
              <div className="border-b border-[#D9D6CF] pb-2">
                <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A4432B]" />
                  Automated Task Generation on Stage Entry
                </h3>
                <p className="text-xs text-[#667085]">
                  When a matter enters "{activeStage.name}", these tasks are automatically dispatched to responsible team members:
                </p>
              </div>

              <div className="space-y-2">
                {activeStage.autoTasks && activeStage.autoTasks.length > 0 ? (
                  activeStage.autoTasks.map((t, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-50 border border-[#D9D6CF]/70 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#06244B] block">{t.title}</span>
                        <span className="text-[10px] text-[#667085]">
                          Assigned to: <strong>{t.role}</strong> • Due: <strong>{t.dueDays} days</strong> after stage entry • Priority: {t.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAutoTask(i)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove task rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#667085] italic p-2">
                    No automated tasks configured for this stage yet.
                  </p>
                )}
              </div>

              {/* Add New Auto-Task Rule */}
              <form onSubmit={handleAddAutoTask} className="pt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Task title (e.g. Draft Trial Brief, Subpoena 911 Tapes)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded border border-[#D9D6CF]"
                />
                <select
                  value={newTaskRole}
                  onChange={(e) => setNewTaskRole(e.target.value)}
                  className="text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-semibold"
                >
                  <option value="Attorney">Assign to Attorney</option>
                  <option value="Paralegal">Assign to Paralegal</option>
                  <option value="Billing">Assign to Billing</option>
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newTaskDays}
                    onChange={(e) => setNewTaskDays(e.target.value)}
                    className="w-16 text-xs p-2.5 rounded border border-[#D9D6CF]"
                  />
                  <span className="text-[11px] text-[#667085]">days</span>
                </div>
                <Button size="sm" variant="outline" type="submit" icon={Plus}>
                  Add Rule
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Tab 2: Conditional Branches */}
      {activeTab === 'branches' && (
        <ConditionalBranchesPanel
          selectedPracticeArea={selectedPracticeArea}
          stages={currentStages}
          branches={currentEnhancements.branches}
          onToggleBranchActive={handleToggleBranchActive}
          onAddBranch={handleAddBranch}
        />
      )}

      {/* Tab 3: Parallel Tasks */}
      {activeTab === 'parallel' && (
        <ParallelTasksPanel
          selectedPracticeArea={selectedPracticeArea}
          parallelTasks={currentEnhancements.parallelTasks}
          onCycleTaskStatus={handleCycleParallelTaskStatus}
          onAddParallelTask={handleAddParallelTask}
        />
      )}

      {/* Tab 4: Escalation Rules */}
      {activeTab === 'escalations' && (
        <EscalationRulesPanel
          selectedPracticeArea={selectedPracticeArea}
          escalations={currentEnhancements.escalations}
          onUpdateEscalationStatus={handleUpdateEscalationStatus}
          onAddEscalation={handleAddEscalation}
        />
      )}

      {/* Tab 5: Workflow Version Control */}
      {activeTab === 'versions' && (
        <WorkflowVersionControlPanel
          selectedPracticeArea={selectedPracticeArea}
          versions={currentEnhancements.versions}
          onRestoreVersion={handleRestoreVersion}
        />
      )}
    </div>
  );
}

