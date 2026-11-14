import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { documentService } from '../../../services/documentService';
import { useToast } from '../../../components/ui/Toast';

export function GenerateDraftModal({ isOpen, onClose, onGenerated, matters = [] }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [creatingTaskTag, setCreatingTaskTag] = useState(null);

  // Load available templates on open
  useEffect(() => {
    if (isOpen) {
      setValidationResult(null);
      if (matters.length > 0 && !selectedMatterId) {
        setSelectedMatterId(matters[0].id);
      }
      // Fetch active templates
      fetch('/api/v1/templates?limit=50', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('hb_auth_token')}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json?.data?.templates) {
            setTemplates(json.data.templates);
            if (json.data.templates.length > 0 && !selectedTemplateId) {
              setSelectedTemplateId(json.data.templates[0].id);
            }
          }
        })
        .catch(() => {
          // Fallback mock templates if endpoint not yet seeded
          const fallback = [
            { id: 'TPL-PI-096', templateCode: 'UT-PI-REP-096', templateName: 'Liability Insurer Letter of Representation (096)', category: 'Personal Injury' },
            { id: 'TPL-PI-112', templateCode: 'UT-PI-MED-112', templateName: 'Medical Authorization Packet (112)', category: 'Personal Injury' },
            { id: 'TPL-PI-113', templateCode: 'UT-PI-MED-113', templateName: 'Medical Records Request Letter (113)', category: 'Personal Injury' },
            { id: 'TPL-PI-115', templateCode: 'UT-PI-DEF-115', templateName: 'Records Deficiency Follow-up Letter (115)', category: 'Personal Injury' },
          ];
          setTemplates(fallback);
          if (!selectedTemplateId) setSelectedTemplateId(fallback[0].id);
        });
    }
  }, [isOpen, matters]);

  // Run validation whenever template or matter changes
  const runValidation = async () => {
    if (!selectedMatterId || !selectedTemplateId) return;
    setValidating(true);
    try {
      const res = await documentService.validateDraftPrerequisites({
        matterId: selectedMatterId,
        templateId: selectedTemplateId,
      });
      setValidationResult(res);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Validation request failed.', 'error');
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedMatterId && selectedTemplateId) {
      runValidation();
    }
  }, [selectedMatterId, selectedTemplateId, isOpen]);

  const handleCreateFollowUpTask = async (field) => {
    setCreatingTaskTag(field.placeholderTag);
    try {
      const res = await documentService.createFollowUpTask({
        matterId: selectedMatterId,
        missingField: {
          placeholderTag: field.placeholderTag,
          sourceEntity: field.sourceEntity,
          sourceField: field.sourceField,
          description: field.description,
        },
        title: field.suggestedTaskTitle,
        description: field.suggestedTaskDescription,
        priority: field.suggestedPriority || 'High',
      });
      addToast(`Follow-up task created: ${res.task?.taskCode || 'New Task'} (${field.suggestedTaskTitle})`, 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create task';
      if (err?.response?.status === 409 || msg.includes('already exists')) {
        addToast(msg, 'warning');
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setCreatingTaskTag(null);
    }
  };

  const handleGenerate = async () => {
    if (!validationResult?.canGenerate) {
      addToast('Cannot generate document: required legal information is missing.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await documentService.generateDraft({
        matterId: selectedMatterId,
        templateId: selectedTemplateId,
        allowIncomplete: false,
      });
      addToast(`Draft generated successfully: ${res?.draft?.draftCode || 'New Draft'}`, 'success');
      if (onGenerated) onGenerated(res?.draft);
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Document generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Legal Document Generation & Missing Information Check"
      size="xl"
    >
      <div className="space-y-5 select-none">
        {/* Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Legal Matter
            </label>
            <select
              value={selectedMatterId}
              onChange={(e) => setSelectedMatterId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.matterNumber || m.id} — {m.title || m.matterTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06244B]"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.templateCode || t.id}] {t.templateName || t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Status Indicator */}
        {validating && (
          <div className="flex items-center gap-2.5 p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Validating matter records against template requirements...</span>
          </div>
        )}

        {validationResult && !validating && (
          <div className="space-y-4">
            {/* Status Banner */}
            {validationResult.canGenerate ? (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    All Required Information Verified
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    All mandatory fields configured for template{' '}
                    <strong>{validationResult.templateCode}</strong> are satisfied in matter records.
                    {validationResult.missingOptionalCount > 0 && (
                      <span> ({validationResult.missingOptionalCount} optional field(s) remain unpopulated).</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-950">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    Missing Required Legal Information ({validationResult.missingRequiredCount} Blockers)
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Document generation is blocked until required legal information is populated or follow-up tasks are assigned.
                  </p>
                </div>
              </div>
            )}

            {/* Missing Required Fields List */}
            {validationResult.missingFields?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Required Fields Missing ({validationResult.missingFields.length})</span>
                  <button
                    onClick={runValidation}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <RefreshCw className="w-3 h-3" /> Re-validate
                  </button>
                </h5>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                  {validationResult.missingFields.map((field, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            {field.placeholderTag}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Source: {field.sourceRecordType || field.sourceEntity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{field.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {field.sourceRecordNavigationUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate(field.sourceRecordNavigationUrl);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" /> Go to Record
                          </button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          loading={creatingTaskTag === field.placeholderTag}
                          onClick={() => handleCreateFollowUpTask(field)}
                          className="text-[11px] border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
                        >
                          <PlusCircle className="w-3 h-3 text-amber-700" /> Create Follow-up Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Missing Fields */}
            {validationResult.optionalMissingFields?.length > 0 && (
              <details className="text-xs text-slate-600 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <summary className="font-bold cursor-pointer text-slate-700 flex items-center justify-between">
                  <span>Optional Fields Missing ({validationResult.optionalMissingFields.length})</span>
                  <span className="text-[10px] text-slate-500 font-normal">Click to expand</span>
                </summary>
                <ul className="mt-2.5 space-y-1.5 pl-2 list-disc list-inside text-slate-600">
                  {validationResult.optionalMissingFields.map((f, idx) => (
                    <li key={idx}>
                      <span className="font-mono text-[11px] text-slate-800">{f.placeholderTag}</span> — {f.sourceEntity}.{f.sourceField}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} disabled={generating}>
            Cancel
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={!validationResult?.canGenerate || validating || generating}
            loading={generating}
            className="bg-[#06244B] hover:bg-[#0a3266] text-white"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Legal Document Draft</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
