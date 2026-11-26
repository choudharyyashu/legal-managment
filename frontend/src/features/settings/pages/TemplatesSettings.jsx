import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Download,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  Tag,
  GitBranch,
  Zap,
  CheckCircle2,
  Trash2,
  Save,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { templateService } from '../../../services/templateService';
import { documentService } from '../../../services/documentService';

const PRACTICE_AREAS = [
  { id: 'pa-pi', name: 'Personal Injury' },
  { id: 'pa-civ', name: 'Civil/Commercial Litigation' },
  { id: 'pa-bk', name: 'Bankruptcy' },
  { id: 'pa-imm', name: 'Immigration' },
  { id: 'pa-prob', name: 'Probate' },
  { id: 'pa-fam', name: 'Family Law' },
  { id: 'pa-crim', name: 'Criminal Defense' },
  { id: 'pa-app', name: 'Appeals' },
  { id: 'pa-evict', name: 'Landlord-Tenant/Evictions' },
];

const FORMATTING_RULES = [
  'NONE',
  'UPPERCASE',
  'LOWERCASE',
  'TITLECASE',
  'DATE_LONG',
  'DATE_SHORT',
  'DATE_COURT',
  'CURRENCY_USD',
  'PHONE_STANDARD',
];

export function TemplatesSettings() {
  const { addToast } = useToast();
  const { matters } = useMatters();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [materializing, setMaterializing] = useState(false);

  // Field dictionary
  const [fieldDictionary, setFieldDictionary] = useState([]);

  // Add Template Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateCode: '',
    templateName: '',
    category: 'Engagement',
    practiceAreaId: 'pa-civ',
    outputFormat: 'BOTH',
    description: '',
    templateBody: '',
    file: null,
  });

  // Version & Field Mapping Modal
  const [mappingTemplate, setMappingTemplate] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [mappings, setMappings] = useState([]);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [savingMappings, setSavingMappings] = useState(false);

  // Live Merge Studio Modal
  const [studioTemplate, setStudioTemplate] = useState(null);
  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const list = await templateService.getTemplates({
        limit: 500,
        practiceAreaId: practiceAreaFilter || undefined,
        search: searchTerm || undefined,
      });
      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      addToast(err?.message || 'Failed to load templates.', 'error');
    } finally {
      setLoading(false);
    }
  }, [practiceAreaFilter, searchTerm, addToast]);

  useEffect(() => {
    loadTemplates();
    templateService.getFieldDictionary().then(setFieldDictionary).catch(() => {});
  }, [loadTemplates]);

  useEffect(() => {
    if (matters.length > 0 && !selectedMatterId) {
      setSelectedMatterId(matters[0].id);
    }
  }, [matters, selectedMatterId]);

  const handleMaterialize300 = async () => {
    setMaterializing(true);
    try {
      const res = await documentService.materializeAutomations({});
      addToast(
        `300-Document Catalog materialized: ${res.createdCount} created, ${res.existingCount} already registered.`,
        'success'
      );
      await loadTemplates();
    } catch (err) {
      addToast(err?.message || 'Failed to materialize 300-document catalog.', 'error');
    } finally {
      setMaterializing(false);
    }
  };

  const handleToggleActive = async (tpl) => {
    try {
      await templateService.setTemplateStatus(tpl.id, !tpl.isActive);
      addToast(`Template ${tpl.templateCode} ${!tpl.isActive ? 'activated' : 'deactivated'}.`, 'success');
      await loadTemplates();
    } catch (err) {
      addToast(err?.message || 'Failed to change template status.', 'error');
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.templateCode.trim() || !newTemplate.templateName.trim()) {
      addToast('Template code and name are required.', 'warning');
      return;
    }
    try {
      const created = await templateService.createTemplate({
        templateCode: newTemplate.templateCode.trim().toUpperCase(),
        templateName: newTemplate.templateName.trim(),
        description: newTemplate.description.trim() || undefined,
        practiceAreaId: newTemplate.practiceAreaId,
        category: newTemplate.category,
        outputFormat: newTemplate.outputFormat,
        isSystemDefault: false,
      });

      if (newTemplate.file) {
        const fd = new FormData();
        fd.append('file', newTemplate.file);
        fd.append('status', 'Published');
        fd.append('changeSummary', 'Initial template DOCX upload');
        await templateService.uploadVersion(created.id, fd);
      } else {
        await templateService.uploadVersion(created.id, {
          templateBody:
            newTemplate.templateBody.trim() ||
            `LEGAL INSTRUMENT: ${created.templateName}\n\nClient: {{Client.Name}}\nMatter: {{Matter.Title}} ({{Matter.MatterNumber}})\nAttorney: {{Attorney.Name}}\nDate: {{CurrentDate.Long}}`,
          status: 'Published',
          changeSummary: 'Initial inline template version',
        });
      }

      addToast(`Template ${created.templateCode} created and published.`, 'success');
      setIsAddModalOpen(false);
      setNewTemplate({
        templateCode: '',
        templateName: '',
        category: 'Engagement',
        practiceAreaId: 'pa-civ',
        outputFormat: 'BOTH',
        description: '',
        templateBody: '',
        file: null,
      });
      await loadTemplates();
    } catch (err) {
      addToast(err?.message || 'Failed to create template.', 'error');
    }
  };

  const openMappingStudio = async (tpl) => {
    setMappingTemplate(tpl);
    setVersions([]);
    setMappings([]);
    setDetectedPlaceholders([]);
    try {
      const detail = await templateService.getTemplateById(tpl.id);
      const vList = detail?.versions || [];
      setVersions(vList);
      if (vList.length > 0) {
        const firstId = vList[0].id;
        setSelectedVersionId(firstId);
        const [mList, tags] = await Promise.all([
          templateService.getFieldMappings(tpl.id, firstId),
          templateService.getVersionPlaceholders(tpl.id, firstId).catch(() => []),
        ]);
        setMappings(mList);
        setDetectedPlaceholders(tags);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to load template versions/mappings.', 'error');
    }
  };

  const handleSelectVersion = async (versionId) => {
    setSelectedVersionId(versionId);
    if (!mappingTemplate || !versionId) return;
    try {
      const [mList, tags] = await Promise.all([
        templateService.getFieldMappings(mappingTemplate.id, versionId),
        templateService.getVersionPlaceholders(mappingTemplate.id, versionId).catch(() => []),
      ]);
      setMappings(mList);
      setDetectedPlaceholders(tags);
    } catch (err) {
      addToast(err?.message || 'Failed to load version mappings.', 'error');
    }
  };

  const handleUploadNewTemplateVersion = async (e) => {
    e.preventDefault();
    if (!mappingTemplate || !newVersionFile) return;
    try {
      const fd = new FormData();
      fd.append('file', newVersionFile);
      fd.append('status', 'Published');
      fd.append('changeSummary', newVersionSummary || 'Uploaded updated DOCX template');
      const created = await templateService.uploadVersion(mappingTemplate.id, fd);
      addToast(`Uploaded template version ${created.versionNumber}.`, 'success');
      setNewVersionFile(null);
      setNewVersionSummary('');
      await openMappingStudio(mappingTemplate);
      await loadTemplates();
    } catch (err) {
      addToast(err?.message || 'Failed to upload template version.', 'error');
    }
  };

  const handleAutoAddDetectedTags = () => {
    const existingTags = new Set(mappings.map((m) => m.placeholderTag.toLowerCase()));
    const added = [];
    for (const tag of detectedPlaceholders) {
      if (!existingTags.has(tag.toLowerCase())) {
        const clean = tag.replace(/^\{\{|\}\}$/g, '');
        const [rawEnt, rawField] = clean.split('.');
        const matchedEnt =
          fieldDictionary.find((e) => e.entity.toLowerCase() === (rawEnt || '').toLowerCase())?.entity || 'CustomField';
        added.push({
          placeholderTag: tag,
          sourceEntity: matchedEnt,
          sourceField: rawField ? rawField.charAt(0).toLowerCase() + rawField.slice(1) : clean,
          isRequired: true,
          defaultValue: '',
          formattingRule: 'NONE',
        });
      }
    }
    if (added.length === 0) {
      addToast('All detected DOCX tags are already mapped.', 'info');
    } else {
      setMappings((prev) => [...prev, ...added]);
      addToast(`Added ${added.length} detected placeholder(s) to mapping table.`, 'success');
    }
  };

  const handleAddBlankMapping = () => {
    setMappings((prev) => [
      ...prev,
      {
        placeholderTag: '{{Client.Name}}',
        sourceEntity: 'Client',
        sourceField: 'name',
        isRequired: true,
        defaultValue: '',
        formattingRule: 'NONE',
      },
    ]);
  };

  const handleSaveMappings = async () => {
    if (!mappingTemplate || !selectedVersionId || mappings.length === 0) {
      addToast('Add at least one field mapping before saving.', 'warning');
      return;
    }
    setSavingMappings(true);
    try {
      const payload = mappings.map((m) => ({
        placeholderTag: m.placeholderTag,
        sourceEntity: m.sourceEntity,
        sourceField: m.sourceField,
        isRequired: Boolean(m.isRequired),
        defaultValue: m.defaultValue || undefined,
        formattingRule: m.formattingRule || 'NONE',
        conditionalExpression: m.conditionalExpression || undefined,
      }));
      const saved = await templateService.saveFieldMappings(mappingTemplate.id, selectedVersionId, payload);
      setMappings(saved);
      addToast(`Saved ${saved.length} field mapping(s) for version.`, 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to save field mappings.', 'error');
    } finally {
      setSavingMappings(false);
    }
  };

  const openMergeStudio = async (tpl) => {
    setStudioTemplate(tpl);
    setGeneratedDraft(null);
    setValidationResult(null);
    const targetMId = selectedMatterId || matters[0]?.id;
    if (targetMId) {
      try {
        const val = await documentService.validateDraftPrerequisites({
          matterId: targetMId,
          templateId: tpl.id,
        });
        setValidationResult(val);
      } catch (err) {
        addToast(err?.message || 'Validation check failed.', 'warning');
      }
    }
  };

  const handleStudioGenerate = async () => {
    if (!studioTemplate || !selectedMatterId) return;
    setGeneratingDraft(true);
    try {
      const res = await documentService.generateDraft({
        matterId: selectedMatterId,
        templateId: studioTemplate.id,
        allowIncomplete: true,
      });
      setGeneratedDraft(res?.draft);
      addToast(`Generated Word draft ${res?.draft?.draftCode}! Ready for DOCX or PDF download.`, 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to generate draft from template.', 'error');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const columns = [
    {
      key: 'templateName',
      label: 'Template Code & Title',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-start gap-2 min-w-[240px]">
          <FileText className="w-4 h-4 text-[#A4432B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-xs text-[#06244B] block leading-snug">{val}</span>
            <span className="text-[10px] text-[#667085] font-mono">
              {row.templateCode} • {row.currentVersion} • {row.outputFormat}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="inline-block whitespace-nowrap text-xs px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF]">
          {val}
        </span>
      ),
    },
    {
      key: 'practiceAreaName',
      label: 'Practice Area',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs text-[#202A35] font-medium">{val || row.practiceAreaId}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
            val ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button size="xs" variant="outline" icon={Tag} onClick={() => openMappingStudio(row)}>
            Versions &amp; Mappings
          </Button>
          <Button size="xs" variant="primary" icon={Sparkles} onClick={() => openMergeStudio(row)}>
            Live Merge
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Template Management, Versioning &amp; Document Field Mapping:</strong> Administrator-maintainable DOCX templates, dynamic placeholder detection, field mappings, and Word/PDF generation.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
          {templates.length} TEMPLATES REGISTERED
        </span>
      </div>

      <PageHeader
        title="Document Templates &amp; Field Mapping Studio"
        subtitle="Manage DOCX templates, upload new versions, configure entity field mappings, and run live Word/PDF merges."
        breadcrumbs={[
          { label: 'Reports & Settings', to: '/settings/users' },
          { label: 'Templates & Field Mapping' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Zap}
              loading={materializing}
              onClick={handleMaterialize300}
            >
              Sync 300-Automation Templates
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Template
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#EAECF0] flex flex-wrap items-center gap-3 text-xs">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search templates by code, title, or description..."
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB]"
        />
        <select
          value={practiceAreaFilter}
          onChange={(e) => setPracticeAreaFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white font-medium"
        >
          <option value="">All Practice Areas</option>
          {PRACTICE_AREAS.map((pa) => (
            <option key={pa.id} value={pa.id}>
              {pa.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={templates} pageSize={10} loading={loading} />

      {/* Add New Template Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Document Template"
          subtitle="Register a template and publish its initial DOCX version."
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#06244B] block mb-1">Template Code *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.templateCode}
                  onChange={(e) => setNewTemplate({ ...newTemplate, templateCode: e.target.value })}
                  placeholder="e.g. UT-CIV-041"
                  className="w-full p-2 border border-[#D9D6CF] rounded"
                />
              </div>
              <div>
                <label className="font-bold text-[#06244B] block mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.templateName}
                  onChange={(e) => setNewTemplate({ ...newTemplate, templateName: e.target.value })}
                  placeholder="e.g. Motion for Summary Judgment"
                  className="w-full p-2 border border-[#D9D6CF] rounded"
                />
              </div>
              <div>
                <label className="font-bold text-[#06244B] block mb-1">Practice Area *</label>
                <select
                  value={newTemplate.practiceAreaId}
                  onChange={(e) => setNewTemplate({ ...newTemplate, practiceAreaId: e.target.value })}
                  className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
                >
                  {PRACTICE_AREAS.map((pa) => (
                    <option key={pa.id} value={pa.id}>{pa.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-[#06244B] block mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full p-2 border border-[#D9D6CF] rounded"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-[#D9D6CF] rounded-lg p-3 bg-slate-50 text-center">
              <UploadCloud className="w-6 h-6 text-[#A4432B] mx-auto mb-1" />
              <p className="font-semibold text-[#06244B]">
                {newTemplate.file ? `Selected DOCX: ${newTemplate.file.name}` : 'Upload Word (.docx) Template (Optional)'}
              </p>
              <input
                type="file"
                accept=".docx"
                onChange={(e) => setNewTemplate({ ...newTemplate, file: e.target.files?.[0] || null })}
                className="mt-2 text-xs"
              />
            </div>

            {!newTemplate.file && (
              <div>
                <label className="font-bold text-[#06244B] block mb-1">
                  Or Author Template Text (Compiled Automatically to .DOCX)
                </label>
                <textarea
                  rows={5}
                  value={newTemplate.templateBody}
                  onChange={(e) => setNewTemplate({ ...newTemplate, templateBody: e.target.value })}
                  placeholder="Enter legal text with {{Client.Name}}, {{Matter.Title}}, {{Attorney.Name}} merge tags..."
                  className="w-full p-2 border border-[#D9D6CF] rounded font-mono text-[11px]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" icon={Plus}>Create &amp; Publish</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Template Versions & Field Mapping Studio Modal */}
      {mappingTemplate && (
        <Modal
          isOpen={!!mappingTemplate}
          onClose={() => setMappingTemplate(null)}
          title={`Versions & Field Mapping: ${mappingTemplate.templateName}`}
          subtitle={`Code: ${mappingTemplate.templateCode}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Version Selector & Upload New Version */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label className="font-bold text-[#06244B] block mb-1">Select Template Version</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVersionId}
                    onChange={(e) => handleSelectVersion(e.target.value)}
                    className="flex-1 p-2 border border-[#D9D6CF] rounded bg-white font-mono"
                  >
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.versionNumber} ({v.status}) — {v.fieldMappingsCount ?? 0} mappings
                      </option>
                    ))}
                  </select>
                  {selectedVersionId && (
                    <Button
                      size="xs"
                      variant="outline"
                      icon={Download}
                      onClick={() =>
                        templateService.downloadVersion(
                          mappingTemplate.id,
                          selectedVersionId,
                          `${mappingTemplate.templateCode}.docx`
                        )
                      }
                    >
                      .DOCX
                    </Button>
                  )}
                </div>
              </div>

              <form onSubmit={handleUploadNewTemplateVersion} className="space-y-1.5">
                <label className="font-bold text-[#06244B] block">Upload New .DOCX Version</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                    className="flex-1 text-[11px] bg-white p-1 border rounded"
                  />
                  <Button size="xs" variant="primary" icon={GitBranch} type="submit" disabled={!newVersionFile}>
                    Publish
                  </Button>
                </div>
              </form>
            </div>

            {/* Detected Placeholders */}
            {detectedPlaceholders.length > 0 && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-blue-900">Detected in DOCX:</span>
                  {detectedPlaceholders.map((t) => (
                    <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-900">
                      {t}
                    </span>
                  ))}
                </div>
                <Button size="xs" variant="outline" onClick={handleAutoAddDetectedTags}>
                  Auto-Map Detected Tags
                </Button>
              </div>
            )}

            {/* Field Mappings Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#06244B]">Configured Document Field Mappings ({mappings.length})</span>
                <Button size="xs" variant="outline" icon={Plus} onClick={handleAddBlankMapping}>
                  Add Mapping Row
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b font-semibold">
                    <tr>
                      <th className="p-2">Placeholder Tag</th>
                      <th className="p-2">Source Entity</th>
                      <th className="p-2">Source Field</th>
                      <th className="p-2">Format Rule</th>
                      <th className="p-2 text-center">Required</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mappings.map((m, idx) => {
                      const entityFields =
                        fieldDictionary.find((e) => e.entity === m.sourceEntity)?.fields || [];
                      return (
                        <tr key={m.id || idx}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={m.placeholderTag}
                              onChange={(e) => {
                                const next = [...mappings];
                                next[idx] = { ...next[idx], placeholderTag: e.target.value };
                                setMappings(next);
                              }}
                              className="w-full p-1 border rounded font-mono"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={m.sourceEntity}
                              onChange={(e) => {
                                const next = [...mappings];
                                next[idx] = { ...next[idx], sourceEntity: e.target.value };
                                setMappings(next);
                              }}
                              className="w-full p-1 border rounded bg-white"
                            >
                              {fieldDictionary.map((ent) => (
                                <option key={ent.entity} value={ent.entity}>{ent.entity}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              list={`fields-${idx}`}
                              value={m.sourceField}
                              onChange={(e) => {
                                const next = [...mappings];
                                next[idx] = { ...next[idx], sourceField: e.target.value };
                                setMappings(next);
                              }}
                              className="w-full p-1 border rounded"
                            />
                            <datalist id={`fields-${idx}`}>
                              {entityFields.map((f) => (
                                <option key={f.field} value={f.field}>{f.label}</option>
                              ))}
                            </datalist>
                          </td>
                          <td className="p-1.5">
                            <select
                              value={m.formattingRule || 'NONE'}
                              onChange={(e) => {
                                const next = [...mappings];
                                next[idx] = { ...next[idx], formattingRule: e.target.value };
                                setMappings(next);
                              }}
                              className="w-full p-1 border rounded bg-white"
                            >
                              {FORMATTING_RULES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(m.isRequired)}
                              onChange={(e) => {
                                const next = [...mappings];
                                next[idx] = { ...next[idx], isRequired: e.target.checked };
                                setMappings(next);
                              }}
                            />
                          </td>
                          <td className="p-1.5 text-right">
                            <button
                              type="button"
                              onClick={() => setMappings((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setMappingTemplate(null)}>Close</Button>
              <Button size="sm" variant="primary" icon={Save} loading={savingMappings} onClick={handleSaveMappings}>
                Save Field Mappings
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Merge Studio Modal */}
      {studioTemplate && (
        <Modal
          isOpen={!!studioTemplate}
          onClose={() => setStudioTemplate(null)}
          title={`Live Merge Studio: ${studioTemplate.templateName}`}
          subtitle="Validate matter fields and generate Word (.DOCX) and PDF outputs directly from backend engine."
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="font-bold text-[#06244B] block mb-1">Target Matter</label>
              <select
                value={selectedMatterId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedMatterId(id);
                  setGeneratedDraft(null);
                  try {
                    const val = await documentService.validateDraftPrerequisites({
                      matterId: id,
                      templateId: studioTemplate.id,
                    });
                    setValidationResult(val);
                  } catch {
                    setValidationResult(null);
                  }
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white font-semibold"
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} — {m.title} ({m.clientName})
                  </option>
                ))}
              </select>
            </div>

            {validationResult && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#06244B]">Resolved Merge Preview</span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {validationResult.totalFieldsCount} mapped fields • {validationResult.missingRequiredCount} required missing
                  </span>
                </div>
                <pre className="p-2.5 bg-slate-50 border rounded font-mono text-[11px] max-h-48 overflow-y-auto">
                  {JSON.stringify(validationResult.resolvedPreview || {}, null, 2)}
                </pre>
              </div>
            )}

            {generatedDraft && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Draft {generatedDraft.draftCode} Ready
                </span>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Download}
                    onClick={() => documentService.downloadDraft(generatedDraft.id, 'docx', generatedDraft)}
                  >
                    Download .DOCX
                  </Button>
                  <Button
                    size="xs"
                    variant="primary"
                    icon={Download}
                    onClick={() => documentService.downloadDraft(generatedDraft.id, 'pdf', generatedDraft)}
                  >
                    Download .PDF
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setStudioTemplate(null)}>Close</Button>
              <Button size="sm" variant="primary" icon={Sparkles} loading={generatingDraft} onClick={handleStudioGenerate}>
                Generate Word &amp; PDF Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
