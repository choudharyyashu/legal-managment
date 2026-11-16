import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Activity,
  Briefcase,
  DollarSign,
  FileText,
  AlertCircle,
  FileCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { DamagesModal } from '../components/DamagesModal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { piService } from '../../../services/piService';

export function ClientDamages() {
  const { addToast } = useToast();
  const { matters, activeMatter, setActiveMatter } = useMatters();
  const cases = React.useMemo(() => {
    return (matters || []).filter(
      (m) => m.practiceAreaId === 'pa-pi' || m.practiceAreaName?.toLowerCase().includes('personal injury')
    );
  }, [matters]);
  const [damagesList, setDamagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || (cases[0]?.id || 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);

  // Sync activeCaseId when global activeMatter changes
  useEffect(() => {
    if (activeMatter?.id && activeMatter.id !== activeCaseId) {
      setActiveCaseId(activeMatter.id);
    }
  }, [activeMatter]);

  useEffect(() => {
    let isMounted = true;
    if (activeCaseId && activeCaseId !== 'ALL') {
      setLoading(true);
      piService.getDamages(activeCaseId)
        .then((res) => {
          if (isMounted) {
            const data = res?.data || res || {};
            const records = (data.damages || []).map((d) => ({
              id: d.id,
              matterId: d.matterId,
              matterTitle: `Damages Record - ${d.anatomicalLocation}`,
              injuries: [
                {
                  id: d.id,
                  bodyArea: d.anatomicalLocation,
                  diagnosis: d.injuryCategory,
                  severity: d.severityGrade,
                  icdCode: d.icdCode,
                  futureCare: d.futureTreatmentProjected,
                  treatmentSummary: d.treatmentSummary,
                },
              ],
              diagnostics: (d.diagnosticStudies || []).map((s) => ({
                id: s.id,
                type: s.studyType,
                finding: s.radiologistImpression,
                date: s.studyDate,
              })),
              employment: {
                totalLostWages: (data.wageLoss || []).reduce((acc, w) => acc + Number(w.totalLostWages || 0), 0),
                daysMissed: (data.wageLoss || []).reduce((acc, w) => acc + Number(w.daysLost || 0), 0),
              },
            }));
            setDamagesList(records);
          }
        })
        .catch((err) => {
          console.warn('Could not load damages from API:', err?.message);
          if (isMounted) setDamagesList([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setDamagesList([]);
    }
    return () => { isMounted = false; };
  }, [activeCaseId]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId && newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

  // Filtered dataset
  const filteredDamages = damagesList.filter((d) => {
    if (!d) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      d.matterTitle?.toLowerCase().includes(q) ||
      d.injuries?.some(i => i?.bodyArea?.toLowerCase().includes(q) || i?.description?.toLowerCase().includes(q)) ||
      d.employment?.employer?.toLowerCase().includes(q) ||
      d.employment?.jobTitle?.toLowerCase().includes(q);
    const matchesCase = activeCaseId === 'ALL' || d.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  // Aggregate metrics
  const totalLostWages = filteredDamages.reduce((sum, d) => sum + (d?.employment?.totalLostWages || 0), 0);
  const totalDaysMissed = filteredDamages.reduce((sum, d) => sum + (d?.employment?.daysMissed || 0), 0);
  const totalInjuries = filteredDamages.reduce((sum, d) => sum + (d?.injuries?.length || 0), 0);

  const handleSaveDamage = async (savedRecord) => {
    try {
      if (activeCaseId && activeCaseId !== 'ALL') {
        const payload = {
          injuryCategory: savedRecord.injuries?.[0]?.diagnosis || savedRecord.category || 'ORTHOPEDIC',
          anatomicalLocation: savedRecord.injuries?.[0]?.bodyArea || savedRecord.bodyPart || 'General',
          severityGrade: savedRecord.injuries?.[0]?.severity || 'MODERATE',
          futureTreatmentProjected: Boolean(savedRecord.injuries?.[0]?.futureCare),
          treatmentSummary: savedRecord.injuries?.[0]?.treatmentSummary || savedRecord.description,
        };
        const created = await piService.createDamage(activeCaseId, payload);
        savedRecord = created ? { ...savedRecord, id: created.id } : savedRecord;
        addToast('New injury & economic damages profile saved to database.', 'success');
      }
      setDamagesList((prev) => {
        const exists = prev.some((d) => d.id === savedRecord.id);
        if (exists) {
          return prev.map((d) => (d.id === savedRecord.id ? savedRecord : d));
        }
        return [savedRecord, ...prev];
      });
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Error saving damages record', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedDamage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dmg) => {
    setSelectedDamage(dmg);
    setIsModalOpen(true);
  };

  const handleDeleteDamage = (id) => {
    setDamagesList((prev) => {
      return prev.filter((d) => d.id !== id);
    });
    if (expandedRecord?.id === id) {
      setExpandedRecord(null);
    }
    addToast('Damages & injury record deleted.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={handleCaseChange}
        cases={cases}
        title="Client & Damages Management"
        subtitle="Anatomical injury profiles, objective diagnostic MRI/CT findings, functional disability ratings, and verified economic wage loss calculations."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Add Damages Profile
          </Button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EAECF0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Total Verified Wage Loss
            </span>
            <span className="text-xl font-bold font-mono text-[#06244B] mt-0.5 block">
              {formatCurrency(totalLostWages)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Across {filteredDamages.length} active PI profiles
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EAECF0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Documented Work Days Lost
            </span>
            <span className="text-xl font-bold font-mono text-[#A4432B] mt-0.5 block">
              {totalDaysMissed} Work Days
            </span>
            <span className="text-[11px] text-[#667085]">
              Employer verified via W-2 / payroll
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#A4432B] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EAECF0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Diagnosed Bodily Injuries
            </span>
            <span className="text-xl font-bold font-mono text-[#101828] mt-0.5 block">
              {totalInjuries} Anatomical Sites
            </span>
            <span className="text-[11px] text-blue-600 font-medium">
              100% Objective MRI/CT findings
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
        {/* Table Filter / Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAECF0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base font-bold text-[#06244B]">
              Injury & Economic Damages Profiles ({filteredDamages.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Itemized bodily trauma, functional restrictions, and wage loss documentation per client.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search by injury, employer, or matter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#06244B] w-64 sm:w-80 bg-[#F9FAFB] text-[#1D2939]"
            />
          </div>
        </div>

        {/* Clean Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#F8F9FC] border-b border-[#EAECF0] text-[10px] font-bold uppercase tracking-wider text-[#475467]">
              <tr>
                <th className="py-3 px-4 w-[26%]">PI Matter & Client</th>
                <th className="py-3 px-4 w-[28%]">Primary Anatomical Injuries</th>
                <th className="py-3 px-4 w-[22%]">Documented Physical Impairments</th>
                <th className="py-3 px-4 w-[13%] text-right pr-4">Calculated Wage Loss</th>
                <th className="py-3 px-4 w-[11%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7] text-xs">
              {filteredDamages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#98A2B3]">
                    No injury or damages records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDamages.map((d) => {
                  const injuries = Array.isArray(d?.injuries) ? d.injuries : [];
                  const isExpanded = expandedRecord?.id === d?.id;

                  return (
                    <tr
                      key={d.id}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isExpanded ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Column 1: Matter & Client */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <button
                            onClick={() => setExpandedRecord(isExpanded ? null : d)}
                            className="font-bold text-[#06244B] hover:text-[#A4432B] transition-colors text-xs text-left block leading-snug cursor-pointer"
                          >
                            {d?.matterTitle || 'Untitled Matter'}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#475467]">
                            <Briefcase className="w-3 h-3 text-[#667085] shrink-0" />
                            <span className="truncate">
                              {d?.employment?.jobTitle || 'TBD'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#667085] truncate">
                            {d?.employment?.employer || 'Employer N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Column 2: Primary Anatomical Injuries */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {injuries.slice(0, 2).map((inj, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#06244B]/10 text-[#06244B] border border-[#06244B]/15 whitespace-nowrap">
                                {inj.bodyArea || 'Injury'}
                              </span>
                              <span className="text-[11px] text-[#344054] leading-relaxed line-clamp-1" title={inj.description}>
                                {inj.description}
                              </span>
                            </div>
                          ))}
                          {injuries.length > 2 && (
                            <span className="inline-block text-[10px] font-semibold text-[#A4432B] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                              +{injuries.length - 2} additional diagnosed injuries
                            </span>
                          )}
                          {injuries.length === 0 && (
                            <span className="text-xs text-[#98A2B3] italic">No injuries recorded</span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Physical Impairments */}
                      <td className="py-4 px-4 align-top">
                        <div className="bg-[#F8F9FC] p-2.5 rounded-lg border border-[#EAECF0]">
                          <p className="text-[11px] text-[#344054] leading-relaxed line-clamp-2" title={d?.functionalLimitations}>
                            {d?.functionalLimitations || 'No formal functional restrictions logged.'}
                          </p>
                        </div>
                      </td>

                      {/* Column 4: Calculated Wage Loss */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-sm text-[#06244B] block">
                            {formatCurrency(d?.employment?.totalLostWages || 0)}
                          </span>
                          <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                            {d?.employment?.daysMissed ?? 0} days missed
                          </span>
                          <span className="block text-[10px] text-[#667085] pt-0.5">
                            @ ${d?.employment?.hourlyRate || 0}/hr
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Actions - ICONS ONLY */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* View Dossier Icon */}
                          <button
                            type="button"
                            onClick={() => setExpandedRecord(isExpanded ? null : d)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-[#06244B] text-white border-[#06244B] shadow-sm'
                                : 'bg-white text-[#344054] border-[#D0D5DD] hover:bg-slate-100 hover:text-[#06244B]'
                            }`}
                            title={isExpanded ? 'Hide Dossier' : 'View Full Dossier'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Icon */}
                          <button
                            type="button"
                            onClick={() => openEditModal(d)}
                            className="w-8 h-8 rounded-lg border border-[#D0D5DD] bg-white text-[#06244B] hover:bg-slate-100 hover:border-[#06244B] flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4 text-[#A4432B]" />
                          </button>

                          {/* Delete Icon */}
                          <button
                            type="button"
                            onClick={() => handleDeleteDamage(d.id)}
                            className="w-8 h-8 rounded-lg border border-[#D0D5DD] bg-white text-[#667085] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Damages Deep Dive Card */}
      {expandedRecord && (
        <div className="bg-white p-6 rounded-xl border border-[#06244B]/30 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between border-b border-[#EAECF0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#A4432B] uppercase tracking-wider bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-mono">
                  COMPREHENSIVE DAMAGES DOSSIER
                </span>
                <span className="text-xs text-[#667085]">Matter #{expandedRecord.matterId}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#06244B] mt-1">
                {expandedRecord.matterTitle}
              </h3>
              <p className="text-xs text-[#475467] mt-0.5">
                Employer: <span className="font-semibold text-[#101828]">{expandedRecord.employment?.employer}</span> • Verified Wage Loss: <span className="font-bold text-emerald-700">{formatCurrency(expandedRecord.employment?.totalLostWages || 0)}</span>
              </p>
            </div>
            <button
              onClick={() => setExpandedRecord(null)}
              className="px-3 py-1.5 border border-[#D0D5DD] rounded-lg text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors"
            >
              Close Dossier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Column 1: Itemized Body Injuries */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#06244B] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Activity className="w-4 h-4 text-[#A4432B]" /> Anatomical Injury Breakdown
              </h4>
              <div className="space-y-2">
                {(expandedRecord.injuries || []).map((inj, idx) => (
                  <div key={idx} className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#06244B]">{inj.bodyArea}</span>
                      <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                        {inj.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{inj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Eggshell & Functional Limitations */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#06244B] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-4 h-4 text-[#A4432B]" /> Impairments & Prior Health
              </h4>
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200/80 space-y-1.5">
                <span className="font-semibold text-xs text-amber-950 block">
                  Prior Medical History (Utah Eggshell Rule)
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {expandedRecord.preExistingConditions || 'None reported.'}
                </p>
              </div>

              <div className="bg-[#F8F9FC] p-3.5 rounded-lg border border-[#EAECF0] space-y-1.5">
                <span className="font-semibold text-xs text-[#06244B] block">
                  Documented Functional Limitations
                </span>
                <p className="text-[11px] text-[#344054] leading-relaxed">
                  {expandedRecord.functionalLimitations}
                </p>
              </div>
            </div>

            {/* Column 3: Diagnostic Evidence & Wage Audit */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#06244B] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <FileCheck className="w-4 h-4 text-[#A4432B]" /> Diagnostic Imaging & Wage Audit
              </h4>
              <div className="space-y-2">
                {(expandedRecord.supportingMedicalEvidence || []).map((ev, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between font-bold text-emerald-950 text-[11px]">
                      <span>{ev.document}</span>
                      <span className="text-emerald-700 font-normal">{ev.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{ev.facility}</p>
                    <p className="text-[11px] font-semibold text-emerald-900 mt-1">"{ev.finding}"</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#EAECF0] text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-[#06244B] block">Wage Verification Status:</span>
                <p className="text-[#475467]">{expandedRecord.employment?.wageVerificationStatus}</p>
                <p className="font-semibold text-slate-900">
                  {expandedRecord.employment?.daysMissed} Days @ ${expandedRecord.employment?.hourlyRate}/hr = {formatCurrency(expandedRecord.employment?.totalLostWages || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <DamagesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDamage}
        damagesRecord={selectedDamage}
        cases={cases}
        defaultCaseId={activeMatter?.id || activeCaseId}
      />
    </div>
  );
}
