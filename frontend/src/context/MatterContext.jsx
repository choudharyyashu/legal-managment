import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { matterService } from '../services/matterService';
import { useAuth } from '../hooks/useAuth';
import { MOCK_MATTERS } from '../data/mockMatters';

const MatterContext = createContext();

const ACTIVE_MATTER_STORAGE_KEY = 'hb_active_matter_id';

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
  isEthicalWallEnabled: Boolean(m.isEthicalWallEnabled),
  ethicalWallExcludedRole: m.ethicalWallExcludedRole || null,
});

export function MatterProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [matters, setMatters] = useState(() => MOCK_MATTERS.map(normalizeMatter));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active persistent matter context state
  const [activeMatterId, setActiveMatterId] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlMatterId = urlParams.get('matterId');
        if (urlMatterId) return urlMatterId;
        return sessionStorage.getItem(ACTIVE_MATTER_STORAGE_KEY) || null;
      }
    } catch {
      // Fallback
    }
    return null;
  });

  // Verify whether the currently authenticated user is locked out by Utah RPC 1.10 Ethical Wall
  const isEthicalWallRestricted = useCallback((matter) => {
    if (!matter || !currentUser) return false;
    if (matter.isEthicalWallEnabled && matter.ethicalWallExcludedRole && currentUser.role === matter.ethicalWallExcludedRole) {
      return true;
    }
    return false;
  }, [currentUser]);

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
    if (!isAuthenticated) {
      setMatters([]);
      setActiveMatterId(null);
      try {
        sessionStorage.removeItem(ACTIVE_MATTER_STORAGE_KEY);
      } catch {}
    }
  }, [isAuthenticated]);

  // Resolve active matter object from list
  const activeMatter = useMemo(() => {
    if (!activeMatterId || matters.length === 0) return null;
    const match = matters.find((m) => m.id === activeMatterId || m.matterNumber === activeMatterId);
    if (!match) return null;
    if (isEthicalWallRestricted(match)) return null;
    return match;
  }, [activeMatterId, matters, isEthicalWallRestricted]);

  // Validate activeMatterId persistence against loaded matters list
  useEffect(() => {
    if (activeMatterId && matters.length > 0) {
      const match = matters.find((m) => m.id === activeMatterId || m.matterNumber === activeMatterId);
      if (!match || isEthicalWallRestricted(match)) {
        // Clear invalid or ethically walled matter from session
        setActiveMatterId(null);
        try {
          sessionStorage.removeItem(ACTIVE_MATTER_STORAGE_KEY);
        } catch {}
      }
    }
  }, [activeMatterId, matters, isEthicalWallRestricted]);

  // Explicitly select an active matter
  const setActiveMatter = useCallback((matterOrId) => {
    if (!matterOrId) {
      setActiveMatterId(null);
      try {
        sessionStorage.removeItem(ACTIVE_MATTER_STORAGE_KEY);
      } catch {}
      return;
    }

    const id = typeof matterOrId === 'object' ? (matterOrId.id || matterOrId.matterNumber) : matterOrId;
    const candidate = matters.find((m) => m.id === id || m.matterNumber === id) || (typeof matterOrId === 'object' ? matterOrId : null);

    if (candidate && isEthicalWallRestricted(candidate)) {
      console.warn(`[Ethical Wall Alert - Utah RPC 1.10] Access to matter ${id} is restricted for role: ${currentUser?.role}`);
      return false;
    }

    setActiveMatterId(id);
    try {
      sessionStorage.setItem(ACTIVE_MATTER_STORAGE_KEY, id);
    } catch {}
    return true;
  }, [matters, isEthicalWallRestricted, currentUser?.role]);

  // Clear active context back to firm-wide All-Matters Mode
  const clearActiveMatter = useCallback(() => {
    setActiveMatterId(null);
    try {
      sessionStorage.removeItem(ACTIVE_MATTER_STORAGE_KEY);
    } catch {}
  }, []);

  // Derive client metadata associated with the active matter
  const activeClient = useMemo(() => {
    if (!activeMatter) return null;
    return {
      id: activeMatter.clientId,
      name: activeMatter.clientName,
    };
  }, [activeMatter]);

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
        activeMatter,
        activeMatterId,
        activeClient,
        setActiveMatter,
        clearActiveMatter,
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
