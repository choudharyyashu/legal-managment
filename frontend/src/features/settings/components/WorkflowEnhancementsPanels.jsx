import React, { useState } from 'react';
import {
  GitBranch,
  GitMerge,
  GitCommit,
  History,
  BellRing,
  CheckCircle2,
  Clock,
  Eye,
  ArrowLeftRight,
  RotateCcw,
  Users,
  Plus,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusBadge } from '../../../components/shared/StatusBadge';

/**
 * A. Conditional Branches visual workflow panel + add/activate actions.
 */
export function ConditionalBranchesPanel({
  selectedPracticeArea,
  stages = [],
  branches = [],
  onToggleBranchActive,
  onAddBranch,
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    stageId: stages[0]?.id || '',
    condition: '',
    action: '',
    targetStage: stages[1]?.name || stages[0]?.name || 'Next Stage',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const openModal = () => {
    setForm({
      stageId: stages[0]?.id || '',
      condition: '',
      action: '',
      targetStage: stages[1]?.name || stages[0]?.name || 'Next Stage',
      isActive: true,
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.condition.trim()) nextErrors.condition = 'Condition rule is required.';
    if (!form.action.trim()) nextErrors.action = 'Resulting action is required.';
    if (!form.targetStage.trim()) nextErrors.targetStage = 'Target stage is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const matchedStage = stages.find((s) => s.id === form.stageId);
    onAddBranch({
      stageId: form.stageId,
      stageName: matchedStage?.name || 'Configured Stage',
      condition: form.condition.trim(),
      action: form.action.trim(),
      targetStage: form.targetStage.trim(),
      isActive: form.isActive,
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#A4432B]" />
              Conditional Workflow Branches ({branches.length})
            </h3>
            <p className="text-xs text-[#667085]">
              Visual decision paths showing trigger conditions, active branch routing, and automated downstream actions for <strong>{selectedPracticeArea}</strong>.
            </p>
          </div>
          <Button size="sm" variant="primary" icon={Plus} onClick={openModal}>
            Add Conditional Branch
          </Button>
        </div>

        {branches.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No Conditional Branches Configured"
            description="Create a conditional branch to route matters dynamically when court deadlines, motions, or stipulations occur."
            actionLabel="Add Conditional Branch"
            onAction={openModal}
          />
        ) : (
          <div className="space-y-3">
            {branches.map((branch, idx) => (
              <div
                key={branch.id}
                className={`p-4 rounded-lg border transition-all ${
                  branch.isActive
                    ? 'bg-[#F5F0E5]/55 border-[#A4432B] shadow-sm'
                    : 'bg-slate-50/80 border-[#D9D6CF]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#06244B] bg-white px-2 py-0.5 rounded border border-[#D9D6CF]">
                      Branch #{idx + 1} • {branch.stageName}
                    </span>
                    <StatusBadge status={branch.isActive ? 'Active' : 'Inactive'} />
                  </div>
                  <Button
                    size="sm"
                    variant={branch.isActive ? 'outline' : 'navyOutline'}
                    icon={GitCommit}
                    onClick={() => onToggleBranchActive(branch.id)}
                  >
                    {branch.isActive ? 'Deactivate Path' : 'Set Active Branch'}
                  </Button>
                </div>

                {/* Visual Conditional Flow */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center text-xs">
                  <div className="md:col-span-4 p-3 rounded border border-[#D9D6CF] bg-white">
                    <span className="text-[10px] font-bold uppercase text-[#A4432B] block mb-0.5">
                      Condition Rule
                    </span>
                    <p className="font-semibold text-[#06244B] leading-snug">{branch.condition}</p>
                  </div>

                  <div className="md:col-span-1 flex justify-center">
                    <ArrowRight className={`w-4 h-4 rotate-90 md:rotate-0 ${branch.isActive ? 'text-[#A4432B]' : 'text-[#667085]'}`} />
                  </div>

                  <div className="md:col-span-4 p-3 rounded border border-[#D9D6CF] bg-white">
                    <span className="text-[10px] font-bold uppercase text-[#667085] block mb-0.5">
                      Automated Branch Action
                    </span>
                    <p className="text-[#202A35] leading-snug">{branch.action}</p>
                  </div>

                  <div className="md:col-span-2 p-3 rounded border border-[#D9D6CF] bg-[#06244B] text-white">
                    <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                      Routes To
                    </span>
                    <p className="font-semibold leading-snug">{branch.targetStage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Conditional Workflow Branch"
        subtitle={`Practice Area: ${selectedPracticeArea}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#06244B] mb-1">Source Stage</label>
            <select
              value={form.stageId}
              onChange={(e) => setForm({ ...form, stageId: e.target.value })}
              className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Trigger Condition <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. IF Counterclaim Filed Within 21 Days"
              value={form.condition}
              onChange={(e) => {
                setForm({ ...form, condition: e.target.value });
                if (errors.condition) setErrors({ ...errors, condition: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.condition && <p className="text-red-700 text-[11px] mt-1">{errors.condition}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Corresponding Workflow Action <span className="text-[#A4432B]">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dispatch Answer to Counterclaim checklist & notify partner"
              value={form.action}
              onChange={(e) => {
                setForm({ ...form, action: e.target.value });
                if (errors.action) setErrors({ ...errors, action: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.action && <p className="text-red-700 text-[11px] mt-1">{errors.action}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Target / Destination Stage <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              value={form.targetStage}
              onChange={(e) => {
                setForm({ ...form, targetStage: e.target.value });
                if (errors.targetStage) setErrors({ ...errors, targetStage: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.targetStage && <p className="text-red-700 text-[11px] mt-1">{errors.targetStage}</p>}
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-[#D9D6CF] text-[#06244B]"
            />
            <span className="font-semibold text-[#202A35]">Set as active branch immediately</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button type="button" size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Branch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/**
 * B. Parallel Tasks panel with concurrent tracks, completion progress bar, and add/toggle actions.
 */
export function ParallelTasksPanel({
  selectedPracticeArea,
  parallelTasks = [],
  onCycleTaskStatus,
  onAddParallelTask,
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    taskName: '',
    assignedUser: 'Marcus Vance (Paralegal)',
    track: 'Track D — Concurrent Filing',
    dueWindow: 'Day 10 of Stage',
    status: 'Pending',
  });
  const [errors, setErrors] = useState({});

  const totalCount = parallelTasks.length;
  const completedCount = parallelTasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const openModal = () => {
    setForm({
      taskName: '',
      assignedUser: 'Marcus Vance (Paralegal)',
      track: `Track ${String.fromCharCode(65 + Math.min(totalCount, 10))} — Parallel Activity`,
      dueWindow: 'Day 10 of Stage',
      status: 'Pending',
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.taskName.trim()) nextErrors.taskName = 'Task name is required.';
    if (!form.assignedUser.trim()) nextErrors.assignedUser = 'Assigned user is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddParallelTask({
      taskName: form.taskName.trim(),
      assignedUser: form.assignedUser.trim(),
      track: form.track.trim() || 'Parallel Track',
      dueWindow: form.dueWindow.trim() || 'Day 7 of Stage',
      status: form.status,
    });
    setIsAddOpen(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
        <div>
          <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-[#A4432B]" />
            Parallel Workflow Tasks ({completedCount}/{totalCount} Completed)
          </h3>
          <p className="text-xs text-[#667085]">
            Concurrent tasks executing simultaneously without blocking sequential stages in <strong>{selectedPracticeArea}</strong>.
          </p>
        </div>
        <Button size="sm" variant="primary" icon={Plus} onClick={openModal}>
          Add Parallel Task
        </Button>
      </div>

      {/* Progress Meter */}
      <div className="p-3.5 bg-[#F5F0E5]/50 rounded-lg border border-[#D9D6CF] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#06244B]">Parallel Track Completion Progress</span>
          <span className="font-mono font-bold text-[#A4432B]">
            {completedCount} of {totalCount} Tasks ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#06244B] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {parallelTasks.length === 0 ? (
        <EmptyState
          icon={GitMerge}
          title="No Parallel Tasks Configured"
          description="Add simultaneous workflow tasks so multiple attorneys and paralegals can work concurrent tracks."
          actionLabel="Add Parallel Task"
          onAction={openModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {parallelTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-lg border border-[#D9D6CF] bg-slate-50/70 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#A4432B]">{task.track}</span>
                  <StatusBadge status={task.status} />
                </div>
                <h4 className="font-bold text-xs text-[#06244B] leading-snug">{task.taskName}</h4>
                <div className="text-[11px] text-[#667085] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 shrink-0" />
                    <span className="font-medium text-[#202A35]">{task.assignedUser}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>Target Window: {task.dueWindow}</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                icon={CheckCircle2}
                onClick={() => onCycleTaskStatus(task.id)}
              >
                {task.status === 'Pending'
                  ? 'Start Task'
                  : task.status === 'In Progress'
                  ? 'Mark Completed'
                  : 'Reopen to Pending'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Parallel Task Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Parallel Workflow Activity"
        subtitle={`Practice Area: ${selectedPracticeArea}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Task Name <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Subpoena Medical Billing Custodian"
              value={form.taskName}
              onChange={(e) => {
                setForm({ ...form, taskName: e.target.value });
                if (errors.taskName) setErrors({ ...errors, taskName: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.taskName && <p className="text-red-700 text-[11px] mt-1">{errors.taskName}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Assigned User <span className="text-[#A4432B]">*</span>
            </label>
            <select
              value={form.assignedUser}
              onChange={(e) => setForm({ ...form, assignedUser: e.target.value })}
              className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
            >
              <option value="Eleanor Heugly, Esq. (Managing Partner)">Eleanor Heugly, Esq. (Managing Partner)</option>
              <option value="Thomas Bludworth, Esq. (Partner)">Thomas Bludworth, Esq. (Partner)</option>
              <option value="Sarah Jenkins, Esq. (Associate)">Sarah Jenkins, Esq. (Associate)</option>
              <option value="Marcus Vance (Paralegal)">Marcus Vance (Paralegal)</option>
              <option value="Rachel Adams (Billing Admin)">Rachel Adams (Billing Admin)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Track Label</label>
              <input
                type="text"
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button type="button" size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Parallel Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/**
 * C. Escalation Rules panel showing conditions, triggers, timing, responsible roles, and status actions.
 */
export function EscalationRulesPanel({
  selectedPracticeArea,
  escalations = [],
  onUpdateEscalationStatus,
  onAddEscalation,
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmTriggerRule, setConfirmTriggerRule] = useState(null);
  const [form, setForm] = useState({
    condition: '',
    trigger: '',
    timing: '',
    responsibleUser: 'Eleanor Heugly, Esq. (Managing Partner)',
  });
  const [errors, setErrors] = useState({});

  const openModal = () => {
    setForm({
      condition: '',
      trigger: '',
      timing: '',
      responsibleUser: 'Eleanor Heugly, Esq. (Managing Partner)',
    });
    setErrors({});
    setIsAddOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.condition.trim()) nextErrors.condition = 'Escalation condition is required.';
    if (!form.trigger.trim()) nextErrors.trigger = 'Trigger threshold is required.';
    if (!form.timing.trim()) nextErrors.timing = 'Timing schedule is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddEscalation({
      condition: form.condition.trim(),
      trigger: form.trigger.trim(),
      timing: form.timing.trim(),
      responsibleUser: form.responsibleUser.trim(),
      status: 'Active',
    });
    setIsAddOpen(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
        <div>
          <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#A4432B]" />
            SLA &amp; Deadline Escalation Rules ({escalations.length})
          </h3>
          <p className="text-xs text-[#667085]">
            Automated supervisory escalation thresholds, timing windows, and responsible partners for <strong>{selectedPracticeArea}</strong>.
          </p>
        </div>
        <Button size="sm" variant="primary" icon={Plus} onClick={openModal}>
          Add Escalation Rule
        </Button>
      </div>

      {escalations.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No Escalation Rules Configured"
          description="Define an escalation rule to automatically alert supervising attorneys when gatekeepers or tasks stall."
          actionLabel="Add Escalation Rule"
          onAction={openModal}
        />
      ) : (
        <div className="space-y-3">
          {escalations.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-lg border border-[#D9D6CF] bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#06244B]">{rule.condition}</span>
                  <StatusBadge status={rule.status} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#667085] pt-1">
                  <div>
                    <span className="uppercase font-bold text-[10px] block">Trigger</span>
                    <strong className="text-[#A4432B]">{rule.trigger}</strong>
                  </div>
                  <div>
                    <span className="uppercase font-bold text-[10px] block">Responsible User / Role</span>
                    <strong className="text-[#06244B]">{rule.responsibleUser}</strong>
                  </div>
                  <div>
                    <span className="uppercase font-bold text-[10px] block">Escalation Timing</span>
                    <strong className="text-[#202A35]">{rule.timing}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rule.status === 'Triggered' || rule.status === 'Escalated' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={CheckCircle2}
                    onClick={() => onUpdateEscalationStatus(rule.id, 'Active')}
                  >
                    Resolve Escalation
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={AlertTriangle}
                    onClick={() => setConfirmTriggerRule(rule)}
                  >
                    Test Escalation
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmTriggerRule)}
        onClose={() => setConfirmTriggerRule(null)}
        onConfirm={() => {
          if (confirmTriggerRule) {
            onUpdateEscalationStatus(confirmTriggerRule.id, 'Escalated');
          }
        }}
        title="Simulate Escalation Alert (Demo)"
        message={
          confirmTriggerRule
            ? `Trigger demo escalation alert to ${confirmTriggerRule.responsibleUser} for rule: "${confirmTriggerRule.condition}"?`
            : ''
        }
        confirmLabel="Trigger Demo Alert"
        variant="primary"
      />

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Workflow Escalation Rule"
        subtitle={`Practice Area: ${selectedPracticeArea}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Escalation Condition <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Court filing checklist unverified 24 hours before deadline"
              value={form.condition}
              onChange={(e) => {
                setForm({ ...form, condition: e.target.value });
                if (errors.condition) setErrors({ ...errors, condition: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.condition && <p className="text-red-700 text-[11px] mt-1">{errors.condition}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Escalation Trigger <span className="text-[#A4432B]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 24 Hours Before Due Date"
                value={form.trigger}
                onChange={(e) => {
                  setForm({ ...form, trigger: e.target.value });
                  if (errors.trigger) setErrors({ ...errors, trigger: '' });
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
              {errors.trigger && <p className="text-red-700 text-[11px] mt-1">{errors.trigger}</p>}
            </div>
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">Responsible User / Role</label>
              <input
                type="text"
                value={form.responsibleUser}
                onChange={(e) => setForm({ ...form, responsibleUser: e.target.value })}
                className="w-full p-2 border border-[#D9D6CF] rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#06244B] mb-1">
              Escalation Timing Schedule <span className="text-[#A4432B]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Initial Ping: T-24h • Partner Notice: T-6h"
              value={form.timing}
              onChange={(e) => {
                setForm({ ...form, timing: e.target.value });
                if (errors.timing) setErrors({ ...errors, timing: '' });
              }}
              className="w-full p-2 border border-[#D9D6CF] rounded"
            />
            {errors.timing && <p className="text-red-700 text-[11px] mt-1">{errors.timing}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button type="button" size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Save Escalation Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/**
 * D. Workflow Version Control UI with View, Compare, and Restore Confirmation Modal.
 */
export function WorkflowVersionControlPanel({
  selectedPracticeArea,
  versions = [],
  onRestoreVersion,
}) {
  const [viewingVersion, setViewingVersion] = useState(null);
  const [compareState, setCompareState] = useState(null); // { leftId, rightId }
  const [restoreTarget, setRestoreTarget] = useState(null);

  const currentVersion = versions.find((v) => v.status === 'Current') || versions[0];

  const openCompareModal = (version) => {
    const baseline =
      version.id === currentVersion?.id
        ? versions.find((v) => v.id !== version.id) || version
        : currentVersion || version;
    setCompareState({
      leftId: version.id,
      rightId: baseline.id,
    });
  };

  const leftVersion = versions.find((v) => v.id === compareState?.leftId);
  const rightVersion = versions.find((v) => v.id === compareState?.rightId);

  return (
    <div className="bg-white p-5 rounded-lg border border-[#D9D6CF] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-3">
        <div>
          <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
            <History className="w-4 h-4 text-[#A4432B]" />
            Workflow Version Control ({versions.length} Revisions)
          </h3>
          <p className="text-xs text-[#667085]">
            Audit revision history, compare schema changes, and restore prior workflow snapshots (Demo UI) for <strong>{selectedPracticeArea}</strong>.
          </p>
        </div>
        {versions.length >= 2 && (
          <Button
            size="sm"
            variant="outline"
            icon={ArrowLeftRight}
            onClick={() => openCompareModal(versions[1])}
          >
            Compare Latest Changes
          </Button>
        )}
      </div>

      {versions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Version History Available"
          description="Save a workflow snapshot to track version history."
        />
      ) : (
        <div className="overflow-x-auto border border-[#D9D6CF] rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F0E5] text-[#06244B] uppercase font-bold border-b border-[#D9D6CF]">
              <tr>
                <th className="py-2.5 px-3">Workflow Name</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Last Modified</th>
                <th className="py-2.5 px-3">Modified By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]/70">
              {versions.map((ver) => (
                <tr key={ver.id} className={ver.status === 'Current' ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}>
                  <td className="py-3 px-3 font-semibold text-[#06244B]">{ver.workflowName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#A4432B]">{ver.versionNumber}</td>
                  <td className="py-3 px-3 font-mono text-[#667085]">{ver.createdDate}</td>
                  <td className="py-3 px-3 font-mono text-[#202A35]">{ver.lastModifiedDate}</td>
                  <td className="py-3 px-3 font-medium text-[#202A35]">{ver.modifiedBy}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={ver.status} />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button size="sm" variant="outline" icon={Eye} onClick={() => setViewingVersion(ver)}>
                        View Version
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={ArrowLeftRight}
                        onClick={() => openCompareModal(ver)}
                      >
                        Compare Versions
                      </Button>
                      {ver.status !== 'Current' && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={RotateCcw}
                          onClick={() => setRestoreTarget(ver)}
                        >
                          Restore Version
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Version Modal */}
      <Modal
        isOpen={Boolean(viewingVersion)}
        onClose={() => setViewingVersion(null)}
        title={viewingVersion ? `${viewingVersion.workflowName} — ${viewingVersion.versionNumber}` : 'Version Snapshot'}
        subtitle={
          viewingVersion
            ? `Modified by ${viewingVersion.modifiedBy} on ${viewingVersion.lastModifiedDate}`
            : ''
        }
        maxWidth="max-w-lg"
        footer={
          <Button size="sm" variant="outline" onClick={() => setViewingVersion(null)}>
            Close
          </Button>
        }
      >
        {viewingVersion && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Status</span>
                <div className="mt-0.5"><StatusBadge status={viewingVersion.status} /></div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Created Date</span>
                <span className="font-mono font-semibold">{viewingVersion.createdDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Modified Date</span>
                <span className="font-mono font-semibold">{viewingVersion.lastModifiedDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Stages / Gatekeepers</span>
                <span className="font-semibold text-[#06244B]">
                  {viewingVersion.snapshot.stageCount} stages • {viewingVersion.snapshot.gatekeeperCount} rules
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Branches / Parallel</span>
                <span className="font-semibold text-[#06244B]">
                  {viewingVersion.snapshot.branchCount} branches • {viewingVersion.snapshot.parallelTaskCount} parallel
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#667085] block">Escalation Rules</span>
                <span className="font-semibold text-[#06244B]">{viewingVersion.snapshot.escalationCount} rules</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Revision Summary</span>
              <p className="p-3 bg-white border border-[#D9D6CF] rounded leading-relaxed">
                {viewingVersion.summary}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#667085] block mb-1">Snapshot Highlights</span>
              <ul className="list-disc pl-5 space-y-1 bg-[#F5F0E5]/40 p-3 rounded border border-[#D9D6CF]">
                {viewingVersion.snapshot.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Compare Versions Modal */}
      <Modal
        isOpen={Boolean(compareState && leftVersion && rightVersion)}
        onClose={() => setCompareState(null)}
        title="Compare Workflow Versions"
        subtitle={selectedPracticeArea}
        maxWidth="max-w-2xl"
        footer={
          <Button size="sm" variant="outline" onClick={() => setCompareState(null)}>
            Close Comparison
          </Button>
        }
      >
        {compareState && leftVersion && rightVersion && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#667085] block mb-1">
                  Comparison Version A
                </label>
                <select
                  value={compareState.leftId}
                  onChange={(e) => setCompareState({ ...compareState, leftId: e.target.value })}
                  className="w-full p-2 border border-[#D9D6CF] rounded bg-white font-semibold text-[#06244B]"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionNumber} ({v.status}) — {v.lastModifiedDate}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#667085] block mb-1">
                  Comparison Version B
                </label>
                <select
                  value={compareState.rightId}
                  onChange={(e) => setCompareState({ ...compareState, rightId: e.target.value })}
                  className="w-full p-2 border border-[#D9D6CF] rounded bg-white font-semibold text-[#06244B]"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionNumber} ({v.status}) — {v.lastModifiedDate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[leftVersion, rightVersion].map((ver, i) => (
                <div key={`${ver.id}-${i}`} className="p-3.5 rounded-lg border border-[#D9D6CF] bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
                    <span className="font-mono font-bold text-sm text-[#06244B]">{ver.versionNumber}</span>
                    <StatusBadge status={ver.status} />
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    Modified by <strong>{ver.modifiedBy}</strong> on {ver.lastModifiedDate}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-white rounded border border-[#D9D6CF]">
                      <span className="text-[#667085] block">Stages</span>
                      <strong className="text-[#06244B]">{ver.snapshot.stageCount}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#D9D6CF]">
                      <span className="text-[#667085] block">Gatekeepers</span>
                      <strong className="text-[#06244B]">{ver.snapshot.gatekeeperCount}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#D9D6CF]">
                      <span className="text-[#667085] block">Branches</span>
                      <strong className="text-[#06244B]">{ver.snapshot.branchCount}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#D9D6CF]">
                      <span className="text-[#667085] block">Escalations</span>
                      <strong className="text-[#06244B]">{ver.snapshot.escalationCount}</strong>
                    </div>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#202A35] pt-1">
                    {ver.snapshot.highlights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Restore Version Confirmation Modal (Demo UI) */}
      <ConfirmDialog
        isOpen={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (restoreTarget) {
            onRestoreVersion(restoreTarget.id);
          }
        }}
        title="Restore Workflow Version (Demo UI)"
        message={
          restoreTarget
            ? `Restore "${restoreTarget.workflowName}" (${restoreTarget.versionNumber}, modified ${restoreTarget.lastModifiedDate} by ${restoreTarget.modifiedBy}) as the Current active version in this demo workspace?`
            : ''
        }
        confirmLabel="Restore Version"
        variant="primary"
      />
    </div>
  );
}

