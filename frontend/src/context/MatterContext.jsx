import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_MATTERS } from '../data/mockMatters';
import { mockStorage } from '../services/mockStorage';

const MatterContext = createContext();

export function MatterProvider({ children }) {
  const [matters, setMatters] = useState(() => {
    return mockStorage.get('matters', MOCK_MATTERS);
  });

  useEffect(() => {
    mockStorage.set('matters', matters);
  }, [matters]);

  const addMatter = (matterData) => {
    const currentYear = new Date().getFullYear();
    const sequence = String(matters.length + 1).padStart(2, '0');
    const id = `MAT-${currentYear}-0${sequence}`;
    const matterNumber = `${String(currentYear).slice(-2)}-GEN-0${sequence}`;

    const newMatter = {
      id,
      matterNumber,
      status: 'Active',
      openDate: new Date().toISOString().split('T')[0],
      totalBilled: 0,
      unbilledHours: 0,
      budget: matterData.budget || 25000,
      assignedStaffIds: ['usr-4'],
      assignedStaffNames: ['Marcus Vance'],
      ...matterData,
    };

    setMatters(prev => [newMatter, ...prev]);
    return newMatter;
  };

  const updateMatter = (id, updatedFields) => {
    setMatters(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  };

  const getMatter = (id) => matters.find(m => m.id === id);

  const getMattersByClient = (clientId) => matters.filter(m => m.clientId === clientId);

  return (
    <MatterContext.Provider value={{
      matters,
      addMatter,
      updateMatter,
      getMatter,
      getMattersByClient,
    }}>
      {children}
    </MatterContext.Provider>
  );
}

export const useMatters = () => {
  const context = useContext(MatterContext);
  if (!context) throw new Error('useMatters must be used within MatterProvider');
  return context;
};

