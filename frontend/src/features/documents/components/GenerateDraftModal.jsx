import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Search,
  Zap,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { documentService } from '../../../services/documentService';
import { templateService } from '../../../services/templateService';
import { useToast } from '../../../components/ui/Toast';

export function GenerateDraftModal({ isOpen, onClose, onGenerated, matters = [] }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [mode, setMode] = useState('templates'); // 'templates' | 'catalog300'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [creatingTaskTag, setCreatingTaskTag] = useState(null);

  // 300-Catalog state
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(300);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [triggeringCatId, setTriggeringCatId] = useState(null);

  const currentMatter = useMemo(() => {
    return (
      (matters || []).find(
        (m) => m.id === selectedMatterId || m.matterNumber === selectedMatterId
      ) || (matters && matters.length > 0 ? matters[0] : null)
    );
  }, [matters, selectedMatterId]);

  const currentPracticeAreaId = currentMatter?.practiceAreaId || currentMatter?.practiceArea?.id || '';
  const currentPracticeAreaName = currentMatter?.practiceAreaName || currentMatter?.practiceArea?.name || '';

  useEffect(() => {
    if (!isOpen) return;
    setValidationResult(null);
    if (matters.length > 0 && !selectedMatterId) {
      setSelectedMatterId(matters[0].id);
    }

    templateService
      .getTemplates({ limit: 500, isActive: 'true' })
      .then((list) => {
        setTemplates(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setTemplates([]);
      });
  }, [isOpen, matters]);

  // Load 300-Document Automations Catalog when catalog mode or search changes
  useEffect(() => {
    if (!isOpen || mode !== 'catalog300') return;
    setCatalogLoading(true);
    documentService
      .getAutomations({
        practiceAreaId: currentPracticeAreaId || undefined,
        search: catalogSearch || undefined,
        limit: 100,
      })
      .then((res) => {
        setCatalogItems(res?.items || []);
        setCatalogTotal(res?.totalCatalogCount || 300);
      })
      .catch(() => {
        setCatalogItems([]);
      })
      .finally(() => setCatalogLoading(false));
  }, [isOpen, mode, currentPracticeAreaId, catalogSearch]);

  const filteredTemplates = useMemo(() => {
    if (!templates || templates.length === 0) return [];
    if (!currentPracticeAreaId) return templates;

    return templates.filter((t) => {
      const isGlobal =
        t.isSystemDefault === true ||
        t.practiceAreaId === 'ALL' ||
        t.category === 'Engagement' ||
        t.category === 'General' ||
        t.category === 'Firm intake and finance' ||
        t.templateCode === '001' ||
        t.templateCode === 'UT-ENG-RET-001' ||
        ['CAT-001', 'CAT-002', 'CAT-003', 'CAT-010'].includes(t.templateCode);
      if (isGlobal) return true;
      if (t.practiceAreaId && t.practiceAreaId === currentPracticeAreaId) return true;
      return false;
    });
  }, [templates, currentPracticeAreaId]);

  useEffect(() => {
    if (filteredTemplates.length > 0) {
      const exists = filteredTemplates.some(
        (t) => t.id === selectedTemplateId || t.templateCode === selectedTemplateId
      );
      if (!exists) {
        setSelectedTemplateId(filteredTemplates[0].id);
      }
    } else {
      setSelectedTemplateId('');
    }
  }, [filteredTemplates, selectedTemplateId]);

  const getAttorneyName = () => {
    if (!currentMatter) return 'Assigned Counsel';
    return (
      currentMatter.responsibleAttorneyName ||
      currentMatter.responsibleAttorney?.name ||
      currentMatter.assignedAttorney ||
      currentMatter.leadAttorney ||
      'Assigned Counsel'
    );
  };

  const runValidation = async () => {
    if (!selectedMatterId || !selectedTemplateId) return;
    setValidating(true);
    try {
      const attorneyName = getAttorneyName();
      const res = await documentService.validateDraftPrerequisites({
        matterId: selectedMatterId,
        templateId: selectedTemplateId,
        customOverrides: {
          'Attorney.Name': attorneyName,
          'Attorney.name': attorneyName,
        },
      });
      setValidationResult(res);
    } catch (err) {
      addToast(err?.message || 'Validation request failed.', 'error');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'templates' && selectedMatterId && selectedTemplateId) {
      runValidation();
    }
  }, [selectedMatterId, selectedTemplateId, isOpen, mode]);

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
      addToast(`Follow-up task created: ${res?.task?.taskCode || 'New Task'}`, 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to create task', 'error');
    } finally {
      setCreatingTaskTag(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedMatterId || !selectedTemplateId) return;
    setGenerating(true);
    try {
      const attorneyName = getAttorneyName();
      const res = await documentService.generateDraft({
        matterId: selectedMatterId,
        templateId: selectedTemplateId,
        allowIncomplete: true,
        customOverrides: {
          'Attorney.Name': attorneyName,
          'Attorney.name': attorneyName,
        },
      });
      addToast(`Draft generated successfully: ${res?.draft?.draftCode || 'New Draft'}`, 'success');
      if (onGenerated) onGenerated(res?.draft);
      onClose();
    } catch (err) {
      addToast(err?.message || 'Document generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleTriggerAutomation = async (catItem) => {
    if (!selectedMatterId) {
      addToast('Select a target matter first.', 'warning');
      return;
    }
    setTriggeringCatId(catItem.catalogId);
    try {
      const res = await documentService.triggerAutomation(catItem.catalogId, selectedMatterId, {
        'Attorney.Name': getAttorneyName(),
      });
      addToast(
        res?.isDuplicate
          ? `Reused existing draft ${res?.draft?.draftCode} for ${catItem.catalogId}.`
          : `Generated ${res?.draft?.draftCode} from ${catItem.catalogId} (${catItem.title}).`,
        'success'
      );
      if (onGenerated) onGenerated(res?.draft);
      onClose();
    } catch (err) {
      addToast(err?.message || `Failed to trigger ${catItem.catalogId}.`, 'error');
    } finally {
      setTriggeringCatId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Generation Engine &amp; 300-Automation Catalog"
      size="xl"
    >
      <div className="space-y-4">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('templates')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
              mode === 'templates'
                ? 'bg-[#06244B] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Registered Templates ({filteredTemplates.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('catalog300')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 ${
              mode === 'catalog300'
                ? 'bg-[#06244B] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>300 Document Automations ({catalogTotal})</span>
          </button>
        </div>

        {/* Shared Matter Selector */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Legal Matter
            </label>
            <select
              value={selectedMatterId}
              onChange={(e) => setSelectedMatterId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.matterNumber || m.id} — {m.title || m.matterTitle}
                </option>
              ))}
            </select>
          </div>

          {mode === 'templates' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Document Template
                </label>
                {currentPracticeAreaName && (
                  <span className="text-[10px] font-semibold text-[#06244B] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {currentPracticeAreaName}
                  </span>
                )}
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800"
              >
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.templateCode}] {t.templateName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No registered templates for {currentPracticeAreaName || 'selected matter'} — try 300 Automations tab
                  </option>
                )}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Search 300 Automations (ID, Title, Trigger, Fields)
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="e.g. CAT-096, Representation, Subpoena, Petition..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mode 1: Template Validation & Generation */}
        {mode === 'templates' && (
          <>
            {validating && (
              <div className="flex items-center gap-2.5 p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Validating matter records against template field mappings...</span>
              </div>
            )}

            {validationResult && !validating && (
              <div className="space-y-3">
                {validationResult.canGenerate ? (
                  <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">All Required Information Verified</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Mandatory fields for template <strong>{validationResult.templateCode}</strong> are satisfied.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        {validationResult.missingRequiredCount} Required Field(s) Missing
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Draft will be flagged for review; create follow-up tasks or generate anyway as Under Review.
                      </p>
                    </div>
                  </div>
                )}

                {validationResult.missingFields?.length > 0 && (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto">
                    {validationResult.missingFields.map((field, idx) => (
                      <div key={idx} className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            {field.placeholderTag}
                          </span>
                          <p className="text-xs text-slate-700 mt-1">{field.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {field.sourceRecordNavigationUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                navigate(field.sourceRecordNavigationUrl);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-lg"
                            >
                              <ExternalLink className="w-3 h-3" /> Record
                            </button>
                          )}
                          <Button
                            size="xs"
                            variant="outline"
                            loading={creatingTaskTag === field.placeholderTag}
                            onClick={() => handleCreateFollowUpTask(field)}
                          >
                            <PlusCircle className="w-3 h-3" /> Follow-up Task
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button variant="ghost" onClick={onClose} disabled={generating}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedTemplateId || validating || generating}
                loading={generating}
                className="bg-[#06244B] hover:bg-[#0a3266] text-white"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Word &amp; PDF Draft</span>
              </Button>
            </div>
          </>
        )}

        {/* Mode 2: 300-Document Automations Catalog Browser */}
        {mode === 'catalog300' && (
          <div className="space-y-3">
            {catalogLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading 300-document automation catalog...</div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-200 bg-white">
                {catalogItems.map((item) => (
                  <div key={item.catalogId} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#06244B] text-white">
                          {item.catalogId}
                        </span>
                        <span className="font-semibold text-xs text-slate-900">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                          {item.practiceArea}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong>Trigger:</strong> {item.trigger} • <strong>Fields:</strong> {item.fields}
                      </p>
                    </div>
                    <Button
                      size="xs"
                      variant="primary"
                      icon={Zap}
                      loading={triggeringCatId === item.catalogId}
                      onClick={() => handleTriggerAutomation(item)}
                      className="shrink-0 bg-[#06244B] text-white"
                    >
                      Trigger Draft
                    </Button>
                  </div>
                ))}
                {catalogItems.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No catalog automations matched your filter.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
