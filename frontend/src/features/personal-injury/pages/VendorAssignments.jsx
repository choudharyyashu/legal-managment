import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { PINavigationHeader } from '../components/PINavigationHeader';
import { VendorAssignmentModal } from '../components/VendorAssignmentModal';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { matchesPracticeArea } from '../../../data/practiceAreas';
import { piService } from '../../../services/piService';

export function VendorAssignments() {
  const { addToast } = useToast();
  const { matters, activeMatter, setActiveMatter } = useMatters();
  const cases = React.useMemo(() => {
    return (matters || []).filter(
      (m) =>
        matchesPracticeArea(m.practiceAreaId, 'pa-pi') ||
        m.practiceArea?.code === 'PI' ||
        m.practiceAreaName?.toLowerCase().includes('personal injury') ||
        m.matterNumber?.toUpperCase().includes('-PI-')
    );
  }, [matters]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(() => activeMatter?.id || (cases[0]?.id || 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      piService.getVendorAssignments(activeCaseId)
        .then((res) => {
          if (isMounted) {
            const list = Array.isArray(res) ? res : (res?.data || []);
            setAssignments(list.map((a) => ({
              ...a,
              vendorName: a.vendor?.vendorName || a.vendorName || 'Outside Vendor',
              vendorType: a.vendor?.category || a.vendorType || 'Expert Witness',
              assignedMatter: a.serviceScope || 'PI Case Assignment',
              status: a.status || 'ASSIGNED',
              feeBudget: Number(a.authorizedAmount || 0),
            })));
          }
        })
        .catch((err) => {
          console.warn('Could not load vendor assignments from API:', err?.message);
          if (isMounted) setAssignments([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setAssignments([]);
    }
    return () => { isMounted = false; };
  }, [activeCaseId]);

  const handleCaseChange = (newCaseId) => {
    setActiveCaseId(newCaseId);
    if (newCaseId && newCaseId !== 'ALL') {
      setActiveMatter(newCaseId);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (!a) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      a.vendorName?.toLowerCase().includes(q) ||
      a.assignedMatter?.toLowerCase().includes(q) ||
      a.vendorType?.toLowerCase().includes(q);
    const matchesType = typeFilter === 'ALL' || a.vendorType === typeFilter;
    const matchesCase = activeCaseId === 'ALL' || a.matterId === activeCaseId;
    return matchesSearch && matchesType && matchesCase;
  });

  const handleSaveAssignment = async (savedRecord) => {
    try {
      if (activeCaseId && activeCaseId !== 'ALL') {
        const payload = {
          vendorId: savedRecord.vendorId || savedRecord.id,
          serviceScope: savedRecord.assignedMatter || savedRecord.serviceScope || 'Case Assignment',
          authorizedAmount: savedRecord.feeBudget || 0,
        };
        const created = await piService.createVendorAssignment(activeCaseId, payload);
        savedRecord = created ? { ...savedRecord, id: created.id } : savedRecord;
        addToast('New outside vendor assignment dispatched and saved to database.', 'success');
      }
      setAssignments((prev) => {
        const exists = prev.some((a) => a.id === savedRecord.id);
        if (exists) {
          return prev.map((a) => (a.id === savedRecord.id ? savedRecord : a));
        }
        return [savedRecord, ...prev];
      });
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Error dispatching vendor', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (a) => {
    setSelectedAssignment(a);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'vendorName',
      label: 'Vendor / Expert Entity',
      sortable: true,
      render: (val, a) => (
        <div>
          <span className="font-bold text-[#06244B] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#A4432B]" />
            {a?.vendorName || val || 'Not Available'}
          </span>
          <span className="text-[11px] text-[#667085] block">{a?.assignedMatter || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'vendorType',
      label: 'Vendor Discipline',
      sortable: true,
      render: (val, a) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#F5F0E5] text-[#06244B]">
          {a?.vendorType || val || 'General Vendor'}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Assignment & Due Date',
      render: (val, a) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" /> Due: {a?.dueDate || val || 'TBD'}
          </span>
          <span className="text-[11px] text-slate-500 block">Assigned: {a?.assignmentDate || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'assignedBy',
      label: 'Staff Lead',
      render: (val, a) => <span className="text-xs text-slate-700">{a?.assignedBy || val || 'Unassigned'}</span>,
    },
    {
      key: 'assignmentStatus',
      label: 'Execution Status',
      render: (val, a) => <StatusBadge status={a?.assignmentStatus || val || 'Pending'} />,
    },
    {
      key: 'deliverableStatus',
      label: 'Deliverable Verification',
      render: (val, a) => {
        const deliv = a?.deliverableStatus || val || 'Pending Review';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
              deliv.includes('Approved') || deliv.includes('Received')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {deliv}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, a) => (
        <Button
          size="sm"
          variant="outline"
          className="text-xs py-1 text-[#06244B]"
          onClick={() => openEditModal(a)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PINavigationHeader
        activeCaseId={activeCaseId}
        onCaseChange={handleCaseChange}
        cases={cases}
        title="Outside Vendor & Expert Assignments"
        subtitle="Manage secure work product delegations to medical records retrieval agencies, professional chronologies, medical bill auditors, and accident reconstruction experts."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={openAddModal}
          >
            Dispatch Vendor Task
          </Button>
        }
      />

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9D6CF]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#06244B]">
              Active Vendor Assignments ({filteredAssignments.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Dispatched third-party work products with strict deadline and deliverable tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#667085]" />
              <input
                type="text"
                placeholder="Search vendor, case, expert..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B] w-48 sm:w-60"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded border border-[#D9D6CF] bg-white text-slate-700"
            >
              <option value="ALL">All 5 Disciplines</option>
              <option value="Medical Record Retrieval">Record Retrieval</option>
              <option value="Medical Chronology">Medical Chronology</option>
              <option value="Medical Bill Review">Bill Review</option>
              <option value="Investigation Services">Investigation</option>
              <option value="Expert Services">Expert Services</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredAssignments}
          pageSize={10}
          emptyMessage="No vendor assignments found."
        />
      </div>

      {/* Add / Edit Modal */}
      <VendorAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAssignment}
        assignment={selectedAssignment}
        cases={cases}
        defaultCaseId={activeMatter?.id || activeCaseId}
      />
    </div>
  );
}

