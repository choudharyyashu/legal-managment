import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Car,
  UserCheck,
  Camera,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { IncidentModal } from '../components/IncidentModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { MOCK_PI_CASES, MOCK_INCIDENT_RECORDS } from '../../../data/mockPersonalInjury';
import { mockStorage } from '../../../services/mockStorage';
import { documentService } from '../../../services/documentService';
import { useToast } from '../../../components/ui/Toast';

export function IncidentLiability() {
  const { addToast } = useToast();
  const [cases] = useState(() => mockStorage.get('pi_cases', MOCK_PI_CASES));
  const [incidents, setIncidents] = useState(() => mockStorage.get('pi_incidents', MOCK_INCIDENT_RECORDS));
  const [activeCaseId, setActiveCaseId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailIncident, setViewDetailIncident] = useState(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      searchQuery === '' ||
      inc.matterTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incidentLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.accidentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.policeReportDetails?.reportNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCase = activeCaseId === 'ALL' || inc.matterId === activeCaseId;
    return matchesSearch && matchesCase;
  });

  const handleSaveIncident = (savedRecord) => {
    setIncidents((prev) => {
      const exists = prev.some((i) => i.id === savedRecord.id);
      let updated;
      if (exists) {
        updated = prev.map((i) => (i.id === savedRecord.id ? savedRecord : i));
        addToast('Incident record updated successfully.', 'success');
      } else {
        updated = [savedRecord, ...prev];
        addToast('New incident & liability investigation recorded.', 'success');
      }
      mockStorage.set('pi_incidents', updated);
      return updated;
    });

    // Event-Driven Auto Draft Trigger (Phase 4): Document 096 (Representation Letter)
    if (savedRecord.matterId) {
      documentService
        .triggerDocumentEvent('pi.accident.saved', savedRecord.matterId, {
          incidentDate: savedRecord.incidentDate,
          incidentTime: savedRecord.incidentTime,
          incidentLocation: savedRecord.incidentLocation,
          accidentType: savedRecord.accidentType,
          description: savedRecord.description,
          policeAgency: savedRecord.policeReportDetails?.agency,
          reportNumber: savedRecord.policeReportDetails?.reportNumber,
          investigatingOfficer: savedRecord.policeReportDetails?.investigatingOfficer,
          liabilityAssessment: savedRecord.liabilityAssessment,
        })
        .then((res) => {
          if (res?.draftsCreated?.length > 0) {
            addToast(`Auto-draft created: ${res.draftsCreated[0].title} (${res.draftsCreated[0].draftCode})`, 'info');
          }
        })
        .catch(() => {
          // Graceful non-blocking error handling
        });
    }
  };

  const openAddModal = () => {
    setSelectedIncident(null);
    setIsModalOpen(true);
  };

  const openEditModal = (inc) => {
    setSelectedIncident(inc);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'incidentDate',
      label: 'Accident Date & Time',
      sortable: true,
      render: (val, i) => (
        <div className="whitespace-nowrap">
          <span className="font-bold text-[#06244B] flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-[#A4432B] shrink-0" />
            {i?.incidentDate || val || 'Not Available'}
          </span>
          <span className="text-[11px] text-[#667085] flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 shrink-0" /> {i?.incidentTime || 'Time N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'matterTitle',
      label: 'Associated PI Matter',
      sortable: true,
      render: (val, i) => (
        <div className="max-w-[210px]">
          <span className="font-bold text-[#06244B] block leading-snug">{i?.matterTitle || val || 'Untitled Matter'}</span>
          <span className="text-[11px] text-[#667085] truncate block">{i?.accidentType || 'Not Specified'}</span>
        </div>
      ),
    },
    {
      key: 'incidentLocation',
      label: 'Location / Venue',
      render: (val, i) => (
        <span className="text-xs text-slate-700 flex items-start gap-1 max-w-[200px] leading-snug">
          <MapPin className="w-3.5 h-3.5 text-[#A4432B] shrink-0 mt-0.5" />
          <span className="line-clamp-2">{i?.incidentLocation || val || 'Location Not Available'}</span>
        </span>
      ),
    },
    {
      key: 'policeReportDetails',
      label: 'Police Report / Citations',
      render: (val, i) => {
        const details = i?.policeReportDetails || val || {};
        return (
          <div className="max-w-[160px]">
            <span className="text-xs font-semibold text-[#06244B] block truncate">
              {details.reportNumber || 'Not Available'}
            </span>
            <span className="text-[11px] text-slate-500 truncate block">
              {details.agency || 'No Agency Reported'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'comparativeFault',
      label: 'Comparative Fault %',
      render: (val, i) => {
        const fault = i?.comparativeFault || val || {};
        const plaintiffPct = fault.plaintiffPercentage ?? 0;
        const adversePct = fault.adversePercentage ?? 100;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
            {plaintiffPct}% Plt / {adversePct}% Adv
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, i) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            className="text-xs py-1"
            onClick={() => setViewDetailIncident(i)}
            title="View Complete Investigation File"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Edit}
            className="text-xs py-1 text-[#06244B]"
            onClick={() => openEditModal(i)}
            title="Edit Incident Data"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={setActiveCaseId}
        cases={cases}
        title="Incident &amp; Liability Investigation"
        subtitle="Forensic accident reconstruction telemetry, police crash reports, witness interviews, Utah comparative fault analysis, and evidence spoliation preservation."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Record Incident
          </Button>
        }
      />

      {/* Overview Filter & Search Bar */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Incident Investigations ({filteredIncidents.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Documented crash scenes, official citations, and liability fault allocations.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
            <input
              type="text"
              placeholder="Search location, crash, officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-full sm:w-72"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredIncidents}
          pageSize={10}
          emptyMessage="No incident records found."
        />
      </div>

      {/* Detailed Investigation Review Drawer / Card (when an incident is selected for viewing) */}
      {viewDetailIncident && (
        <div className="bg-white p-6 rounded-lg border-2 border-[#06244B] shadow-elevated space-y-5">
          <div className="flex items-start justify-between border-b border-[#D9D6CF] pb-4">
            <div>
              <span className="text-xs font-bold text-[#A4432B] uppercase tracking-wider">
                Full Investigation File
              </span>
              <h3 className="text-xl font-serif font-bold text-[#06244B]">
                {viewDetailIncident.matterTitle}
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                {viewDetailIncident.accidentType} • Date: {viewDetailIncident.incidentDate} at {viewDetailIncident.incidentTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditModal(viewDetailIncident)}
              >
                Edit File
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewDetailIncident(null)}
              >
                Close View
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Column: Description & Mechanism */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <h4 className="font-bold text-[#06244B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#A4432B]" /> Factual Chronology of Incident
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {viewDetailIncident.description}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <h4 className="font-bold text-[#06244B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#A4432B]" /> Biomechanical Mechanism of Injury
                </h4>
                <p className="leading-relaxed text-slate-800">
                  {viewDetailIncident.mechanismOfInjury}
                </p>
              </div>

              {/* Witness Information */}
              <div className="bg-[#F5F0E5]/60 p-3.5 rounded border border-[#D9D6CF]">
                <h4 className="font-bold text-[#06244B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#A4432B]" /> Key Witness Statements
                </h4>
                <div className="space-y-2">
                  {(viewDetailIncident.witnesses || []).map((w, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex justify-between font-bold text-[#06244B]">
                        <span>{w.name}</span>
                        <span className="text-[#667085] font-normal">{w.phone}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        "{w.statement}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Police Report, Comparative Fault, Scene Evidence */}
            <div className="space-y-4">
              {/* Police Report Card */}
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-[#06244B] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#A4432B]" /> Police Report &amp; Citations
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Agency:</span>
                    <span className="font-semibold text-slate-800">{viewDetailIncident.policeReportDetails?.agency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Report Number:</span>
                    <span className="font-semibold text-slate-800">{viewDetailIncident.policeReportDetails?.reportNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Investigating Officer:</span>
                    <span className="font-semibold text-slate-800">{viewDetailIncident.policeReportDetails?.investigatingOfficer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Citation Issued:</span>
                    <span className="font-semibold text-[#B42318]">{viewDetailIncident.policeReportDetails?.citationIssued || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Utah Comparative Fault Legal Analysis */}
              <div className="bg-emerald-50 p-3.5 rounded border border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider">
                    Utah Comparative Fault Analysis (§ 78B-5-818)
                  </h4>
                  <span className="font-bold text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    {viewDetailIncident.comparativeFault?.plaintiffPercentage}% Plaintiff / {viewDetailIncident.comparativeFault?.adversePercentage}% Adverse
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {viewDetailIncident.comparativeFault?.legalAnalysis}
                </p>
              </div>

              {/* Preserved Scene Evidence & Photos */}
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <h4 className="font-bold text-[#06244B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#A4432B]" /> Preserved Scene Evidence &amp; Photos
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  {(viewDetailIncident.sceneEvidence || []).map((ev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                      <span className="font-medium text-slate-800">{ev.name}</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation Notes */}
              {viewDetailIncident.investigationNotes && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold block mb-0.5">Attorney Spoliation &amp; Discovery Notes:</span>
                  {viewDetailIncident.investigationNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveIncident}
        incident={selectedIncident}
        cases={cases}
      />
    </div>
  );
}

