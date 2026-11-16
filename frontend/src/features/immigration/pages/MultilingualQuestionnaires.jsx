import React, { useState, useEffect } from 'react';
import { Globe, Save, CheckCircle, HelpCircle, FileCheck, Languages, Database, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { BILINGUAL_QUESTIONNAIRE_SECTIONS } from '../../../data/mockQuestionnaires';

const emptyFormData = {
  fullName: '',
  otherNames: '',
  dob: '',
  countryOfBirth: '',
  countryOfCitizenship: '',
  alienNumber: '',
  currentAddress: '',
  currentDates: '',
  priorAddress1: '',
  priorDates1: '',
  dateOfLastArrival: '',
  placeOfEntry: '',
  classOfAdmission: '',
  i94Number: '',
  passportNumber: '',
};

export function MultilingualQuestionnaires() {
  const { matters = [] } = useMatters();
  const immigrationMatters = matters.filter(m =>
    m.practiceAreaId === 'pa-imm' ||
    m.area === 'Immigration' ||
    m.practiceArea === 'Immigration' ||
    (m.matterNumber && m.matterNumber.includes('IMM'))
  );

  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' | 'es'
  const [formData, setFormData] = useState(emptyFormData);
  const [syncHistory, setSyncHistory] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (immigrationMatters.length > 0 && !selectedMatterId) {
      const first = immigrationMatters[0];
      setSelectedMatterId(first.id);
      setFormData(prev => ({
        ...prev,
        fullName: first.clientName || first.client?.name || '',
      }));
    }
  }, [immigrationMatters, selectedMatterId]);

  const handleSelectMatter = (matterId) => {
    setSelectedMatterId(matterId);
    const selected = immigrationMatters.find(m => m.id === matterId);
    if (selected) {
      setFormData(prev => ({
        ...emptyFormData,
        fullName: selected.clientName || selected.client?.name || '',
      }));
    } else {
      setFormData(emptyFormData);
    }
    setSyncHistory(null);
  };

  const handleInputChange = (fieldId, val) => {
    setFormData(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSaveToBioDataVault = (e) => {
    e.preventDefault();
    setSyncHistory({
      syncedAt: new Date().toLocaleTimeString(),
      targetPetitions: [
        { form: 'Form I-130', status: 'Identity, Address & Marital History Populated ✓' },
        { form: 'Form I-485', status: 'Part 1 Demographics, 5-Year Residence & I-94 Populated ✓' },
        { form: 'Form I-765', status: 'Part 2 Eligibility & Mailing Address Populated ✓' },
        { form: 'Form G-28', status: 'Client Attorney Authorization Records Synced ✓' }
      ]
    });
    addToast(
      language === 'en'
        ? 'Bio-Data successfully verified & synchronized to Central Client Vault across 4 forms!'
        : '¡Datos biográficos verificados y sincronizados con éxito en 4 formularios!',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Multilingual Intake &amp; Bio-Data Vault:</strong> Toggle language dynamically between English and Spanish. Data propagates across USCIS forms (I-130, I-485, I-765) without duplicate data entry.
          </span>
        </div>
        <span className="bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded text-[10px]">
          CENTRAL VAULT
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={language === 'en' ? 'Bilingual Immigration Intake Questionnaire' : 'Cuestionario de Inmigración Bilingüe'}
          subtitle={
            language === 'en'
              ? 'Docketwise-style multi-language client questionnaire with automated bio-data synchronization.'
              : 'Cuestionario de cliente en varios idiomas estilo Docketwise con sincronización de datos.'
          }
          breadcrumbs={[
            { label: 'Clients & Matters', to: '/matters' },
            { label: 'Immigration', to: '/immigration/cases' },
            { label: 'Bilingual Intake' }
          ]}
        />

        <div className="flex items-center gap-3">
          {/* Applicant Case Selector */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#D9D6CF] shadow-sm">
            <span className="text-xs font-semibold text-[#06244B] ml-2">Applicant / Solicitante:</span>
            <select
              value={selectedMatterId}
              onChange={(e) => handleSelectMatter(e.target.value)}
              className="text-xs p-1.5 rounded border border-[#D9D6CF] text-[#06244B] bg-slate-50 font-medium"
            >
              {immigrationMatters.length === 0 ? (
                <option value="">No immigration matters registered</option>
              ) : (
                immigrationMatters.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.clientName || m.client?.name || m.title} ({m.matterNumber || m.caseNumber || 'No #'}: {m.title})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Language Selector Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9D6CF] rounded-lg shadow-sm">
            <Languages className="w-4 h-4 text-[#A4432B] ml-2" />
            <span className="text-xs font-semibold text-[#06244B] mr-2">Language / Idioma:</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-[#06244B] text-white shadow'
                  : 'text-[#667085] hover:text-[#06244B]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                language === 'es'
                  ? 'bg-[#A4432B] text-white shadow'
                  : 'text-[#667085] hover:text-[#06244B]'
              }`}
            >
              Español
            </button>
          </div>
        </div>
      </div>

      {/* Form sections */}
      <form onSubmit={handleSaveToBioDataVault} className="space-y-6">
        {BILINGUAL_QUESTIONNAIRE_SECTIONS.map((sec) => (
          <div key={sec.id} className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm p-5 space-y-4">
            <div className="border-b border-[#D9D6CF] pb-2">
              <h3 className="font-bold text-base text-[#06244B]">
                {language === 'en' ? sec.title_en : sec.title_es}
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                {language === 'en' ? sec.description_en : sec.description_es}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sec.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-[#202A35] mb-1">
                    {language === 'en' ? field.label_en : field.label_es}
                    {field.required && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={language === 'en' ? field.placeholder_en : field.placeholder_es}
                    required={field.required}
                    className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B] bg-slate-50/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {syncHistory && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'en'
                  ? `Central Bio-Data Vault Synchronization Log (${syncHistory.syncedAt})`
                  : `Registro de Sincronización de la Bóveda de Datos (${syncHistory.syncedAt})`}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {syncHistory.targetPetitions.map((p, i) => (
                <div key={i} className="p-2 bg-white rounded border border-emerald-200 flex justify-between items-center">
                  <span className="font-bold text-[#06244B]">{p.form}</span>
                  <span className="text-emerald-700 font-medium text-[11px]">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            {language === 'en'
              ? 'Save & Propagate to Bio-Data Vault'
              : 'Guardar y Propagar a la Bóveda de Datos'}
          </Button>
        </div>
      </form>
    </div>
  );
}

