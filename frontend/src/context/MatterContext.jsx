import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { matterService } from '../services/matterService';
import { useAuth } from '../hooks/useAuth';

const MatterContext = createContext();

export function MatterProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeMatter = (m) => ({
    ...m,
    id: m.id,
    matterNumber: m.matterNumber || m.id,
    title: m.title,
    clientName: m.client?.name || m.clientName || 'Client',
    clientId: m.clientId,
    practiceAreaId: m.practiceAreaId,
    practiceAreaName: m.practiceArea?.name || m.practiceAreaName || 'Practice Area',
    responsibleAttorneyName: m.responsibleAttorney?.name || m.responsibleAttorneyName || 'Lead Counsel',
    assignedStaffNames: m.staffAssignments?.map((s) => s.user?.name).filter(Boolean) || m.assignedStaffNames || [],
    assignedStaffIds: m.staffAssignments?.map((s) => s.userId).filter(Boolean) || m.assignedStaffIds || [],
    status: m.status || 'Active',
    billingType: m.billingType || 'Hourly',
    hourlyRate: m.hourlyRate ? Number(m.hourlyRate) : 0,
    flatFeeAmount: m.flatFeeAmount ? Number(m.flatFeeAmount) : 0,
    budget: m.budget ? Number(m.budget) : 0,
    totalBilled: m.totalBilled ? Number(m.totalBilled) : 0,
    unbilledHours: m.unbilledHours ? Number(m.unbilledHours) : 0,
    openDate: m.openDate ? new Date(m.openDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const refreshMatters = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await matterService.getMatters({ limit: 100, ...params });
      const rawMatters = Array.isArray(data?.matters) ? data.matters : [];
      setMatters(rawMatters.map(normalizeMatter));
    } catch (err) {
      console.warn('Failed to load matters from API:', err?.message);
      setError(err?.message || 'Failed to load matters');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshMatters();
    } else {
      setMatters([]);
    }
  }, [isAuthenticated, refreshMatters]);

  const addMatter = async (matterData) => {
    try {
      const payload = {
        title: matterData.title,
        clientId: matterData.clientId,
        practiceAreaId: matterData.practiceAreaId,
        responsibleAttorneyId: matterData.responsibleAttorneyId,
        assignedStaffId: matterData.assignedStaffId || null,
        status: matterData.status || 'Active',
        billingType: matterData.billingType || 'Hourly',
        hourlyRate: matterData.billingType === 'Hourly' ? Number(matterData.hourlyRate || 350) : null,
        flatFeeAmount: matterData.billingType === 'Flat Fee' ? Number(matterData.flatFeeAmount || 25000) : null,
        contingencyPercentage: matterData.billingType === 'Contingency' ? Number(matterData.contingencyPercentage || 33.3) : null,
        budget: Number(matterData.budget) || 0,
        courtName: matterData.courtName || null,
        judge: matterData.judge || null,
        nextCourtDate: matterData.nextCourtDate || null,
        statuteOfLimitations: matterData.statuteOfLimitations || null,
        description: matterData.description || null,
        isEthicalWallEnabled: Boolean(matterData.isEthicalWallEnabled),
        ethicalWallExcludedRole: matterData.ethicalWallExcludedRole || null,
      };

      const created = await matterService.createMatter(payload);
      const normalized = normalizeMatter(created);
      setMatters((prev) => [normalized, ...prev.filter((m) => m.id !== normalized.id)]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateMatter = async (id, updatedFields) => {
    try {
      const updated = await matterService.updateMatter(id, updatedFields);
      const normalized = normalizeMatter(updated);
      setMatters((prev) => prev.map((m) => (m.id === id || m.matterNumber === id ? normalized : m)));
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateMatterStatus = async (id, status, currentStageId = null) => {
    try {
      const updated = await matterService.updateMatterStatus(id, status, currentStageId);
      const normalized = normalizeMatter(updated);
      setMatters((prev) => prev.map((m) => (m.id === id || m.matterNumber === id ? normalized : m)));
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const getMatter = (id) =>
    matters.find((m) => m.id === id || m.matterNumber === id);

  const getMattersByClient = (clientId) =>
    matters.filter((m) => m.clientId === clientId);

  return (
    <MatterContext.Provider
      value={{
        matters,
        loading,
        error,
        refreshMatters,
        addMatter,
        updateMatter,
        updateMatterStatus,
        getMatter,
        getMattersByClient,
      }}
    >
      {children}
    </MatterContext.Provider>
  );
}

export const useMatters = () => {
  const context = useContext(MatterContext);
  if (!context) throw new Error('useMatters must be used within MatterProvider');
  return context;
};
