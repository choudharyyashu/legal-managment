import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/clientService';
import { intakeService } from '../services/intakeService';
import { useAuth } from '../hooks/useAuth';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [clients, setClients] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Normalizes a backend client object to ensure compatibility with all UI components
  const normalizeClient = (c) => ({
    ...c,
    id: c.id,
    clientNumber: c.clientNumber || c.id,
    type: c.clientType || c.type || 'Organization',
    assignedAttorneyName: c.assignedAttorney?.name || c.assignedAttorneyName || 'Unassigned',
    totalMatters: c._count?.matters !== undefined ? c._count.matters : (c.totalMatters || 0),
    outstandingBalance: c.outstandingBalance || 0,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Normalizes an intake object
  const normalizeIntake = (i) => ({
    ...i,
    id: i.id,
    intakeNumber: i.intakeNumber || i.id,
    practiceAreaName: i.practiceArea?.name || i.practiceAreaName || 'General',
    conflictStatus: i.conflictStatus || 'In Review',
    createdAt: i.createdAt ? new Date(i.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const refreshClients = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients({ limit: 100, ...params });
      const rawClients = Array.isArray(data?.clients) ? data.clients : [];
      setClients(rawClients.map(normalizeClient));
    } catch (err) {
      console.warn('Failed to load clients from API:', err?.message);
      setError(err?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshIntakes = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    try {
      const data = await intakeService.getIntakes({ limit: 100, ...params });
      const rawIntakes = Array.isArray(data?.intakes)
        ? data.intakes
        : Array.isArray(data)
        ? data
        : [];
      setIntakes(rawIntakes.map(normalizeIntake));
    } catch (err) {
      console.warn('Failed to load intakes from API:', err?.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshClients();
      refreshIntakes();
    } else {
      setClients([]);
      setIntakes([]);
    }
  }, [isAuthenticated, refreshClients, refreshIntakes]);

  const addClient = async (newClientData) => {
    try {
      const payload = {
        name: newClientData.name,
        clientType: newClientData.type || newClientData.clientType || 'Organization',
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address || null,
        primaryContact: newClientData.primaryContact || null,
        assignedAttorneyId: newClientData.assignedAttorneyId || null,
        status: newClientData.status || 'Active',
        notes: newClientData.notes || null,
      };

      const created = await clientService.createClient(payload);
      const normalized = normalizeClient(created);
      setClients((prev) => [normalized, ...prev.filter((c) => c.id !== normalized.id)]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateClient = async (id, updatedFields) => {
    try {
      const updated = await clientService.updateClient(id, updatedFields);
      const normalized = normalizeClient(updated);
      setClients((prev) => prev.map((c) => (c.id === id || c.clientNumber === id ? normalized : c)));
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const getClient = (id) =>
    clients.find((c) => c.id === id || c.clientNumber === id);

  const addIntake = async (intakeData) => {
    try {
      const created = await intakeService.createIntake(intakeData);
      const normalized = normalizeIntake(created);
      setIntakes((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const updateConflictCheck = async (id, status, reviewerName) => {
    try {
      await intakeService.clearConflict(id, { waiverNotes: `Conflict reviewed by ${reviewerName || 'Counsel'}` });
      await refreshIntakes();
    } catch (err) {
      console.warn('Failed to clear conflict on API:', err?.message);
      // Optimistic UI fallback
      setIntakes((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                conflictStatus: status,
                reviewedBy: reviewerName,
                reviewedAt: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        error,
        refreshClients,
        addClient,
        updateClient,
        getClient,
        intakes,
        refreshIntakes,
        addIntake,
        updateConflictCheck,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClients = () => {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClients must be used within ClientProvider');
  return context;
};
