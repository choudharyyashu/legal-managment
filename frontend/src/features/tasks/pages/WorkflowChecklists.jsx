import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  CheckCircle2,
  Circle,
  Plus,
  ChevronRight,
  FileCheck,
  Sliders,
  GitBranch,
  Sparkles,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Filter,
  Check,
  Briefcase,
  Clock,
  Shield,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { workflowService } from '../../../services/workflowService';

export function WorkflowChecklists() {
  const { addToast } = useToast();
  const { matters = [] } = useMatters();
  const { currentUser } = useAuth();

  const isManager =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'supervisor' ||
    currentUser?.permissions?.includes('templates:manage');

  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'builder'
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('ALL');
  const [selectedMatterId, setSelectedMatterId] = useState('');

  // Live database state
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matterProgress, setMatterProgress] = useState(null);
  const [matterLoading, setMatterLoading] = useState(false);

  // New rule modal state
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [ruleStageId, setRuleStageId] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleRole, setRuleRole] = useState('paralegal');
  const [ruleDays, setRuleDays] = useState(7);
  const [rulePriority, setRulePriority] = useState('High');
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  // Editable checklist state: Map<stageId, string[]>
  const [editableChecklists, setEditableChecklists] = useState({});
  const [dirtyStages, setDirtyStages] = useState(new Set());
  const [savingStageId, setSavingStageId] = useState(null);

  // New item modal or inline input state
  const [addingToStageId, setAddingToStageId] = useState(null);
  const [newItemText, setNewItemText] = useState('');

  // Fetch all workflow stages from database
  const fetchStages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workflowService.getStages();
      setStages(data);

      // Initialize editable checklist map
      const initialMap = {};
      data.forEach((s) => {
        initialMap[s.id] = [...(s.requiredFields || [])];
      });
      setEditableChecklists(initialMap);
      setDirtyStages(new Set());
    } catch (err) {
      console.error('Failed to load workflow stages from database:', err);
      addToast('Failed to load workflow stages from database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  // Fetch matter progress when a matter is selected
  const fetchMatterProgress = useCallback(async (matterId) => {
    if (!matterId) {
      setMatterProgress(null);
      return;
    }
    setMatterLoading(true);
    try {
      const data = await workflowService.getMatterChecklistProgress(matterId);
      setMatterProgress(data);
    } catch (err) {
      console.error('Failed to load matter checklist progress:', err);
      addToast('Failed to load matter checklist progress.', 'error');
      setMatterProgress(null);
    } finally {
      setMatterLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedMatterId) {
      fetchMatterProgress(selectedMatterId);
    } else {
      setMatterProgress(null);
    }
  }, [selectedMatterId, fetchMatterProgress]);

  // Derived list of distinct practice areas from database stages
  const practiceAreas = useMemo(() => {
    const map = new Map();
    stages.forEach((s) => {
      if (!map.has(s.practiceAreaId)) {
        map.set(s.practiceAreaId, {
          id: s.practiceAreaId,
          name: s.practiceAreaName,
          code: s.practiceAreaCode,
          color: s.brandColor,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [stages]);

  // Filtered stages by practice area
  const filteredStages = useMemo(() => {
    if (selectedPracticeArea === 'ALL') return stages;
    return stages.filter((s) => s.practiceAreaId === selectedPracticeArea);
  }, [stages, selectedPracticeArea]);

  // Derived automation rules from autoTasks across all stages
  const automationRules = useMemo(() => {
    const list = [];
    filteredStages.forEach((stage) => {
      (stage.autoTasks || []).forEach((task, idx) => {
        list.push({
          id: `rule-${stage.id}-${idx}`,
          stageId: stage.id,
          stageName: stage.stageName,
          stageCode: stage.stageCode,
          practiceAreaName: stage.practiceAreaName,
          practiceAreaColor: stage.brandColor,
          trigger: `When Matter Stage advances to "${stage.stageName}"`,
          action: task.title,
          assignee: task.role,
          deadline: `+${task.dueDays} Days from Stage Advance`,
          priority: task.priority || 'High',
          enabled: true,
        });
      });
    });
    return list;
  }, [filteredStages]);

  // Checklist Item Manipulation (Master Template Mode)
  const handleAddItem = (stageId) => {
    if (!newItemText.trim()) return;
    const current = editableChecklists[stageId] || [];
    const updated = [...current, newItemText.trim()];
    setEditableChecklists((prev) => ({ ...prev, [stageId]: updated }));
    setDirtyStages((prev) => new Set(prev).add(stageId));
    setNewItemText('');
    setAddingToStageId(null);
  };

  const handleDeleteItem = (stageId, index) => {
    const current = editableChecklists[stageId] || [];
    const updated = current.filter((_, i) => i !== index);
    setEditableChecklists((prev) => ({ ...prev, [stageId]: updated }));
    setDirtyStages((prev) => new Set(prev).add(stageId));
  };

  const handleMoveItem = (stageId, index, direction) => {
    const current = editableChecklists[stageId] || [];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const copy = [...current];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    setEditableChecklists((prev) => ({ ...prev, [stageId]: copy }));
    setDirtyStages((prev) => new Set(prev).add(stageId));
  };

  const handleSaveStageChecklist = async (stageId) => {
    const items = editableChecklists[stageId] || [];
    setSavingStageId(stageId);
    try {
      await workflowService.updateStageChecklist(stageId, items);
      setDirtyStages((prev) => {
        const next = new Set(prev);
        next.delete(stageId);
        return next;
      });
      addToast('Stage checklist SOP successfully saved to database.', 'success');
      // Refresh stages
      const updatedStages = await workflowService.getStages();
      setStages(updatedStages);
    } catch (err) {
      console.error('Failed to save stage checklist:', err);
      addToast(err?.message || 'Failed to save stage checklist.', 'error');
    } finally {
      setSavingStageId(null);
    }
  };

  // Toggle Matter Checklist Item (Matter Progress Mode)
  const handleToggleMatterItem = async (stageId, itemText, currentCompleted) => {
    if (!selectedMatterId) return;
    try {
      const updatedProgress = await workflowService.toggleMatterChecklist(selectedMatterId, {
        stageId,
        itemText,
        completed: !currentCompleted,
      });
      setMatterProgress(updatedProgress);
      addToast(`Step "${itemText}" marked as ${!currentCompleted ? 'completed' : 'pending'}.`, 'info');
    } catch (err) {
      console.error('Failed to toggle matter checklist item:', err);
      addToast('Failed to update matter checklist step.', 'error');
    }
  };

  // Create Automation Rule
  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleStageId) {
      addToast('Please select a target workflow stage.', 'error');
      return;
    }
    if (!ruleTitle.trim()) {
      addToast('Task title is required.', 'error');
      return;
    }

    setIsSubmittingRule(true);
    try {
      await workflowService.addAutomationRule(ruleStageId, {
        title: ruleTitle.trim(),
        role: ruleRole,
        dueDays: Number(ruleDays) || 7,
        priority: rulePriority,
      });

      addToast('New workflow automation rule created and saved to database.', 'success');
      setIsNewRuleOpen(false);
      setRuleTitle('');
      // Refresh stages to show new rule
      const updatedStages = await workflowService.getStages();
      setStages(updatedStages);
    } catch (err) {
      console.error('Failed to create automation rule:', err);
      addToast(err?.message || 'Failed to create automation rule.', 'error');
    } finally {
      setIsSubmittingRule(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matter Workflow SOPs &amp; Automation Engine"
        subtitle="Standard operating procedures (SOPs), stage gatekeepers, and automated task chains (Filevine Model)."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Workflow Engine' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
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

      {/* Control Strip: Matter Inspector & Practice Area Filter */}
      <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        {/* Practice Area Filter */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          <span className="font-bold text-[#06244B] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#A4432B]" />
            <span>Practice Area:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedPracticeArea('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              selectedPracticeArea === 'ALL'
                ? 'bg-[#06244B] text-white border-[#06244B]'
                : 'bg-white text-[#344054] border-[#D0D5DD] hover:bg-slate-50'
            }`}
          >
            All Areas ({stages.length} Stages)
          </button>
          {practiceAreas.map((pa) => (
            <button
              key={pa.id}
              type="button"
              onClick={() => setSelectedPracticeArea(pa.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                selectedPracticeArea === pa.id
                  ? 'bg-[#06244B] text-white border-[#06244B]'
                  : 'bg-white text-[#344054] border-[#D0D5DD] hover:bg-slate-50'
              }`}
            >
              {pa.name}
            </button>
          ))}
        </div>

        {/* Matter Inspector Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D9D6CF]">
          <span className="font-bold text-[#06244B] flex items-center gap-1 whitespace-nowrap">
            <Briefcase className="w-3.5 h-3.5 text-[#06244B]" />
            <span>Scope:</span>
          </span>
          <select
            value={selectedMatterId}
            onChange={(e) => setSelectedMatterId(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-[#F5F0E5]/60 border border-[#D9D6CF] rounded text-[#06244B] focus:outline-none focus:ring-2 focus:ring-[#06244B] max-w-[260px]"
          >
            <option value="">Master SOPs (Template Mode)</option>
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.matterNumber} — {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matter Mode Active Progress Indicator */}
      {selectedMatterId && matterProgress && (
        <div className="bg-[#06244B] text-white p-4 rounded border border-[#06244B] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F5F0E5]">
                Matter Progress: {matterProgress.matterNumber} — {matterProgress.matterTitle}
              </span>
              <span className="text-[10px] bg-[#A4432B] px-2 py-0.5 rounded font-semibold text-white">
                {matterProgress.practiceAreaName}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Current Active Stage:{' '}
              <strong className="text-white">{matterProgress.currentStageName || 'Initial Stage'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-bold text-sm block">{matterProgress.overallProgressPercent}% Complete</span>
              <span className="text-[10px] text-slate-300">Across All Practice Gatekeepers</span>
            </div>
            <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#287A55] h-full transition-all duration-300"
                style={{ width: `${matterProgress.overallProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PRACTICE CHECKLISTS (SOPS) */}
      {activeTab === 'checklists' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#667085] bg-white rounded border border-[#D9D6CF] flex flex-col items-center justify-center gap-2">
              <Clock className="w-6 h-6 animate-spin text-[#A4432B]" />
              <span>Loading practice workflow stages and checklist records from database...</span>
            </div>
          ) : filteredStages.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#667085] bg-white rounded border border-[#D9D6CF]">
              No workflow stages found for the selected filter parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredStages.map((stage) => {
                const isDirty = dirtyStages.has(stage.id);
                const items = editableChecklists[stage.id] || [];

                // Matter-specific stage progress (if a matter is selected)
                const stageMatterInfo = matterProgress?.stages?.find((s) => s.stageId === stage.id);
                const verifiedSet = new Set(stageMatterInfo?.verifiedGatekeepers || []);
                const completedCount = stageMatterInfo?.completedCount || 0;
                const totalCount = items.length;
                const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={stage.id}
                    className="bg-white rounded border border-[#D9D6CF] shadow-subtle p-5 sm:p-6 space-y-4"
                  >
                    {/* Stage Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9D6CF]/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: stage.brandColor || '#06244B' }}
                          >
                            {stage.practiceAreaName}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#A4432B]">
                            {stage.stageCode} (Step {stage.stageOrder})
                          </span>
                          {stageMatterInfo?.isCurrent && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                              Active Matter Stage
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-lg text-[#06244B] mt-1">
                          {stage.stageName}
                        </h3>
                      </div>

                      {/* Header Actions & Progress */}
                      <div className="flex items-center gap-3">
                        {selectedMatterId ? (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="text-right">
                              <span className="font-bold text-[#06244B]">{percent}% Complete</span>
                              <span className="text-[10px] text-[#667085] block">
                                {completedCount} of {totalCount} verified
                              </span>
                            </div>
                            <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#287A55] h-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#667085]">
                              <strong>{items.length}</strong> SOP Gatekeepers
                            </span>
                            {isDirty && (
                              <Button
                                size="sm"
                                variant="primary"
                                icon={Save}
                                disabled={savingStageId === stage.id}
                                onClick={() => handleSaveStageChecklist(stage.id)}
                              >
                                {savingStageId === stage.id ? 'Saving...' : 'Save SOP'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Checklist Items List */}
                    <div className="divide-y divide-[#D9D6CF]/40">
                      {items.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[#667085] italic">
                          No checklist gatekeepers defined for this stage yet.
                        </div>
                      ) : (
                        items.map((itemText, idx) => {
                          const isDone = verifiedSet.has(itemText);

                          return (
                            <div
                              key={`${stage.id}-item-${idx}`}
                              className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F5F0E5]/30 px-2 rounded transition-colors group"
                            >
                              {/* Left Checkbox / Text */}
                              <div
                                onClick={() => {
                                  if (selectedMatterId) {
                                    handleToggleMatterItem(stage.id, itemText, isDone);
                                  }
                                }}
                                className={`flex items-start gap-2.5 flex-1 ${
                                  selectedMatterId ? 'cursor-pointer' : ''
                                }`}
                              >
                                {selectedMatterId ? (
                                  <button
                                    type="button"
                                    className="mt-0.5 text-[#06244B] hover:text-[#A4432B] flex-shrink-0"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-4 h-4 text-[#287A55]" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-[#667085]" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-mono text-[#A4432B] font-bold mt-0.5 w-5">
                                    {idx + 1}.
                                  </span>
                                )}

                                <span
                                  className={`text-xs ${
                                    isDone
                                      ? 'line-through text-[#667085]'
                                      : 'text-[#202A35] font-medium'
                                  }`}
                                >
                                  {itemText}
                                </span>
                              </div>

                              {/* Right Template Controls (Reorder, Delete) */}
                              {!selectedMatterId && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveItem(stage.id, idx, -1)}
                                    disabled={idx === 0}
                                    title="Move step up"
                                    className="p-1 rounded text-[#667085] hover:text-[#06244B] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveItem(stage.id, idx, 1)}
                                    disabled={idx === items.length - 1}
                                    title="Move step down"
                                    className="p-1 rounded text-[#667085] hover:text-[#06244B] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(stage.id, idx)}
                                    title="Delete step"
                                    className="p-1 rounded text-[#B42318] hover:bg-red-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Item Row (Template Mode) */}
                    {!selectedMatterId && (
                      <div className="pt-2 border-t border-[#D9D6CF]/50">
                        {addingToStageId === stage.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Enter new checklist gatekeeper text..."
                              value={newItemText}
                              onChange={(e) => setNewItemText(e.target.value)}
                              className="text-xs"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAddItem(stage.id)}
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAddingToStageId(null);
                                setNewItemText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingToStageId(stage.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#A4432B] font-semibold hover:underline cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Checklist Step</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKFLOW BUILDER & AUTOMATION RULES */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D6CF] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#06244B]">
                  Configurable Workflow Rules Engine
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Automate task spawning and cutoff calculations stored directly in stage configurations (Filevine Model).
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setRuleStageId(filteredStages[0]?.id || stages[0]?.id || '');
                  setIsNewRuleOpen(true);
                }}
              >
                Add Automation Rule
              </Button>
            </div>

            {automationRules.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No automated task rules found for the selected practice area.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-lg border border-[#D9D6CF] bg-slate-50 space-y-2 hover:border-[#A4432B] transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-xs text-[#A4432B] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{rule.trigger}</span>
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                        Active in DB
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#06244B]">{rule.action}</p>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-[#667085] space-y-1">
                      <div className="flex justify-between">
                        <span>Assigned Role:</span>
                        <span className="font-medium text-[#202A35] capitalize">{rule.assignee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calculated Cutoff:</span>
                        <span className="font-medium text-[#202A35]">{rule.deadline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Practice Area Scope:</span>
                        <span className="font-medium text-[#06244B]">{rule.practiceAreaName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              Target Workflow Stage
            </label>
            <select
              value={ruleStageId}
              onChange={(e) => setRuleStageId(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
              required
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.practiceAreaName} — {s.stageCode}: {s.stageName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Automated Action / Spawned Task Title"
              value={ruleTitle}
              onChange={(e) => setRuleTitle(e.target.value)}
              placeholder="e.g. Serve Utah Rule 26 Initial Disclosures"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Assignee Role
              </label>
              <select
                value={ruleRole}
                onChange={(e) => setRuleRole(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
              >
                <option value="paralegal">Paralegal / Staff</option>
                <option value="attorney">Attorney</option>
                <option value="billing">Billing Staff</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            <div>
              <Input
                label="Due Days (from Stage Advance)"
                type="number"
                min="1"
                max="365"
                value={ruleDays}
                onChange={(e) => setRuleDays(parseInt(e.target.value, 10) || 7)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Task Priority
            </label>
            <select
              value={rulePriority}
              onChange={(e) => setRulePriority(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsNewRuleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              icon={Plus}
              disabled={isSubmittingRule}
            >
              {isSubmittingRule ? 'Saving Rule...' : 'Save Rule to Database'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
